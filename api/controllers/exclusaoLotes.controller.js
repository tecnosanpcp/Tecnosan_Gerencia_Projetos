
import {
  excluirEmLotes,
  responderErroExclusao,
} from "../utils/exclusaoLotes.js";

const criarHandler = (tipo) => async (req, res) => {
  try {
    const resultado = await excluirEmLotes(
      tipo,
      req.body?.ids
    );

    return res.status(200).json(resultado);
  } catch (error) {
    return responderErroExclusao(error, res);
  }
};

export const deleteMaterialsBatch = criarHandler("materials");

export const deleteAccessoriesBatch = criarHandler("accessories");

export const deleteEquipmentRecipesBatch = criarHandler("equipments");

export const deleteComponentRecipesBatch = criarHandler("components");
