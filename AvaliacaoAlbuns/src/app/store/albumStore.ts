import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Track {
  name: string;
  rating: number;
  isFavorite: boolean;
}

export interface Album {
  id: string;
  name: string;
  band: string;
  cover: string;
  releaseYear: number;
  dateAdded: string;
  dateModified?: string;
  tracks: Track[];
  observations: string;
  finalScore: number;
  favoriteTrack?: string;
}

export interface ChangeLog {
  id: string;
  timestamp: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'album' | 'toplist' | 'discography' | 'nextalbum';
  entityId: string;
  entityName: string;
  details: string;
  userId: string;
}

export interface NextAlbum {
  id: string;
  name: string;
  band: string;
  cover: string;
  observations: string;
  alreadyReviewed: boolean;
  score?: number;
}

export interface TopList {
  id: string;
  title: string;
  type: 'albums' | 'tracks' | 'bands' | 'custom';
  items: TopListItem[];
  dateCreated: string;
}

export interface TopListItem {
  position: number;
  name: string;
  albumId?: string;
  dateAdded: string;
  dateModified?: string;
}

export interface Discography {
  id: string;
  bandName: string;
  albums: DiscographyAlbum[];
  dateAdded: string;
  dateModified?: string;
}

export interface DiscographyAlbum {
  name: string;
  year: number;
  cover: string;
}

interface AlbumStore {
  albums: Album[];
  nextAlbums: NextAlbum[];
  topLists: TopList[];
  discographies: Discography[];
  changeLogs: ChangeLog[];
  userId: string;
  addAlbum: (album: Omit<Album, 'id' | 'dateAdded'>) => void;
  updateAlbum: (id: string, album: Partial<Album>) => void;
  deleteAlbum: (id: string) => void;
  getTopAlbums: (count: number) => Album[];
  getRecentActivity: (count: number) => Album[];
  getStats: () => {
    totalAlbums: number;
    averageScore: number;
    mostReviewedBand: string;
    lastAlbum: string;
  };
  getActivityHeatMap: () => Record<string, number>;
  addNextAlbum: (album: Omit<NextAlbum, 'id'>) => void;
  updateNextAlbum: (id: string, album: Partial<NextAlbum>) => void;
  deleteNextAlbum: (id: string) => void;
  addTopList: (topList: Omit<TopList, 'id' | 'dateCreated'>) => void;
  updateTopList: (id: string, topList: Partial<TopList>) => void;
  deleteTopList: (id: string) => void;
  updateTopListItem: (listId: string, position: number, item: Partial<TopListItem>) => void;
  addDiscography: (discography: Omit<Discography, 'id' | 'dateAdded'>) => void;
  updateDiscography: (id: string, discography: Partial<Discography>) => void;
  deleteDiscography: (id: string) => void;
  logChange: (action: ChangeLog['action'], entityType: ChangeLog['entityType'], entityId: string, entityName: string, details: string) => void;
  getChangeLogsByDateRange: (startDate: string, endDate: string) => ChangeLog[];
}

