import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SmartContactSelector } from "@/components/messaging/SmartContactSelector";

interface ShareFileDialogProps {
  file: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ShareFileDialog({ file, open, onOpenChange, onSuccess }: ShareFileDialogProps) {
  const { toast } = useToast();
  const [sharing, setSharing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<any>(null);
  const [permission, setPermission] = useState("view");
  const [expiresIn, setExpiresIn] = useState<string | null>(null);
  const [contactSelectorOpen, setContactSelectorOpen] = useState(false);

  const handleShare = async () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user to share with",
        variant: "destructive",
      });
      return;
    }

    setSharing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Calculate expiration date
      let expiresAt = null;
      if (expiresIn) {
        const days = parseInt(expiresIn);
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
      }

      // Create share record
      const { error } = await supabase
        .from('file_shares')
        .insert({
          file_id: file.id,
          shared_by: user.id,
          shared_with: selectedUserId,
          permission,
          expires_at: expiresAt,
        });

      if (error) throw error;

      // Update file is_shared flag
      await supabase
        .from('files')
        .update({ is_shared: true })
        .eq('id', file.id);

      toast({
        title: "Success",
        description: "File shared successfully",
      });

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Sharing failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSharing(false);
    }
  };

  const resetForm = () => {
    setSelectedUserId(null);
    setPermission("view");
    setExpiresIn(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
          <DialogDescription>
            Share "{file.file_name}" with other users
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Selection */}
          <div className="space-y-2">
            <Label>Share with</Label>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              onClick={() => setContactSelectorOpen(true)}
            >
              {selectedUserData ? (
                <span>{selectedUserData.name} ({selectedUserData.email})</span>
              ) : (
                <span className="text-muted-foreground">Select a user...</span>
              )}
            </Button>
          </div>

          {/* Permission Level */}
          <div className="space-y-2">
            <Label>Permission</Label>
            <Select value={permission} onValueChange={setPermission}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View only</SelectItem>
                <SelectItem value="download">View & Download</SelectItem>
                <SelectItem value="edit">View, Download & Edit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expiration */}
          <div className="space-y-2">
            <Label>Access expires in (optional)</Label>
            <Select value={expiresIn || "never"} onValueChange={(v) => setExpiresIn(v === "never" ? null : v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sharing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={!selectedUserId || sharing}
            >
              {sharing ? "Sharing..." : "Share"}
            </Button>
          </div>
        </div>

        {/* Smart Contact Selector Dialog */}
        <SmartContactSelector
          open={contactSelectorOpen}
          onOpenChange={setContactSelectorOpen}
          onSelectContact={(userId, userData) => {
            setSelectedUserId(userId);
            setSelectedUserData(userData);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
