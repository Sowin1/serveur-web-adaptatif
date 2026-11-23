//  app/cache/page-cache.tsx

import BatterieInfo from '@/component/BattInfo';
import ContenuCache from '@/component/Contenu';
import StatisticCache from '@/component/StatsCache';

export default function Cache() {
  return (
    <main>
      <BatterieInfo />
      <StatisticCache />
      <ContenuCache />
    </main>
  );
}
