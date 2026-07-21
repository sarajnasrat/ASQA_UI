import httpClient from "../api/httpClient";

const USER_BASE = "/users";

export const UserService = {
  /* ================= USERS ================= */

  getAllUsers() {
    return httpClient.get(`${USER_BASE}/all-users`);
  },

  getPaginatedUsers(params: any) {
    return httpClient.get(`${USER_BASE}/pagenated-users`, { params });
  },

  searchUsers(params: any) {
    return httpClient.get(`${USER_BASE}/search`, { params });
  },

  registerUser(data: any) {
    return httpClient.post(`${USER_BASE}/register`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getUser(id: number) {
    return httpClient.get(`${USER_BASE}/${id}`);
  },

  updateUser(id: string | number, data: any) {
    return httpClient.put(`${USER_BASE}/update/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteUser(id: string | number) {
    return httpClient.delete(`${USER_BASE}/delete/${id}`);
  },

  resetUserPassword(id: string | number, data: { newPassword: string; confirmNewPassword: string }) {
    return httpClient.put(`${USER_BASE}/${id}/reset-password`, data);
  },

  /* ================= EMAIL OTP ================= */
 forgotPassword(email: string) {
    return httpClient.post(`${USER_BASE}/forgot-password`, {
      email,
    });
  },
  // ✅ Send OTP Code
  sendOtp(email: string) {
    return httpClient.post(`${USER_BASE}/send-otp`, {
      email,
    });
  },

  // ✅ Verify OTP Code
  verifyOtp(email: string, otp: string) {
    return httpClient.post(`${USER_BASE}/verify-otp-code`, null, {
      params: { email, otp },
    });
  },

  /* ================= VALIDATE OTP ================= */

// ✅ Validate OTP Code (ONLY otpCode)
validateOtpCode(otpCode: string) {
  return httpClient.post(`${USER_BASE}/validate-otp-code`, {
    otpCode,
  });
},
  /* ================= RESET PASSWORD ================= */

  resetPassword(resetToken: string, data: any) {
    return httpClient.post(`${USER_BASE}/reset-password`, data, {
      headers: {
        Authorization: resetToken,
        "Content-Type": "application/json",
      },
    });
  },
};

export default UserService;
