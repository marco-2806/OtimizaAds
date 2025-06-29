import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, BarChart3, Settings, Menu, LogOut, ShieldCheck, Activity, Brain, CreditCard, X, Server } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"; 
import { useAuth } from "@/features/auth";

const AdminLayout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut, profile } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
    { name: "Monitoramento", href: "/admin/monitoring", icon: Activity },
    { name: "Config. IA", href: "/admin/ai-config", icon: Brain, mobileName: "IA" },
    { name: "Serviços", href: "/admin/services", icon: Server, mobileName: "Serviços" },
    { name: "Assinaturas", href: "/admin/subscriptions", icon: CreditCard },
    { name: "Usuários", href: "/admin/usuarios", icon: Users },
    { name: "Configurações", href: "/admin/configuracoes", icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigation.map((item) => {
        const isActive = location.pathname.startsWith(item.href);
        const linkElement = (
          <Link 
            to={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors touch-target ${
              isActive
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            } ${mobile ? "w-full" : ""}`} 
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span>{mobile && item.mobileName ? item.mobileName : item.name}</span>
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
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-blue-600">Admin OtimizaAds</h2>
                      </div>
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
                      <Link to="/app/dashboard">
                        <Button variant="outline" size="sm" className="w-full mb-2">
                          Ver App
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Link to="/admin/dashboard" className="flex items-center gap-2 shrink-0">
                <div className="bg-blue-600 rounded-md p-1 shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-blue-600 hidden sm:block">Admin OtimizaAds</h1>
              </Link>
            </div>

            <div className="hidden md:flex items-center">
              <div className="flex items-center space-x-1">
                <NavItems />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {profile && (
                <span className="text-sm text-gray-600 hidden lg:block truncate max-w-[150px] xl:max-w-xs">
                  <span className="text-xs text-gray-500 mr-1">Admin:</span> {profile.full_name || profile.email}
                </span>
              )}
              <Link to="/app/dashboard" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="whitespace-nowrap">
                  Ver App
                </Button>
              </Link>
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
          <Link to="/admin/dashboard" className="flex flex-col items-center">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link to="/admin/monitoring" className="flex flex-col items-center">
            <Activity className="h-5 w-5 text-gray-600" />
            <span className="text-xs mt-1">Monitor</span>
          </Link>
          <Link to="/admin/usuarios" className="flex flex-col items-center">
            <Users className="h-5 w-5 text-gray-600" />
            <span className="text-xs mt-1">Usuários</span>
          </Link>
          <Link to="/app/dashboard" className="flex flex-col items-center">
            <LogOut className="h-5 w-5 text-gray-600" />
            <span className="text-xs mt-1">Sair</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;