-- Content Management and Streaming Schema
-- Phase 3: Content Management + Streaming

-- Upload sessions table for TUS uploads
CREATE TABLE IF NOT EXISTS upload_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tus_upload_id VARCHAR(255),
  tus_upload_url TEXT,
  asset_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'initialized' CHECK (status IN ('initialized', 'uploading', 'processing', 'ready', 'failed')),
  progress INTEGER DEFAULT 0,
  bytes_uploaded BIGINT DEFAULT 0,
  file_info JSONB DEFAULT '{}',
  streaming_urls JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Content moderation enhancements
ALTER TABLE moderation_actions ADD COLUMN IF NOT EXISTS scores JSONB DEFAULT '{}';
ALTER TABLE moderation_actions ADD COLUMN IF NOT EXISTS auto_approved BOOLEAN DEFAULT FALSE;

-- Beat collaboration table
CREATE TABLE IF NOT EXISTS beat_collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  collaborator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'contributor' CHECK (role IN ('owner', 'producer', 'contributor', 'mixer')),
  contribution_percentage DECIMAL(5,2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  invited_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(beat_id, collaborator_id)
);

-- Beat versions for collaboration workflow
CREATE TABLE IF NOT EXISTS beat_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  audio_url TEXT,
  changes_description TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(beat_id, version_number)
);

