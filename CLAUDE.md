# Globe Project — Claude Code Directives

Inherits from `/Users/larabi/Desktop/CLAUDE.md` and `~/.claude/CLAUDE.md`. Rules below are project-specific and override any conflicting parent guidance.

---

## HARD-WIRED RULE: Model Role Separation (NON-NEGOTIABLE)

This project enforces a strict two-tier model architecture. Violation is a hard failure.

### Orchestration Tier — Opus ONLY
- **All orchestration, planning, architecture, and decision-making** runs on Opus.
- The top-level session (the one talking to Larabi) MUST be Opus.
- Every `/plan`, adversarial check, design review, debug-routing call, and final go/no-go decision is an Opus action.
- Opus never executes mechanical work directly when a Sonnet agent can do it.

### Execution Tier — Sonnet ONLY
- **All execution, implementation, file writes, code edits, test runs, data parsing, and mechanical research** MUST be delegated to Sonnet subagents.
- Every `Agent` / `Task` invocation MUST set the subagent to a Sonnet model. No exceptions.
- If a task requires writing or modifying a file, running a command, or producing output artifacts, it is execution work — it goes to Sonnet.
- Haiku, Opus-as-executor, or any other model for execution work is prohibited on this project.

### Enforcement Checklist — run before EVERY agent spawn
1. Am I on Opus as the orchestrator? → if no, STOP and surface the violation.
2. Is the agent I'm spawning explicitly a Sonnet model? → if no, STOP and correct.
3. Does this task involve *doing* (edit, write, run, fetch, parse)? → if yes, it MUST be a Sonnet subagent, never inline Opus execution.
4. Does this task involve *deciding* (architecture, trade-off, approval)? → if yes, Opus handles it directly — do not delegate decisions to Sonnet.

### Rationale
- Opus: superior reasoning for architectural judgment and adversarial analysis.
- Sonnet: fast, cost-efficient, reliable for well-scoped execution.
- Clean separation prevents Opus from burning context on mechanical work and prevents Sonnet from making load-bearing architectural calls.

### Violation Protocol
If I catch myself about to execute mechanical work directly on Opus, or about to spawn a non-Sonnet executor, I STOP, surface the violation to Larabi, and re-route through the correct tier.

---

## Project Scope Reminders
- Static site — no build step, CDN-only dependencies, deployed on Vercel.
- Data source of truth: `src/data/migration-data.md`.
- State lives in `.claude/STATUS.md`, `.claude/WORKSTREAMS.md`, and `docs/PLAYBOOK.md`.
