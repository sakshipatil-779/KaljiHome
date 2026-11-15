# Elderly Care & Medication Management Platform — Research and Build Kit

**Prepared:** 15 November 2026  
**Context:** India-first hackathon product brief  
**Working product name:** ElderCare Platform (placeholder; do not treat as final branding)

## Included files

- `AGENTS.md` — rules for AI coding agents working in this repository.
- `MASTER_BUILD_BRIEF.md` — single source of truth for product direction and acceptance.
- `00_PROJECT_CHARTER.md` through `12_BUILD_PLAN.md` — product, research, UX, architecture, data, security, validation and delivery specifications.
- `ANTIGRAVITY_PROMPT.md` — copy-paste-ready instruction for auditing the current website/repository, filling verified gaps and building in controlled phases.

## How to use

1. Extract this folder into the root of the existing project repository. Do not overwrite application source files.
2. Open the project in Antigravity and paste the full contents of `ANTIGRAVITY_PROMPT.md`.
3. Ask the agent to read `AGENTS.md`, `MASTER_BUILD_BRIEF.md`, and every numbered specification before modifying code.
4. Give the agent the deployed website URL separately when available. It must still inspect the repository and must not invent features it cannot verify.
5. Review `CURRENT_STATE_AUDIT.md` and `GAP_ANALYSIS.md` produced by the agent before accepting the implementation.

## Important limitation

No website URL, source repository, screenshots of the actual product, or existing code files were supplied with this request. Therefore these documents define the target product and an audit method; they do **not** claim to have inspected or identified actual defects in your current website. Antigravity is instructed to discover and document those gaps from the real codebase and URL before making changes.

## Source and safety note

This is a product/engineering research pack, not medical advice or a legal opinion. The platform must not diagnose, prescribe, change dosage, recommend what to do after a missed dose, or claim to replace a clinician. Verify applicable Indian legal requirements with qualified counsel before production deployment. Research URLs and the verification date are recorded in `02_RESEARCH_EVIDENCE.md`.
