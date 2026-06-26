const mongoose = require('mongoose');

const uri = "mongodb+srv://yashsavani1075_db_user:[EMAIL_ADDRESS]/?appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("Collections in default DB:", collections.map(c => c.name));
  process.exit(0);
}

run().catch(console.error);
