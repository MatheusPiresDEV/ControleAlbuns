import { X, Download, Music, Star, TrendingUp } from 'lucide-react';
import { useAlbumStore } from '../store/albumStore';
import { exportAsImage } from '../utils/exportUtils';

interface ExportPreviewProps {
  onClose: () => void;
}

export function ExportPreview({ onClose }: ExportPreviewProps) {
  const { albums, topLists, nextAlbums, discographies, getStats } = useAlbumStore();
  const stats = getStats();
  const topAlbums = [...albums].sort((a, b) => b.finalScore - a.finalScore).slice(0, 10);

  const handleExport = async () => {
    await exportAsImage('export-preview', `music-stats-${new Date().toISOString().split('T')[0]}.png`);
  };

  const bandCounts: Record<string, number> = {};
  albums.forEach((album) => {
    bandCounts[album.band] = (bandCounts[album.band] || 0) + 1;
  });
  const topBands = Object.entries(bandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#0a0a0a] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0a0a0a] border-b border-gray-800 p-4 flex items-center justify-between z-10">
          <h2 className="text-2xl text-white font-bold">Prévia de Exportação</h2>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              Exportar Imagem
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div id="export-preview" className="p-8 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a]">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-red-500 bg-clip-text text-transparent mb-2">
              Music Stats
            </h1>
            <p className="text-gray-400">Meu Diário Musical</p>
            <p className="text-sm text-gray-500 mt-2">
              Gerado em {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 rounded-lg p-4 border border-blue-500/30">
              <div className="text-sm text-blue-400 mb-1">Total de Álbuns</div>
              <div className="text-3xl font-bold text-white">{stats.totalAlbums}</div>
            </div>
            <div className="bg-gradient-to-br from-green-600/20 to-green-600/5 rounded-lg p-4 border border-green-500/30">
              <div className="text-sm text-green-400 mb-1">Média Geral</div>
              <div className="text-3xl font-bold text-white">{stats.averageScore.toFixed(1)}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 rounded-lg p-4 border border-purple-500/30">
              <div className="text-sm text-purple-400 mb-1">Top Lists</div>
              <div className="text-3xl font-bold text-white">{topLists.length}</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-600/5 rounded-lg p-4 border border-yellow-500/30">
              <div className="text-sm text-yellow-400 mb-1">Discografias</div>
              <div className="text-3xl font-bold text-white">{discographies.length}</div>
            </div>
          </div>

          {/* Top 10 Albums */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              Top 10 Melhores Álbuns
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {topAlbums.map((album, index) => (
                <div
                  key={album.id}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-lg border border-gray-700"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <img src={album.cover} alt={album.name} className="w-12 h-12 rounded" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate text-sm">{album.name}</div>
                    <div className="text-xs text-gray-400 truncate">{album.band}</div>
                  </div>
                  <div className="text-lg font-bold text-blue-400">{album.finalScore}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Bands */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Music className="w-6 h-6 text-red-400" />
              Top 5 Bandas Mais Avaliadas
            </h2>
            <div className="space-y-2">
              {topBands.map(([band, count], index) => (
                <div
                  key={band}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-lg border border-gray-700"
                >
                  <span className="text-gray-500 font-bold w-8">{index + 1}.</span>
                  <Music className="w-5 h-5 text-red-400" />
                  <div className="flex-1 text-white font-medium">{band}</div>
                  <div className="text-red-400 font-bold">{count} álbuns</div>
                </div>
              ))}
            </div>
          </div>

          {/* Favorite Tracks */}
          {albums.some(a => a.favoriteTrack) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                Músicas Favoritas
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {albums
                  .filter(a => a.favoriteTrack)
                  .slice(0, 10)
                  .map((album) => (
                    <div
                      key={album.id}
                      className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-lg border border-gray-700"
                    >
                      <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm truncate">{album.favoriteTrack}</div>
                        <div className="text-xs text-gray-500 truncate">{album.name}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-sm">
              Gerado por Music Stats - Seu Diário Musical Completo
            </p>
            <p className="text-gray-600 text-xs mt-1">
              {stats.totalAlbums} álbuns avaliados • Nota média: {stats.averageScore.toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
