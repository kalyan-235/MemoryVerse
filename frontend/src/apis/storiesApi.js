import axiosInstance from './axiosInstance';

// All story-related API calls
export const storiesApi = {
  /** Get all stories for the current user */
  getAllStories: async () => {
    const res = await axiosInstance.get('/stories');
    return res.data;
  },

  /** Get a single story with all chapters */
  getStoryById: async (storyId) => {
    const res = await axiosInstance.get(`/stories/${storyId}`);
    return res.data;
  },

  /** Create a new story */
  createStory: async (storyData) => {
    const res = await axiosInstance.post('/stories', storyData);
    return res.data;
  },

  /** Update story metadata (title, genre, logline) */
  updateStory: async (storyId, updates) => {
    const res = await axiosInstance.put(`/stories/${storyId}`, updates);
    return res.data;
  },

  /** Delete a story and all its chapters */
  deleteStory: async (storyId) => {
    const res = await axiosInstance.delete(`/stories/${storyId}`);
    return res.data;
  },

  /** Add a new chapter to a story */
  addChapter: async (storyId, chapterData) => {
    const res = await axiosInstance.post(`/stories/${storyId}/chapters`, chapterData);
    return res.data;
  },

  /** Update a specific chapter's content by index */
  updateChapter: async (storyId, chapterIndex, content) => {
    const res = await axiosInstance.put(
      `/stories/${storyId}/chapters/${chapterIndex}`,
      { content },
    );
    return res.data;
  },

  /** Search stories by title or genre */
  searchStories: async (query) => {
    const res = await axiosInstance.get('/stories/search', { params: { q: query } });
    return res.data;
  },
};
