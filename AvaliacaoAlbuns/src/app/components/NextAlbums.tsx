import { Plus, X, CheckCircle, AlertCircle, Download, Edit } from 'lucide-react';
import { useState } from 'react';
import { useAlbumStore } from '../store/albumStore';

export function NextAlbums() {
  const { albums, nextAlbums, addNextAlbum, updateNextAlbum, deleteNextAlbum } = useAlbumStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    band: '',
    cover: 'https://via.placeholder.com/300',
    observations: '',
    alreadyReviewed: false,
    score: 0,
  });

  const checkIfReviewed = (albumName: string, bandName: string) => {
    const normalizeString = (str: string) =>
      str.toLowerCase().trim().replace(/[^\w\s]/g, '');

    const normalizedAlbumName = normalizeString(albumName);
    const normalizedBandName = normalizeString(bandName);

    return albums.find((a) => {
      const albumMatch = normalizeString(a.name);
      const bandMatch = normalizeString(a.band);

      return (
        albumMatch.includes(normalizedAlbumName) ||
        normalizedAlbumName.includes(albumMatch)
      ) && (
        bandMatch.includes(normalizedBandName) ||
        normalizedBandName.includes(bandMatch)
      );
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.band.trim()) {
      alert('Por favor, preencha o nome do álbum e da banda');
      return;
    }

    const reviewedAlbum = !formData.alreadyReviewed ? checkIfReviewed(formData.name, formData.band) : null;

    if (reviewedAlbum && !formData.alreadyReviewed) {
      const shouldContinue = window.confirm(
        `Encontramos um álbum similar já avaliado:\n\n` +
        `"${reviewedAlbum.name}" - ${reviewedAlbum.band}\n` +
        `Nota: ${reviewedAlbum.finalScore}\n\n` +
        `Deseja adicionar mesmo assim?`
      );

      if (!shouldContinue) return;
    }

    const albumData = {
      name: formData.name,
      band: formData.band,
      cover: formData.cover,
      observations: formData.observations,
      alreadyReviewed: formData.alreadyReviewed,
      score: formData.alreadyReviewed ? formData.score : (reviewedAlbum?.finalScore || undefined),
    };

    if (editingId) {
      updateNextAlbum(editingId, albumData);
      setEditingId(null);
    } else {
      addNextAlbum(albumData);
    }

    setFormData({
      name: '',
      band: '',
      cover: 'https://via.placeholder.com/300',
      observations: '',
      alreadyReviewed: false,
      score: 0,
    });
    setShowForm(false);
  };

  const handleEdit = (album: typeof nextAlbums[0]) => {
    setFormData({
      name: album.name,
      band: album.band,
      cover: album.cover,
      observations: album.observations,
      alreadyReviewed: album.alreadyReviewed,
      score: album.score || 0,
    });
    setEditingId(album.id);
    setShowForm(true);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(nextAlbums, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proximos-albuns-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleDelete = (id: string) => {
    deleteNextAlbum(id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl md:text-4xl text-white">Próximos Álbuns</h1>
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
              setShowForm(!showForm);
              if (showForm) {
                setEditingId(null);
                setFormData({
                  name: '',
                  band: '',
                  cover: 'https://via.placeholder.com/300',
                  observations: '',
                  alreadyReviewed: false,
                  score: 0,
                });
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm md:text-base flex-1 sm:flex-none justify-center"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? 'Cancelar' : 'Adicionar'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 space-y-4">
          <h2 className="text-2xl text-white">{editingId ? 'Editar Álbum' : 'Novo Álbum na Lista'}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="p-4 bg-purple-600/10 border border-purple-600/30 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="alreadyReviewed"
                checked={formData.alreadyReviewed}
                onChange={(e) => setFormData({ ...formData, alreadyReviewed: e.target.checked })}
                className="w-5 h-5 rounded bg-[#0f0f0f] border-gray-700 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="alreadyReviewed" className="text-white font-medium cursor-pointer">
                Já ouvi este álbum
              </label>
            </div>

            {formData.alreadyReviewed && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nota Manual</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-purple-500 outline-none"
                  placeholder="Digite a nota..."
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Expectativas/Observações</label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              className="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none resize-none"
              rows={3}
              placeholder="O que você espera deste álbum..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!formData.name || !formData.band}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {editingId ? 'Atualizar' : 'Adicionar à Lista'}
          </button>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl text-white">Lista de Espera ({nextAlbums.length})</h2>

        {nextAlbums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nextAlbums.map((album) => (
              <div
                key={album.id}
                className={`bg-[#1a1a1a] rounded-lg p-4 border-2 transition-all ${
                  album.alreadyReviewed
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-gray-800 hover:border-blue-500/50'
                }`}
              >
                <div className="flex gap-4">
                  <img
                    src={album.cover}
                    alt={album.name}
                    className="w-24 h-24 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium mb-1 truncate">{album.name}</h3>
                    <p className="text-sm text-gray-400 mb-2 truncate">{album.band}</p>

                    {album.alreadyReviewed ? (
                      <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Já avaliado - Nota: {album.score}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-blue-400 text-sm mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Aguardando avaliação</span>
                      </div>
                    )}

                    {album.observations && (
                      <p className="text-sm text-gray-500 italic line-clamp-2">
                        {album.observations}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEdit(album)}
                      className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(album.id)}
                      className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded transition-colors"
                      title="Excluir"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#1a1a1a] rounded-lg border border-gray-800">
            <p className="text-gray-500">Nenhum álbum na lista de espera</p>
            <p className="text-sm text-gray-600 mt-2">
              Adicione álbuns que você pretende ouvir em breve
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
