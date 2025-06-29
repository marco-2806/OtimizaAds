import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react";

const LandingFooter = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-1 sm:col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OA</span>
              </div>
              <h3 className="text-xl font-bold text-blue-400">OtimizaAds</h3>
            </Link>
            <p className="text-gray-300 mb-4 md:mb-6 max-w-md text-sm md:text-base">
              A ferramenta de IA que transforma suas ideias em anúncios de alta conversão. 
              Feito por empreendedores, para empreendedores.
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <Link to="/registro" className="inline-block">
                <span className="text-blue-400 hover:text-blue-300 text-sm font-medium">Começar Grátis</span>
              </Link>
              <Link to="/login" className="inline-block">
                <span className="text-gray-300 hover:text-white text-sm font-medium">Fazer Login</span>
              </Link>
            </div>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm md:text-base">Produto</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
              <li><a href="#precos" className="hover:text-white transition-colors">Preços</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Exemplos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm md:text-base">Empresa</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#sobre" className="hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Suporte</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-sm md:text-base">Contato</h4>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href="mailto:contato@otimizaads.com" className="hover:text-white transition-colors">contato@otimizaads.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <a href="tel:+5511999999999" className="hover:text-white transition-colors">(11) 99999-9999</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-xs md:text-sm text-gray-400 mb-4 md:mb-0">
            <a href="#" className="hover:text-white transition-colors">Termos de Serviço</a>
            <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
          <p className="text-xs md:text-sm text-gray-400">
            © 2024 OtimizaAds. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;