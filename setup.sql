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
