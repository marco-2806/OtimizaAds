import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/admin/MetricCard";
import { Users, FileText, Zap, Calendar } from "lucide-react";

interface DashboardMetrics {
  totalUsers: number;
  totalAds: number;
  adsToday: number;
  adsThisMonth: number;
  newUsersToday: number;
}

interface AdminDashboardMetricsProps {
  metrics: DashboardMetrics;
}

const AdminDashboardMetrics = ({ metrics }: AdminDashboardMetricsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      <MetricCard
        title="Total de Usuários"
        value={metrics.totalUsers}
        description="Usuários registrados na plataforma"
        icon={Users}
        className="overflow-hidden"
      />
      <MetricCard
        title="Anúncios Gerados"
        value={metrics.totalAds}
        description="Total de anúncios criados"
        icon={FileText}
        className="overflow-hidden"
      />
      <MetricCard
        title="Anúncios Hoje"
        value={metrics.adsToday}
        description="Gerados nas últimas 24h"
        icon={Zap}
        className="overflow-hidden"
      />
      <MetricCard
        title="Novos Usuários"
        value={metrics.newUsersToday}
        description="Cadastros hoje"
        icon={Calendar}
        className="overflow-hidden"
      />
    </div>
  );
};

export default AdminDashboardMetrics;