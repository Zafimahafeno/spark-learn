
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _role app_role;
BEGIN
  _role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'student'::app_role
  );
  
  -- Only allow student or instructor from signup
  IF _role NOT IN ('student', 'instructor') THEN
    _role := 'student';
  END IF;

  INSERT INTO public.profiles (id, firstname, lastname)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'firstname', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastname', '')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);
  RETURN NEW;
END;
$$;
