import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, FileText, History, Menu, LogOut, BarChart3, CreditCard, GitCompare, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/features/auth";

const AppLayout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut, profile, isAdmin } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/app/dashboard", icon: BarChart3 },
    { name: "Gerador", href: "/app/gerador", icon: FileText },
    { name: "Diagnóstico", href: "/app/diagnostico", icon: Users },
    { name: "Otimizador de Funil", href: "/app/otimizador-funil", icon: GitCompare },
    { name: "Histórico", href: "/app/historico", icon: History },
    { name: "Assinatura", href: "/app/assinatura", icon: CreditCard },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigation.map((item) => {
        // Verifica se o caminho atual começa com o href do item (para subrotas)
        const isActive = location.pathname.startsWith(item.href);
        
        const linkElement = (
          <Link
            to={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            } ${mobile ? "w-full" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.name}</span>
          </Link>
        );

        // Só usa SheetClose quando está no mobile (dentro do Sheet)
        if (mobile) {
          return (
            <div key={item.name} className="px-2 py-1">
              <SheetClose asChild>
                {linkElement}
              </SheetClose>
            </div>
          );
        }

        // Para desktop, retorna o link diretamente
        return <div key={item.name} className="px-1">{linkElement}</div>;
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden" aria-label="Menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b flex items-center justify-between">
                      <h2 className="text-lg font-bold text-blue-600">OtimizaAds</h2>
                      <SheetClose asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Fechar menu">
                          <X className="h-4 w-4" />
                        </Button>
                      </SheetClose>
                    </div>
                    <div className="flex-1 overflow-auto py-4">
                      <NavItems mobile />
                    </div>
                    <div className="p-4 border-t">
                      <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Link to="/app/dashboard" className="flex items-center gap-2 shrink-0">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">OA</span>
                </div>
                <h1 className="text-xl font-bold text-blue-600">OtimizaAds</h1>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <NavItems />
            </div>

            <div className="flex items-center gap-4">
              {profile && (
                <span className="text-sm text-gray-600 hidden md:block truncate max-w-[150px] lg:max-w-xs">
                  {profile.full_name || profile.email}
                </span>
              )}
              {isAdmin && (
                <Link to="/admin/dashboard">
                  <Button variant="ghost" size="sm" className="whitespace-nowrap">
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout} className="whitespace-nowrap">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Outlet />
      </main>
      
      {/* Footer - apenas visível em mobile */}
      <footer className="md:hidden bg-white border-t border-gray-200 py-2 px-4 fixed bottom-0 w-full z-40">
        <div className="flex justify-around items-center">
          <Link to="/app/dashboard" className="flex flex-col items-center">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link to="/app/gerador" className="flex flex-col items-center">
            <FileText className="h-5 w-5 text-gray-600" />
            <span className="text-xs mt-1">Gerador</span>
          </Link>
          <Link to="/app/diagnostico" className="flex flex-col items-center">
            <Users className="h-5 w-5 text-gray-600" />
            <span className="text-xs mt-1">Diagnóstico</span>
          </Link>
          <Link to="/app/historico" className="flex flex-col items-center">
            <History className="h-5 w-5 text-gray-600" />
            <span className="text-xs mt-1">Histórico</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;