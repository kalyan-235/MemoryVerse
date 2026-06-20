import axiosInstance from './axiosInstance';

// All collections-related API calls
export const collectionsApi = {
  /** Get all collections for the current user */
  getAllCollections: async () => {
    const res = await axiosInstance.get('/collections');
    return res.data;
  },

  /** Get a single collection by ID */
  getCollectionById: async (collectionId) => {
    const res = await axiosInstance.get(`/collections/${collectionId}`);
    return res.data;
  },

  /** Create a new collection */
  createCollection: async (collectionData) => {
    const res = await axiosInstance.post('/collections', collectionData);
    return res.data;
  },

  /** Update a collection name or cover image */
  updateCollection: async (collectionId, updates) => {
    const res = await axiosInstance.put(`/collections/${collectionId}`, updates);
    return res.data;
  },

  /** Delete a collection (memories inside are NOT deleted) */
  deleteCollection: async (collectionId) => {
    const res = await axiosInstance.delete(`/collections/${collectionId}`);
    return res.data;
  },

  /** Upload a cover image for a collection */
  uploadCollectionCover: async (collectionId, imageFile) => {
    const formData = new FormData();
    formData.append('coverImage', imageFile);
    const res = await axiosInstance.post(
      `/collections/${collectionId}/cover`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data;
  },
};
