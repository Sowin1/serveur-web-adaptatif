import { Service } from "../_lib/types";


export default function Niveau2({ services }: { services: Service[] }) {
    const priority = services.filter((s) => s.status === "online");
    const limited = services.filter((s) => s.status === "limited");
    const stopped = services.filter((s) => s.status === "stopped");

    return (
        <section>
            <h2 className="text-lg font-bold">Niveau 2</h2>
            <p className="text-sm text-slate-400">Les services non prioritaire seront limités ou arrêtés directement</p>

            <div className="divide-y divide-slate-700">
                <h3 className="mt-1 mb-1 text-l font-semibold">Services disponibles {priority.length}</h3>
                {priority.map((s) => (
                    <div key={s.name} className="flex justify-between py-2">
                        <span>{s.name}
                            <span className="ml-2 rounded-full bg-slate-400 px-2 text-xs">
                                P{s.priority}
                            </span>
                        </span>
                        <span className="text-green-400">Disponible</span>
                    </div>
                )
                )}
            </div>
            <div className="divide-y divide-slate-700">
                <h3 className="mt-1 mb-1 text-l font-semibold">Services limités {limited.length}</h3>
                {limited.map((s) => (
                    <div key={s.name} className="flex justify-between py-2">
                        <span>{s.name}
                            <span className="ml-2 rounded-full bg-slate-400 px-2 text-xs">
                                P{s.priority}
                            </span>
                        </span>
                        <span className="text-orange-400">Limité</span>
                    </div>
                )
                )}
            </div>
            <div className="divide-y divide-slate-700">
                <h3 className="mt-1 mb-1 text-l font-semibold">Services mise en arrêt {stopped.length}</h3>
                {stopped.map((s) => (
                    <div key={s.name} className="flex justify-between py-2">
                        <span>{s.name}
                            <span className="ml-2 rounded-full bg-slate-400 px-2 text-xs">
                                P{s.priority}
                            </span>
                        </span>
                        <span className="text-red-400">Arrêté</span>
                    </div>
                )
                )}
            </div>
        </section>
    )
}