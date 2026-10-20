const express = require("express");
const identity = require("./routes/identity");
const documents = require("./routes/documents");
const admin = require("./routes/admin");
const search = require("./routes/search");
const recovery = require("./routes/recovery");
const exportsRouter = require("./routes/exports");
const tenants = require("./routes/tenants");
const support = require("./routes/support");

function createEvaluationApp() {
  const app = express();
  app.use(express.json());
  app.use("/identity", identity);
  app.use("/documents", documents);
  app.use("/admin", admin);
  app.use("/search", search);
  app.use("/recovery", recovery);
  app.use("/exports", exportsRouter);
  app.use("/tenants", tenants);
  app.use("/support", support);
  return app;
}

module.exports = { createEvaluationApp };
