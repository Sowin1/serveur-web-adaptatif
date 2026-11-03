import { Injectable, Logger } from '@nestjs/common';
import { ManualOverrideConfig } from '../types/manual-override.js';

@Injectable()
export class ManualOverrideService {
  private logger = new Logger(ManualOverrideService.name);
  private overrideState: ManualOverrideConfig = {
    isOverridden: false,
    forcedMode: null,
    expiresAt: null,
    reason: '',
  };

  // Activer le mode exceptionnel
  setOverride(isOverridden: boolean, forcedMode: number, durationMinutes: number, reason: string) {
    const expiresAt = durationMinutes > 0 ? Date.now() + durationMinutes * 60 * 1000 : null;
    this.overrideState = {
      isOverridden,
      forcedMode,
      expiresAt,
      reason,
    };
    this.logger.warn(`Activation manuelle exceptionnelle déclenchée ! Mode forcé : ${forcedMode} (Raison : ${reason})`);
  }

  // Récupérer l'état actuel (avec vérification automatique de l'expiration)
  getOverrideStatus(): ManualOverrideConfig {
    if (this.overrideState.isOverridden && this.overrideState.expiresAt) {
      if (Date.now() > this.overrideState.expiresAt) {
        this.logger.log("L'activation exceptionnelle a expirée. Retour au mode automatique.");
        this.resetOverride();
      }
    }
    return this.overrideState;
  }

  resetOverride() {
    this.overrideState = {
      isOverridden: false,
      forcedMode: null,
      expiresAt: null,
      reason: '',
    };
  }
}