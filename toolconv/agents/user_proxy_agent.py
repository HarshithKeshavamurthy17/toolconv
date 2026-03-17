"""
agents/user_proxy_agent.py — simulates the human side of a conversation.

Responsibility
--------------
Given a ConversationPlan, generate every user-role message in the
conversation:

  turn 0  : opening message  — realistic but intentionally vague when the
                                pattern is "clarify_first"
  turn N  : clarification response — provides the missing parameter value
             that the assistant asked about at turn N-1

All generated messages are plain strings suitable for inserting directly
into a messages list as {"role": "user", "content": "..."}.

Design notes
------------
• The agent calls the LLM once per user turn.
• Offline fallback templates are deterministic (hashed from plan context)
  so the pipeline never stalls without an API key.
• Vagueness is enforced structurally: for clarify_first, the opening
  prompt explicitly instructs the LLM to *omit* the target_param value.
"""

from __future__ import annotations

import hashlib
import logging
import random
from dataclasses import dataclass, field
from typing import Any

from toolconv.agents.planner_agent import ClarificationStep, ConversationPlan
from toolconv.utils.llm import call_llm

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Output types
# ---------------------------------------------------------------------------

@dataclass
class UserTurn:
    """One user message in the conversation."""
    turn: int
    content: str
    is_opening: bool = True
    is_clarification_response: bool = False
    clarification_step: ClarificationStep | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_message(self) -> dict[str, str]:
        return {"role": "user", "content": self.content}


# ---------------------------------------------------------------------------
# Prompt builders
# ---------------------------------------------------------------------------

_SYSTEM = (
    "You are simulating a human user interacting with an AI assistant. "
    "Write natural, conversational messages — not formal or robotic. "
    "Output ONLY the user's message text, nothing else."
)

# Vagueness instruction snippets keyed by pattern type
_VAGUENESS_INSTRUCTIONS: dict[str, str] = {
    "clarify_first": (
        "IMPORTANT: Do NOT specify the following information — leave it vague "
        "so the assistant has to ask for it: {omit_params}. "
        "The message should still sound natural and purposeful."
    ),
    "sequential": "",
    "parallel": "",
}

# Domain-flavoured opening templates (offline fallback)
_OPENING_TEMPLATES: dict[str, list[str]] = {
    "travel":   [
        "I'm planning a trip and need some help sorting out the details.",
        "Can you help me plan my upcoming travel?",
        "I want to organise a trip — where do I start?",
    ],
    "finance":  [
        "I need some help with a financial transaction.",
        "Can you help me with some money-related tasks?",
        "I'd like to check on some financial information.",
    ],
    "weather":  [
        "I need to check the weather conditions for something.",
        "Can you look up some weather information for me?",
    ],
    "general":  [
        "I need some help with a few things.",
        "Can you assist me with a task?",
        "I have a request — could you help me out?",
    ],
}

# Clarification response templates (offline fallback)
_CLARIFY_TEMPLATES: list[str] = [
    "Oh, I meant {value}.",
    "Sure — it's {value}.",
    "Yes, {value} please.",
    "The {param} is {value}.",
    "I was thinking {value}.",
]

# Fake values for common parameter names (offline fallback)
_PARAM_VALUES: dict[str, list[str]] = {
    "city":        ["London", "Paris", "New York", "Tokyo", "Sydney"],
    "date":        ["next Friday", "March 20th", "the 15th", "next week"],
    "destination": ["Rome", "Barcelona", "Berlin", "Amsterdam"],
    "departure":   ["Los Angeles", "Chicago", "Miami", "Seattle"],
    "currency":    ["USD", "EUR", "GBP"],
    "amount":      ["500", "1000", "250"],
    "name":        ["Alice Johnson", "Bob Smith", "Carol White"],
    "email":       ["alice@example.com", "bob@example.com"],
    "query":       ["best price", "available options", "top-rated"],
    "details":     ["the standard package", "economy class", "the basic plan"],
}

_DEFAULT_VALUES = ["the usual option", "what I mentioned earlier", "the standard choice"]


def _fake_value(param: str, rng: random.Random) -> str:
    """Return a plausible fake value for a parameter name."""
    for key, vals in _PARAM_VALUES.items():
        if key in param.lower():
            return rng.choice(vals)
    return rng.choice(_DEFAULT_VALUES)


