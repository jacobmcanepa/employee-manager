const db = require('./db/connection');

db.query(`SELECT title FROM role`, (err, result) => {
  let arr = [];
  if (err) throw err;
  result.forEach(product => {
    arr.push(product.title);
  })
  console.log(arr);
})

db.end();