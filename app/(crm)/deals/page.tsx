import { KanbanBoard } from '@/components/deals/KanbanBoard'

export default function DealsPage() {
  return (
    <div className="h-full flex flex-col">
      <header className="h-12 px-4 flex items-center justify-between border-b border-border shrink-0">
        <h1 className="text-[13px] font-semibold text-text">Сделки</h1>
      </header>
      <div className="flex-1 min-h-0">
        <KanbanBoard />
      </div>
    </div>
  )
}
