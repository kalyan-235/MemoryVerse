import axiosInstance from './axiosInstance';

// All diary-related API calls
export const diaryApi = {
  /** Get all diary entries for the current user */
  getAllDiaryEntries: async () => {
    const res = await axiosInstance.get('/diary');
    return res.data;
  },

  /** Get a single diary entry by ID */
  getDiaryEntryById: async (entryId) => {
    const res = await axiosInstance.get(`/diary/${entryId}`);
    return res.data;
  },

  /** Get diary entries for a specific date (YYYY-MM-DD) */
  getDiaryEntriesByDate: async (dateString) => {
    const res = await axiosInstance.get('/diary/by-date', { params: { date: dateString } });
    return res.data;
  },

  /** Create a new diary entry */
  createDiaryEntry: async (entryData) => {
    const res = await axiosInstance.post('/diary', entryData);
    return res.data;
  },

  /** Update an existing diary entry */
  updateDiaryEntry: async (entryId, updatedData) => {
    const res = await axiosInstance.put(`/diary/${entryId}`, updatedData);
    return res.data;
  },

  /** Delete a diary entry */
  deleteDiaryEntry: async (entryId) => {
    const res = await axiosInstance.delete(`/diary/${entryId}`);
    return res.data;
  },

  /** Toggle favorite on a diary entry */
  toggleFavoriteDiaryEntry: async (entryId) => {
    const res = await axiosInstance.patch(`/diary/${entryId}/favorite`);
    return res.data;
  },

  /** Search diary entries by keyword */
  searchDiaryEntries: async (query) => {
    const res = await axiosInstance.get('/diary/search', { params: { q: query } });
    return res.data;
  },
};
