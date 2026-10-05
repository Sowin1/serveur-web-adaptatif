export default function StatisticCache() {
    return (
        <section className="flex gap-4 p-10">
            <div className="flex-1 rounded-xl p-4 bg-gray-200 ml-100 pt-10 pb-10 text-center">
                <p className="text-s text-gray-500">Requête en cache</p>
                <p className="mt-1 text-2xl font-bold">250</p>
            </div>
            <div className="flex-1 rounded-xl p-4 bg-gray-200 pt-10 pb-10 text-center">
                <p className="text-s text-gray-500">Temps moyen</p>
                <p className="mt-1 text-2xl font-bold">40 ms</p>
            </div>
            <div className="flex-1 rounded-xl p-4 bg-gray-200 mr-100 pt-10 pb-10 text-center">
                <p className="text-s text-gray-500">Taux de succès</p>
                <p className="mt-1 text-2xl font-bold">93 %</p>
            </div>
        </section>
    );
}