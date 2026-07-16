import { useMemo } from 'react'
import { CalendarClock } from 'lucide-react'
import { useStore } from '@/lib/store'
import { SHIFT_CATALOG, SHIFT_ORDER, dateKeyOf, todayKey } from '@/types'
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

const SHIFT_OPTIONS: ShiftStatus[] = SHIFT_ORDER

export function ShiftControl() {
  const { technicians, shiftOf, setShift, tickets } = useStore()
  const today = todayKey()
  const activeTechs = technicians.filter((t) => t.active)

  const summary = useMemo(() => {
    const counts = Object.fromEntries(SHIFT_ORDER.map((s) => [s, 0])) as Record<ShiftStatus, number>
    for (const t of activeTechs) counts[shiftOf(t.id)] += 1
    return counts
  }, [activeTechs, shiftOf])

  const usedShifts = SHIFT_ORDER.filter((s) => summary[s] > 0)

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
            {usedShifts.length === 0 ? (
              <Badge variant="outline" className="border-gray-200 bg-white text-[11px] font-medium text-gray-400">
                Sin turnos asignados hoy
              </Badge>
            ) : (
              usedShifts.map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className={cn('border text-[11px] font-medium', SHIFT_CATALOG[s].badgeClass)}
                  title={SHIFT_CATALOG[s].name}
                >
                  {SHIFT_CATALOG[s].label}: {summary[s]}
                </Badge>
              ))
            )}
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
                      className={cn('border text-[11px] font-medium', SHIFT_CATALOG[status].badgeClass)}
                    >
                      {SHIFT_CATALOG[status].label !== '—' ? `${SHIFT_CATALOG[status].label} · ` : ''}
                      {SHIFT_CATALOG[status].name}
                    </Badge>
                    <Select
                      value={status}
                      onValueChange={(v) => setShift(t.id, today, v as ShiftStatus)}
                    >
                      <SelectTrigger className="h-8 w-[210px] border-gray-200 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SHIFT_OPTIONS.map((s) => {
                          const def = SHIFT_CATALOG[s]
                          return (
                            <SelectItem key={s} value={s}>
                              <span className="flex items-center gap-2">
                                <span className={cn('h-2 w-2 shrink-0 rounded-full', def.dotClass)} />
                                <span>
                                  {def.label !== '—' ? `${def.label} · ` : ''}
                                  {def.name}
                                  {def.time && <span className="text-gray-400"> · {def.time}</span>}
                                </span>
                              </span>
                            </SelectItem>
                          )
                        })}
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
