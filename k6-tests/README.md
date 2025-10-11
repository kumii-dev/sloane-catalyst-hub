# Kumii Platform - Load Testing Suite

Comprehensive k6 load testing suite for the Kumii eCommerce platform.

## 📋 Prerequisites

1. **Install k6**
   ```bash
   # macOS
   brew install k6

   # Windows (via Chocolatey)
   choco install k6

   # Linux
   sudo gpg -k
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   ```

2. **Create Test Users**
   
   Create 5 test users in your Supabase Auth:
   - `loadtest1@example.com` - `TestPass123!`
   - `loadtest2@example.com` - `TestPass123!`
   - `loadtest3@example.com` - `TestPass123!`
   - `loadtest4@example.com` - `TestPass123!`
   - `loadtest5@example.com` - `TestPass123!`

   For each user, create:
   - Profile record in `profiles` table
   - Startup profile in `startup_profiles` table
   - Credit wallet with 1000 credits in `credits_wallet` table

3. **Create Results Directory**
   ```bash
   mkdir -p k6-results
   ```

## 🚀 Running Tests

### Individual Test Suites

**Authentication Flow**
```bash
k6 run auth-flow.js
```
Tests: Sign in, session validation
Expected: <1s response time, <1% failure rate

**Mentorship Booking Flow**
```bash
k6 run mentorship-flow.js
```
Tests: Browse mentors → View profile → Check availability → Book session → Payment
Expected: <3s booking time, <5% failure rate

**Credit Assessment Flow**
```bash
k6 run credit-assessment-flow.js
```
Tests: Submit assessment → AI analysis → Generate score
Expected: <5s analysis time (includes AI processing)

**Marketplace Browsing**
```bash
k6 run marketplace-flow.js
```
Tests: Browse listings → Search → Filter by category → View details
Expected: <1.5s response time

**Funding Application Flow**
```bash
k6 run funding-application-flow.js
```
Tests: Browse opportunities → View details → Submit application
Expected: <3s application time

### Comprehensive Load Test

**Run Full Suite**
```bash
k6 run main-load-test.js
```

This simulates realistic mixed traffic:
- 40% Marketplace browsing
- 20% Mentorship booking
- 15% Funding opportunities
- 10% Credit assessments
- 15% Public browsing (unauthenticated)

## 📊 Test Scenarios

### Baseline Test (Normal Traffic)
- 10 concurrent users
- 5 minutes duration
- Simulates typical daily load

```bash
k6 run --env SCENARIO=baseline main-load-test.js
```

### Stress Test (Peak Traffic)
- Ramps up to 100 users
- Tests system under high load
- Identifies breaking points

```bash
k6 run --env SCENARIO=stress main-load-test.js
```

### Spike Test (Traffic Surge)
- Sudden jump from 10 to 200 users
- Tests auto-scaling and recovery
- Simulates viral marketing campaign

```bash
k6 run --env SCENARIO=spike main-load-test.js
```

### Soak Test (Stability)
- 20 users for 30 minutes
- Detects memory leaks
- Tests long-running stability

```bash
k6 run --env SCENARIO=soak main-load-test.js
```

## 🎯 Performance Targets

| Metric | Target | Yellow Flag | Red Flag |
|--------|--------|-------------|----------|
| HTTP Success Rate | >99% | <95% | <90% |
| Average Response | <500ms | >1s | >2s |
| P95 Response | <2s | >3s | >5s |
| Booking Flow | <3s | >5s | >10s |
| Assessment Flow | <5s | >8s | >15s |
| Database Queries | <500ms | >1s | >2s |

## 📈 Monitoring Results

### Real-time Monitoring
```bash
k6 run --out json=k6-results/metrics.json main-load-test.js
```

### View Results
Results are saved in `k6-results/`:
- `*-summary.json` - Detailed metrics
- `main-load-test-summary.html` - Visual report

### Key Metrics to Watch

**HTTP Metrics:**
- `http_reqs` - Total requests
- `http_req_duration` - Response times
- `http_req_failed` - Failure rate

**Custom Metrics:**
- `auth_duration` - Authentication time
- `booking_duration` - Booking completion time
- `assessment_duration` - Credit assessment time
- `marketplace_browse_time` - Browse performance
- `application_submission_time` - Funding application time

## 🔧 Configuration

Edit `config.js` to customize:
- Test user credentials
- Load scenarios (VUs, duration, ramp patterns)
- Performance thresholds
- API endpoints

## 🚨 Troubleshooting

### High Failure Rate
1. Check Supabase connection limits (Free tier: 60 connections)
2. Verify test users exist and have proper data
3. Check RLS policies allow test operations
4. Monitor Supabase dashboard for errors

### Slow Response Times
1. Check database indexes on frequently queried columns
2. Monitor edge function cold starts
3. Review N+1 query patterns
4. Check network latency to Supabase

### Edge Function Timeouts
1. Edge functions timeout at 50s
2. Optimize credit assessment AI calls
3. Consider breaking into smaller functions
4. Add retry logic for transient failures

### Database Connection Errors
1. Reduce concurrent VUs
2. Implement connection pooling
3. Add delays between operations
4. Consider Supabase Pro tier for more connections

## 📝 Best Practices

1. **Start Small**: Begin with baseline test, then increase load
2. **Monitor Live**: Watch Supabase dashboard during tests
3. **Clean Data**: Remove test data between runs if needed
4. **Realistic Patterns**: Use actual user behavior patterns
5. **Test in Stages**: Test individual flows before full suite
6. **Document Baselines**: Record performance baselines for comparison

## 🎓 Understanding Results

### Good Performance
```
✓ http_req_duration............: avg=450ms  p(95)=1.2s
✓ http_req_failed..............: 0.5%
✓ booking_duration.............: avg=2.1s   p(95)=2.8s
```

### Needs Optimization
```
⚠ http_req_duration............: avg=1.5s   p(95)=4.2s
⚠ http_req_failed..............: 8%
⚠ booking_duration.............: avg=5.5s   p(95)=12s
```

## 🔗 Resources

- [k6 Documentation](https://k6.io/docs/)
- [Supabase Performance](https://supabase.com/docs/guides/platform/performance)
- [Load Testing Best Practices](https://k6.io/docs/testing-guides/test-types/)

## 🆘 Support

If tests consistently fail or show poor performance:
1. Check the troubleshooting section above
2. Review Supabase logs
3. Monitor database query performance
4. Check edge function logs
5. Consider upgrading Supabase tier for production

---

**Last Updated:** 2025-01-11
**Version:** 1.0.0
