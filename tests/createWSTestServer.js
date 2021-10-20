const WebSocket = require("ws");
const { Server } = require('http');
const ChatUser = require('../ChatUser');
/**
 * Creates a WebSocket server from a Node http server. The server must
 * be started externally.
 * @param {Server} server The http server from which to create the WebSocket server
 */
function createWSTestServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', function connection(ws, req) {
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
  });
}

module.exports = createWSTestServer;
