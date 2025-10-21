import { supabase } from "@/integrations/supabase/client";

export const generateRoomName = (sessionId: string): string => {
  // Create a unique room name based on session ID
  return `mentorship-session-${sessionId}`;
};

export const createVideoRoom = async (sessionId: string): Promise<string> => {
  console.log("Creating video room via edge function for session:", sessionId);
  
  try {
    // Call edge function to create Daily.co room
    const { data, error } = await supabase.functions.invoke("create-daily-room", {
      body: { sessionId },
    });

    if (error) {
      console.error("Failed to create video room:", error);
      throw error;
    }

    if (!data?.roomUrl) {
      throw new Error("No room URL returned from edge function");
    }

    console.log("Video room created:", data.roomUrl);
    return data.roomUrl;
  } catch (error) {
    console.error("Error creating video room:", error);
    // Remove hardcoded fallback to avoid domain mismatches
    throw error as Error;
  }
};

export const getOrCreateVideoRoom = async (sessionId: string): Promise<string> => {
  // Check if session already has a video room
  const { data: session, error } = await supabase
    .from("mentoring_sessions")
    .select("video_room_url, video_room_name")
    .eq("id", sessionId)
    .single();

  if (error) {
    console.error("Failed to fetch session:", error);
    throw error;
  }

  // If room already exists, validate domain and return it or recreate
  if (session.video_room_url) {
    const existingUrl = session.video_room_url as string;
    // Detect stale domain from previous Daily instance and recreate if needed
    if (/sloanedigitalhub\.daily\.co/i.test(existingUrl)) {
      console.warn("Stale Daily room domain detected. Recreating room for session:", sessionId);
      const newUrl = await createVideoRoom(sessionId);
      return newUrl;
    }
    return existingUrl;
  }

  // Otherwise, create a new room
  return await createVideoRoom(sessionId);
};

export const canJoinSession = (scheduledAt: string): boolean => {
  const sessionTime = new Date(scheduledAt);
  const now = new Date();
  
  // Allow joining 15 minutes before scheduled time
  const fifteenMinutesBefore = new Date(sessionTime.getTime() - 15 * 60 * 1000);
  
  // Allow joining up to 24 hours after scheduled time (for flexibility)
  const twentyFourHoursAfter = new Date(sessionTime.getTime() + 24 * 60 * 60 * 1000);
  
  return now >= fifteenMinutesBefore && now <= twentyFourHoursAfter;
};