export const useAlbumStore = create<AlbumStore>()(
  persist(
    (set, get) => ({
      albums: [],
      nextAlbums: [],
      topLists: [],
      discographies: [],
      changeLogs: [],
      userId: 'user-' + crypto.randomUUID(),

      addAlbum: (album) => {
        const newAlbum: Album = {
          ...album,
          id: crypto.randomUUID(),
          dateAdded: new Date().toISOString(),
        };
        set((state) => ({ albums: [...state.albums, newAlbum] }));
        get().logChange('create', 'album', newAlbum.id, newAlbum.name, `Álbum "${newAlbum.name}" de ${newAlbum.band} adicionado`);
      },

      updateAlbum: (id, albumData) => {
        const album = get().albums.find(a => a.id === id);
        if (album) {
          set((state) => ({
            albums: state.albums.map((a) =>
              a.id === id
                ? { ...a, ...albumData, dateModified: new Date().toISOString() }
                : a
            ),
          }));
          get().logChange('update', 'album', id, album.name, `Álbum "${album.name}" atualizado`);
        }
      },

      deleteAlbum: (id) => {
        const album = get().albums.find(a => a.id === id);
        if (album) {
          set((state) => ({
            albums: state.albums.filter((a) => a.id !== id),
          }));
          get().logChange('delete', 'album', id, album.name, `Álbum "${album.name}" removido`);
        }
      },

      getTopAlbums: (count) => {
        return [...get().albums]
          .sort((a, b) => b.finalScore - a.finalScore)
          .slice(0, count);
      },

      getRecentActivity: (count) => {
        return [...get().albums]
          .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
          .slice(0, count);
      },

      getStats: () => {
        const albums = get().albums;
        const totalAlbums = albums.length;
        const averageScore = totalAlbums > 0
          ? albums.reduce((sum, album) => sum + album.finalScore, 0) / totalAlbums
          : 0;

        const bandCounts: Record<string, number> = {};
        albums.forEach((album) => {
          bandCounts[album.band] = (bandCounts[album.band] || 0) + 1;
        });

        const mostReviewedBand = Object.keys(bandCounts).length > 0
          ? Object.keys(bandCounts).reduce((a, b) => bandCounts[a] > bandCounts[b] ? a : b)
          : '';

        const lastAlbum = albums.length > 0
          ? albums.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())[0].name
          : '';

        return { totalAlbums, averageScore, mostReviewedBand, lastAlbum };
      },

      getActivityHeatMap: () => {
        const heatMap: Record<string, number> = {};
        get().albums.forEach((album) => {
          const date = album.dateAdded.split('T')[0];
          heatMap[date] = (heatMap[date] || 0) + 1;
          if (album.dateModified) {
            const modDate = album.dateModified.split('T')[0];
            heatMap[modDate] = (heatMap[modDate] || 0) + 1;
          }
        });
        return heatMap;
      },

      addNextAlbum: (album) => {
        const newNextAlbum: NextAlbum = {
          ...album,
          id: crypto.randomUUID(),
        };
        set((state) => ({ nextAlbums: [...state.nextAlbums, newNextAlbum] }));
        get().logChange('create', 'nextalbum', newNextAlbum.id, newNextAlbum.name, `"${newNextAlbum.name}" adicionado à lista de próximos`);
      },

      updateNextAlbum: (id, albumData) => {
        const album = get().nextAlbums.find(a => a.id === id);
        if (album) {
          set((state) => ({
            nextAlbums: state.nextAlbums.map((a) =>
              a.id === id ? { ...a, ...albumData } : a
            ),
          }));
          get().logChange('update', 'nextalbum', id, album.name, `"${album.name}" atualizado na lista de próximos`);
        }
      },

      deleteNextAlbum: (id) => {
        const album = get().nextAlbums.find(a => a.id === id);
        if (album) {
          set((state) => ({
            nextAlbums: state.nextAlbums.filter((a) => a.id !== id),
          }));
          get().logChange('delete', 'nextalbum', id, album.name, `"${album.name}" removido da lista de próximos`);
        }
      },

      addTopList: (topList) => {
        const newTopList: TopList = {
          ...topList,
          id: crypto.randomUUID(),
          dateCreated: new Date().toISOString(),
        };
        set((state) => ({ topLists: [...state.topLists, newTopList] }));
        get().logChange('create', 'toplist', newTopList.id, newTopList.title, `Top List "${newTopList.title}" criada`);
      },

      updateTopList: (id, topListData) => {
        const list = get().topLists.find(l => l.id === id);
        if (list) {
          set((state) => ({
            topLists: state.topLists.map((l) =>
              l.id === id ? { ...l, ...topListData } : l
            ),
          }));
          get().logChange('update', 'toplist', id, list.title, `Top List "${list.title}" atualizada`);
        }
      },

      deleteTopList: (id) => {
        const list = get().topLists.find(l => l.id === id);
        if (list) {
          set((state) => ({
            topLists: state.topLists.filter((l) => l.id !== id),
          }));
          get().logChange('delete', 'toplist', id, list.title, `Top List "${list.title}" excluída`);
        }
      },

      updateTopListItem: (listId, position, itemData) => {
        set((state) => ({
          topLists: state.topLists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  items: list.items.map((item) =>
                    item.position === position
                      ? { ...item, ...itemData, dateModified: new Date().toISOString() }
                      : item
                  ),
                }
              : list
          ),
        }));
      },

      addDiscography: (discography) => {
        const newDiscography: Discography = {
          ...discography,
          id: crypto.randomUUID(),
          dateAdded: new Date().toISOString(),
        };
        set((state) => ({ discographies: [...state.discographies, newDiscography] }));
        get().logChange('create', 'discography', newDiscography.id, newDiscography.bandName, `Discografia de "${newDiscography.bandName}" adicionada com ${newDiscography.albums.length} álbuns`);
      },

      updateDiscography: (id, discographyData) => {
        const disco = get().discographies.find(d => d.id === id);
        if (disco) {
          set((state) => ({
            discographies: state.discographies.map((d) =>
              d.id === id
                ? { ...d, ...discographyData, dateModified: new Date().toISOString() }
                : d
            ),
          }));
          get().logChange('update', 'discography', id, disco.bandName, `Discografia de "${disco.bandName}" atualizada`);
        }
      },

      deleteDiscography: (id) => {
        const disco = get().discographies.find(d => d.id === id);
        if (disco) {
          set((state) => ({
            discographies: state.discographies.filter((d) => d.id !== id),
          }));
          get().logChange('delete', 'discography', id, disco.bandName, `Discografia de "${disco.bandName}" removida`);
        }
      },

      logChange: (action, entityType, entityId, entityName, details) => {
        const log: ChangeLog = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          action,
          entityType,
          entityId,
          entityName,
          details,
          userId: get().userId,
        };
        set((state) => ({ changeLogs: [...state.changeLogs, log] }));
      },

      getChangeLogsByDateRange: (startDate, endDate) => {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        return get().changeLogs.filter((log) => {
          const logTime = new Date(log.timestamp).getTime();
          return logTime >= start && logTime <= end;
        });
      },
    }),
    {
      name: 'album-storage',
    }
  )
);
