import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileIcon, Download, Trash2, Share2, MoreVertical, FolderIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ShareFileDialog } from "./ShareFileDialog";

interface FileRowProps {
  file: any;
  onDelete: (fileId: string, filePath: string) => void;
  onRefresh: () => void;
}

export function FileRow({ file, onDelete, onRefresh }: FileRowProps) {
  const { toast } = useToast();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "File downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Card className="p-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-4">
          <FileIcon className="h-8 w-8 text-primary flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{file.file_name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatFileSize(file.file_size)}</span>
              <span>•</span>
              <span>{formatDate(file.created_at)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">{file.category.replace('_', ' ')}</Badge>
            {file.folder && (
              <Badge variant="outline" className="gap-1">
                <FolderIcon className="h-3 w-3" />
                {file.folder}
              </Badge>
            )}
            {file.is_shared && (
              <Badge variant="outline" className="gap-1">
                <Share2 className="h-3 w-3" />
                Shared
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShareDialogOpen(true)}>
              <Share2 className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onDelete(file.id, file.file_path)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      <ShareFileDialog
        file={file}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        onSuccess={onRefresh}
      />
    </>
  );
}
