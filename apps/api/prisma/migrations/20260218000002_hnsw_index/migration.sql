-- Drop the ivfflat index (requires minimum rows to work)
DROP INDEX IF EXISTS "knowledge_chunks_embedding_idx";

-- Create HNSW index instead (works with any number of rows, better performance)
CREATE INDEX IF NOT EXISTS "knowledge_chunks_embedding_hnsw_idx"
  ON "knowledge_chunks" USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
