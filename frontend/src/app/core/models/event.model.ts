
import { Session } from './session.model';

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_date: string;
  end_date: string;
  capacity: number;
  registered_count: number;
  status: EventStatus;
  organizer_id: string;
  created_at: string;
  sessions?: Session[];
}

export interface EventCreate {
  title: string;
  description?: string;
  location?: string;
  start_date: string;
  end_date: string;
  capacity: number;
}

export interface EventUpdate {
  title?: string;
  description?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  capacity?: number;
  status?: EventStatus;
}

export interface EventsByStatus {
  published: Event[];
  draft: Event[];
  cancelled: Event[];
  completed: Event[];
  published_total: number;
  draft_total: number;
  cancelled_total: number;
  completed_total: number;
}