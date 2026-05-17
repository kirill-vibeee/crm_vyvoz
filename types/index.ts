import { User as PrismaUser, Deal as PrismaDeal, DealStage, DealStatus, Source, Role } from "@prisma/client"

export interface User extends PrismaUser {
  role: Role
}

export interface Deal extends PrismaDeal {
  responsible?: User
  files?: any[]
  comments?: any[]
}

export enum DealStageName {
  NEW = "Новая заявка",
  AWAITING_DECISION = "Ожидаем решение",
  WAITING = "Ожидаем (фото/ответ)",
  DEFERRED = "Будущие отложенные",
  AGREED_FINDING = "Согласовано, ищем исполнителя",
  IN_PROGRESS = "Заявка в работе",
  COMPLETED = "Успешно реализована",
  REFUSED = "Отказ",
}

export const DEAL_STAGES = [
  { value: "NEW", label: DealStageName.NEW, color: "bg-gray-600" },
  { value: "AWAITING_DECISION", label: DealStageName.AWAITING_DECISION, color: "bg-yellow-600" },
  { value: "WAITING", label: DealStageName.WAITING, color: "bg-orange-600" },
  { value: "DEFERRED", label: DealStageName.DEFERRED, color: "bg-purple-600" },
  { value: "AGREED_FINDING", label: DealStageName.AGREED_FINDING, color: "bg-blue-600" },
  { value: "IN_PROGRESS", label: DealStageName.IN_PROGRESS, color: "bg-indigo-600" },
  { value: "COMPLETED", label: DealStageName.COMPLETED, color: "bg-green-600" },
  { value: "REFUSED", label: DealStageName.REFUSED, color: "bg-red-600" },
]

export interface Session {
  user: {
    id: string
    email: string
    name: string
    role: Role
  }
}
