import type { SiteDefinition } from './sites.types.js';

export const SITE_DEFINITIONS = Symbol('SITE_DEFINITIONS');

export const SITES: SiteDefinition[] = [
  {
    id: 'portail',
    name: 'Home Portal',
    services: [
      {
        id: 'accueil',
        name: 'Home',
        route: '/',
        status: 'active',
        priority: true,
        neverAutoStop: true,
        minLevel: 1,
      },
      {
        id: 'energie',
        name: 'Energy Status',
        route: '/api/energie',
        status: 'active',
        priority: true,
        neverAutoStop: true,
        minLevel: 1,
      },
      {
        id: 'urgence',
        name: 'Emergency Information',
        route: '/urgence',
        status: 'active',
        priority: true,
        neverAutoStop: true,
        minLevel: 1,
      },
      {
        id: 'galerie',
        name: 'Photo Gallery',
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
        name: 'High Definition Images',
        enabled: false,
        minLevel: 3,
      },
      { id: 'videos', name: 'Videos', enabled: false, minLevel: 3 },
      { id: 'recherche', name: 'Search', enabled: true, minLevel: 2 },
    ],
  },
  {
    id: 'blog',
    name: 'Community Blog',
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
        name: 'Comments',
        route: '/api/commentaires',
        status: 'active',
        priority: false,
        neverAutoStop: false,
        minLevel: 2,
      },
    ],
    features: [
      { id: 'images', name: 'Images', enabled: false, minLevel: 3 },
      { id: 'videos', name: 'Videos', enabled: false, minLevel: 3 },
      {
        id: 'traitements',
        name: 'Heavy Processing',
        enabled: false,
        minLevel: 3,
      },
    ],
  },
  {
    id: 'carto',
    name: 'Cartography',
    services: [
      {
        id: 'carte',
        name: 'Interactive Map',
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
        name: 'Route Calculation',
        enabled: false,
        minLevel: 3,
      },
    ],
  },
];
