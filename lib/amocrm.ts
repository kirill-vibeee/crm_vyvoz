/**
 * AmoCRM API wrapper (Long-lived token, one-way Amo → our CRM sync).
 *
 * Env vars:
 *   AMO_LONG_TOKEN   — долгоживущий токен интеграции
 *   AMO_SUBDOMAIN    — поддомен Amo (например "kirill-vyvoz" для kirill-vyvoz.amocrm.ru)
 *
 * Endpoints:
 *   GET /api/v4/leads?limit=250&page=N&with=contacts — список сделок (пагинация)
 *   GET /api/v4/leads/pipelines                     — воронки и стадии
 *   GET /api/v4/contacts/{id}                       — контакт (опционально)
 *
 * Docs: https://www.amocrm.ru/developers/content/crm_platform/leads-api
 */

import { DealStageId } from '@/types'

function getConfig(): { token: string; baseUrl: string } | null {
  const token = process.env.AMO_LONG_TOKEN
  const subdomain = process.env.AMO_SUBDOMAIN
  if (!token || !subdomain) return null
  return { token, baseUrl: `https://${subdomain}.amocrm.ru/api/v4` }
}

async function amoFetch(path: string): Promise<any | null> {
  const cfg = getConfig()
  if (!cfg) return null
  try {
    const res = await fetch(`${cfg.baseUrl}${path}`, {
      headers: { Authorization: `Bearer ${cfg.token}`, Accept: 'application/json' },
    })
    if (res.status === 204) return null
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error(`[amo] ${path} → ${res.status}: ${text.slice(0, 400)}`)
      return null
    }
    return await res.json()
  } catch (err) {
    console.error(`[amo] ${path} error:`, err)
    return null
  }
}

// ────────────── Pipelines / Stages ──────────────

export interface AmoStatus {
  id: number
  name: string
  pipelineId: number
}

export async function fetchPipelineStatuses(): Promise<AmoStatus[]> {
  const data = await amoFetch('/leads/pipelines')
  const pipelines = data?._embedded?.pipelines || []
  const statuses: AmoStatus[] = []
  for (const p of pipelines) {
    for (const s of p._embedded?.statuses || []) {
      statuses.push({ id: s.id, name: s.name, pipelineId: p.id })
    }
  }
  return statuses
}

// Маппинг по ключевым словам в названии статуса Amo → наши 7 стадий.
// Порядок имеет значение: первый match выигрывает.
const STAGE_KEYWORDS: { stage: DealStageId; keywords: string[] }[] = [
  { stage: 'COMPLETED', keywords: ['успешно', 'реализован', 'оплачен', 'закрыт и реализ', 'выполнен'] },
  { stage: 'REFUSED', keywords: ['отказ', 'не реализован', 'провал', 'потерян', 'закрыт и не'] },
  { stage: 'IN_PROGRESS', keywords: ['в работе', 'исполнитель', 'выполняется', 'вывоз'] },
  { stage: 'AGREED_FINDING', keywords: ['согласован', 'ищем', 'поиск', 'нашли согласие'] },
  { stage: 'DEFERRED', keywords: ['отложен', 'будущ', 'на потом', 'позже', 'перенос'] },
  { stage: 'AWAITING_DECISION', keywords: ['ожидаем', 'решен', 'думает', 'обдум', 'переговор'] },
  { stage: 'NEW', keywords: ['новая', 'первичн', 'неразобран', 'входящ', 'incoming'] },
]

export function mapAmoStatusToStage(statusName: string | undefined): DealStageId {
  if (!statusName) return 'NEW'
  const lower = statusName.toLowerCase()
  for (const rule of STAGE_KEYWORDS) {
    if (rule.keywords.some((k) => lower.includes(k))) return rule.stage
  }
  return 'NEW'
}

// ────────────── Leads ──────────────

export interface AmoLead {
  id: number
  name: string
  price: number
  statusId: number
  statusName?: string
  createdAt: Date
  updatedAt: Date
  closedAt: Date | null
  responsibleName?: string
  contactName?: string
  contactPhone?: string
  notes?: string
}

export async function fetchAllLeads(): Promise<AmoLead[]> {
  const statuses = await fetchPipelineStatuses()
  const statusById = new Map(statuses.map((s) => [s.id, s.name]))

  const all: AmoLead[] = []
  let page = 1
  while (true) {
    const data = await amoFetch(`/leads?limit=250&page=${page}&with=contacts`)
    const leads = data?._embedded?.leads
    if (!leads || leads.length === 0) break

    for (const l of leads) {
      const contact = l._embedded?.contacts?.[0]
      all.push({
        id: l.id,
        name: l.name || `Сделка #${l.id}`,
        price: Number(l.price) || 0,
        statusId: l.status_id,
        statusName: statusById.get(l.status_id),
        createdAt: new Date(l.created_at * 1000),
        updatedAt: new Date(l.updated_at * 1000),
        closedAt: l.closed_at ? new Date(l.closed_at * 1000) : null,
        contactName: contact?.name,
      })
    }

    if (leads.length < 250) break
    page++
    if (page > 200) break // safety
  }
  return all
}

export async function isAmoConfigured(): Promise<boolean> {
  return !!getConfig()
}

export async function checkAmoConnection(): Promise<{ ok: boolean; error?: string; subdomain?: string }> {
  const cfg = getConfig()
  if (!cfg) return { ok: false, error: 'AMO_LONG_TOKEN или AMO_SUBDOMAIN не установлены' }
  const data = await amoFetch('/account')
  if (!data) return { ok: false, error: 'Не удалось подключиться к Amo (проверь токен и поддомен)' }
  return { ok: true, subdomain: data.subdomain || process.env.AMO_SUBDOMAIN }
}
