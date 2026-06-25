import axiosInstance from './axiosInstance';

// All memory-related API calls
export const memoriesApi = {
  /** Fetch all memories for the logged-in user.
   *  Pass { map: true } to get only non-collection memories (for Journey Map)
   */
  getAllMemories: async (params = {}) => {
    const res = await axiosInstance.get('/memories', { params });
    return res.data;
  },

  /** Fetch a single memory by its ID.
   *  Pass source='collection' and collectionId to get prev/next within collection only.
   *  Default: prev/next within map memories (no collection).
   */
  getMemoryById: async (memoryId, options = {}) => {
    const params = {};
    if (options.source) params.source = options.source;
    if (options.collectionId) params.collectionId = options.collectionId;
    const res = await axiosInstance.get(`/memories/${memoryId}`, { params });
    return res.data;
  },

  /** Create a new memory — sends FormData for file uploads */
  createMemory: async (formData) => {
    // Do NOT set Content-Type header — axios + browser handle it automatically for FormData
    const res = await axiosInstance.post('/memories', formData);
    return res.data;
  },

  /** Update an existing memory */
  updateMemory: async (memoryId, updatedData) => {
    const res = await axiosInstance.put(`/memories/${memoryId}`, updatedData);
    return res.data;
  },

  /** Delete a memory permanently */
  deleteMemory: async (memoryId) => {
    const res = await axiosInstance.delete(`/memories/${memoryId}`);
    return res.data;
  },

  /** Toggle favorite status on a memory */
  toggleFavorite: async (memoryId) => {
    const res = await axiosInstance.patch(`/memories/${memoryId}/favorite`);
    return res.data;
  },

  /** Fetch all favorited memories */
  getFavoriteMemories: async () => {
    const res = await axiosInstance.get('/memories/favorites');
    return res.data;
  },

  /** Fetch memories for a specific date string YYYY-MM-DD */
  getMemoriesByDate: async (dateString) => {
    const res = await axiosInstance.get('/memories/by-date', { params: { date: dateString } });
    return res.data;
  },

  /** Fetch all dates (YYYY-MM-DD) that have memories in a given month */
  getDatesWithMemories: async (year, month) => {
    const res = await axiosInstance.get('/memories/calendar-dates', { params: { year, month } });
    return res.data; // string[]
  },

  /** Fetch memories belonging to a specific collection */
  getMemoriesByCollection: async (collectionId) => {
    const res = await axiosInstance.get(`/memories/collection/${collectionId}`);
    return res.data;
  },
};
