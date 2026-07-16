import { useMemo, useState, type FormEvent } from 'react'
import { UserPlus, Trash2 } from 'lucide-react'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function TechniciansPanel() {
  const { technicians, tickets, addTechnician, toggleTechnician, deleteTechnician, clearAll } = useStore()
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
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-gray-200 text-xs font-medium text-gray-500">
                {activeCount} activo{activeCount === 1 ? '' : 's'} / {technicians.length} total
              </Badge>
              {technicians.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1.5 border-gray-200 text-xs font-medium text-gray-500 hover:border-red-200 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Vaciar lista
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar todos los técnicos?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esto borra por completo la lista de técnicos, sus turnos y el historial de tickets
                        (útil para quitar los datos de demostración y empezar desde cero). No se puede
                        deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                        onClick={() => {
                          clearAll()
                          toast.success('Datos de demostración eliminados. Puedes empezar desde cero.')
                        }}
                      >
                        Vaciar todo
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className="pl-6 text-xs">Técnico</TableHead>
                <TableHead className="text-xs">Estado</TableHead>
                <TableHead className="text-right text-xs">Tickets históricos</TableHead>
                <TableHead className="text-right text-xs">Activo / Inactivo</TableHead>
                <TableHead className="pr-6 text-right text-xs">Eliminar</TableHead>
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
                  <TableCell className="text-right">
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
                  <TableCell className="pr-6 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          className="rounded-md border border-transparent p-1.5 text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Eliminar a ${t.name}`}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar a «{t.name}»?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esto quita al técnico de la lista y de los turnos asignados. Su historial de{' '}
                            {ticketCounts.get(t.id) ?? 0} ticket{(ticketCounts.get(t.id) ?? 0) === 1 ? '' : 's'}{' '}
                            se conserva en los reportes, pero esta acción no se puede deshacer para el registro
                            del técnico.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                            onClick={() => {
                              deleteTechnician(t.id)
                              toast.success(`«${t.name}» eliminado.`)
                            }}
                          >
                            Eliminar definitivamente
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
