-- ChefConnect Recipe Table Schema for Supabase
-- Execute this in Supabase SQL Editor

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  django_id INTEGER NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  prep_time INTEGER NOT NULL,
  servings INTEGER NOT NULL DEFAULT 4,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category_name VARCHAR(100) NOT NULL,
  category_slug VARCHAR(100) NOT NULL,
  diet_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_type VARCHAR(20) NOT NULL DEFAULT 'house' CHECK (source_type IN ('house', 'chef')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipes_django_id ON recipes(django_id);
CREATE INDEX IF NOT EXISTS idx_recipes_category_slug ON recipes(category_slug);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_source_type ON recipes(source_type);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean setup)
DROP POLICY IF EXISTS "Enable read access for all users" ON recipes;
DROP POLICY IF EXISTS "Enable insert for service role only" ON recipes;
DROP POLICY IF EXISTS "Enable update for service role only" ON recipes;
DROP POLICY IF EXISTS "Enable delete for service role only" ON recipes;

-- Policy: Anyone can read recipes (public access)
CREATE POLICY "Enable read access for all users" ON recipes
  FOR SELECT USING (true);

-- Policy: Only authenticated service role can insert/update/delete
-- (Django backend uses service role credentials)
CREATE POLICY "Enable insert for service role only" ON recipes
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable update for service role only" ON recipes
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Enable delete for service role only" ON recipes
  FOR DELETE USING (auth.role() = 'service_role');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;

-- Trigger to call the update function
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
