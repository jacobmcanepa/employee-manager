const db = require('../db/connection');

module.exports = () => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT id, title FROM role`, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};