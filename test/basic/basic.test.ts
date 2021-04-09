import { Unboxing } from '../../src'
import * as fs from 'fs'
import * as path from 'path'

test('generate', async () => {

  const app = new Unboxing(__dirname, {
    testing: true,
  });

  const result = app.generate({
    name: 'foo'
  }).toJSON()
  const packageJsonFile = fs.readFileSync(path.resolve(__dirname, 'template', '_package.json'), { encoding: 'utf-8' })
  expect(result['/src/index.js']).toBeTruthy()

  // rename map
  expect(result['/_package.json']).toBeUndefined()
  expect(result['/package.json']).toEqual(packageJsonFile.replace("{{ name }}", "foo"));
  // expect(result.toJSON()).toMatchSnapshot()
})

