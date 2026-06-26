const mongoose = require('mongoose');

const uri = "mongodb+srv://yash_db:[EMAIL_ADDRESS]/?appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  const admin = mongoose.connection.db;
  const garments = await admin.collection('garments').find({}).toArray();
  console.log("Garment titles in default DB:", garments.map(g => g.title));
  process.exit(0);
}

run().catch(console.error);
