#!/usr/bin/node

const fs = require('fs');
const path = require('path');

function readDirectories(dirPath) {
  // Restituisce una promise che risolve con l'elenco delle cartelle di primo livello
  return new Promise((resolve, reject) => {
    // Cerca la cartella "src"
    const srcPath = path.join(dirPath, 'src');

    fs.access(srcPath, fs.constants.F_OK, (err) => {
      if (err) {
        reject(new Error('Cartella "src" non trovata.'));
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

const directoryPath = process.env.npm_config_directory || './';

console.log('%c%s', 'color: #00a3cc', directoryPath);

readDirectories(directoryPath)
  .then((directories) => {
    console.log('Elenco delle cartelle di primo livello nella cartella "src":');
    console.log(directories);
    generateMarkdownFile(directoryPath, directories);
  })
  .catch((err) => {
    console.error('Errore durante la lettura delle cartelle:', err);
  });

function generateMarkdownFile(dirPath, directories) {
  const markdownContent = `# Elenco delle cartelle nella cartella "src"\n\n${directories.join('\n')}`;
  const markdownFilePath = path.join(dirPath, 'SCOPES.md');

  fs.writeFile(markdownFilePath, markdownContent, (err) => {
    if (err) {
      console.error('Errore durante la generazione del file markdown:', err);
    } else {
      console.log(`File markdown generato con successo: ${markdownFilePath}`);
    }
  });
}
