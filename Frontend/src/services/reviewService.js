import { apiFetch } from "../config/api";

const parseErrorMessage = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    return data?.detail || data?.message || fallbackMessage;
  } catch (_error) {
    return fallbackMessage;
  }
};

export const getResenas = async () => {
  const response = await apiFetch("/resenas?estado=aceptada");

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "No se pudieron cargar las reseñas"));
  }

  const data = await response.json();
  return Array.isArray(data?.resenas) ? data.resenas : [];
};

export const createResena = async (payload) => {
  const response = await apiFetch("/resenas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "No se pudo guardar la reseña"));
  }

  return response.json();
};
