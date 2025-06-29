
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OptimizedAdsProps {
  optimizedAds: string[];
}

const OptimizedAds = ({ optimizedAds }: OptimizedAdsProps) => {
  if (optimizedAds.length === 0) return null;

  return (
    <Card className="animate-in fade-in-50 slide-in-from-bottom-5">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Versões Otimizadas</CardTitle>
        <CardDescription>
          Anúncios gerados com base nas sugestões do diagnóstico
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 md:space-y-4">
          {optimizedAds.map((ad, index) => (
            <div key={index} className="p-3 sm:p-4 border rounded-lg bg-green-50 border-green-200 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <Badge variant="default" className="bg-green-600 shadow-sm">Versão {index + 1}</Badge>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{ad}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizedAds;
