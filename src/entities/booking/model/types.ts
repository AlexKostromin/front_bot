export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: number;
  user_id: number;
  user_name: string;
  user_phone: string;
  slot_id: number;
  slot_date: string;
  start_time: string;
  end_time: string;
  subject_name: string;
  status: BookingStatus;
  booked_at: string;
}
