import { BarChart, LineChart, Download, TrendingUp } from 'lucide-react';
import { LineChart as RechartsLine, Line, BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAlbumStore } from '../store/albumStore';
import { HeatMap } from './HeatMap';

export function Statistics() {
  const { albums } = useAlbumStore();

  const topAlbums = [...albums]
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 10);

  const evolutionData = [...albums]
    .sort((a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime())
    .map((album) => ({
      date: new Date(album.dateAdded).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
      score: album.finalScore,
      name: album.name,
    }));

  const bandCounts: Record<string, number> = {};
  const bandScores: Record<string, { total: number; count: number }> = {};

  albums.forEach((album) => {
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
      avgScore: (bandScores[band].total / bandScores[band].count).toFixed(1),
    }));

  const decadeDistribution: Record<string, { total: number; count: number }> = {};

  albums.forEach((album) => {
    const year = new Date(album.releaseDate).getFullYear();
    const decade = `${Math.floor(year / 10) * 10}s`;
    if (!decadeDistribution[decade]) {
      decadeDistribution[decade] = { total: 0, count: 0 };
    }
    decadeDistribution[decade].total += album.finalScore;
    decadeDistribution[decade].count += 1;
  });

  const decadeData = Object.entries(decadeDistribution)
    .map(([decade, data]) => ({
      decade,
      avgScore: (data.total / data.count).toFixed(1),
      count: data.count,
    }))
    .sort((a, b) => a.decade.localeCompare(b.decade));

  const ratingDistribution: Record<number, number> = {};
  albums.forEach((album) => {
    album.tracks.forEach((track) => {
      ratingDistribution[track.rating] = (ratingDistribution[track.rating] || 0) + 1;
    });
  });

  const ratingData = Object.entries(ratingDistribution)
    .map(([rating, count]) => ({
      rating: Number(rating),
      count,
    }))
    .sort((a, b) => a.rating - b.rating);

  const handleExport = () => {
    console.log('Exportando estatísticas...');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl text-white">Estatísticas Avançadas</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Download className="w-5 h-5" />
          Exportar
        </button>
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
              <div className="text-2xl font-bold text-blue-400">{album.finalScore}</div>
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
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </RechartsLine>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl text-white mb-6 flex items-center gap-2">
            <BarChart className="w-6 h-6 text-red-400" />
            Distribuição de Notas
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBar data={ratingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="rating" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#ef4444" />
            </RechartsBar>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl text-white mb-6">Mapa de Calor de Atividade</h2>
        <HeatMap />
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
          <h2 className="text-2xl text-white mb-6">Notas por Década</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBar data={decadeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="decade" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="avgScore" fill="#3b82f6" />
              <Bar dataKey="count" fill="#ef4444" />
            </RechartsBar>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
