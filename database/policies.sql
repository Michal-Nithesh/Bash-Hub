-- Row Level Security (RLS) Policies for Bash Hub
-- Run this after creating the schema to set up proper data access control

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leetcode_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leetcode_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Timetables policies
CREATE POLICY "Users can view own timetables" ON public.timetables
    FOR SELECT USING (auth.uid() = owner);

CREATE POLICY "Users can insert own timetables" ON public.timetables
    FOR INSERT WITH CHECK (auth.uid() = owner);

CREATE POLICY "Users can update own timetables" ON public.timetables
    FOR UPDATE USING (auth.uid() = owner);

CREATE POLICY "Users can delete own timetables" ON public.timetables
    FOR DELETE USING (auth.uid() = owner);

-- Certificates policies
CREATE POLICY "Public certificates are viewable by everyone" ON public.certificates
    FOR SELECT USING (visibility = 'public' OR auth.uid() = owner);

CREATE POLICY "Users can insert own certificates" ON public.certificates
    FOR INSERT WITH CHECK (auth.uid() = owner);

CREATE POLICY "Users can update own certificates" ON public.certificates
    FOR UPDATE USING (auth.uid() = owner);

CREATE POLICY "Users can delete own certificates" ON public.certificates
    FOR DELETE USING (auth.uid() = owner);

-- Store products policies
CREATE POLICY "Available products are viewable by everyone" ON public.store_products
    FOR SELECT USING (is_available = true OR auth.uid() = seller_id);

CREATE POLICY "Users can insert own products" ON public.store_products
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own products" ON public.store_products
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete own products" ON public.store_products
    FOR DELETE USING (auth.uid() = seller_id);

-- Store favorites policies
CREATE POLICY "Users can view own favorites" ON public.store_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.store_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.store_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Store messages policies
CREATE POLICY "Users can view messages they sent or received" ON public.store_messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.store_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they sent" ON public.store_messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- LeetCode stats policies
CREATE POLICY "LeetCode stats are viewable by everyone" ON public.leetcode_stats
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own LeetCode stats" ON public.leetcode_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own LeetCode stats" ON public.leetcode_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- LeetCode submissions policies
CREATE POLICY "Users can view own submissions" ON public.leetcode_submissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions" ON public.leetcode_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- College rankings policies (read-only for most users)
CREATE POLICY "College rankings are viewable by everyone" ON public.college_rankings
    FOR SELECT USING (true);

-- Events policies
CREATE POLICY "Active events are viewable by everyone" ON public.events
    FOR SELECT USING (is_active = true OR auth.uid() = creator_id);

CREATE POLICY "Users can create events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own events" ON public.events
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own events" ON public.events
    FOR DELETE USING (auth.uid() = creator_id);

-- Event registrations policies
CREATE POLICY "Users can view event registrations for their events" ON public.event_registrations
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT creator_id FROM public.events WHERE id = event_id)
    );

CREATE POLICY "Users can register for events" ON public.event_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own registrations" ON public.event_registrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel own registrations" ON public.event_registrations
    FOR DELETE USING (auth.uid() = user_id);

-- Study groups policies
CREATE POLICY "Public study groups are viewable by everyone" ON public.study_groups
    FOR SELECT USING (is_private = false OR auth.uid() = creator_id OR 
        auth.uid() IN (SELECT user_id FROM public.study_group_members WHERE group_id = id));

CREATE POLICY "Users can create study groups" ON public.study_groups
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own study groups" ON public.study_groups
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own study groups" ON public.study_groups
    FOR DELETE USING (auth.uid() = creator_id);

-- Study group members policies
CREATE POLICY "Group members can view other members" ON public.study_group_members
    FOR SELECT USING (
        auth.uid() = user_id OR
        auth.uid() IN (SELECT creator_id FROM public.study_groups WHERE id = group_id) OR
        auth.uid() IN (SELECT user_id FROM public.study_group_members WHERE group_id = study_group_members.group_id)
    );

CREATE POLICY "Users can join study groups" ON public.study_group_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave study groups" ON public.study_group_members
    FOR DELETE USING (
        auth.uid() = user_id OR
        auth.uid() IN (SELECT creator_id FROM public.study_groups WHERE id = group_id)
    );

-- Function to automatically create LeetCode stats when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_user_leetcode_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.leetcode_username IS NOT NULL THEN
        INSERT INTO public.leetcode_stats (user_id, leetcode_username)
        VALUES (NEW.id, NEW.leetcode_username)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for creating LeetCode stats
CREATE TRIGGER on_profile_leetcode_username_update
    AFTER INSERT OR UPDATE OF leetcode_username ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_leetcode_stats();

-- Function to update profile points when LeetCode stats change
CREATE OR REPLACE FUNCTION public.update_profile_leetcode_points()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET 
        leetcode_points = NEW.total_solved * 10 + NEW.contest_rating,
        total_problems_solved = NEW.total_solved,
        streak_count = NEW.streak_count
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updating profile points
CREATE TRIGGER on_leetcode_stats_update
    AFTER UPDATE ON public.leetcode_stats
    FOR EACH ROW EXECUTE FUNCTION public.update_profile_leetcode_points();

-- Function to update product favorites count
CREATE OR REPLACE FUNCTION public.update_product_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.store_products
        SET favorites_count = favorites_count + 1
        WHERE id = NEW.product_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.store_products
        SET favorites_count = favorites_count - 1
        WHERE id = OLD.product_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for favorites count
CREATE TRIGGER on_store_favorites_insert
    AFTER INSERT ON public.store_favorites
    FOR EACH ROW EXECUTE FUNCTION public.update_product_favorites_count();

CREATE TRIGGER on_store_favorites_delete
    AFTER DELETE ON public.store_favorites
    FOR EACH ROW EXECUTE FUNCTION public.update_product_favorites_count();

-- Function to update study group member count
CREATE OR REPLACE FUNCTION public.update_study_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.study_groups
        SET current_members = current_members + 1
        WHERE id = NEW.group_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.study_groups
        SET current_members = current_members - 1
        WHERE id = OLD.group_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for study group member count
CREATE TRIGGER on_study_group_members_insert
    AFTER INSERT ON public.study_group_members
    FOR EACH ROW EXECUTE FUNCTION public.update_study_group_member_count();

CREATE TRIGGER on_study_group_members_delete
    AFTER DELETE ON public.study_group_members
    FOR EACH ROW EXECUTE FUNCTION public.update_study_group_member_count();