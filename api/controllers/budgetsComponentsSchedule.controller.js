import { pool } from "../config/db.js";

// Cronograma REAL (datas absolutas) de cada componente dentro de um
// equipamento de orçamento específico. É o que fn_auto_create_components()
// e fn_calc_project_dates() leem no banco.

export const createBudgetComponentSchedule = async (req, res) => {
  try {
    const { budget_equipment_id, component_recipe_id, planned_start_at, planned_end_at } =
      req.body;

    if (
      !budget_equipment_id ||
      !component_recipe_id ||
      !planned_start_at ||
      !planned_end_at
    ) {
      return res.status(400).json({ message: "Algum dado está faltando" });
    }

    if (new Date(planned_end_at) < new Date(planned_start_at)) {
      return res
        .status(400)
        .json({ message: "planned_end_at não pode ser antes de planned_start_at" });
    }

    const response = await pool.query(
      `INSERT INTO budgets_components_schedule
        (budget_equipment_id, component_recipe_id, planned_start_at, planned_end_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [budget_equipment_id, component_recipe_id, planned_start_at, planned_end_at],
    );

    res.status(200).json(response.rows[0]);
  } catch (error) {
    console.error(error);
    // uq_budget_schedule: já existe cronograma para esse componente nesse
    // equipamento de orçamento
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: "Esse componente já tem cronograma nesse equipamento" });
    }
    res.status(500).json({ error: "Erro ao criar cronograma do orçamento" + error });
  }
};

export const listBudgetComponentSchedule = async (req, res) => {
  try {
    const { budget_equipment_id } = req.params;

    const response = budget_equipment_id
      ? await pool.query(
          "SELECT * FROM budgets_components_schedule WHERE budget_equipment_id = $1 ORDER BY planned_start_at",
          [budget_equipment_id],
        )
      : await pool.query(
          "SELECT * FROM budgets_components_schedule ORDER BY planned_start_at",
        );

    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar cronograma do orçamento" + error });
  }
};

export const updateBudgetComponentSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { planned_start_at, planned_end_at } = req.body;

    if (!planned_start_at && !planned_end_at) {
      return res.status(400).json({ message: "Faltando dados" });
    }

    const response = await pool.query(
      `UPDATE budgets_components_schedule SET
        planned_start_at = COALESCE($1, planned_start_at),
        planned_end_at = COALESCE($2, planned_end_at)
       WHERE id = $3
       RETURNING *`,
      [planned_start_at, planned_end_at, id],
    );

    if (response.rows.length === 0) {
      return res.status(404).json({ message: "Cronograma não encontrado" });
    }

    res.status(200).json(response.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar cronograma do orçamento" + error });
  }
};

export const deleteBudgetComponentSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await pool.query(
      `DELETE FROM budgets_components_schedule WHERE id = $1 RETURNING *`,
      [id],
    );

    if (response.rows.length === 0) {
      return res.status(404).json({ message: "Cronograma não encontrado" });
    }

    res.status(200).json(response.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar cronograma do orçamento" + error });
  }
};

// Gera o cronograma inteiro de um equipamento de orçamento de uma vez,
// aplicando offset_start_hours / duration_hours da receita em cima de uma
// data-âncora (normalmente o start_date do equipamento). Poupa o front de
// calcular data por data manualmente.
// Cria ou atualiza (upsert) a data de um componente dentro de um
// equipamento de orçamento, identificando a linha por
// (budget_equipment_id, component_recipe_id) — chave que o front conhece,
// em vez do "id" interno da linha. Pensado para telas que salvam a cada
// "onBlur" de um input de data, tipo BudgetEquipmentTable.jsx.
export const upsertBudgetComponentSchedule = async (req, res) => {
  try {
    const { budget_equipment_id, component_recipe_id } = req.params;
    const { planned_start_at, planned_end_at } = req.body;

    if (
      !budget_equipment_id ||
      !component_recipe_id ||
      (!planned_start_at && !planned_end_at)
    ) {
      return res.status(400).json({ message: "Faltando dados" });
    }

    // Se a linha ainda não existe, planned_start_at/planned_end_at são
    // NOT NULL no banco — então na primeira gravação os dois precisam vir
    // preenchidos (não dá pra criar só com "start"). Em edições
    // seguintes, um valor de cada vez funciona via COALESCE.
    const existing = await pool.query(
      `SELECT id FROM budgets_components_schedule
       WHERE budget_equipment_id = $1 AND component_recipe_id = $2`,
      [budget_equipment_id, component_recipe_id],
    );

    if (existing.rows.length === 0) {
      if (!planned_start_at || !planned_end_at) {
        return res.status(422).json({
          message:
            "Primeira gravação do cronograma precisa de planned_start_at e planned_end_at juntos",
        });
      }
      const response = await pool.query(
        `INSERT INTO budgets_components_schedule
          (budget_equipment_id, component_recipe_id, planned_start_at, planned_end_at)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [budget_equipment_id, component_recipe_id, planned_start_at, planned_end_at],
      );
      return res.status(201).json(response.rows[0]);
    }

    const response = await pool.query(
      `UPDATE budgets_components_schedule SET
        planned_start_at = COALESCE($1, planned_start_at),
        planned_end_at = COALESCE($2, planned_end_at)
       WHERE budget_equipment_id = $3 AND component_recipe_id = $4
       RETURNING *`,
      [planned_start_at, planned_end_at, budget_equipment_id, component_recipe_id],
    );

    res.status(200).json(response.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao salvar cronograma do orçamento" + error });
  }
};

export const generateScheduleFromRecipe = async (req, res) => {
  const client = await pool.connect();
  try {
    const { budget_equipment_id } = req.params;
    const { anchor_start_at } = req.body;

    if (!budget_equipment_id || !anchor_start_at) {
      return res.status(400).json({ message: "Faltando dados" });
    }

    const be = await client.query(
      "SELECT equipment_recipe_id FROM budgets_equipments WHERE budget_equipment_id = $1",
      [budget_equipment_id],
    );
    if (be.rows.length === 0) {
      return res.status(404).json({ message: "Equipamento do orçamento não encontrado" });
    }
    const { equipment_recipe_id } = be.rows[0];

    const template = await client.query(
      `SELECT component_recipe_id, offset_start_hours, duration_hours
       FROM equipment_recipes_component_recipes
       WHERE equipment_recipe_id = $1
         AND offset_start_hours IS NOT NULL
         AND duration_hours IS NOT NULL`,
      [equipment_recipe_id],
    );

    if (template.rows.length === 0) {
      return res
        .status(422)
        .json({ message: "Receita sem offset_start_hours/duration_hours preenchidos" });
    }

    await client.query("BEGIN");

    const inserted = [];
    for (const row of template.rows) {
      const result = await client.query(
        `INSERT INTO budgets_components_schedule
          (budget_equipment_id, component_recipe_id, planned_start_at, planned_end_at)
         VALUES (
           $1,
           $2,
           $3::timestamp + ($4 || ' hours')::interval,
           $3::timestamp + ($4 || ' hours')::interval + ($5 || ' hours')::interval
         )
         ON CONFLICT ON CONSTRAINT uq_budget_schedule DO NOTHING
         RETURNING *`,
        [
          budget_equipment_id,
          row.component_recipe_id,
          anchor_start_at,
          row.offset_start_hours,
          row.duration_hours,
        ],
      );
      if (result.rows[0]) inserted.push(result.rows[0]);
    }

    await client.query("COMMIT");
    res.status(200).json(inserted);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Erro ao gerar cronograma a partir da receita" + error });
  } finally {
    client.release();
  }
};