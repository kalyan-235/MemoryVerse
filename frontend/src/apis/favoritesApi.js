import axiosInstance from './axiosInstance';

// All favorites-related API calls
export const favoritesApi = {
  /** Get all favorited memories */
  getFavoriteMemories: async () => {
    const res = await axiosInstance.get('/favorites/memories');
    return res.data;
  },

  /** Get all favorited diary entries */
  getFavoriteDiaries: async () => {
    const res = await axiosInstance.get('/favorites/diaries');
    return res.data;
  },

  /** Get all favorited stories */
  getFavoriteStories: async () => {
    const res = await axiosInstance.get('/favorites/stories');
    return res.data;
  },

  /** Add an item to favorites */
  addToFavorites: async (itemType, itemId) => {
    const res = await axiosInstance.post('/favorites', { itemType, itemId });
    return res.data;
  },

  /** Remove an item from favorites */
  removeFromFavorites: async (itemType, itemId) => {
    const res = await axiosInstance.delete('/favorites', { data: { itemType, itemId } });
    return res.data;
  },
};
