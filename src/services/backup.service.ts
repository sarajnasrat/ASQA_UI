import httpClient from "../api/httpClient";

const BackupService = {
  download() {
    return httpClient.get("/backups/download", { responseType: "blob" });
  },
  restore(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return httpClient.post("/backups/restore", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default BackupService;
