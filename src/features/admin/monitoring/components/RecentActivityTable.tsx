import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, XCircle } from "lucide-react";

interface AIUsageMetric {
  id: string;
  model_name: string;
  service_type: string;
  tokens_input: number | null;
  tokens_output: number | null;
  estimated_cost: number | null;
  response_time_ms: number | null;
  success: boolean | null;
  timestamp: string;
}

interface RecentActivityTableProps {
  usageMetrics: AIUsageMetric[];
}

const RecentActivityTable = ({ usageMetrics }: RecentActivityTableProps) => {
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Data</TableHead>
            <TableHead className="w-[140px]">Modelo</TableHead>
            <TableHead className="hidden sm:table-cell">Serviço</TableHead>
            <TableHead className="text-right">Tokens</TableHead>
            <TableHead className="text-right">Custo</TableHead>
            <TableHead className="hidden sm:table-cell text-right">Tempo</TableHead>
            <TableHead className="w-[90px]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usageMetrics?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                Nenhuma atividade registrada
              </TableCell>
            </TableRow>
          ) : (
            usageMetrics?.slice(0, 10).map((metric) => (
              <TableRow key={metric.id}>
                <TableCell className="whitespace-nowrap text-xs">
                  {format(new Date(metric.timestamp), "dd/MM HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell className="font-medium text-sm truncate max-w-[140px]">
                  {metric.model_name}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm">
                  {metric.service_type}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {((metric.tokens_input || 0) + (metric.tokens_output || 0)).toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-sm whitespace-nowrap">
                  ${(metric.estimated_cost || 0).toFixed(4)}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-right text-sm">
                  {metric.response_time_ms || 0}ms
                </TableCell>
                <TableCell>
                  {metric.success ? (
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Sucesso</span>
                      <span className="sm:hidden">OK</span>
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Erro</span>
                      <span className="sm:hidden">Erro</span>
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecentActivityTable;