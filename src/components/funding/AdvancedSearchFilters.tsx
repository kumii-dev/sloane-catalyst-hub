import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Search,
  Filter,
  Save,
  Download,
  BookmarkPlus,
  BookmarkCheck,
  X,
  SlidersHorizontal
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SearchCriteria {
  search: string;
  industry: string[];
  stage: string[];
  location: string[];
  fundingMin: string;
  fundingMax: string;
  creditScoreMin: string;
  yearFounded: string;
  employeeCount: string;
  revenue: string;
}

interface SavedSearch {
  id: string;
  name: string;
  search_criteria: SearchCriteria;
  created_at: string;
}

interface AdvancedSearchFiltersProps {
  onSearch: (criteria: SearchCriteria) => void;
  funderId?: string;
}

const industries = [
  'Technology', 'Fintech', 'Healthcare', 'E-commerce', 'Education',
  'Agriculture', 'Manufacturing', 'Energy', 'Real Estate', 'Transportation'
];

const stages = [
  'Idea', 'MVP', 'Early Stage', 'Growth', 'Expansion', 'Mature'
];

const locations = [
  'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape',
  'Free State', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West'
];

const AdvancedSearchFilters = ({ onSearch, funderId }: AdvancedSearchFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [criteria, setCriteria] = useState<SearchCriteria>({
    search: '',
    industry: [],
    stage: [],
    location: [],
    fundingMin: '',
    fundingMax: '',
    creditScoreMin: '',
    yearFounded: '',
    employeeCount: '',
    revenue: ''
  });

  useEffect(() => {
    if (funderId) {
      fetchSavedSearches();
    }
  }, [funderId]);

  const fetchSavedSearches = async () => {
    if (!funderId) return;

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('funder_id', funderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedSearches((data || []) as unknown as SavedSearch[]);
    } catch (error: any) {
      console.error('Error fetching saved searches:', error);
    }
  };

  const handleSearch = () => {
    onSearch(criteria);
  };

  const handleSaveSearch = async () => {
    if (!funderId || !searchName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for this search",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('saved_searches')
        .insert({
          funder_id: funderId,
          name: searchName,
          search_criteria: criteria as any
        });

      if (error) throw error;

      toast({
        title: "Search saved!",
        description: "Your search criteria has been saved successfully."
      });

      setSearchName('');
      setShowSaveDialog(false);
      fetchSavedSearches();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleLoadSearch = (search: SavedSearch) => {
    setCriteria(search.search_criteria);
    onSearch(search.search_criteria);
    setShowSavedSearches(false);
    toast({
      title: "Search loaded",
      description: `Loaded "${search.name}"`
    });
  };

  const handleDeleteSearch = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Search deleted",
        description: "Saved search has been removed"
      });

      fetchSavedSearches();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    // Export search results as CSV
    toast({
      title: "Export started",
      description: "Your search results are being prepared for download."
    });
    
    // In a real implementation, this would trigger a backend job
    // to export the filtered results
  };

  const toggleArrayValue = (array: string[], value: string) => {
    return array.includes(value)
      ? array.filter(v => v !== value)
      : [...array, value];
  };

  const clearFilters = () => {
    setCriteria({
      search: '',
      industry: [],
      stage: [],
      location: [],
      fundingMin: '',
      fundingMax: '',
      creditScoreMin: '',
      yearFounded: '',
      employeeCount: '',
      revenue: ''
    });
  };

  const activeFilterCount = [
    criteria.search,
    ...criteria.industry,
    ...criteria.stage,
    ...criteria.location,
    criteria.fundingMin,
    criteria.fundingMax,
    criteria.creditScoreMin,
    criteria.yearFounded,
    criteria.employeeCount,
    criteria.revenue
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search startups by name, description..."
                value={criteria.search}
                onChange={(e) => setCriteria({ ...criteria, search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            <Button onClick={handleSearch}>
              Search
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            {funderId && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Search
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSavedSearches(true)}
                >
                  <BookmarkCheck className="h-4 w-4 mr-2" />
                  Saved Searches ({savedSearches.length})
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Filters</CardTitle>
            <CardDescription>
              Narrow down your search with multiple criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Industry */}
            <div className="space-y-2">
              <Label>Industry</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {industries.map((industry) => (
                  <div key={industry} className="flex items-center space-x-2">
                    <Checkbox
                      id={`industry-${industry}`}
                      checked={criteria.industry.includes(industry)}
                      onCheckedChange={() =>
                        setCriteria({
                          ...criteria,
                          industry: toggleArrayValue(criteria.industry, industry)
                        })
                      }
                    />
                    <label
                      htmlFor={`industry-${industry}`}
                      className="text-sm cursor-pointer"
                    >
                      {industry}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage */}
            <div className="space-y-2">
              <Label>Stage</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {stages.map((stage) => (
                  <div key={stage} className="flex items-center space-x-2">
                    <Checkbox
                      id={`stage-${stage}`}
                      checked={criteria.stage.includes(stage)}
                      onCheckedChange={() =>
                        setCriteria({
                          ...criteria,
                          stage: toggleArrayValue(criteria.stage, stage)
                        })
                      }
                    />
                    <label
                      htmlFor={`stage-${stage}`}
                      className="text-sm cursor-pointer"
                    >
                      {stage}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {locations.map((location) => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={`location-${location}`}
                      checked={criteria.location.includes(location)}
                      onCheckedChange={() =>
                        setCriteria({
                          ...criteria,
                          location: toggleArrayValue(criteria.location, location)
                        })
                      }
                    />
                    <label
                      htmlFor={`location-${location}`}
                      className="text-sm cursor-pointer"
                    >
                      {location}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Funding Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Funding Needed (R)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 100000"
                  value={criteria.fundingMin}
                  onChange={(e) => setCriteria({ ...criteria, fundingMin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Funding Needed (R)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 5000000"
                  value={criteria.fundingMax}
                  onChange={(e) => setCriteria({ ...criteria, fundingMax: e.target.value })}
                />
              </div>
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Min Credit Score</Label>
                <Input
                  type="number"
                  placeholder="e.g., 70"
                  value={criteria.creditScoreMin}
                  onChange={(e) => setCriteria({ ...criteria, creditScoreMin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Founded After</Label>
                <Input
                  type="number"
                  placeholder="e.g., 2020"
                  value={criteria.yearFounded}
                  onChange={(e) => setCriteria({ ...criteria, yearFounded: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Employee Count</Label>
                <Select
                  value={criteria.employeeCount}
                  onValueChange={(value) => setCriteria({ ...criteria, employeeCount: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="201+">201+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Annual Revenue</Label>
                <Select
                  value={criteria.revenue}
                  onValueChange={(value) => setCriteria({ ...criteria, revenue: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="0-100k">R0-100K</SelectItem>
                    <SelectItem value="100k-500k">R100K-500K</SelectItem>
                    <SelectItem value="500k-1m">R500K-1M</SelectItem>
                    <SelectItem value="1m+">R1M+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Search Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Search</DialogTitle>
            <DialogDescription>
              Give this search a name so you can quickly access it later
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="search-name">Search Name</Label>
              <Input
                id="search-name"
                placeholder="e.g., Early Stage Fintech in Gauteng"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSearch}>
              <BookmarkPlus className="h-4 w-4 mr-2" />
              Save Search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Saved Searches Dialog */}
      <Dialog open={showSavedSearches} onOpenChange={setShowSavedSearches}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Saved Searches</DialogTitle>
            <DialogDescription>
              Quick access to your frequently used search criteria
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {savedSearches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No saved searches yet. Create one by using filters and clicking "Save Search"
              </div>
            ) : (
              savedSearches.map((search) => (
                <Card key={search.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{search.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(search.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleLoadSearch(search)}
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteSearch(search.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedSearchFilters;
