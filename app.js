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

// Endpoint principal: recebe corretora_id e produto_id
app.post('/api/seguradoras-disponiveis', async (req, res) => {
  const { corretora_id, produto_id } = req.body;

  if (!corretora_id || !produto_id) {
    return res.status(400).json({ error: 'corretora_id e produto_id são obrigatórios.' });
  }

  try {
    const query = `
      SELECT s.id, s.nome
      FROM seguradoras s
      JOIN corretora_seguradora cs ON s.id = cs.seguradora_id
      JOIN seguradora_produto sp ON s.id = sp.seguradora_id
      WHERE cs.corretora_id = $1 AND sp.produto_id = $2
    `;

    const { rows } = await pool.query(query, [corretora_id, produto_id]);
    res.json(rows);
  } catch (err) {
    console.error('Erro na consulta:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Inicializa o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
