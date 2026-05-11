
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const { players } = await req.json();

    const filePath = path.resolve(process.cwd(), "players.js");

    const content = `export const initialPlayers = ${JSON.stringify(players, null, 2)};\n`;

    fs.writeFileSync(filePath, content, "utf-8");

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Failed to write players.js:", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
