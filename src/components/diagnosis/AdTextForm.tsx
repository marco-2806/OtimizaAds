import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import DOMPurify from "dompurify";

interface AdTextFormProps {
  adText: string;
  setAdText: (text: string) => void;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

const AdTextForm = ({ adText, setAdText, isAnalyzing, onAnalyze }: AdTextFormProps) => {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [textLength, setTextLength] = useState(0);
  const [initialPlaceholder, setInitialPlaceholder] = useState<string>(
    "Cole aqui o texto completo do seu anúncio..."
  );
  const saveIntervalRef = useRef<number | null>(null);

  // Módulos para configurar a barra de ferramentas do Quill
  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ]
  };

  // Inicializa com o placeholder visível se não houver texto
  useEffect(() => {
    if (!adText && !hasInteracted) {
      setAdText(initialPlaceholder);
    }
  }, []);

  // Salvar no localStorage a cada 30 segundos
  useEffect(() => {
    if (hasInteracted && adText) {
      saveIntervalRef.current = window.setInterval(() => {
        localStorage.setItem('adTextDraft', adText);
        toast({
          title: "Rascunho salvo",
          description: "Seu texto foi salvo automaticamente",
        });
      }, 30000);
    }

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [hasInteracted, adText]);

  // Carregar o rascunho salvo ao iniciar
  useEffect(() => {
    const savedText = localStorage.getItem('adTextDraft');
    if (savedText && !adText) {
      setAdText(savedText);
      countTextLength(savedText);
    }
  }, []);

  // Função para contar caracteres removendo as tags HTML
  const countTextLength = (html: string) => {
    if (!html) {
      setTextLength(0);
      return;
    }
    // Criar um elemento temporário e definir o HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    // Pegar apenas o texto
    const textOnly = tempDiv.textContent || tempDiv.innerText || '';
    setTextLength(textOnly.length);
    
    // Limpar mensagem de erro quando o texto é editado
    setErrorMessage(null);
    
    // Verificar limite de caracteres
    if (textOnly.length > 1000) {
      setErrorMessage("O texto deve ter no máximo 1000 caracteres");
    } else if (textOnly.length < 50 && textOnly.length > 0) {
      setErrorMessage("O texto deve ter no mínimo 50 caracteres");
    }
  };

  const handleTextChange = (newValue: string) => {
    setAdText(newValue);
    countTextLength(newValue);
    setHasInteracted(true);
    localStorage.setItem('adTextDraft', newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    // Verificar se o texto sem HTML está vazio
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = adText;
    const textOnly = tempDiv.textContent || tempDiv.innerText || '';
    
    if (!textOnly.trim()) {
      setErrorMessage("Por favor, insira o texto do anúncio");
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira o texto do anúncio para análise.",
        variant: "destructive",
      });
      return;
    }
    
    if (textLength < 50) {
      setErrorMessage("O texto deve ter no mínimo 50 caracteres");
      toast({
        title: "Texto muito curto",
        description: "O texto do anúncio deve ter no mínimo 50 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    if (textLength > 1000) {
      setErrorMessage("O texto deve ter no máximo 1000 caracteres");
      toast({
        title: "Texto muito longo",
        description: "O texto do anúncio deve ter no máximo 1000 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    // Se passou nas validações, continuar com a análise
    setErrorMessage(null);
    onAnalyze();
  };

  const handleFocus = () => {
    if (!hasInteracted) {
      // Se o texto atual for igual ao placeholder, limpar
      if (adText === initialPlaceholder) {
        setAdText("");
      }
      setHasInteracted(true);
    }
  };

  return (
    <Card className="bg-white h-full">
      <CardHeader className="bg-white text-gray-900 pb-3">
        <CardTitle className="text-xl">Texto do Anúncio</CardTitle>
        <CardDescription>
          Cole aqui o texto completo do anúncio que você quer analisar
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-120px)]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 h-full">
            <Label htmlFor="adText" className="text-gray-700">
              Texto do Anúncio
              <span className="ml-1 text-xs text-gray-500">
                (min: 50 caracteres, max: 1000 caracteres)
              </span>
            </Label>
            <ReactQuill
              id="adText"
              value={adText}
              onChange={handleTextChange}
              onFocus={handleFocus}
              onClick={handleFocus}
              modules={quillModules}
              placeholder="Cole aqui o texto completo do seu anúncio..."
              className={`min-h-[200px] h-full bg-white border-gray-300 text-gray-900 resize-none ${errorMessage ? 'border-red-500 focus:border-red-500' : ''}`}
              preserveWhitespace={true}
            />
            <div className="flex justify-between">
              <div className="text-xs text-gray-500">
                Caracteres digitados: {textLength}{textLength > 1000 ? ' (limite excedido)' : textLength < 50 && textLength > 0 ? ' (mínimo não atingido)' : ''}
              </div>
              {errorMessage && (
                <div className="text-xs text-red-600 font-medium">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full touch-target" 
            disabled={isAnalyzing || textLength === 0 || textLength < 50 || textLength > 1000}
          >
            {isAnalyzing ? "Analisando anúncio..." : "Analisar Anúncio"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdTextForm;