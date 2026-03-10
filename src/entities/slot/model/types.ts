export interface Slot {
  ID: number;
  TutorID: number;
  SubjectID: number;
  ClassGroupID: number;
  SlotDate: string;
  StartTime: string;
  EndTime: string;
  IsAvailable: boolean;
  CreatedAt: string;
}

export interface SlotFilters {
  date?: string;
  group_id?: number;
  available?: boolean;
  page: number;
  limit: number;
}
