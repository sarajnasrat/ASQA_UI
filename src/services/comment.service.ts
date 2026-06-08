import httpClient from "../api/httpClient";

const COMMENT_BASE = "/comments";

export const CommentService = {
  getPaginatedComments(params?: any) {
    return httpClient.get(`${COMMENT_BASE}`, { params });
  },

  getAllComments() {
    return httpClient.get(`${COMMENT_BASE}/all`);
  },

  getCommentById(id: number) {
    return httpClient.get(`${COMMENT_BASE}/${id}`);
  },

  createComment(data: any) {
    return httpClient.post(`${COMMENT_BASE}`, data);
  },

  updateComment(id: number, data: any) {
    return httpClient.put(`${COMMENT_BASE}/${id}`, data);
  },

  deleteComment(id: number) {
    return httpClient.delete(`${COMMENT_BASE}/${id}`);
  },
};

export default CommentService;

