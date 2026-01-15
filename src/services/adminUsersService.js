// src/services/adminUsersService.js
import API_BASE_URL from "../config";
import { getAccessToken } from "../utils/tokenManager";

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}



function authHeaders(extra = {}) {
  const token = getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    ...extra,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function buildQuery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (v === "") return;
    if (v === "ALL") return;
    qs.append(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

async function parseResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (res.ok) {
    if (isJson) return res.json();
    const text = await res.text();
    return text ? { raw: text } : {};
  }

  let payload = null;
  let message = res.statusText || "Request failed";

  try {
    if (isJson) {
      payload = await res.json();
      message = payload?.message || payload?.error || message;
    } else {
      const text = await res.text();
      message = text || message;
      payload = text ? { raw: text } : null;
    }
  } catch {
    // ignore parse errors
  }

  throw new ApiError(message, res.status, payload);
}

async function get(path, params) {
  const res = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return parseResponse(res);
}

async function post(path, body) {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const headers = authHeaders();
  if (isForm) delete headers["Content-Type"];

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: isForm ? body : JSON.stringify(body ?? {}),
  });
  return parseResponse(res);
}

async function patch(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(body ?? {}),
  });
  return parseResponse(res);
}

async function del(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return parseResponse(res);
}

export const adminUsersService = {
  /**
   * LIST: GET /admin/users
   * Backendingizda sortBy bo‘lmasligi mumkin, shuning uchun sort / sortBy ikkalasini ham yuboramiz.
   */
  async list(params = {}) {
    const sortOrder =
      params.sortOrder && String(params.sortOrder).toLowerCase() === "asc"
        ? "ASC"
        : params.sortOrder && String(params.sortOrder).toUpperCase() === "DESC"
        ? "DESC"
        : params.sortOrder;

    const finalParams = {
      ...params,
      sortOrder, // backend ko‘pincha DESC/ASC kutadi
      sort: params.sort ?? params.sortBy,
      sortBy: params.sortBy ?? params.sort,
    };

    return get("/users", finalParams);
  },

  // CRUD
  async create(data) {
    return post("/admin/users", data);
  },

  async update(userId, data) {
    return patch(`/admin/users/${userId}`, data);
  },

  async remove(userId) {
    return del(`/admin/users/${userId}`);
  },

  // actions
  async approve(userId) {
    return post(`/admin/users/${userId}/approve`, {});
  },

  async block(userId) {
    return post(`/admin/users/${userId}/block`, {});
  },

  async unblock(userId) {
    return post(`/admin/users/${userId}/unblock`, {});
  },

  async verify(userId) {
    return post(`/admin/users/${userId}/verify`, {});
  },

  async resetPassword(userId) {
    return post(`/admin/users/${userId}/reset-password`, {});
  },

  async notify(userId, data) {
    return post(`/admin/users/${userId}/notify`, data ?? {});
  },

  // bulk
  async bulk(action, ids) {
    return post("/admin/users/bulk", { action, ids });
  },
};
