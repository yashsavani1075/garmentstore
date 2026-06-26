const mongoose = require('mongoose');

const uri = "mongodb+srv://yashsavani1075_db_user:meet_1234@cluster0.galhaii.mongodb.net/?appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  console.log("Connected");
  const admin = mongoose.connection.db.admin();
  const dbs = await admin.listDatabases();
  console.log(dbs.databases.map(d => d.name));
  process.exit(0);
}

run().catch(console.error);
