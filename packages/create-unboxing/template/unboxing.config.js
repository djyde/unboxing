module.exports = {
  renameMap: {
    '_unboxing.config.js': 'unboxing.config.js'
  },
  prompts: [
    {
      type: "input",
      name: "name",
      message: `What is the scaffold name?`,
      result(data) {
        if (data.startsWith('@')) {
          // to match @foo/bar
          const reg = new RegExp(/\@([^\/]+)\/(.+)/, 'g');
          const matched = reg.exec(data)
          const scope = matched[1]
          const package = matched[2]
          return `@${scope}/create-${package}`
        } else {
          return `create-${data}`;
        }
      },
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description'
    }
  ],
};