import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileCard } from "./FileCard";
import { FileRow } from "./FileRow";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileX } from "lucide-react";

interface FileListProps {
  viewMode: "grid" | "list";
  searchQuery: string;
  selectedFolder: string | null;
}

export function FileList({ viewMode, searchQuery, selectedFolder }: FileListProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, [searchQuery, selectedFolder]);

  const fetchFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (selectedFolder) {
        query = query.eq('folder', selectedFolder);
      }

      if (searchQuery) {
        query = query.ilike('file_name', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      setFiles(files.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  if (loading) {
    return (
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <Alert>
        <FileX className="h-4 w-4" />
        <AlertDescription>
          {searchQuery ? `No files found matching "${searchQuery}"` : selectedFolder ? `No files in folder "${selectedFolder}"` : "No files yet. Upload your first file to get started!"}
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
            onDelete={handleDelete}
            onRefresh={fetchFiles}
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
          onDelete={handleDelete}
          onRefresh={fetchFiles}
        />
      ))}
    </div>
  );
}
