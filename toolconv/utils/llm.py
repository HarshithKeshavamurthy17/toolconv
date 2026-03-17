"""
utils/llm.py — thin LLM client used by all toolconv agents.

Reads LLM_PROVIDER, ANTHROPIC_API_KEY, and OPENAI_API_KEY from the
environment (or a loaded .env file) and exposes one function:

    response: str = call_llm(prompt, system=None, max_tokens=1024, seed=None)

Supported providers
-------------------
  anthropic  — claude-haiku-4-5-20251001 (fast, cheap, default)
  openai     — gpt-4o-mini

Fallback
--------
If no API key is set or the call fails, a deterministic template
string is returned so the rest of the pipeline never crashes during
development / offline testing.
"""

from __future__ import annotations

import hashlib
import logging
import os
from typing import Any

logger = logging.getLogger(__name__)

# Default models per provider
_MODELS: dict[str, str] = {
    "anthropic": "claude-haiku-4-5-20251001",
    "openai":    "gpt-4o-mini",
}


def _provider() -> str:
    return os.getenv("LLM_PROVIDER", "anthropic").lower()


def _call_anthropic(
    prompt: str,
    system: str | None,
    max_tokens: int,
    **kwargs: Any,
) -> str:
    import anthropic  # noqa: PLC0415
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    messages = [{"role": "user", "content": prompt}]
    resp = client.messages.create(
        model=_MODELS["anthropic"],
        max_tokens=max_tokens,
        system=system or "You are a helpful assistant.",
        messages=messages,
        **kwargs,
    )
    return resp.content[0].text


def _call_openai(
    prompt: str,
    system: str | None,
    max_tokens: int,
    **kwargs: Any,
) -> str:
    import openai  # noqa: PLC0415
    client = openai.OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    resp = client.chat.completions.create(
        model=_MODELS["openai"],
        max_tokens=max_tokens,
        messages=messages,
        **kwargs,
    )
    return resp.choices[0].message.content or ""


def _fallback(prompt: str) -> str:
    """
    Deterministic offline stub — returns a short canned response.
    The hash of the prompt drives which template is chosen so different
    prompts get different (but stable) responses.
    """
    idx = int(hashlib.md5(prompt.encode()).hexdigest(), 16) % 5
    stubs = [
        "I'd like to find the best option available for my needs.",
        "Can you help me look into this? I'm not sure where to start.",
        "Please search for the available options and let me know what you find.",
        "I need help sorting this out — could you check the details for me?",
        "What information do you need from me to get started?",
    ]
    return stubs[idx]


def call_llm(
    prompt: str,
    system: str | None = None,
    max_tokens: int = 1024,
    **kwargs: Any,
) -> str:
    """
    Call the configured LLM provider and return the text response.

    Falls back to a deterministic stub if no API key is available or
    the call raises an exception.
    """
    provider = _provider()
    key_var = "ANTHROPIC_API_KEY" if provider == "anthropic" else "OPENAI_API_KEY"

    if not os.getenv(key_var):
        logger.warning("call_llm: %s not set — using offline stub", key_var)
        return _fallback(prompt)

    try:
        if provider == "anthropic":
            return _call_anthropic(prompt, system, max_tokens, **kwargs)
        elif provider == "openai":
            return _call_openai(prompt, system, max_tokens, **kwargs)
        else:
            logger.warning("call_llm: unknown provider %r — using offline stub", provider)
            return _fallback(prompt)
    except Exception as exc:
        logger.warning("call_llm failed (%s) — using offline stub: %s", provider, exc)
        return _fallback(prompt)
