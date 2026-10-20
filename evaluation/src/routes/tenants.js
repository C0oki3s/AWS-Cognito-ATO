const express = require("express");
const Document = require("../models/Document");
const router = express.Router();

// LAB-CASE TENANT-01
router.get("/projects", async (req, res) => {
  try {
    const lookup = req.query.tenantId;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { tenantId: lookup };
    const record = await Document.findOne(filter).lean();
    if (!record) {
      return res.status(404).json({ error: "record not found" });
    }
    const related = await Document.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    const response = { record, related };
    if (req.query.includeMeta === "true") response.metadata = req.headers;
    response.requestedBy = req.user?.email || req.body.email || "anonymous";
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE TENANT-02
router.get("/invoices/:id", async (req, res) => {
  try {
    const lookup = req.params.id;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { _id: lookup };
    const record = await Document.findOne(filter).lean();
    if (!record) {
      return res.status(404).json({ error: "record not found" });
    }
    const related = await Document.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    const response = { record, related };
    if (req.query.includeMeta === "true") response.metadata = req.headers;
    response.requestedBy = req.user?.email || req.body.email || "anonymous";
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE TENANT-03
router.patch("/members/:id", async (req, res) => {
  try {
    const lookup = req.params.id;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { _id: lookup };
    const changes = req.body;
    const updated = await Document.findOneAndUpdate(filter, { $set: changes }, { new: true });
    if (!updated) {
      return res.status(404).json({ error: "record not found" });
    }
    const history = await Document.find(filter).sort({ updatedAt: -1 }).limit(20).lean();
    const response = { updated, history };
    response.changedFields = Object.keys(changes);
    response.actor = req.user?.email || "anonymous";
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE TENANT-04
router.get("/usage", async (req, res) => {
  try {
    const lookup = req.headers["x-tenant"];
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { tenantId: lookup };
    const record = await Document.findOne(filter).lean();
    if (!record) {
      return res.status(404).json({ error: "record not found" });
    }
    const related = await Document.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    const response = { record, related };
    if (req.query.includeMeta === "true") response.metadata = req.headers;
    response.requestedBy = req.user?.email || req.body.email || "anonymous";
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE TENANT-05
router.post("/switch", async (req, res) => {
  try {
    const lookup = req.body.tenantId;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { tenantId: lookup };
    const attributes = { ...req.body, tenantId: lookup };
    const created = await Document.create(attributes);
    const duplicate = await Document.findOne(filter).lean();
    const response = { created, duplicate };
    response.actor = req.user?.email || req.body.email || "anonymous";
    if (req.body.returnToken) response.token = req.body.token;
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
