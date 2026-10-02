import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class BatteryService {
  private readonly baseUrl: string;
  private token: string | null = null;
  private tokenExpiration: number | null = null;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.get<string>('ENODE_URL')!;
  }

  /**
   * Function that verify if the token has expired
   * @private
   */
  private async verifyToken(): Promise<void> {
    const time: number = Date.now();
    if (
      this.token === null ||
      this.tokenExpiration === null ||
      this.tokenExpiration + 3500 * 1000 <= time
    ) {
      await this.getEnodeToken();
    }
  }

  /**
   * Set a new token for ENODE api
   * @private
   */
  private async getEnodeToken(): Promise<void> {
    const enode_secret: string | undefined = this.configService.get<string>(
      'ENODE_CLIENT_SECRET',
    );
    const enode_token_url: string | undefined =
      this.configService.get<string>('ENODE_TOKEN_URL');
    const enode_client_id: string | undefined =
      this.configService.get<string>('ENODE_CLIENT_ID');

    if (!enode_secret) {
      throw new Error('Missing enode_secret');
    }
    if (!enode_token_url) {
      throw new Error('Missing enode_token_url');
    }
    if (!enode_client_id) {
      throw new Error('Missing enode_client_id');
    }

    try {
      const credentials: string = Buffer.from(
        `${enode_client_id}:${enode_secret}`,
      ).toString('base64');
      const res = await firstValueFrom(
        this.httpService.post(
          enode_token_url,
          'grant_type=client_credentials',
          {
            headers: {
              Authorization: `Basic ${credentials}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );
      this.tokenExpiration = Date.now();
      this.token = res.data.access_token;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   * Return the list id of available battery
   */
  async getBatteryList(): Promise<any> {
    try {
      await this.verifyToken();
      const res = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/batteries`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }),
      );
      const batterySummaries = res.data.data.map((battery: any) => ({
        id: battery.id,
        brand: battery.information.brand,
        model: battery.information.model,
        batteryCapacity: battery.chargeState.batteryCapacity,
      }));
      return batterySummaries;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Private method to retrieve all battery information in JSON format (from enode)
   * @param idBattery the id of the desired battery
   */
  async getBatteryInformation(idBattery: string): Promise<any> {
    try {
      await this.verifyToken();
      const res: AxiosResponse<any, any, {}, any> = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/batteries/${idBattery}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        }),
      );

      return res.data;
    } catch (error: any) {
      console.error('URL:', `${this.baseUrl}/batteries/${idBattery}`);
      console.error('STATUS:', error.response?.status);
      console.error('DATA:', error.response?.data);
      console.error('MESSAGE:', error.message);

      throw error;
    }
  }

  /**
   * Return the percentage of the specified battery
   * @param idBattery the id of desired battery
   */
  async getBatteryPercentage(idBattery: string): Promise<number> {
    const batteryData = await this.getBatteryInformation(idBattery);
    if (!batteryData) {
      throw new ServiceUnavailableException(
        'Cannot retrieve battery information',
      );
    }
    return batteryData.chargeState.batteryLevel;
  }

  /**
   * Return the state "CHARGING"/"DISCHARGING" of the battery
   * @param idBattery the id of desired battery
   */
  async getBatteryState(idBattery: string): Promise<string> {
    const batteryData = await this.getBatteryInformation(idBattery);
    if (!batteryData) {
      throw new ServiceUnavailableException(
        'Cannot retrieve battery information',
      );
    }
    return batteryData.chargeState.status;
  }

  async changeBatteryState(idBattery: string, state: number): Promise<boolean> {
    let newState: string | null = null;
    switch (state) {
      case 0:
        newState = 'CHARGING';
        break;
      case 1:
        newState = 'DISCHARGING';
        break;
      case 2:
        newState = 'IDLE';
        break;
      case 3:
        newState = 'FAULT';
        break;
      case 4:
        newState = 'UNKNOWN';
        break;
      default:
        throw new BadRequestException('State must be between 0 and 4');
    }

    try {
      await this.verifyToken();
      await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/batteries/${idBattery}`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          data: { operationMode: newState },
        }),
      );
      return (await this.getBatteryState(idBattery)) === newState;
    } catch (e) {
      throw e;
    }
  }
}