-- Advanced search index
CREATE TABLE IF NOT EXISTS beat_search_index (
  beat_id UUID PRIMARY KEY REFERENCES beats(id) ON DELETE CASCADE,
  search_vector tsvector,
  tags TEXT[],
  mood VARCHAR(100),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  danceability DECIMAL(3,2) CHECK (danceability BETWEEN 0 AND 1),
  valence DECIMAL(3,2) CHECK (valence BETWEEN 0 AND 1),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_upload_sessions_user_id ON upload_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_status ON upload_sessions(status);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_created_at ON upload_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_beat_collaborations_beat_id ON beat_collaborations(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_collaborations_collaborator ON beat_collaborations(collaborator_id);
CREATE INDEX IF NOT EXISTS idx_beat_collaborations_status ON beat_collaborations(status);

CREATE INDEX IF NOT EXISTS idx_beat_versions_beat_id ON beat_versions(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_versions_created_by ON beat_versions(created_by);
CREATE INDEX IF NOT EXISTS idx_beat_versions_status ON beat_versions(status);

CREATE INDEX IF NOT EXISTS idx_beat_search_vector ON beat_search_index USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_beat_search_tags ON beat_search_index USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_beat_search_mood ON beat_search_index(mood);

-- RLS Policies
ALTER TABLE upload_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE beat_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE beat_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE beat_search_index ENABLE ROW LEVEL SECURITY;

-- Upload sessions policies
CREATE POLICY "Users can manage their own uploads" ON upload_sessions
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Beat collaborations policies
CREATE POLICY "Users can view collaborations they're part of" ON beat_collaborations
  FOR SELECT USING (
    auth.uid()::text = collaborator_id::text OR 
    auth.uid()::text IN (
      SELECT producer_id::text FROM beats WHERE id = beat_id
    )
  );

CREATE POLICY "Beat owners can manage collaborations" ON beat_collaborations
  FOR ALL USING (
    auth.uid()::text IN (
      SELECT producer_id::text FROM beats WHERE id = beat_id
    )
  );

-- Beat versions policies
CREATE POLICY "Collaborators can view beat versions" ON beat_versions
  FOR SELECT USING (
    auth.uid()::text = created_by::text OR
    auth.uid()::text IN (
      SELECT collaborator_id::text FROM beat_collaborations 
      WHERE beat_id = beat_versions.beat_id AND status = 'accepted'
    )
  );

CREATE POLICY "Collaborators can create beat versions" ON beat_versions
  FOR INSERT WITH CHECK (
    auth.uid()::text = created_by::text AND
    auth.uid()::text IN (
      SELECT collaborator_id::text FROM beat_collaborations 
      WHERE beat_id = beat_versions.beat_id AND status = 'accepted'
    )
  );

-- Search index policies
CREATE POLICY "Anyone can search beats" ON beat_search_index
  FOR SELECT USING (true);

-- RPC Functions

-- Get moderation statistics
CREATE OR REPLACE FUNCTION get_moderation_stats(
  time_filter TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  total_reviewed BIGINT,
  auto_approved BIGINT,
  manual_approved BIGINT,
  rejected BIGINT,
  pending_review BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_reviewed,
    COUNT(*) FILTER (WHERE auto_approved = true)::BIGINT as auto_approved,
    COUNT(*) FILTER (WHERE action = 'approved' AND auto_approved = false)::BIGINT as manual_approved,
    COUNT(*) FILTER (WHERE action = 'rejected')::BIGINT as rejected,
    (SELECT COUNT(*)::BIGINT FROM beats WHERE status = 'review_needed') as pending_review
  FROM moderation_actions
  WHERE created_at >= time_filter;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Advanced beat search
CREATE OR REPLACE FUNCTION search_beats(
  search_query TEXT DEFAULT '',
  genre_filter TEXT DEFAULT NULL,
  mood_filter TEXT DEFAULT NULL,
  min_bpm INTEGER DEFAULT NULL,
  max_bpm INTEGER DEFAULT NULL,
  energy_min INTEGER DEFAULT NULL,
  energy_max INTEGER DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  genre VARCHAR,
  bpm INTEGER,
  mood VARCHAR,
  energy_level INTEGER,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.title,
    b.genre,
    b.bpm,
    bsi.mood,
    bsi.energy_level,
    CASE 
      WHEN search_query = '' THEN 1.0
      ELSE ts_rank(bsi.search_vector, plainto_tsquery(search_query))
    END as rank
  FROM beats b
  JOIN beat_search_index bsi ON b.id = bsi.beat_id
  WHERE 
    b.status = 'approved' AND
    (search_query = '' OR bsi.search_vector @@ plainto_tsquery(search_query)) AND
    (genre_filter IS NULL OR b.genre = genre_filter) AND
    (mood_filter IS NULL OR bsi.mood = mood_filter) AND
    (min_bpm IS NULL OR b.bpm >= min_bpm) AND
    (max_bpm IS NULL OR b.bpm <= max_bpm) AND
    (energy_min IS NULL OR bsi.energy_level >= energy_min) AND
    (energy_max IS NULL OR bsi.energy_level <= energy_max)
  ORDER BY rank DESC, b.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update search index function
CREATE OR REPLACE FUNCTION update_beat_search_index()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO beat_search_index (beat_id, search_vector, tags, mood, energy_level)
  VALUES (
    NEW.id,
    to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, '') || ' ' || COALESCE(NEW.genre, '')),
    string_to_array(COALESCE(NEW.tags, ''), ','),
    COALESCE(NEW.mood, 'neutral'),
    COALESCE(NEW.energy_level, 5)
  )
  ON CONFLICT (beat_id) DO UPDATE SET
    search_vector = to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, '') || ' ' || COALESCE(NEW.genre, '')),
    tags = string_to_array(COALESCE(NEW.tags, ''), ','),
    mood = COALESCE(NEW.mood, 'neutral'),
    energy_level = COALESCE(NEW.energy_level, 5),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search index
CREATE TRIGGER update_beat_search_trigger
  AFTER INSERT OR UPDATE ON beats
  FOR EACH ROW EXECUTE FUNCTION update_beat_search_index();

-- Update triggers for timestamps
CREATE TRIGGER update_upload_sessions_updated_at 
  BEFORE UPDATE ON upload_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beat_collaborations_updated_at 
  BEFORE UPDATE ON beat_collaborations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON upload_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON beat_collaborations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON beat_versions TO authenticated;
GRANT SELECT ON beat_search_index TO authenticated;

-- Grant RPC function permissions
GRANT EXECUTE ON FUNCTION get_moderation_stats(TIMESTAMP WITH TIME ZONE) TO authenticated;
GRANT EXECUTE ON FUNCTION search_beats(TEXT, TEXT, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER) TO authenticated;