import axios from "axios";
export const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function uploadFile(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await axios.post(`${API}/upload`, form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
}

export async function processFile(fileName: string) {
  const res = await axios.post(`${API}/process`, { fileName });
  return res.data;
}
