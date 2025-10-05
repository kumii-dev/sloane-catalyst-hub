import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, Plus, Star, MapPin, Clock, Coins } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

interface Listing {
  id: string;
  title: string;
  short_description: string;
  listing_type: string;
  delivery_mode: string;
  base_price: number;
  credits_price: number;
  thumbnail_url: string;
  rating: number;
  total_reviews: number;
  total_subscriptions: number;
  provider: {
    first_name: string;
    last_name: string;
  };
  cohort_tags: string[];
}

const Marketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [listingType, setListingType] = useState("all");
  const [deliveryMode, setDeliveryMode] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [listingType, deliveryMode]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("listings")
        .select(`
          id,
          title,
          short_description,
          listing_type,
          delivery_mode,
          base_price,
          credits_price,
          thumbnail_url,
          rating,
          total_reviews,
          total_subscriptions,
          cohort_visibility,
          profiles!provider_id(first_name, last_name)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (listingType !== "all") {
        query = query.eq("listing_type", listingType);
      }

      if (deliveryMode !== "all") {
        query = query.eq("delivery_mode", deliveryMode);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedListings = data.map((listing: any) => ({
        ...listing,
        provider: listing.profiles,
        cohort_tags: listing.cohort_visibility || []
      }));

      setListings(formattedListings);
    } catch (error: any) {
      toast({
        title: "Error loading listings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = !listing.base_price || 
                        (listing.base_price >= priceRange[0] && listing.base_price <= priceRange[1]);
    return matchesSearch && matchesPrice;
  });

  const getListingTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      software: "💻",
      ancillary: "🛠️",
      mentorship: "👥",
      funding: "💰",
      training: "📚",
      event: "📅",
      other: "📦"
    };
    return icons[type] || "📦";
  };

  const getListingTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      software: "bg-blue-500",
      ancillary: "bg-green-500",
      mentorship: "bg-purple-500",
      funding: "bg-yellow-500",
      training: "bg-pink-500",
      event: "bg-orange-500",
      other: "bg-gray-500"
    };
    return colors[type] || "bg-gray-500";
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Marketplace</h1>
            <p className="text-muted-foreground">
              Discover services, tools, mentorship, and funding opportunities
            </p>
          </div>
          {user && (
            <Button onClick={() => navigate("/listings/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Post a Listing
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-2 block">Listing Type</label>
                <Select value={listingType} onValueChange={setListingType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="ancillary">Ancillary Services</SelectItem>
                    <SelectItem value="mentorship">Mentorship</SelectItem>
                    <SelectItem value="funding">Funding</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="event">Events</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Delivery Mode</label>
                <Select value={deliveryMode} onValueChange={setDeliveryMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Price Range: R{priceRange[0]} - R{priceRange[1]}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={10000}
                  step={100}
                  className="mt-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
          </p>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted" />
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No listings found matching your criteria</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setListingType("all");
                setDeliveryMode("all");
              }} className="mt-4">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card
                key={listing.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/listings/${listing.id}`)}
              >
                {listing.thumbnail_url ? (
                  <img
                    src={listing.thumbnail_url}
                    alt={listing.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center text-6xl">
                    {getListingTypeIcon(listing.listing_type)}
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
                    <Badge className={getListingTypeColor(listing.listing_type)}>
                      {listing.listing_type}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {listing.short_description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="capitalize">{listing.delivery_mode.replace('_', ' ')}</span>
                  </div>

                  {listing.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm font-medium">{listing.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({listing.total_reviews} reviews)
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{listing.total_subscriptions} subscriptions</span>
                  </div>

                  {listing.cohort_tags.length > 0 && (
                    <Badge variant="outline" className="bg-blue-50">
                      🎓 Sponsored Available
                    </Badge>
                  )}
                </CardContent>

                <CardFooter className="flex justify-between items-center border-t pt-4">
                  <div>
                    {listing.base_price ? (
                      <p className="text-lg font-bold">R{listing.base_price.toFixed(2)}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Contact for pricing</p>
                    )}
                    {listing.credits_price && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        {listing.credits_price} credits
                      </p>
                    )}
                  </div>
                  <Button size="sm">View Details</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Marketplace;
