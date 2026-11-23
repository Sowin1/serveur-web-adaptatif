export interface ManualOverrideConfig {
  isOverridden: boolean;
  forcedMode: number | null; // Ex: Mode 3 (fonctionnement normal)
  expiresAt: number | null; // Timestamp de fin de l'activation exceptionnelle (pour éviter de l'oublier)
  reason: string; // Ex: "Rattrapage de nuit / Maintenance"
}
