const express = require('express')
const app = express();
const { PORT } = require("./config");
const { Server } = require('ws');
const ChatUser = require('./ChatUser');
const { NotFoundError } = require("./expressError");
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));


const wss = new Server({ server });



app.get('/', function (req, res, next) {
  res.send('Hello');
})

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

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
