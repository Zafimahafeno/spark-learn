
-- 1. ENUM TYPES
CREATE TYPE public.app_role AS ENUM ('student', 'instructor', 'admin');
CREATE TYPE public.course_level AS ENUM ('beginner', 'intermediate', 'advanced', 'all');
CREATE TYPE public.course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.content_type AS ENUM ('video', 'text', 'document');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'refunded');

-- 2. PROFILES (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  firstname VARCHAR(50),
  lastname VARCHAR(50),
  bio TEXT,
  avatar_url VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. USER ROLES (separate table for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'student',
  UNIQUE(user_id, role)
);

-- 4. CATEGORIES
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(10) DEFAULT '📚',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. COURSES
CREATE TABLE public.courses (
  id SERIAL PRIMARY KEY,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  price DECIMAL(10, 2) DEFAULT 0.00,
  thumbnail_url VARCHAR(255),
  level course_level DEFAULT 'beginner',
  status course_status DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. SECTIONS
CREATE TABLE public.sections (
  id SERIAL PRIMARY KEY,
  course_id INT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0
);

-- 7. LESSONS
CREATE TABLE public.lessons (
  id SERIAL PRIMARY KEY,
  section_id INT NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content_type content_type NOT NULL DEFAULT 'video',
  video_url VARCHAR(255),
  text_content TEXT,
  document_url VARCHAR(255),
  duration_minutes INT DEFAULT 0,
  is_preview BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0
);

-- 8. ENROLLMENTS
CREATE TABLE public.enrollments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id INT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_accessed TIMESTAMPTZ DEFAULT now(),
  progress_percent INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, course_id)
);

-- 9. LESSON COMPLETIONS
CREATE TABLE public.lesson_completions (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id INT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

-- 10. QUIZZES
CREATE TABLE public.quizzes (
  id SERIAL PRIMARY KEY,
  section_id INT REFERENCES public.sections(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  passing_percentage INT DEFAULT 70
);

CREATE TABLE public.quiz_questions (
  id SERIAL PRIMARY KEY,
  quiz_id INT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL
);

CREATE TABLE public.quiz_options (
  id SERIAL PRIMARY KEY,
  question_id INT NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE
);

CREATE TABLE public.quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id INT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INT,
  passed BOOLEAN,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. COUPONS
CREATE TABLE public.coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percent INT,
  expiry_date DATE,
  active BOOLEAN DEFAULT TRUE
);

-- 12. PAYMENTS
CREATE TABLE public.payments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  course_id INT NOT NULL REFERENCES public.courses(id),
  amount_paid DECIMAL(10, 2),
  transaction_id VARCHAR(100) UNIQUE,
  payment_method VARCHAR(50),
  status payment_status DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. CERTIFICATES
CREATE TABLE public.certificates (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  course_id INT NOT NULL REFERENCES public.courses(id),
  verify_code VARCHAR(100) UNIQUE NOT NULL,
  issue_date TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. REVIEWS
CREATE TABLE public.reviews (
  id SERIAL PRIMARY KEY,
  course_id INT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. CART
CREATE TABLE public.cart_items (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id INT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- ========== SECURITY DEFINER FUNCTIONS ==========

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- ========== TRIGGERS ==========

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, firstname, lastname)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'firstname', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastname', '')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== RLS POLICIES ==========

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- USER ROLES
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- CATEGORIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- COURSES
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published courses are viewable by everyone" ON public.courses FOR SELECT USING (status = 'published' OR instructor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Instructors can create courses" ON public.courses FOR INSERT WITH CHECK (auth.uid() = instructor_id AND public.has_role(auth.uid(), 'instructor'));
CREATE POLICY "Instructors can update own courses" ON public.courses FOR UPDATE USING (auth.uid() = instructor_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete courses" ON public.courses FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- SECTIONS
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sections are viewable by everyone" ON public.sections FOR SELECT USING (true);
CREATE POLICY "Instructors can manage sections" ON public.sections FOR ALL USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- LESSONS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lessons are viewable by everyone" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Instructors can manage lessons" ON public.lessons FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.sections s
    JOIN public.courses c ON c.id = s.course_id
    WHERE s.id = section_id AND c.instructor_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- ENROLLMENTS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can enroll themselves" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollment" ON public.enrollments FOR UPDATE USING (auth.uid() = user_id);

-- LESSON COMPLETIONS
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own completions" ON public.lesson_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can mark lessons complete" ON public.lesson_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- QUIZZES
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quizzes are viewable by everyone" ON public.quizzes FOR SELECT USING (true);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quiz questions are viewable by everyone" ON public.quiz_questions FOR SELECT USING (true);

ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quiz options are viewable by everyone" ON public.quiz_options FOR SELECT USING (true);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- COUPONS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active coupons viewable by authenticated" ON public.coupons FOR SELECT TO authenticated USING (active = true);
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- PAYMENTS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CERTIFICATES
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Certificates verifiable by code" ON public.certificates FOR SELECT USING (true);

-- REVIEWS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Enrolled users can create reviews" ON public.reviews FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.enrollments WHERE user_id = auth.uid() AND course_id = reviews.course_id
  )
);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- CART
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to cart" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from cart" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- ========== SEED DATA: CATEGORIES ==========
INSERT INTO public.categories (name, slug, icon) VALUES
  ('Développement Web', 'dev-web', '💻'),
  ('Data Science', 'data-science', '📊'),
  ('Design', 'design', '🎨'),
  ('Marketing Digital', 'marketing', '📈'),
  ('Intelligence Artificielle', 'ia', '🤖'),
  ('Cybersécurité', 'cybersecurite', '🔒');
