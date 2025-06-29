import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  DollarSign,
  Activity,
  Clock,
  BarChart3
} from "lucide-react";

interface MetricsOverviewProps {
  metrics: {
    totalRequests: number;
    totalTokensInput: number;
    totalTokensOutput: number;
    totalCost: number;
    avgResponseTime: number;
    successRate: number;
  };
}

const MetricsOverview = ({ metrics }: MetricsOverviewProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Requisições</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="py-2 px-3 sm:py-3 sm:px-6">
          <div className="text-lg sm:text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Tokens Input</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="py-2 px-3 sm:py-3 sm:px-6">
          <div className="text-lg sm:text-2xl font-bold">{metrics.totalTokensInput.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Tokens Output</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="py-2 px-3 sm:py-3 sm:px-6">
          <div className="text-lg sm:text-2xl font-bold">{metrics.totalTokensOutput.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Custo Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="py-2 px-3 sm:py-3 sm:px-6">
          <div className="text-lg sm:text-2xl font-bold">${metrics.totalCost.toFixed(4)}</div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Tempo Médio</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="py-2 px-3 sm:py-3 sm:px-6">
          <div className="text-lg sm:text-2xl font-bold">{metrics.avgResponseTime.toFixed(0)}ms</div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Taxa Sucesso</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="py-2 px-3 sm:py-3 sm:px-6">
          <div className="text-lg sm:text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsOverview;