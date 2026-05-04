import { useState, useMemo } from 'react';
import { History, Filter, Download, TrendingUp, Activity, Clock, Calendar, Copy, Upload } from 'lucide-react';
import { useAlbumStore } from '../store/albumStore';
import { ExportPreview } from './ExportPreview';
import { BarChart as RechartsBar, Bar, LineChart as RechartsLine, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function ChangeLogSection() {
  const { changeLogs } = useAlbumStore();
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [showImportBox, setShowImportBox] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
    search: '',
  });

  const filteredLogs = useMemo(() => {
    return changeLogs.filter((log) => {
      if (filters.action && log.action !== filters.action) return false;
      if (filters.entityType && log.entityType !== filters.entityType) return false;
      if (filters.search && !log.details.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) return false;
      return true;
    });
  }, [changeLogs, filters]);

  const actionsByType = useMemo(() => {
    const counts: Record<string, number> = { create: 0, update: 0, delete: 0 };
    filteredLogs.forEach((log) => {
      counts[log.action]++;
    });
    return [
      { id: 'action-create', name: 'Criações', value: counts.create, color: '#10b981' },
      { id: 'action-update', name: 'Atualizações', value: counts.update, color: '#3b82f6' },
      { id: 'action-delete', name: 'Exclusões', value: counts.delete, color: '#ef4444' },
    ];
  }, [filteredLogs]);

  const actionsByEntity = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach((log) => {
      counts[log.entityType] = (counts[log.entityType] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count], index) => ({
      id: `entity-${type}-${index}`,
      type: type === 'album' ? 'Álbuns' : type === 'toplist' ? 'Top Lists' : type === 'discography' ? 'Discografias' : 'Próximos',
      count,
    }));
  }, [filteredLogs]);

  const activityByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach((log) => {
      const date = new Date(log.timestamp).toLocaleDateString('pt-BR');
      counts[date] = (counts[date] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([date, count], index) => ({ id: `date-${index}`, date, count }))
      .sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime())
      .slice(-30)
      .map((item, index) => ({ ...item, id: `date-sorted-${index}` }));
  }, [filteredLogs]);

  const activityByHour = useMemo(() => {
    const counts: Record<number, number> = {};
    for (let i = 0; i < 24; i++) counts[i] = 0;

    filteredLogs.forEach((log) => {
      const hour = new Date(log.timestamp).getHours();
      counts[hour]++;
    });

    return Object.entries(counts).map(([hour, count], index) => ({
      id: `hour-${index}`,
      hour: `${hour.padStart(2, '0')}:00`,
      count,
    }));
  }, [filteredLogs]);

  const activityByDayOfWeek = useMemo(() => {
    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    filteredLogs.forEach((log) => {
      const day = new Date(log.timestamp).getDay();
      counts[day]++;
    });

    return Object.entries(counts).map(([day, count], index) => ({
      id: `day-${index}`,
      day: days[parseInt(day)],
      count,
    }));
  }, [filteredLogs]);

  const mostActiveDay = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach((log) => {
      const date = new Date(log.timestamp).toLocaleDateString('pt-BR');
      counts[date] = (counts[date] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? { date: sorted[0][0], count: sorted[0][1] } : null;
  }, [filteredLogs]);

  const avgActionsPerDay = useMemo(() => {
    const dates = new Set(filteredLogs.map((log) => new Date(log.timestamp).toLocaleDateString('pt-BR')));
    return dates.size > 0 ? (filteredLogs.length / dates.size).toFixed(1) : '0';
  }, [filteredLogs]);

  const handleExport = () => {
    setShowExportPreview(true);
  };

  const handleCopySite = () => {
    const fullData = localStorage.getItem('album-storage');
    if (fullData) {
      const code = `// Cole este código no console do navegador do outro site para importar os dados
localStorage.setItem('album-storage', '${fullData.replace(/'/g, "\\'")}');
window.location.reload();`;

      navigator.clipboard.writeText(code).then(() => {
        alert('✅ Código copiado! Cole no console do outro site (F12 > Console) para importar todos os dados.');
      }).catch(() => {
        alert('❌ Erro ao copiar. Tente novamente.');
      });
    }
  };

  const handleImportSite = () => {
    if (!importCode.trim()) {
      alert('❌ Cole o código na caixa de texto primeiro!');
      return;
    }

    try {
      // Extrair o JSON do código colado
      const match = importCode.match(/localStorage\.setItem\('album-storage',\s*'(.+?)'\);/s);
      if (match && match[1]) {
        const jsonData = match[1].replace(/\\'/g, "'");
        localStorage.setItem('album-storage', jsonData);
        alert('✅ Dados importados com sucesso! A página será recarregada.');
        window.location.reload();
      } else {
        alert('❌ Código inválido! Certifique-se de colar o código completo.');
      }
    } catch (error) {
      alert('❌ Erro ao importar dados. Verifique se o código está correto.');
    }
  };

  const getActionColor = (action: string) => {
    if (action === 'create') return 'text-green-400 bg-green-400/10 border-green-400/30';
    if (action === 'update') return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    return 'text-red-400 bg-red-400/10 border-red-400/30';
  };

  const getActionLabel = (action: string) => {
    if (action === 'create') return 'Criação';
    if (action === 'update') return 'Atualização';
    return 'Exclusão';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
          <h1 className="text-3xl md:text-4xl text-white">Log de Mudanças</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm md:text-base flex-1 sm:flex-none justify-center"
          >
            <Download className="w-5 h-5" />
            Exportar
          </button>
          <button
            onClick={handleCopySite}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm md:text-base flex-1 sm:flex-none justify-center"
          >
            <Copy className="w-5 h-5" />
            Copiar Site
          </button>
          <button
            onClick={() => setShowImportBox(!showImportBox)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm md:text-base flex-1 sm:flex-none justify-center"
          >
            <Upload className="w-5 h-5" />
            Importar Site
          </button>
        </div>
      </div>

      {showImportBox && (
        <div className="bg-[#1a1a1a] rounded-lg p-6 border-2 border-purple-500/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-white flex items-center gap-2">
              <Upload className="w-6 h-6 text-purple-400" />
              Importar Dados do Site
            </h2>
            <button
              onClick={() => setShowImportBox(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Cole aqui o código que você copiou de outro site usando o botão "Copiar Site":
          </p>
          <textarea
            value={importCode}
            onChange={(e) => setImportCode(e.target.value)}
            className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-white font-mono text-sm focus:border-purple-500 outline-none resize-none"
            rows={8}
            placeholder="Cole o código aqui..."
          />
          <button
            onClick={handleImportSite}
            className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            <Upload className="w-5 h-5" />
            Importar Todos os Dados
          </button>
          <p className="text-xs text-gray-500 mt-3">
            ⚠️ Isso substituirá todos os dados atuais do site pelos dados importados!
          </p>
        </div>
      )}

      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl text-white">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Buscar</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
              placeholder="Buscar..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Ação</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
            >
              <option value="">Todas</option>
              <option value="create">Criação</option>
              <option value="update">Atualização</option>
              <option value="delete">Exclusão</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Tipo</label>
            <select
              value={filters.entityType}
              onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
            >
              <option value="">Todos</option>
              <option value="album">Álbuns</option>
              <option value="toplist">Top Lists</option>
              <option value="discography">Discografias</option>
              <option value="nextalbum">Próximos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Data Inicial</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Data Final</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="text-gray-400">Resultados: {filteredLogs.length} ações</span>
          {(filters.action || filters.entityType || filters.startDate || filters.endDate || filters.search) && (
            <button
              onClick={() => setFilters({ action: '', entityType: '', startDate: '', endDate: '', search: '' })}
              className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <div className="text-sm text-gray-400">Total de Ações</div>
          </div>
          <div className="text-3xl font-bold text-white">{filteredLogs.length}</div>
        </div>
        <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <div className="text-sm text-gray-400">Média por Dia</div>
          </div>
          <div className="text-3xl font-bold text-green-400">{avgActionsPerDay}</div>
        </div>
        <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-yellow-400" />
            <div className="text-sm text-gray-400">Dia Mais Ativo</div>
          </div>
          <div className="text-lg font-bold text-yellow-400">{mostActiveDay?.date || '-'}</div>
          <div className="text-xs text-gray-500">{mostActiveDay ? `${mostActiveDay.count} ações` : ''}</div>
        </div>
        <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <div className="text-sm text-gray-400">Última Ação</div>
          </div>
          <div className="text-sm font-bold text-purple-400">
            {filteredLogs.length > 0
              ? new Date(filteredLogs[filteredLogs.length - 1].timestamp).toLocaleString('pt-BR')
              : '-'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl text-white mb-6">Ações por Tipo</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={actionsByType}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {actionsByType.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl text-white mb-6">Ações por Entidade</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBar data={actionsByEntity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="type" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#3b82f6" />
            </RechartsBar>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl text-white mb-6">Atividade ao Longo do Tempo</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLine data={activityByDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </RechartsLine>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl text-white mb-6">Atividade por Dia da Semana</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBar data={activityByDayOfWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#10b981" />
            </RechartsBar>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl text-white mb-6">Atividade por Hora do Dia</h2>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBar data={activityByHour}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="hour" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
            <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
              labelStyle={{ color: '#fff' }}
            />
            <Bar dataKey="count" fill="#8b5cf6" />
          </RechartsBar>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl text-white mb-6">Histórico Detalhado</h2>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredLogs.length > 0 ? (
            [...filteredLogs].reverse().map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 bg-[#0f0f0f] rounded-lg border border-gray-800 hover:border-blue-500/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs border ${getActionColor(log.action)}`}>
                      {getActionLabel(log.action)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-white">{log.details}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhuma ação registrada
            </div>
          )}
        </div>
      </div>

      {showExportPreview && <ExportPreview onClose={() => setShowExportPreview(false)} />}
    </div>
  );
}
