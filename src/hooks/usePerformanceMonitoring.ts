import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DatabaseStat {
  stat_name: string;
  stat_value: string;
  category: string;
}

export interface TableStat {
  schema_name: string;
  table_name: string;
  total_size: string;
  table_size: string;
  indexes_size: string;
  live_rows: number;
  dead_rows: number;
  last_vacuum: string | null;
  last_analyze: string | null;
}

export interface IndexUsage {
  schema_name: string;
  table_name: string;
  index_name: string;
  index_size: string;
  scans: number;
  tuples_read: number;
  usage_status: string;
}

export interface TableBloat {
  schema_name: string;
  table_name: string;
  bloat_pct: number;
  bloat_size: string;
  recommendation: string;
}

export interface PartitionStat {
  partition_name: string;
  row_count: number;
  table_size: string;
  last_vacuum: string | null;
  status: string;
}

export interface ActiveQuery {
  pid: number;
  duration_seconds: number;
  query_text: string;
  state: string;
  wait_event: string;
}

export const usePerformanceMonitoring = (autoRefresh: boolean = false) => {
  const dbStats = useQuery({
    queryKey: ['database-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_database_stats');
      if (error) throw error;
      return data as DatabaseStat[];
    },
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const tableStats = useQuery({
    queryKey: ['table-statistics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_table_statistics');
      if (error) throw error;
      return data as TableStat[];
    },
  });

  const indexUsage = useQuery({
    queryKey: ['index-usage'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_index_usage');
      if (error) throw error;
      return data as IndexUsage[];
    },
  });

  const tableBloat = useQuery({
    queryKey: ['table-bloat'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_table_bloat');
      if (error) throw error;
      return data as TableBloat[];
    },
  });

  const partitionStats = useQuery({
    queryKey: ['partition-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_partition_stats');
      if (error) throw error;
      return data as PartitionStat[];
    },
  });

  const activeQueries = useQuery({
    queryKey: ['active-queries'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_active_queries');
      if (error) throw error;
      return data as ActiveQuery[];
    },
    refetchInterval: autoRefresh ? 2000 : false,
  });

  const refreshAll = async () => {
    await Promise.all([
      dbStats.refetch(),
      tableStats.refetch(),
      indexUsage.refetch(),
      tableBloat.refetch(),
      partitionStats.refetch(),
      activeQueries.refetch(),
    ]);
  };

  return {
    dbStats: dbStats.data,
    tableStats: tableStats.data,
    indexUsage: indexUsage.data,
    tableBloat: tableBloat.data,
    partitionStats: partitionStats.data,
    activeQueries: activeQueries.data,
    isLoading: dbStats.isLoading || tableStats.isLoading,
    refreshAll,
  };
};
