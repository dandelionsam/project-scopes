#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

const directoryPath = argv['directory'] || process.env.npm_config_directory;
const generateMarkdown = argv['markdown'] ? true : process.env.npm_config_markdown;

function readDirectories(dirPath) {
  // Restituisce una promise che risolve con l'elenco delle cartelle di primo livello
  return new Promise((resolve, reject) => {
    // Cerca la cartella "src"
    const srcPath = path.join(dirPath, 'src');

    console.log('Cartella root del progetto: %c%s', 'color: #00a3cc', directoryPath);
    console.log('Cartella per la ricerca: %c%s', 'color: #aa00ff', srcPath);

    fs.access(srcPath, fs.constants.F_OK, (err) => {
      if (err) {
        reject(new Error('\nLa cartella non è stata trovata.'));
        return;
      }

      // Leggi il contenuto della cartella "src"
      fs.readdir(srcPath, (err, files) => {
        if (err) {
          reject(err);
          return;
        }

        // Filtra solo le cartelle di primo livello all'interno della cartella "src"
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
  const markdownContent = `# Elenco delle cartelle nella cartella "src"\n\n${directories.join('\n')}`;
  const markdownFilePath = path.join(dir, 'SCOPES.md');

  fs.writeFile(markdownFilePath, markdownContent, (err) => {
    if (err) {
      console.error('Errore durante la generazione del file markdown');
    } else {
      console.log(`File markdown generato con successo in: ${markdownFilePath}`);
    }
  });
}

readDirectories(directoryPath)
  .then((directories) => {
    console.log('Elenco delle cartelle di primo livello nella in src:');
    console.log(directories);
    if (generateMarkdown) generateMarkdownFile(directoryPath, directories);
  })
  .catch((err) => {
    console.error(err);
  });
