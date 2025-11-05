import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  provider: string;
  instructor_name: string | null;
  instructor_title: string | null;
  instructor_bio: string | null;
  instructor_avatar: string | null;
  price: number;
  original_price: number | null;
  duration: string | null;
  level: string | null;
  rating: number;
  students: number;
  thumbnail_url: string | null;
  category: string | null;
  delivery_mode: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  status: string;
  enrolled_at: string;
  completed_at: string | null;
  last_accessed_at: string | null;
  course?: Course;
}

export const useCourses = (filters?: { category?: string; level?: string; featured?: boolean }) => {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: async () => {
      let query = supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.level) {
        query = query.eq("level", filters.level);
      }
      if (filters?.featured) {
        query = query.eq("is_featured", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Course[];
    },
  });
};

export const useCourse = (slug: string) => {
  return useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, course_modules(*)")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
};

export const useEnrollment = (courseId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["enrollment", courseId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as CourseEnrollment | null;
    },
    enabled: !!user && !!courseId,
  });
};

export const useMyEnrollments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-enrollments", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("course_enrollments")
        .select("*, course:courses(*)")
        .eq("user_id", user.id)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;
      return data as CourseEnrollment[];
    },
    enabled: !!user,
  });
};

export const useEnrollInCourse = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error("User must be logged in to enroll");

      const { data, error } = await supabase
        .from("course_enrollments")
        .insert({
          user_id: user.id,
          course_id: courseId,
          progress: 0,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ["enrollment", courseId] });
      queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
      toast.success("Successfully enrolled in course!");
    },
    onError: (error: any) => {
      if (error.message.includes("duplicate key")) {
        toast.error("You are already enrolled in this course");
      } else {
        toast.error("Failed to enroll in course");
      }
    },
  });
};

export const useCourseSessions = (courseId: string) => {
  return useQuery({
    queryKey: ["course-sessions", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_sessions")
        .select("*")
        .eq("course_id", courseId)
        .gte("session_date", new Date().toISOString())
        .order("session_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
};

export const useRegisterForSession = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!user) throw new Error("User must be logged in to register");

      const { data, error } = await supabase
        .from("session_registrations")
        .insert({
          user_id: user.id,
          session_id: sessionId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-sessions"] });
      toast.success("Successfully registered for live session!");
    },
    onError: (error: any) => {
      if (error.message.includes("duplicate key")) {
        toast.error("You are already registered for this session");
      } else {
        toast.error("Failed to register for session");
      }
    },
  });
};
