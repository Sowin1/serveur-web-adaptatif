// frontend/app/page.tsx
import TimeSlotConfig from '@/component/TimeSlotConfig';

export default function Page() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Mon Tableau de Bord</h1>
      <TimeSlotConfig />
    </main>
  );
}
