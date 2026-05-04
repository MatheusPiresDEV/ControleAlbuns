import { Trophy, Plus, Edit, Trash2, Lock, Calendar, Music, Download } from 'lucide-react';
import { useState } from 'react';
import { useAlbumStore, TopList } from '../store/albumStore';

export function TopLists() {
  const { albums, topLists, addTopList, updateTopList, deleteTopList, updateTopListItem } = useAlbumStore();
  const [showForm, setShowForm] = useState(false);
  const [editingList, setEditingList] = useState<string | null>(null);
  const [editingPosition, setEditingPosition] = useState<{ listId: string; position: number } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'custom' as 'albums' | 'tracks' | 'bands' | 'custom',
    itemCount: 5,
  });

  const handleCreateTopList = () => {
    const items = Array.from({ length: formData.itemCount }, (_, i) => ({
      position: i + 1,
      name: formData.type === 'albums' && i === 0 ? 'Ride the Lightning - Metallica' : '',
      dateAdded: new Date().toISOString(),
    }));

    addTopList({
      title: formData.title,
      type: formData.type,
      items,
    });

    setFormData({ title: '', type: 'custom', itemCount: 5 });
    setShowForm(false);
  };

  const handleUpdateItem = (listId: string, position: number, name: string, albumId?: string) => {
    updateTopListItem(listId, position, { name, albumId });
    setEditingPosition(null);
  };

  const handleDeleteList = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta lista?')) {
      deleteTopList(id);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(topLists, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `top-lists-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const getAlbumById = (id?: string) => {
    if (!id) return null;
    return albums.find((a) => a.id === id);
  };

  const podiumColors = ['#FFD700', '#C0C0C0', '#CD7F32', '#4A90E2', '#E24A4A', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
          <h1 className="text-3xl md:text-4xl text-white">Top Lists</h1>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm md:text-base flex-1 sm:flex-none justify-center"
          >
            <Download className="w-5 h-5" />
            Exportar
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm md:text-base flex-1 sm:flex-none justify-center"
          >
            <Plus className="w-5 h-5" />
            Nova Lista Top
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 space-y-4">
          <h2 className="text-2xl text-white">Criar Nova Lista Top</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Título da Lista</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
                placeholder="Ex: Top 10 Álbuns de Metal"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
              >
                <option value="albums">Álbuns</option>
                <option value="tracks">Músicas</option>
                <option value="bands">Bandas</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Número de Itens</label>
              <input
                type="number"
                min="3"
                max="20"
                value={formData.itemCount}
                onChange={(e) => setFormData({ ...formData, itemCount: parseInt(e.target.value) || 5 })}
                className="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {formData.type === 'albums' && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <Lock className="w-4 h-4" />
                <span>O primeiro lugar será fixo: Ride the Lightning - Metallica</span>
              </div>
            </div>
          )}

          <button
            onClick={handleCreateTopList}
            disabled={!formData.title}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Criar Lista
          </button>
        </div>
      )}

      <div className="space-y-8">
        {topLists.length > 0 ? (
          topLists.map((list) => (
            <div key={list.id} className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl text-white mb-1">{list.title}</h2>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="px-2 py-1 bg-blue-600/20 rounded text-blue-400">
                      {list.type === 'albums' ? 'Álbuns' : list.type === 'tracks' ? 'Músicas' : list.type === 'bands' ? 'Bandas' : 'Personalizado'}
                    </span>
                    <Calendar className="w-4 h-4" />
                    <span>Criado em {new Date(list.dateCreated).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteList(list.id)}
                  className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>

              <div className="space-y-3">
                {list.items.map((item) => {
                  const isFixed = list.type === 'albums' && item.position === 1;
                  const album = list.type === 'albums' ? getAlbumById(item.albumId) : null;
                  const colorIndex = Math.min(item.position - 1, podiumColors.length - 1);

                  return (
                    <div
                      key={item.position}
                      className="relative bg-gradient-to-r from-[#0f0f0f] to-[#1a1a1a] rounded-lg p-4 border-2 transition-all"
                      style={{ borderColor: podiumColors[colorIndex] }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${podiumColors[colorIndex]}40, ${podiumColors[colorIndex]}20)`,
                            border: `2px solid ${podiumColors[colorIndex]}`,
                          }}
                        >
                          <span className="text-2xl font-bold text-white">{item.position}</span>
                        </div>

                        {isFixed ? (
                          <div className="flex-1 flex items-center gap-4">
                            <img
                              src="https://upload.wikimedia.org/wikipedia/pt/6/69/Metallica_-_Ride_the_Lightning_cover.jpg"
                              alt="Ride the Lightning"
                              className="w-16 h-16 rounded object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-white">Ride the Lightning - Metallica</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Lock className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm text-yellow-400">Posição Fixa</span>
                              </div>
                            </div>
                          </div>
                        ) : item.name || album ? (
                          <div className="flex-1 flex items-center gap-4">
                            {album && (
                              <img src={album.cover} alt={album.name} className="w-16 h-16 rounded object-cover" />
                            )}
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-white">
                                {album ? `${album.name} - ${album.band}` : item.name}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>Adicionado: {new Date(item.dateAdded).toLocaleDateString('pt-BR')}</span>
                                {item.dateModified && (
                                  <span>• Modificado: {new Date(item.dateModified).toLocaleDateString('pt-BR')}</span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => setEditingPosition({ listId: list.id, position: item.position })}
                              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
                            >
                              Alterar
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-between">
                            <div className="text-gray-500">Posição vazia</div>
                            <button
                              onClick={() => setEditingPosition({ listId: list.id, position: item.position })}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              Preencher
                            </button>
                          </div>
                        )}
                      </div>

                      {editingPosition?.listId === list.id && editingPosition?.position === item.position && (
                        <div className="mt-4 pt-4 border-t border-gray-800">
                          {list.type === 'albums' ? (
                            <>
                              <div className="text-sm text-gray-400 mb-3">Selecione um álbum ou adicione manualmente:</div>
                              <div className="mb-4">
                                <input
                                  type="text"
                                  placeholder="Ou digite o nome do álbum manualmente..."
                                  className="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      const input = e.target as HTMLInputElement;
                                      if (input.value.trim()) {
                                        handleUpdateItem(list.id, item.position, input.value);
                                      }
                                    }
                                  }}
                                />
                              </div>
                              <div className="text-xs text-gray-500 mb-3">Álbuns cadastrados no site:</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                                {albums.map((a) => (
                                  <button
                                    key={a.id}
                                    onClick={() => handleUpdateItem(list.id, item.position, `${a.name} - ${a.band}`, a.id)}
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
                            </>
                          ) : list.type === 'bands' ? (
                            <>
                              <div className="text-sm text-gray-400 mb-3">Selecione uma banda ou adicione manualmente:</div>
                              <div className="mb-4">
                                <input
                                  type="text"
                                  placeholder="Ou digite o nome da banda manualmente..."
                                  className="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      const input = e.target as HTMLInputElement;
                                      if (input.value.trim()) {
                                        handleUpdateItem(list.id, item.position, input.value);
                                      }
                                    }
                                  }}
                                />
                              </div>
                              <div className="text-xs text-gray-500 mb-3">Bandas cadastradas no site:</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                                {Array.from(new Set(albums.map(a => a.band))).sort().map((band) => (
                                  <button
                                    key={band}
                                    onClick={() => handleUpdateItem(list.id, item.position, band)}
                                    className="flex items-center gap-3 p-3 bg-[#0f0f0f] hover:bg-blue-600/20 rounded-lg border border-gray-800 hover:border-blue-500 transition-all text-left"
                                  >
                                    <Music className="w-5 h-5 text-blue-400" />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-white truncate">{band}</div>
                                      <div className="text-xs text-gray-400">
                                        {albums.filter(a => a.band === band).length} {albums.filter(a => a.band === band).length === 1 ? 'álbum' : 'álbuns'}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-sm text-gray-400 mb-3">Digite o nome:</div>
                              <input
                                type="text"
                                placeholder="Nome do item..."
                                className="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none mb-3"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    const input = e.target as HTMLInputElement;
                                    if (input.value.trim()) {
                                      handleUpdateItem(list.id, item.position, input.value);
                                    }
                                  }
                                }}
                              />
                            </>
                          )}
                          <button
                            onClick={() => setEditingPosition(null)}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors mt-3"
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
          ))
        ) : (
          <div className="text-center py-16 bg-[#1a1a1a] rounded-lg border border-gray-800">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma lista Top criada ainda</p>
            <p className="text-sm text-gray-600 mt-2">Clique em "Nova Lista Top" para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}
