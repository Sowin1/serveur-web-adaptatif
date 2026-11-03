import { Injectable } from '@nestjs/common';
import { CalendarPeriod } from '../types/calendar-period.js';

@Injectable()
export class CalendarPeriodService {
  private periods: CalendarPeriod[] = [
    {
      name: "Mode Hiver / Économie renforcée",
      startDate: "2026-12-01",
      endDate: "2027-02-28",
      modeOverride: 2
    }
  ];

  getPeriods(): CalendarPeriod[] {
    return this.periods;
  }

  updatePeriods(newPeriods: CalendarPeriod[]): void {
    this.periods = newPeriods;
  }

  getActivePeriodOverride(): number | null {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    const activePeriod = this.periods.find(period => {
      return today >= period.startDate && today <= period.endDate;
    });

    return activePeriod ? activePeriod.modeOverride : null;
  }
}