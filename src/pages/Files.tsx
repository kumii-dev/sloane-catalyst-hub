import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Search, Grid, List, FolderPlus } from "lucide-react";
import { FileUploadDialog } from "@/components/files/FileUploadDialog";
import { FileList } from "@/components/files/FileList";
import { SharedFiles } from "@/components/files/SharedFiles";
import { RecentFiles } from "@/components/files/RecentFiles";
import { FileFolders } from "@/components/files/FileFolders";

export default function Files() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  return (
    <Layout showSidebar>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Files</h1>
            <p className="text-muted-foreground">
              Manage your documents, pitch decks, and business files
            </p>
          </div>
          <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload File
          </Button>
        </div>

        {/* Search and View Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Files</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="shared">Shared with Me</TabsTrigger>
            <TabsTrigger value="folders">Folders</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <FileList 
              viewMode={viewMode} 
              searchQuery={searchQuery}
              selectedFolder={selectedFolder}
            />
          </TabsContent>

          <TabsContent value="recent">
            <RecentFiles viewMode={viewMode} searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="shared">
            <SharedFiles viewMode={viewMode} searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="folders">
            <FileFolders 
              onFolderSelect={setSelectedFolder}
              selectedFolder={selectedFolder}
            />
          </TabsContent>
        </Tabs>

        {/* Upload Dialog */}
        <FileUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
        />
      </div>
    </Layout>
  );
}
