import httpClient from '@/api/httpClient';

const AuthService = {
  login(data) {
    return httpClient.post('/users/login', data);
  },
};

export default AuthService;
