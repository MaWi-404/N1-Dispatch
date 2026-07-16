import React from 'react'
import {
  BarChart3,
  CalendarClock,
  LifeBuoy,
  LogOut,
  Send,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react'
import type { Role } from '@/types'
import { ROLE_LABELS } from '@/types'
import { cn } from '@/lib/utils'

export type AdminSection = 'despacho' | 'tecnicos' | 'turnos' | 'reportes'

const NAV_ITEMS: Array<{ key: AdminSection; label: string; icon: React.ElementType }> = [
  { key: 'despacho', label: 'Despacho de Tickets', icon: Send },
  { key: 'tecnicos', label: 'Gestión de Técnicos', icon: UsersRound },
  { key: 'turnos', label: 'Control de Turnos', icon: CalendarClock },
  { key: 'reportes', label: 'Reportes Históricos', icon: BarChart3 },
]

interface AppShellProps {
  role: Role
  onRoleChange: (role: Role) => void
  onLogout: () => void
  section: AdminSection
  onSectionChange: (s: AdminSection) => void
  children: React.ReactNode
}

export function AppShell({ role, onRoleChange, onLogout, section, onSectionChange, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Barra superior */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-gray-900 text-white">
              <LifeBuoy className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-gray-900">Mesa de Ayuda</p>
              <p className="text-[11px] text-gray-500">Despacho de tickets de soporte técnico</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Alternancia de rol para pruebas */}
            <div className="flex items-center rounded-md border border-gray-200 bg-gray-50 p-0.5">
              {(['admin', 'auxiliar'] as Role[]).map((r) => {
                const Icon = r === 'admin' ? ShieldCheck : UserRound
                const selected = role === r
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onRoleChange(r)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-[5px] px-2.5 py-1.5 text-xs font-medium transition-colors',
                      selected
                        ? 'border border-gray-200 bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                    <span className="hidden sm:inline">{ROLE_LABELS[r]}</span>
                    <span className="sm:hidden">{r === 'admin' ? 'Admin' : 'Auxiliar'}</span>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex w-full">
        {/* Sidebar solo para administrador */}
        {role === 'admin' && (
          <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 border-r border-gray-200 bg-white md:block">
            <nav className="flex flex-col gap-1 p-3">
              <p className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Administración
              </p>
              {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
                const selected = section === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSectionChange(key)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm transition-colors',
                      selected
                        ? 'border-gray-200 bg-gray-100 font-medium text-gray-900'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                    {label}
                  </button>
                )
              })}
            </nav>
          </aside>
        )}

        {/* Navegación horizontal del admin en pantallas pequeñas */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">
            {role === 'admin' && (
              <div className="mb-5 flex gap-1 overflow-x-auto rounded-md border border-gray-200 bg-white p-1 md:hidden">
                {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
                  const selected = section === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onSectionChange(key)}
                      className={cn(
                        'flex shrink-0 items-center gap-1.5 rounded-[5px] px-3 py-1.5 text-xs font-medium transition-colors',
                        selected ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-800',
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {label}
                    </button>
                  )
                })}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
