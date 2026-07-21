import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import * as XLSX from 'xlsx'
import { Download } from 'lucide-react'
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
    const rows = data.map((d) => ({
      'Técnico': d.fullName,
      'Turno': SHIFT_LABELS[d.shift],
      'Tickets asignados hoy': d.tickets,
      'Carga visual': d.tickets > 0 ? '█'.repeat(Math.min(d.tickets, 10)) : '',
      'Mayor carga': d.tickets === maxLoad && maxLoad > 0 ? '⚠️ Sí' : '',
    }))

    rows.push({
      'Técnico': 'TOTAL',
      'Turno': '',
      'Tickets asignados hoy': totalToday,
      'Carga visual': '',
      'Mayor carga': '',
    })

    const sheet = XLSX.utils.json_to_sheet(rows)
    sheet['!cols'] = [
      { wch: 30 },
      { wch: 18 },
      { wch: 22 },
      { wch: 20 },
      { wch: 15 },
    ]

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
          </div>
        </div>
        {/* BOTÓN DE EXCEL - AHORA EN SU PROPIA FILA PARA QUE SIEMPRE SE VEA */}
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="gap-1.5 bg-green-600 text-white hover:bg-green-700"
            onClick={handleExportExcel}
            disabled={data.length === 0}
          >
            <Download className="h-4 w-4" />
            Exportar a Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        {data.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-gray-200 text-xs text-gray-400">
            No hay técnicos en este turno para mostrar.
          </div>
        ) : (
          <>
            <div className="w-full" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                  barCategoryGap="20%"
                  barGap={4}
                >
                  <CartesianGrid vertical={false} stroke="#EEF0F2" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    interval={0}
                    height={40}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    width={30}
                  />
                  <Bar
                    dataKey="tickets"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={50}
                    animationDuration={700}
                  >
                    {data.map((d) => (
                      <Cell
                        key={d.id}
                        fill={
                          d.tickets === maxLoad && maxLoad > 0
                            ? '#F59E0B'
                            : d.tickets >= maxLoad * 0.7 && maxLoad > 0
                              ? '#374151'
                              : '#9CA3AF'
                        }
                      />
                    ))}
                    <LabelList
                      dataKey="tickets"
                      position="top"
                      style={{ fontSize: 11, fill: '#374151', fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

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
