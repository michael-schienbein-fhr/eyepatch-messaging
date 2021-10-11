const server = require("./server");
const {PORT} = require("./config");

server.listen(PORT, () => {
  console.log(`Server started on port ${server.address().port} :)`);
});