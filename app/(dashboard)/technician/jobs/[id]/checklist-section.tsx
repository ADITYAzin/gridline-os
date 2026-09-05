'use client'

import { useState, useTransition } from 'react'
import { toggleChecklistItemAction } from '@/app/actions/execution'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, ListChecks } from 'lucide-react'

interface ChecklistItem {
  id: string
  item: string
  is_completed: boolean
}

interface ChecklistSectionProps {
  items: ChecklistItem[]
  disabled: boolean
}

export function ChecklistSection({ items, disabled }: ChecklistSectionProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(items)
  const [, startTransition] = useTransition()

  const handleToggle = (id: string, currentVal: boolean) => {
    if (disabled) return
    const nextVal = !currentVal

    setChecklist((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_completed: nextVal } : i)),
    )

    startTransition(async () => {
      await toggleChecklistItemAction(id, nextVal)
    })
  }

  const completedCount = checklist.filter((i) => i.is_completed).length

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" /> SOP Checklist Prosedur
          </CardTitle>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-muted">
            {completedCount} / {checklist.length}
          </span>
        </div>
        <CardDescription className="text-xs">
          Wajib dicentang seluruhnya sesuai pekerjaan di lapangan.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <ul className="space-y-2">
          {checklist.map((item) => (
            <li
              key={item.id}
              onClick={() => handleToggle(item.id, item.is_completed)}
              className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                item.is_completed
                  ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                  : 'bg-card hover:bg-muted/40 border-border/60'
              }`}
            >
              <div
                className={`h-4 w-4 rounded border flex items-center justify-center mt-0.5 shrink-0 ${
                  item.is_completed
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-muted-foreground/40 bg-muted/20'
                }`}
              >
                {item.is_completed && <CheckCircle2 className="h-3 w-3" />}
              </div>
              <span className={item.is_completed ? 'line-through text-muted-foreground' : 'font-medium'}>
                {item.item}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
