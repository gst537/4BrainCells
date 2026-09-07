-- ============================================================
-- ALETHEIA — Institutional Memory Schema
-- Applied automatically on first DB query (see src/lib/db.ts).
-- ============================================================

-- Core Knowledge Graph
CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS edges (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  confidence NUMERIC DEFAULT 1.0,
  description TEXT
);

-- Decision Ledger records (richer projection of a 'decision' node)
CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  owner TEXT NOT NULL,
  owner_role TEXT,
  owner_avatar TEXT,
  department TEXT,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  confidence INTEGER DEFAULT 0,
  confidence_breakdown JSONB,
  impact TEXT,
  summary TEXT,
  rationale TEXT,
  alternatives_considered TEXT[],
  linked_node_ids TEXT[],
  primary_evidence_id TEXT,
  tags TEXT[],
  warnings JSONB
);

-- Chronological institutional timeline
CREATE TABLE IF NOT EXISTS timeline_events (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT,
  title TEXT NOT NULL,
  actor TEXT NOT NULL,
  actor_role TEXT,
  type TEXT NOT NULL,
  description TEXT,
  related_node_id TEXT,
  related_decision_id TEXT,
  related_evidence_id TEXT,
  branch TEXT,
  status TEXT
);

-- Evidence Vault
CREATE TABLE IF NOT EXISTS evidence_documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  author TEXT NOT NULL,
  date TEXT NOT NULL,
  hash TEXT NOT NULL,
  verified BOOLEAN DEFAULT TRUE,
  department TEXT,
  highlight_snippet TEXT,
  content TEXT NOT NULL,
  related_decision_id TEXT
);

-- Chat History Persistence
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  confidence_score INTEGER,
  confidence_level TEXT,
  citations JSONB,
  graph_focus_nodes TEXT[],
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Full-text search indexes (drive /api/search)
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS nodes_fts_idx ON nodes
  USING GIN (to_tsvector('english',
    coalesce(data->>'label','') || ' ' ||
    coalesce(data->>'subtitle','') || ' ' ||
    coalesce(data->>'description','') || ' ' ||
    coalesce(data->>'rationale','') || ' ' ||
    coalesce(data->>'category','') || ' ' ||
    coalesce(data->>'owner','')
  ));

CREATE INDEX IF NOT EXISTS decisions_fts_idx ON decisions
  USING GIN (to_tsvector('english',
    coalesce(title,'') || ' ' ||
    coalesce(summary,'') || ' ' ||
    coalesce(rationale,'') || ' ' ||
    coalesce(owner,'') || ' ' ||
    coalesce(department,'')
  ));

CREATE INDEX IF NOT EXISTS evidence_fts_idx ON evidence_documents
  USING GIN (to_tsvector('english',
    coalesce(title,'') || ' ' ||
    coalesce(author,'') || ' ' ||
    coalesce(highlight_snippet,'') || ' ' ||
    coalesce(content,'')
  ));

CREATE INDEX IF NOT EXISTS edges_source_idx ON edges (source);
CREATE INDEX IF NOT EXISTS edges_target_idx ON edges (target);
CREATE INDEX IF NOT EXISTS nodes_type_idx ON nodes (type);
