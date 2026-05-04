import { Home, Disc, Trophy, ListMusic, Music, BarChart3, History, Trash2 } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const sections = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'albums', name: 'Álbuns', icon: Disc },
    { id: 'top5', name: 'Top Lists', icon: Trophy },
    { id: 'next', name: 'Próximos', icon: ListMusic },
    { id: 'discographies', name: 'Discografias', icon: Music },
    { id: 'statistics', name: 'Estatísticas', icon: BarChart3 },
    { id: 'changelog', name: 'Log de Mudanças', icon: History },
  ];

  return (
    <div className="w-full md:w-64 h-auto md:h-screen bg-[#0f0f0f] border-b md:border-r md:border-b-0 border-gray-800 flex flex-col">
      <div className="p-4 md:p-6 border-b border-gray-800">
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-500 to-red-500 bg-clip-text text-transparent">
          Music Stats
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">Seu diário musical</p>
      </div>

      <nav className="flex-1 p-2 md:p-4 overflow-x-auto md:overflow-x-visible">
        <div className="flex md:flex-col gap-2 md:space-y-0 min-w-max md:min-w-0">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="text-sm md:text-base">{section.name}</span>
            </button>
          );
        })}

        {/* Reset button for mobile */}
        <button
          onClick={() => onSectionChange('reset')}
          className={`md:hidden flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
            activeSection === 'reset'
              ? 'bg-red-600 text-white'
              : 'text-red-400 hover:bg-red-600/20 border border-red-600/30'
          }`}
        >
          <Trash2 className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">Resetar</span>
        </button>
        </div>
      </nav>

      <div className="hidden md:block p-4 border-t border-gray-800 space-y-3">
        <button
          onClick={() => onSectionChange('reset')}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            activeSection === 'reset'
              ? 'bg-red-600 text-white'
              : 'text-red-400 hover:bg-red-600/20 border border-red-600/30'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">Resetar Dados</span>
        </button>

        <div className="p-3 bg-gradient-to-r from-blue-600/10 to-red-600/10 rounded-lg border border-blue-500/20">
          <div className="text-xs text-gray-400 mb-1">Versão</div>
          <div className="text-sm text-white">1.0.0</div>
        </div>
      </div>
    </div>
  );
}
