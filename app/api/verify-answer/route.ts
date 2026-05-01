import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const SECRET = process.env.VERIFY_SECRET ?? "genlayer-detective-secret";

/* Correct answers live only in the server environment */
const ANSWERS: Record<string, string> = {
  "case02-suspect":  process.env.ANSWER_CASE02_SUSPECT  ?? "marcus",
  "case02-killer":   process.env.ANSWER_CASE02_KILLER   ?? "sarah",
  "case01-solution": process.env.ANSWER_CASE01_SOLUTION ?? "shadowadmin",
};

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { key, attempt } = await req.json();

    if (!key || !attempt || typeof key !== "string" || typeof attempt !== "string") {
      return NextResponse.json({ valid: false, error: "Invalid request." }, { status: 400 });
    }

    const correct = ANSWERS[key];
    if (!correct) {
      return NextResponse.json({ valid: false, error: "Unknown challenge." }, { status: 400 });
    }

    const isValid = attempt.trim().toLowerCase() === correct.toLowerCase();

    if (!isValid) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    /* Issue a short-lived HMAC token the client passes back for double-check */
    const expires = Math.floor(Date.now() / 1000) + 300; // 5-minute window
    const payload = `${key}:${expires}`;
    const token   = sign(payload);

    return NextResponse.json({ valid: true, token, expires }, { status: 200 });
  } catch {
    return NextResponse.json({ valid: false, error: "Server error." }, { status: 500 });
  }
}
