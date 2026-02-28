// deleteExpense.js

import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });

    const { id } = req.body;

    if (!id)
        return res.status(400).json({ error: "Missing id" });

    try {
        await turso.execute(
            "DELETE FROM expenses WHERE id = ?",
            [id]
        );

        res.status(200).json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database delete failed" });
    }
}
