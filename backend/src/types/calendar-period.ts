export interface CalendarPeriod {
  id?: string;
  name: string; // Ex: "Vacances d'été", "Fermeture annuelle"
  startDate: string; // Format "YYYY-MM-DD"
  endDate: string; // Format "YYYY-MM-DD"
  modeOverride: number; // Mode forcé pendant cette période (ex: 0 pour Arrêt, 2 pour Économie)
}
