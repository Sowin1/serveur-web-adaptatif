import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import cookie from '@fastify/cookie';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module.js';
import { setupAuthSwagger } from './swagger/auth.swagger.js';
import { setupBatterySwagger } from './swagger/battery.swagger.js';
import { setupSiteStatusSwagger } from './swagger/sites-status.swagger.js';
import { setupHealthSwagger } from './swagger/health.swagger.js';

interface ServerConfig {
  allowAutoRestart: boolean;
  maxRestartAttempts: number;
  maxErrorsPerMinute: number;
  currentMode: number;
}

// Function to read the configuration
function getServerConfig(): ServerConfig {
  const defaultConfig: ServerConfig = {
    allowAutoRestart: false,
    maxRestartAttempts: 3,
    maxErrorsPerMinute: 10,
    currentMode: 3,
  };

  try {
    const configPath = path.join(process.cwd(), 'server-config.json');
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return { ...defaultConfig, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error(' Impossible de lire la configuration :', e);
  }
  return defaultConfig;
}

// --- DETECTION OF ABNORMAL ERRORS ---
function trackAndDetectError(): void {
  const errorTrackerPath = path.join(process.cwd(), 'error-tracker.json');
  const now = Date.now();
  let errors: number[] = [];
  const config = getServerConfig();

  try {
    if (fs.existsSync(errorTrackerPath)) {
      const data = fs.readFileSync(errorTrackerPath, 'utf8');
      errors = JSON.parse(data);
    }
  } catch {
    errors = [];
  }

  // Add the current error
  errors.push(now);

  // Keep only the errors that occurred within the last 60 seconds
  const oneMinuteAgo = now - 60000;
  errors = errors.filter((timestamp) => timestamp > oneMinuteAgo);

  // Saves the error history
  try {
    fs.writeFileSync(errorTrackerPath, JSON.stringify(errors));
  } catch (e) {
    console.error(' Impossible d’écrire le fichier de suivi des erreurs :', e);
  }

  // If the number of errors exceeds the configured threshold -> ANOMALY DETECTED
  if (errors.length >= config.maxErrorsPerMinute) {
    console.error(
      ` [ALERTE ANOMALIE] Génération anormale d'erreurs détectée ! (${errors.length} erreurs en moins d'une minute).`,
    );
  }
}

// --- VERIFICATION OF ATTEMPTS AND RESTART LOOPS ---
function checkBootLoop(): boolean {
  const trackerPath = path.join(process.cwd(), 'restart-tracker.json');
  const now = Date.now();
  let history: number[] = [];
  const config = getServerConfig();

  try {
    if (fs.existsSync(trackerPath)) {
      const data = fs.readFileSync(trackerPath, 'utf8');
      history = JSON.parse(data);
    }
  } catch {
    history = [];
  }

  history.push(now);
  const oneMinuteAgo = now - 60000;
  history = history.filter((timestamp) => timestamp > oneMinuteAgo);

  try {
    fs.writeFileSync(trackerPath, JSON.stringify(history));
  } catch (e) {
    console.error(
      ' Impossible d’écrire le fichier de suivi des redémarrages :',
      e,
    );
  }

  if (history.length > config.maxRestartAttempts) {
    console.error(
      ` [ALERTE CRITIQUE] Limite de ${config.maxRestartAttempts} tentatives de redémarrage dépassée !`,
    );
    return false;
  }

  return true;
}

async function bootstrap() {
  const config = getServerConfig();

  // 1. Checking for restart loops at launch
  const canRestart = checkBootLoop();

  // 2. Global handling of uncaught errors and logging of the anomaly
  process.on('unhandledRejection', (reason, promise) => {
    console.error(
      ' [CRASH ÉVITÉ/ALERTE] Unhandled Rejection at:',
      promise,
      'reason:',
      reason,
    );
    trackAndDetectError();
  });

  process.on('uncaughtException', (error) => {
    console.error(' [CRASH FATAL] Uncaught Exception thrown:', error);
    trackAndDetectError();

    if (config.allowAutoRestart && canRestart) {
      console.log(
        ' Redémarrage automatique AUTORISÉ (dans la limite des tentatives).',
      );
      process.exit(1);
    } else {
      console.log(
        ' Redémarrage automatique BLOQUÉ (limite atteinte ou non autorisé). Arrêt définitif.',
      );
      process.exit(0);
    }
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.setGlobalPrefix('innovant');
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
    ],
    credentials: true,
  });

  await app.register(cookie);

  setupAuthSwagger(app);
  setupBatterySwagger(app);
  setupSiteStatusSwagger(app);
  setupHealthSwagger(app);

  await app.listen({
    port: Number(process.env.PORT ?? 3000),
    host: '127.0.0.1',
  });

  console.log(
    ` Le serveur tourne sur http://127.0.0.1:${process.env.PORT ?? 3000}/innovant`,
  );
}

bootstrap();
