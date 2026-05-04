import { useState } from 'react';
import { Plus, Save, X, Star, Download } from 'lucide-react';
import { useAlbumStore, Track } from '../store/albumStore';
import { AlbumCard } from './AlbumCard';

const ratingOptions = [
  { label: 'Foda', value: 10, color: 'text-green-400' },
  { label: 'Otimaa', value: 9, color: 'text-green-300' },
  { label: 'Ótima', value: 8, color: 'text-blue-400' },
  { label: 'Boa', value: 7, color: 'text-blue-300' },
  { label: '+-', value: 6, color: 'text-yellow-400' },
  { label: 'Desgracera', value: 5, color: 'text-orange-400' },
  { label: 'Horrível', value: 3, color: 'text-red-400' },
  { label: 'Funk', value: -1, color: 'text-red-600' },
];

export function AlbumsSection() {
  const { albums, addAlbum, updateAlbum } = useAlbumStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    band: '',
    cover: 'https://via.placeholder.com/300',
    releaseYear: new Date().getFullYear(),
    tracks: [] as Track[],
    observations: '',
  });
  const [trackRating, setTrackRating] = useState<number>(7);

  const handleAddTrack = () => {
    const trackNumber = formData.tracks.length + 1;
    setFormData({
      ...formData,
      tracks: [...formData.tracks, { name: `Faixa ${trackNumber}`, rating: trackRating, isFavorite: false }],
    });
    setTrackRating(7); // Reset para nota padrão
  };

  const handleUpdateTrack = (index: number, field: keyof Track, value: any) => {
    const newTracks = [...formData.tracks];
    if (field === 'isFavorite' && value) {
      newTracks.forEach((t, i) => {
        if (i !== index) t.isFavorite = false;
      });
    }
    newTracks[index] = { ...newTracks[index], [field]: value };
    setFormData({ ...formData, tracks: newTracks });
  };

  const handleRemoveTrack = (index: number) => {
    setFormData({
      ...formData,
      tracks: formData.tracks.filter((_, i) => i !== index),
    });
  };

  const calculateFinalScore = (tracks: Track[]) => {
    return tracks.reduce((sum, track) => sum + track.rating, 0);
  };

  const handleSubmit = () => {
    const favoriteTrack = formData.tracks.find(t => t.isFavorite)?.name;
    const finalScore = calculateFinalScore(formData.tracks);

    const albumData = {
      ...formData,
      finalScore,
      favoriteTrack,
    };

    if (editingId) {
      updateAlbum(editingId, albumData);
      setEditingId(null);
    } else {
      addAlbum(albumData);
    }

    setFormData({
      name: '',
      band: '',
      cover: 'https://via.placeholder.com/300',
      releaseYear: new Date().getFullYear(),
      tracks: [],
      observations: '',
    });
    setTrackRating(7);
    setShowForm(false);
  };

  const handleEdit = (album: any) => {
    setFormData({
      name: album.name,
      band: album.band,
      cover: album.cover,
      releaseYear: album.releaseYear,
      tracks: album.tracks,
      observations: album.observations,
    });
    setEditingId(album.id);
    setShowForm(true);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(albums, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `albuns-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl md:text-4xl text-white">Álbuns</h1>
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
                  name: '',
                  band: '',
                  cover: 'https://via.placeholder.com/300',
                  releaseYear: new Date().getFullYear(),
                  tracks: [],
                  observations: '',
                });
                setTrackRating(7);
              }
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm md:text-base flex-1 sm:flex-none justify-center"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? 'Cancelar' : 'Adicionar Álbum'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-[#1a1a1a] rounded-lg p-4 md:p-6 border border-gray-800 space-y-4 md:space-y-6">
          <h2 className="text-xl md:text-2xl text-white">{editingId ? 'Editar Álbum' : 'Novo Álbum'}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nome do Álbum</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
                placeholder="Nome do álbum..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Banda</label>
              <input
                type="text"
                value={formData.band}
                onChange={(e) => setFormData({ ...formData, band: e.target.value })}
                className="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
                placeholder="Nome da banda..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">URL da Capa</label>
              <input
                type="text"
                value={formData.cover}
                onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                className="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
                placeholder="URL da capa..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Ano de Lançamento</label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear() + 5}
                value={formData.releaseYear}
                onChange={(e) => setFormData({ ...formData, releaseYear: parseInt(e.target.value) || new Date().getFullYear() })}
                className="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm text-gray-400">Músicas ({formData.tracks.length})</label>
            </div>

            <div className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg mb-4">
              <div className="text-white font-medium mb-3">Adicionar Faixa</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Nota da Faixa {formData.tracks.length + 1}</label>
                  <select
                    value={trackRating}
                    onChange={(e) => setTrackRating(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
                  >
                    {ratingOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.value})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAddTrack}
                    className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors h-[42px]"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Faixa {formData.tracks.length + 1}
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-3 p-2 bg-blue-600/10 rounded">
                💡 Apenas selecione a nota e clique em adicionar. A faixa será nomeada automaticamente.
              </div>
            </div>

            {formData.tracks.length > 0 && (
              <div className="space-y-3">
                {formData.tracks.map((track, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-3 bg-[#0f0f0f] rounded-lg border border-gray-800">
                  <div className="w-8 text-center text-gray-500 font-mono hidden sm:block">{index + 1}</div>
                  <div className="sm:hidden text-xs text-gray-500 font-mono">Faixa {index + 1}</div>
                  <input
                    type="text"
                    value={track.name}
                    onChange={(e) => handleUpdateTrack(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded text-white outline-none focus:border-blue-500 text-sm md:text-base"
                    placeholder="Nome da música..."
                  />
                  <select
                    value={track.rating}
                    onChange={(e) => handleUpdateTrack(index, 'rating', Number(e.target.value))}
                    className="px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded text-white outline-none focus:border-blue-500 text-sm md:text-base"
                  >
                    {ratingOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.value})
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2 sm:contents">
                    <button
                      onClick={() => handleUpdateTrack(index, 'isFavorite', !track.isFavorite)}
                      className={`flex-1 sm:flex-none p-2 rounded ${track.isFavorite ? 'bg-yellow-500/20' : 'bg-gray-800 hover:bg-gray-700'}`}
                    >
                      <Star className={`w-4 h-4 md:w-5 md:h-5 mx-auto ${track.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}`} />
                    </button>
                    <button
                      onClick={() => handleRemoveTrack(index)}
                      className="flex-1 sm:flex-none p-2 bg-red-600/20 hover:bg-red-600/30 rounded"
                    >
                      <X className="w-4 h-4 md:w-5 md:h-5 mx-auto text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
              </div>
            )}

            {formData.tracks.length > 0 && (
              <div className="mt-4 p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">
                <div className="text-sm text-gray-400">Nota Final Proporcional</div>
                <div className="text-3xl font-bold text-blue-400">
                  {calculateFinalScore(formData.tracks)} / {formData.tracks.length * 10}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Observações</label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              className="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none resize-none"
              rows={4}
              placeholder="Suas observações sobre o álbum..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!formData.name || !formData.band || formData.tracks.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Save className="w-5 h-5" />
            {editingId ? 'Atualizar Álbum' : 'Salvar Álbum'}
          </button>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl text-white">Álbuns Avaliados ({albums.length})</h2>
        {albums.length > 0 ? (
          <>
            {Object.entries(
              albums.reduce((acc, album) => {
                const date = new Date(album.dateAdded).toLocaleDateString('pt-BR');
                if (!acc[date]) acc[date] = [];
                acc[date].push(album);
                return acc;
              }, {} as Record<string, typeof albums>)
            )
              .sort((a, b) => new Date(b[1][0].dateAdded).getTime() - new Date(a[1][0].dateAdded).getTime())
              .map(([date, albumsOnDate]) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                    <div className="text-sm text-blue-400 font-medium">{date}</div>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                  </div>
                  <div className="space-y-3">
                    {albumsOnDate.map((album) => (
                      <AlbumCard key={album.id} album={album} onEdit={() => handleEdit(album)} />
                    ))}
                  </div>
                </div>
              ))}
          </>
        ) : (
          <div className="text-center py-16 bg-[#1a1a1a] rounded-lg border border-gray-800">
            <p className="text-gray-500">Nenhum álbum avaliado ainda</p>
            <p className="text-sm text-gray-600 mt-2">Clique em "Adicionar Álbum" para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}
