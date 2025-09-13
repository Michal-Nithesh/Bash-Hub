-- Tasks table for Bash Hub
-- Run this in your Supabase SQL editor to add the tasks functionality

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    period INTEGER CHECK (period >= 1 AND period <= 10), -- Optional: link to timetable period
    points INTEGER DEFAULT 10 CHECK (points >= 0),
    completed BOOLEAN DEFAULT false,
    due_date DATE,
    category TEXT DEFAULT 'personal' CHECK (category IN ('personal', 'academic', 'coding', 'fitness', 'learning', 'project')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS tasks_completed_idx ON public.tasks(completed);

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at_tasks
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to update completed_at when task is marked complete
CREATE OR REPLACE FUNCTION public.handle_task_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed = true AND OLD.completed = false THEN
        NEW.completed_at = TIMEZONE('utc'::text, NOW());
    ELSIF NEW.completed = false AND OLD.completed = true THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for task completion
CREATE TRIGGER handle_task_completion_trigger
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_task_completion();

-- Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tasks table
-- Policy: Users can only see their own tasks
CREATE POLICY "Users can view their own tasks" ON public.tasks
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own tasks
CREATE POLICY "Users can insert their own tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tasks
CREATE POLICY "Users can update their own tasks" ON public.tasks
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own tasks
CREATE POLICY "Users can delete their own tasks" ON public.tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;

-- Insert some sample tasks (replace user_id with actual user IDs)
-- INSERT INTO public.tasks (user_id, title, description, period, points, due_date, category, priority)
-- VALUES 
--     ('user-uuid-here', 'Complete Data Structures Assignment', 'Finish the linked list and tree problems', 3, 25, CURRENT_DATE, 'academic', 'high'),
--     ('user-uuid-here', 'Morning Workout', '30 minutes cardio and strength training', null, 15, CURRENT_DATE, 'fitness', 'medium'),
--     ('user-uuid-here', 'Solve 3 LeetCode Problems', 'Practice dynamic programming problems', 7, 30, CURRENT_DATE, 'coding', 'high'),
--     ('user-uuid-here', 'Read React Documentation', 'Study new React 18 features', null, 10, CURRENT_DATE, 'learning', 'low'),
--     ('user-uuid-here', 'Update Portfolio Website', 'Add new projects and update design', null, 20, CURRENT_DATE, 'project', 'medium'),
--     ('user-uuid-here', 'Plan Weekend Activities', 'Organize weekend schedule with friends', null, 5, CURRENT_DATE, 'personal', 'low');