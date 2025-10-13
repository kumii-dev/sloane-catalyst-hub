import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderIcon, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileFoldersProps {
  onFolderSelect: (folder: string | null) => void;
  selectedFolder: string | null;
}

export function FileFolders({ onFolderSelect, selectedFolder }: FileFoldersProps) {
  const [folders, setFolders] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('files')
        .select('folder')
        .eq('user_id', user.id)
        .not('folder', 'is', null);

      if (error) throw error;

      // Count files per folder
      const folderCounts = (data || []).reduce((acc: any, file: any) => {
        const folder = file.folder;
        acc[folder] = (acc[folder] || 0) + 1;
        return acc;
      }, {});

      const folderList = Object.entries(folderCounts).map(([name, count]) => ({
        name,
        count: count as number,
      }));

      setFolders(folderList);
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <Alert>
        <FolderIcon className="h-4 w-4" />
        <AlertDescription>
          No folders yet. Create folders by specifying them when uploading files.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* All Files */}
      <Card 
        className={`cursor-pointer hover:shadow-md transition-shadow ${!selectedFolder ? 'ring-2 ring-primary' : ''}`}
        onClick={() => onFolderSelect(null)}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FolderIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">All Files</h3>
                <p className="text-sm text-muted-foreground">View all files</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Folders */}
      {folders.map((folder) => (
        <Card
          key={folder.name}
          className={`cursor-pointer hover:shadow-md transition-shadow ${selectedFolder === folder.name ? 'ring-2 ring-primary' : ''}`}
          onClick={() => onFolderSelect(folder.name)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FolderIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{folder.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {folder.count} {folder.count === 1 ? 'file' : 'files'}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
