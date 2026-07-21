import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from 'recharts'
import * as XLSX from 'xlsx'
import { Download } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStore } from '@/lib/store'
import { SHIFT_CATALOG, SHIFT_LABELS, dateKeyOf, todayKey } from '@/types'
import type { ShiftStatus } from '@/types'

const chartConfig = {
  tickets: { label: 'Tickets asignados', color: '#1F2937' },
} satisfies ChartConfig

type ShiftFilter = 'all' | ShiftStatus

export function MiniDashboard() {
  const { workingToday, shiftOf, tickets } = useStore()
  const [filter, setFilter] = useState<ShiftFilter>('all')
  const today = todayKey()

  const shiftsPresent = useMemo(() => {
    const set = new Set<ShiftStatus>()
    for (const t of workingToday) set.add(shiftOf(t.id))
    return Array.from(set).sort()
  }, [workingToday, shiftOf])

  const data = useMemo(() => {
    const counts = new Map<string, number>()
    for (const tk of tickets) {
      if (dateKeyOf(tk.createdAt) === today) {
        counts.set(tk.techId, (counts.get(tk.techId) ?? 0) + 1)
      }
    }
    return workingToday
      .filter((t) => filter === 'all' || shiftOf(t.id) === filter)
      .map((t) => ({
        id: t.id,
        name: t.name.split(' ').slice(0, 2).join(' '),
        fullName: t.name,
        tickets: counts.get(t.id) ?? 0,
        shift: shiftOf(t.id) as ShiftStatus,
      }))
      .sort((a, b) => b.tickets - a.tickets)
  }, [tickets, workingToday, filter, shiftOf, today])

  const maxLoad = Math.max(0, ...data.map((d) => d.tickets))
  const totalToday = data.reduce((acc, d) => acc + d.tickets, 0)

  const handleExportExcel = () => {
    // Barra visual hecha con caracteres de bloque, escalada al máximo del turno.
    // No requiere un gráfico nativo de Excel (frágil de generar desde el navegador)
    // y funciona igual en Excel, Google Sheets o LibreOffice.
    const scale = maxLoad > 0 ? 20 / maxLoad : 0
    const rows = data.map((d) => ({
      Técnico: d.fullName,
      Turno: SHIFT_LABELS[d.shift],
      'Tickets asignados hoy': d.tickets,
      Carga: '▇'.repeat(Math.round(d.tickets * scale)) || '–',
      'Mayor carga del turno': d.tickets === maxLoad && maxLoad > 0 ? 'Sí' : '',
    }))

    const sheet = XLSX.utils.json_to_sheet(rows)
    sheet['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 20 }, { wch: 24 }, { wch: 20 }]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, sheet, 'Carga del turno')

    const fileDate = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(workbook, `carga-turno-${fileDate}.xlsx`)
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold">Carga del turno actual</CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              Tickets asignados hoy por técnico · evita sobrecargar a una persona
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-gray-200 text-xs font-medium text-gray-500">
              {workingToday.length} en turno hoy
            </Badge>
            <Select value={filter} onValueChange={(v) => setFilter(v as ShiftFilter)}>
              <SelectTrigger className="h-8 w-[160px] border-gray-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los turnos</SelectItem>
                {shiftsPresent.map((s) => (
                  <SelectItem key={s} value={s}>
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${SHIFT_CATALOG[s].dotClass}`} />
                      {SHIFT_CATALOG[s].label} · {SHIFT_CATALOG[s].name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-gray-200 text-xs font-medium text-gray-600"
              onClick={handleExportExcel}
              disabled={data.length === 0}
            >
              <Download className="h-3.5 w-3.5" />
              Exportar a Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        {data.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-gray-200 text-xs text-gray-400">
            No hay técnicos en este turno para mostrar.
          </div>
        ) : (
          <>
            {/* Min ~72px per technician keeps bars/labels legible; below that count the
                chart simply fills 100% of the card width like before. Beyond it, the
                chart scrolls horizontally instead of squeezing every bar together. */}
            <div className="-mx-1 overflow-x-auto px-1">
              <div style={{ minWidth: data.length > 7 ? `${Math.max(110, data.length * 110)}px` : '100%' }}>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <BarChart data={data} margin={{ top: 18, right: 8, left: -18, bottom: 0 }} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke="#EEF0F2" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    />
                    <ChartTooltip
                      cursor={{ fill: 'rgba(17,24,39,0.04)' }}
                      content={
                        <ChartTooltipContent
                          formatter={(value, _name, item) => (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium">{item.payload.fullName}</span>
                              <span>
                                {value} ticket{Number(value) === 1 ? '' : 's'} · {SHIFT_LABELS[item.payload.shift as ShiftStatus]}
                              </span>
                            </div>
                          )}
                        />
                      }
                    />
                    <Bar dataKey="tickets" radius={[8, 8, 0, 0]} maxBarSize={46} animationDuration={700}>
                      {data.map((d) => (
                        <Cell
                          key={d.id}
                          fill={d.tickets === maxLoad && maxLoad > 0 ? '#F59E0B' : d.tickets >= maxLoad * 0.7 ? '#374151' : '#9CA3AF'}
                        />
                      ))}
                      <LabelList dataKey="tickets" position="top" style={{ fontSize: 11, fill: '#374151', fontWeight: 600 }} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            </div>
            {data.length > 7 && (
              <p className="mt-1.5 text-right text-[11px] text-gray-400">
                Desliza para ver todos los técnicos →
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
              <span>
                Total despachado hoy: <strong className="font-semibold text-gray-900">{totalToday}</strong> ticket
                {totalToday === 1 ? '' : 's'}
              </span>
              {maxLoad > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-amber-600" />
                  Mayor carga del turno — revisa antes de asignar más
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
