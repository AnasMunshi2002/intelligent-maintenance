DROP POLICY IF EXISTS "Anyone can create decisions" ON public.decisions;
DROP POLICY IF EXISTS "Decisions are viewable by everyone" ON public.decisions;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.decisions FROM anon;
REVOKE ALL ON public.decisions FROM authenticated;
GRANT ALL ON public.decisions TO service_role;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'decisions'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.decisions';
  END IF;
END $$;