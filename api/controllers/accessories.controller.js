import { pool } from "../config/db.js";

// ===================================================================================
// 1. GESTÃO DE ACESSÓRIOS (Itens Físicos - Tabela 'accessories')
// ===================================================================================

export const listAccessories = async (req, res) => {
  try {
    const { status } = req.query;
    let queryText = "SELECT * FROM accessories";
    let queryParams = [];

    if (status) {
      queryText += " WHERE status = $1";
      queryParams.push(status);
    }

    queryText += " ORDER BY name";

    const result = await pool.query(queryText, queryParams);
    return res.json(result.rows);
  } catch (error) {
    console.error("Error listing accessories:", error);
    return res.status(500).json({ error: "Erro ao listar acessórios." });
  }
};

export const createAccessory = async (req, res) => {
  try {
    const { name, serial_number, value, purchase_date } = req.body;

    const result = await pool.query(
      `INSERT INTO accessories (name, serial_number, value, purchase_date, status)
       VALUES ($1, $2, $3, $4, 'Available')
       RETURNING *`,
      [name, serial_number, value, purchase_date]
    );

    res.status(200).json({
      message: "Acessório criado com sucesso!",
      accessory: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating accessory:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateAccessory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, serial_number, value, purchase_date } = req.body;

    const result = await pool.query(
      `UPDATE accessories 
       SET name = $1, serial_number = $2, value = $3, purchase_date = $4
       WHERE accessory_id = $5
       RETURNING *`,
      [name, serial_number, value, purchase_date, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating accessory:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteAccessory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM accessories WHERE accessory_id = $1 RETURNING *",
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error deleting accessory:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===================================================================================
// 2. OPERAÇÕES DE EMPRÉSTIMO (Corrigido: Removeu notes, Adicionou taken_at)
// ===================================================================================

export const loanToProject = async (req, res) => {
  try {
    // Recebe 'taken_at' (Data) e NÃO recebe mais 'notes'
    const { project_id, accessory_id, user_id, taken_at } = req.body;

    const result = await pool.query(
      `INSERT INTO accessories_projects (project_id, accessory_id, taken_by_user_id, taken_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [project_id, accessory_id, user_id, taken_at]
    );

    res.status(200).json({
      message: "Acessório emprestado para o Projeto!",
      loan: result.rows[0],
    });
  } catch (error) {
    console.error("Error loaning to project:", error);
    res.status(500).json({ error: error.message }); 
  }
};

// No arquivo: accessories.controller.js

export const loanToBudget = async (req, res) => {
  try {
    // AGORA RECEBE TODOS OS DADOS DE UMA VEZ
    const { 
      budget_id, 
      accessory_id, 
      user_id,         // Quem retira (taken_by)
      taken_at,        // Data retirada
      received_by_id,  // Quem devolve (recebe de volta)
      returned_at      // Data devolução
    } = req.body;

    // A query insere tudo junto. 
    // Isso satisfaz a constraint do banco (ou tudo NULL ou tudo PREENCHIDO nas colunas de retorno)
    // E geralmente faz com que a Trigger de status entenda que o ciclo fechou (mantendo 'Available')
    const result = await pool.query(
      `INSERT INTO accessories_budgets 
       (budget_id, accessory_id, taken_by_user_id, taken_at, received_by_user_id, returned_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [budget_id, accessory_id, user_id, taken_at, received_by_id, returned_at]
    );

    res.status(200).json({
      message: "Planejamento salvo com sucesso!",
      loan: result.rows[0],
    });
  } catch (error) {
    console.error("Error planning budget accessory:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===================================================================================
// 3. DEVOLUÇÃO E LISTAGEM
// ===================================================================================
export const returnAccessory = async (req, res) => {
  try {
    const { movement_id, received_by_user_id, returned_at, type } = req.body;

    if (!['project', 'budget'].includes(type)) {
      return res.status(400).json({ error: "Tipo inválido." });
    }

    const tableName = type === 'project' ? 'accessories_projects' : 'accessories_budgets';

    // 2. Usei COALESCE: Se vier data, usa ela. Se não vier, usa NOW()
    const result = await pool.query(
      `UPDATE ${tableName}
       SET returned_at = COALESCE($3, NOW()), 
           received_by_user_id = $1
       WHERE movement_id = $2
       RETURNING *`,
      [received_by_user_id, movement_id, returned_at]
    );
    res.status(200).json({
      message: "Acessório devolvido com sucesso!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error returning accessory:", error);
    res.status(500).json({ error: error.message });
  }
};
// ... imports

export const listActiveLoans = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM vw_loans_full_history 
       ORDER BY returned_at ASC NULLS FIRST, taken_at DESC`
    );
    return res.json(result.rows);
  } catch (error) {
    console.error("Error listing loans:", error);
    return res.status(500).json({ error: "Erro ao listar histórico." });
  }
};

// ... no final do arquivo accessories.controller.js

export const listBudgetHistory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ab.movement_id,
        ab.budget_id,
        b.budget_name,
        ab.accessory_id,
        a.name as accessory_name,
        a.serial_number,
        ab.taken_by_user_id,
        u1.user_name as taken_by_name,
        ab.taken_at,
        ab.received_by_user_id,
        u2.user_name as received_by_name,
        ab.returned_at
      FROM accessories_budgets ab
      JOIN accessories a ON ab.accessory_id = a.accessory_id
      JOIN budgets b ON ab.budget_id = b.budget_id
      LEFT JOIN users u1 ON ab.taken_by_user_id = u1.user_id
      LEFT JOIN users u2 ON ab.received_by_user_id = u2.user_id
      ORDER BY ab.taken_at DESC
    `);
    return res.json(result.rows);
  } catch (error) {
    console.error("Error listing budget history:", error);
    return res.status(500).json({ error: "Erro ao listar histórico de orçamentos." });
  }
};

// accessories.controller.js

// --- ATUALIZAR PLANEJAMENTO ---
export const updateBudgetLoan = async (req, res) => {
  try {
    const { id } = req.params; // movement_id
    const { 
      accessory_id, 
      taken_by_user_id, 
      taken_at, 
      received_by_user_id, 
      returned_at 
    } = req.body;

    const result = await pool.query(
      `UPDATE accessories_budgets
       SET accessory_id = $1,
           taken_by_user_id = $2,
           taken_at = $3,
           received_by_user_id = $4,
           returned_at = $5
       WHERE movement_id = $6
       RETURNING *`,
      [accessory_id, taken_by_user_id, taken_at, received_by_user_id, returned_at, id]
    );
    res.json({ message: "Planejamento atualizado!", loan: result.rows[0] });
  } catch (error) {
    console.error("Erro ao atualizar planejamento:", error);
    res.status(500).json({ error: error.message });
  }
};

// --- DELETAR PLANEJAMENTO ---
export const deleteBudgetLoan = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM accessories_budgets WHERE movement_id = $1 RETURNING *",
      [id]
    );
    res.json({ message: "Planejamento removido!", deleted: result.rows[0] });
  } catch (error) {
    console.error("Erro ao deletar planejamento:", error);
    res.status(500).json({ error: error.message });
  }
};