-- Allow authenticated users to insert certificates (for quiz pass)
CREATE POLICY "Users can insert own certificates" ON public.certificates
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow admins and instructors to see enrollments for their courses
CREATE POLICY "Instructors can view enrollments for their courses" ON public.enrollments
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses c 
    WHERE c.id = enrollments.course_id 
    AND (c.instructor_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Allow admins to view all payments
CREATE POLICY "Admins can view all payments" ON public.payments
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
