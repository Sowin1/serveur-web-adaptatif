type Statut = "frais" | "en_cours" | "a_generer" | "a_regenerer";

const pages: { nom: string; heure: string; statut: Statut }[] = [
  { nom: "/accueil", heure: "16:02", statut: "frais" },
  { nom: "/catalogue", heure: "16:02", statut: "frais" },
  { nom: "/rapport-mensuel.pdf", heure: "15:40", statut: "a_regenerer" },
  { nom: "/profil/utilisateur42", heure: "16:15", statut: "en_cours" },
  { nom: "/menu", heure: "", statut: "a_generer"}
];
export default function ContenuCache(){
    return (
        <section className="rounded-xl p-5 flex gap-3">
            <div className="flex-6 rounded-xl border border-gray-200 p-5">LISTE PAGE
                <table></table>
            </div>
            <div className="flex-1 rounded-xl border border-gray-200 p-5">HOURS
                <table></table>
            </div>
            <div className="flex-2 rounded-xl border border-gray-200 p-5">STATE PAGE
                <table></table>
            </div>
        </section>
    );
}