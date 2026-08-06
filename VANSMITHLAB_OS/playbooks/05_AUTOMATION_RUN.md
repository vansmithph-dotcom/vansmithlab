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

## Evidence audit decision procedure

After an evidence audit:

1. Partition claims into `release_claims`, `held_claims` and rejected relation candidates.
2. For every failing release claim, record whether `OMIT`, `NARROW`, `ATTRIBUTE`, `SPLIT`, `REPLACE_SOURCE` or `HOLD_CLAIM` is safe.
3. If all release-critical defects are safely repairable, set `AUTO_REVISE`; persist and apply the revision plan.
4. Re-run the audit with a different approving agent from the producer.
5. Continue on `AUTO_APPROVE` only when the revised release set passes all thresholds.
6. Use `BLOCKED` when evidence work is still required after the bounded loop.
7. Use `NEEDS_USER_INPUT` only when one of the six escalation conditions remains after safe repairs.

A workflow error exit is an implementation signal, not the editorial state. Queue state must preserve `blocked`, `needs_user_input` and `do_not_publish` rather than flattening all non-zero exits into `failed`.

## Completion

- Verify no duplicate release, post, object or media derivative was produced.
- Run downstream jobs only from an approved release revision.
- Close workflow with result, cost/usage, trace links and monitoring subscriptions.
