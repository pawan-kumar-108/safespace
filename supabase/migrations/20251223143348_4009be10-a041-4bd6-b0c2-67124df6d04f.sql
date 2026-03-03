-- Create learning articles table
CREATE TABLE public.learning_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  emoji TEXT DEFAULT '📖',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learning_articles ENABLE ROW LEVEL SECURITY;

-- Anyone can view articles
CREATE POLICY "Articles viewable by all"
ON public.learning_articles
FOR SELECT
USING (true);

-- Professionals can create articles
CREATE POLICY "Professionals can create articles"
ON public.learning_articles
FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Authors can update their articles
CREATE POLICY "Authors can update articles"
ON public.learning_articles
FOR UPDATE
USING (auth.uid() = author_id);

-- Authors can delete their articles
CREATE POLICY "Authors can delete articles"
ON public.learning_articles
FOR DELETE
USING (auth.uid() = author_id);

-- Update stories table to allow professionals to insert
DROP POLICY IF EXISTS "Stories viewable by all authenticated" ON public.stories;

CREATE POLICY "Stories viewable by all"
ON public.stories
FOR SELECT
USING (true);

CREATE POLICY "Professionals can create stories"
ON public.stories
FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update stories"
ON public.stories
FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete stories"
ON public.stories
FOR DELETE
USING (auth.uid() = author_id);