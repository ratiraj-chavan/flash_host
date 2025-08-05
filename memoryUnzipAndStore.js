// memoryUnzipAndStore.js
const unzipper = require('unzipper');
const streamifier = require('streamifier');
const pool = require('./db');

async function memoryUnzipAndStore(buffer, folderName) {
  const directory = await unzipper.Open.buffer(buffer);

  for (const entry of directory.files) {
    if (entry.type === 'File') {
      const fileName = entry.path.split('/').pop(); // Get just the filename
      const filePath = `virtual/${folderName}/${entry.path}`; // Virtual path

      await pool.query(
        'INSERT INTO files (folder_name, file_name, file_path) VALUES (?, ?, ?)',
        [folderName, fileName, filePath]
      );
    }
  }
}

module.exports = memoryUnzipAndStore;