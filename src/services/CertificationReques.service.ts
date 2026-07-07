// services/certificationRequest.service.ts
import httpClient from "../api/httpClient";

const BASE_URL = "/certificationrequest";
const PAYMENT_BASE_URL = "/payments";

export const CertificationRequestService = {
  // ✅ Get all without pagination
  getAll() {
    return httpClient.get(`${BASE_URL}/all`);
  },

  // ✅ Get all with pagination
  getAllPaginated(params?: any) {
    return httpClient.get(`${BASE_URL}`, { params });
  },

  searchCertificationRequest(
    trackingNumber?: string,
    companyName?: string,
    page: number = 0,
    size: number = 10,
    sort: string = "id,desc",
  ) {
    return httpClient.get(`${BASE_URL}/search`, {
      params: {
        trackingNumber,
        companyName,
        page,
        size,
        sort,
      },
    });
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
  updateStatus(id: number, status: string, companyId?: number) {
    return httpClient.patch(
      `${BASE_URL}/${id}/status`,
      null,
      {
        params: {
          status,
          ...(companyId !== undefined && companyId !== null ? { companyId } : {}),
        },
      }
    );
  },
  
  rejectCertificationRequest(id: number, rejectionReason: string) {
    return httpClient.patch(
      `${BASE_URL}/${id}/rejection-reason`,
      null,
      {
        params: {
          rejectionReason,
        },
      }
    );
  },
  // CertificationRequestService.ts
  submitAndReview(id: number, status: string, companyId?: number) {
    return this.updateStatus(id, status, companyId);
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

  getAllPayments() {
    return httpClient.get(`${PAYMENT_BASE_URL}/all`);
  },

  getPayments(params?: any) {
    return httpClient.get(`${PAYMENT_BASE_URL}`, { params });
  },

  getPaymentById(id: number) {
    return httpClient.get(`${PAYMENT_BASE_URL}/${id}`);
  },

  getPaymentsByCertificationRequest(certificationRequestId: number, params?: any) {
    return httpClient.get(
      `${PAYMENT_BASE_URL}/certification-request/${certificationRequestId}`,
      { params }
    );
  },

  createPayment(certificationRequestId: number, formData: FormData) {
    return httpClient.post(
      `${PAYMENT_BASE_URL}/certification-request/${certificationRequestId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  updatePayment(id: number, formData: FormData) {
    return httpClient.patch(`${PAYMENT_BASE_URL}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deletePayment(id: number) {
    return httpClient.delete(`${PAYMENT_BASE_URL}/${id}`);
  },
  
  // ✅ Confirm payment with bill upload
  confirmPayment(requestId: number, formData: FormData) {
    return this.createPayment(requestId, formData);
  },

  // ✅ Get payment details for a request
  getPaymentDetails(requestId: number, params?: any) {
    return this.getPaymentsByCertificationRequest(requestId, params);
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

  // ✅ Update print flag
  updateIsPrint(requestId: number, value: boolean) {
    return httpClient.patch(
      `${BASE_URL}/${requestId}/is-print`,
      null,
      {
        params: {
          value,
        },
      }
    );
  },

  // ✅ Update scanned flag
  updateIsScanned(requestId: number, value: boolean) {
    return httpClient.patch(
      `${BASE_URL}/${requestId}/is-scanned`,
      null,
      {
        params: {
          value,
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
    return this.createPayment(requestId, formData);
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
    const formData = new FormData();
    formData.append("transactionId", paymentDetails.transactionId);
    formData.append("paymentDate", paymentDetails.paymentDate);
    formData.append("paymentAmount", String(paymentDetails.paymentAmount));

    return this.createPayment(requestId, formData);
  },
};

export default CertificationRequestService;
