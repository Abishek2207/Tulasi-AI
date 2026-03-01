-- TulasiAI Row Level Security (RLS)
-- Optimized for Supabase

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE coding_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Chat History: Users can only read/write their own chat
CREATE POLICY "Users can view own chat" ON chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat" ON chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Documents: Users can only see their own docs
CREATE POLICY "Users can view own docs" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own docs" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Notes: Users can only see their own notes
CREATE POLICY "Users can view own notes" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notes" ON notes FOR ALL USING (auth.uid() = user_id);

-- 5. Study Groups: Public groups are readable by all, internal messages by members
CREATE POLICY "Public groups are viewable by all" ON study_groups FOR SELECT USING (is_private = FALSE OR EXISTS (SELECT 1 FROM group_members WHERE group_id = study_groups.id AND user_id = auth.uid()));
CREATE POLICY "Messages viewable by members" ON group_messages FOR SELECT USING (EXISTS (SELECT 1 FROM group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid()));

-- 6. Hackathons: Readable by all, bookmarking by users
CREATE POLICY "Hackathons are viewable by all" ON hackathons FOR SELECT USING (TRUE);

-- 7. Certificates: Publicly viewable by anyone with the ID
CREATE POLICY "Certificates are viewable by all" ON certificates FOR SELECT USING (TRUE);
