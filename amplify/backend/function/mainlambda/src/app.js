const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const axios = require('axios');

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

// Testing api&function
app.get('/item', async (req, res) => {
  const data = await axios.get('https://swapi.dev/api/people/');
  res.json({ success: 'get call succeed!', url: req.url, result: data.data.results });
});

// QLDB configuration
const qldb = require('amazon-qldb-driver-nodejs');
const https = require('https');

const maxConcurrentTransactions = 50;

const agentForQldb = new https.Agent({
  "keepAlive": true,
  //Set this to the same value as `maxConcurrentTransactions
  //Do not rely on the default value of `Infinity`
  "maxSockets": maxConcurrentTransactions
 });
const serviceConfiguration = { "httpOptions": {
  "agent": agentForQldb
 }};

let driver = new qldb.QldbDriver("billcert-ledger-1", serviceConfiguration,maxConcurrentTransactions);

// QLDB functions

app.get('/createtable', async (req, res) => {
  await driver.executeLambda(async (txn) => {
    await txn.execute("CREATE TABLE invoice")
  });
  await new Promise(resolve => setTimeout(resolve, 3000))
  console.log('Create table invoice');
  driver.close()
})

// app.get('/item/*', function (req, res) {
//   // Add your code here
//   res.json({ success: 'get call succeed!', url: req.url });
// });

// app.post('/item', function (req, res) {
//   // Add your code here
//   res.json({ success: 'post call succeed!', url: req.url, body: req.body })
// });

// app.post('/item/*', function (req, res) {
//   // Add your code here
//   res.json({ success: 'post call succeed!', url: req.url, body: req.body })
// });

// app.put('/item', function (req, res) {
//   // Add your code here
//   res.json({ success: 'put call succeed!', url: req.url, body: req.body })
// });

// app.put('/item/*', function (req, res) {
//   // Add your code here
//   res.json({ success: 'put call succeed!', url: req.url, body: req.body })
// });

// app.delete('/item', function (req, res) {
//   // Add your code here
//   res.json({ success: 'delete call succeed!', url: req.url });
// });

// app.delete('/item/*', function (req, res) {
//   // Add your code here
//   res.json({ success: 'delete call succeed!', url: req.url });
// });

app.listen(3000, function () {
  console.log("App started")
});

module.exports = app
