const {MongoClient} = require("mongodb");

const dbServer = process.env.DBSERVER || "localhost"
const dbName = process.env.DBNAME || "chgmanager"
const dbUser = process.env.DBUSER || "dbuser"
const dbPass = process.env.DBPASS || "dbpass"

const uri = `mongodb+srv://${dbUser}:${dbPass}@${dbServer}/${dbName}?retryWrites=true&w=majority`

const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
client.connect()
    .then(conn => global.conn = conn.db(dbName))
    .catch(err => console.log(err))

change = require("./models/change");

module.exports = { change }