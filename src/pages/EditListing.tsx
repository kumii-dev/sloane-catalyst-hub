import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  thumbnail: z.any().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

const EditListing = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [existingThumbnail, setExistingThumbnail] = useState<string | null>(null);

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      listing_type: "software",
      delivery_mode: "online",
      is_subscription: false,
      visible_to_all: true,
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (id) {
      fetchListing();
    }
  }, [user, id]);

  const fetchListing = async () => {
    if (!id || !user) return;

    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .eq("provider_id", user.id)
        .single();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Listing not found",
          description: "The listing you're trying to edit doesn't exist or you don't have permission to edit it.",
          variant: "destructive",
        });
        navigate("/my-listings");
        return;
      }

      // Set form values
      form.reset({
        title: data.title,
        short_description: data.short_description || "",
        description: data.description,
        listing_type: data.listing_type,
        delivery_mode: data.delivery_mode,
        base_price: data.base_price?.toString() || "",
        credits_price: data.credits_price?.toString() || "",
        is_subscription: data.is_subscription || false,
        subscription_duration_days: data.subscription_duration_days?.toString() || "",
        capacity: data.capacity?.toString() || "",
        visible_to_all: data.visible_to_all ?? true,
        tags: data.tags?.join(", ") || "",
      });

      if (data.thumbnail_url) {
        setExistingThumbnail(data.thumbnail_url);
        setThumbnailPreview(data.thumbnail_url);
      }
    } catch (error: any) {
      console.error("Error fetching listing:", error);
      toast({
        title: "Error loading listing",
        description: error.message,
        variant: "destructive",
      });
      navigate("/my-listings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setThumbnailFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview(existingThumbnail);
    }
  };

  const onSubmit = async (data: ListingFormData) => {
    if (!user || !id) return;

    setIsSubmitting(true);

    try {
      // Upload new thumbnail if provided
      let thumbnail_url = existingThumbnail;
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

      // Update listing
      const { error } = await supabase
        .from("listings")
        .update({
          title: data.title,
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
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("provider_id", user.id);

      if (error) throw error;

      toast({
        title: "Listing updated successfully",
        description: "Your changes have been saved.",
      });

      navigate("/my-listings");
    } catch (error: any) {
      toast({
        title: "Error updating listing",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/my-listings")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Listings
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit Listing</CardTitle>
            <CardDescription>
              Update your marketplace listing information
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
                          <Input placeholder="E.g., Advanced Bookkeeping Software" {...field} />
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
                          <Textarea 
                            placeholder="A brief summary (shown in listing cards)"
                            className="h-20"
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
                            placeholder="Detailed description of your offering"
                            className="h-40"
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
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="software">Software</SelectItem>
                              <SelectItem value="ancillary">Ancillary Service</SelectItem>
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
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select mode" />
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

                  <div>
                    <FormLabel>Thumbnail Image</FormLabel>
                    <div className="mt-2 space-y-4">
                      {thumbnailPreview && (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden">
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("thumbnail")?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {existingThumbnail ? "Change Image" : "Upload Image"}
                        </Button>
                        <Input
                          id="thumbnail"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleThumbnailChange}
                        />
                      </div>
                    </div>
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
                          <FormDescription>Leave empty if free</FormDescription>
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
                          <FormDescription>Alternative pricing in credits</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="is_subscription"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Subscription Based</FormLabel>
                          <FormDescription>
                            Is this a recurring subscription service?
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
                          <Input type="number" placeholder="Unlimited if empty" {...field} />
                        </FormControl>
                        <FormDescription>Maximum number of users/subscribers</FormDescription>
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
                          <Input placeholder="e.g., accounting, fintech, automation" {...field} />
                        </FormControl>
                        <FormDescription>Comma-separated tags for better discoverability</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="visible_to_all"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Public Visibility</FormLabel>
                          <FormDescription>
                            Make this listing visible to all users
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

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Listing"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/my-listings")}
                  >
                    Cancel
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

export default EditListing;
