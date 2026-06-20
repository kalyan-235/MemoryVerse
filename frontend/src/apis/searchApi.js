import axiosInstance from './axiosInstance';

// Global search API calls
export const searchApi = {
  /**
   * Search across memories, diaries, stories, and collections.
   * @param {string} query - the search term
   * @param {string} filter - 'all' | 'memories' | 'diaries' | 'stories' | 'collections'
   */
  globalSearch: async (query, filter = 'all') => {
    const res = await axiosInstance.get('/search', { params: { q: query, filter } });
    return res.data; // { memories, diaries, stories, collections }
  },
};
