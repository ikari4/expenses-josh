// saveCategory.js

import { createClient } from "@libsql/client";

const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { category } = req.body;

        try {
            await turso.execute(
                "INSERT INTO categories (category) VALUES (?)",
                [category]
            );

            res.status(200).json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Database insert failed" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
