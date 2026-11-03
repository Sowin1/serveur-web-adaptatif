export interface DormantServiceConfig {
  serviceName: string;
  lastAccessTime: number; // Timestamp en millisecondes
  inactivityThresholdMinutes: number; // Durée limite avant mise en veille 
  status: 'active' | 'sleeping';
}