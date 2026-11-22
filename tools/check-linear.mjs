// Fails when the range holds a merge commit. Usage: node tools/check-linear.mjs <base>..<head>
import { execFileSync } from 'node:child_process'

const range = process.argv[2]
if (!range) {
  console.error('usage: node tools/check-linear.mjs <base>..<head>')
  process.exit(2)
}

const merges = execFileSync('git', ['rev-list', '--merges', '--oneline', range], {
  encoding: 'utf8',
}).trim()
if (merges) {
  console.error(`Merge commits in ${range}; history is linear, so rebase instead:\n${merges}`)
  process.exit(1)
}
console.log(`No merge commits in ${range}.`)
