-- VANSMITHLAB knowledge core. Apply with Wrangler after a D1 database is provisioned.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS knowledge_objects (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  canonical_locale TEXT NOT NULL DEFAULT 'ru',
  lifecycle_state TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  verification_state TEXT NOT NULL,
  confidence_score REAL NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  publisher TEXT NOT NULL,
  source_tier INTEGER NOT NULL CHECK (source_tier BETWEEN 1 AND 7),
  accessed_at TEXT NOT NULL,
  content_hash TEXT
);

CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  object_id TEXT NOT NULL REFERENCES knowledge_objects(id),
  wording_ru TEXT NOT NULL,
  claim_type TEXT NOT NULL,
  verification_state TEXT NOT NULL,
  confidence_score REAL NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
  material INTEGER NOT NULL DEFAULT 1,
  retracted_at TEXT
);

CREATE TABLE IF NOT EXISTS citations (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES claims(id),
  source_id TEXT NOT NULL REFERENCES sources(id),
  locator TEXT NOT NULL,
  quote_hash TEXT,
  UNIQUE (claim_id, source_id, locator)
);

CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  primary_object_id TEXT NOT NULL REFERENCES knowledge_objects(id),
  state TEXT NOT NULL,
  source_revision INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS content_localizations (
  content_id TEXT NOT NULL REFERENCES content_items(id),
  locale TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source_locale TEXT NOT NULL,
  source_revision INTEGER NOT NULL,
  state TEXT NOT NULL,
  body_hash TEXT NOT NULL,
  PRIMARY KEY (content_id, locale),
  UNIQUE (locale, slug)
);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id TEXT PRIMARY KEY,
  entity_id TEXT,
  workflow_type TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  provider_log_json TEXT NOT NULL DEFAULT '[]',
  decision TEXT,
  started_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS review_requests (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL,
  reason_code TEXT NOT NULL,
  priority TEXT NOT NULL,
  question TEXT NOT NULL,
  recommended_default TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_claim_object_state ON claims(object_id, verification_state);
CREATE INDEX IF NOT EXISTS idx_citation_claim ON citations(claim_id);
CREATE INDEX IF NOT EXISTS idx_content_state ON content_items(state, type);
CREATE INDEX IF NOT EXISTS idx_review_state ON review_requests(state, priority);
