import { Injectable } from '@nestjs/common';
import { TimeSlot } from '../types/schedules.js';

@Injectable()
export class SchedulerService {
  private activeSlots: TimeSlot[] = [
    { start: '08:00', end: '19:00', daysOfWeek: [1, 2, 3, 4, 5] },
  ];

  getSlots(): TimeSlot[] {
    return this.activeSlots;
  }

  updateSlots(newSlots: TimeSlot[]): void {
    this.activeSlots = newSlots;
  }

  isCurrentlyActive(): boolean {
    const now = new Date();
    const currentDay = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return this.activeSlots.some((slot) => {
      if (slot.daysOfWeek && !slot.daysOfWeek.includes(currentDay))
        return false;
      const [sH, sM] = slot.start.split(':').map(Number);
      const [eH, eM] = slot.end.split(':').map(Number);
      const startMin = sH * 60 + sM;
      const endMin = eH * 60 + eM;

      return currentMinutes >= startMin && currentMinutes <= endMin;
    });
  }
}
