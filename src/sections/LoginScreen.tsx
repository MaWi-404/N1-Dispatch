import { useState, type ElementType } from 'react'
import { LifeBuoy, ShieldCheck, UserRound, ArrowRight } from 'lucide-react'
import type { Role } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface LoginScreenProps {
  onLogin: (role: Role) => void
}

const PROFILES: Array<{
  role: Role
  name: string
  description: string
  icon: ElementType
  scope: string
}> = [
  {
    role: 'admin',
    name: 'Administrador',
    description: 'Coordinación de mesa de ayuda',
    icon: ShieldCheck,
    scope: 'Despacho, gestión de técnicos, turnos y reportes',
  },
  {
    role: 'auxiliar',
    name: 'Auxiliar / Break',
    description: 'Cobertura de registro rápido',
    icon: UserRound,
    scope: 'Solo registro de despachos y carga del turno',
  },
]

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selected, setSelected] = useState<Role>('admin')

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-gray-900 text-white">
            <LifeBuoy className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">Mesa de Ayuda</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sistema de despacho de tickets de soporte técnico
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Selecciona un perfil para ingresar
          </p>
          <div className="space-y-2">
            {PROFILES.map(({ role, name, description, icon: Icon, scope }) => {
              const active = selected === role
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelected(role)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-md border p-3.5 text-left transition-colors',
                    active
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border',
                      active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-500',
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{description}</p>
                    <p className="mt-1.5 text-[11px] leading-snug text-gray-400">{scope}</p>
                  </div>
                </button>
              )
            })}
          </div>

          <Button className="mt-4 w-full gap-1.5" onClick={() => onLogin(selected)}>
            Iniciar sesión
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Button>
          <p className="mt-3 text-center text-[11px] text-gray-400">
            Acceso simulado para demostración · también puedes alternar el rol desde la esquina superior derecha
          </p>
        </div>
      </div>
    </div>
  )
}
