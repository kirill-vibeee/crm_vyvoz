'use client'

import { Field, Input } from '@/components/ui/Input'
import { Deal } from '@/types'

interface Props {
  values: Pick<Deal, 'contactName' | 'contactPhone' | 'contactEmail' | 'contactTelegram'>
  onChange: (key: keyof Props['values'], value: string) => void
}

export function DealContactSection({ values, onChange }: Props) {
  return (
    <div className="border-t border-border pt-5">
      <div className="text-[11px] text-text-dim uppercase tracking-wider mb-3 font-semibold">
        Контакт клиента
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Имя">
          <Input
            value={values.contactName || ''}
            onChange={(e) => onChange('contactName', e.target.value)}
            placeholder="Иван"
          />
        </Field>
        <Field label="Телефон">
          <Input
            value={values.contactPhone || ''}
            onChange={(e) => onChange('contactPhone', e.target.value)}
            placeholder="+7..."
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Field label="Email">
          <Input
            value={values.contactEmail || ''}
            onChange={(e) => onChange('contactEmail', e.target.value)}
            placeholder="email@..."
          />
        </Field>
        <Field label="Telegram">
          <Input
            value={values.contactTelegram || ''}
            onChange={(e) => onChange('contactTelegram', e.target.value)}
            placeholder="@username"
          />
        </Field>
      </div>
    </div>
  )
}
