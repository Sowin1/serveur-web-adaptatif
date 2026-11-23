'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Progress } from "@/components/ui/progress"

import { Battery, Cpu, MemoryStick, Zap } from "lucide-react"

export default function Admin() {
  const router = useRouter();

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold">
          Tableau de bord
        </h2>
        <p className="text-muted-foreground">
          Vue globale de la supervision énergétique.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        {/* Tes quatre cartes ici */}

      </div>

      <Card>
        <CardHeader>
          <CardTitle>État général du système</CardTitle>
          <CardDescription>
            État actuel de la machine.
          </CardDescription>
        </CardHeader>

        <CardContent>
          
        </CardContent>
      </Card>

    </div>
  )
}