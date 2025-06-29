import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, user } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return;
    }

    setIsLoading(true);

    await signUp(email, password, fullName);
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center mb-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">OA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">OtimizaAds</h1>
          </Link>
          <p className="text-gray-600 mt-2">Crie sua conta</p>
        </div>
        
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Cadastro</CardTitle>
            <CardDescription>
              Preencha os dados para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Seu nome completo"
                  className="mobile-input"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="mobile-input"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="mobile-input"
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="mobile-input"
                />
                {password !== confirmPassword && confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">As senhas não coincidem</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full mobile-button"
                disabled={isLoading || password !== confirmPassword}
              >
                {isLoading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Faça login aqui
                </Link>
              </p>
              <Link to="/" className="text-sm text-gray-500 hover:underline mt-4 inline-block">
                ← Voltar ao início
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;