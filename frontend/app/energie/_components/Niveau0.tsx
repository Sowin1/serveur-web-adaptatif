import { Service, Shutdown } from '../_lib/types';

const STATE_LABEL = {
  online: ['Connecté', 'text-green-400'],
  stopping: ['Arrêt en cours...', 'text-red-400'],
  stopped: ['Arrêté', 'text-red-400'],
};

export default function Niveau0({
  services,
  phase,
}: {
  services: Service[];
  phase: Shutdown;
}) {
  return (
    <section>
      <h2 className="text-lg font-bold">Arrêt propre du systême</h2>
      <p className="text-sm text-slate-400">
        Les services sont arrêtés un par un, du moins prioritaire au plus, puis
        l'état est sauvegardé
      </p>

      <div className="divide-y divide-slate-700">
        {services.map((s) => {
          const [label, color] = STATE_LABEL[s.status];
          return (
            <div key={s.name} className="flex justify-between py-2">
              <span>
                {s.name}
                <span className="ml-2 rounded-full bg-slate-400 px-2 text-xs">
                  P{s.priority}
                </span>
              </span>
              <span className={color}>{label}</span>
            </div>
          );
        })}
      </div>
      {phase == 'saving' && (
        <p className="text-red-400">Sauvegarde de l'état en cours...</p>
      )}
      {phase == 'done' && (
        <p className="text-red-400 font-bold">Système arrêté proprement</p>
      )}
    </section>
  );
}
