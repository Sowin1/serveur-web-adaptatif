import type { SiteDefinition } from './sites.types.js';

export const SITE_DEFINITIONS = Symbol('SITE_DEFINITIONS');

export const SITES: SiteDefinition[] = [
  {
    id: 'portail',
    name: "Portail d'accueil",
    services: [
      {
        id: 'accueil',
        name: 'Accueil',
        route: '/',
        status: 'active',
        priority: true,
        neverAutoStop: true,
        minLevel: 1,
      },
      {
        id: 'energie',
        name: "Status d'Énergie",
        route: '/api/energie',
        status: 'active',
        priority: true,
        neverAutoStop: true,
        minLevel: 1,
      },
      {
        id: 'urgence',
        name: "Information d'Urgence",
        route: '/urgence',
        status: 'active',
        priority: true,
        neverAutoStop: true,
        minLevel: 1,
      },
      {
        id: 'galerie',
        name: 'Galerie Photo',
        route: '/galerie',
        status: 'stopped',
        priority: false,
        neverAutoStop: false,
        minLevel: 3,
      },
    ],
    features: [
      { id: 'images', name: 'Images', enabled: true, minLevel: 3 },
      {
        id: 'images-hd',
        name: 'Images Haute Définition',
        enabled: false,
        minLevel: 3,
      },
      { id: 'videos', name: 'Vidéos', enabled: false, minLevel: 3 },
      { id: 'recherche', name: 'Recherche', enabled: true, minLevel: 2 },
    ],
  },
  {
    id: 'blog',
    name: 'Blog communautaire',
    services: [
      {
        id: 'articles',
        name: 'Articles',
        route: '/articles',
        status: 'active',
        priority: false,
        neverAutoStop: false,
        minLevel: 2,
      },
      {
        id: 'commentaires',
        name: 'Commentaires',
        route: '/api/commentaires',
        status: 'active',
        priority: false,
        neverAutoStop: false,
        minLevel: 2,
      },
    ],
    features: [
      { id: 'images', name: 'Images', enabled: false, minLevel: 3 },
      { id: 'videos', name: 'Vidéos', enabled: false, minLevel: 3 },
      {
        id: 'traitements',
        name: 'Traitement Lourd',
        enabled: false,
        minLevel: 3,
      },
    ],
  },
  {
    id: 'carto',
    name: 'Cartographie',
    services: [
      {
        id: 'carte',
        name: 'Carte Interactive',
        route: '/carte',
        status: 'stopped',
        priority: false,
        neverAutoStop: false,
        minLevel: 3,
      },
    ],
    features: [
      {
        id: 'itineraire',
        name: "Calcul d'Itinéraire",
        enabled: false,
        minLevel: 3,
      },
    ],
  },
];
