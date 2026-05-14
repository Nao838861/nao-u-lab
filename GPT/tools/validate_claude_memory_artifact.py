#!/usr/bin/env python3
"""Validate active Claude memory compiled/canonical artifacts."""
from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


@dataclass(frozen=True)
class PointerCheck:
    path: str
    token: str
    expected: bool = True


@dataclass(frozen=True)
class ArtifactSpec:
    path: str
    frontmatter: dict[str, str]
    required_phrases: tuple[str, ...]
    source_paths: tuple[str, ...] = ()
    pointer_checks: tuple[PointerCheck, ...] = ()


ARTIFACTS: tuple[ArtifactSpec, ...] = (
    ArtifactSpec(
        path="Claude/memory/memory_operation_compiled_guide.md",
        frontmatter={
            "name": "memory_operation_compiled_guide",
            "type": "memory",
            "status": "active",
            "lifecycle": "compiled",
            "created_at": "2026-05-14",
        },
        required_phrases=(
            "## いつ読むか",
            "write / manage / read",
            "raw",
            "compiled",
            "Protocol",
            "Memory",
            "Skills",
            "Project",
            "State / Runtime I/O",
            "rawを消さない",
            "## 出典",
        ),
        source_paths=(
            "Claude/memory/feedback_memory_architecture.md",
            "Claude/memory/dialogue_memory_purpose_20260421.md",
            "Claude/memory/memory_architecture.md",
            "Claude/memory/feedback_substrate_not_infrastructure.md",
            "Claude/memory/dialogue_micromanagement_20260504.md",
            "Claude/memory/feedback_few_rules_big_effect.md",
            "Claude/memory/feedback_info_integration.md",
            "Claude/memory/beliefs_compact.md",
            "GPT/memory/directive_claude_memory_system_improvement_20260514.md",
            "GPT/memory/claude_memory_baseline_20260514.md",
            "GPT/memory/claude_memory_io_inventory_20260514.md",
            "GPT/memory/claude_memory_boundary_matrix_20260514.md",
            "GPT/memory/claude_memory_compiled_artifact_candidate_20260514.md",
        ),
        pointer_checks=(
            PointerCheck("Claude/CLAUDE.md", "memory_operation_compiled_guide.md"),
            PointerCheck("Claude/memory/MEMORY.md", "memory_operation_compiled_guide.md"),
            PointerCheck(
                "Claude/memory/session_primer.md",
                "memory_operation_compiled_guide.md",
                expected=False,
            ),
        ),
    ),
    ArtifactSpec(
        path="Claude/memory/feedback_rule_proliferation_canonical.md",
        frontmatter={
            "type": "feedback",
            "status": "active",
            "lifecycle": "canonical",
            "created_at": "2026-05-14",
        },
        required_phrases=(
            "canonical_for:",
            "## いつ読むか",
            "Nao_uの指摘",
            "ルール追加より",
            "specを作ったら",
            "raw",
            "## 出典",
        ),
        source_paths=(
            "Claude/memory/feedback_few_rules_big_effect.md",
            "Claude/memory/feedback_rule_proliferation.md",
            "Claude/memory/feedback_rule_proliferation_re_violation.md",
            "Claude/memory/dialogue_micromanagement_20260504.md",
            "Claude/memory/feedback_invisible_rule_accumulation.md",
            "Claude/memory/feedback_index.md",
            "Claude/memory/memory_operation_compiled_guide.md",
            "GPT/memory/claude_memory_compiled_artifact_candidate_20260514.md",
        ),
        pointer_checks=(
            PointerCheck("Claude/CLAUDE.md", "feedback_rule_proliferation_canonical.md"),
            PointerCheck("Claude/memory/MEMORY.md", "feedback_rule_proliferation_canonical.md"),
            PointerCheck("Claude/memory/feedback_index.md", "feedback_rule_proliferation_canonical.md"),
            PointerCheck("Claude/memory/feedback_few_rules_big_effect.md", "feedback_rule_proliferation_canonical.md"),
            PointerCheck("Claude/memory/feedback_rule_proliferation.md", "feedback_rule_proliferation_canonical.md"),
            PointerCheck("Claude/memory/feedback_rule_proliferation_re_violation.md", "feedback_rule_proliferation_canonical.md"),
            PointerCheck("Claude/memory/dialogue_micromanagement_20260504.md", "feedback_rule_proliferation_canonical.md"),
        ),
    ),
    ArtifactSpec(
        path="Claude/memory/game_read_path_compiled_guide.md",
        frontmatter={
            "name": "game_read_path_compiled_guide",
            "type": "memory",
            "status": "active",
            "lifecycle": "compiled",
            "created_at": "2026-05-14",
        },
        required_phrases=(
            "## いつ読むか",
            "新規 v01 着手",
            "改修判断",
            "cross_review",
            "Nao_u 評価受領",
            "game_dev_index.md",
            "game_lessons_log.md",
            "lessons-recall",
            "読みすぎ防止",
            "## 出典",
        ),
        source_paths=(
            "Claude/memory/game_dev_index.md",
            "Claude/memory/game_lessons_log.md",
            "Claude/skills/lessons-recall/SKILL.md",
            "Claude/memory/feedback_judgment_postpone_patterns.md",
            "Claude/memory/feedback_rule_proliferation_canonical.md",
            "Claude/memory/memory_operation_compiled_guide.md",
        ),
        pointer_checks=(
            PointerCheck("Claude/memory/game_dev_index.md", "game_read_path_compiled_guide.md"),
            PointerCheck("Claude/memory/MEMORY.md", "game_read_path_compiled_guide.md", expected=False),
            PointerCheck("Claude/memory/session_primer.md", "game_read_path_compiled_guide.md", expected=False),
        ),
    ),
)


def parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}, text
    try:
        end = lines[1:].index("---") + 1
    except ValueError:
        return {}, text
    frontmatter: dict[str, str] = {}
    for line in lines[1:end]:
        if ":" not in line or line.startswith(" "):
            continue
        key, value = line.split(":", 1)
        frontmatter[key.strip()] = value.strip()
    return frontmatter, "\n".join(lines[end + 1 :])


def validate_artifact(spec: ArtifactSpec) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    path = ROOT / spec.path

    if not path.exists():
        return [f"{spec.path}: missing artifact"], warnings

    text = path.read_text(encoding="utf-8", errors="replace")
    frontmatter, _body = parse_frontmatter(text)

    for key, expected in spec.frontmatter.items():
        actual = frontmatter.get(key)
        if actual != expected:
            errors.append(f"{spec.path}: frontmatter {key}: expected {expected!r}, got {actual!r}")

    for phrase in spec.required_phrases:
        if phrase not in text:
            errors.append(f"{spec.path}: missing required phrase: {phrase}")

    for source in spec.source_paths:
        if source not in text:
            errors.append(f"{spec.path}: missing provenance entry: {source}")
        if not (ROOT / source).exists():
            errors.append(f"{spec.path}: provenance file does not exist: {source}")

    for check in spec.pointer_checks:
        pointer_path = ROOT / check.path
        if not pointer_path.exists():
            warnings.append(f"{spec.path}: pointer target missing, skipped: {check.path}")
            continue
        pointer_text = pointer_path.read_text(encoding="utf-8", errors="replace")
        found = check.token in pointer_text
        if check.expected and not found:
            errors.append(f"{spec.path}: expected pointer missing from {check.path}: {check.token}")
        if not check.expected and found:
            errors.append(f"{spec.path}: disallowed pointer found in {check.path}: {check.token}")

    return errors, warnings


def validate() -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    seen_paths: set[str] = set()
    for spec in ARTIFACTS:
        if spec.path in seen_paths:
            errors.append(f"duplicate artifact spec: {spec.path}")
            continue
        seen_paths.add(spec.path)
        artifact_errors, artifact_warnings = validate_artifact(spec)
        errors.extend(artifact_errors)
        warnings.extend(artifact_warnings)

    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--quiet", action="store_true")
    args = parser.parse_args()

    errors, warnings = validate()
    if not args.quiet:
        print(f"artifacts: {len(ARTIFACTS)}")
        print(f"errors: {len(errors)}")
        for error in errors:
            print(f"ERROR: {error}")
        print(f"warnings: {len(warnings)}")
        for warning in warnings:
            print(f"WARNING: {warning}")

    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
