-- Security Hardening: Restrict RPC execution of SECURITY DEFINER functions
-- 1. generate_next_job_number(uuid) is only invoked by server-side service_role
REVOKE ALL ON FUNCTION public.generate_next_job_number(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_next_job_number(uuid) TO service_role;

-- 2. Trigger functions should not be callable by anonymous users via PostgREST RPC
REVOKE ALL ON FUNCTION public.fn_assert_job_child_org() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_assert_job_child_org() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.fn_enforce_photo_limit() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_enforce_photo_limit() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.validate_job_lifecycle_transition() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.validate_job_lifecycle_transition() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_user_org_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_org_id() TO authenticated, service_role;
