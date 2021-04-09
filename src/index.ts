import * as path from 'path'
import * as fsWalk from '@nodelib/fs.walk'
import isTextPath from 'is-text-path'
import nunjucks from 'nunjucks'
import * as fs from 'fs'
import { Volume } from 'memfs'
import { Union } from 'unionfs'

export type Options = {
  templateDir?: string
  testing?: boolean
  outputDir?: string
}

export class Armin {

  resolvedConfig = {} as {
    root: string
    templateDir: string;
    testing: boolean;
    outputDir: string
  };

  constructor(root: string, options?: Options) {
    nunjucks.configure({
      autoescape: false
    })
    // config: root
    this.resolvedConfig.root = root
    // config: templateDir
    const templateDirName = options?.templateDir || 'template'
    this.resolvedConfig.templateDir = path.resolve(this.resolvedConfig.root, templateDirName)
    // config: testing
    this.resolvedConfig.testing = options?.testing ? true : false
    // config: outputDir
    this.resolvedConfig.outputDir = options?.outputDir || process.cwd()
  }

  walkTemplateFiles() {
    const files = fsWalk.walkSync(this.resolvedConfig.templateDir, {
      stats: true,
      // deepFilter: (entry) => entry.dirent.isFile()
    }).filter(_ => !_.dirent.isDirectory()).map(file => {
      return {
        ...file,
        relative: path.relative(this.resolvedConfig.templateDir, file.path),
        isTextFile: isTextPath(file.path)
      };
    })
    return files
  }

  generate() {
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
            {}
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

  info() {
    console.log('resolvedConifg:', this.resolvedConfig);
  }
}