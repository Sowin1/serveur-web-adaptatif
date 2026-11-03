'use client';

import { useState } from 'react';

export default function ManualOverrideControl() {
  const [isOverridden, setIsOverridden] = useState(false);
  const [forcedMode, setForcedMode] = useState(3);
  const [duration, setDuration] = useState(60); // en minutes
  const [reason, setReason] = useState('Rattrapage de données');

  const handleToggleOverride = async () => {
    const newState = !isOverridden;
    try {
      const response = await fetch('http://localhost:3000/battery/manual-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isOverridden: newState,
          forcedMode: Number(forcedMode),
          durationMinutes: Number(duration),
          reason,
        }),
      });

      if (response.ok) {
        setIsOverridden(newState);
        alert(newState ? 'Activation exceptionnelle activée !' : 'Mode normal rétabli.');
      } else {
        alert("Erreur lors de la mise à jour de l'override.");
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-6 border-t-4 border-amber-500">
      <h2 className="text-xl font-bold mb-2 text-gray-800">Activation Manuelle Exceptionnelle (Rattrapages)</h2>
      <p className="text-xs text-gray-500 mb-4">
        Permet de contourner les plages horaires et les restrictions d'énergie pour lancer des tâches de maintenance ou des rattrapages urgents.
      </p>

      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600">Mode forcé</label>
          <select 
            disabled={isOverridden}
            value={forcedMode} 
            onChange={(e) => setForcedMode(Number(e.target.value))}
            className="border p-2 rounded text-sm w-full bg-gray-50"
          >
            <option value={3}>Mode 3 - Fonctionnement Normal (Tous services)</option>
            <option value="abondante">Mode Énergie Abondante (Calculs lourds / Cache)</option>
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600">Durée (en minutes)</label>
            <input 
              type="number" 
              disabled={isOverridden}
              value={duration} 
              onChange={(e) => setDuration(Number(e.target.value))}
              className="border p-2 rounded text-sm w-full bg-gray-50"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600">Raison / Motif</label>
            <input 
              type="text" 
              disabled={isOverridden}
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              className="border p-2 rounded text-sm w-full bg-gray-50"
            />
          </div>
        </div>

        <button
          onClick={handleToggleOverride}
          className={`mt-4 px-4 py-2 rounded text-white font-medium text-sm transition-colors ${
            isOverridden 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-amber-600 hover:bg-amber-700'
          }`}
        >
          {isOverridden ? 'Couper l’activation exceptionnelle' : '🚀 Activer la dérogation manuelle'}
        </button>
      </div>
    </div>
  );
}