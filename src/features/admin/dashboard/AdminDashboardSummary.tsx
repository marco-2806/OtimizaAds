import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

interface DashboardMetrics {
  totalUsers: number;
  totalAds: number;
  adsToday: number;
  adsThisMonth: number;
  newUsersToday: number;
}

interface AdminDashboardSummaryProps {
  metrics: DashboardMetrics;
}

const AdminDashboardSummary = ({ metrics }: AdminDashboardSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Atividade Mensal</CardTitle>
          <CardDescription className="text-sm">
            Estatísticas do mês atual
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Anúncios este mês</span>
              <span className="text-lg sm:text-2xl font-bold text-blue-600 flex items-center gap-1">
                {metrics.adsThisMonth}
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Média diária</span>
              <span className="text-base sm:text-lg font-semibold">
                {Math.round(metrics.adsThisMonth / new Date().getDate())}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Status da Plataforma</CardTitle>
          <CardDescription className="text-sm">
            Indicadores de saúde do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Status</span>
              <div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  Operacional
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Última atualização</span>
              <span className="text-xs sm:text-sm text-gray-600">
                {new Date().toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardSummary;