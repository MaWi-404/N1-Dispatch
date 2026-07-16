import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { ShiftAssignment, ShiftStatus, Technician, Ticket, TicketType } from '@/types'
import { todayKey } from '@/types'

interface State {
  technicians: Technician[]
  shifts: ShiftAssignment[]
  tickets: Ticket[]
}

type Action =
  | { type: 'ADD_TECH'; name: string }
  | { type: 'TOGGLE_TECH'; id: string }
  | { type: 'SET_SHIFT'; techId: string; date: string; status: ShiftStatus }
  | { type: 'ADD_TICKET'; number: string; ticketType: TicketType; techId: string }
  | { type: 'RESET_DEMO' }

const STORAGE_KEY = 'ticket-dispatch-v1'

const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

/** RNG determinista para que los datos de demostración sean estables. */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedState(): State {
  const rand = mulberry32(20260717)
  const names: Array<[string, boolean]> = [
    ['Carlos Mendoza', true],
    ['Ana Lucía Torres', true],
    ['Jorge Ramírez', true],
    ['María Fernanda Ruiz', true],
    ['Luis Alberto Soto', true],
    ['Valeria Campos', true],
    ['Diego Herrera', false],
    ['Paola Guzmán', false],
  ]
  const technicians: Technician[] = names.map(([name, active], i) => ({
    id: `tech-${i + 1}`,
    name,
    active,
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
  }))
  const activeTechs = technicians.filter((t) => t.active)

  // Turnos de hoy precargados
  const today = todayKey()
  const todayStatuses: ShiftStatus[] = ['morning', 'morning', 'morning', 'afternoon', 'afternoon', 'off']
  const shifts: ShiftAssignment[] = activeTechs.map((t, i) => ({
    techId: t.id,
    date: today,
    status: todayStatuses[i % todayStatuses.length],
  }))

  // Tickets históricos de los últimos 45 días
  const tickets: Ticket[] = []
  let counter = 1000
  for (let d = 45; d >= 0; d--) {
    const day = new Date()
    day.setDate(day.getDate() - d)
    const isWeekend = day.getDay() === 0 || day.getDay() === 6
    const base = isWeekend ? 2 : 6
    const count = base + Math.floor(rand() * (isWeekend ? 4 : 9))
    for (let k = 0; k < count; k++) {
      const tech = activeTechs[Math.floor(rand() * activeTechs.length)]
      const hour = 7 + Math.floor(rand() * 11)
      const minute = Math.floor(rand() * 60)
      const created = new Date(day)
      created.setHours(hour, minute, 0, 0)
      // Los tickets "de hoy" no pueden estar en el futuro
      if (d === 0 && created.getTime() > Date.now()) {
        created.setTime(Date.now() - Math.floor(rand() * 3600000) - 60000)
      }
      tickets.push({
        id: uid(),
        number: `TK-${counter++}`,
        type: rand() < 0.55 ? 'Incidente' : 'Solicitud',
        techId: tech.id,
        createdAt: created.toISOString(),
      })
    }
  }
  return { technicians, shifts, tickets }
}

function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as State
      if (Array.isArray(parsed.technicians) && Array.isArray(parsed.tickets)) return parsed
    }
  } catch {
    /* datos corruptos: se regenera */
  }
  return seedState()
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TECH': {
      const name = action.name.trim()
      if (!name) return state
      const tech: Technician = { id: uid(), name, active: true, createdAt: new Date().toISOString() }
      return { ...state, technicians: [...state.technicians, tech] }
    }
    case 'TOGGLE_TECH':
      return {
        ...state,
        technicians: state.technicians.map((t) =>
          t.id === action.id ? { ...t, active: !t.active } : t,
        ),
      }
    case 'SET_SHIFT': {
      const exists = state.shifts.some((s) => s.techId === action.techId && s.date === action.date)
      const shifts = exists
        ? state.shifts.map((s) =>
            s.techId === action.techId && s.date === action.date ? { ...s, status: action.status } : s,
          )
        : [...state.shifts, { techId: action.techId, date: action.date, status: action.status }]
      return { ...state, shifts }
    }
    case 'ADD_TICKET': {
      const ticket: Ticket = {
        id: uid(),
        number: action.number.trim(),
        type: action.ticketType,
        techId: action.techId,
        createdAt: new Date().toISOString(),
      }
      return { ...state, tickets: [...state.tickets, ticket] }
    }
    case 'RESET_DEMO':
      return seedState()
    default:
      return state
  }
}

interface StoreValue extends State {
  addTechnician: (name: string) => void
  toggleTechnician: (id: string) => void
  setShift: (techId: string, date: string, status: ShiftStatus) => void
  addTicket: (number: string, ticketType: TicketType, techId: string) => void
  resetDemo: () => void
  /** Técnicos activos que hoy tienen turno laboral (mañana o tarde). */
  workingToday: Technician[]
  shiftOf: (techId: string, date?: string) => ShiftStatus
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* almacenamiento no disponible */
    }
  }, [state])

  const value = useMemo<StoreValue>(() => {
    const today = todayKey()
    const shiftOf = (techId: string, date: string = today): ShiftStatus =>
      state.shifts.find((s) => s.techId === techId && s.date === date)?.status ?? 'unassigned'
    const workingToday = state.technicians.filter((t) => {
      if (!t.active) return false
      const s = shiftOf(t.id)
      return s === 'morning' || s === 'afternoon'
    })
    return {
      ...state,
      addTechnician: (name) => dispatch({ type: 'ADD_TECH', name }),
      toggleTechnician: (id) => dispatch({ type: 'TOGGLE_TECH', id }),
      setShift: (techId, date, status) => dispatch({ type: 'SET_SHIFT', techId, date, status }),
      addTicket: (number, ticketType, techId) => dispatch({ type: 'ADD_TICKET', number, ticketType, techId }),
      resetDemo: () => dispatch({ type: 'RESET_DEMO' }),
      workingToday,
      shiftOf,
    }
  }, [state])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider')
  return ctx
}
