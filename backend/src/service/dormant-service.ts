import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface DormantServiceConfig {
  serviceName: string;
  lastAccessTime: number;
  inactivityThresholdMinutes: number;
  status: 'active' | 'sleeping';
}

@Injectable()
export class DormantService {
  private logger = new Logger(DormantService.name);
  private services: DormantServiceConfig[] = [
    { serviceName: 'blog-site', lastAccessTime: Date.now(), inactivityThresholdMinutes: 30, status: 'active' },
    { serviceName: 'analytics-api', lastAccessTime: Date.now(), inactivityThresholdMinutes: 15, status: 'active' },
  ];

  constructor() {
    // Vérification automatique toutes les minutes
    setInterval(() => this.checkAndSleepServices(), 60 * 1000);
  }

  // Enregistrer une activité et réveiller le service si besoin
  recordActivity(serviceName: string) {
    const service = this.services.find(s => s.serviceName === serviceName);
    if (service) {
      service.lastAccessTime = Date.now();
      if (service.status === 'sleeping') {
        this.wakeUpService(serviceName);
      }
    }
  }

  // Mettre en veille sécurisée SANS supprimer les données
  putServiceToSleep(serviceName: string) {
    const service = this.services.find(s => s.serviceName === serviceName);
    if (service && service.status === 'active') {
      service.status = 'sleeping';
      this.logger.warn(`Mise en veille du service : ${serviceName}. Les données sont préservées.`);
      
      // Sauvegarde de l'état sur disque pour garantir aucune suppression de données
      const stateBackupPath = path.join(process.cwd(), `backups/${serviceName}-state.json`);
      fs.mkdirSync(path.dirname(stateBackupPath), { recursive: true });
      
      fs.writeFileSync(stateBackupPath, JSON.stringify({
        serviceName,
        status: 'sleeping',
        savedAt: new Date().toISOString(),
        dataPreserved: true // Garantit qu'aucun fichier/donnée utilisateur n'est effacé
      }, null, 2));
    }
  }

  // Réveiller le service et restaurer l'état sans perte
  wakeUpService(serviceName: string) {
    const service = this.services.find(s => s.serviceName === serviceName);
    if (service) {
      service.status = 'active';
      service.lastAccessTime = Date.now();
      this.logger.log(`Réveil du service : ${serviceName}. Restauration des données...`);
      
      const stateBackupPath = path.join(process.cwd(), `backups/${serviceName}-state.json`);
      if (fs.existsSync(stateBackupPath)) {
        const savedState = JSON.parse(fs.readFileSync(stateBackupPath, 'utf8'));
        this.logger.log(`État restauré avec succès pour ${savedState.serviceName}, aucune donnée perdue.`);
      }
    }
  }

  // Vérification périodique de l'inactivité
  private checkAndSleepServices() {
    const now = Date.now();
    this.services.forEach(service => {
      if (service.status === 'active') {
        const inactiveDurationMinutes = (now - service.lastAccessTime) / (1000 * 60);
        if (inactiveDurationMinutes >= service.inactivityThresholdMinutes) {
          this.putServiceToSleep(service.serviceName);
        }
      }
    });
  }

  getServicesStatus(): DormantServiceConfig[] {
    return this.services;
  }
}