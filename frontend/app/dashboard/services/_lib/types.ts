export interface Service {
  id: string;
  name: string;
  route: string | null;
  active: boolean;
}

export interface Feature {
  id: string;
  name: string;
  enabled: boolean;
}

export interface Site {
  id: string;
  name: string;
  active: boolean;
  services: Service[];
  features: Feature[];
}
