import httpClient from "../api/httpClient";

const DashboardService = {
  getDashboardData() {
    return httpClient.get('/dashboard');
  },
};

export default DashboardService;
