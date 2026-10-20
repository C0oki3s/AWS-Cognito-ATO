const express = require("express");
const Document = require("../models/Document");
const router = express.Router();

// LAB-CASE EXPORT-01
router.get("/all", async (req, res) => {
  try {
    const lookup = req.query.owner;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { ownerEmail: lookup };
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

// LAB-CASE EXPORT-02
router.post("/download", async (req, res) => {
  try {
    const lookup = req.body.ids;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { _id: lookup };
    const attributes = { ...req.body, _id: lookup };
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

// LAB-CASE EXPORT-03
router.get("/recent", async (req, res) => {
  try {
    const lookup = req.query.since;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { createdAt: lookup };
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

// LAB-CASE EXPORT-04
router.get("/csv", async (req, res) => {
  try {
    const lookup = req.query.email;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { ownerEmail: lookup };
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

// LAB-CASE EXPORT-05
router.post("/archive", async (req, res) => {
  try {
    const lookup = req.body.documentId;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { _id: lookup };
    const attributes = { ...req.body, _id: lookup };
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
