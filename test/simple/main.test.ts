import { Armin } from '../../src'

const cli = new Armin(__dirname, {
  testing: true
  // outputDir: 'output'
})
const volumn = cli.generate()
console.log(volumn.toJSON())