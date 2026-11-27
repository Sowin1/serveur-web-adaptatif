import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex min-h-16 w-full items-center justify-between bg-purple-300 px-6 text-slate-900 ">
      <h1 className="text-xl font-bold">Serveur Web Adaptatif</h1>
      <ul className="flex items-center gap-6">
        <li>
          <Link href="/cache">Cache</Link>
        </li>
        <li>
          <Link href="/dashboard/services">Services</Link>
        </li>
        <li>
          <Link href="/admin">Admin</Link>
        </li>
      </ul>
    </nav>
  );
}
