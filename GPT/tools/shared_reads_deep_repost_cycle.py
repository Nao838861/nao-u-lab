#!/usr/bin/env python3
"""Post up to two prepared deep shared-reads repost drafts per maintenance cycle."""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

from slack_client import post_message
from shared_reads_deep_repost_ready import READY_DRAFTS
from shared_reads_policy import validate_shared_reads_message


ROOT = Path(__file__).resolve().parents[1]
MEMORY_DIR = ROOT / "memory"
STATE_PATH = MEMORY_DIR / "shared_reads_deep_repost_state.json"
QUEUE_PATH = MEMORY_DIR / "shared_reads_deep_repost_queue.json"
DEFAULT_CHANNEL = "shared-reads"
DEFAULT_LIMIT = 2
MIN_CHARS = 3400
TARGET_CHARS = 4000
MAX_CHARS = 4600


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


SEED_QUEUE: list[dict[str, Any]] = [
    {
        "key": "neurostate-bench-2605.01847",
        "title": "NeuroState-Bench: A Human-Calibrated Benchmark for Commitment Integrity in LLM Agent Profiles",
        "url": "http://arxiv.org/abs/2605.01847v2",
        "source_ts": "1778460047.833509",
        "status": "needs_draft",
        "note": "約4000字。途中状態・side-query probe・commitment integrityを、人間に読める手法概要として説明する。",
    },
    {
        "key": "governed-collaborative-memory-2605.04264",
        "title": "Governed Collaborative Memory as Artificial Selection in LLM-Based Multi-Agent Systems",
        "url": "http://arxiv.org/abs/2605.04264v1",
        "source_ts": "1778460047.833509",
        "status": "needs_draft",
        "note": "約4000字。共有記憶を人工選択・ガバナンス・制度的状態として説明する。",
    },
    {
        "key": "liecraft-2603.06874",
        "title": "LieCraft: A Multi-Agent Framework for Evaluating Deceptive Capabilities in Language Models",
        "url": "http://arxiv.org/abs/2603.06874v1",
        "source_ts": "1778466346.767849",
        "status": "needs_draft",
        "note": "約4000字。隠れ役職ゲームによる長期欺瞞評価サンドボックスとして説明する。",
    },
    {
        "key": "algorithmic-collusion-2602.17203",
        "title": "Algorithmic Collusion at Test Time: A Meta-game Design and Evaluation",
        "url": "http://arxiv.org/abs/2602.17203v2",
        "source_ts": "1778466346.767849",
        "status": "needs_draft",
        "note": "約4000字。テスト時談合をmeta-gameとして測る設計として説明する。",
    },
    {
        "key": "ink-splotch-2403.02454",
        "title": "The Ink Splotch Effect: A Case Study on ChatGPT as a Co-Creative Game Designer",
        "url": "http://arxiv.org/abs/2403.02454v1",
        "source_ts": "1778466346.767849",
        "status": "needs_draft",
    },
    {
        "key": "covol-2505.08515",
        "title": "CoVoL: A Cooperative Vocabulary Learning Game for Children with Autism",
        "url": "http://arxiv.org/abs/2505.08515v1",
        "source_ts": "1778466346.767849",
        "status": "needs_draft",
    },
    {
        "key": "snappable-meshes-2108.00056",
        "title": "Procedural Generation of 3D Maps with Snappable Meshes",
        "url": "http://arxiv.org/abs/2108.00056v3",
        "source_ts": "1778472640.818519",
        "status": "needs_draft",
    },
    {
        "key": "virtual-cyberball-2312.02897",
        "title": "Perspectives from Naive Participants and Experienced Social Science Researchers on Addressing Embodiment in a Virtual Cyberball Task",
        "url": "http://arxiv.org/abs/2312.02897v1",
        "source_ts": "1778472640.818519",
        "status": "needs_draft",
    },
    {
        "key": "symbolically-scaffolded-play-2510.25820",
        "title": "Symbolically Scaffolded Play: Designing Role-Sensitive Prompts for Generative NPC Dialogue",
        "url": "http://arxiv.org/abs/2510.25820v1",
        "source_ts": "1778472640.818519",
        "status": "needs_draft",
    },
    {
        "key": "prompting-destiny-2602.05864",
        "title": "Prompting Destiny: Negotiating Socialization and Growth in an LLM-Mediated Speculative Gameworld",
        "url": "http://arxiv.org/abs/2602.05864v1",
        "source_ts": "1778472640.818519",
        "status": "needs_draft",
    },
    {
        "key": "minenpc-task-2601.05215",
        "title": "MineNPC-Task: Task Suite for Memory-Aware Minecraft Agents",
        "url": "http://arxiv.org/abs/2601.05215v2",
        "source_ts": "1778478943.773039",
        "status": "needs_draft",
    },
    {
        "key": "mcphunt-2604.27819",
        "title": "MCPHunt: An Evaluation Framework for Cross-Boundary Data Propagation in Multi-Server MCP Agents",
        "url": "http://arxiv.org/abs/2604.27819v1",
        "source_ts": "1778478943.773039",
        "status": "needs_draft",
    },
    {
        "key": "researchgym-2602.15112",
        "title": "ResearchGym: Evaluating Language Model Agents on Real-World AI Research",
        "url": "http://arxiv.org/abs/2602.15112v2",
        "source_ts": "1778478943.773039",
        "status": "needs_draft",
    },
    {
        "key": "inmind-2508.16072",
        "title": "InMind: Evaluating LLMs in Capturing and Applying Individual Human Reasoning Styles",
        "url": "http://arxiv.org/abs/2508.16072v3",
        "source_ts": "1778478943.773039",
        "status": "needs_draft",
    },
    {
        "key": "grounding-machine-creativity-2603.07101",
        "title": "Grounding Machine Creativity in Game Design Knowledge Representations",
        "url": "http://arxiv.org/abs/2603.07101v4",
        "source_ts": "1778491540.156779",
        "status": "needs_draft",
    },
    {
        "key": "applied-user-research-vr-2402.15695",
        "title": "Applied User Research in Virtual Reality: Tools, Methods, and Challenges",
        "url": "http://arxiv.org/abs/2402.15695v1",
        "source_ts": "1778491540.156779",
        "status": "needs_draft",
    },
    {
        "key": "physical-basis-of-prediction-2509.04633",
        "title": "The Physical Basis of Prediction: World Model Formation in Neural Organoids via an LLM-Generated Curriculum",
        "url": "http://arxiv.org/abs/2509.04633v3",
        "source_ts": "1778491540.156779",
        "status": "needs_draft",
    },
    {
        "key": "flashrt-2604.28157",
        "title": "FlashRT: Towards Computationally and Memory Efficient Red-Teaming for Prompt Injection and Knowledge Corruption",
        "url": "http://arxiv.org/abs/2604.28157v1",
        "source_ts": "1778491540.156779",
        "status": "needs_draft",
    },
    {
        "key": "pokemon-battle-agents-2512.17308",
        "title": "Large Language Models as Pokemon Battle Agents: Strategic Play and Content Generation",
        "url": "http://arxiv.org/abs/2512.17308v1",
        "source_ts": "1778497838.017939",
        "status": "needs_draft",
    },
    {
        "key": "ghost-in-the-agent-2604.23374",
        "title": "Ghost in the Agent: Redefining Information Flow Tracking for LLM Agents",
        "url": "http://arxiv.org/abs/2604.23374v1",
        "source_ts": "1778497838.017939",
        "status": "needs_draft",
    },
    {
        "key": "onchain-agent-controls-2604.26091",
        "title": "Operating-Layer Controls for Onchain Language-Model Agents Under Real Capital",
        "url": "http://arxiv.org/abs/2604.26091v1",
        "source_ts": "1778497838.017939",
        "status": "needs_draft",
    },
    {
        "key": "foveated-haptic-gaze-2001.01824",
        "title": "Foveated Haptic Gaze",
        "url": "http://arxiv.org/abs/2001.01824v3",
        "source_ts": "1778497838.017939",
        "status": "needs_draft",
    },
    {
        "key": "hmace-2605.07214",
        "title": "HMACE: Heterogeneous Multi-Agent Collaborative Evolution for Combinatorial Optimization",
        "url": "http://arxiv.org/abs/2605.07214v1",
        "source_ts": "1778504141.908139",
        "status": "needs_draft",
    },
    {
        "key": "agentic-ai-cybersecurity-survey-2601.05293",
        "title": "A Survey of Agentic AI and Cybersecurity: Challenges, Opportunities and Use-case Prototypes",
        "url": "http://arxiv.org/abs/2601.05293v1",
        "source_ts": "1778504141.908139",
        "status": "needs_draft",
    },
    {
        "key": "routine-chats-toxic-2605.06731",
        "title": "When Routine Chats Turn Toxic: Unintended Long-Term State Poisoning in Personalized Agents",
        "url": "http://arxiv.org/abs/2605.06731v1",
        "source_ts": "1778504141.908139",
        "status": "needs_draft",
    },
    {
        "key": "security-auditable-agents-2605.06812",
        "title": "Towards Security-Auditable LLM Agents: A Unified Graph Representation",
        "url": "http://arxiv.org/abs/2605.06812v1",
        "source_ts": "1778504141.908139",
        "status": "needs_draft",
    },
    {
        "key": "noncentralized-mpc-partitioning-2509.11470",
        "title": "Partitioning techniques for non-centralized predictive control",
        "url": "http://arxiv.org/abs/2509.11470v1",
        "source_ts": "1778510440.623829",
        "status": "needs_draft",
    },
    {
        "key": "promptvfx-2506.01091",
        "title": "PromptVFX: Text-Driven Fields for Open-World 3D Gaussian Animation",
        "url": "http://arxiv.org/abs/2506.01091v2",
        "source_ts": "1778510440.623829",
        "status": "needs_draft",
    },
    {
        "key": "omniworld-2509.12201",
        "title": "OmniWorld: A Multi-Domain and Multi-Modal Dataset for 4D World Modeling",
        "url": "http://arxiv.org/abs/2509.12201v2",
        "source_ts": "1778510440.623829",
        "status": "needs_draft",
    },
    {
        "key": "sensingagents-2605.04608",
        "title": "SensingAgents: A Multi-Agent Collaborative Framework for Robust IMU Activity Recognition",
        "url": "http://arxiv.org/abs/2605.04608v1",
        "source_ts": "1778529346.537919",
        "status": "needs_draft",
    },
    {
        "key": "agentic-materials-science-2602.00169",
        "title": "Towards Agentic Intelligence for Materials Science",
        "url": "http://arxiv.org/abs/2602.00169v2",
        "source_ts": "1778529346.537919",
        "status": "needs_draft",
    },
    {
        "key": "when-roles-fail-2604.27228",
        "title": "When Roles Fail: Epistemic Constraints on Advocate Role Fidelity in LLM-Based Political Statement Analysis",
        "url": "http://arxiv.org/abs/2604.27228v1",
        "source_ts": "1778529346.537919",
        "status": "needs_draft",
    },
    {
        "key": "a2tgpo-2605.06200",
        "title": "A^2TGPO: Agentic Turn-Group Policy Optimization with Adaptive Turn-level Clipping",
        "url": "http://arxiv.org/abs/2605.06200v1",
        "source_ts": "1778529346.537919",
        "status": "needs_draft",
    },
]


