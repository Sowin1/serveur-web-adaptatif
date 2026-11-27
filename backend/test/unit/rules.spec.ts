import { isAllowed, type Action, type Level } from '../../src/engine/rules.js';

type Context = { dropedLvlBatt?: boolean; priority?: boolean };
type Case = [string, Level, Action, Context, boolean];

const cases: Case[] = [
  // Level 0: only the clean stop is allowed
  ['0: stop', 0, 'stop', {}, true],
  ['0: serve cache', 0, 'serveCache', {}, false],
  ['0: generate', 0, 'generateRequest', {}, false],

  // Level 1: read the cache only
  ['1: serve cache', 1, 'serveCache', {}, true],
  ['1: generate', 1, 'generateRequest', {}, false],
  ['1: generate (priority)', 1, 'generateRequest', { priority: true }, false],
  ['1: regenerate', 1, 'regenerate', {}, false],
  ['1: stop', 1, 'stop', {}, false],

  // Level 2: generation only for priority pages
  ['2: serve cache', 2, 'serveCache', {}, true],
  ['2: generate', 2, 'generateRequest', {}, false],
  ['2: generate (priority)', 2, 'generateRequest', { priority: true }, true],
  ['2: regenerate', 2, 'regenerate', {}, false],
  ['2: pre-generate', 2, 'preGenerate', {}, false],

  // Level 3: normal, pre-generation only if a drop is expected
  ['3: generate', 3, 'generateRequest', {}, true],
  ['3: regenerate', 3, 'regenerate', {}, true],
  ['3: pre-generate', 3, 'preGenerate', {}, false],
  ['3: pre-generate (drop)', 3, 'preGenerate', { dropedLvlBatt: true }, true],
  ['3: max compression', 3, 'compressionMax', {}, false],
  ['3: offline', 3, 'offline', {}, false],

  // Level 4: abundant energy
  ['4: pre-generate', 4, 'preGenerate', {}, true],
  ['4: max compression', 4, 'compressionMax', {}, true],
  ['4: offline', 4, 'offline', {}, true],
  ['4: stop', 4, 'stop', {}, false],
];

describe('allowed actions per level', () => {
  it.each(cases)('%s', (_name, level, action, context, expected) => {
    expect(isAllowed(level, action, context)).toBe(expected);
  });
});
