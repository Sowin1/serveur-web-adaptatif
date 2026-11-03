'use client';

import { useState } from 'react';

interface TimeSlot {
  start: string;
  end: string;
  daysOfWeek?: number[];
}

const DAYS = [
  { label: 'Dim', value: 0 },
  { label: 'Lun', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Mer', value: 3 },
  { label: 'Jeu', value: 4 },
  { label: 'Ven', value: 5 },
  { label: 'Sam', value: 6 },
];

export default function TimeSlotConfig() {
  const [slots, setSlots] = useState<TimeSlot[]>([
    { start: '08:00', end: '19:00', daysOfWeek: [1, 2, 3, 4, 5] }
  ]);

  const handleAddSlot = () => {
    setSlots([...slots, { start: '09:00', end: '17:00', daysOfWeek: [1, 2, 3, 4, 5] }]);
  };

  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof TimeSlot, value: any) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  const handleDayToggle = (index: number, dayValue: number) => {
    const slot = slots[index];
    const currentDays = slot.daysOfWeek || [];
    const updatedDays = currentDays.includes(dayValue)
      ? currentDays.filter(d => d !== dayValue)
      : [...currentDays, dayValue].sort();
    
    handleChange(index, 'daysOfWeek', updatedDays);
  };

  const handleSave = async () => {
    try {
      // A remplacer
      const response = await fetch('http://localhost:3000/battery/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots }),
      });
      if (response.ok) {
        alert('Plages horaires enregistrées avec succès !');
      } else {
        alert('Erreur lors de la sauvegarde.');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Gestion des plages horaires d'activité</h2>
      
      {slots.map((slot, index) => (
        <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600">Début</label>
              <input 
                type="time" 
                value={slot.start} 
                onChange={(e) => handleChange(index, 'start', e.target.value)}
                className="border p-1 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600">Fin</label>
              <input 
                type="time" 
                value={slot.end} 
                onChange={(e) => handleChange(index, 'end', e.target.value)}
                className="border p-1 rounded text-sm"
              />
            </div>
            <button 
              onClick={() => handleRemoveSlot(index)}
              className="ml-auto text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Supprimer
            </button>
          </div>

          <div>
            <span className="block text-xs font-semibold text-gray-600 mb-1">Jours actifs</span>
            <div className="flex gap-2">
              {DAYS.map(day => {
                const isSelected = slot.daysOfWeek?.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(index, day.value)}
                    className={`px-2 py-1 text-xs rounded font-medium border ${
                      isSelected 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handleAddSlot}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded text-sm font-medium hover:bg-gray-300"
        >
          + Ajouter une plage
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