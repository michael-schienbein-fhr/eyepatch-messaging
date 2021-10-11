const express = require('express')
const app = express();
const { PORT } = require("./config");
const { Server } = require('ws');
const ChatUser = require('./ChatUser');
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));
const wss = new Server({ server });

app.get('/', function (req, res, next) {
  res.send('Hello');
})


wss.on('connection', function connection(ws, req) {
  console.log("url: ", req.url.charAt(req.url.length - 1));
  try {
    const user = new ChatUser(
      ws.send.bind(ws), // fn to call to message this user
      req.url.charAt(req.url.length - 1)// name of room for user
    );

    // register handlers for message-received, connection-closed

    ws.on('message', function (data) {
      try {
        user.handleMessage(data);
      } catch (err) {
        console.error(err);
      }
    });

    ws.on('close', function () {
      try {
        user.handleClose();
      } catch (err) {
        console.error(err);
      }
    });
  } catch (err) {
    console.error(err);
  }
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
});

// module.exports = app;