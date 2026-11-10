
export type HoldStatus =
  | 'HELD'
  | 'CONFIRMED'
  | 'EXPIRED'
  | 'CANCELLED'

export interface CreateHoldResponse {
  holdId: string
  classId: string
  studentId: string
  status: HoldStatus
  expiresAt: string
}

export interface HoldDetails {
  holdId: string
  classId: string
  status: HoldStatus
  expiresAt: string
}

export interface StudentHold {
  holdId: string
  classId: string
  className: string
  status: HoldStatus
  expiresAt: string
}

export interface ConfirmHoldResponse {
  holdId: string
  status: HoldStatus
}
