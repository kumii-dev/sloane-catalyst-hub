import { supabase } from "@/integrations/supabase/client";

export const generateRoomName = (sessionId: string): string => {
  // Create a unique room name based on session ID
  return `mentorship-session-${sessionId}`;
};

export const createVideoRoom = async (sessionId: string): Promise<string> => {
  // Generate room name
  const roomName = generateRoomName(sessionId);
  
  // Daily.co rooms are created on-demand, we just need to format the URL
  const roomUrl = `https://sloanedigitalhub.daily.co/${roomName}`;
  
  // Update the session with the video room details
  const { error } = await supabase
    .from("mentoring_sessions")
    .update({
      video_room_url: roomUrl,
      video_room_name: roomName
    })
    .eq("id", sessionId);

  if (error) {
    console.error("Failed to update session with video room:", error);
    throw error;
  }

  return roomUrl;
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

  // If room already exists, return it
  if (session.video_room_url) {
    return session.video_room_url;
  }

  // Otherwise, create a new room
  return await createVideoRoom(sessionId);
};

export const canJoinSession = (scheduledAt: string): boolean => {
  const sessionTime = new Date(scheduledAt);
  const now = new Date();
  
  // Allow joining 10 minutes before scheduled time
  const tenMinutesBefore = new Date(sessionTime.getTime() - 10 * 60 * 1000);
  
  // Allow joining up to 2 hours after scheduled time
  const twoHoursAfter = new Date(sessionTime.getTime() + 2 * 60 * 60 * 1000);
  
  return now >= tenMinutesBefore && now <= twoHoursAfter;
};
