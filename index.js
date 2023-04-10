#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

const srcFolder = argv['search'] || 'src';
const dirPath = argv['directory'] || process.env.npm_config_directory || './';
const genMd = argv['markdown'] ? true : process.env.npm_config_markdown;

function readDirectories(dirPath) {
  return new Promise((resolve, reject) => {
    const srcPath = path.join(dirPath, srcFolder);

    if (dirPath instanceof Array) {
      const completePath = dirPath.split('/');
      console.log('Root del progetto:', ...completePath.slice(-1));
    } else {
      const completePath = process.cwd().split('/');
      console.log('Root del progetto:', ...completePath.slice(-1));
    }

    // Verifico se la cartella ricercata ha i permessi in lettura
    fs.access(srcPath, fs.constants.F_OK, (err) => {
      if (err) {
        reject(new Error('\nLa cartella non è stata trovata.'));
        return;
      }

      // Leggo il contenuto della cartella ricercata
      fs.readdir(srcPath, (err, files) => {
        if (err) {
          reject(err);
          return;
        }

        // Filtro solo le cartelle di primo livello all'interno della cartella ricercata
        const directories = files.filter((file) => {
          const filePath = path.join(srcPath, file);
          return fs.statSync(filePath).isDirectory();
        });

        // Risolvi la Promise con l'elenco delle cartelle
        resolve(directories);
      });
    });
  });
}

function generateMarkdownFile(dir, directories) {
  const markdownContent = `# Elenco delle cartelle di primo livello in ${srcFolder} \n\n ${directories.join('\n')}`;
  const markdownFilePath = path.join(dir, 'SCOPES.md');

  fs.writeFile(markdownFilePath, markdownContent, (err) => {
    if (err) {
      console.error('Errore durante la generazione del file markdown');
    } else {
      console.log(`File markdown generato con successo in: ${markdownFilePath}`);
    }
  });
}

readDirectories(dirPath)
  .then((directories) => {
    console.log(`Elenco delle cartelle di primo livello in ${srcFolder}:`);
    directories.forEach((dir) => {
      console.log(` - ${dir}`);
    });
    if (genMd) generateMarkdownFile(dirPath, directories);
  })
  .catch((err) => {
    console.error(err);
  });
