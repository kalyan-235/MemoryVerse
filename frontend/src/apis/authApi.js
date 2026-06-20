import axiosInstance from './axiosInstance';

// All authentication-related API calls
export const authApi = {
  /** Register a new user and trigger email OTP */
  register: async (name, email, password) => {
    const res = await axiosInstance.post('/auth/register', { name, email, password });
    return res.data; // may include devOtp in development
  },

  /** Login and return JWT token + user data */
  login: async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    return res.data; // { token, user }
  },

  /** Verify email with OTP sent on registration */
  verifyEmailOtp: async (email, otp) => {
    const res = await axiosInstance.post('/auth/verify-email', { email, otp });
    return res.data;
  },

  /** Send a password reset OTP to the given email */
  forgotPassword: async (email) => {
    const res = await axiosInstance.post('/auth/forgot-password', { email });
    return res.data;
  },

  /** Verify the password reset OTP */
  verifyResetOtp: async (email, otp) => {
    const res = await axiosInstance.post('/auth/verify-reset-otp', { email, otp });
    return res.data;
  },

  /** Set a new password after OTP verification */
  resetPassword: async (email, otp, newPassword) => {
    const res = await axiosInstance.post('/auth/reset-password', { email, otp, newPassword });
    return res.data;
  },

  /** Resend OTP to the user's email */
  resendOtp: async (email) => {
    const res = await axiosInstance.post('/auth/resend-otp', { email });
    return res.data;
  },

  /** Logout — clears token on client side */
  logout: () => {
    localStorage.removeItem('memoryverse_token');
  },
};
