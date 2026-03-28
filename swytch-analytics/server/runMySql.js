const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Lakshay@123',
    database: 'swytch_analytics'
  });
  const [rows] = await connection.query('SHOW CREATE TABLE subscriptions');
  console.log("-----BEGIN TABLE-----");
  console.log(rows[0]['Create Table']);
  console.log("-----END TABLE-----");
  await connection.end();
}
run().catch(console.error);
