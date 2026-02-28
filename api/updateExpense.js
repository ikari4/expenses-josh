// updateExpense.js

import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });

    const { id, date, amount, category_id, payment_id, notes } = req.body;

    try {
        await turso.execute(`
            UPDATE expenses
            SET date = ?, amount = ?, category_id = ?, payment_id = ?, notes = ?
            WHERE id = ?
        `, [date, amount, category_id, payment_id, notes, id]);

        res.status(200).json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database update failed" });
    }
}
