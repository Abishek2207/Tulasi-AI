-- ============================================================
-- Tulasi AI — Full Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username    TEXT UNIQUE,
    full_name   TEXT,
    avatar_url  TEXT,
    bio         TEXT DEFAULT '',
    plan        TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    xp          INTEGER DEFAULT 0,
    level       INTEGER DEFAULT 1,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ============================================================
-- 2. STREAKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.streaks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_streak  INTEGER DEFAULT 0,
    longest_streak  INTEGER DEFAULT 0,
    last_checkin    DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.streak_checkins (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date        DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(user_id, date)
);

-- ============================================================
-- 3. NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title       TEXT NOT NULL DEFAULT 'Untitled Note',
    content     TEXT DEFAULT '',
    tags        TEXT[] DEFAULT '{}',
    pinned      BOOLEAN DEFAULT FALSE,
    starred     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON public.notes(user_id, pinned);

-- ============================================================
-- 4. CERTIFICATES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certificates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    issuer          TEXT NOT NULL,
    category        TEXT DEFAULT 'General',
    file_url        TEXT,           -- Cloudflare R2 public URL
    credential_id   TEXT,
    issued_date     DATE,
    uploaded_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certs_user_id ON public.certificates(user_id);

-- ============================================================
-- 5. PROBLEMS SOLVED (Coding Practice)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.problems_solved (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    problem_id      TEXT NOT NULL,          -- LeetCode slug or internal ID
    problem_title   TEXT NOT NULL,
    difficulty      TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    language        TEXT,
    runtime_ms      INTEGER,
    memory_kb       INTEGER,
    solved_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_problems_user_id ON public.problems_solved(user_id);
CREATE INDEX IF NOT EXISTS idx_problems_solved_at ON public.problems_solved(solved_at);

-- ============================================================
-- 6. ROADMAP PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.roadmap_progress (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role        TEXT NOT NULL,          -- e.g. 'ai-ml', 'fullstack', 'data-science'
    task_id     INTEGER NOT NULL,       -- ordinal task index within the roadmap
    task_title  TEXT NOT NULL,
    completed   BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role, task_id)
);

CREATE INDEX IF NOT EXISTS idx_roadmap_user_role ON public.roadmap_progress(user_id, role);

-- ============================================================
-- Row Level Security (RLS) — Users can only access their own data
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems_solved ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Notes
CREATE POLICY "Users manage their own notes" ON public.notes USING (auth.uid() = user_id);

-- Certificates
CREATE POLICY "Users manage their own certs" ON public.certificates USING (auth.uid() = user_id);

-- Streaks
CREATE POLICY "Users manage their own streaks" ON public.streaks USING (auth.uid() = user_id);
CREATE POLICY "Users manage their own checkins" ON public.streak_checkins USING (auth.uid() = user_id);

-- Problems
CREATE POLICY "Users manage their own problems" ON public.problems_solved USING (auth.uid() = user_id);

-- Roadmap
CREATE POLICY "Users manage their own roadmap" ON public.roadmap_progress USING (auth.uid() = user_id);
