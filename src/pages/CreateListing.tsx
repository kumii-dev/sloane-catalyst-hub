import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";

const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  short_description: z.string().min(20, "Short description must be at least 20 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  listing_type: z.enum(["software", "ancillary", "mentorship", "funding", "training", "event", "other"]),
  delivery_mode: z.enum(["online", "in_person", "hybrid"]),
  base_price: z.string().optional(),
  credits_price: z.string().optional(),
  is_subscription: z.boolean().default(false),
  subscription_duration_days: z.string().optional(),
  capacity: z.string().optional(),
  visible_to_all: z.boolean().default(true),
  tags: z.string().optional(),
  thumbnail: z.any().refine((file) => file !== null, "Thumbnail image is required"),
});

type ListingFormData = z.infer<typeof listingSchema>;

const CreateListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [checkingProvider, setCheckingProvider] = useState(true);
  const [isApprovedProvider, setIsApprovedProvider] = useState(false);

  useEffect(() => {
    if (user) {
      checkProviderStatus();
    } else {
      navigate("/auth");
    }
  }, [user]);

  const checkProviderStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("service_providers")
        .select("vetting_status")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setIsApprovedProvider(false);
      } else {
        setIsApprovedProvider(data.vetting_status === "approved");
      }
    } catch (error) {
      console.error("Error checking provider status:", error);
      setIsApprovedProvider(false);
    } finally {
      setCheckingProvider(false);
    }
  };

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      listing_type: "software",
      delivery_mode: "online",
      is_subscription: false,
      visible_to_all: true,
      thumbnail: null,
    },
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setThumbnailFile(file);
    form.setValue("thumbnail", file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview(null);
    }
  };

  const onSubmit = async (data: ListingFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a listing",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // Check if listing type is software and user is not an approved provider
    if (data.listing_type === "software" && !isApprovedProvider) {
      toast({
        title: "Provider approval required",
        description: "You must be an approved software provider to list software services",
        variant: "destructive",
      });
      navigate("/become-provider");
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate unique slug from title with timestamp
      const baseSlug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const slug = `${baseSlug}-${Date.now()}`;

      // Upload thumbnail if provided
      let thumbnail_url = null;
      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(fileName, thumbnailFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(fileName);

        thumbnail_url = urlData.publicUrl;
      }

      // Create listing (auto-approved)
      const { error } = await supabase.from("listings").insert({
        provider_id: user.id,
        title: data.title,
        slug,
        short_description: data.short_description,
        description: data.description,
        listing_type: data.listing_type,
        delivery_mode: data.delivery_mode,
        base_price: data.base_price ? parseFloat(data.base_price) : null,
        credits_price: data.credits_price ? parseInt(data.credits_price) : null,
        is_subscription: data.is_subscription,
        subscription_duration_days: data.subscription_duration_days
          ? parseInt(data.subscription_duration_days)
          : null,
        capacity: data.capacity ? parseInt(data.capacity) : null,
        visible_to_all: data.visible_to_all,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
        thumbnail_url,
        status: "active",
        approved_at: new Date().toISOString(),
        approved_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Listing created successfully",
        description: "Your listing is now live on the marketplace",
      });

      navigate("/my-listings");
    } catch (error: any) {
      toast({
        title: "Error creating listing",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingProvider) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Create New Listing</CardTitle>
            <CardDescription>
              List your services, products, or opportunities on the Kumii marketplace
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., AWS Cloud Credits Package" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="short_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief summary (appears in listing cards)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed description of your listing"
                            rows={6}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="listing_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Listing Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="software">Software</SelectItem>
                              <SelectItem value="ancillary">Ancillary Services</SelectItem>
                              <SelectItem value="mentorship">Mentorship</SelectItem>
                              <SelectItem value="funding">Funding</SelectItem>
                              <SelectItem value="training">Training</SelectItem>
                              <SelectItem value="event">Event</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="delivery_mode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Mode *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="online">Online</SelectItem>
                              <SelectItem value="in_person">In Person</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pricing</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="base_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Price (ZAR)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormDescription>Leave empty for contact-based pricing</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="credits_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Credits Price</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormDescription>Cost in Kumii Credits</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="is_subscription"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Subscription Service</FormLabel>
                          <FormDescription>
                            This is a recurring subscription service
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("is_subscription") && (
                    <FormField
                      control={form.control}
                      name="subscription_duration_days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subscription Duration (days)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Additional Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Settings</h3>

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Unlimited" {...field} />
                        </FormControl>
                        <FormDescription>Maximum number of subscribers</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="cloud, aws, credits (comma-separated)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="thumbnail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thumbnail Image *</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                                className="cursor-pointer"
                              />
                              <Upload className="w-5 h-5 text-muted-foreground" />
                            </div>
                            {thumbnailPreview && (
                              <div className="relative w-full max-w-sm rounded-lg overflow-hidden border">
                                <img
                                  src={thumbnailPreview}
                                  alt="Thumbnail preview"
                                  className="w-full h-48 object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload a clear image that represents your listing (max 5MB)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="visible_to_all"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Visible to All Users</FormLabel>
                          <FormDescription>
                            Make this listing visible to all marketplace users
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4 justify-end pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Listing
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateListing;
