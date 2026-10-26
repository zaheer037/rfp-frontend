/** Remove unused design-system selectors after bundling; preserve generated responsive classes. */
import {PurgeCSS} from 'purgecss';
import {readdir,writeFile} from 'node:fs/promises';
const assets=(await readdir('dist/assets')).map(name=>'dist/assets/'+name);
const result=await new PurgeCSS().purge({
 content:['index.html','src/**/*.{ts,tsx}',...assets.filter(name=>name.endsWith('.js'))],
 css:assets.filter(name=>name.endsWith('.css')),
 safelist:{standard:[/^rt-variant-/,'rt-high-contrast',/^rt-r-(size|max-w|min-w|w|max-h|min-h|h)/,'light','dark','light-theme','dark-theme','radix-themes'],greedy:[/data-theme/,/data-state/,/data-accent-color/,/data-gray-color/,/data-panel-background/,/data-radius/,/data-scaling/]},
});
for(const sheet of result)if(sheet.file)await writeFile(sheet.file,sheet.css);
