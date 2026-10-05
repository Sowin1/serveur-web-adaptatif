'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Admin() {
  const router = useRouter();

  // If you log out, redirect yourself to login page
  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch('http://localhost:3000/auth/admin', {
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Handle the logout bouton
  const handleLogout = async () => {
    await fetch('http://localhost:3000/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Administration</h1>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-red-300 px-4 py-2 font-medium text-red-600 transition hover:bg-red-50"
        >
          Se déconnecter
        </button>
      </div>
    </main>
  );
}
