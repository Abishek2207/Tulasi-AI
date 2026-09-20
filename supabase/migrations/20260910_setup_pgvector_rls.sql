-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Alter tables for vector support if deployed via SQLAlchemy
ALTER TABLE documentchunk ALTER COLUMN embedding TYPE vector(768) USING embedding::vector;
ALTER TABLE usermemorychunk ALTER COLUMN embedding TYPE vector(768) USING embedding::vector;

-- Enable RLS
ALTER TABLE document ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentchunk ENABLE ROW LEVEL SECURITY;
ALTER TABLE usermemorychunk ENABLE ROW LEVEL SECURITY;

-- Create Policies for Document
CREATE POLICY "Users can insert their own documents"
ON document FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own documents"
ON document FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own documents"
ON document FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own documents"
ON document FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id::text);

-- Create Policies for DocumentChunk
CREATE POLICY "Users can insert their own document chunks"
ON documentchunk FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own document chunks"
ON documentchunk FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id::text);

-- Create Policies for UserMemoryChunk
CREATE POLICY "Users can insert their own memory chunks"
ON usermemorychunk FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own memory chunks"
ON usermemorychunk FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id::text);
