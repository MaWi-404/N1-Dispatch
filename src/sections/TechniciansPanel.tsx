import { useMemo, useState, type FormEvent } from 'react'
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function TechniciansPanel() {
  const { technicians, tickets, addTechnician, toggleTechnician } = useStore()
  const [name, setName] = useState('')

  const ticketCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of tickets) map.set(t.techId, (map.get(t.techId) ?? 0) + 1)
    return map
  }, [tickets])

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    const clean = name.trim()
    if (!clean) return
    if (technicians.some((t) => t.name.toLowerCase() === clean.toLowerCase())) {
      toast.error('Ya existe un técnico con ese nombre.')
      return
    }
    addTechnician(clean)
    toast.success(`Técnico «${clean}» agregado como activo.`)
    setName('')
  }

  const activeCount = technicians.filter((t) => t.active).length

  return (
    <div className="space-y-5">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-base font-semibold">Agregar Técnico</CardTitle>
          <CardDescription className="mt-0.5 text-xs">
            Solo necesitas el nombre; ingresa como activo y sin turno asignado hoy
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo del técnico"
              className="border-gray-200 text-sm"
              autoComplete="off"
            />
            <Button type="submit" className="shrink-0 gap-1.5">
              <UserPlus className="h-4 w-4" strokeWidth={1.75} />
              Agregar técnico
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold">Técnicos registrados</CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                Desactivar conserva el historial de tickets del técnico
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-gray-200 text-xs font-medium text-gray-500">
              {activeCount} activo{activeCount === 1 ? '' : 's'} / {technicians.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className="pl-6 text-xs">Técnico</TableHead>
                <TableHead className="text-xs">Estado</TableHead>
                <TableHead className="text-right text-xs">Tickets históricos</TableHead>
                <TableHead className="pr-6 text-right text-xs">Activo / Inactivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.map((t) => (
                <TableRow key={t.id} className="border-gray-100">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold',
                          t.active
                            ? 'border-gray-200 bg-gray-100 text-gray-700'
                            : 'border-gray-100 bg-gray-50 text-gray-400',
                        )}
                      >
                        {t.name
                          .split(' ')
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                      <span className={cn('text-sm font-medium', t.active ? 'text-gray-900' : 'text-gray-400')}>
                        {t.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'border text-[11px] font-medium',
                        t.active
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 bg-gray-50 text-gray-500',
                      )}
                    >
                      {t.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-gray-600">
                    {ticketCounts.get(t.id) ?? 0}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Switch
                      checked={t.active}
                      onCheckedChange={() => {
                        toggleTechnician(t.id)
                        toast.info(
                          t.active
                            ? `«${t.name}» desactivado. Su historial se conserva.`
                            : `«${t.name}» reactivado.`,
                        )
                      }}
                      aria-label={`Cambiar estado de ${t.name}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
