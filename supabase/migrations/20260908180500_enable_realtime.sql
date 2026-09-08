-- Enable Realtime for jobs, schedules, and job_attendance
ALTER TABLE public.jobs REPLICA IDENTITY FULL;
ALTER TABLE public.schedules REPLICA IDENTITY FULL;
ALTER TABLE public.job_attendance REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_attendance;