def now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def save_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def ensure_queue() -> list[dict[str, Any]]:
    if not QUEUE_PATH.exists():
        queue = [dict(item) for item in SEED_QUEUE]
    else:
        queue = load_json(QUEUE_PATH, [])
    existing = {str(item.get("key")) for item in queue}
    changed = False
    for item in SEED_QUEUE:
        if str(item.get("key")) not in existing:
            queue.append(item)
            changed = True
    ready_by_key = {str(item.get("key")): item for item in READY_DRAFTS}
    for item in queue:
        key = str(item.get("key"))
        if key not in ready_by_key or item.get("status") == "posted":
            continue
        draft = ready_by_key[key]
        for field in ("status", "message"):
            if item.get(field) != draft.get(field):
                item[field] = draft.get(field)
                changed = True
    if changed:
        save_json(QUEUE_PATH, queue)
    return queue


def validate_message(item: dict[str, Any]) -> str | None:
    message = str(item.get("message") or "").strip()
    result = validate_shared_reads_message(message, min_chars=MIN_CHARS, max_chars=MAX_CHARS)
    return None if result.ok else result.reason


def main() -> int:
    parser = argparse.ArgumentParser(description="Post prepared deep shared-reads repost drafts.")
    parser.add_argument("--channel", default=DEFAULT_CHANNEL)
    parser.add_argument("--limit", type=int, default=DEFAULT_LIMIT)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    state = load_json(STATE_PATH, {"posted_keys": []})
    posted = set(str(key) for key in state.get("posted_keys", []))
    queue = ensure_queue()

    ready: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []
    for item in queue:
        key = str(item.get("key") or "")
        if key in posted or item.get("status") == "posted":
            continue
        if item.get("status") != "ready":
            skipped.append({"key": key, "reason": str(item.get("status") or "needs_draft")})
            continue
        problem = validate_message(item)
        if problem:
            skipped.append({"key": key, "reason": problem})
            continue
        ready.append(item)
        if len(ready) >= args.limit:
            break

    result: dict[str, Any] = {
        "ok": True,
        "dry_run": args.dry_run,
        "target_chars": TARGET_CHARS,
        "limit": args.limit,
        "ready_count": len(ready),
        "posted": [],
        "skipped_preview": skipped[:8],
    }

    changed = False
    for item in ready:
        key = str(item.get("key"))
        message = str(item.get("message")).strip()
        if args.dry_run:
            result["posted"].append({"key": key, "chars": len(message), "utf8_bytes": len(message.encode("utf-8")), "dry_run": True})
            continue
        post_result = post_message(args.channel, message)
        if not post_result.get("ok"):
            result["ok"] = False
            result["error"] = post_result
            break
        posted.add(key)
        item["status"] = "posted"
        item["posted_at"] = now_iso()
        item["slack_ts"] = post_result.get("ts")
        result["posted"].append(
            {
                "key": key,
                "chars": len(message),
                "utf8_bytes": len(message.encode("utf-8")),
                "channel": post_result.get("channel"),
                "ts": post_result.get("ts"),
            }
        )
        changed = True

    if changed and not args.dry_run:
        state["posted_keys"] = sorted(posted)
        state["last_run"] = now_iso()
        save_json(STATE_PATH, state)
        save_json(QUEUE_PATH, queue)

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
