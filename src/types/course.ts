export interface Course {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  status: 'draft' | 'published' | 'archived';
  instructor: { id: number; firstname: string; lastname: string; avatarUrl: string; bio: string };
  category: { id: number; name: string; slug: string };
  rating: number;
  reviewCount: number;
  studentCount: number;
  sections: Section[];
  totalLessons: number;
  totalDuration: number;
}

export interface Section {
  id: number;
  title: string;
  sortOrder: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  title: string;
  contentType: 'video' | 'text' | 'document';
  durationMinutes: number;
  isPreview: boolean;
  sortOrder: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  courseCount: number;
  icon: string;
}
