// app.js (ou index.js)
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para receber JSON
app.use(bodyParser.json());

// Configuração do banco PostgreSQL (Render)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // defina isso no ambiente do Render
  ssl: {
    rejectUnauthorized: false,
   }, 
});
// endpoint principal
app.post('/api/seguradoras-disponiveis', async (req, res) => {
  console.log("Recebido do Pipefy:", req.body);

  const { corretora_nome, produto_nome } = req.body;

  if (!corretora_nome || !produto_nome) {
    return res.status(400).json({ error: 'corretora_nome e produto_nome são obrigatórios.' });
  }

  try {
    const query = `
      SELECT s.id, s.nome
      FROM seguradoras s
      JOIN corretora_seguradora cs ON s.id = cs.seguradora_id
      JOIN seguradora_produto sp ON s.id = sp.seguradora_id
      JOIN corretoras c ON cs.corretora_id = c.id
      JOIN produtos p ON sp.produto_id = p.id
      WHERE c.nome = $1 AND p.nome = $2
    `;

    const { rows } = await pool.query(query, [corretora_nome, produto_nome]);
    res.json(rows);
  } catch (err) {
    console.error('Erro na consulta:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});