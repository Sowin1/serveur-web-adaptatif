'import client';

import { useState } from 'react';

interface CalendarPeriod {
  name: string;
  startDate: string;
  endDate: string;
  modeOverride: number;
}

export default function CalendarPeriodConfig() {
  const [periods, setPeriods] = useState<CalendarPeriod[]>([
    { name: 'Vacances d’été', startDate: '2026-07-01', endDate: '2026-08-31', modeOverride: 2 }
  ]);

  const handleAdd = () => {
    setPeriods([...periods, { name: 'Nouvelle période', startDate: '', endDate: '', modeOverride: 1 }]);
  };

  const handleRemove = (index: number) => {
    setPeriods(periods.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof CalendarPeriod, value: any) => {
    const updated = [...periods];
    updated[index] = { ...updated[index], [field]: value };
    setPeriods(updated);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:3000/battery/calendar-periods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periods }),
      });
      if (response.ok) {
        alert('Périodes calendaires enregistrées avec succès !');
      } else {
        alert('Erreur lors de la sauvegarde.');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Gestion des périodes calendaires</h2>
      
      {periods.map((period, index) => (
        <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50 flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600">Nom de la période</label>
            <input 
              type="text" 
              value={period.name} 
              onChange={(e) => handleChange(index, 'name', e.target.value)}
              className="border p-1 rounded text-sm w-full"
            />
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600">Du</label>
              <input 
                type="date" 
                value={period.startDate} 
                onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                className="border p-1 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600">Au</label>
              <input 
                type="date" 
                value={period.endDate} 
                onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                className="border p-1 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600">Mode forcé (0-3)</label>
              <input 
                type="number" 
                min="0" 
                max="3" 
                value={period.modeOverride} 
                onChange={(e) => handleChange(index, 'modeOverride', Number(e.target.value))}
                className="border p-1 rounded text-sm w-20"
              />
            </div>
          </div>
          <button 
            onClick={() => handleRemove(index)}
            className="text-red-500 hover:text-red-700 text-sm font-medium self-end"
          >
            Supprimer
          </button>
        </div>
      ))}

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded text-sm font-medium hover:bg-gray-300"
        >
          + Ajouter une période
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
}