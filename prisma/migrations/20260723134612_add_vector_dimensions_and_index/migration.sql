-- Update vector column to specify dimensions (1536 for OpenAI text-embedding-3-small/ada-002)
ALTER TABLE embeddings ALTER COLUMN vector TYPE vector(1536);

-- Add HNSW index for efficient similarity search using cosine distance
CREATE INDEX IF NOT EXISTS embeddings_vector_idx ON embeddings USING hnsw (vector vector_cosine_ops);
