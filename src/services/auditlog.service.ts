import httpClient from "../api/httpClient";

const AUDIT_LOG_BASE = "/audit-logs";

export interface AuditLogParams {
  page?: number;
  size?: number;
  sort?: string;
  userId?: number;
  action?: string;
  entityName?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export const AuditLogService = {
  getPaginatedAuditLogs(params?: AuditLogParams) {
    return httpClient.get(AUDIT_LOG_BASE, { params });
  },

  getAllAuditLogs() {
    return httpClient.get(`${AUDIT_LOG_BASE}/all`);
  },

  getAuditLogById(id: number) {
    return httpClient.get(`${AUDIT_LOG_BASE}/${id}`);
  },
};

export default AuditLogService;
