'use client'

import { DealsHeader } from '@/components/deals/DealsHeader'
import { KanbanBoard } from '@/components/deals/KanbanBoard'
import { useState } from 'react'

export default function DealsPage() {
  const [reloadKey, setReloadKey] = useState(0)

  return (
    <div className="h-full flex flex-col">
      <DealsHeader onSyncDone={() => setReloadKey((k) => k + 1)} />
      <div className="flex-1 min-h-0">
        <KanbanBoard key={reloadKey} />
      </div>
    </div>
  )
}
