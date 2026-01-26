import { AlertTriangle, CheckCircle, X } from 'lucide-react'; // Adicionei CheckCircle
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
  variant?: 'danger' | 'success';
  singleButton?: boolean; // NOVO: Para esconder o botão cancelar
}

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  isLoading = false,
  variant = 'danger',
  singleButton = false // Padrão é falso (mostra os dois botões)
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface border border-gray-800 rounded-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Ícone muda conforme a variante */}
          <div className={`p-3 rounded-full mb-4 ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
            {variant === 'danger' ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {description}
          </p>

          <div className="flex w-full gap-3">
            {/* Só mostra Cancelar se singleButton for falso */}
            {!singleButton && (
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
            
            <Button 
              onClick={onConfirm}
              isLoading={isLoading}
              className={`flex-1 ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
            >
              {variant === 'danger' ? 'Confirmar' : 'OK, Entendi'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}