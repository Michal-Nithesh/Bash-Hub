-- Community Chat Database Schema

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  channel_id TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channels table
CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('subject', 'project', 'general')),
  color TEXT NOT NULL,
  icon TEXT,
  member_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channel members table (for tracking who's in which channel)
CREATE TABLE IF NOT EXISTS channel_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id TEXT REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- User presence table (for online status)
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_id ON channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_channel_id ON channel_members(channel_id);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view messages in channels they're members of" ON messages
  FOR SELECT USING (
    channel_id IN (
      SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in channels they're members of" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    channel_id IN (
      SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (sender_id = auth.uid());

-- RLS Policies for channels
CREATE POLICY "Anyone can view channels" ON channels
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create channels" ON channels
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for channel_members
CREATE POLICY "Users can view channel memberships" ON channel_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join channels" ON channel_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave channels" ON channel_members
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for user_presence
CREATE POLICY "Anyone can view user presence" ON user_presence
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own presence" ON user_presence
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own presence" ON user_presence
  FOR UPDATE USING (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_presence_updated_at
  BEFORE UPDATE ON user_presence
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update channel member count
CREATE OR REPLACE FUNCTION update_channel_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE channels 
    SET member_count = member_count + 1 
    WHERE id = NEW.channel_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE channels 
    SET member_count = member_count - 1 
    WHERE id = OLD.channel_id;
    RETURN OLD;
  END IF;
END;
$$ language 'plpgsql';

-- Trigger to automatically update member count
CREATE TRIGGER update_member_count_trigger
  AFTER INSERT OR DELETE ON channel_members
  FOR EACH ROW EXECUTE FUNCTION update_channel_member_count();

-- Insert default channels
INSERT INTO channels (id, name, description, category, color, icon) VALUES
  ('mathematics', 'Mathematics', 'Discuss math problems, formulas, and concepts', 'subject', 'bg-blue-500', 'calculator'),
  ('physics', 'Physics', 'Share physics theories and experiments', 'subject', 'bg-purple-500', 'atom'),
  ('programming', 'Programming', 'Code together, share solutions', 'subject', 'bg-green-500', 'code'),
  ('chemistry', 'Chemistry', 'Chemical reactions and lab discussions', 'subject', 'bg-yellow-500', 'zap'),
  ('english', 'English', 'Literature, writing, and language help', 'subject', 'bg-red-500', 'book-open'),
  ('art-design', 'Art & Design', 'Creative projects and design critiques', 'subject', 'bg-pink-500', 'palette'),
  ('web-development', 'Web Dev Projects', 'Collaborate on web applications', 'project', 'bg-indigo-500', 'globe'),
  ('mobile-apps', 'Mobile Apps', 'iOS and Android app development', 'project', 'bg-cyan-500', 'graduation-cap'),
  ('research', 'Research Projects', 'Academic research collaboration', 'project', 'bg-orange-500', 'lightbulb'),
  ('general', 'General Discussion', 'General chat for all topics', 'general', 'bg-gray-500', 'message-circle')
ON CONFLICT (id) DO NOTHING;

-- Function to automatically add users to general channel
CREATE OR REPLACE FUNCTION add_user_to_general_channel()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO channel_members (channel_id, user_id)
  VALUES ('general', NEW.id)
  ON CONFLICT (channel_id, user_id) DO NOTHING;
  
  INSERT INTO user_presence (user_id, status)
  VALUES (NEW.id, 'online')
  ON CONFLICT (user_id) DO UPDATE SET
    status = 'online',
    last_seen = NOW(),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to add new users to general channel
CREATE TRIGGER add_user_to_general_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION add_user_to_general_channel();