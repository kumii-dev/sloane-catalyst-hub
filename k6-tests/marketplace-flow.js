import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend } from 'k6/metrics';
import { config, getRandomUser, getAuthHeaders } from './config.js';

// Custom metrics
const browseTime = new Trend('marketplace_browse_time');
const searchTime = new Trend('marketplace_search_time');

export const options = {
  scenarios: {
    marketplace_browsing: config.scenarios.baseline,
  },
  thresholds: {
    'http_req_duration': ['p(95)<1500'],
    'marketplace_browse_time': ['p(95)<1000'],
  },
};

export default function() {
  let authToken;

  // Authentication
  group('Authentication', function() {
    const user = getRandomUser();
    const signInRes = http.post(
      `${config.supabaseUrl}/auth/v1/token?grant_type=password`,
      JSON.stringify({ email: user.email, password: user.password }),
      { headers: { 'Content-Type': 'application/json', 'apikey': config.supabaseAnonKey } }
    );

    if (signInRes.status === 200) {
      authToken = JSON.parse(signInRes.body).access_token;
    } else {
      return;
    }
  });

  sleep(1);

  // Browse Active Listings
  group('Browse Listings', function() {
    const browseStart = Date.now();
    
    const listingsRes = http.get(
      `${config.supabaseUrl}/rest/v1/listings?select=*,category:listing_categories(*),provider:profiles(first_name,last_name)&status=eq.active&limit=20&order=created_at.desc`,
      { headers: getAuthHeaders(authToken) }
    );

    browseTime.add(Date.now() - browseStart);

    check(listingsRes, {
      'listings loaded': (r) => r.status === 200,
      'has listings': (r) => JSON.parse(r.body).length > 0,
    });
  });

  sleep(2);

  // Browse by Category
  group('Browse by Category', function() {
    // Get categories first
    const categoriesRes = http.get(
      `${config.supabaseUrl}/rest/v1/listing_categories?is_active=eq.true&select=id,name`,
      { headers: getAuthHeaders(authToken) }
    );

    if (categoriesRes.status === 200) {
      const categories = JSON.parse(categoriesRes.body);
      if (categories.length > 0) {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        
        const categoryListingsRes = http.get(
          `${config.supabaseUrl}/rest/v1/listings?category_id=eq.${randomCategory.id}&status=eq.active&select=*`,
          { headers: getAuthHeaders(authToken) }
        );

        check(categoryListingsRes, {
          'category listings loaded': (r) => r.status === 200,
        });
      }
    }
  });

  sleep(1);

  // Search Listings
  group('Search Listings', function() {
    const searchTerms = ['business', 'tech', 'consulting', 'training', 'legal'];
    const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    
    const searchStart = Date.now();
    
    const searchRes = http.get(
      `${config.supabaseUrl}/rest/v1/listings?title=ilike.*${searchTerm}*&status=eq.active&select=*`,
      { headers: getAuthHeaders(authToken) }
    );

    searchTime.add(Date.now() - searchStart);

    check(searchRes, {
      'search completed': (r) => r.status === 200,
    });
  });

  sleep(2);

  // View Listing Detail
  group('View Listing Detail', function() {
    const listingsRes = http.get(
      `${config.supabaseUrl}/rest/v1/listings?status=eq.active&select=id&limit=1`,
      { headers: getAuthHeaders(authToken) }
    );

    if (listingsRes.status === 200) {
      const listings = JSON.parse(listingsRes.body);
      if (listings.length > 0) {
        const listingId = listings[0].id;
        
        const detailRes = http.get(
          `${config.supabaseUrl}/rest/v1/listings?id=eq.${listingId}&select=*,category:listing_categories(*),provider:profiles(*),reviews:listing_reviews(*)`,
          { headers: getAuthHeaders(authToken) }
        );

        check(detailRes, {
          'detail loaded': (r) => r.status === 200,
          'has full details': (r) => {
            const body = JSON.parse(r.body);
            return body.length > 0 && body[0].id !== undefined;
          },
        });
      }
    }
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'k6-results/marketplace-flow-summary.json': JSON.stringify(data),
  };
}
