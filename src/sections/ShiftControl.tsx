import { useMemo } from 'react'
import { CalendarClock } from 'lucide-react'
import { useStore } from '@/lib/store'
import { SHIFT_LABELS, dateKeyOf, todayKey } from '@/types'
import type { ShiftStatus } from '@/types'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SHIFT_OPTIONS: ShiftStatus[] = ['morning', 'afternoon', 'off', 'unassigned']

const SHIFT_BADGE_STYLES: Record<ShiftStatus, string> = {
  morning: 'border-sky-200 bg-sky-50 text-sky-700',
  afternoon: 'border-violet-200 bg-violet-50 text-violet-700',
  off: 'border-gray-200 bg-gray-50 text-gray-500',
  unassigned: 'border-amber-200 bg-amber-50 text-amber-700',
}

export function ShiftControl() {
  const { technicians, shiftOf, setShift, tickets } = useStore()
  const today = todayKey()
  const activeTechs = technicians.filter((t) => t.active)

  const summary = useMemo(() => {
    const counts: Record<ShiftStatus, number> = { morning: 0, afternoon: 0, off: 0, unassigned: 0 }
    for (const t of activeTechs) counts[shiftOf(t.id)] += 1
    return counts
  }, [activeTechs, shiftOf])

  const todayTicketCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const tk of tickets) {
      if (dateKeyOf(tk.createdAt) === today) map.set(tk.techId, (map.get(tk.techId) ?? 0) + 1)
    }
    return map
  }, [tickets, today])

  const todayLabel = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <CalendarClock className="h-4 w-4 text-gray-500" strokeWidth={1.75} />
              Control de Turnos Diario
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs capitalize">{todayLabel}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SHIFT_OPTIONS.map((s) => (
              <Badge
                key={s}
                variant="outline"
                className={cn('border text-[11px] font-medium', SHIFT_BADGE_STYLES[s])}
              >
                {SHIFT_LABELS[s]}: {summary[s]}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {activeTechs.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-xs text-gray-400">
            No hay técnicos activos. Actívalos desde «Gestión de Técnicos».
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {activeTechs.map((t) => {
              const status = shiftOf(t.id)
              return (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-xs font-semibold text-gray-700">
                      {t.name
                        .split(' ')
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="text-[11px] text-gray-400">
                        {todayTicketCounts.get(t.id) ?? 0} ticket{(todayTicketCounts.get(t.id) ?? 0) === 1 ? '' : 's'} hoy
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn('border text-[11px] font-medium', SHIFT_BADGE_STYLES[status])}
                    >
                      {SHIFT_LABELS[status]}
                    </Badge>
                    <Select
                      value={status}
                      onValueChange={(v) => setShift(t.id, today, v as ShiftStatus)}
                    >
                      <SelectTrigger className="h-8 w-[160px] border-gray-200 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SHIFT_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {SHIFT_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
