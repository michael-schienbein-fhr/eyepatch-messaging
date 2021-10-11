
const WebSocketServer = require('ws').Server;
const { PORT } = require("./config");
const wss = new WebSocketServer({ port: PORT });
const ChatUser = require('./ChatUser');
//initialize a simple http server
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

