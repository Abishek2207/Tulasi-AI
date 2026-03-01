-- TulasiAI Custom Functions
-- Optimized for Supabase (PL/pgSQL)

-- 1. Vector Search for RAG
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_chunks.id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) AS similarity
  FROM document_chunks
  WHERE 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 2. Update Streak Daily Logic
CREATE OR REPLACE FUNCTION update_streak(user_id_input UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  last_activity DATE;
BEGIN
  SELECT last_activity_date INTO last_activity FROM streaks WHERE user_id = user_id_input;
  
  IF last_activity IS NULL THEN
    INSERT INTO streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (user_id_input, 1, 1, CURRENT_DATE);
  ELSIF last_activity = CURRENT_DATE THEN
    -- Already updated today
    RETURN;
  ELSIF last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE streaks 
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = user_id_input;
  ELSE
    UPDATE streaks 
    SET current_streak = 1,
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = user_id_input;
  END IF;
END;
$$;

-- 3. Calculate XP Points System
CREATE OR REPLACE FUNCTION calculate_xp(user_id_input UUID, points INTEGER)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE profiles 
  SET xp = xp + points,
      level = FLOOR((xp + points) / 1000) + 1,
      updated_at = NOW()
  WHERE id = user_id_input;
END;
$$;

-- 4. Get Leaderboard rankings
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INT)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  xp INTEGER,
  level INTEGER,
  rank BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    profiles.id,
    profiles.full_name,
    profiles.xp,
    profiles.level,
    RANK() OVER (ORDER BY profiles.xp DESC) as rank
  FROM profiles
  LIMIT limit_count;
END;
$$;
