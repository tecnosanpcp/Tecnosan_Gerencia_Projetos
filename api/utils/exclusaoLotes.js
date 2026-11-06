
import { pool } from "../config/db.js";

export const MAX_ITENS_EXCLUSAO = 5000;
export const TAMANHO_LOTE_EXCLUSAO = 500;

const CONFIGURACOES = {
  materials: {
    tabela: "materials",
    colunaId: "material_id",
    protegidos: [1, 2, 3, 4, 5, 6, 7],
  },
  accessories: {
    tabela: "accessories",
    colunaId: "accessory_id",
    protegidos: [],
  },
  equipments: {
    tabela: "equipment_recipes",
    colunaId: "equipment_recipe_id",
    protegidos: [],
  },
  components: {
    tabela: "component_recipes",
    colunaId: "component_recipe_id",
    protegidos: [],
  },
};

export class ErroExclusao extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "ErroExclusao";
    this.status = status;
  }
}

export async function excluirEmLotes(tipo, ids) {
  const config = CONFIGURACOES[tipo];

  if (!config) {
    throw new ErroExclusao("Tipo de exclusão inválido.");
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ErroExclusao("Nenhum ID informado.");
  }

  if (ids.length > MAX_ITENS_EXCLUSAO) {
    throw new ErroExclusao(
      `Limite de ${MAX_ITENS_EXCLUSAO} IDs por exclusão.`,
      413
    );
  }

  const todosValidos = ids.every(
    (id) =>
      (typeof id === "number" || typeof id === "string") &&
      String(id).trim() !== "" &&
      Number.isSafeInteger(Number(id)) &&
      Number(id) > 0 &&
      Number(id) <= 2147483647
  );

  if (!todosValidos) {
    throw new ErroExclusao("Existem IDs inválidos.");
  }

  const idsUnicos = [...new Set(ids.map(Number))];

  const protegidos = idsUnicos.filter((id) =>
    config.protegidos.includes(id)
  );

  if (protegidos.length > 0) {
    throw new ErroExclusao(
      `Não é possível excluir os IDs protegidos: ${protegidos.join(", ")}.`,
      403
    );
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let totalExcluidos = 0;
    const idsExcluidos = [];

    for (
      let i = 0;
      i < idsUnicos.length;
      i += TAMANHO_LOTE_EXCLUSAO
    ) {
      const lote = idsUnicos.slice(
        i,
        i + TAMANHO_LOTE_EXCLUSAO
      );

      const resultado = await client.query(
        `DELETE FROM ${config.tabela}
         WHERE ${config.colunaId} = ANY($1::int[])
         RETURNING ${config.colunaId}`,
        [lote]
      );

      totalExcluidos += resultado.rowCount;

      idsExcluidos.push(
        ...resultado.rows.map(
          (row) => row[config.colunaId]
        )
      );
    }

    await client.query("COMMIT");

    return {
      mensagem: "Exclusão em lote concluída.",
      totalSolicitados: idsUnicos.length,
      totalExcluidos,
      totalNaoEncontrados:
        idsUnicos.length - totalExcluidos,
      idsExcluidos,
    };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "Erro ao reverter exclusão:",
        rollbackError
      );
    }

    if (error.code === "23503") {
      throw new ErroExclusao(
        "Não foi possível excluir: existem registros vinculados a um ou mais itens.",
        409
      );
    }

    throw error;
  } finally {
    client.release();
  }
}

export function responderErroExclusao(error, res) {
  console.error("Erro na exclusão em lote:", error);

  return res.status(error.status ?? 500).json({
    error: error.status
      ? error.message
      : "Erro interno ao excluir registros.",
  });
}
