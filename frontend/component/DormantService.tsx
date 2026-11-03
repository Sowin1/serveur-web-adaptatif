'use client';

import { useState, useEffect } from 'react';

interface DormantService {
  serviceName: string;
  status: 'active' | 'sleeping';
  inactivityThresholdMinutes: number;
}

export default function DormantServicesList() {
  const [services, setServices] = useState<DormantService[]>([]);

  useEffect(() => {
    // Exemple 
    fetch('http://localhost:3000/battery/dormant-services')
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error('Erreur chargement services dormants', err));
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Gestion des services dormants (Mise en veille)</h2>
      
      <div className="flex flex-col gap-3">
        {services.map((service, index) => (
          <div key={index} className="p-4 border rounded-md bg-gray-50 flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800">{service.serviceName}</p>
              <p className="text-xs text-gray-500">Seuil d'inactivité : {service.inactivityThresholdMinutes} min</p>
            </div>
            <div>
              <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                service.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {service.status === 'active' ? 'Actif' : 'En veille'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}