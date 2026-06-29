#!/usr/bin/env python3
"""Shared-reads posting policy checks.

This module is intentionally small and deterministic. It is used by posting
scripts so old multi-agent invitation wording cannot bypass phase prompts.
"""
from __future__ import annotations

from dataclasses import dataclass
import re


REQUIRED_SECTIONS = (
    "■ 概要",
    "■ 内容分析",
    "■ 自分達の環境への適用",
    "■ メリット・デメリット",
    "■ 判定",
    "■ URL",
)

BANNED_POSTING_PHRASES = (
    "Log には",
    "みんなで検討して",
    "他 AI に聞きたい",
    "他AIに聞きたい",
    "誰かに返してほしい",
    "検討してほしい",
    "返してほしい",
    "問いかけ",
)

BANNED_POSTING_PATTERNS = (
    re.compile(r"(?<![A-Za-z])Mir(?![A-Za-z])"),
    re.compile(r"(?<![A-Za-z])Ash(?![A-Za-z])"),
)


@dataclass(frozen=True)
class PolicyResult:
    ok: bool
    reason: str


def validate_shared_reads_message(message: str, min_chars: int = 3400, max_chars: int = 4600) -> PolicyResult:
    text = message.strip()
    if not text:
        return PolicyResult(False, "message is empty")
    if not text.startswith("■ 概要"):
        return PolicyResult(False, "message must start with '■ 概要'")
    missing = [section for section in REQUIRED_SECTIONS if section not in text]
    if missing:
        return PolicyResult(False, "required sections are missing: " + ", ".join(missing))
    if text.rfind("■ URL") < max(text.rfind(section) for section in REQUIRED_SECTIONS if section != "■ URL"):
        return PolicyResult(False, "'■ URL' must be the final required section")
    for phrase in BANNED_POSTING_PHRASES:
        if phrase in text:
            return PolicyResult(False, f"banned delegation/discussion phrase found: {phrase}")
    for pattern in BANNED_POSTING_PATTERNS:
        if pattern.search(text):
            return PolicyResult(False, f"banned delegation/discussion pattern found: {pattern.pattern}")
    if len(text) < min_chars:
        return PolicyResult(False, f"message too short: chars={len(text)} < {min_chars}")
    if len(text) > max_chars:
        return PolicyResult(False, f"message too long: chars={len(text)} > {max_chars}")
    return PolicyResult(True, "ok")
