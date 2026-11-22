-- Run AFTER deploying the replacement booking flow, never while the old upload form is live.
-- This preserves all old rows and objects. It closes anonymous/client access only.
-- Review and run manually in the linked Supabase project; deployment does not execute SQL.
BEGIN;

DO $$
BEGIN
  IF to_regclass('public.cases') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY';
    EXECUTE 'REVOKE ALL ON TABLE public.cases FROM anon, authenticated';
    EXECUTE 'DROP POLICY IF EXISTS oncoexperts_legacy_cases_private ON public.cases';
    EXECUTE 'CREATE POLICY oncoexperts_legacy_cases_private ON public.cases AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)';
  END IF;
END $$;

UPDATE storage.buckets SET public = false WHERE id = 'cases';

-- A restrictive policy overrides any permissive policy the old app needed, while
-- leaving all other buckets unchanged. Service-role access stays server-side.
DROP POLICY IF EXISTS oncoexperts_legacy_cases_private ON storage.objects;
CREATE POLICY oncoexperts_legacy_cases_private
  ON storage.objects AS RESTRICTIVE
  FOR ALL TO anon, authenticated
  USING (bucket_id <> 'cases')
  WITH CHECK (bucket_id <> 'cases');

COMMIT;
