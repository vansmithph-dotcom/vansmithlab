# Playbook 05 — Autonomous Workflow Run

## Before execution

- Resolve OS version, workflow type, entity ID and idempotency key.
- Build a context packet from required documents, current revision, data and brief.
- Acquire a short-lived lock; create `workflow_run`.

## During execution

- Persist checkpoint/result after each durable action.
- Validate outputs before they reach the next agent.
- Retry temporary faults with bounded backoff.
- Route permanently failing jobs to a dead-letter record and safe blocked state.
- Record AI model/template/input/output hashes and decision.

## Completion

- Verify no duplicate release, post, object or media derivative was produced.
- Run downstream jobs only from an approved release revision.
- Close workflow with result, cost/usage, trace links and monitoring subscriptions.
