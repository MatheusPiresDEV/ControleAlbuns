import { Star, Calendar, Edit } from 'lucide-react';

interface AlbumCardProps {
  album: {
    name: string;
    band: string;
    cover: string;
    finalScore: number;
    favoriteTrack?: string;
    dateAdded: string;
    releaseYear: number;
  };
  onEdit?: () => void;
}

export function AlbumCard({ album, onEdit }: AlbumCardProps) {
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800 hover:border-blue-500/50 transition-all group">
      <div className="flex gap-4">
        <img src={album.cover} alt={album.name} className="w-24 h-24 rounded object-cover" />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-white font-medium">{album.name}</h3>
              <p className="text-sm text-gray-400">{album.band}</p>
            </div>
            {onEdit && (
              <button
                onClick={onEdit}
                className="md:opacity-0 md:group-hover:opacity-100 transition-opacity p-2 hover:bg-blue-600/20 rounded-lg bg-blue-600/10"
                title="Editar álbum"
              >
                <Edit className="w-4 h-4 text-blue-400" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-4 h-4" />
              {album.releaseYear}
            </div>
            <div className="text-blue-400 font-bold">
              Nota: {album.finalScore}
            </div>
          </div>
          {album.favoriteTrack && (
            <div className="flex items-center gap-1 mt-2 text-yellow-400 text-sm">
              <Star className="w-4 h-4 fill-current" />
              <span className="truncate">{album.favoriteTrack}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
