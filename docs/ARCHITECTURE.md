# System Architecture

## Overview
This document describes the technical architecture of the 22 On Sloane platform.

## Technology Stack

### Frontend
- **Framework**: React 18.3+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: 
  - TanStack Query (React Query) for server state
  - Jotai for client state
- **Routing**: React Router v6
- **UI Components**: Radix UI primitives + custom components

### Backend
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Edge Functions**: Deno runtime
- **Real-time**: Supabase Realtime

### Third-Party Services
- **Video Calls**: Daily.co
- **Email**: Resend
- **AI/ML**: OpenAI (Copilot features)
- **Text-to-Speech**: ElevenLabs
- **Error Tracking**: Sentry (production)

## Architecture Layers

### 1. Presentation Layer
```
src/
├── components/        # Reusable UI components
│   ├── ui/           # Base UI primitives (shadcn)
│   ├── assessment/   # Credit assessment components
│   ├── booking/      # Mentorship booking components
│   ├── files/        # File management components
│   ├── funding/      # Funding opportunity components
│   ├── messaging/    # Chat/messaging components
│   ├── onboarding/   # User onboarding components
│   ├── services/     # Service listing components
│   └── video/        # Video call components
└── pages/            # Route-level components
```

### 2. Business Logic Layer
```
src/
├── hooks/            # Custom React hooks
│   ├── useAuth.tsx
│   ├── useListings.ts
│   └── use-toast.ts
└── utils/            # Utility functions
```

### 3. Data Layer
```
src/integrations/supabase/
├── client.ts         # Supabase client configuration
└── types.ts          # Auto-generated database types
```

### 4. Backend Layer
```
supabase/
├── functions/        # Edge functions
│   ├── analyze-credit-assessment/
│   ├── copilot-chat/
│   ├── create-daily-room/
│   ├── encrypt-pdf/
│   ├── generate-narration/
│   ├── get-daily-token/
│   ├── send-booking-email/
│   └── send-review-request/
└── migrations/       # Database migrations
```

## Database Design

### Core Tables
- **profiles**: User profiles and persona information
- **user_roles**: Role-based access control
- **mentors**: Mentor-specific data
- **startup_profiles**: Startup company information
- **funders**: Funder organization data
- **service_providers**: Service provider information

### Marketplace
- **listings**: Marketplace listings (services, resources)
- **listing_categories**: Category hierarchy
- **listing_reviews**: User reviews and ratings
- **user_subscriptions**: Subscription management

### Mentorship
- **mentoring_sessions**: Booking and session data
- **mentor_availability**: Mentor schedules
- **mentor_date_overrides**: Schedule exceptions
- **session_reviews**: Session feedback

### Funding
- **funding_opportunities**: Available funding
- **funding_applications**: Application tracking
- **funding_matches**: AI-powered matching
- **credit_assessments**: Financial assessments

### Resources
- **resources**: Educational content
- **resource_categories**: Resource organization
- **resource_progress**: User progress tracking
- **resource_bookmarks**: Saved resources

### Communications
- **conversations**: Chat threads
- **conversation_participants**: Chat members
- **conversation_messages**: Chat messages
- **messages**: System notifications

### Files
- **files**: File metadata
- **file_shares**: File sharing permissions

### Credits System
- **credits_wallet**: User credit balances
- **credits_transactions**: Transaction history

## Security Architecture

### Authentication
- Supabase Auth with email/password
- JWT-based sessions
- Row Level Security (RLS) policies on all tables

### Authorization
- Role-based access control (RBAC)
- Persona-based permissions
- Table-level RLS policies

### Data Protection
- Encrypted file storage
- Secure edge function endpoints
- HTTPS-only communication

## Performance Optimizations

### Frontend
- React Query caching (5-30 min stale times)
- Infinite scroll for large lists
- Code splitting by route
- Image lazy loading
- PWA capabilities

### Backend
- Database indexes on frequently queried columns
- Full-text search with tsvector
- Optimized joins in queries
- Connection pooling

### Caching Strategy
- **Listings**: 5-10 minutes
- **Categories**: 30-60 minutes
- **User profiles**: 5 minutes
- **Static resources**: 1 hour

## Monitoring & Observability

### Error Tracking
- Sentry for frontend errors
- Supabase Edge Function logs
- Database query logs

### Performance Monitoring
- Sentry performance tracing (10% sample rate)
- Session replay (10% sample rate, 100% on error)

### Analytics
- Supabase Analytics for DB performance
- Edge Function invocation metrics
- Auth event logging

## Deployment

### Frontend
- Hosted on Lovable Platform
- Automatic deployments on push
- Preview environments per PR

### Backend
- Supabase managed infrastructure
- Edge Functions auto-deployed
- Database migrations via Supabase CLI

## Scalability Considerations

### Current Capacity
- Supabase Free/Pro tier limits
- Optimized for ~100-1000 concurrent users

### Scaling Strategies
1. **Database**: 
   - Add read replicas
   - Partition large tables
   - Implement caching layer (Redis)

2. **Edge Functions**:
   - Increase memory allocation
   - Implement queue system for background jobs
   - Add rate limiting

3. **Storage**:
   - CDN for static assets
   - Image optimization pipeline
   - Storage bucket sharding

4. **Real-time**:
   - Limit concurrent connections
   - Implement presence throttling
   - Channel-based isolation

## Future Enhancements

### Short Term
- Comprehensive test coverage (>80%)
- API documentation (OpenAPI spec)
- Performance budgets
- Accessibility audit (WCAG 2.1 AA)

### Long Term
- Microservices architecture
- GraphQL API layer
- Multi-region deployment
- Advanced analytics platform
