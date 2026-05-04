import { Music, Plus, X, CheckCircle, Star, Edit, Trash2, Calendar, Download } from 'lucide-react';
import { useState } from 'react';
import { useAlbumStore, DiscographyAlbum } from '../store/albumStore';

export function DiscographiesNew() {
  const { albums, discographies, addDiscography, updateDiscography, deleteDiscography, addAlbum } = useAlbumStore();
  const [showForm, setShowForm] = useState(false);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [markingAsListened, setMarkingAsListened] = useState<{ band: string; album: DiscographyAlbum } | null>(null);
  const [quickScore, setQuickScore] = useState(70);
  const [formData, setFormData] = useState({
    bandName: '',
    albums: [] as DiscographyAlbum[],
  });
  const [newAlbum, setNewAlbum] = useState({ name: '', year: new Date().getFullYear(), cover: 'https://via.placeholder.com/150' });
  const [bulkInput, setBulkInput] = useState('');

  const handleAddAlbumToForm = () => {
    if (newAlbum.name && newAlbum.year) {
      setFormData({
        ...formData,
        albums: [...formData.albums, { ...newAlbum }],
      });
      setNewAlbum({ name: '', year: new Date().getFullYear(), cover: 'https://via.placeholder.com/150' });
    }
  };

  const handleBulkInput = () => {
    if (!bulkInput.trim()) return;

    const albumGroups = bulkInput.split('-').map(g => g.trim());
    const parsedAlbums: DiscographyAlbum[] = [];

    albumGroups.forEach(group => {
      const matches = group.match(/"([^"]+)"\s+"?(\d{4})"?/g);
      if (matches) {
        matches.forEach(match => {
          const parts = match.match(/"([^"]+)"\s+"?(\d{4})"?/);
          if (parts) {
            parsedAlbums.push({
              name: parts[1],
              year: parseInt(parts[2]),
              cover: 'https://via.placeholder.com/150',
            });
          }
        });
      }
    });

    if (parsedAlbums.length > 0) {
      setFormData({
        ...formData,
        albums: [...formData.albums, ...parsedAlbums],
      });
      setBulkInput('');
    }
  };

  const handleRemoveAlbumFromForm = (index: number) => {
    setFormData({
      ...formData,
      albums: formData.albums.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = () => {
    if (editingId) {
      updateDiscography(editingId, {
        bandName: formData.bandName,
        albums: formData.albums,
      });
      setEditingId(null);
    } else {
      addDiscography({
        bandName: formData.bandName,
        albums: formData.albums,
      });
    }

    setFormData({
      bandName: '',
      albums: [],
    });
    setShowForm(false);
  };

  const handleEdit = (disco: typeof discographies[0]) => {
    setFormData({
      bandName: disco.bandName,
      albums: disco.albums,
    });
    setEditingId(disco.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta discografia?')) {
      deleteDiscography(id);
    }
  };

  const handleExport = () => {
    setShowExportPreview(true);
  };

  const handleMarkAsListened = () => {
    if (!markingAsListened) return;

    const { band, album } = markingAsListened;
    const trackCount = 10; // Número padrão de faixas
    const scorePerTrack = Math.round(quickScore / 10);

    const tracks = Array.from({ length: trackCount }, (_, i) => ({
      name: `Faixa ${i + 1}`,
      rating: scorePerTrack,
      isFavorite: false,
    }));

    addAlbum({
      name: album.name,
      band: band,
      cover: album.cover,
      releaseYear: album.year,
      tracks: tracks,
      observations: 'Adicionado via discografia',
      finalScore: quickScore,
    });

    setMarkingAsListened(null);
    setQuickScore(70);
    alert(`✅ Álbum "${album.name}" marcado como ouvido com nota ${quickScore}!`);
  };

  const getAlbumReview = (bandName: string, albumName: string) => {
    return albums.find(
      (a) => a.band.toLowerCase() === bandName.toLowerCase() &&
             a.name.toLowerCase().includes(albumName.toLowerCase())
    );
  };

  const getBandStats = (bandName: string, discographyAlbums: DiscographyAlbum[]) => {
    const reviewed = discographyAlbums.filter((album) =>
      getAlbumReview(bandName, album.name)
    );

    const totalScore = reviewed.reduce((sum, album) => {
      const review = getAlbumReview(bandName, album.name);
      return sum + (review?.finalScore || 0);
    }, 0);

    const avgScore = reviewed.length > 0 ? (totalScore / reviewed.length).toFixed(1) : '0';
    const favorites = reviewed.filter((album) => {
      const review = getAlbumReview(bandName, album.name);
      return review?.favoriteTrack;
    });

    const percentage = discographyAlbums.length > 0
      ? Math.round((reviewed.length / discographyAlbums.length) * 100)
      : 0;

    return {
      total: discographyAlbums.length,
      reviewed: reviewed.length,
      avgScore,
      favorites: favorites.length,
      percentage,
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl md:text-4xl text-white">Discografias</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm md:text-base flex-1 sm:flex-none justify-center"
          >
            <Download className="w-5 h-5" />
            Exportar
          </button>
          <button
            onClick={() => {
              if (showForm) {
                setEditingId(null);
                setFormData({
                  bandName: '',
                  albums: [],
                });
              }
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm md:text-base flex-1 sm:flex-none justify-center"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? 'Cancelar' : 'Nova Discografia'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 space-y-6">
          <h2 className="text-2xl text-white">{editingId ? 'Editar Discografia' : 'Adicionar Nova Discografia'}</h2>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Nome da Banda</label>
            <input
              type="text"
              value={formData.bandName}
              onChange={(e) => setFormData({ ...formData, bandName: e.target.value })}
              className="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
              placeholder="Nome da banda..."
            />
          </div>

          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-xl text-white mb-4">Álbuns da Discografia</h3>

            <div className="mb-6 p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">
              <div className="text-white font-medium mb-2">Adicionar em Massa</div>
              <div className="text-sm text-gray-400 mb-3">
                Formato: "Album1" "Ano1" -"Album2" "Ano2" -"Album3" "Ano3"
                <br />
                Exemplo: "Ride the Lightning" "1984" -"Master of Puppets" "1986"
              </div>
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                className="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none resize-none mb-3"
                rows={3}
                placeholder='"Album 1" "1984" -"Album 2" "1986" -"Album 3" "1990"'
              />
              <button
                onClick={handleBulkInput}
                disabled={!bulkInput.trim()}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Processar Entrada em Massa
              </button>
            </div>

            <div className="text-sm text-gray-400 mb-3">Ou adicione um por vez:</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <input
                type="text"
                value={newAlbum.name}
                onChange={(e) => setNewAlbum({ ...newAlbum, name: e.target.value })}
                className="px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
                placeholder="Nome do álbum..."
              />
              <input
                type="number"
                value={newAlbum.year}
                onChange={(e) => setNewAlbum({ ...newAlbum, year: parseInt(e.target.value) || new Date().getFullYear() })}
                className="px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
                placeholder="Ano..."
              />
              <button
                onClick={handleAddAlbumToForm}
                disabled={!newAlbum.name}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Adicionar
              </button>
            </div>

            {formData.albums.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-gray-400 mb-2">Álbuns adicionados ({formData.albums.length}):</div>
                {formData.albums.map((album, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-gray-800"
                  >
                    <div className="flex-1">
                      <span className="text-white">{album.name}</span>
                      <span className="text-gray-400 ml-3">({album.year})</span>
                    </div>
                    <button
                      onClick={() => handleRemoveAlbumFromForm(index)}
                      className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!formData.bandName || formData.albums.length === 0}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {editingId ? 'Atualizar Discografia' : 'Salvar Discografia'}
          </button>
        </div>
      )}

      <div className="space-y-8">
        {discographies.length > 0 ? (
          discographies.map((disco) => {
            const stats = getBandStats(disco.bandName, disco.albums);
            const sortedAlbums = [...disco.albums].sort((a, b) => a.year - b.year);

            return (
              <div key={disco.id}>
                <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 mb-4">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h2 className="text-3xl text-white mb-2 flex items-center gap-3">
                        <Music className="w-8 h-8 text-blue-400" />
                        {disco.bandName}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Adicionado em {new Date(disco.dateAdded).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {disco.dateModified && (
                          <span>• Modificado em {new Date(disco.dateModified).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>

                      <div className="w-full bg-[#0f0f0f] rounded-full h-4 mb-2 overflow-hidden border border-gray-800">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 flex items-center justify-center text-xs font-bold text-white"
                          style={{ width: `${stats.percentage}%` }}
                        >
                          {stats.percentage > 15 && `${stats.percentage}%`}
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {stats.reviewed} de {stats.total} álbuns ouvidos — {stats.percentage}%
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(disco)}
                        className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded transition-colors"
                        title="Editar discografia"
                      >
                        <Edit className="w-5 h-5 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(disco.id)}
                        className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded transition-colors"
                        title="Excluir discografia"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-[#0f0f0f] rounded-lg border border-gray-800">
                      <div className="text-sm text-gray-400 mb-1">Total de Álbuns</div>
                      <div className="text-2xl font-bold text-white">{stats.total}</div>
                    </div>
                    <div className="p-4 bg-[#0f0f0f] rounded-lg border border-gray-800">
                      <div className="text-sm text-gray-400 mb-1">Já Ouvidos</div>
                      <div className="text-2xl font-bold text-green-400">{stats.reviewed}</div>
                    </div>
                    <div className="p-4 bg-[#0f0f0f] rounded-lg border border-gray-800">
                      <div className="text-sm text-gray-400 mb-1">Nota Média</div>
                      <div className="text-2xl font-bold text-blue-400">{stats.avgScore}</div>
                    </div>
                    <div className="p-4 bg-[#0f0f0f] rounded-lg border border-gray-800">
                      <div className="text-sm text-gray-400 mb-1">Com Favoritas</div>
                      <div className="text-2xl font-bold text-yellow-400">{stats.favorites}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {sortedAlbums.map((album, index) => {
                    const review = getAlbumReview(disco.bandName, album.name);

                    return (
                      <div
                        key={index}
                        className={`relative bg-[#1a1a1a] rounded-lg p-4 border-2 transition-all ${
                          review
                            ? 'border-green-500 bg-green-500/5'
                            : 'border-gray-800 hover:border-blue-500/50'
                        }`}
                      >
                        {review && (
                          <div className="absolute top-2 right-2 z-10">
                            <CheckCircle className="w-6 h-6 text-green-400 fill-current" />
                          </div>
                        )}

                        <img
                          src={album.cover}
                          alt={album.name}
                          className="w-full aspect-square rounded mb-3 object-cover"
                        />

                        <h3 className="text-white font-medium mb-1 line-clamp-2 min-h-[3rem] text-sm">
                          {album.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">{album.year}</p>

                        {review ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Nota:</span>
                              <span className="font-bold text-blue-400">{review.finalScore}</span>
                            </div>
                            {review.favoriteTrack && (
                              <div className="flex items-center gap-1 text-yellow-400 text-xs">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="truncate">{review.favoriteTrack}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setMarkingAsListened({ band: disco.bandName, album })}
                            className="w-full mt-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-xs font-medium transition-colors border border-blue-600/30"
                          >
                            + Marcar como Ouvido
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-[#1a1a1a] rounded-lg border border-gray-800">
            <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma discografia adicionada</p>
            <p className="text-sm text-gray-600 mt-2">
              Clique em "Nova Discografia" para começar
            </p>
          </div>
        )}
      </div>

      {markingAsListened && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-lg p-6 max-w-md w-full border border-gray-800">
            <h3 className="text-xl text-white mb-4">Marcar como Ouvido</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Álbum:</p>
                <p className="text-white font-medium">{markingAsListened.album.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Banda:</p>
                <p className="text-white font-medium">{markingAsListened.band}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Nota Final (será distribuída entre 10 faixas):
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={quickScore}
                  onChange={(e) => setQuickScore(parseInt(e.target.value) || 70)}
                  className="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nota sugerida: 70 (Boa) | Cada faixa receberá ~{Math.round(quickScore / 10)} pontos
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setMarkingAsListened(null);
                  setQuickScore(70);
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleMarkAsListened}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportPreview && <ExportPreview onClose={() => setShowExportPreview(false)} />}
    </div>
  );
}
