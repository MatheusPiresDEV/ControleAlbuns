import { Trash2 } from 'lucide-react';

export function ResetData() {
  const handleReset = () => {
    if (window.confirm('⚠️ ATENÇÃO: Esta ação irá APAGAR TODOS OS DADOS do site!\n\nSerão removidos:\n- Todos os álbuns avaliados\n- Todas as Top Lists\n- Todos os próximos álbuns\n- Todas as discografias\n- Todo o log de mudanças\n\nEsta ação NÃO PODE SER DESFEITA!\n\nDeseja continuar?')) {
      // Remove o localStorage do Zustand
      localStorage.removeItem('album-storage');

      // Recarrega a página para resetar o estado
      window.location.reload();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      <div className="bg-[#1a1a1a] rounded-lg p-6 md:p-8 border-2 border-red-600/50">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="w-8 h-8 text-red-400" />
          <h1 className="text-2xl md:text-3xl text-white">Resetar Dados</h1>
        </div>

        <div className="space-y-4 text-gray-300">
          <p className="text-lg">Esta ação irá remover <strong className="text-white">todos os dados salvos</strong> no localStorage:</p>

          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Álbuns avaliados</li>
            <li>Top Lists personalizadas</li>
            <li>Próximos álbuns na lista de espera</li>
            <li>Discografias cadastradas</li>
            <li>Log completo de mudanças</li>
          </ul>

          <div className="p-4 bg-red-600/20 border border-red-600/50 rounded-lg">
            <p className="text-red-400 font-bold flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Esta ação NÃO PODE ser desfeita! Todos os dados serão perdidos permanentemente.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="w-full mt-6 flex items-center justify-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-lg font-medium"
          >
            <Trash2 className="w-6 h-6" />
            Limpar Todos os Dados
          </button>
        </div>
      </div>
    </div>
  );
}
