# Testing Guide

## Overview
This guide covers testing strategies, tools, and best practices for the 22 On Sloane platform.

## Testing Stack

- **Unit & Integration Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Load Tests**: k6
- **Coverage**: v8 (via Vitest)

## Running Tests

### Unit & Integration Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### E2E Tests
```bash
# Run Playwright tests
npx playwright test

# Run in headed mode
npx playwright test --headed

# Run specific test
npx playwright test tests/auth.spec.ts
```

### Load Tests
```bash
# Run k6 load test
k6 run k6-tests/main-load-test.js

# Run specific scenario
k6 run k6-tests/marketplace-flow.js
```

## Test Structure

### Unit Tests
```
src/
├── hooks/
│   └── __tests__/
│       └── useAuth.test.tsx
├── components/
│   └── ui/
│       └── __tests__/
│           └── button.test.tsx
└── utils/
    └── __tests__/
        └── formatters.test.ts
```

### E2E Tests
```
tests/
├── auth.spec.ts
├── marketplace.spec.ts
├── mentorship.spec.ts
└── funding.spec.ts
```

### Load Tests
```
k6-tests/
├── config.js
├── main-load-test.js
├── auth-flow.js
├── marketplace-flow.js
├── mentorship-flow.js
├── funding-application-flow.js
└── credit-assessment-flow.js
```

## Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### Integration Test Example
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ListingDetail } from '@/pages/ListingDetail';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('ListingDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays listing information', async () => {
    const mockListing = {
      id: '123',
      title: 'Test Listing',
      description: 'Test Description',
      base_price: 100,
    };

    // Mock Supabase query
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: mockListing, 
            error: null 
          }),
        }),
      }),
    } as any);

    render(<ListingDetail />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Listing')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test.describe('Marketplace', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can browse listings', async ({ page }) => {
    // Navigate to services
    await page.click('text=Services');
    await expect(page).toHaveURL(/.*services/);

    // Check listings are displayed
    const listings = page.locator('[data-testid="listing-card"]');
    await expect(listings).toHaveCount(await listings.count());
  });

  test('user can view listing details', async ({ page }) => {
    await page.goto('/services');
    
    // Click first listing
    await page.locator('[data-testid="listing-card"]').first().click();
    
    // Check detail page
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Subscribe')).toBeVisible();
  });

  test('authenticated user can subscribe', async ({ page }) => {
    // Login first
    await page.goto('/auth');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('text=Sign In');

    // Navigate and subscribe
    await page.goto('/services');
    await page.locator('[data-testid="listing-card"]').first().click();
    await page.click('text=Subscribe');

    // Fill subscription form
    await page.click('[data-testid="payment-credits"]');
    await page.click('text=Confirm');

    // Verify success
    await expect(page.locator('text=Subscription successful')).toBeVisible();
  });
});
```

### Load Test Example
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from './config.js';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% failure
  },
};

export default function () {
  // Test marketplace browsing
  const response = http.get(
    `${config.supabaseUrl}/rest/v1/listings?select=*&status=eq.active`,
    {
      headers: {
        'apikey': config.supabaseAnonKey,
        'Content-Type': 'application/json',
      },
    }
  );

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'listings returned': (r) => JSON.parse(r.body).length > 0,
  });

  sleep(1);
}
```

## Mocking

### Supabase Client
```typescript
// Mock entire client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

// Mock specific table
vi.mocked(supabase.from).mockReturnValue({
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
  }),
} as any);
```

### Edge Functions
```typescript
// Mock function invoke
vi.mocked(supabase.functions.invoke).mockResolvedValue({
  data: { result: 'success' },
  error: null,
});
```

### React Query
```typescript
// Create test query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
  },
});

// Wrapper component
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);
```

## Test Coverage Goals

### Unit Tests
- **Target**: 80% coverage
- **Priority**:
  - Business logic functions
  - Custom hooks
  - Utility functions
  - Form validation

### Integration Tests
- **Target**: 60% coverage
- **Priority**:
  - API interactions
  - State management
  - User workflows
  - Error scenarios

### E2E Tests
- **Target**: Critical paths
- **Priority**:
  - Authentication flow
  - Marketplace browsing
  - Booking workflow
  - Payment process
  - File upload/download

## Best Practices

### 1. Test Behavior, Not Implementation
```typescript
// ❌ Bad - testing implementation
expect(component.state.isLoading).toBe(true);

// ✅ Good - testing behavior
expect(screen.getByRole('progressbar')).toBeInTheDocument();
```

### 2. Use Data Test IDs Sparingly
```typescript
// Only when necessary for dynamic content
<button data-testid="submit-button">Submit</button>

// Prefer semantic queries
screen.getByRole('button', { name: /submit/i });
```

### 3. Test User Flows, Not Units
```typescript
// ❌ Bad - fragmented
test('clicks button');
test('form submits');
test('shows success');

// ✅ Good - complete flow
test('user can complete booking flow', async () => {
  // ... test entire flow
});
```

### 4. Clean Up After Tests
```typescript
afterEach(() => {
  cleanup(); // React Testing Library
  vi.clearAllMocks(); // Clear mock calls
});
```

### 5. Use Factory Functions for Test Data
```typescript
// Test data factory
const createMockListing = (overrides = {}) => ({
  id: '123',
  title: 'Test Listing',
  description: 'Test Description',
  base_price: 100,
  ...overrides,
});

// Usage
const listing = createMockListing({ base_price: 200 });
```

### 6. Test Error States
```typescript
test('handles error gracefully', async () => {
  // Mock error
  vi.mocked(supabase.from).mockRejectedValue(new Error('Network error'));

  render(<Component />);

  await waitFor(() => {
    expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
  });
});
```

### 7. Async Testing
```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Use findBy for simpler cases
const element = await screen.findByText('Loaded');
expect(element).toBeInTheDocument();
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - run: npx playwright install
      - run: npx playwright test
```

## Performance Testing Guidelines

### Metrics to Track
1. **Response Times**
   - API calls: < 200ms (p95)
   - Page loads: < 2s (p95)
   - Database queries: < 100ms (p95)

2. **Throughput**
   - Requests per second: > 100
   - Concurrent users: > 1000

3. **Error Rates**
   - HTTP errors: < 1%
   - Database errors: < 0.1%

### Load Test Scenarios
1. **Baseline**: Normal traffic patterns
2. **Stress**: 2x normal load
3. **Spike**: Sudden 10x load increase
4. **Soak**: Extended duration at normal load

## Debugging Tests

### Vitest UI
```bash
npm run test:ui
```

### Playwright Debug Mode
```bash
npx playwright test --debug
```

### Screenshot on Failure
```typescript
test('example', async ({ page }) => {
  try {
    // ... test code
  } catch (error) {
    await page.screenshot({ path: 'failure.png' });
    throw error;
  }
});
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [k6 Documentation](https://k6.io/docs/)
