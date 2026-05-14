#!/usr/bin/env python3
"""Validate lightweight Claude memory read-path scenarios."""
from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


@dataclass(frozen=True)
class FileCheck:
    path: str
    must_contain: tuple[str, ...] = ()


@dataclass(frozen=True)
class Scenario:
    scenario_id: str
    trigger: str
    expected_files: tuple[FileCheck, ...]


SCENARIOS: tuple[Scenario, ...] = (
    Scenario(
        scenario_id="memory_system_improvement",
        trigger="Claude側の記憶階層、compiled artifact、raw/compiled、配置分類を変更する",
        expected_files=(
            FileCheck(
                "Claude/memory/memory_operation_compiled_guide.md",
                (
                    "## いつ読むか",
                    "write / manage / read",
                    "State / Runtime I/O",
                    "rawを消さない",
                ),
            ),
        ),
    ),
    Scenario(
        scenario_id="new_rule_or_protocol",
        trigger="Nao_uの指摘を受けて新しいProtocol、M-XX、kaizen、skill specを追加したくなる",
        expected_files=(
            FileCheck(
                "Claude/memory/feedback_rule_proliferation_canonical.md",
                (
                    "Nao_uの指摘",
                    "ルール追加より",
                    "specを作ったら",
                ),
            ),
            FileCheck(
                "Claude/memory/feedback_index.md",
                ("feedback_rule_proliferation_canonical.md",),
            ),
        ),
    ),
    Scenario(
        scenario_id="new_game_v01",
        trigger="新しい game/<id>/v01/ を作る前に読む入口を決める",
        expected_files=(
            FileCheck(
                "Claude/memory/game_read_path_compiled_guide.md",
                (
                    "新規 v01 着手",
                    "最初に `game_dev_index.md`",
                    "README または brainstorm",
                ),
            ),
            FileCheck(
                "Claude/memory/game_dev_index.md",
                ("game_read_path_compiled_guide.md", "新ゲーム着手前"),
            ),
            FileCheck(
                "Claude/memory/game_lessons_log.md",
                ("R-A", "R-I", "新ゲーム"),
            ),
        ),
    ),
    Scenario(
        scenario_id="game_revision_decision",
        trigger="既存ゲームを vN から vN+1 へ進めるか、巻き戻すか、捨てるかを決める",
        expected_files=(
            FileCheck(
                "Claude/memory/game_read_path_compiled_guide.md",
                (
                    "改修判断",
                    "最初に `game_lessons_log.md`",
                    "進める/戻す/捨てる",
                ),
            ),
            FileCheck(
                "Claude/memory/game_lessons_log.md",
                ("巻き戻し", "M-11", "L-01"),
            ),
            FileCheck(
                "Claude/skills/lessons-recall/SKILL.md",
                ("改修判断", "引いた lesson"),
            ),
        ),
    ),
    Scenario(
        scenario_id="game_cross_review",
        trigger="cross_reviewに出す前、または他インスタンスの案を評価する",
        expected_files=(
            FileCheck(
                "Claude/memory/game_read_path_compiled_guide.md",
                (
                    "cross_review",
                    "最初に `lessons-recall`",
                    "判定装置ではなく、最終確認装置",
                ),
            ),
            FileCheck(
                "Claude/skills/lessons-recall/SKILL.md",
                ("cross_review", "判断文書"),
            ),
        ),
    ),
    Scenario(
        scenario_id="nao_u_game_feedback",
        trigger="Nao_uのプレイ評価や #game-rights の指摘を受け取った直後",
        expected_files=(
            FileCheck(
                "Claude/memory/game_read_path_compiled_guide.md",
                (
                    "Nao_u 評価受領",
                    "最初に `game_lessons_log.md`",
                    "個別指摘をすぐ M-XX や Protocol にしない",
                ),
            ),
            FileCheck(
                "Claude/memory/game_dev_index.md",
                ("Nao_u 評価受領", "game_lessons_log.md"),
            ),
            FileCheck(
                "Claude/memory/feedback_rule_proliferation_canonical.md",
                ("個別指摘", "そのまま禁止ルール"),
            ),
        ),
    ),
    Scenario(
        scenario_id="scheduler_or_runtime_incident",
        trigger="scheduler、cycle、inbox、next_tasks、stagingなどruntime stateに触りたくなる",
        expected_files=(
            FileCheck(
                "Claude/memory/memory_operation_compiled_guide.md",
                (
                    "schedulerやcycleが読むruntime state",
                    "State / Runtime I/O",
                    "直接編集しない",
                    "scheduler、auto_diary、inbox処理のコード",
                ),
            ),
            FileCheck(
                "Claude/docs/scheduler_architecture.md",
                ("scheduler",),
            ),
        ),
    ),
)

POINTER_CHECKS: tuple[FileCheck, ...] = (
    FileCheck(
        "Claude/CLAUDE.md",
        (
            "memory_operation_compiled_guide.md",
            "feedback_rule_proliferation_canonical.md",
        ),
    ),
    FileCheck(
        "Claude/memory/MEMORY.md",
        (
            "memory_operation_compiled_guide.md",
            "feedback_rule_proliferation_canonical.md",
            "game_dev_index.md",
        ),
    ),
    FileCheck(
        "Claude/memory/game_dev_index.md",
        ("game_read_path_compiled_guide.md",),
    ),
)


def validate() -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    seen_ids: set[str] = set()
    for scenario in SCENARIOS:
        if scenario.scenario_id in seen_ids:
            errors.append(f"duplicate scenario id: {scenario.scenario_id}")
        seen_ids.add(scenario.scenario_id)
        if not scenario.trigger:
            errors.append(f"{scenario.scenario_id}: missing trigger")

        for check in scenario.expected_files:
            path = ROOT / check.path
            if not path.exists():
                errors.append(f"{scenario.scenario_id}: missing file: {check.path}")
                continue
            text = path.read_text(encoding="utf-8", errors="replace")
            for phrase in check.must_contain:
                if phrase not in text:
                    errors.append(
                        f"{scenario.scenario_id}: {check.path} missing phrase: {phrase}"
                    )

    if len(SCENARIOS) < 7:
        warnings.append("scenario count is below expected baseline of 7")

    for check in POINTER_CHECKS:
        path = ROOT / check.path
        if not path.exists():
            errors.append(f"pointer check missing file: {check.path}")
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for phrase in check.must_contain:
            if phrase not in text:
                errors.append(f"pointer check: {check.path} missing phrase: {phrase}")

    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--quiet", action="store_true")
    args = parser.parse_args()

    errors, warnings = validate()
    if not args.quiet:
        print(f"scenarios: {len(SCENARIOS)}")
        print(f"errors: {len(errors)}")
        for error in errors:
            print(f"ERROR: {error}")
        print(f"warnings: {len(warnings)}")
        for warning in warnings:
            print(f"WARNING: {warning}")

    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
