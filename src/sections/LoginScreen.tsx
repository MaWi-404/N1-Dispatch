import { useState, type ElementType, type FormEvent } from 'react'
import { LifeBuoy, ShieldCheck, UserRound, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react'
import type { Role } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

/**
 * Credenciales de demostración. No hay backend: esta validación ocurre
 * en el navegador, así que sirve para simular el flujo de acceso por rol,
 * no como autenticación segura de producción.
 */
const DEMO_CREDENTIALS: Record<Role, string> = {
  admin: 'admin123',
  auxiliar: 'aux123',
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selected, setSelected] = useState<Role>('admin')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
                  onClick={() => {
                    setSelected(role)
                    setError(null)
                  }}
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

          <form
            className="mt-4 space-y-3"
            onSubmit={(e: FormEvent) => {
              e.preventDefault()
              if (password !== DEMO_CREDENTIALS[selected]) {
                setError('Contraseña incorrecta para este perfil.')
                return
              }
              setError(null)
              onLogin(selected)
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="login-password" className="text-xs font-medium text-gray-700">
                Contraseña
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                  strokeWidth={1.75}
                />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(null)
                  }}
                  placeholder="Ingresa tu contraseña"
                  className="border-gray-200 pl-8 pr-9 text-sm"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>
              {error && <p className="text-xs font-medium text-red-600">{error}</p>}
            </div>

            <Button type="submit" className="w-full gap-1.5">
              Iniciar sesión
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          </form>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-gray-400">
            Demo sin backend · contraseña de <strong className="text-gray-500">Administrador</strong>:{' '}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-600">admin123</code> · contraseña de{' '}
            <strong className="text-gray-500">Auxiliar</strong>:{' '}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-600">aux123</code>
          </p>
          <p className="mt-2 text-center text-[11px] text-gray-400">
            También puedes alternar el rol desde la esquina superior derecha una vez dentro
          </p>
        </div>
      </div>
    </div>
  )
}
