const BASE = (import.meta.env.VITE_API_URL || "") + "/api";

function headers() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  auth: {
    login: (body) => request("POST", "/auth/login", body),
    register: (body) => request("POST", "/auth/register", body),
  },
  lists: {
    getAll: () => request("GET", "/lists"),
    create: (body) => request("POST", "/lists", body),
    getOne: (id) => request("GET", `/lists/${id}`),
    update: (id, body) => request("PUT", `/lists/${id}`, body),
    delete: (id) => request("DELETE", `/lists/${id}`),
    getByToken: (token) => request("GET", `/lists/share/${token}`),
    verifyPasscode: (token, passcode) =>
      request("POST", `/lists/share/${token}/verify`, { passcode }),
  },
  items: {
    create: (listId, body) => request("POST", `/lists/${listId}/items`, body),
    update: (listId, itemId, body) =>
      request("PUT", `/lists/${listId}/items/${itemId}`, body),
    delete: (listId, itemId) =>
      request("DELETE", `/lists/${listId}/items/${itemId}`),
  },
};
