const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

function isValidId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

function validateExpenseData(data) {
  const { title, amount, category, date } = data;
  const validCategories = [
    "Food",
    "Transport",
    "Bills",
    "Entertainment",
    "Other",
  ];

  if (!title || typeof title !== "string" || title.trim() === "")
    return "Title is required.";
  if (!amount || isNaN(amount) || Number(amount) <= 0)
    return "Amount must be a positive number.";
  if (!category || !validCategories.includes(category))
    return "Invalid category.";
  if (!date || isNaN(Date.parse(date))) return "Invalid date format.";

  return null;
}

const selectColumns = `id, title, amount::float8, category, to_char(date, 'YYYY-MM-DD') as date`;
const returningColumns = `RETURNING id, title, amount::float8, category, to_char(date, 'YYYY-MM-DD') as date`;

app.get("/api/expenses", async function (req, res) {
  try {
    const result = await pool.query(`SELECT ${selectColumns} FROM expenses`);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.get("/api/expenses/:id", async function (req, res) {
  const id = req.params.id;

  if (!isValidId(id)) {
    return res.status(404).json({ error: "Expense not found." });
  }

  try {
    const result = await pool.query(
      `SELECT ${selectColumns} FROM expenses WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Expense not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/api/expenses", async function (req, res) {
  const validationError = validateExpenseData(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { title, amount, category, date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO expenses (title, amount, category, date) VALUES ($1, $2, $3, $4) ${returningColumns}`,
      [title.trim(), amount, category, date],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.put("/api/expenses/:id", async function (req, res) {
  const id = req.params.id;

  if (!isValidId(id)) {
    return res.status(404).json({ error: "Expense not found." });
  }

  const validationError = validateExpenseData(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { title, amount, category, date } = req.body;
  try {
    const result = await pool.query(
      `UPDATE expenses SET title = $1, amount = $2, category = $3, date = $4 WHERE id = $5 ${returningColumns}`,
      [title.trim(), amount, category, date, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Expense not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.delete("/api/expenses/:id", async function (req, res) {
  const id = req.params.id;

  if (!isValidId(id)) {
    return res.status(404).json({ error: "Expense not found." });
  }

  try {
    const result = await pool.query(
      "DELETE FROM expenses WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Expense not found." });
    }

    res.status(200).json({ message: "Expense deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
});
