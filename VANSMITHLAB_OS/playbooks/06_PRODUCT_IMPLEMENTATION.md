# Playbook 06 — Product, UI and Technical Implementation

## Input

An approved implementation brief referencing an OS rule, affected page/data model and acceptance criteria.

## Procedure

1. Read `11_SITE_INFORMATION_ARCHITECTURE.md`, `12_UX_UI_SYSTEM.md`, `14_TECHNICAL_DELIVERY.md` and `15_QUALITY_SECURITY_OPERATIONS.md`.
2. Identify data ownership, user journey, language requirements, loading/empty/error states and release impact.
3. Implement schema/migration and validator before dependent UI where data changes.
4. Build reusable accessible components; do not duplicate business rules in page components.
5. Test Russian and English paths, keyboard navigation, mobile, failure/empty states and structured data.
6. Run lint, unit/integration tests, build and release validation.
7. Document the implementation decision, migration and rollback route.

## Prohibited shortcut

Do not build a visually convincing page from mock content if it bypasses object, claim, citation, locale or rights rules. That creates a design prototype, not a VANSMITHLAB feature.
