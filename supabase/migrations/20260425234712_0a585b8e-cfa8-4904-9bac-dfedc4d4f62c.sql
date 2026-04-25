ALTER TABLE public.decisions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.decisions;