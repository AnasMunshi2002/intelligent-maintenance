CREATE TABLE public.decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repository TEXT NOT NULL,
  finding TEXT NOT NULL,
  decision TEXT NOT NULL,
  confidence NUMERIC,
  fix_suggestion TEXT,
  pr_url TEXT,
  pr_number INTEGER,
  branch_name TEXT,
  execution_status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Decisions are viewable by everyone"
ON public.decisions FOR SELECT USING (true);

CREATE POLICY "Anyone can create decisions"
ON public.decisions FOR INSERT WITH CHECK (true);

CREATE INDEX idx_decisions_created_at ON public.decisions(created_at DESC);
CREATE INDEX idx_decisions_repo ON public.decisions(repository);