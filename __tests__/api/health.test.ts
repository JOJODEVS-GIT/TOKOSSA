/**
 * Test pour l'endpoint Health Check (/api/health)
 * Verifie que le serveur repond correctement
 */

// Mock de NextResponse car jsdom n'a pas Request/Response natifs
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: Record<string, unknown>, init?: { status?: number }) => ({
      status: init?.status || 200,
      json: async () => data,
    }),
  },
}))

import { GET } from '@/app/api/health/route'

describe('GET /api/health', () => {
  it('retourne status 200 et ok: true', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(data.timestamp).toBeDefined()
    expect(data.version).toBe('1.0.0')
  })

  it('retourne un timestamp ISO valide', async () => {
    const response = await GET()
    const data = await response.json()

    const date = new Date(data.timestamp)
    expect(date.getTime()).not.toBeNaN()
  })

  it('contient la version 1.0.0', async () => {
    const response = await GET()
    const data = await response.json()
    expect(data.version).toBe('1.0.0')
  })
})
