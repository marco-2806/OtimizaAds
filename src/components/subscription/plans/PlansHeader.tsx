import React from "react";

interface PlansHeaderProps {
  compact?: boolean;
}

const PlansHeader = ({ compact = false }: PlansHeaderProps) => {
  if (compact) {
    return (
      <div className="mb-6 text-center sm:text-left">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Escolha seu plano
        </h3>
        <p className="text-sm text-gray-600">
          Selecione o plano que melhor atende às suas necessidades
        </p>
      </div>
    );
  }

  return (
    <div className="text-center mb-6 md:mb-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
        Escolha o plano <span className="text-blue-600 inline-block">ideal</span> para você
      </h2>
      <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
        Comece gratuitamente e evolua conforme seu negócio cresce.
      </p>
    </div>
  );
};

export default PlansHeader;