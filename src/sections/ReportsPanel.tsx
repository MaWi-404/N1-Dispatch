import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/lib/store'
import { dateKeyOf, todayKey } from '@/types'
import { cn } from '@/lib/utils'

const areaConfig = {
  acumulado: { label: 'Tickets acumulados', color: '#1F2937' },
} satisfies ChartConfig

const barConfig = {
  tickets: { label: 'Tickets', color: '#1F2937' },
} satisfies ChartConfig

const PRESETS = [
  { label: '7 días', days: 7 },
  { label: '30 días', days: 30 },
  { label: '45 días', days: 45 },
] as const

function shiftDateKey(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return todayKey(d)
}

export function ReportsPanel() {
  const { tickets, technicians } = useStore()
  const [from, setFrom] = useState(() => shiftDateKey(29))
  const [to, setTo] = useState(() => todayKey())

  const techName = useMemo(() => {
    const map = new Map(technicians.map((t) => [t.id, t.name]))
    return (id: string) => map.get(id) ?? 'Técnico eliminado'
  }, [technicians])

  const filtered = useMemo(
    () =>
      tickets.filter((t) => {
        const day = t.createdAt.slice(0, 10)
        return day >= from && day <= to
      }),
    [tickets, from, to],
  )

  const cumulative = useMemo(() => {
    const byDay = new Map<string, number>()
    for (const t of filtered) {
      const day = dateKeyOf(t.createdAt)
      byDay.set(day, (byDay.get(day) ?? 0) + 1)
    }
    const days: string[] = []
    for (let d = new Date(from + 'T12:00:00'); todayKey(d) <= to; d.setDate(d.getDate() + 1)) {
      days.push(todayKey(d))
    }
    let acc = 0
    return days.map((day) => {
      acc += byDay.get(day) ?? 0
      return {
        day,
        label: new Date(day + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        acumulado: acc,
      }
    })
  }, [filtered, from, to])

  const perTech = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of filtered) map.set(t.techId, (map.get(t.techId) ?? 0) + 1)
    return [...map.entries()]
      .map(([techId, count]) => ({
        techId,
        name: techName(techId).split(' ').slice(0, 2).join(' '),
        fullName: techName(techId),
        tickets: count,
      }))
      .sort((a, b) => b.tickets - a.tickets)
  }, [filtered, techName])

  const incidentes = filtered.filter((t) => t.type === 'Incidente').length
  const solicitudes = filtered.length - incidentes
  const dayCount = Math.max(1, cumulative.length)
  const topTech = perTech[0]

  const stats = [
    { label: 'Tickets en el rango', value: String(filtered.length) },
    { label: 'Incidentes', value: String(incidentes) },
    { label: 'Solicitudes', value: String(solicitudes) },
    { label: 'Promedio por día', value: (filtered.length / dayCount).toFixed(1) },
  ]

  const invalidRange = from > to

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-base font-semibold">Filtros por fecha</CardTitle>
          <CardDescription className="mt-0.5 text-xs">
            Delimita el período para el reporte de carga de trabajo
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3 pt-5">
          <div className="space-y-1.5">
            <Label htmlFor="from" className="text-xs font-medium text-gray-700">Desde</Label>
            <Input
              id="from"
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
              className="w-[160px] border-gray-200 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to" className="text-xs font-medium text-gray-700">Hasta</Label>
            <Input
              id="to"
              type="date"
              value={to}
              min={from}
              max={todayKey()}
              onChange={(e) => setTo(e.target.value)}
              className="w-[160px] border-gray-200 text-sm"
            />
          </div>
          <div className="flex gap-1 rounded-md border border-gray-200 bg-gray-50 p-1">
            {PRESETS.map((p) => {
              const active = from === shiftDateKey(p.days - 1) && to === todayKey()
              return (
                <Button
                  key={p.days}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFrom(shiftDateKey(p.days - 1))
                    setTo(todayKey())
                  }}
                  className={cn(
                    'h-7 rounded-[5px] px-2.5 text-xs',
                    active ? 'border border-gray-200 bg-white font-medium shadow-sm' : 'text-gray-500',
                  )}
                >
                  Últimos {p.label}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico acumulativo */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-base font-semibold">Carga acumulativa de tickets</CardTitle>
          <CardDescription className="mt-0.5 text-xs">
            Evolución acumulada dentro del período seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          {invalidRange || filtered.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-gray-200 text-xs text-gray-400">
              {invalidRange ? 'El rango de fechas no es válido.' : 'Sin tickets en el período seleccionado.'}
            </div>
          ) : (
            <ChartContainer config={areaConfig} className="h-[260px] w-full">
              <AreaChart data={cumulative} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillAcumulado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1F2937" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#1F2937" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#EEF0F2" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  minTickGap={28}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, _n, item) => (
                        <span>
                          {value} tickets acumulados al {item.payload.label}
                        </span>
                      )}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="acumulado"
                  stroke="#1F2937"
                  strokeWidth={1.75}
                  fill="url(#fillAcumulado)"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Distribución por técnico */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold">Distribución por técnico</CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                Carga real por persona en el período — evidencia para gerencia
              </CardDescription>
            </div>
            {topTech && filtered.length > 0 && (
              <p className="text-xs text-gray-500">
                Mayor carga: <strong className="font-semibold text-gray-900">{topTech.fullName}</strong> (
                {topTech.tickets} tickets)
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          {perTech.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-gray-200 text-xs text-gray-400">
              Sin datos para mostrar.
            </div>
          ) : (
            <ChartContainer config={barConfig} className="h-[240px] w-full">
              <BarChart
                data={perTech}
                layout="vertical"
                margin={{ top: 0, right: 28, left: 8, bottom: 0 }}
                barCategoryGap="24%"
              >
                <CartesianGrid horizontal={false} stroke="#EEF0F2" />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(17,24,39,0.04)' }}
                  content={
                    <ChartTooltipContent
                      formatter={(value, _n, item) => (
                        <span>
                          {item.payload.fullName}: {value} tickets
                        </span>
                      )}
                    />
                  }
                />
                <Bar dataKey="tickets" radius={[0, 4, 4, 0]} maxBarSize={26}>
                  {perTech.map((d, i) => (
                    <Cell key={d.techId} fill={i === 0 ? '#1F2937' : '#9CA3AF'} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
