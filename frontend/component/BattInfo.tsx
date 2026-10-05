function getPalier(niv: number): 0 | 1 | 2 | 3 | 4 {
    if (niv < 10) return 0;
    if (niv < 30) return 1;
    if (niv < 50) return 2;
    if (niv < 80) return 3;
    return 4;
}

const niv_bat = 89;

const PALIERS = [0, 1, 2, 3, 4] as const;

function getInfoBat(palier: 0 | 1 | 2 | 3 | 4) {
    switch (palier) {
        case 0:
            return { nom: "Arrêt", couleur: "bg-red-500", description: "Le serveur est down", hex: "#EF4444"
            }
        case 1:
            return { nom: "Survie", couleur: "bg-orange-500", description: "...." , hex: "#F97316"}
        case 2:
            return { nom: "Economie", couleur: "bg-yellow-500", description: "....B", hex: "#EAB308"}
        case 3:
            return { nom: "Normal", couleur: "bg-sky-500", description: "Energie normal chargement des pages disponible en cours", hex: "#0EA5E9" }
        case 4:
            return { nom: "Abondante", couleur: "bg-green-500", description: "Energie abondante chargement des pages disponible en cours", hex: "#22C55E" }
    }
}

export default function BatterieInfo() {
    const palier = getPalier(niv_bat);
    const current_bat = getInfoBat(palier);

    return (
        <section className="rounded-xl p-5">
            <h1 className="text-center mb-20 mt-15 text-5xl font-bold">BIENVENUE DANS LE CACHE</h1>
            <div className="flex flex-lig gap-4">
                <div className="flex-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900"></div>
                <div className="grid grid-cols-5 gap-2 text-center text-s" > {
                    PALIERS.map((p =>
                        <div key={p} className={`rounded-lg p-2 ${p === palier ? `${current_bat.couleur} text-white` : `bg-gray-200 text-gray-500`}`}>
                            <span className="block text-base font-bold">{p}</span>
                            {getInfoBat(p).nom}
                        </div>
                    ))
                }
                </div>
                <div className="flex h-15 w-15 shrink-0 items-center justify-center rounded-full"
                    style={{
                        background: `conic-gradient(${current_bat.hex} ${niv_bat}%, #e5e7eb 0)`,
                    }}> <div className="flex h-10 w-10 flex-col items-center justify-center rounded-full bg-white">
                        <span className="text-s font-bold">{niv_bat}%</span>
                    </div></div>
            </div>
        </section>
    );
}