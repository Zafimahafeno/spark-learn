
CREATE POLICY "Instructors can manage quiz questions" ON public.quiz_questions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    JOIN sections s ON s.id = q.section_id
    JOIN courses c ON c.id = s.course_id
    WHERE q.id = quiz_questions.quiz_id AND c.instructor_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Instructors can manage quiz options" ON public.quiz_options FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM quiz_questions qq
    JOIN quizzes q ON q.id = qq.quiz_id
    JOIN sections s ON s.id = q.section_id
    JOIN courses c ON c.id = s.course_id
    WHERE qq.id = quiz_options.question_id AND c.instructor_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Instructors can manage quizzes" ON public.quizzes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM sections s
    JOIN courses c ON c.id = s.course_id
    WHERE s.id = quizzes.section_id AND c.instructor_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role)
);
