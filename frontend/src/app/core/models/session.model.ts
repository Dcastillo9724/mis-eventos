export interface Session {
  id: string;
  title: string;
  description: string | null;
  speaker_name: string | null;
  start_time: string;
  end_time: string;
  capacity: number | null;
  registered_count: number;
  event_id: string;
  created_at: string;
}

export interface SessionCreate {
  title: string;
  description?: string;
  speaker_name?: string;
  start_time: string;
  end_time: string;
  capacity?: number;
  event_id: string;
}

export interface SessionUpdate {
  title?: string;
  description?: string;
  speaker_name?: string;
  start_time?: string;
  end_time?: string;
  capacity?: number;
}