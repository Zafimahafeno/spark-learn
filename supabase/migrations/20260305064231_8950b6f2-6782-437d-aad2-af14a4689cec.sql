-- Drop old FK to auth.users and add FK to profiles
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_instructor_id_fkey;
ALTER TABLE public.courses ADD CONSTRAINT courses_instructor_id_fkey 
  FOREIGN KEY (instructor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
