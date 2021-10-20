"use strict";

describe("config can come from env", function () {
  test("works", function() {
    process.env.PORT = "5000";
    process.env.NODE_ENV = "other";

    const config = require("../config");
    expect(config.PORT).toEqual(5000);

    delete process.env.PORT;
    delete process.env.NODE_ENV;

  });
})

