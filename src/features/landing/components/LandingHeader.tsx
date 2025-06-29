import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const LandingHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">OA</span>
              </div>
              <h1 className="text-xl font-bold text-blue-600">OtimizaAds</h1>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <a href="#funcionalidades" className="text-gray-600 hover:text-gray-900 transition-colors">
              Funcionalidades
            </a>
            <a href="#precos" className="text-gray-600 hover:text-gray-900 transition-colors">
              Preços
            </a>
            <a href="#sobre" className="text-gray-600 hover:text-gray-900 transition-colors">
              Sobre Nós
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link to="/registro">
              <Button size="sm">
                Comece Grátis
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-5">
            <nav className="flex flex-col space-y-4 px-2">
              <a 
                href="#funcionalidades" 
                className="text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Funcionalidades
              </a>
              <a 
                href="#precos" 
                className="text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Preços
              </a>
              <a 
                href="#sobre" 
                className="text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sobre Nós
              </a>
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Entrar
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default LandingHeader;