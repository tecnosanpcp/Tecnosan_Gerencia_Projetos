import { pool } from "../config/db.js";

// 1. Gráfico de Consumo Real (Apenas material efetivamente usado)
export const getMaterialsConsumption = async (req, res) => {
  try {
    const response = await pool.query(
      `SELECT
          CASE EXTRACT(MONTH FROM consumption_date)
            WHEN 1 THEN 'Janeiro'
            WHEN 2 THEN 'Fevereiro'
            WHEN 3 THEN 'Março'
            WHEN 4 THEN 'Abril'
            WHEN 5 THEN 'Maio'
            WHEN 6 THEN 'Junho'
            WHEN 7 THEN 'Julho'
            WHEN 8 THEN 'Agosto'
            WHEN 9 THEN 'Setembro'
            WHEN 10 THEN 'Outubro'
            WHEN 11 THEN 'Novembro'
            WHEN 12 THEN 'Dezembro'
          END AS mes,
          SUM(consumed_quantity) AS quantidade_total
        FROM
          components_materials
        WHERE
          EXTRACT(YEAR FROM consumption_date) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND consumption_type = 'consumido'  -- <--- FILTRO ADICIONADO AQUI
        GROUP BY
          EXTRACT(MONTH FROM consumption_date)
        ORDER BY
          EXTRACT(MONTH FROM consumption_date);`
    );

    res.status(200).json(response.rows);
  } catch (error) {
    console.error("Erro ao buscar consumo de materiais:", error);
    res.status(500).json({ error: "Erro no servidor interno" });
  }
};

// 1.1 (NOVO) Gráfico de Desperdício/Refugo (Apenas material perdido)
export const getMaterialsWaste = async (req, res) => {
  try {
    const response = await pool.query(
      `SELECT
          CASE EXTRACT(MONTH FROM consumption_date)
            WHEN 1 THEN 'Janeiro'
            WHEN 2 THEN 'Fevereiro'
            WHEN 3 THEN 'Março'
            WHEN 4 THEN 'Abril'
            WHEN 5 THEN 'Maio'
            WHEN 6 THEN 'Junho'
            WHEN 7 THEN 'Julho'
            WHEN 8 THEN 'Agosto'
            WHEN 9 THEN 'Setembro'
            WHEN 10 THEN 'Outubro'
            WHEN 11 THEN 'Novembro'
            WHEN 12 THEN 'Dezembro'
          END AS mes,
          SUM(consumed_quantity) AS quantidade_refugo -- Nome descritivo para o frontend
        FROM
          components_materials
        WHERE
          EXTRACT(YEAR FROM consumption_date) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND consumption_type = 'refugo'  -- <--- FILTRO DE REFUGO
        GROUP BY
          EXTRACT(MONTH FROM consumption_date)
        ORDER BY
          EXTRACT(MONTH FROM consumption_date);`
    );

    res.status(200).json(response.rows);
  } catch (error) {
    console.error("Erro ao buscar refugo de materiais:", error);
    res.status(500).json({ error: "Erro no servidor interno" });
  }
};

// ... (Mantenha as outras funções getProjectsEvolution e getEmployeesAnalytics iguais)
// 2. Evolução de Projetos (% de Conclusão baseada em componentes finalizados)
export const getProjectsEvolution = async (req, res) => {
  try {
    const response = await pool.query(
      `SELECT
          p.project_name AS projeto,
          COUNT(c.component_id) AS total_componentes,
          SUM(CASE WHEN c.completion_date IS NOT NULL THEN 1 ELSE 0 END) AS componentes_finalizados,
          ROUND(
            (SUM(CASE WHEN c.completion_date IS NOT NULL THEN 1 ELSE 0 END)::numeric / 
            NULLIF(COUNT(c.component_id), 0)::numeric) * 100, 
          2) AS progresso_percentual
        FROM
          projects p
          LEFT JOIN equipments e ON p.project_id = e.project_id
          LEFT JOIN components c ON e.equipment_id = c.equipment_id
        GROUP BY
          p.project_name
        ORDER BY
          progresso_percentual DESC;`
    );

    res.status(200).json(response.rows);
  } catch (error) {
    console.error("Erro ao buscar evolução dos projetos:", error);
    res.status(500).json({ error: "Erro no servidor interno" });
  }
};

