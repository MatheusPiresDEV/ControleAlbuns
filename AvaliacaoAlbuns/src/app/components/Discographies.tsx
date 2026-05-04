import { Search, Music, CheckCircle, Star } from 'lucide-react';
import { useState } from 'react';
import { useAlbumStore } from '../store/albumStore';

interface DiscographyAlbum {
  name: string;
  year: number;
  cover: string;
}

const mockDiscographies: Record<string, DiscographyAlbum[]> = {
  'Metallica': [
    { name: 'Kill \'Em All', year: 1983, cover: 'https://via.placeholder.com/150?text=KEA' },
    { name: 'Ride the Lightning', year: 1984, cover: 'https://upload.wikimedia.org/wikipedia/pt/6/69/Metallica_-_Ride_the_Lightning_cover.jpg' },
    { name: 'Master of Puppets', year: 1986, cover: 'https://via.placeholder.com/150?text=MOP' },
    { name: '...And Justice for All', year: 1988, cover: 'https://via.placeholder.com/150?text=AJFA' },
    { name: 'Metallica (Black Album)', year: 1991, cover: 'https://via.placeholder.com/150?text=Black' },
    { name: 'Load', year: 1996, cover: 'https://via.placeholder.com/150?text=Load' },
    { name: 'ReLoad', year: 1997, cover: 'https://via.placeholder.com/150?text=ReLoad' },
    { name: 'St. Anger', year: 2003, cover: 'https://via.placeholder.com/150?text=StAnger' },
    { name: 'Death Magnetic', year: 2008, cover: 'https://via.placeholder.com/150?text=DM' },
    { name: 'Hardwired... to Self-Destruct', year: 2016, cover: 'https://via.placeholder.com/150?text=HTSD' },
    { name: '72 Seasons', year: 2023, cover: 'https://via.placeholder.com/150?text=72S' },
  ],
  'Iron Maiden': [
    { name: 'Iron Maiden', year: 1980, cover: 'https://via.placeholder.com/150?text=IM' },
    { name: 'Killers', year: 1981, cover: 'https://via.placeholder.com/150?text=Killers' },
    { name: 'The Number of the Beast', year: 1982, cover: 'https://via.placeholder.com/150?text=NOTB' },
    { name: 'Piece of Mind', year: 1983, cover: 'https://via.placeholder.com/150?text=POM' },
    { name: 'Powerslave', year: 1984, cover: 'https://via.placeholder.com/150?text=PS' },
    { name: 'Somewhere in Time', year: 1986, cover: 'https://via.placeholder.com/150?text=SIT' },
    { name: 'Seventh Son of a Seventh Son', year: 1988, cover: 'https://via.placeholder.com/150?text=SSOASS' },
  ],
};

export function Discographies() {
  const { albums } = useAlbumStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedBands, setSearchedBands] = useState<string[]>([]);

  const handleSearch = () => {
    if (searchTerm && !searchedBands.includes(searchTerm)) {
      setSearchedBands([...searchedBands, searchTerm]);
    }
  };

  const getAlbumReview = (bandName: string, albumName: string) => {
    return albums.find(
      (a) => a.band.toLowerCase() === bandName.toLowerCase() &&
             a.name.toLowerCase() === albumName.toLowerCase()
    );
  };

  const getBandStats = (bandName: string, discography: DiscographyAlbum[]) => {
    const reviewed = discography.filter((album) =>
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

    return {
      total: discography.length,
      reviewed: reviewed.length,
      avgScore,
      favorites: favorites.length,
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl text-white">Discografias</h1>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:border-blue-500 outline-none"
              placeholder="Digite o nome da banda..."
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!searchTerm}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Buscar Discografia
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <strong>Bandas disponíveis:</strong> Metallica, Iron Maiden
        </div>
      </div>

      <div className="space-y-8">
        {searchedBands.map((bandName) => {
          const discography = mockDiscographies[bandName];

          if (!discography) {
            return (
              <div key={bandName} className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
                <h2 className="text-2xl text-white mb-4">{bandName}</h2>
                <div className="text-center py-8 text-gray-500">
                  Discografia não encontrada para esta banda
                </div>
              </div>
            );
          }

          const stats = getBandStats(bandName, discography);

          return (
            <div key={bandName}>
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 mb-4">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl text-white mb-2 flex items-center gap-3">
                      <Music className="w-8 h-8 text-blue-400" />
                      {bandName}
                    </h2>
                    <p className="text-gray-400">Discografia Completa</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Progresso</div>
                    <div className="text-3xl font-bold text-blue-400">
                      {stats.reviewed}/{stats.total}
                    </div>
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

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {discography.map((album) => {
                  const review = getAlbumReview(bandName, album.name);

                  return (
                    <div
                      key={album.name}
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

                      <h3 className="text-white font-medium mb-1 line-clamp-2 min-h-[3rem]">
                        {album.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">{album.year}</p>

                      {review ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Nota:</span>
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
                        <div className="text-xs text-gray-600 italic">Não avaliado</div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            </div>
          );
        })}

        {searchedBands.length === 0 && (
          <div className="text-center py-16 bg-[#1a1a1a] rounded-lg border border-gray-800">
            <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma discografia carregada</p>
            <p className="text-sm text-gray-600 mt-2">
              Digite o nome de uma banda acima para ver sua discografia
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
