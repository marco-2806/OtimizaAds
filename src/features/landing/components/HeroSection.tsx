import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Target, TrendingUp } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 md:py-20 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Anúncios <span className="text-blue-600 inline-block">Inteligentes</span>
            <br className="hidden sm:block" />
            <span className="sm:inline"> Resultados </span>
            <span className="text-blue-600 inline-block">Garantidos</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transforme suas ideias em anúncios de alta conversão com nossa IA. 
            Perfeito para empreendedores que querem resultados sem complicação.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 md:mb-12">
            <Link to="/registro">
              <Button size="lg" className="px-6 sm:px-8 py-3 text-base sm:text-lg w-full sm:w-auto">
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-0">
              ✅ Sem cartão de crédito • ✅ 5 anúncios gratuitos
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto mt-8">
            <div className="flex items-center justify-center sm:justify-start gap-3 bg-white bg-opacity-60 p-3 rounded-lg shadow-sm">
              <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <span className="text-gray-700 font-medium text-sm sm:text-base">Gere em 30 segundos</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3 bg-white bg-opacity-60 p-3 rounded-lg shadow-sm">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <span className="text-gray-700 font-medium text-sm sm:text-base">Alta conversão</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3 bg-white bg-opacity-60 p-3 rounded-lg shadow-sm">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <span className="text-gray-700 font-medium text-sm sm:text-base">Otimização automática</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;