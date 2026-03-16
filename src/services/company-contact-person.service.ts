import httpClient from "../api/httpClient";

const BASE_URL = "/companycontactperson";

export const CompanyContactPersonService = {
  // Get all contact persons
  getAll() {
    return httpClient.get(`${BASE_URL}/all`, {
      headers: { skipAuth: true },
    });
  },

  // Get paginated contact persons
  getPaginated(params: any) {
    return httpClient.get(`${BASE_URL}/getAll`, {
      params,
      headers: { skipAuth: true },
    });
  },

  // Create a new contact person
  create(data: any) {
    return httpClient.post(`${BASE_URL}`, data, {
      headers: { skipAuth: true },
    });
  },

  // Get a contact person by id
  getById(id: number | string) {
    return httpClient.get(`${BASE_URL}/${id}`, {
      headers: { skipAuth: true },
    });
  },

  // Update a contact person
  update(id: number | string, data: any) {
    return httpClient.put(`${BASE_URL}/${id}`, data, {
      headers: { skipAuth: true },
    });
  },

  // Delete a contact person
  delete(id: number | string) {
    return httpClient.delete(`${BASE_URL}/${id}`, {
      headers: { skipAuth: true },
    });
  },
};

export default CompanyContactPersonService;