import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Search, Gauge, Users } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Wand2,
      title: "Gerador de Anúncios IA",
      description: "Crie anúncios profissionais em segundos. Nossa IA analisa seu produto e gera textos persuasivos que convertem.",
      example: "Ex: 'Produto: Tênis esportivo' → Anúncio completo com título, descrição e CTA otimizados"
    },
    {
      icon: Search,
      title: "Diagnóstico Inteligente",
      description: "Analise seus anúncios existentes e descubra por que não estão convertendo. Receba sugestões específicas.",
      example: "Ex: 'Seu título está muito genérico' + 3 sugestões de melhoria"
    },
    {
      icon: Gauge,
      title: "Otimização com 1 Clique",
      description: "Melhore automaticamente seus anúncios com base em dados de performance e tendências do mercado.",
      example: "Ex: Taxa de conversão aumentou 45% após otimização automática"
    },
    {
      icon: Users,
      title: "Análise de Concorrentes",
      description: "Veja o que seus concorrentes estão fazendo e receba insights para se destacar no mercado.",
      example: "Ex: 'Concorrente X usa este tipo de CTA' + sugestão diferenciada para você"
    }
  ];

  return (
    <section id="funcionalidades" className="py-12 md:py-20 bg-white scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Tudo que você precisa para <span className="text-blue-600 inline-block">vender mais</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Ferramentas poderosas e simples de usar, feitas especialmente para empreendedores como você.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border hover:border-blue-200 transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0 mt-1">
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-gray-600 mt-1">
                      {feature.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-700 italic">
                    {feature.example}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">Mais de 1.000 empreendedores já estão usando o OtimizaAds</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {['Aumento de 45% em CTR', 'Redução de 30% no CPA', 'Crescimento de 60% em vendas'].map((stat, index) => (
              <div key={index} className="bg-blue-50 px-4 py-2 rounded-full text-blue-700 text-sm font-medium">
                {stat}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;