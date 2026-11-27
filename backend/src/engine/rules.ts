export type Level = 0 | 1 | 2 | 3 | 4;

export type Action =
  | 'serveCache'
  | 'generateRequest'
  | 'regenerate'
  | 'preGenerate'
  | 'compressionMax'
  | 'offline'
  | 'stop';

// The only place where the rules are written.
// 'yes'            : always allowed
// 'no'             : never allowed
// 'priority'       : allowed for priority pages only
// 'dropedLvlBatt'  : allowed only if a battery drop is expected
const RULES = {
  0: {
    serveCache: 'no',
    generateRequest: 'no',
    regenerate: 'no',
    preGenerate: 'no',
    compressionMax: 'no',
    offline: 'no',
    stop: 'yes',
  },
  1: {
    serveCache: 'yes',
    generateRequest: 'no',
    regenerate: 'no',
    preGenerate: 'no',
    compressionMax: 'no',
    offline: 'no',
    stop: 'no',
  },
  2: {
    serveCache: 'yes',
    generateRequest: 'priority',
    regenerate: 'no',
    preGenerate: 'no',
    compressionMax: 'no',
    offline: 'no',
    stop: 'no',
  },
  3: {
    serveCache: 'yes',
    generateRequest: 'yes',
    regenerate: 'yes',
    preGenerate: 'dropedLvlBatt',
    compressionMax: 'no',
    offline: 'no',
    stop: 'no',
  },
  4: {
    serveCache: 'yes',
    generateRequest: 'yes',
    regenerate: 'yes',
    preGenerate: 'yes',
    compressionMax: 'yes',
    offline: 'yes',
    stop: 'no',
  },
};

// Is this action allowed at this level?
export function isAllowed(
  level: Level,
  action: Action,
  context: { dropedLvlBatt?: boolean; priority?: boolean } = {},
): boolean {
  const permission = RULES[level][action];
  if (permission === 'yes') return true;
  if (permission === 'dropedLvlBatt') return context.dropedLvlBatt === true;
  if (permission === 'priority') return context.priority === true;
  return false;
}
