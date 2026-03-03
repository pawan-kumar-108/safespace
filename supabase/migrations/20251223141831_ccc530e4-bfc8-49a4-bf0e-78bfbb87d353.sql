-- Create wellness_exercises table for therapist-added exercises
CREATE TABLE public.wellness_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  icon TEXT DEFAULT '✨',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create direct_messages table for user-therapist communication
CREATE TABLE public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.wellness_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Wellness exercises: viewable by all, editable by author
CREATE POLICY "Exercises viewable by all authenticated" ON public.wellness_exercises
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Professionals can create exercises" ON public.wellness_exercises
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update exercises" ON public.wellness_exercises
  FOR UPDATE TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete exercises" ON public.wellness_exercises
  FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Direct messages: sender and recipient can view
CREATE POLICY "Users can view own messages" ON public.direct_messages
  FOR SELECT TO authenticated 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON public.direct_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update read status" ON public.direct_messages
  FOR UPDATE TO authenticated USING (auth.uid() = recipient_id);

-- Enable realtime for direct messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wellness_exercises;