-- Create database performance monitoring functions (corrected)

-- =====================================================
-- 1. DATABASE STATISTICS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_database_stats()
RETURNS TABLE(
  stat_name TEXT,
  stat_value TEXT,
  category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'Database Size'::TEXT, pg_size_pretty(pg_database_size(current_database())), 'size'::TEXT
  UNION ALL
  SELECT 'Active Connections', (SELECT count(*)::TEXT FROM pg_stat_activity WHERE state = 'active'), 'connections'
  UNION ALL
  SELECT 'Idle Connections', (SELECT count(*)::TEXT FROM pg_stat_activity WHERE state = 'idle'), 'connections'
  UNION ALL
  SELECT 'Total Tables', (SELECT count(*)::TEXT FROM information_schema.tables WHERE table_schema = 'public'), 'objects'
  UNION ALL
  SELECT 'Total Indexes', (SELECT count(*)::TEXT FROM pg_indexes WHERE schemaname = 'public'), 'objects'
  UNION ALL
  SELECT 'Cache Hit Ratio', 
    (SELECT coalesce(round(100.0 * sum(blks_hit) / nullif(sum(blks_hit) + sum(blks_read), 0), 2)::TEXT || '%', '0%')
     FROM pg_stat_database WHERE datname = current_database()), 'performance'
  UNION ALL
  SELECT 'Transactions Committed',
    (SELECT coalesce(sum(xact_commit)::TEXT, '0') FROM pg_stat_database WHERE datname = current_database()), 'transactions'
  UNION ALL
  SELECT 'Transactions Rolled Back',
    (SELECT coalesce(sum(xact_rollback)::TEXT, '0') FROM pg_stat_database WHERE datname = current_database()), 'transactions';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 2. TABLE STATISTICS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_table_statistics()
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  total_size TEXT,
  table_size TEXT,
  indexes_size TEXT,
  live_rows BIGINT,
  dead_rows BIGINT,
  last_vacuum TIMESTAMP,
  last_analyze TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    schemaname::TEXT,
    relname::TEXT,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)),
    pg_size_pretty(pg_relation_size(schemaname||'.'||relname)),
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname) - pg_relation_size(schemaname||'.'||relname)),
    n_live_tup,
    n_dead_tup,
    last_vacuum,
    last_analyze
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||relname) DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 3. INDEX USAGE FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_index_usage()
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  index_name TEXT,
  index_size TEXT,
  scans BIGINT,
  tuples_read BIGINT,
  usage_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    schemaname::TEXT,
    relname::TEXT,
    indexrelname::TEXT,
    pg_size_pretty(pg_relation_size(indexrelid)),
    idx_scan,
    idx_tup_read,
    CASE 
      WHEN idx_scan = 0 THEN 'UNUSED'
      WHEN idx_scan < 50 THEN 'LOW USAGE'
      ELSE 'ACTIVE'
    END::TEXT
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
  ORDER BY idx_scan ASC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 4. TABLE BLOAT FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_table_bloat()
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  bloat_pct NUMERIC,
  bloat_size TEXT,
  recommendation TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    schemaname::TEXT,
    relname::TEXT,
    CASE 
      WHEN n_live_tup > 0 THEN 
        round(100.0 * n_dead_tup / (n_live_tup + n_dead_tup), 2)
      ELSE 0
    END,
    pg_size_pretty((n_dead_tup * 100)::bigint),
    CASE
      WHEN n_dead_tup > 1000 AND n_live_tup > 0 AND 
           (n_dead_tup::float / (n_live_tup + n_dead_tup)) > 0.2 
      THEN 'VACUUM RECOMMENDED'
      WHEN n_dead_tup > 10000 THEN 'VACUUM URGENT'
      ELSE 'OK'
    END::TEXT
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY n_dead_tup DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 5. PARTITION STATISTICS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_partition_stats()
RETURNS TABLE(
  partition_name TEXT,
  row_count BIGINT,
  table_size TEXT,
  last_vacuum TIMESTAMP,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.relname::TEXT,
    s.n_live_tup,
    pg_size_pretty(pg_relation_size(c.oid)),
    s.last_autovacuum,
    CASE
      WHEN s.n_dead_tup > 1000 THEN 'NEEDS VACUUM'
      WHEN s.n_live_tup = 0 THEN 'EMPTY'
      ELSE 'HEALTHY'
    END::TEXT
  FROM pg_class c
  JOIN pg_stat_user_tables s ON c.relname = s.relname
  WHERE c.relispartition = true
    AND s.schemaname = 'public'
  ORDER BY s.n_live_tup DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 6. ACTIVE QUERIES FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_active_queries()
RETURNS TABLE(
  pid INTEGER,
  duration_seconds INTEGER,
  query_text TEXT,
  state TEXT,
  wait_event TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pg_stat_activity.pid::INTEGER,
    extract(epoch from (now() - pg_stat_activity.query_start))::INTEGER,
    left(pg_stat_activity.query, 200)::TEXT,
    pg_stat_activity.state::TEXT,
    coalesce(pg_stat_activity.wait_event, 'none')::TEXT
  FROM pg_stat_activity
  WHERE pg_stat_activity.state != 'idle'
    AND pg_stat_activity.query NOT LIKE '%pg_stat_activity%'
    AND pg_stat_activity.pid != pg_backend_pid()
  ORDER BY pg_stat_activity.query_start ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION public.get_database_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_index_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_bloat() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_partition_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_queries() TO authenticated;

COMMENT ON FUNCTION public.get_database_stats IS 'Database performance overview. Admin recommended.';
COMMENT ON FUNCTION public.get_table_statistics IS 'Table size and activity statistics. Admin recommended.';
COMMENT ON FUNCTION public.get_index_usage IS 'Index usage analysis. Admin recommended.';
COMMENT ON FUNCTION public.get_table_bloat IS 'Table bloat estimation. Admin recommended.';
COMMENT ON FUNCTION public.get_partition_stats IS 'Partition health statistics. Admin recommended.';
COMMENT ON FUNCTION public.get_active_queries IS 'Real-time query monitoring. Admin recommended.';