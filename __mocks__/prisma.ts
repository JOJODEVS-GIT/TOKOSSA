/**
 * Mock Prisma Client pour les tests unitaires.
 * Chaque methode est un jest.fn() pour pouvoir controler les retours.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma: Record<string, any> = {
  user: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  loyaltyPoint: {
    create: jest.fn(),
  },
  order: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  orderItem: {
    deleteMany: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  promoCode: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  siteSettings: {
    findMany: jest.fn(),
    upsert: jest.fn(),
  },
  abandonedCart: {
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  returnRequest: {
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  deliveryPerson: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
}

export default mockPrisma
