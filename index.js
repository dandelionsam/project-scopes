#!/usr/bin/env node

const LABELS = require('./labels');
const fs = require('fs');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

const srcFolder = argv['search'] || './';
const mdFileName = argv['name'] || 'SCOPES.md';
const dirPath = argv['directory'] || process.env.npm_config_directory || './';
const genMd = argv['markdown'] ? true : process.env.npm_config_markdown;

// Command arguments
// console.log('args', argv);

function readDirectories(dirPath) {
  return new Promise((resolve, reject) => {
    const srcPath = path.join(dirPath, srcFolder !== './' ? srcFolder : '');

    if (dirPath instanceof Array) {
      const completePath = dirPath.split('/');
      console.log(LABELS.PROJECT_ROOT, ...completePath.slice(-1));
      console.log(LABELS.READING_FROM, srcFolder);
    } else {
      const completePath = process.cwd().split('/');
      console.log(LABELS.PROJECT_ROOT, ...completePath.slice(-1));
      console.log(LABELS.READING_FROM, srcFolder);
    }

    // Verifico se la cartella ricercata ha i permessi in lettura
    fs.access(srcPath, fs.constants.F_OK, (err) => {
      if (err) return reject(new Error(LABELS.DIR_NOT_FOUND));

      // Leggo il contenuto della cartella ricercata
      fs.readdir(srcPath, (err, files) => {
        if (err) return reject(err);

        // Filtro solo le cartelle di primo livello all'interno della cartella ricercata
        const directories = files.filter((file) => {
          const filePath = path.join(srcPath, file);
          return fs.statSync(filePath).isDirectory();
        });

        // Escludo le cartelle nascoste del progetto (come .git o node_modules)
        // TODO: exclusion patterns or some folders
        const firstLevelDirs = directories.filter((dir) => {
          return dir !== 'node_modules' && dir !== 'vendor' && dir.charAt(0) !== '.';
        });

        resolve(firstLevelDirs);
      });
    });
  });
}

function generateMarkdownFile(dir, directories) {
  const markdownContent = `# List of project scopes
  } \n\n ${directories.join('\n')}`;

  const markdownFilePath = path.join(dir, mdFileName);

  fs.writeFile(markdownFilePath, markdownContent, (err) => {
    if (err) {
      console.error(LABELS.MARKDOWN_GEN_ERROR);
    } else {
      console.log(`${LABELS.MARKDOWN_GEN_SUCCESS} ${markdownFilePath}`);
    }
  });
}

readDirectories(dirPath)
  .then((directories) => {
    console.log(LABELS.FOLDER_LIST);
    directories.forEach((dir) => {
      console.log(` - ${dir}`);
    });
    if (genMd) generateMarkdownFile(dirPath, directories);
  })
  .catch((err) => {
    console.error(err);
  });
