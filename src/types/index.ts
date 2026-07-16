export type Role = 'admin' | 'auxiliar'

export type TicketType = 'Incidente' | 'Solicitud'

export type ShiftStatus = 'morning' | 'afternoon' | 'off' | 'unassigned'

export interface Technician {
  id: string
  name: string
  active: boolean
  createdAt: string
}

export interface ShiftAssignment {
  techId: string
  /** YYYY-MM-DD */
  date: string
  status: ShiftStatus
}

export interface Ticket {
  id: string
  number: string
  type: TicketType
  techId: string
  /** ISO datetime */
  createdAt: string
}

export const SHIFT_LABELS: Record<ShiftStatus, string> = {
  morning: 'Turno Mañana',
  afternoon: 'Turno Tarde',
  off: 'Descanso',
  unassigned: 'Sin asignar',
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  auxiliar: 'Auxiliar / Break',
}

export const todayKey = (d: Date = new Date()): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Clave de fecha LOCAL de un ISO datetime (evita desfases UTC/local). */
export const dateKeyOf = (iso: string): string => todayKey(new Date(iso))

/** Turno detectado según la hora local: antes de las 14:00 → mañana. */
export const currentShiftOfDay = (d: Date = new Date()): 'morning' | 'afternoon' =>
  d.getHours() < 14 ? 'morning' : 'afternoon'
