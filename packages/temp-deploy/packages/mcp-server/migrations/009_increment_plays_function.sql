-- RPC Function for incrementing beat plays
-- Date: 2025-01-12

CREATE OR REPLACE FUNCTION increment_beat_plays(beat_id VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE beats 
  SET plays = COALESCE(plays, 0) + 1,
      updated_at = NOW()
  WHERE beats.beat_id = increment_beat_plays.beat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;