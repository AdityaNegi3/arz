/*
  # Concert Ticketing Platform Schema

  ## Overview
  Complete database schema for a neo-noir concert ticketing platform with integrated group chat functionality.

  ## 1. New Tables

  ### `profiles`
  User profile information linked to authentication
  - `id` (uuid, primary key) - References auth.users
  - `email` (text, unique) - User email
  - `full_name` (text) - User's full name
  - `avatar_url` (text, nullable) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp

  ### `events`
  Concert/event information
  - `id` (uuid, primary key) - Unique event identifier
  - `title` (text) - Event name
  - `description` (text) - Event description
  - `artist_lineup` (text array) - List of performing artists
  - `venue` (text) - Event location
  - `event_date` (timestamptz) - Date and time of event
  - `banner_image` (text) - Hero banner image URL
  - `thumbnail_image` (text) - Card thumbnail URL
  - `price` (numeric) - Ticket price
  - `category` (text) - Music genre/category
  - `created_at` (timestamptz) - Record creation timestamp

  ### `tickets`
  Purchased tickets
  - `id` (uuid, primary key) - Unique ticket identifier
  - `user_id` (uuid) - References profiles.id
  - `event_id` (uuid) - References events.id
  - `purchase_date` (timestamptz) - When ticket was purchased
  - `ticket_number` (text, unique) - Human-readable ticket number
  - `status` (text) - Ticket status (active, used, cancelled)

  ### `event_groups`
  Chat groups for each event
  - `id` (uuid, primary key) - Unique group identifier
  - `event_id` (uuid, unique) - References events.id (one group per event)
  - `created_at` (timestamptz) - Group creation timestamp

  ### `group_members`
  Members of event chat groups
  - `id` (uuid, primary key) - Unique membership identifier
  - `group_id` (uuid) - References event_groups.id
  - `user_id` (uuid) - References profiles.id
  - `joined_at` (timestamptz) - When user joined the group
  - Unique constraint on (group_id, user_id)

  ### `messages`
  Chat messages within groups
  - `id` (uuid, primary key) - Unique message identifier
  - `group_id` (uuid) - References event_groups.id
  - `user_id` (uuid) - References profiles.id
  - `content` (text) - Message content
  - `created_at` (timestamptz) - Message timestamp

  ## 2. Security
  Row Level Security (RLS) enabled on all tables with restrictive policies

  ## 3. Functions & Triggers
  - Automatic group creation when first ticket is purchased for an event
  - Automatic group membership when user purchases a ticket
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  artist_lineup text[] NOT NULL DEFAULT '{}',
  venue text NOT NULL,
  event_date timestamptz NOT NULL,
  banner_image text NOT NULL,
  thumbnail_image text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  category text NOT NULL DEFAULT 'Concert',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create event_groups table
CREATE TABLE IF NOT EXISTS event_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid UNIQUE NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE event_groups ENABLE ROW LEVEL SECURITY;

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES event_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  purchase_date timestamptz DEFAULT now(),
  ticket_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'cancelled'))
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES event_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for events
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view events"
  ON events FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for event_groups
CREATE POLICY "Members can view their groups"
  ON event_groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = event_groups.id
      AND group_members.user_id = auth.uid()
    )
  );

-- RLS Policies for group_members
CREATE POLICY "Members can view group membership"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

-- RLS Policies for tickets
CREATE POLICY "Users can view own tickets"
  ON tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can purchase tickets"
  ON tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Members can view group messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_group ON messages(group_id, created_at DESC);

-- Function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || UPPER(SUBSTRING(NEW.id::text, 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_ticket_number ON tickets;
CREATE TRIGGER trigger_generate_ticket_number
  BEFORE INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION generate_ticket_number();

-- Function to create group and add member after ticket purchase
CREATE OR REPLACE FUNCTION handle_ticket_purchase()
RETURNS TRIGGER AS $$
DECLARE
  v_group_id uuid;
BEGIN
  -- Create event group if it doesn't exist
  INSERT INTO event_groups (event_id)
  VALUES (NEW.event_id)
  ON CONFLICT (event_id) DO NOTHING
  RETURNING id INTO v_group_id;

  -- Get group_id if it already existed
  IF v_group_id IS NULL THEN
    SELECT id INTO v_group_id
    FROM event_groups
    WHERE event_id = NEW.event_id;
  END IF;

  -- Add user to group
  INSERT INTO group_members (group_id, user_id)
  VALUES (v_group_id, NEW.user_id)
  ON CONFLICT (group_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically handle group creation and membership
DROP TRIGGER IF EXISTS trigger_ticket_purchase ON tickets;
CREATE TRIGGER trigger_ticket_purchase
  AFTER INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION handle_ticket_purchase();