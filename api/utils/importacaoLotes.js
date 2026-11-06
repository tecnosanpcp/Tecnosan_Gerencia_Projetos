
import { pool } from "../config/db.js";

export const MAX_ITENS_IMPORTACAO = 5000;
export const TAMANHO_LOTE = 500;

const POLITICAS = new Set(["ignore", "update", "import"]);

export class ErroValidacao extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "ErroValidacao";
    this.status = status;
  }
}

export function validarEntrada(itens, politica, rotulo) {
  if (!POLITICAS.has(politica)) {
    throw new ErroValidacao(
      "Política de duplicidade inválida."
    );
  }

  if (!Array.isArray(itens) || itens.length === 0) {
    throw new ErroValidacao(
      `Nenhum ${rotulo} foi informado.`
    );
  }

  if (itens.length > MAX_ITENS_IMPORTACAO) {
    throw new ErroValidacao(
      `Limite de ${MAX_ITENS_IMPORTACAO} registros por importação.`,
      413
    );
  }
}

export function normalizarNome(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function resolverPolitica(
  candidatos,
  existentes,
  politica
) {
  if (!POLITICAS.has(politica)) {
    throw new ErroValidacao(
      "Política de duplicidade inválida."
    );
  }

  const paraInserir = [];
  const paraAtualizar = [];

  let ignoradosExistentes = 0;
  let duplicadosArquivo = 0;

  if (politica === "import") {
    return {
      paraInserir: [...candidatos],
      paraAtualizar,
      ignoradosExistentes,
      duplicadosArquivo,
    };
  }

  const grupos = new Map();

  for (const item of candidatos) {
    const grupo = grupos.get(item.chave) ?? [];

    grupo.push(item);
    grupos.set(item.chave, grupo);
  }

  for (const [chave, grupo] of grupos) {
    const id = existentes.get(chave);

    if (politica === "ignore") {
      if (id !== undefined) {
        ignoradosExistentes += grupo.length;
      } else {
        paraInserir.push(grupo[0]);
        duplicadosArquivo += grupo.length - 1;
      }
    } else {
      const ultimo = grupo[grupo.length - 1];

      if (id !== undefined) {
        paraAtualizar.push({
          ...ultimo,
          id,
        });
      } else {
        paraInserir.push(ultimo);
      }

      duplicadosArquivo += grupo.length - 1;
    }
  }

  return {
    paraInserir,
    paraAtualizar,
    ignoradosExistentes,
    duplicadosArquivo,
  };
}

export function* emLotes(
  lista,
  tamanho = TAMANHO_LOTE
) {
  for (let i = 0; i < lista.length; i += tamanho) {
    yield lista.slice(i, i + tamanho);
  }
}

export async function inserirEmLotes(
  client,
  tabela,
  colunas,
  itens,
  retorno
) {
  let total = 0;

  for (const lote of emLotes(itens)) {
    const valores = [];

    const linhas = lote.map((item, i) => {
      valores.push(
        ...colunas.map((coluna) => item[coluna])
      );

      return `(${colunas
        .map(
          (_, j) =>
            `$${i * colunas.length + j + 1}`
        )
        .join(", ")})`;
    });

    const result = await client.query(
      `INSERT INTO ${tabela} (${colunas.join(", ")})
       VALUES ${linhas.join(", ")}
       RETURNING ${retorno}`,
      valores
    );

    total += result.rowCount;
  }

  return total;
}

export async function atualizarEmLotes(
  client,
  tabela,
  colunaId,
  tipoId,
  colunas,
  itens,
  retorno
) {
  let total = 0;

  const nomes = colunas.map((coluna) => coluna.nome);

  for (const lote of emLotes(itens)) {
    const valores = [];
    const largura = colunas.length + 1;

    const linhas = lote.map((item, i) => {
      valores.push(
        item.id,
        ...nomes.map((nome) => item[nome])
      );

      const base = i * largura;

      return `(
        $${base + 1}::${tipoId},
        ${colunas
          .map(
            (coluna, j) =>
              `$${base + j + 2}::${coluna.tipo}`
          )
          .join(", ")}
      )`;
    });

    const result = await client.query(
      `UPDATE ${tabela} AS t
       SET ${nomes
         .map((nome) => `${nome} = v.${nome}`)
         .join(", ")}
       FROM (
         VALUES ${linhas.join(", ")}
       ) AS v(${colunaId}, ${nomes.join(", ")})
       WHERE t.${colunaId} = v.${colunaId}
       RETURNING t.${retorno}`,
      valores
    );

    total += result.rowCount;
  }

  return total;
}

const unidades = new Set([
  "t",
  "kg",
  "g",
  "uni",
  "caixa",
  "milheiro",
  "l",
  "ml",
]);

const unidadeCanonica = {
  t: "t",
  kg: "kg",
  g: "g",
  uni: "Uni",
  caixa: "Caixa",
  milheiro: "Milheiro",
  l: "L",
  ml: "ml",
};

const texto = (valor) =>
  String(valor ?? "").trim();

const numeroPositivo = (valor) =>
  valor !== null &&
  valor !== undefined &&
  texto(valor) !== "" &&
  Number.isFinite(Number(valor)) &&
  Number(valor) > 0;

const chaveNome = (valor) =>
  normalizarNome(valor);

const chaveAcessorio = (item) => {
  const serie = normalizarNome(
    item.serial_number
  );

  return serie
    ? `serie:${serie}`
    : `nome:${normalizarNome(item.name)}`;
};

const configuracoes = {
  materials: {
    rotulo: "material",
    tabela: "materials",
    id: "material_id",

    colunas: [
      "material_name",
      "material_desc",
      "value",
      "uni",
    ],

    tipos: [
      "text",
      "text",
      "numeric",
      "text",
    ],

    chave: (item) =>
      chaveNome(item.material_name),

    preparar: (raw) => {
      const material_name = texto(
        raw?.material_name
      );

      const material_desc = texto(
        raw?.material_desc
      );

      const uni = unidadeCanonica[
        texto(raw?.uni).toLowerCase()
      ];

      if (
        !material_name ||
        !material_desc ||
        !numeroPositivo(raw?.value) ||
        !uni
      ) {
        return null;
      }

      return {
        material_name,
        material_desc,
        value: Number(raw.value),
        uni,
      };
    },
  },

  accessories: {
    rotulo: "acessório",
    tabela: "accessories",
    id: "accessory_id",

    colunas: [
      "name",
      "serial_number",
      "value",
      "purchase_date",
    ],

    tipos: [
      "text",
      "text",
      "numeric",
      "date",
    ],

    extrasInsercao: {
      status: "Available",
    },

    chave: chaveAcessorio,

    preparar: (raw) => {
      const name = texto(raw?.name);
      const serial_number = texto(
        raw?.serial_number
      );

      const purchase_date = texto(
        raw?.purchase_date
      );

      const dataValida =
        /^\d{4}-\d{2}-\d{2}$/.test(
          purchase_date
        ) &&
        !Number.isNaN(
          Date.parse(
            `${purchase_date}T00:00:00Z`
          )
        ) &&
        new Date(
          `${purchase_date}T00:00:00Z`
        ).toISOString().slice(0, 10) ===
          purchase_date;

      if (
        !name ||
        !numeroPositivo(raw?.value) ||
        !dataValida
      ) {
        return null;
      }

      return {
        name,
        serial_number:
          serial_number || null,
        value: Number(raw.value),
        purchase_date,
      };
    },
  },

  equipments: {
    rotulo: "receita de equipamento",
    tabela: "equipment_recipes",
    id: "equipment_recipe_id",

    colunas: [
      "recipe_name",
    ],

    tipos: [
      "text",
    ],

    chave: (item) =>
      chaveNome(item.recipe_name),

    preparar: (raw) => {
      const recipe_name = texto(
        raw?.recipe_name
      );

      return recipe_name
        ? { recipe_name }
        : null;
    },
  },

  components: {
    rotulo: "receita de componente",
    tabela: "component_recipes",
    id: "component_recipe_id",

    colunas: [
      "recipe_name",
      "qtd_employees",
      "qtd_hours",
      "man_hours",
    ],

    tipos: [
      "text",
      "integer",
      "numeric",
      "numeric",
    ],

    chave: (item) =>
      chaveNome(item.recipe_name),

    preparar: (raw) => {
      const recipe_name = texto(
        raw?.recipe_name
      );

      if (
        !recipe_name ||
        !Number.isInteger(
          Number(raw?.qtd_employees)
        ) ||
        !numeroPositivo(
          raw?.qtd_employees
        ) ||
        !numeroPositivo(
          raw?.qtd_hours
        )
      ) {
        return null;
      }

      const qtd_employees = Number(
        raw.qtd_employees
      );

      const qtd_hours = Number(
        raw.qtd_hours
      );

      const man_hours =
        qtd_employees * qtd_hours;

      if (!Number.isFinite(man_hours)) {
        return null;
      }

      return {
        recipe_name,
        qtd_employees,
        qtd_hours,
        man_hours,
      };
    },
  },
};

export async function importarRegistros(
  tipo,
  itens,
  politica = "ignore"
) {
  const cfg = configuracoes[tipo];

  if (!cfg) {
    throw new ErroValidacao(
      "Tipo de importação inválido."
    );
  }

  validarEntrada(
    itens,
    politica,
    cfg.rotulo
  );

  const candidatos = [];
  let invalidos = 0;

  for (const raw of itens) {
    const item = cfg.preparar(raw);

    if (!item) {
      invalidos++;
      continue;
    }

    candidatos.push({
      ...item,
      chave: cfg.chave(item),
    });
  }

  if (!candidatos.length) {
    return {
      totalInseridos: 0,
      totalAtualizados: 0,
      ignoradosExistentes: 0,
      duplicadosArquivo: 0,
      invalidos,
    };
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext($1))",
      [`pcp_import_${cfg.tabela}`]
    );

    const campos = [
      cfg.id,
      ...(tipo === "accessories"
        ? ["name", "serial_number"]
        : [cfg.colunas[0]]),
    ];

    const resultado = await client.query(
      `SELECT ${campos.join(", ")}
       FROM ${cfg.tabela}
       ORDER BY ${cfg.id}`
    );

    const existentes = new Map();

    for (const row of resultado.rows) {
      const chave = cfg.chave(row);

      if (!existentes.has(chave)) {
        existentes.set(
          chave,
          row[cfg.id]
        );
      }
    }

    const decisao = resolverPolitica(
      candidatos,
      existentes,
      politica
    );

    const extras =
      cfg.extrasInsercao ?? {};

    const colunasInsercao = [
      ...cfg.colunas,
      ...Object.keys(extras),
    ];

    const paraInserir =
      decisao.paraInserir.map(
        (item) => ({
          ...item,
          ...extras,
        })
      );

    const totalInseridos =
      await inserirEmLotes(
        client,
        cfg.tabela,
        colunasInsercao,
        paraInserir,
        cfg.id
      );

    const colunasAtualizacao =
      cfg.colunas.map((nome, i) => ({
        nome,
        tipo: cfg.tipos[i],
      }));

    const totalAtualizados =
      await atualizarEmLotes(
        client,
        cfg.tabela,
        cfg.id,
        "integer",
        colunasAtualizacao,
        decisao.paraAtualizar,
        cfg.id
      );

    await client.query("COMMIT");

    return {
      totalInseridos,
      totalAtualizados,
      ignoradosExistentes:
        decisao.ignoradosExistentes,
      duplicadosArquivo:
        decisao.duplicadosArquivo,
      invalidos,
    };
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error(
        "Erro ao reverter importação:",
        rollbackErr
      );
    }

    throw err;
  } finally {
    client.release();
  }
}

export function responderErroImportacao(
  error,
  res
) {
  console.error(
    "Erro ao importar lote:",
    error
  );

  return res
    .status(error.status ?? 500)
    .json({
      error: error.status
        ? error.message
        : "Erro interno ao importar lote.",
    });
}