def _hash_choice(text: str, options: list[str]) -> str:
    idx = int(hashlib.md5(text.encode()).hexdigest(), 16) % len(options)
    return options[idx]


# ---------------------------------------------------------------------------
# UserProxyAgent
# ---------------------------------------------------------------------------

class UserProxyAgent:
    """
    Generates all user-role messages for a synthetic conversation.

    Parameters
    ----------
    seed : RNG seed for offline fallback determinism.
    """

    def __init__(self, seed: int | None = None) -> None:
        self._rng = random.Random(seed)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def generate_opening(self, plan: ConversationPlan) -> UserTurn:
        """
        Generate the user's first message.

        For clarify_first plans the message deliberately omits the parameters
        flagged as ambiguous so the assistant must ask for clarification.
        """
        prompt = self._opening_prompt(plan)
        content = call_llm(prompt, system=_SYSTEM, max_tokens=150)

        # Offline fallback: if LLM returned the generic stub, replace with
        # a domain-appropriate template
        if len(content) < 15 or content.startswith("I'd like to find"):
            templates = _OPENING_TEMPLATES.get(plan.domain, _OPENING_TEMPLATES["general"])
            content = _hash_choice(plan.user_goal + plan.domain, templates)

        logger.debug("UserProxyAgent opening [%s]: %r", plan.pattern_type, content[:60])
        return UserTurn(
            turn=0,
            content=content,
            is_opening=True,
            metadata={"plan_domain": plan.domain, "pattern_type": plan.pattern_type},
        )

    def generate_clarification_response(
        self,
        plan: ConversationPlan,
        clarification_step: ClarificationStep,
    ) -> UserTurn:
        """
        Generate the user's reply to a clarification question.

        The reply provides the specific value that was left ambiguous.
        """
        prompt = self._clarify_prompt(plan, clarification_step)
        content = call_llm(prompt, system=_SYSTEM, max_tokens=80)

        # Offline fallback
        if len(content) < 5 or content.startswith("I'd like"):
            value = _fake_value(clarification_step.target_param, self._rng)
            template = _hash_choice(
                clarification_step.question + clarification_step.target_param,
                _CLARIFY_TEMPLATES,
            )
            content = template.format(
                value=value,
                param=clarification_step.target_param,
            )

        logger.debug(
            "UserProxyAgent clarify response turn=%d: %r",
            clarification_step.turn, content[:60],
        )
        return UserTurn(
            turn=clarification_step.turn,
            content=content,
            is_opening=False,
            is_clarification_response=True,
            clarification_step=clarification_step,
            metadata={"target_param": clarification_step.target_param},
        )

    def generate_all(self, plan: ConversationPlan) -> list[UserTurn]:
        """
        Generate every user turn needed for this plan in turn order.

        Returns
        -------
        List of UserTurn objects:
          [opening, clarification_response_0, clarification_response_1, ...]
        """
        turns: list[UserTurn] = [self.generate_opening(plan)]
        for cs in sorted(plan.clarification_steps, key=lambda s: s.turn):
            turns.append(self.generate_clarification_response(plan, cs))
        return turns

    # ------------------------------------------------------------------
    # Prompt builders
    # ------------------------------------------------------------------

    def _opening_prompt(self, plan: ConversationPlan) -> str:
        vagueness = ""
        if plan.pattern_type == "clarify_first" and plan.clarification_steps:
            omit = ", ".join(
                f'"{cs.target_param}"' for cs in plan.clarification_steps
            )
            vagueness = _VAGUENESS_INSTRUCTIONS["clarify_first"].format(
                omit_params=omit
            )
        ambiguity_note = ""
        if plan.ambiguities:
            ambiguity_note = (
                "The user should be vague about: "
                + ", ".join(plan.ambiguities)
                + "."
            )
        return (
            f"Domain: {plan.domain}\n"
            f"User goal: {plan.user_goal}\n"
            f"{ambiguity_note}\n"
            f"{vagueness}\n"
            "Write the user's opening message (1-3 sentences, natural tone):"
        )

    def _clarify_prompt(
        self,
        plan: ConversationPlan,
        cs: ClarificationStep,
    ) -> str:
        return (
            f"Domain: {plan.domain}\n"
            f"User goal: {plan.user_goal}\n"
            f"The assistant just asked: \"{cs.question}\"\n"
            f"The user needs to provide their {cs.target_param}.\n"
            "Write a short, natural user reply that answers the question (1 sentence):"
        )
