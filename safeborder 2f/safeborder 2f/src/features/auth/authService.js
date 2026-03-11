// src/features/auth/authService.js
import axios from "axios";

// 1) عنوان الـ API من env، مع قيمة احتياطية محلية
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// 2) axios instance ثابت لمسارات المصادقة
export const authApi = axios.create({
  baseURL: `${API_BASE}/api/auth/`,
  // مع JWT لسنا بحاجة cookies، لذلك withCredentials=false
  withCredentials: false,
}); 

// 3) أضف توكن الأكسس تلقائيًا لكل الطلبات بعد تسجيل الدخول
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 4) دوال الخدمة

export async function login(username, password) {
  const { data } = await authApi.post("login/", { username, password });

  // احتمالان شائعان لردّ السيرفر:
  // { access, refresh, user } أو { token, user }
  const access = data.access || data.token;
  const refresh = data.refresh || null;

  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
  if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}

export async function register(payload) {
  // payload = { username, email, password, confirm_password, first_name, user_type }
  const { data } = await authApi.post("register/", payload);
  return data;
}

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
}
