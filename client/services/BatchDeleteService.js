
import api from "./api.js";

const DELETE_ENDPOINTS = {
  materials: "/materials/delete-batch",
  accessories: "/accessories/delete-batch",
  equipments: "/equip-recipe/delete-batch",
  components: "/component-recipes/delete-batch",
};

export async function deleteItemsBatch(tipo, ids) {
  const endpoint = DELETE_ENDPOINTS[tipo];

  if (!endpoint) {
    throw new Error("Tipo de exclusão inválido.");
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Nenhum item selecionado.");
  }

  const { data } = await api.post(
    endpoint,
    { ids },
    { timeout: 120000 }
  );

  return data;
}
