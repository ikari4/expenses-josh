// viewExpenses.js

import { createClient } from "@libsql/client";  

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  try {
    const { fromDate, toDate } = req.body;

    const result = await turso.execute(`
      SELECT 
        expenses.id,
        expenses.date,
        expenses.amount,
        expenses.notes,
        users.username,
        expenses.payment_id,
        payment_types.payment AS payment,
        expenses.category_id,
        categories.category AS category
      FROM expenses
      JOIN users ON expenses.user_id = users.id
      JOIN payment_types ON expenses.payment_id = payment_types.id
      JOIN categories ON expenses.category_id = categories.id
      WHERE expenses.date BETWEEN ? AND ?
      ORDER BY expenses.date DESC
    `, [fromDate, toDate]);

    res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
}
