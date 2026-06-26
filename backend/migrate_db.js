const mongoose = require('mongoose');

const uriTest = "mongodb+srv://yashsavani1075_db_user:[EMAIL_ADDRESS]/?appName=Cluster0";
const uriTarget = "mongodb+srv://yashsavani1075_db_user:[EMAIL_ADDRESS]/?appName=Cluster0";

async function run() {
  const connTest = await mongoose.createConnection(uriTest).asPromise();
  const connTarget = await mongoose.createConnection(uriTarget).asPromise();
  
  const collections = await connTest.db.listCollections().toArray();
  for (const c of collections) {
    const name = c.name;
    const docs = await connTest.db.collection(name).find({}).toArray();
    if (docs.length > 0) {
      // Clear target collection first
      await connTarget.db.collection(name).deleteMany({});
      await connTarget.db.collection(name).insertMany(docs);
      console.log(`Migrated ${docs.length} documents for collection ${name}`);
    }
  }
  
  await connTest.close();
  await connTarget.close();
  console.log("Migration complete!");
  process.exit(0);
}

run().catch(console.error);
