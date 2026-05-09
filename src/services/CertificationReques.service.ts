// services/certificationRequest.service.ts
import httpClient from "../api/httpClient";

const BASE_URL = "/certificationrequest";

export const CertificationRequestService = {
  // ✅ Get all without pagination
  getAll() {
    return httpClient.get(`${BASE_URL}/all`);
  },

  // ✅ Get all with pagination
  getAllPaginated(params?: any) {
    return httpClient.get(`${BASE_URL}`, { params });
  },
  
  getAllPaginatedByStatus(
    status: string,
    page: number = 0,
    size: number = 10,
    sort: string = 'id,desc'
  ) {
    return httpClient.get(`${BASE_URL}/get-all`, {
      params: {
        status: status,
        page: page,
        size: size,
        sort: sort,
      },
    });
  },
  
  // ✅ Get by ID
  getById(id: number) {
    return httpClient.get(`${BASE_URL}/${id}`);
  },

  getRequestTracker(id: string) {
    return httpClient.get(`${BASE_URL}/${id}/tracker`);
  },
  
  // ✅ Create
  create(data: any) {
    return httpClient.post(`${BASE_URL}`, data);
  },

  // ✅ Update
  update(id: number, data: any) {
    return httpClient.put(`${BASE_URL}/${id}`, data);
  },

  // ✅ Delete
  delete(id: number) {
    return httpClient.delete(`${BASE_URL}/${id}`);
  },

  // ✅ PATCH - Update request status
  updateStatus(id: number, formData: FormData) {
    return httpClient.patch(
      `${BASE_URL}/${id}/status`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
  
  // CertificationRequestService.ts
  submitAndReview(id: number, status: string, companyId?: number) {
    return httpClient.patch(
      `${BASE_URL}/${id}/status`,
      null,
      {
        params: {
          status: status,
          ...(companyId && { companyId: companyId })
        }
      }
    );
  },

  standardProvided(id: number, formData: FormData) {
    return httpClient.post(
      `${BASE_URL}/${id}/standard-provided`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
  
  assignCommittee(requestId: number, committeeId: number) {
    return httpClient.post(
      `${BASE_URL}/${requestId}/assign-committee`,
      null,
      {
        params: {
          committeeId,
        },
      }
    );
  },
  
  setDeadline(requestId: number, startDate: string, endDate: string) {
    return httpClient.patch(
      `${BASE_URL}/${requestId}/assign-deadline`,
      {
        startDate,
        endDate,
      }
    );
  },

  // ================= PAYMENT RELATED METHODS =================
  
  // ✅ Confirm payment with bill upload
  confirmPayment(requestId: number, formData: FormData) {
    return httpClient.post(
      `${BASE_URL}/${requestId}/confirm-payment`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  // ✅ Get payment details for a request
  getPaymentDetails(requestId: number) {
    return httpClient.get(`${BASE_URL}/${requestId}/payment-details`);
  },

  // ✅ Print bill (returns blob for PDF)
  printBill(requestId: number) {
    return httpClient.get(`${BASE_URL}/${requestId}/print-bill`, {
      responseType: 'blob',
    });
  },

  // ✅ Update payment status only (without file upload)
  updatePaymentStatus(requestId: number, status: string, data?: any) {
    return httpClient.patch(
      `${BASE_URL}/${requestId}/payment-status`,
      data,
      {
        params: {
          status: status,
        },
      }
    );
  },

  // ✅ Get all requests by payment status
  getByPaymentStatus(status: string, page: number = 0, size: number = 10) {
    return httpClient.get(`${BASE_URL}/payment-status/${status}`, {
      params: {
        page: page,
        size: size,
      },
    });
  },

  // ✅ Upload payment receipt separately
  uploadPaymentReceipt(requestId: number, formData: FormData) {
    return httpClient.post(
      `${BASE_URL}/${requestId}/upload-receipt`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  // ✅ Get payment receipt (for viewing/downloading)
  getPaymentReceipt(requestId: number) {
    return httpClient.get(`${BASE_URL}/${requestId}/payment-receipt`, {
      responseType: 'blob',
    });
  },

  // ✅ Mark payment as completed (without file upload, just status update)
  markPaymentCompleted(requestId: number, paymentDetails: {
    transactionId: string;
    paymentDate: string;
    paymentAmount: number;
    paymentMethod?: string;
  }) {
    return httpClient.post(`${BASE_URL}/${requestId}/mark-payment-completed`, paymentDetails);
  },
};

export default CertificationRequestService;