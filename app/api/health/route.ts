import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "Krawia Real Estate Development Portfolio",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}
