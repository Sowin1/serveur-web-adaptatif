import { Service } from "../_lib/types";

export default function Niveau1({services}: {services: Service[]}) {
    const preserve = services.filter((s) => s.status === "online");
    const cut = services.filter((s) => s.status !== "online");

    return (
        <section>
            <h2 className="text-lg font-bold">Services indispensable</h2>
            <p className="text-sm text-slate-400">
                Les services indispensable sont conservés, et les autres sont coupés pour économiser de l'énergie
            </p>

            <div className="divide-y divide-slate-700">
                <h3 className="mt-1 mb-1 text-l font-semibold">Services conservés {preserve.length}</h3>
                {preserve.map((s) => (
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
                <h3 className="mt-1 mb-1 text-l font-semibold">Services coupés {cut.length}</h3>
                {cut.map((s) => (
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

    );
}