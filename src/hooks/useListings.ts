import { useQuery, useInfiniteQuery, UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ITEMS_PER_PAGE = 20;

interface ListingFilters {
  status?: "active" | "draft" | "paused" | "pending_approval" | "rejected";
  category_id?: string;
  search?: string;
  provider_id?: string;
}

// Fetch listings with pagination and filters
export const useListings = (filters: ListingFilters = {}, page: number = 0) => {
  return useQuery({
    queryKey: ['listings', filters, page],
    queryFn: async () => {
      let query = supabase
        .from('listings')
        .select(`
          id,
          title,
          short_description,
          listing_type,
          status,
          thumbnail_url,
          base_price,
          credits_price,
          total_subscriptions,
          created_at,
          rating,
          total_reviews
        `, { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.provider_id) {
        query = query.eq('provider_id', filters.provider_id);
      }
      if (filters.search) {
        query = query.textSearch('search_vector', filters.search);
      }

      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        listings: data || [],
        count: count || 0,
        hasMore: count ? (page + 1) * ITEMS_PER_PAGE < count : false,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Infinite scroll query for marketplace browsing
export const useInfiniteListings = (filters: ListingFilters = {}) => {
  return useInfiniteQuery({
    queryKey: ['listings-infinite', filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('listings')
        .select(`
          id,
          title,
          short_description,
          listing_type,
          status,
          thumbnail_url,
          base_price,
          credits_price,
          total_subscriptions,
          rating,
          total_reviews,
          created_at
        `, { count: 'exact' });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.search) {
        query = query.textSearch('search_vector', filters.search);
      }

      const from = pageParam * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        listings: data || [],
        nextPage: pageParam + 1,
        hasMore: count ? (pageParam + 1) * ITEMS_PER_PAGE < count : false,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextPage : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Fetch single listing with all related data (optimized with joins)
export const useListingDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      if (!id) return null;

      // Fetch listing
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      if (listingError) throw listingError;
      if (!listing) throw new Error('Listing not found');

      // Fetch provider profile
      const { data: provider, error: providerError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('user_id', listing.provider_id)
        .single();

      if (providerError) console.error('Provider fetch error:', providerError);

      // Fetch reviews with user profiles
      const { data: reviews, error: reviewsError } = await supabase
        .from('listing_reviews')
        .select('id, rating, review_text, created_at, user_id')
        .eq('listing_id', id);

      if (reviewsError) console.error('Reviews fetch error:', reviewsError);

      // Fetch user profiles for reviews
      const reviewsWithUsers = reviews && reviews.length > 0 ? await Promise.all(
        reviews.map(async (review) => {
          const { data: user } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', review.user_id)
            .single();
          
          return { ...review, user };
        })
      ) : [];

      return {
        ...listing,
        provider: provider || { id: "", first_name: "", last_name: "", email: "" },
        reviews: reviewsWithUsers
      };
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Fetch featured services with caching
export const useFeaturedServices = () => {
  return useQuery({
    queryKey: ['services', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          id,
          name,
          short_description,
          rating,
          total_reviews,
          total_subscribers,
          pricing_type,
          base_price,
          credits_price,
          is_featured,
          banner_image_url,
          service_providers (
            company_name,
            logo_url,
            is_verified,
            is_cohort_partner
          ),
          service_categories (
            name,
            slug
          )
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(6);

      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Fetch service categories with caching
export const useServiceCategories = () => {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .is('parent_id', null)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - categories change rarely
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};
