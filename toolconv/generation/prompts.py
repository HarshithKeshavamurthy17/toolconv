"""
generation/prompts.py — centralised LLM prompt templates.

All prompt construction is done here so that prompts can be reviewed,
versioned, and tested independently of the agents that call them.

Functions
---------
  planner_prompt(sampler_result, pattern_type, domain, corpus_snippets)
      → system prompt + user prompt for PlannerAgent

  clarification_prompt(tool_name, target_param, domain)
      → prompt for AssistantAgent to generate a clarification question

  pre_call_prompt(tool_name, tool_description, domain, memory_context)
      → prompt for AssistantAgent to generate a pre-call message

  final_summary_prompt(domain, user_goal, tool_summary, n_results)
      → prompt for AssistantAgent to generate a final summary

  opening_user_prompt(domain, user_goal, pattern_type, vague)
      → prompt for UserProxyAgent to generate an opening message

  clarification_response_prompt(question, domain)
      → prompt for UserProxyAgent to generate a clarification response
"""

from __future__ import annotations

from typing import Any


# ---------------------------------------------------------------------------
# System prompts
# ---------------------------------------------------------------------------

ASSISTANT_SYSTEM = (
    "You are a helpful AI assistant that uses tools to complete user requests. "
    "Be concise and natural. When calling a tool, briefly explain what you are doing. "
    "Output ONLY the assistant's message text — no JSON, no markdown headers."
)

PLANNER_SYSTEM = (
    "You are a conversation planner for an AI assistant that calls tools. "
    "You design realistic, coherent multi-turn conversations. "
    "Return valid JSON only — no markdown fences, no extra commentary."
)

USER_PROXY_SYSTEM = (
    "You are simulating a user interacting with an AI assistant. "
    "Write natural, realistic user messages. "
    "Output ONLY the user's message text — no JSON, no markdown headers."
)


# ---------------------------------------------------------------------------
# Planner prompt
# ---------------------------------------------------------------------------

def planner_prompt(
    tool_names: list[str],
    tool_descriptions: dict[str, str],
    pattern_type: str,
    domain: str,
    corpus_snippets: list[str] | None = None,
) -> tuple[str, str]:
    """
    Build (system_prompt, user_prompt) for PlannerAgent.

    Parameters
    ----------
    tool_names        : Ordered list of tool names in the planned chain.
    tool_descriptions : Mapping of tool_name → short description.
    pattern_type      : One of "sequential", "parallel", "clarify_first".
    domain            : Domain tag (e.g. "travel", "finance").
    corpus_snippets   : Up to 5 recent corpus-memory summaries (may be None).

    Returns
    -------
    (system_prompt, user_prompt)
    """
    tools_block = "\n".join(
        f"  - {name}: {tool_descriptions.get(name, 'no description')}"
        for name in tool_names
    )

    corpus_block = ""
    if corpus_snippets:
        lines = "\n".join(f"  • {s}" for s in corpus_snippets[:5])
        corpus_block = (
            f"\nAlready-generated conversations (avoid repeating these patterns):\n"
            f"{lines}\n"
        )

    pattern_instructions = _pattern_instructions(pattern_type, tool_names)

    user_prompt = f"""Design a realistic {domain} conversation where an AI assistant uses the following tools IN ORDER:

{tools_block}
{corpus_block}
Conversation pattern: {pattern_type}
{pattern_instructions}

Return a JSON object with exactly these keys:
{{
  "user_goal": "<one-sentence description of what the user wants>",
  "tool_steps": {tool_names!r},
  "clarification_steps": [
    {{"turn": <int>, "tool_name": "<str>", "target_param": "<str>", "question": "<str>"}}
  ],
  "pattern_type": "{pattern_type}",
  "domain": "{domain}"
}}

Rules:
- tool_steps must be exactly {tool_names!r} (same order, no additions).
- For "clarify_first": clarification_steps MUST contain at least one entry at turn 1.
- For "sequential" and "parallel": clarification_steps may be empty [].
- user_goal must be specific and realistic for the {domain} domain.
- question in clarification_steps must be a natural one-sentence question.
"""
    return PLANNER_SYSTEM, user_prompt


def _pattern_instructions(pattern_type: str, tool_names: list[str]) -> str:
    if pattern_type == "sequential":
        return (
            "The assistant calls each tool in sequence, using the output of one "
            "tool as input to the next where possible."
        )
    if pattern_type == "parallel":
        return (
            "The assistant gathers information from multiple tools to answer a "
            "single user question. Results may be combined in a final summary."
        )
    if pattern_type == "clarify_first":
        first_tool = tool_names[0] if tool_names else "the first tool"
        return (
            f"Before calling any tool, the assistant MUST ask the user a "
            f"clarification question to obtain a required parameter for "
            f"'{first_tool}'. The clarification turn happens at turn 1."
        )
    return ""


# ---------------------------------------------------------------------------
# Assistant agent prompts
# ---------------------------------------------------------------------------

def clarification_prompt(
    tool_name: str,
    target_param: str,
    domain: str,
) -> str:
    """Prompt to generate a clarification question before a tool call."""
    return (
        f"Domain: {domain}\n"
        f"You are about to call the tool '{tool_name}' but need "
        f"the user's '{target_param}'.\n"
        "Ask the user for this information in one natural sentence:"
    )


def pre_call_prompt(
    tool_name: str,
    tool_description: str,
    domain: str,
    memory_context: str = "",
) -> str:
    """Prompt to generate a one-sentence pre-tool-call message."""
    ctx = f"\n{memory_context}" if memory_context else ""
    return (
        f"Domain: {domain}\n"
        f"You are calling the tool '{tool_name}': {tool_description}.{ctx}\n"
        "Write a one-sentence assistant message telling the user what you're doing:"
    )


def final_summary_prompt(
    domain: str,
    user_goal: str,
    tool_summary: str,
    n_results: int,
) -> str:
    """Prompt to generate a final summary after all tool calls."""
    return (
        f"Domain: {domain}\n"
        f"User goal: {user_goal}\n"
        f"Tools used: {tool_summary}\n"
        f"Number of results: {n_results}\n"
        "Write a brief, helpful final response summarising what was accomplished "
        "(2-3 sentences, natural tone):"
    )


# ---------------------------------------------------------------------------
# User proxy prompts
# ---------------------------------------------------------------------------

def opening_user_prompt(
    domain: str,
    user_goal: str,
    pattern_type: str,
    vague: bool = False,
) -> str:
    """
    Prompt to generate an opening user message.

    Parameters
    ----------
    domain       : Domain tag.
    user_goal    : The user's intended goal (from ConversationPlan).
    pattern_type : Conversation pattern.
    vague        : If True (clarify_first), the message should be intentionally
                   vague to motivate the clarification question.
    """
    vagueness_instruction = (
        "The message should be intentionally vague or incomplete — "
        "leave out a key detail so the assistant needs to ask a follow-up question. "
    ) if vague else (
        "The message should be clear and specific. "
    )
    return (
        f"Domain: {domain}\n"
        f"The user wants to: {user_goal}\n"
        f"{vagueness_instruction}"
        "Write a single, natural opening user message (1-2 sentences):"
    )


def clarification_response_prompt(
    question: str,
    domain: str,
) -> str:
    """Prompt to generate a user response to a clarification question."""
    return (
        f"Domain: {domain}\n"
        f"The assistant just asked: \"{question}\"\n"
        "Write a short, natural user response that directly answers the question "
        "(1 sentence):"
    )
