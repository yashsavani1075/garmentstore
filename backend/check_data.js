const mongoose = require('mongoose');

const uri = "mongodb+srv://yashsavani1075_db_user:meet_1234@cluster0.galhaii.mongodb.net/?appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  const admin = mongoose.connection.db;
  const garments = await admin.collection('garments').find({}).toArray();
  console.log("Garment titles in default DB:", garments.map(g => g.title));
  process.exit(0);
}

run().catch(console.error);
