// getCategores.js

import { createClient } from "@libsql/client";  

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler (req, res) {
  try {
    const result = await turso.execute("SELECT * FROM categories");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Datebase error"});
  }
  
}

