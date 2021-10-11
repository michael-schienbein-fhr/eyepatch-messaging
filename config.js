"use strict"

require("dotenv").config();
require("colors");

const PORT = +process.env.PORT || 8001;

console.log("");
console.log("Eyepatch Messaging Server Config:".brightCyan);
console.log("NODE_ENV:".brightYellow, process.env.NODE_ENV);
console.log("PORT:".brightYellow, PORT.toString());
console.log("---------------------------------".brightCyan, "\n");



module.exports = {
  PORT,
  SECRET_KEY,
  BCRYPT_WF,
};
