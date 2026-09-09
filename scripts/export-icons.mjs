import { writeFileSync } from 'node:fs';
import { iconPaths } from '../src/icons.ts';
for (const [name, paths] of Object.entries(iconPaths)) {
  writeFileSync(`public/assets/ui/${name}-icon.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>\n`);
}
