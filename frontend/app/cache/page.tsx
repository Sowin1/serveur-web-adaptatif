//  app/cache/page-cache.tsx

import BatterieInfo from "@/component/BattInfo";
import ContenuCache from "@/component/Contenu";
import StatisticCache from "@/component/StatsCache";

export default function Cache(){
    return <main className="flex flex-col gap-4">
        <BatterieInfo />
        <StatisticCache />
        <ContenuCache />
    </main>;
}