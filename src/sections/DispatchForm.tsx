import { useMemo, useState, type FormEvent } from 'react'
import { Hash, Send, TriangleAlert, Clock3 } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/lib/store'
import type { TicketType } from '@/types'
import { SHIFT_LABELS } from '@/types'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TICKET_TYPES: TicketType[] = ['Incidente', 'Solicitud']

export function DispatchForm() {
  const { workingToday, shiftOf, addTicket, tickets, technicians } = useStore()
  const [number, setNumber] = useState('')
  const [ticketType, setTicketType] = useState<TicketType>('Incidente')
  const [techId, setTechId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const techName = useMemo(() => {
    const map = new Map(technicians.map((t) => [t.id, t.name]))
    return (id: string) => map.get(id) ?? '—'
  }, [technicians])

  const recent = useMemo(() => [...tickets].slice(-6).reverse(), [tickets])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!number.trim()) {
      setError('Ingresa el número de ticket.')
      return
    }
    if (!techId) {
      setError('Selecciona el técnico asignado.')
      return
    }
    addTicket(number, ticketType, techId)
    toast.success(`Ticket ${number.trim()} despachado a ${techName(techId)}`)
    setNumber('')
    setError(null)
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold">Formulario de Despacho</CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              Registro rápido de asignación de tickets
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-gray-200 text-xs font-medium text-gray-500">
            {workingToday.length} técnico{workingToday.length === 1 ? '' : 's'} disponible
            {workingToday.length === 1 ? '' : 's'} hoy
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ticket-number" className="text-xs font-medium text-gray-700">
              Número de Ticket
            </Label>
            <div className="relative">
              <Hash className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" strokeWidth={1.75} />
              <Input
                id="ticket-number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Ej. TK-1024"
                className="border-gray-200 pl-8 text-sm"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Tipo</Label>
            <div className="grid grid-cols-2 gap-1 rounded-md border border-gray-200 bg-gray-50 p-1">
              {TICKET_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTicketType(t)}
                  className={cn(
                    'rounded-[5px] px-3 py-1.5 text-sm font-medium transition-colors',
                    ticketType === t
                      ? 'border border-gray-200 bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Técnico asignado</Label>
            {workingToday.length > 0 ? (
              <Select value={techId} onValueChange={setTechId}>
                <SelectTrigger className="border-gray-200 text-sm">
                  <SelectValue placeholder="Selecciona un técnico activo hoy" />
                </SelectTrigger>
                <SelectContent>
                  {workingToday.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="flex items-center gap-2">
                        {t.name}
                        <span className="text-xs text-gray-400">· {SHIFT_LABELS[shiftOf(t.id)]}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <TriangleAlert className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                No hay técnicos con turno laboral hoy. Un administrador debe asignarlos en «Control de Turnos».
              </div>
            )}
            <p className="text-[11px] text-gray-400">
              El selector solo muestra técnicos activos con turno asignado para hoy.
            </p>
          </div>

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}

          <Button type="submit" className="w-full gap-1.5" disabled={workingToday.length === 0}>
            <Send className="h-4 w-4" strokeWidth={1.75} />
            Registrar despacho
          </Button>
        </form>

        {recent.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Clock3 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Últimos registros
            </p>
            <ul className="divide-y divide-gray-100">
              {recent.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="font-medium text-gray-900">{t.number}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'border text-[10px] font-medium',
                        t.type === 'Incidente'
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-blue-200 bg-blue-50 text-blue-700',
                      )}
                    >
                      {t.type}
                    </Badge>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="truncate text-xs text-gray-600">{techName(t.techId)}</p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(t.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
