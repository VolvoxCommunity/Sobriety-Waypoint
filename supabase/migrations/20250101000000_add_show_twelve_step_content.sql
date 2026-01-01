-- Add show_twelve_step_content column to profiles table
-- Default true so existing users continue to see 12-step content
ALTER TABLE profiles
ADD COLUMN show_twelve_step_content BOOLEAN DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN profiles.show_twelve_step_content IS 'Whether to show the 12 Steps tab in navigation. Default true for backwards compatibility.';
