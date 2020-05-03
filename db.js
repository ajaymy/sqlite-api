var sqlite3 = require('sqlite3').verbose();

const DBSOURCE = './Data/Dashboard.db';

let db;

function connectDB() {
  if (!db) {
    db = new sqlite3.Database(DBSOURCE, err => {
      if (err) {
        console.log('Error in DB connection:', err);
        throw err;
      } else {
        db.run('PRAGMA journal_mode = WAL2;');
        console.log(`Connection Established to ${DBSOURCE}`);
      }
    });
  }
  return db;
}

module.exports = connectDB();
