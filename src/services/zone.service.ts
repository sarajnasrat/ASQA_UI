import httpClient from "../api/httpClient";

const BASE_URL = "/zones";

export const ZoneService = {

  // GET /api/zones/all
  getAllZones() {
    return httpClient.get(`${BASE_URL}/all`);
  },

  // GET /api/zones/paginated-zones?page=0&size=10
  getPaginatedZones(params: any) {
    return httpClient.get(`${BASE_URL}/paginated-zones`, { params });
  },

  // POST /api/zones
  createZone(data: any) {
    return httpClient.post(`${BASE_URL}`, data);
  },

  // GET /api/zones/{id}
  getZone(id: number) {
    return httpClient.get(`${BASE_URL}/${id}`);
  },

  // PUT /api/zones/{id}
  updateZone(id: number, data: any) {
    return httpClient.put(`${BASE_URL}/${id}`, data);
  },

  // DELETE /api/zones/{id}
  deleteZone(id: number) {
    return httpClient.delete(`${BASE_URL}/${id}`);
  },
};

export default ZoneService;