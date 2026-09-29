import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BatteryService {
  private readonly baseUrl: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.get<string>('ENODE_URL')!;
  }

  async getBatteryInformation(idBattery: string): Promise<any> {
    const token = this.configService.get<string>('ENODE_ACCES_TOKEN')!;
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/batteries/${idBattery}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      return response.data;
    } catch (error: any) {
      console.error('URL:', `${this.baseUrl}/batteries/${idBattery}`);
      console.error('STATUS:', error.response?.status);
      console.error('DATA:', error.response?.data);
      console.error('MESSAGE:', error.message);

      throw error;
    }
  }
}
