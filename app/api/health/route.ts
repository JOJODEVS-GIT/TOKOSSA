import { NextResponse } from 'next/server'

/**
 * GET /api/health
 * Endpoint de Health Check pour monitoring (Vercel, UptimeRobot, etc.)
 * Retourne le status du serveur, la version, et un timestamp.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
}
