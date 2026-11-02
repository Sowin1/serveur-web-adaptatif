export type Level = 0 | 1 | 2 | 3 | 4;
export type ServiceStatus = 'online' | 'stopping' | 'stopped';
export type Service = {
  name: string;
  priority: 1 | 2 | 3 | 4;
  status: ServiceStatus;
};
export type Shutdown = 'stopping' | 'saving' | 'done';
