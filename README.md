# Unboxing

A tool for making scaffolding tool.

## Usage

```bash
npm init unboxing create-amazing-project

# or yarn
yarn create unboxing create-amazing-project

# prompt
> What is the scaffold name? amazing-project
> Description: Create amazing project
```

### Folder structure

This will create a `create-amazing-project` folder in the current directory, which is a publish-ready npm package:

```bash
# ls /create-amazing-project
- template
- bin.js
- package.json
- unboxing.config.js
```

Put your template files to the template folder. 

> You can publish the package now (with the package name `create-amazing-project`). Then `npm init amazing-project` should work.

Every text files in template is a valid [nunjucks](https://mozilla.github.io/nunjucks/templating.html) template file.

#### unboxing.config.js

```js
module.exports = {
  renameMap: {},
  prompts: []
}
```

- `renameMap` rename some files when copy. For example:

```js
{
  "_unboxing.config.js": "unboxing.config.js"
}
```

When copy the `_unboxing.config.js` file in template, it would be renamed to `unboxing.config.js`.

- `prompts` [enquirer](https://github.com/enquirer/enquirer) prompt objects. The results would be passed to the template file:

```js
module.exports = {
  prompts: [
    {
      type: 'input',
      name: 'projectName',
      message: 'Name of this project'
    }
  ]
}
```

`projectName` can access in all template files:

```json
// template/foo.json
{
  "name": "{{ projectName }}"
}
```

# Build

```bash
$ cd packages/unboxing && npm i

# testing
$ npm test

# watch
$ npm run watch

# build
$ npm run build
```

# License

MIT