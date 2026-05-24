/**
 * In-memory store, эмулирующий нужный нам кусок Prisma API.
 * Данные не персистентны: исчезают при рестарте контейнера. Для MVP.
 */

import { randomBytes } from 'crypto'

function id(): string {
  return randomBytes(12).toString('hex')
}

function now(): Date {
  return new Date()
}

// ─────────────────────────────────────────────
// Сущности (используем any, чтобы не тащить Prisma typings)
// ─────────────────────────────────────────────

const users = new Map<string, any>()
const deals = new Map<string, any>()
const invoices = new Map<string, any>()
const dealFiles = new Map<string, any>()
const comments = new Map<string, any>()
const activities = new Map<string, any>()

// Seed: дефолтный пользователь
const DEFAULT_USER_ID = id()
users.set(DEFAULT_USER_ID, {
  id: DEFAULT_USER_ID,
  email: 'kirill@example.com',
  name: 'Кирилл',
  role: 'ADMIN',
  passwordHash: '',
  createdAt: now(),
  updatedAt: now(),
})

// Сортировки/фильтры
function applyOrder<T>(list: T[], orderBy?: any): T[] {
  if (!orderBy) return list
  const keys = Array.isArray(orderBy) ? orderBy : [orderBy]
  return [...list].sort((a: any, b: any) => {
    for (const ord of keys) {
      const [k, dir] = Object.entries(ord)[0] as [string, 'asc' | 'desc']
      const av = a[k]
      const bv = b[k]
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      if (cmp !== 0) return dir === 'desc' ? -cmp : cmp
    }
    return 0
  })
}

function matchesWhere(item: any, where: any): boolean {
  if (!where) return true
  for (const [k, v] of Object.entries(where)) {
    if (item[k] !== v) return false
  }
  return true
}

function includeRelations<T extends any>(item: T, model: string, include?: any): T {
  if (!include || !item) return item
  const result: any = { ...item }
  if (model === 'deal') {
    if (include.responsible) {
      result.responsible = users.get((item as any).responsibleId) || null
    }
    if (include.files) {
      result.files = [...dealFiles.values()].filter((f) => f.dealId === (item as any).id)
    }
    if (include.comments) {
      let list = [...comments.values()].filter((c) => c.dealId === (item as any).id)
      if (include.comments.include?.author) {
        list = list.map((c) => ({ ...c, author: users.get(c.authorId) || null }))
      }
      result.comments = list
    }
    if (include.activities) {
      result.activities = [...activities.values()].filter((a) => a.dealId === (item as any).id)
    }
  }
  if (model === 'comment' && include.author) {
    result.author = users.get((item as any).authorId) || null
  }
  return result
}

function makeModel(map: Map<string, any>, modelName: string) {
  return {
    async findMany(args?: any): Promise<any[]> {
      let list = [...map.values()]
      if (args?.where) list = list.filter((x) => matchesWhere(x, args.where))
      if (args?.orderBy) list = applyOrder(list, args.orderBy)
      return list.map((x) => includeRelations(x, modelName, args?.include))
    },
    async findFirst(args?: any): Promise<any | null> {
      let list = [...map.values()]
      if (args?.where) list = list.filter((x) => matchesWhere(x, args.where))
      if (args?.orderBy) list = applyOrder(list, args.orderBy)
      if (list.length === 0) return null
      return includeRelations(list[0], modelName, args?.include)
    },
    async findUnique(args: any): Promise<any | null> {
      const where = args?.where || {}
      if (where.id) {
        const item = map.get(where.id)
        if (!item) return null
        return includeRelations(item, modelName, args?.include)
      }
      // поиск по любому уникальному полю
      const item = [...map.values()].find((x) => matchesWhere(x, where))
      if (!item) return null
      return includeRelations(item, modelName, args?.include)
    },
    async create(args: any): Promise<any> {
      const newId = id()
      const data = { ...args.data }
      const item = {
        id: newId,
        ...data,
        createdAt: data.createdAt || now(),
        updatedAt: data.updatedAt || now(),
      }
      map.set(newId, item)
      return includeRelations(item, modelName, args?.include)
    },
    async update(args: any): Promise<any> {
      const itemId = args?.where?.id
      const item = map.get(itemId)
      if (!item) throw new Error(`${modelName} not found`)
      const updated = { ...item, ...args.data, updatedAt: now() }
      map.set(itemId, updated)
      return includeRelations(updated, modelName, args?.include)
    },
    async delete(args: any): Promise<any> {
      const itemId = args?.where?.id
      const item = map.get(itemId)
      map.delete(itemId)
      return item
    },
    async count(args?: any): Promise<number> {
      if (!args?.where) return map.size
      return [...map.values()].filter((x) => matchesWhere(x, args.where)).length
    },
  }
}

export const memstore = {
  user: makeModel(users, 'user'),
  deal: makeModel(deals, 'deal'),
  invoice: makeModel(invoices, 'invoice'),
  dealFile: makeModel(dealFiles, 'dealFile'),
  comment: makeModel(comments, 'comment'),
  activity: makeModel(activities, 'activity'),

  // helper для интеграций
  getDefaultUserId(): string {
    return DEFAULT_USER_ID
  },
}
