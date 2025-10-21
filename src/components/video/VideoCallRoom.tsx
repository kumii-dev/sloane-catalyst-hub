import { useEffect, useState, useCallback, useRef } from "react";
import { DailyProvider, useDaily, useScreenShare, useLocalSessionId, useParticipantIds } from "@daily-co/daily-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff,
  PhoneOff,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface VideoCallRoomProps {
  sessionId: string;
  roomUrl: string;
  onLeave: () => void;
  userRole: "mentor" | "mentee";
}

const VideoControls = ({ onLeave }: { onLeave: () => void }) => {
  const daily = useDaily();
  const { isSharingScreen, startScreenShare, stopScreenShare } = useScreenShare();
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  const toggleCamera = useCallback(() => {
    if (daily) {
      daily.setLocalVideo(!isCameraOn);
      setIsCameraOn(!isCameraOn);
    }
  }, [daily, isCameraOn]);

  const toggleMic = useCallback(() => {
    if (daily) {
      daily.setLocalAudio(!isMicOn);
      setIsMicOn(!isMicOn);
    }
  }, [daily, isMicOn]);

  const toggleScreenShare = useCallback(() => {
    if (isSharingScreen) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  }, [isSharingScreen, startScreenShare, stopScreenShare]);

  return (
    <div className="flex items-center justify-center gap-2 p-4 bg-card border-t">
      <Button
        variant={isCameraOn ? "default" : "destructive"}
        size="lg"
        onClick={toggleCamera}
      >
        {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </Button>
      
      <Button
        variant={isMicOn ? "default" : "destructive"}
        size="lg"
        onClick={toggleMic}
      >
        {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </Button>
      
      <Button
        variant={isSharingScreen ? "secondary" : "outline"}
        size="lg"
        onClick={toggleScreenShare}
      >
        {isSharingScreen ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
      </Button>
      
      <Button
        variant="destructive"
        size="lg"
        onClick={onLeave}
      >
        <PhoneOff className="w-5 h-5 mr-2" />
        Leave Call
      </Button>
    </div>
  );
};

const VideoTile = ({ sessionId }: { sessionId: string }) => {
  const localSessionId = useLocalSessionId();
  const participantIds = useParticipantIds();

  return (
    <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full p-2">
        {participantIds.map((id) => (
          <div
            key={id}
            className="relative bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center"
          >
            <video
              id={`video-${id}`}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
              {id === localSessionId ? "You" : "Participant"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const VideoCallContent = ({ sessionId, onLeave, userRole }: Omit<VideoCallRoomProps, "roomUrl">) => {
  const daily = useDaily();
  const [isConnecting, setIsConnecting] = useState(true);
  const [sessionJoined, setSessionJoined] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const userInitiatedLeaveRef = useRef(false);

  useEffect(() => {
    if (!daily) return;

    const handleJoined = async () => {
      console.log("Joined video call");
      setIsConnecting(false);
      setSessionJoined(true);
      
      // Update session status to in_progress
      const { error } = await supabase
        .from("mentoring_sessions")
        .update({ 
          session_status: "in_progress",
          session_started_at: new Date().toISOString()
        })
        .eq("id", sessionId);

      if (error) {
        console.error("Failed to update session status:", error);
      }
    };

    const handleLeft = async () => {
      console.log("Left video call, sessionJoined:", sessionJoined, "userInitiated:", userInitiatedLeaveRef.current, "hasError:", hasError);
      
      if (sessionJoined && !hasError && userInitiatedLeaveRef.current) {
        const { error } = await supabase
          .from("mentoring_sessions")
          .update({ 
            session_status: "completed",
            session_completed_at: new Date().toISOString()
          })
          .eq("id", sessionId);

        if (error) {
          console.error("Failed to update session status:", error);
        }

        toast({
          title: "Session Completed",
          description: "Thank you for joining the session!"
        });
      } else {
        console.log("Skipping completion update due to error or non-user leave.");
      }

      navigate(userRole === "mentor" ? "/mentor-dashboard" : "/mentee-dashboard");
    };

    const handleError = (error: any) => {
      console.error("Video call error:", error);
      setHasError(true);
      userInitiatedLeaveRef.current = false;
      toast({
        title: "Connection Error",
        description: "Could not connect to the video call. Please try again or contact support.",
        variant: "destructive"
      });
      setIsConnecting(false);
      
      // Navigate back without marking as completed since session never started or ended due to error
      setTimeout(() => {
        onLeave();
        navigate(userRole === "mentor" ? "/mentor-dashboard" : "/mentee-dashboard");
      }, 2000);
    };

    daily.on("joined-meeting", handleJoined);
    daily.on("left-meeting", handleLeft);
    daily.on("error", handleError);

    return () => {
      daily.off("joined-meeting", handleJoined);
      daily.off("left-meeting", handleLeft);
      daily.off("error", handleError);
    };
  }, [daily, sessionId, sessionJoined, hasError, toast, navigate, userRole, onLeave]);

  const handleLeave = useCallback(async () => {
    userInitiatedLeaveRef.current = true;
    if (daily) {
      await daily.leave();
    }
    onLeave();
  }, [daily, onLeave]);

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Connecting to session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 p-4">
        <Card className="h-full flex flex-col">
          <VideoTile sessionId={sessionId} />
          <VideoControls onLeave={handleLeave} />
        </Card>
      </div>
    </div>
  );
};

export const VideoCallRoom = ({ sessionId, roomUrl, onLeave, userRole }: VideoCallRoomProps) => {
  const [callObject, setCallObject] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initCall = async () => {
      try {
        console.log("Initializing video call with URL:", roomUrl);
        const { default: DailyIframe } = await import("@daily-co/daily-js");
        
        const daily = DailyIframe.createCallObject({
          url: roomUrl,
        });

        console.log("Daily call object created");
        setCallObject(daily);

        console.log("Attempting to join room...");
        await daily.join();
        console.log("Successfully joined room");
      } catch (error) {
        console.error("Failed to initialize video call:", error);
        console.error("Room URL was:", roomUrl);
        console.error("Error details:", JSON.stringify(error, null, 2));
        toast({
          title: "Connection Failed",
          description: "Could not connect to the video call. The video room may not exist or is not properly configured.",
          variant: "destructive"
        });
      }
    };

    initCall();

    return () => {
      if (callObject) {
        callObject.destroy();
      }
    };
  }, [roomUrl, toast]);

  if (!callObject) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Initializing video call...</p>
        </div>
      </div>
    );
  }

  return (
    <DailyProvider callObject={callObject}>
      <VideoCallContent sessionId={sessionId} onLeave={onLeave} userRole={userRole} />
    </DailyProvider>
  );
};
