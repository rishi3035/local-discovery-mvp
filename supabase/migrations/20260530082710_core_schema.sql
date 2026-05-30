-- Enums
CREATE TYPE user_role AS ENUM ('consumer', 'creator', 'business_owner', 'admin');
CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE claim_status AS ENUM ('pending', 'verified', 'rejected');

-- Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role user_role DEFAULT 'consumer',
  trust_badges JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Categories
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Places
CREATE TABLE places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  address TEXT,
  location GEOGRAPHY(POINT, 4326),
  hours JSONB DEFAULT '{}'::jsonb,
  price_range INTEGER CHECK (price_range >= 1 AND price_range <= 4),
  photos TEXT[] DEFAULT '{}',
  accessibility_notes TEXT,
  safety_notes TEXT,
  is_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Guides
CREATE TABLE guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  is_editorial BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Guide Places
CREATE TABLE guide_places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE NOT NULL,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(guide_id, place_id)
);

-- Saves
CREATE TABLE saves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT saves_target_check CHECK (
    (place_id IS NOT NULL AND guide_id IS NULL) OR
    (place_id IS NULL AND guide_id IS NOT NULL)
  )
);

-- Tips
CREATE TABLE tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  freshness_confirmed BOOLEAN DEFAULT false,
  moderation_status moderation_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Business Claims
CREATE TABLE business_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status claim_status DEFAULT 'pending',
  verification_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_claims ENABLE ROW LEVEL SECURITY;

-- Policies

-- Categories: Public Read
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- Places: Public Read
CREATE POLICY "Places are viewable by everyone" ON places FOR SELECT USING (true);

-- Guides: Public Read
CREATE POLICY "Guides are viewable by everyone" ON guides FOR SELECT USING (true);

-- Guide Places: Public Read
CREATE POLICY "Guide places are viewable by everyone" ON guide_places FOR SELECT USING (true);

-- Tips: Public read for approved tips
CREATE POLICY "Approved tips are viewable by everyone" ON tips FOR SELECT USING (moderation_status = 'approved');

-- Profiles: Public read, users can update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Saves: Users can manage their own saves
CREATE POLICY "Users can view their own saves" ON saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own saves" ON saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saves" ON saves FOR DELETE USING (auth.uid() = user_id);

-- Tips: Authenticated users can create tips, users can update/delete their own
CREATE POLICY "Authenticated users can create tips" ON tips FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own tips" ON tips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tips" ON tips FOR DELETE USING (auth.uid() = user_id);

-- Guides management for creators
CREATE POLICY "Creators can manage their own guides" ON guides FOR ALL USING (
  auth.uid() = creator_id AND (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('creator', 'admin'))
  )
);

-- Guide Places management for creators
CREATE POLICY "Creators can manage guide places for their own guides" ON guide_places FOR ALL USING (
  EXISTS (
    SELECT 1 FROM guides
    WHERE guides.id = guide_places.guide_id
    AND guides.creator_id = auth.uid()
  )
);

-- Business Claims: Users can manage their own claims
CREATE POLICY "Users can view their own claims" ON business_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create claims" ON business_claims FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
