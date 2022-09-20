const db = require('../db/connection');

module.exports = () => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT id, first_name, last_name FROM employee`, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};