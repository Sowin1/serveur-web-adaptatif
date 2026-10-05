export default function BatterieInfo() {
    return (
        <section className="rounded-xl border border-gray-200 p-5">
            <h1>BIENVENUE DANS LE CACHE</h1>
            <div className="flex flex-lig gap-4">
                <div className="flex-4 rounded-xl border border-gray-200 p-5">WARNING TRIGGER BATTERY</div>
                <div className="flex-1 rounded-xl border border-gray-200 p-5 justify-end">BATTERY STATE</div>
                <div className="flex-1 rounded-xl border border-gray-200 p-5 justify-end">BATTERY LEVEL</div>
            </div>
        </section>
    );
}