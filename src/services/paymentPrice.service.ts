import httpClient from "../api/httpClient";

const BASE_URL = "/payment-prices";

const PaymentPriceService = {
  getAll(params?: any) {
    return httpClient.get(BASE_URL, { params });
  },
  getActive() {
    return httpClient.get(`${BASE_URL}/active`);
  },
  getById(id: number) {
    return httpClient.get(`${BASE_URL}/${id}`);
  },

  create(data: { price: number; isActive: boolean }) {
    return httpClient.post(BASE_URL, data);
  },
  update(id: number, data: { price: number; isActive: boolean }) {
    return httpClient.put(`${BASE_URL}/${id}`, data);
  },
  delete(id: number) {
    return httpClient.delete(`${BASE_URL}/${id}`);
  },
};

export default PaymentPriceService;
