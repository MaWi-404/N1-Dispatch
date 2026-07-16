export type Role = 'admin' | 'auxiliar'

export type TicketType = 'Incidente' | 'Solicitud'

/** Códigos de turno reales de la operación (ver tabla de turnos). */
export type ShiftStatus = 'A' | 'B' | 'C' | 'D' | 'E' | 'P' | 'L' | 'F' | 'G' | 'H' | 'I' | 'unassigned'

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

/** Definición completa de cada turno: letra, nombre corto, horario y color. */
export interface ShiftDefinition {
  code: ShiftStatus
  /** Etiqueta corta mostrada en chips/badges, p. ej. "A" */
  label: string
  /** Nombre descriptivo, p. ej. "Turno 1" */
  name: string
  /** Rango horario legible, vacío si no aplica (p. ej. Permiso) */
  time: string
  hours: string
  /** Clases Tailwind para el badge/chip de este turno */
  badgeClass: string
  /** Color sólido usado como acento (punto/indicador) */
  dotClass: string
  /** Si este turno cuenta como jornada laboral activa (para disponibilidad de despacho) */
  isWorking: boolean
}

export const SHIFT_CATALOG: Record<ShiftStatus, ShiftDefinition> = {
  A: {
    code: 'A',
    label: 'A',
    name: 'Turno 1',
    time: '7:00 – 16:00',
    hours: '8 horas',
    badgeClass: 'border-gray-300 bg-gray-100 text-gray-700',
    dotClass: 'bg-gray-400',
    isWorking: true,
  },
  B: {
    code: 'B',
    label: 'B',
    name: 'Turno 2',
    time: '8:00 – 17:00',
    hours: '8 horas',
    badgeClass: 'border-gray-600 bg-gray-700 text-white',
    dotClass: 'bg-gray-700',
    isWorking: true,
  },
  C: {
    code: 'C',
    label: 'C',
    name: 'Turno 3',
    time: '9:00 – 18:00',
    hours: '8 horas',
    badgeClass: 'border-slate-300 bg-slate-100 text-slate-700',
    dotClass: 'bg-slate-500',
    isWorking: true,
  },
  D: {
    code: 'D',
    label: 'D',
    name: 'Turno 4',
    time: '6:00 – 14:00',
    hours: '8 horas',
    badgeClass: 'border-green-200 bg-green-50 text-green-700',
    dotClass: 'bg-green-500',
    isWorking: true,
  },
  E: {
    code: 'E',
    label: 'E',
    name: 'Turno 5',
    time: '14:00 – 22:00',
    hours: '8 horas',
    badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',
    dotClass: 'bg-blue-500',
    isWorking: true,
  },
  P: {
    code: 'P',
    label: 'P',
    name: 'Permiso',
    time: '',
    hours: '',
    badgeClass: 'border-red-200 bg-red-50 text-red-700',
    dotClass: 'bg-red-500',
    isWorking: false,
  },
  L: {
    code: 'L',
    label: 'L',
    name: 'Descanso',
    time: '',
    hours: '',
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dotClass: 'bg-emerald-600',
    isWorking: false,
  },
  F: {
    code: 'F',
    label: 'F',
    name: 'Turno 6',
    time: '22:00 – 6:00',
    hours: '8 horas',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
    dotClass: 'bg-amber-400',
    isWorking: true,
  },
  G: {
    code: 'G',
    label: 'G',
    name: 'Turno 8 · Montevideo',
    time: '8:00 – 5:00',
    hours: '8 horas',
    badgeClass: 'border-purple-300 bg-purple-100 text-purple-800',
    dotClass: 'bg-purple-700',
    isWorking: true,
  },
  H: {
    code: 'H',
    label: 'H',
    name: 'Turno 7',
    time: '',
    hours: '8 horas',
    badgeClass: 'border-orange-200 bg-orange-50 text-orange-700',
    dotClass: 'bg-orange-300',
    isWorking: true,
  },
  I: {
    code: 'I',
    label: 'I',
    name: 'Turno 9 · Escuela de Formación',
    time: '8:00 – 5:00',
    hours: '8 horas',
    badgeClass: 'border-fuchsia-300 bg-fuchsia-100 text-fuchsia-800',
    dotClass: 'bg-fuchsia-600',
    isWorking: true,
  },
  unassigned: {
    code: 'unassigned',
    label: '—',
    name: 'Sin asignar',
    time: '',
    hours: '',
    badgeClass: 'border-gray-200 bg-white text-gray-400',
    dotClass: 'bg-gray-300',
    isWorking: false,
  },
}

/** Orden de despliegue en selectores y tablas. */
export const SHIFT_ORDER: ShiftStatus[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'P', 'L', 'unassigned']

/** Etiqueta legible de un turno, p. ej. "A · Turno 1 (7:00–16:00)" */
export const SHIFT_LABELS: Record<ShiftStatus, string> = Object.fromEntries(
  SHIFT_ORDER.map((code) => {
    const def = SHIFT_CATALOG[code]
    const suffix = def.time ? ` (${def.time})` : ''
    return [code, code === 'unassigned' ? def.name : `${def.code} · ${def.name}${suffix}`]
  }),
) as Record<ShiftStatus, string>

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
