import httpClient from "../api/httpClient";

const CATEGORY_BASE = "/category";

export const CategoryService = {

  // Get paginated categories
  getPaginatedCategories(params: any) {
    return httpClient.get(`${CATEGORY_BASE}`, { params });
  },

  // Get all categories (no pagination)
  getAllCategories() {
    return httpClient.get(`${CATEGORY_BASE}/all`);
  },

  // Create category
  createCategory(data: any) {
    return httpClient.post(`${CATEGORY_BASE}`, data);
  },

  // Update category
  updateCategory(data: any) {
    return httpClient.put(`${CATEGORY_BASE}`, data);
  },

  // Delete category
  deleteCategory(id: number) {
    return httpClient.delete(`${CATEGORY_BASE}`, {
      params: { id }
    });
  }

};

export default CategoryService;