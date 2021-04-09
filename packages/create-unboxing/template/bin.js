#!/usr/bin/env node

const { Unboxing } = require('unboxing')

const app = new Unboxing(__dirname)
app.cli(process.argv)
