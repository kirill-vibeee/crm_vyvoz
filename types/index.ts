import { Deal as PrismaDeal, User as PrismaUser } from "@prisma/client"

export type Deal = PrismaDeal & {
  responsible?: PrismaUser | null
  files?: any[]
  comments?: any[]
  activities?: any[]
}

export type DealStageId =
  | 'NEW'
  | 'AWAITING_DECISION'
  | 'DEFERRED'
  | 'AGREED_FINDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REFUSED'

export interface StageConfig {
  id: DealStageId
  label: string
  short: string
  accent: string
  dot: string
}

// Видимые колонки Канбана (5)
export const PIPELINE_STAGES_VISIBLE: StageConfig[] = [
  { id: 'NEW',               label: 'Новая заявка',                short: 'NEW',        accent: '#8A8F98', dot: 'bg-text-muted' },
  { id: 'AWAITING_DECISION', label: 'Ожидаем решения · Дожим',     short: 'AWAITING',   accent: '#F2C94C', dot: 'bg-yellow-400' },
  { id: 'DEFERRED',          label: 'Будущее · Отложенное',        short: 'DEFERRED',   accent: '#BB6BD9', dot: 'bg-purple-400' },
  { id: 'AGREED_FINDING',    label: 'Согласовано · Ищем исп.',     short: 'AGREED',     accent: '#5E6AD2', dot: 'bg-accent' },
  { id: 'IN_PROGRESS',       label: 'Исп. найден · В работе',      short: 'IN_PROGRESS', accent: '#56CCF2', dot: 'bg-cyan-400' },
]

// Скрытые финальные стадии (drop-зоны)
export const COMPLETED_STAGE: StageConfig = {
  id: 'COMPLETED',
  label: 'Успешно реализована',
  short: 'DONE',
  accent: '#4CB782',
  dot: 'bg-success',
}

export const REFUSED_STAGE: StageConfig = {
  id: 'REFUSED',
  label: 'Отказ',
  short: 'REFUSED',
  accent: '#C1543C',
  dot: 'bg-danger',
}

export const ALL_STAGES: StageConfig[] = [
  ...PIPELINE_STAGES_VISIBLE,
  COMPLETED_STAGE,
  REFUSED_STAGE,
]

// Для обратной совместимости (используется в DealDetailPanel)
export const PIPELINE_STAGES = PIPELINE_STAGES_VISIBLE

export const SOURCE_OPTIONS = [
  { value: 'AVITO', label: 'Avito' },
  { value: 'WEBSITE', label: 'Сайт' },
  { value: 'REFERRAL', label: 'Сарафан' },
  { value: 'RECURRING', label: 'Постоянник' },
  { value: 'OTHER', label: 'Другое' },
]

export const STATUS_OPTIONS = [
  { value: 'WAITING_ANSWER', label: 'Ждём ответ' },
  { value: 'AGREED', label: 'Согласовано' },
  { value: 'CALL', label: 'Позвонить' },
  { value: 'CLARIFY', label: 'Уточнить' },
  { value: 'WRITE', label: 'Написать' },
  { value: 'WAITING_PHOTO', label: 'Ждём фото' },
]

export const COMMENT_CHANNELS = [
  { value: 'NOTE', label: 'Заметка' },
  { value: 'TG', label: 'Telegram' },
  { value: 'AVITO', label: 'Avito' },
  { value: 'MAX', label: 'Max' },
  { value: 'CALL', label: 'Звонок' },
]
