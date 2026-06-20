import axiosInstance from './axiosInstance';

// Profile management API calls
export const profileApi = {
  /** Get current user's profile */
  getProfile: async () => {
    const res = await axiosInstance.get('/profile');
    return res.data;
  },

  /** Update user profile info (name, bio, etc.) */
  updateProfile: async (profileData) => {
    const res = await axiosInstance.put('/profile', profileData);
    return res.data;
  },

  /** Upload a new profile picture */
  uploadProfilePhoto: async (imageFile) => {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    const res = await axiosInstance.post('/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /** Change password (requires current password) */
  changePassword: async (currentPassword, newPassword) => {
    const res = await axiosInstance.put('/profile/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },

  /** Permanently delete the user account */
  deleteAccount: async (password) => {
    const res = await axiosInstance.delete('/profile', { data: { password } });
    return res.data;
  },
};
