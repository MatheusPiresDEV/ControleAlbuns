import { useState } from 'react';
import { Music, TrendingUp, Calendar, Star, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { HeatMapWithFilters } from './HeatMapWithFilters';
import { AlbumCard } from './AlbumCard';
import { ExportPreview } from './ExportPreview';
import { useAlbumStore, type Album } from '../store/albumStore';

export function Dashboard() {
  const albums = useAlbumStore(state => state.albums);
  const topLists = useAlbumStore(state => state.topLists);
  const getTopAlbums = useAlbumStore(state => state.getTopAlbums);
  const getRecentActivity = useAlbumStore(state => state.getRecentActivity);
  const getStats = useAlbumStore(state => state.getStats);

  const [activityPage, setActivityPage] = useState(0);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const itemsPerPage = 4;

  const topAlbums = getTopAlbums(3);
  const allRecentActivity = getRecentActivity(100);
  const stats = getStats();

  const totalPages = Math.ceil(allRecentActivity.length / itemsPerPage);
  const recentActivity = allRecentActivity.slice(
    activityPage * itemsPerPage,
    (activityPage + 1) * itemsPerPage
  );

  const albumsTopList = topLists.find(list => list.type === 'albums');
  const topListAlbums = albumsTopList?.items
    .slice(0, 3)
    .map(item => {
      if (item.albumId) {
        return albums.find(a => a.id === item.albumId);
      }
      return null;
    })
    .filter((album): album is Album => album !== null && album !== undefined) || [];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl md:text-4xl text-white">Dashboard</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowExportPreview(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm md:text-base"
          >
            <Download className="w-5 h-5" />
            Exportar Resumo
          </button>
          <div className="text-xs md:text-sm text-gray-400">
            {new Date().toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Últimas Atividades
              </h2>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActivityPage(Math.max(0, activityPage - 1))}
                    disabled={activityPage === 0}
                    className="p-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                  </button>
                  <span className="text-xs text-gray-500">
                    {activityPage + 1}/{totalPages}
                  </span>
                  <button
                    onClick={() => setActivityPage(Math.min(totalPages - 1, activityPage + 1))}
                    disabled={activityPage === totalPages - 1}
                    className="p-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {recentActivity.length > 0 ? (
                recentActivity.map((album, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-[#0f0f0f] rounded-lg border border-gray-800 hover:border-blue-500/50 transition-colors">
                    <img src={album.cover} alt={album.name} className="w-12 h-12 rounded" />
                    <div className="flex-1 min-w-0">
                      <div className="text-white truncate">{album.name}</div>
                      <div className="text-sm text-gray-400 truncate">{album.band}</div>
                    </div>
                    <div className="text-sm text-gray-500 flex-shrink-0">
                      {new Date(album.dateAdded).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Nenhum álbum avaliado ainda
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-500" />
              {albumsTopList ? `Top 3 - ${albumsTopList.title}` : 'Top 3 Melhores Álbuns'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(topListAlbums.length > 0 ? topListAlbums : topAlbums).slice(0, 3).map((album, index) => (
                <div
                  key={index}
                  className="relative bg-gradient-to-br from-blue-600/20 to-red-600/20 rounded-lg p-4 border-2 border-blue-500"
                  style={{
                    borderColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'
                  }}
                >
                  <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <img src={album.cover} alt={album.name} className="w-full aspect-square rounded mb-3" />
                  <h3 className="text-white font-medium mb-1 truncate">{album.name}</h3>
                  <p className="text-sm text-gray-400 mb-1 truncate">{album.band}</p>
                  <div className="text-xs text-gray-500 mb-1">Lançamento: {album.releaseYear}</div>
                  <div className="text-xs text-gray-500 mb-2">
                    Adicionado: {new Date(album.dateAdded).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-400">{album.finalScore}</span>
                    {album.favoriteTrack && (
                      <div className="flex items-center gap-1 text-yellow-400 text-sm">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="truncate max-w-[100px]">{album.favoriteTrack}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl text-white mb-4">Estatísticas Rápidas</h2>
            <div className="space-y-4">
              <div className="p-4 bg-[#0f0f0f] rounded-lg border border-gray-800">
                <div className="text-sm text-gray-400 mb-1">Total de Álbuns</div>
                <div className="text-2xl font-bold text-blue-400">{stats.totalAlbums}</div>
              </div>
              <div className="p-4 bg-[#0f0f0f] rounded-lg border border-gray-800">
                <div className="text-sm text-gray-400 mb-1">Média Geral</div>
                <div className="text-2xl font-bold text-red-400">{stats.averageScore.toFixed(1)}</div>
              </div>
              <div className="p-4 bg-[#0f0f0f] rounded-lg border border-gray-800">
                <div className="text-sm text-gray-400 mb-1">Banda Mais Avaliada</div>
                <div className="text-lg font-bold text-white truncate">{stats.mostReviewedBand || '-'}</div>
              </div>
              <div className="p-4 bg-[#0f0f0f] rounded-lg border border-gray-800">
                <div className="text-sm text-gray-400 mb-1">Último Álbum</div>
                <div className="text-sm text-white truncate">{stats.lastAlbum || '-'}</div>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl text-white mb-4">Atividade</h2>
            <HeatMapWithFilters />
          </div>
        </div>
      </div>

      {showExportPreview && <ExportPreview onClose={() => setShowExportPreview(false)} />}
    </div>
  );
}
