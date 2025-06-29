import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdGenerator } from "../hooks/useAdGenerator";
import AdGenerationForm from "./components/AdGenerationForm";
import GeneratedAdsList from "./components/GeneratedAdsList";

const AdGenerator = () => {
  const { 
    productName, 
    setProductName,
    productDescription, 
    setProductDescription,
    targetAudience, 
    setTargetAudience,
    isGenerating,
    generatedAds,
    handleGenerate,
    copyToClipboard,
    copiedIndex
  } = useAdGenerator();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Gerador de Anúncios</h1>
        <p className="text-gray-600">
          Preencha as informações do seu produto e gere múltiplas variações de anúncios otimizados
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="h-full">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-xl">Informações do Produto</CardTitle>
            <CardDescription className="text-sm">
              Quanto mais detalhadas as informações, melhores serão os anúncios gerados
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-1 sm:pt-2">
            <AdGenerationForm 
              productName={productName}
              setProductName={setProductName}
              productDescription={productDescription}
              setProductDescription={setProductDescription}
              targetAudience={targetAudience}
              setTargetAudience={setTargetAudience}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
            />
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-xl">Anúncios Gerados</CardTitle>
            <CardDescription className="text-sm">
              {generatedAds.length > 0 ? 
                "Clique no ícone de copiar para usar o texto do anúncio" : 
                "Os anúncios aparecerão aqui após a geração"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GeneratedAdsList
              generatedAds={generatedAds}
              copiedIndex={copiedIndex}
              onCopy={copyToClipboard}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdGenerator;