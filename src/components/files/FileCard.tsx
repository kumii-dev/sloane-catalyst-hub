import { Card, CardContent } from "@/components/ui/card";
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

interface FileCardProps {
  file: any;
  onDelete: (fileId: string, filePath: string) => void;
  onRefresh: () => void;
}

export function FileCard({ file, onDelete, onRefresh }: FileCardProps) {
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
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileIcon className="h-10 w-10 text-primary flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium truncate" title={file.file_name}>
                  {file.file_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.file_size)}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
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

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
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

            {file.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {file.description}
              </p>
            )}

            {file.tags && file.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {file.tags.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {file.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{file.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Uploaded {formatDate(file.created_at)}
            </p>
          </div>
        </CardContent>
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
