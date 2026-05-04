import { Trophy, Calendar, Lock } from 'lucide-react';
import { useAlbumStore } from '../store/albumStore';
import { useState } from 'react';

export function Top5() {
  const { albums, top5, updateTop5 } = useAlbumStore();
  const [editingPosition, setEditingPosition] = useState<number | null>(null);

  const getAlbumById = (id?: string) => {
    if (!id) return null;
    return albums.find((a) => a.id === id);
  };

  const handleUpdatePosition = (position: number, albumId: string) => {
    updateTop5(position, albumId);
    setEditingPosition(null);
  };

  const podiumColors = ['#FFD700', '#C0C0C0', '#CD7F32', '#4A90E2', '#E24A4A'];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h1 className="text-4xl text-white">Top 5</h1>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
          <Lock className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
          <div>
            <div className="text-yellow-400 font-medium mb-1">Primeiro Lugar Fixo</div>
            <div className="text-sm text-gray-400">
              O primeiro lugar está reservado para <span className="text-white font-medium">Ride the Lightning (Metallica)</span> e não pode ser alterado.
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {top5.map((item) => {
            const album = getAlbumById(item.albumId);
            const isFixed = item.position === 1;

            return (
              <div
                key={item.position}
                className="relative bg-gradient-to-r from-[#0f0f0f] to-[#1a1a1a] rounded-lg p-6 border-2 transition-all"
                style={{ borderColor: podiumColors[item.position - 1] }}
              >
                <div className="flex items-center gap-6">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${podiumColors[item.position - 1]}40, ${podiumColors[item.position - 1]}20)`,
                      border: `2px solid ${podiumColors[item.position - 1]}`,
                    }}
                  >
                    <span className="text-3xl font-bold text-white">{item.position}</span>
                  </div>

                  {isFixed ? (
                    <div className="flex-1 flex items-center gap-4">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/pt/6/69/Metallica_-_Ride_the_Lightning_cover.jpg"
                        alt="Ride the Lightning"
                        className="w-20 h-20 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-medium text-white mb-1">Ride the Lightning</h3>
                        <p className="text-gray-400">Metallica</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Lock className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-yellow-400">Posição Fixa</span>
                        </div>
                      </div>
                    </div>
                  ) : album ? (
                    <div className="flex-1 flex items-center gap-4">
                      <img
                        src={album.cover}
                        alt={album.name}
                        className="w-20 h-20 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-medium text-white mb-1">{album.name}</h3>
                        <p className="text-gray-400">{album.band}</p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Adicionado: {new Date(item.dateAdded).toLocaleDateString('pt-BR')}
                          </span>
                          {item.dateModified && (
                            <span>
                              • Modificado: {new Date(item.dateModified).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingPosition(item.position)}
                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
                      >
                        Alterar
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between">
                      <div className="text-gray-500">Nenhum álbum selecionado</div>
                      <button
                        onClick={() => setEditingPosition(item.position)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Selecionar Álbum
                      </button>
                    </div>
                  )}
                </div>

                {editingPosition === item.position && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="text-sm text-gray-400 mb-3">Selecione um álbum:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {albums.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => handleUpdatePosition(item.position, a.id)}
                          className="flex items-center gap-3 p-3 bg-[#0f0f0f] hover:bg-blue-600/20 rounded-lg border border-gray-800 hover:border-blue-500 transition-all text-left"
                        >
                          <img src={a.cover} alt={a.name} className="w-12 h-12 rounded" />
                          <div className="flex-1 min-w-0">
                            <div className="text-white truncate">{a.name}</div>
                            <div className="text-sm text-gray-400 truncate">{a.band}</div>
                          </div>
                          <div className="text-blue-400 font-bold">{a.finalScore}</div>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setEditingPosition(null)}
                      className="mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
