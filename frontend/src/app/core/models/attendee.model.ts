export type RegistrationStatus = 'active' | 'cancelled';

export interface EventRegistration {
  id: string;
  user_id: string;
  event_id: string;
  status: RegistrationStatus;
  registered_at: string;
}

export interface SessionRegistration {
  id: string;
  user_id: string;
  session_id: string;
  event_id: string;
  status: RegistrationStatus;
  registered_at: string;
}

export interface EventWithSessionRegistrations {
  eventRegistration: EventRegistration;
  sessionRegistrations: SessionRegistration[];
}