import axiosInstance from './axiosInstance';

export const favoritesApi = {
  getFavoriteMemories: async () => {
    const res = await axiosInstance.get('/favorites/memories');
    return res.data;
  },
  getFavoriteDiaries: async () => {
    const res = await axiosInstance.get('/favorites/diaries');
    return res.data;
  },
  getFavoriteStories: async () => {
    const res = await axiosInstance.get('/favorites/stories');
    return res.data;
  },
};
