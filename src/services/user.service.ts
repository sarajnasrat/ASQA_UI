import httpClient from "../api/httpClient";

const USER_BASE = '/users';

export const UserService = {
  getAllUsers() {
    return httpClient.get(`${USER_BASE}/all-users`);
  },

  getPaginatedUsers(params: any) {
    return httpClient.get(`${USER_BASE}/pagenated-users`, { params });
  },

  registerUser(data: any) {
    return httpClient.post(`${USER_BASE}/register`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getUser(id: number ) {
    return httpClient.get(`${USER_BASE}/${id}`);
  },

  updateUser(id: string | number, data: any) {
    return httpClient.put(`${USER_BASE}/update/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteUser(id: string | number) {
    return httpClient.delete(`${USER_BASE}/delete/${id}`);
  },
};

export default UserService;