# API Documentation

## Overview
This document describes the API endpoints, database schema, and integration points for the Kumii platform.

## Supabase REST API

All database operations use the Supabase auto-generated REST API with Row Level Security.

### Base URL
```
https://qypazgkngxhazgkuevwq.supabase.co/rest/v1/
```

### Authentication
```typescript
// All requests require Authorization header
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'apikey': process.env.VITE_SUPABASE_PUBLISHABLE_KEY
}
```

## Edge Functions

### 1. Credit Assessment Analysis
**Endpoint**: `POST /functions/v1/analyze-credit-assessment`

**Auth Required**: Yes (JWT)

**Purpose**: AI-powered analysis of credit assessment data

**Request Body**:
```typescript
{
  assessment_id: string;
  assessment_data: {
    financial_data: Record<string, any>;
    business_profile: Record<string, any>;
    governance_data: Record<string, any>;
  };
}
```

**Response**:
```typescript
{
  overall_score: number;
  domain_scores: {
    financial_health_score: number;
    governance_score: number;
    skills_score: number;
    // ... other scores
  };
  risk_band: "low" | "medium" | "high";
  recommendations: string[];
  improvement_areas: string[];
}
```

### 2. Copilot Chat
**Endpoint**: `POST /functions/v1/copilot-chat`

**Auth Required**: No (public endpoint)

**Purpose**: AI chatbot for user assistance

**Request Body**:
```typescript
{
  message: string;
  conversation_history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}
```

**Response**:
```typescript
{
  response: string;
  suggestions?: string[];
}
```

### 3. Daily.co Video Room Management
**Endpoint**: `POST /functions/v1/create-daily-room`

**Auth Required**: Yes (JWT)

**Purpose**: Create video call rooms for mentorship sessions

**Request Body**:
```typescript
{
  session_id: string;
  start_time: string;
  duration_minutes: number;
}
```

**Response**:
```typescript
{
  room_url: string;
  room_name: string;
  token?: string;
}
```

**Endpoint**: `POST /functions/v1/get-daily-token`

**Auth Required**: Yes (JWT)

**Purpose**: Get participant token for video call

**Request Body**:
```typescript
{
  room_name: string;
  user_id: string;
  is_owner: boolean;
}
```

**Response**:
```typescript
{
  token: string;
}
```

### 4. PDF Encryption
**Endpoint**: `POST /functions/v1/encrypt-pdf`

**Auth Required**: Yes (JWT)

**Purpose**: Encrypt sensitive PDF documents

**Request Body**:
```typescript
{
  file_path: string;
  password: string;
}
```

**Response**:
```typescript
{
  encrypted_file_path: string;
}
```

### 5. Email Notifications
**Endpoint**: `POST /functions/v1/send-booking-email`

**Auth Required**: Yes (JWT)

**Purpose**: Send booking confirmation emails

**Request Body**:
```typescript
{
  to: string;
  mentor_name: string;
  mentee_name: string;
  session_date: string;
  session_time: string;
  meeting_link: string;
}
```

**Endpoint**: `POST /functions/v1/send-review-request`

**Auth Required**: Yes (JWT)

**Purpose**: Send review request after session

**Request Body**:
```typescript
{
  to: string;
  session_id: string;
  mentor_name: string;
  session_date: string;
}
```

### 6. Narration Generation
**Endpoint**: `POST /functions/v1/generate-narration`

**Auth Required**: No

**Purpose**: Generate audio narration using ElevenLabs

**Request Body**:
```typescript
{
  text: string;
  voice_id?: string;
}
```

**Response**:
```typescript
{
  audio_url: string;
}
```

## Database Functions

### 1. Role Management
```sql
-- Check if user has specific role
SELECT has_role(user_id, role);

-- Example
SELECT has_role(auth.uid(), 'admin'::app_role);
```

### 2. Credits Management
```sql
-- Add credits to user wallet
SELECT add_credits(
  p_user_id := 'uuid',
  p_amount := 100,
  p_description := 'Bonus credits',
  p_reference_id := NULL
);

-- Deduct credits from user wallet
SELECT deduct_credits(
  p_user_id := 'uuid',
  p_amount := 50,
  p_description := 'Session booking',
  p_reference_id := 'session_uuid'
);
```

### 3. Conversation Management
```sql
-- Create direct conversation between two users
SELECT create_direct_conversation(
  p_user1 := 'uuid_1',
  p_user2 := 'uuid_2',
  p_title := 'Direct conversation'
);
```

### 4. Assessment Access
```sql
-- Check if user owns assessment
SELECT is_assessment_owner(assessment_id, user_id);

-- Check if funder has access to assessment
SELECT has_funder_assessment_access(assessment_id, user_id);
```

### 5. Conversation Participation
```sql
-- Check if user is conversation participant
SELECT is_conversation_participant(conversation_id, user_id);
```

### 6. Mentor Ratings
```sql
-- Recalculate mentor rating after review
SELECT recalculate_mentor_rating(mentor_user_id);
```

## React Query Hooks

### Listings
```typescript
// Paginated listings
const { data, isLoading } = useListings({ 
  status: 'active',
  category_id: 'uuid',
  search: 'query'
}, page);

// Infinite scroll
const { data, fetchNextPage, hasNextPage } = useInfiniteListings({
  status: 'active'
});

// Single listing with relations
const { data: listing } = useListingDetail(id);

// Featured services
const { data: services } = useFeaturedServices();

// Service categories
const { data: categories } = useServiceCategories();
```

### Authentication
```typescript
const { user, session, loading, signOut } = useAuth();
```

## Storage Buckets

### 1. Profile Pictures
- **Bucket**: `profile-pictures`
- **Public**: Yes
- **Policy**: Users can upload/update their own

### 2. Listing Images
- **Bucket**: `listing-images`
- **Public**: Yes
- **Policy**: Providers can upload for their listings

### 3. Assessment Documents
- **Bucket**: `assessment-documents`
- **Public**: No
- **Policy**: Users can access their own documents

### 4. Files
- **Bucket**: `files`
- **Public**: No
- **Policy**: Users can access files they own or files shared with them

## Rate Limits

### Edge Functions
- 100 requests/minute per user (authenticated)
- 20 requests/minute per IP (unauthenticated)

### Database
- Supabase connection pooling limits
- Query timeout: 30 seconds

### Storage
- Upload size limit: 50MB per file
- Total storage per user: Based on Supabase plan

## Error Codes

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `429`: Too Many Requests
- `500`: Internal Server Error

### Custom Error Codes
```typescript
// Authentication errors
AUTH_001: "Invalid credentials"
AUTH_002: "Session expired"
AUTH_003: "Email not verified"

// Permission errors
PERM_001: "Insufficient permissions"
PERM_002: "Resource not accessible"

// Validation errors
VAL_001: "Invalid input data"
VAL_002: "Required field missing"

// Business logic errors
BUS_001: "Insufficient credits"
BUS_002: "Session already booked"
BUS_003: "Mentor unavailable"
```

## Webhook Events

### Supabase Auth Webhooks
- `user.created`: New user registered
- `user.updated`: User profile updated
- `user.deleted`: User account deleted

### Database Webhooks (Future)
- `listing.published`: New listing activated
- `session.completed`: Mentorship session ended
- `payment.completed`: Subscription payment processed

## Integration Examples

### Creating a Mentorship Session
```typescript
// 1. Check mentor availability
const { data: availability } = await supabase
  .from('mentor_availability')
  .select('*')
  .eq('mentor_id', mentorId)
  .eq('day_of_week', dayOfWeek);

// 2. Create Daily.co room
const { data: room } = await supabase.functions.invoke('create-daily-room', {
  body: { session_id, start_time, duration_minutes: 60 }
});

// 3. Create session record
const { data: session } = await supabase
  .from('mentoring_sessions')
  .insert({
    mentor_id: mentorId,
    mentee_id: user.id,
    scheduled_at: startTime,
    session_status: 'scheduled',
    meeting_link: room.room_url
  });

// 4. Deduct credits
await supabase.rpc('deduct_credits', {
  p_user_id: user.id,
  p_amount: sessionCost,
  p_description: 'Mentorship session booking',
  p_reference_id: session.id
});

// 5. Send confirmation email
await supabase.functions.invoke('send-booking-email', {
  body: { ...emailData }
});
```

## Testing

### Mock API Responses
```typescript
// Use Vitest to mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
}));
```

### Load Testing
See `k6-tests/` directory for load testing scripts.

## Best Practices

1. **Always use RLS policies** - Never query tables directly without RLS
2. **Validate input data** - Use Zod schemas for validation
3. **Handle errors gracefully** - Show user-friendly error messages
4. **Cache appropriately** - Use React Query staleTime for better UX
5. **Optimize queries** - Select only needed columns, use indexes
6. **Secure edge functions** - Validate JWT tokens, sanitize inputs
7. **Rate limit** - Implement client-side throttling
8. **Log errors** - Use Sentry for production error tracking
