import test from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";

test("exports an Express application", () => {
  assert.equal(typeof app, "function");
  assert.equal(typeof app.listen, "function");
});
