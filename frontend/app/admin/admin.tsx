'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, getPercentage, getBatteries, getBattery, getState} from "@/lib/battery-api";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Battery, Cpu, MemoryStick, Zap } from "lucide-react"

export default function Admin() {
  const router = useRouter();

  const [percentage, setPercentage] = useState<number | null>(null);
  const [statut, setStatut] = useState<String | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function updateBattery() {
      try {
        const token = await login("TON_MOT_DE_PASSE");

        const data = await getBattery(
          "ee9dfd86-efc2-4362-8948-6ab381366d54",
          token
        );

        setPercentage(data.chargeState.batteryLevel as number);
        setStatut(data.chargeState.status as String);
      } catch (error) {
        console.error(error);
      }
    }

    updateBattery();

    interval = setInterval(updateBattery, 5000);

    return () => clearInterval(interval);
  }, []);  

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
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Battery />
                Batterie
              </CardTitle>
            <CardDescription> Niveau actuel de la batterie </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{percentage}%</p>
            <Progress value={percentage} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap />
              Statut de la batterie
            </CardTitle>
            <CardDescription> Statut de la batterie (charge/décharge) </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{statut}</p>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}