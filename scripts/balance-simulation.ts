import { cardStats, chooseEvent, endTurn, enterNode, evolve, evolutionOptions, intent, newRun, playCard, rest, reward, useSupply } from '../src/engine';
import type { Form, Run } from '../src/types';

export type Strategy = 'tactical' | 'rush';
export function playTurn(r: Run, strategy: Strategy) {
  if (r.hp <= r.maxHp - 18) useSupply(r);
  let budget = 35;
  while (r.screen === 'battle' && budget-- > 0) {
    const b = r.battle!;
    const incoming = b.enemies.reduce((sum, e, i) => sum + (e.hp > 0 && ['attack', 'drain'].includes(intent(r, i).type) ? intent(r, i).value : 0), 0);
    const options = b.hand.flatMap((id, index) => {
      const c = cardStats(r, id);
      if (c.cost > b.energy) return [];
      return b.enemies.flatMap((enemy, target) => {
        if (enemy.hp <= 0) return [];
        let score = (c.energy || 0) * 12 + (c.draw || 0) * 3;
        if (c.damage) {
          const affected = c.all ? b.enemies.filter(e => e.hp > 0) : [enemy];
          score += affected.reduce((s, e) => s + Math.min(e.hp, Math.max(0, c.damage! - e.block)), 0) * .65;
          for (const e of affected) if (c.damage >= e.hp + e.block) score += 15;
        }
        if (c.heal) score += Math.min(c.heal, r.maxHp - r.hp) * (strategy === 'tactical' ? 1.1 : .4);
        if (strategy === 'tactical') {
          score += Math.min(c.block || 0, Math.max(0, incoming - b.block)) * 1.15;
          if (c.weak && enemy.weak === 0) {
            const a = intent(r, target);
            score += (['attack', 'drain'].includes(a.type) ? a.value * .4 : 3) * 1.3;
          }
          score += Math.min(c.cleanse || 0, r.corruption) * 5;
          score -= (c.self || 0) * .8;
          if (c.self && r.hp <= c.self) score = -100;
        }
        return [{ index, target, score: score / Math.max(1, c.cost) }];
      });
    }).sort((a, b) => b.score - a.score);
    if (!options.length || options[0].score <= 0) break;
    b.target = options[0].target;
    playCard(r, options[0].index);
  }
  if (r.screen === 'battle') endTurn(r);
}

export function simulate(seed: number, form: Form, strategy: Strategy, route: 'standard' | 'alternate' = 'standard') {
  const r = newRun(seed);
  let budget = 400, turns = 0, bossTurns = 0, bossEntryHp = 0;
  const path = route === 'standard'
    ? ['0a','1a','2b','3a','4b',form === 'skull' ? '5b' : '5a',form === 'skull' ? '6b' : '6a','7a','8a','9a','10a']
    : ['0a','1b','2a','3b','4a',form === 'skull' ? '5b' : '5a',form === 'skull' ? '6b' : '6a','7a','8b','9a','10a'];
  while (r.screen !== 'result' && budget-- > 0) {
    if (r.screen === 'map') {
      const next = evolutionOptions(r).find(e => e.ready && (e.form === 'greymon' || e.form === form));
      if (next) evolve(r, next.form);
      else { if (r.row === 10) bossEntryHp = r.hp; enterNode(r, path[r.row]); }
    } else if (r.screen === 'evolution') r.screen = 'map';
    else if (r.screen === 'battle') { if (r.row === 10) bossTurns++; playTurn(r, strategy); turns++; }
    else if (r.screen === 'rest') rest(r, 'rest');
    else if (r.screen === 'event') chooseEvent(r, form === 'skull' && [5,6].includes(r.row) ? 1 : 0);
    else if (r.screen === 'reward') {
      const priority = strategy === 'tactical' ? ['analysis','light','mimi','claw','hope','matt'] : ['claw','courage','cheer','flame'];
      const id = priority.find(id => r.rewards.includes(id as typeof r.rewards[number]));
      reward(r, id as typeof r.rewards[number] | undefined);
    }
  }
  return { r, turns, bossTurns, bossEntryHp, exhausted: budget <= 0 };
}

export function balanceReport(count = 100) {
  return (['standard', 'alternate'] as const).flatMap(route => (['metal', 'skull'] as const).flatMap(form => (['tactical','rush'] as const).map(strategy => {
    const runs = Array.from({ length: count }, (_, i) => simulate(i + 1, form, strategy, route));
    const wins = runs.filter(x => x.r.won);
    const bosses = runs.filter(x => x.bossTurns > 0);
    const avg = (items: number[]) => +(items.reduce((a,b) => a+b, 0) / Math.max(1, items.length)).toFixed(1);
    return { route, form, strategy, runs: count, wins: wins.length, reachedBoss: bosses.length, turns: avg(runs.map(x => x.turns)), bossTurns: avg(bosses.map(x => x.bossTurns)), winHp: avg(wins.map(x => x.r.hp)), exhausted: runs.some(x => x.exhausted) };
  })));
}
