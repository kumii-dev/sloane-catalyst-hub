import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileCard } from "./FileCard";
import { FileRow } from "./FileRow";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Share2 } from "lucide-react";

interface SharedFilesProps {
  viewMode: "grid" | "list";
  searchQuery: string;
}

export function SharedFiles({ viewMode, searchQuery }: SharedFilesProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSharedFiles();
  }, [searchQuery]);

  const fetchSharedFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get files shared with current user
      let query = supabase
        .from('file_shares')
        .select(`
          *,
          files (*)
        `)
        .eq('shared_with', user.id)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const sharedFiles = data?.map((share: any) => share.files).filter(Boolean) || [];
      
      if (searchQuery) {
        const filtered = sharedFiles.filter((file: any) => 
          file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFiles(filtered);
      } else {
        setFiles(sharedFiles);
      }
    } catch (error) {
      console.error('Error fetching shared files:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <Alert>
        <Share2 className="h-4 w-4" />
        <AlertDescription>
          {searchQuery ? `No shared files found matching "${searchQuery}"` : "No files have been shared with you yet."}
        </AlertDescription>
      </Alert>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            onDelete={() => {}}
            onRefresh={fetchSharedFiles}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <FileRow
          key={file.id}
          file={file}
          onDelete={() => {}}
          onRefresh={fetchSharedFiles}
        />
      ))}
    </div>
  );
}
