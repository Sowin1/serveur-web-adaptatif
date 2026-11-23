export interface TimeSlot {
  start: string; // "08:00"
  end: string; // "18:00"
  daysOfWeek?: number[]; // [1, 2, 3, 4, 5] pour Lun-Ven
}

export interface ScheduleConfig {
  enabled: boolean;
  slots: TimeSlot[];
}
