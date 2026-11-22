const quote = files => files.map(f => JSON.stringify(f)).join(' ')

export default {
  '*.{ts,mjs,astro,json,md,css,yml,yaml}': files => {
    const cmds = [`prettier --write ${quote(files)}`]
    const lintable = files.filter(f => /\.(ts|mjs|astro)$/.test(f))
    if (lintable.length) cmds.push(`eslint --fix ${quote(lintable)}`)
    return cmds
  },
}
