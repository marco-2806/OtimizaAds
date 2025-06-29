interface PlansFooterProps {
  compact?: boolean;
}

const PlansFooter = ({ compact = false }: PlansFooterProps) => {
  if (compact) {
    return (
      <div className="text-center mt-4 text-xs text-gray-500">
        <p>🔒 Todos os planos incluem segurança SSL e backup automático</p>
      </div>
    );
  }

  return (
    <div className="text-center mt-8 sm:mt-12">
      <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
        🔒 Todos os planos incluem segurança SSL e backup automático
      </p>
      <p className="text-xs sm:text-sm text-gray-500">
        Precisa de algo personalizado? <a href="#" className="text-blue-600 hover:underline touch-target inline-flex items-center">Entre em contato</a>
      </p>
    </div>
  );
};

export default PlansFooter;