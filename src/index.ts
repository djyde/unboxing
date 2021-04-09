import * as path from 'path'
import * as fsWalk from '@nodelib/fs.walk'
import isTextPath from 'is-text-path'
import nunjucks from 'nunjucks'
import * as fs from 'fs'
import { Volume } from 'memfs'
import { Union } from 'unionfs'
import enquirer from 'enquirer'

export type UnboxingOptions = {
  templateDir?: string
  testing?: boolean
  outputDir?: string
}

export type UnboxingConfig = {
  prompts?: any[]
}

const CONFIG_FILE_NAME = "krate.config.js";
export class Unboxing {

  resolvedConfig = {} as {
    root: string
    templateDir: string;
    testing: boolean;
    outputDir: string
    config: UnboxingConfig
  };

  constructor(root: string, options?: UnboxingOptions) {
    nunjucks.configure({
      autoescape: false
    })
    // config: root
    this.resolvedConfig.root = root
    // config: templateDir
    const templateDirName = options?.templateDir || 'template'
    this.resolvedConfig.templateDir = path.resolve(this.resolvedConfig.root, templateDirName)
    const configPath = path.resolve(this.resolvedConfig.templateDir, CONFIG_FILE_NAME);
    this.resolvedConfig.config = fs.existsSync(configPath) ? require(configPath) : {}
    // config: testing
    this.resolvedConfig.testing = options?.testing ? true : false
    // config: outputDir
    this.resolvedConfig.outputDir = options?.outputDir || process.cwd()
  }

  walkTemplateFiles() {
    const files = fsWalk.walkSync(this.resolvedConfig.templateDir, {
      stats: true,
      // deepFilter: (entry) => entry.dirent.isFile()
    }).filter(_ => !_.dirent.isDirectory() && _.name !== CONFIG_FILE_NAME).map(file => {
      return {
        ...file,
        relative: path.relative(this.resolvedConfig.templateDir, file.path),
        isTextFile: isTextPath(file.path)
      };
    })
    return files
  }

  async getAnswers() {
    if (this.resolvedConfig.config.prompts) {
      return await enquirer.prompt(this.resolvedConfig.config.prompts)
    } else {
      return {}
    }
  }

  generate(data = {}) {
    const files = this.walkTemplateFiles();
    const ufs = new Union();
    const volumn = Volume.fromJSON({});
    // @ts-expect-error
    ufs.use(volumn);
    if (!this.resolvedConfig.testing) {
      ufs.use(fs)
    }

    files.forEach((file) => {
      const parsed = file.isTextFile
        ? nunjucks.renderString(
            fs.readFileSync(file.path, { encoding: "utf-8" }),
            data
          )
        : "";
        const target = path.resolve(
          this.resolvedConfig.testing ? "/" : this.resolvedConfig.outputDir,
          file.relative
        );
        if (file.isTextFile) {
          if (!ufs.existsSync(path.dirname(target))) {
            ufs.mkdirSync(path.dirname(target))
          }
          ufs.writeFileSync(target, parsed);
        } else {
          if (!this.resolvedConfig.testing) {
            // just copy
            if (!fs.existsSync(path.dirname(target))) {
              fs.mkdirSync(path.dirname(target))
            }
            fs.copyFileSync(file.path, target)
          }
          if (!ufs.existsSync(path.dirname(target))) {
            ufs.mkdirSync(path.dirname(target));
          }
          ufs.writeFileSync(target, "");
        }
    });

    return volumn

  }

  async cli() {
    const answers = await this.getAnswers()
    return this.generate(answers)
  }

  info() {
    console.log('resolvedConifg:', this.resolvedConfig);
  }
}