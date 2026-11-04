// A Markdown table of each page's Lighthouse scores, from the reports that
// `lhci upload` writes, for the job summary on GitHub.
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('.lighthouseci/reports/manifest.json', 'utf8'));
const categories = ['performance', 'accessibility', 'best-practices', 'seo'];

console.log('## Lighthouse\n');
console.log(`| Page | ${categories.join(' | ')} |`);
console.log(`| --- |${' ---: |'.repeat(categories.length)}`);
for (const run of manifest.filter((run) => run.isRepresentativeRun)) {
  const scores = categories.map((category) => Math.round(run.summary[category] * 100));
  console.log(`| ${new URL(run.url).pathname} | ${scores.join(' | ')} |`);
}
console.log('\nThe full reports are in the `lighthouse-reports` artifact.');
