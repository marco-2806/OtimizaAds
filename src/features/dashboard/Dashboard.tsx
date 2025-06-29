import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, BarChart3, GitCompare, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth";

const Dashboard = () => {
  const { profile } = useAuth();
  const userName = profile?.full_name || "Usuário";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bem-vindo, {userName}!</h1>
        <p className="text-gray-600 mt-1 sm:mt-2">
          Escolha uma das opções abaixo para começar a otimizar seus anúncios
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 hover:border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <PlusCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Gerar Anúncios</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Crie variações de texto para seus anúncios
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <Button asChild className="w-full mt-2 group">
              <Link to="/app/gerador">Começar a Gerar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 hover:border-green-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Search className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Diagnosticar Anúncio</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Analise e melhore anúncios existentes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <Button asChild variant="outline" className="w-full mt-2 border-green-200 hover:border-green-300 hover:bg-green-50">
              <Link to="/app/diagnostico">Analisar Anúncio</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 hover:border-indigo-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <GitCompare className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Otimizador de Funil</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Maximize conversões com análise de funil
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <Button asChild variant="outline" className="w-full mt-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50">
              <Link to="/app/otimizador-funil">Analisar Funil</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 hover:border-purple-200 sm:col-span-2 lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Meu Histórico</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Acesse todos os anúncios e diagnósticos anteriores
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <Button asChild variant="outline" className="w-full mt-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 group">
              <Link to="/app/historico" className="flex items-center justify-center">
                Ver Histórico
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="bg-blue-100 p-3 rounded-full">
            <div className="text-2xl">💡</div>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Dica para iniciantes</h3>
            <p className="text-blue-800 text-sm">
              Comece gerando alguns anúncios para seu produto, depois use o diagnóstico para 
              analisar anúncios que você já possui. A combinação das duas ferramentas vai 
              ajudar você a criar campanhas mais eficazes!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;