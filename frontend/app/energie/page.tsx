'use client';

import { useState } from 'react';
import Niveau0 from './_components/Niveau0';
import { Service, Shutdown } from './_lib/types';
import Niveau1 from './_components/Niveau1';
import Niveau2 from './_components/Niveau2';

const MOCK: Service[] = [
  { name: 'Sites principal', priority: 1, status: 'online' },
  { name: 'Base de données', priority: 1, status: 'online' },
  { name: 'API clients', priority: 2, status: 'online' },
  { name: 'Blog', priority: 3, status: 'online' },
  { name: 'Galerie photos', priority: 3, status: 'online' },
];

export default function EnergiePage() {
  const [services, setServices] = useState<Service[]>(MOCK);
  const [phase, setPhase] = useState<Shutdown>('stopping');

  //démo niveau 0
  function rejouer() {
    setServices(MOCK);
    setPhase('stopping');
    const ordre = [...MOCK].sort((a, b) => b.priority - a.priority);
    ordre.forEach((svc, i) => {
      setTimeout(
        () => {
          setServices((cur) =>
            cur.map((s) =>
              s.name === svc.name ? { ...s, status: 'stopped' } : s,
            ),
          );
        },
        (i + 1) * 1000,
      );
    });
    setTimeout(() => setPhase('saving'), (ordre.length + 1) * 1000);
    setTimeout(() => setPhase('done'), (ordre.length + 3) * 1000);
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <h1 className="text-xl font-bold">Moteur de décision énergétique</h1>
      <button
        onClick={rejouer}
        className="rounded bg-sky-500 px-3 py-1 text-white"
      >
        Rejouer
      </button>
      <Niveau0 services={services} phase={phase} />
      <Niveau1 services={services} />
      <Niveau2 services={services}/>
    </main>
  );
}
