import { useState } from 'react';
import { BarChart, LineChart, Download, TrendingUp, Filter, Star } from 'lucide-react';
import { LineChart as RechartsLine, Line, BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, ComposedChart } from 'recharts';
import { useAlbumStore } from '../store/albumStore';

export function StatisticsAdvanced() {
  const { albums } = useAlbumStore();
  const [filters, setFilters] = useState({
    band: '',
    decade: '',
    year: '',
  });
  const [timelineView, setTimelineView] = useState<'day' | 'month' | 'year'>('month');

  const applyFilters = (albumList: typeof albums) => {
    return albumList.filter((album) => {
      if (filters.band && !album.band.toLowerCase().includes(filters.band.toLowerCase())) return false;
      if (filters.year && album.releaseYear.toString() !== filters.year) return false;
      if (filters.decade) {
        const decade = `${Math.floor(album.releaseYear / 10) * 10}s`;
        if (decade !== filters.decade) return false;
      }
      return true;
    });
  };

  const filteredAlbums = applyFilters(albums);

  const topAlbums = [...filteredAlbums]
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 15);

  const evolutionData = [...filteredAlbums]
    .sort((a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime())
    .map((album, index) => ({
      index: index + 1,
      date: new Date(album.dateAdded).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
      score: album.finalScore,
      name: album.name,
      movingAvg: filteredAlbums.slice(Math.max(0, index - 4), index + 1)
        .reduce((sum, a) => sum + a.finalScore, 0) / Math.min(5, index + 1),
    }));

  const bandCounts: Record<string, number> = {};
  const bandScores: Record<string, { total: number; count: number }> = {};

  filteredAlbums.forEach((album) => {
    bandCounts[album.band] = (bandCounts[album.band] || 0) + 1;
    if (!bandScores[album.band]) {
      bandScores[album.band] = { total: 0, count: 0 };
    }
    bandScores[album.band].total += album.finalScore;
    bandScores[album.band].count += 1;
  });

  const topBands = Object.entries(bandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([band, count]) => ({
      band,
      count,
      avgScore: parseFloat((bandScores[band].total / bandScores[band].count).toFixed(1)),
    }));

  const decadeDistribution: Record<string, { total: number; count: number }> = {};

  filteredAlbums.forEach((album) => {
    const decade = `${Math.floor(album.releaseYear / 10) * 10}s`;
    if (!decadeDistribution[decade]) {
      decadeDistribution[decade] = { total: 0, count: 0 };
    }
    decadeDistribution[decade].total += album.finalScore;
    decadeDistribution[decade].count += 1;
  });

  const decadeData = Object.entries(decadeDistribution)
    .map(([decade, data]) => ({
      decade,
      avgScore: parseFloat((data.total / data.count).toFixed(1)),
      count: data.count,
    }))
    .sort((a, b) => a.decade.localeCompare(b.decade));

  const favoriteTracks: Record<string, number> = {};
  filteredAlbums.forEach((album) => {
    if (album.favoriteTrack) {
      favoriteTracks[album.favoriteTrack] = (favoriteTracks[album.favoriteTrack] || 0) + 1;
    }
  });

  const topFavoriteTracks = Object.entries(favoriteTracks)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([track, count]) => ({ track, count }));

  const correlationData = filteredAlbums.map((album) => ({
    trackCount: album.tracks.length,
    score: album.finalScore,
    maxScore: album.tracks.length * 10,
    percentage: (album.finalScore / (album.tracks.length * 10)) * 100,
    name: album.name,
  }));

  // Calcular linha de tendência (regressão linear)
  const calculateTrendLine = () => {
    if (correlationData.length === 0) return [];

    const n = correlationData.length;
    const sumX = correlationData.reduce((sum, d) => sum + d.trackCount, 0);
    const sumY = correlationData.reduce((sum, d) => sum + d.percentage, 0);
    const sumXY = correlationData.reduce((sum, d) => sum + (d.trackCount * d.percentage), 0);
    const sumX2 = correlationData.reduce((sum, d) => sum + (d.trackCount * d.trackCount), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const minX = Math.min(...correlationData.map(d => d.trackCount));
    const maxX = Math.max(...correlationData.map(d => d.trackCount));

    return [
      { trackCount: minX, trendPercentage: slope * minX + intercept },
      { trackCount: maxX, trendPercentage: slope * maxX + intercept },
    ];
  };

  const trendLineData = calculateTrendLine();

  const musicalTimeline = () => {
    const stats: Record<string, number> = {};

    filteredAlbums.forEach((album) => {
      const date = new Date(album.dateAdded);
      let key: string;

      if (timelineView === 'day') {
        key = date.toLocaleDateString('pt-BR');
      } else if (timelineView === 'month') {
        key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      } else {
        key = date.getFullYear().toString();
      }

      stats[key] = (stats[key] || 0) + 1;
    });

    return Object.entries(stats)
      .sort((a, b) => {
        if (timelineView === 'year') {
          return parseInt(a[0]) - parseInt(b[0]);
        }
        return a[0].localeCompare(b[0]);
      })
      .map(([period, count]) => ({
        period,
        count,
      }));
  };

  const timeline = musicalTimeline();

  const handleExport = () => {
    const dataStr = JSON.stringify({
      topAlbums,
      bandStats: topBands,
      decadeStats: decadeData,
      filters,
      exportDate: new Date().toISOString(),
    }, null, 2);

    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `music-stats-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const availableDecades = Array.from(new Set(
    albums.map((a) => `${Math.floor(a.releaseYear / 10) * 10}s`)
  )).sort();

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl md:text-4xl text-white">Estatísticas Avançadas</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm md:text-base w-full sm:w-auto justify-center"
        >
          <Download className="w-5 h-5" />
          Exportar Dados
        </button>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl text-white">Filtros Avançados</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Banda</label>
            <input
              type="text"
              value={filters.band}
              onChange={(e) => setFilters({ ...filters, band: e.target.value })}
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
              placeholder="Filtrar por banda..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Década</label>
            <select
              value={filters.decade}
              onChange={(e) => setFilters({ ...filters, decade: e.target.value })}
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
            >
              <option value="">Todas</option>
              {availableDecades.map((decade) => (
                <option key={decade} value={decade}>{decade}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Ano</label>
            <input
              type="number"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
              placeholder="Ano..."
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="text-gray-400">Resultados: {filteredAlbums.length} álbuns</span>
          {(filters.band || filters.decade || filters.year) && (
            <button
              onClick={() => setFilters({ band: '', decade: '', year: '' })}
              className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800">
          <div className="text-sm text-gray-400 mb-2">Álbuns Avaliados</div>
          <div className="text-3xl font-bold text-white">{filteredAlbums.length}</div>
        </div>
        <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800">
          <div className="text-sm text-gray-400 mb-2">Nota Média</div>
          <div className="text-3xl font-bold text-green-400">
            {filteredAlbums.length > 0
              ? (filteredAlbums.reduce((sum, a) => sum + a.finalScore, 0) / filteredAlbums.length).toFixed(1)
              : '0'}
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          Ranking dos Melhores Álbuns
        </h2>
        <div className="space-y-3">
          {topAlbums.map((album, index) => (
            <div
              key={album.id}
              className="flex items-center gap-4 p-4 bg-[#0f0f0f] rounded-lg border border-gray-800 hover:border-blue-500/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">{index + 1}</span>
              </div>
              <img src={album.cover} alt={album.name} className="w-16 h-16 rounded" />
              <div className="flex-1">
                <h3 className="text-white font-medium">{album.name}</h3>
                <p className="text-sm text-gray-400">{album.band}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-400">{album.finalScore}</div>
                <div className="text-xs text-gray-500">
                  {((album.finalScore / (album.tracks.length * 10)) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl text-white mb-6 flex items-center gap-2">
            <LineChart className="w-6 h-6 text-blue-400" />
            Evolução das Notas
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLine data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ color: '#9ca3af' }} />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} name="Nota" />
              <Line type="monotone" dataKey="movingAvg" stroke="#ef4444" strokeWidth={2} name="Média Móvel" strokeDasharray="5 5" />
            </RechartsLine>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl text-white mb-6 flex items-center gap-2">
            <BarChart className="w-6 h-6 text-red-400" />
            Notas por Década
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBar data={decadeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="decade" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="avgScore" fill="#3b82f6" name="Nota Média" />
              <Bar dataKey="count" fill="#ef4444" name="Quantidade" />
            </RechartsBar>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl text-white mb-6">Correlação: Nº de Músicas vs. Percentual da Nota Máxima</h2>
        <div className="text-sm text-gray-400 mb-4">
          Mostra como a quantidade de músicas se relaciona com o percentual alcançado da nota máxima possível
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="trackCount"
              type="number"
              stroke="#9ca3af"
              name="Nº de Músicas"
              label={{ value: 'Quantidade de Músicas', position: 'insideBottom', offset: -5, fill: '#d1d5db' }}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis
              stroke="#9ca3af"
              name="% da Nota Máxima"
              label={{ value: '% da Nota Máxima', angle: -90, position: 'insideLeft', fill: '#d1d5db' }}
              tick={{ fill: '#9ca3af' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: any, name: string) => {
                if (name === 'percentage') return [`${value.toFixed(1)}%`, '% da Nota Máxima'];
                if (name === 'trendPercentage') return [`${value.toFixed(1)}%`, 'Linha de Tendência'];
                if (name === 'trackCount') return [value, 'Nº de Músicas'];
                return [value, name];
              }}
            />
            <Legend
              wrapperStyle={{ color: '#9ca3af' }}
              iconType="circle"
            />
            <Scatter
              data={correlationData}
              fill="#3b82f6"
              name="Álbuns"
              dataKey="percentage"
            />
            <Line
              data={trendLineData}
              type="linear"
              dataKey="trendPercentage"
              stroke="#ef4444"
              strokeWidth={3}
              dot={false}
              name="Linha de Tendência"
              strokeDasharray="5 5"
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          <div className="text-xs text-gray-400">
            Cada ponto azul representa um álbum. Quanto mais alto no gráfico, maior o percentual da nota máxima alcançado.
          </div>
          <div className="text-xs text-red-400">
            A linha vermelha tracejada mostra a tendência geral da correlação entre número de músicas e percentual alcançado.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl text-white mb-6">Bandas Mais Avaliadas</h2>
          <div className="space-y-3">
            {topBands.map((item, index) => (
              <div
                key={item.band}
                className="flex items-center gap-3 p-3 bg-[#0f0f0f] rounded-lg border border-gray-800"
              >
                <span className="text-gray-500 font-bold w-8">{index + 1}.</span>
                <div className="flex-1">
                  <div className="text-white font-medium">{item.band}</div>
                  <div className="text-sm text-gray-400">Média: {item.avgScore}</div>
                </div>
                <div className="text-blue-400 font-bold">{item.count} álbuns</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl text-white mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            Músicas Favoritas Mais Recorrentes
          </h2>
          <div className="space-y-3">
            {topFavoriteTracks.length > 0 ? (
              topFavoriteTracks.map((item, index) => (
                <div
                  key={item.track}
                  className="flex items-center gap-3 p-3 bg-[#0f0f0f] rounded-lg border border-gray-800"
                >
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <div className="flex-1">
                    <div className="text-white font-medium truncate">{item.track}</div>
                    <div className="text-sm text-gray-400">{item.count} {item.count === 1 ? 'vez' : 'vezes'}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                Nenhuma música favorita marcada ainda
              </div>
            )}
          </div>
        </div>
      </div>

      {timeline.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-white">Linha do Tempo Pessoal</h2>
            <div className="flex bg-[#0f0f0f] rounded-lg p-1 border border-gray-800">
              <button
                onClick={() => setTimelineView('day')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  timelineView === 'day' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Dia
              </button>
              <button
                onClick={() => setTimelineView('month')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  timelineView === 'month' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Mês
              </button>
              <button
                onClick={() => setTimelineView('year')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  timelineView === 'year' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Ano
              </button>
            </div>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-32 text-blue-400 font-bold truncate">{item.period}</div>
                <div className="flex-1 h-8 bg-[#0f0f0f] rounded-lg overflow-hidden border border-gray-800">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white font-medium"
                    style={{ width: `${Math.max(10, (item.count / Math.max(...timeline.map(t => t.count))) * 100)}%` }}
                  >
                    {item.count} {item.count === 1 ? 'álbum' : 'álbuns'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