// 3. Análise de Funcionários (KPIs: Salário vs Horas Extras vs Faltas)
export const getEmployeesAnalytics = async (req, res) => {
  try {
    const query = `
      WITH 
      calculo_faltas AS (
          SELECT 
              ae.user_id,
              COUNT(a.absent_id) AS total_faltas
          FROM absent_employee ae
          JOIN absent a ON ae.absent_id = a.absent_id
          WHERE a.date_time >= DATE_TRUNC('month', CURRENT_DATE)
          GROUP BY ae.user_id
      ),
      diario_ponto AS (
          SELECT 
              ce.user_id,
              c.clocked::date AS data_trabalho,
              (EXTRACT(EPOCH FROM (MAX(c.clocked) - MIN(c.clocked))) / 3600) AS horas_totais_dia
          FROM clocked_employee ce
          JOIN clocked c ON ce.clocked_id = c.clocked_id
          WHERE c.clocked >= DATE_TRUNC('month', CURRENT_DATE)
          GROUP BY ce.user_id, c.clocked::date
      ),
      calculo_extras AS (
          SELECT 
              user_id,
              SUM(GREATEST(horas_totais_dia - 9, 0)) AS total_horas_extras
          FROM diario_ponto
          GROUP BY user_id
      )
      SELECT 
          u.user_name AS nome_funcionario,
          e.user_id,
          e.job_title AS cargo,
          e.salary AS salario_base,
          COALESCE(f.total_faltas, 0) AS qtd_faltas,
          ROUND(COALESCE(x.total_horas_extras, 0)::numeric, 2) AS horas_extras_decimais,
          ROUND(
              (e.salary / 220 * 1.5 * COALESCE(x.total_horas_extras, 0))::numeric, 
          2) AS custo_estimado_extras
      FROM employees e
      INNER JOIN users u ON e.user_id = u.user_id -- <--- JOIN ADICIONADO
      LEFT JOIN calculo_faltas f ON e.user_id = f.user_id
      LEFT JOIN calculo_extras x ON e.user_id = x.user_id
      ORDER BY horas_extras_decimais DESC;
    `;

    const response = await pool.query(query);
    res.status(200).json(response.rows);
  } catch (error) {
    console.error("Erro ao buscar análise de funcionários:", error);
    res.status(500).json({ error: "Erro no servidor interno" });
  }
};

export const getYearlyKPIs = async (req, res) => {
  try {
    // Pega o ano atual do sistema (Ex: 2026)
    // Se quiser forçar 2026 para testes, mude para: const targetYear = 2026;
    const targetYear = new Date().getFullYear(); 

    const query = `
      WITH 
        -- Bloco A: Calcula o Planejado
        kpi_planejado AS (
          SELECT 
            COALESCE(SUM(plan.quantity_plan * recipe.quantity_plan), 0) AS valor
          FROM 
            equipment_recipes_component_recipes plan
          JOIN 
            component_recipes_materials recipe ON plan.component_recipe_id = recipe.component_recipe_id
          WHERE 
            EXTRACT(YEAR FROM plan.planned_start_at) = $1
        ),

        -- Bloco B: Calcula o Realizado (Consumo e Refugo)
        kpi_realizado AS (
          SELECT 
            COALESCE(SUM(CASE WHEN consumption_type = 'consumido' THEN consumed_quantity ELSE 0 END), 0) AS processado,
            COALESCE(SUM(CASE WHEN consumption_type = 'refugo' THEN consumed_quantity ELSE 0 END), 0) AS refugo
          FROM 
            components_materials
          WHERE 
            EXTRACT(YEAR FROM consumption_date) = $1
        )

      -- Exibe o resultado final
      SELECT 
          $1::int AS ano_referencia,
          (SELECT valor FROM kpi_planejado) AS planejado_kg,
          (SELECT processado FROM kpi_realizado) AS processado_kg,
          (SELECT refugo FROM kpi_realizado) AS refugo_kg;
    `;

    // Executa a query passando o ano como parâmetro para segurança
    const response = await pool.query(query, [targetYear]);

    // Retorna o primeiro objeto: { ano_referencia: 2026, planejado_kg: 0, processado_kg: 272, refugo_kg: 37 }
    res.status(200).json(response.rows[0]);

  } catch (error) {
    console.error("Erro ao buscar KPIs anuais:", error);
    res.status(500).json({ error: "Erro no servidor interno" });
  }
};