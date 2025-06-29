import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

const CTASection = () => {
  return (
    <section id="sobre" className="py-12 md:py-20 bg-blue-600 scroll-mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="flex justify-center mb-4 md:mb-6">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 md:h-5 md:w-5 text-yellow-400 fill-current" />
            ))}
            <span className="ml-2 text-white text-xs md:text-sm">4.9/5 - Mais de 1.000 usuários satisfeitos</span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6 leading-tight">
          Pronto para <span className="text-yellow-400 inline-block">revolucionar</span> seus anúncios?
        </h2>
        
        <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto">
          Junte-se a centenas de empreendedores que já estão vendendo mais com anúncios inteligentes. 
          Comece gratuitamente hoje mesmo!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 md:mb-12">
          <Link to="/registro">
            <Button size="lg" variant="secondary" className="px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg w-full sm:w-auto">
              Criar Minha Conta Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-xs sm:text-sm text-blue-100">
            ✅ Sem compromisso • ✅ Cancele quando quiser • ✅ Suporte em português
          </p>
        </div>

        <div className="pt-6 md:pt-8 border-t border-blue-500">
          <div className="bg-blue-700 bg-opacity-30 p-4 md:p-6 rounded-lg max-w-2xl mx-auto">
            <p className="text-blue-100 text-sm md:text-base italic">
              "Aumentei minhas vendas em 60% no primeiro mês. O OtimizaAds é incrível!"
            </p>
            <p className="text-white font-medium text-sm mt-2">
              Maria Silva, Loja Online de Roupas
            </p>
          </div>
        </div>
        
        {/* Elementos decorativos */}
        <div className="hidden md:block absolute top-20 left-0 w-20 h-20 bg-blue-500 rounded-full opacity-20"></div>
        <div className="hidden md:block absolute bottom-20 right-0 w-32 h-32 bg-blue-500 rounded-full opacity-20"></div>
      </div>
    </section>
  );
};

export default CTASection;