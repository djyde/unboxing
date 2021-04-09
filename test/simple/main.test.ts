import { Unboxing } from '../../src'

const app = new Unboxing(__dirname, {
  testing: true
  // outputDir: 'output'
})


;(async () => {
const result = await app.cli();
console.log(result.toJSON());
})()
