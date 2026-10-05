import type { Site } from './sites.types.js';

export const SITES: Site[] = [
  {
    id: 'portail',
    name: 'Home Portal',
    active: true,
    services: [
      { id: 'accueil', name: 'Home', route: '/', active: true },
      {
        id: 'energie',
        name: 'Energy Status',
        route: '/api/energie',
        active: true,
      },
      {
        id: 'urgence',
        name: 'Emergency Information',
        route: '/urgence',
        active: true,
      },
      {
        id: 'galerie',
        name: 'Photo Gallery',
        route: '/galerie',
        active: false,
      },
    ],
    features: [
      { id: 'images', name: 'Images', enabled: true },
      { id: 'images-hd', name: 'High Definition Images', enabled: false },
      { id: 'videos', name: 'Videos', enabled: false },
      { id: 'recherche', name: 'Search', enabled: true },
    ],
  },
  {
    id: 'blog',
    name: 'Associative Blog',
    active: true,
    services: [
      { id: 'articles', name: 'Articles', route: '/articles', active: true },
      {
        id: 'commentaires',
        name: 'Commentaires',
        route: '/api/commentaires',
        active: true,
      },
    ],
    features: [
      { id: 'images', name: 'Images', enabled: false },
      { id: 'videos', name: 'Videos', enabled: false },
      { id: 'traitements', name: 'Heavy Processing', enabled: false },
    ],
  },
  {
    id: 'carto',
    name: 'Cartography',
    active: false,
    services: [
      { id: 'carte', name: 'Interactive Map', route: '/carte', active: false },
    ],
    features: [{ id: 'itineraire', name: 'Route Calculation', enabled: false }],
  },
];
