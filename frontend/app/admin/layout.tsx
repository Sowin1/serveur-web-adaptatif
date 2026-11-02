"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Verify if the user is login
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/admin", {
          credentials: "include",
        });

        if (!response.ok) {
          router.replace("/login");
        }
      } catch (error) {
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  // Logout
  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    router.push("/login");
  };

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b px-4">

          <div className="flex items-center">
            <SidebarTrigger />
            <h1 className="ml-4 font-semibold">
              Administration
            </h1>
          </div>

          <Button
            variant="destructive"
            onClick={handleLogout}
          >
            Se déconnecter
          </Button>

        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}