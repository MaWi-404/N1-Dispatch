import { useEffect, useState } from 'react'
import { AppShell, type AdminSection } from '@/components/AppShell'
import { LoginScreen } from '@/sections/LoginScreen'
import { DispatchForm } from '@/sections/DispatchForm'
import { MiniDashboard } from '@/sections/MiniDashboard'
import { TechniciansPanel } from '@/sections/TechniciansPanel'
import { ShiftControl } from '@/sections/ShiftControl'
import { ReportsPanel } from '@/sections/ReportsPanel'
import { useStore } from '@/lib/store'
import type { Role } from '@/types'
import { ROLE_LABELS } from '@/types'
import { Badge } from '@/components/ui/badge'

const SESSION_KEY = 'ticket-dispatch-session'

function DispatchView() {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
      <div className="xl:col-span-2">
        <DispatchForm />
      </div>
      <div className="xl:col-span-3">
        <MiniDashboard />
      </div>
    </div>
  )
}

export default function Home() {
  const { workingToday } = useStore()
  const [role, setRole] = useState<Role | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw === 'admin' || raw === 'auxiliar' ? raw : null
    } catch {
      return null
    }
  })
  const [section, setSection] = useState<AdminSection>('despacho')

  useEffect(() => {
    try {
      if (role) localStorage.setItem(SESSION_KEY, role)
      else localStorage.removeItem(SESSION_KEY)
    } catch {
      /* sin almacenamiento */
    }
  }, [role])

  if (!role) {
    return <LoginScreen onLogin={(r) => setRole(r)} />
  }

  const handleRoleChange = (r: Role) => {
    setRole(r)
    if (r === 'auxiliar') setSection('despacho')
  }

  const sectionTitles: Record<AdminSection, { title: string; subtitle: string }> = {
    despacho: { title: 'Despacho de Tickets', subtitle: 'Registro y balance de carga del turno' },
    tecnicos: { title: 'Gestión de Técnicos', subtitle: 'Alta de personal y control de estado' },
    turnos: { title: 'Control de Turnos Diario', subtitle: 'Asignación de jornada por técnico' },
    reportes: { title: 'Reportes Históricos', subtitle: 'Carga de trabajo real a lo largo del tiempo' },
  }
  const current = sectionTitles[section]

  return (
    <AppShell
      role={role}
      onRoleChange={handleRoleChange}
      onLogout={() => setRole(null)}
      section={section}
      onSectionChange={setSection}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-gray-900">
              {role === 'auxiliar' ? 'Registro Rápido de Despacho' : current.title}
            </h1>
            <Badge
              variant="outline"
              className={
                role === 'admin'
                  ? 'border-gray-900 bg-gray-900 text-[10px] font-medium text-white'
                  : 'border-gray-200 bg-white text-[10px] font-medium text-gray-600'
              }
            >
              {ROLE_LABELS[role]}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            {role === 'auxiliar'
              ? `Vista simplificada de cobertura · ${workingToday.length} técnico${workingToday.length === 1 ? '' : 's'} disponible${workingToday.length === 1 ? '' : 's'} hoy`
              : current.subtitle}
          </p>
        </div>
      </div>

      {role === 'auxiliar' ? (
        <DispatchView />
      ) : (
        <>
          {section === 'despacho' && <DispatchView />}
          {section === 'tecnicos' && <TechniciansPanel />}
          {section === 'turnos' && <ShiftControl />}
          {section === 'reportes' && <ReportsPanel />}
        </>
      )}
    </AppShell>
  )
}
