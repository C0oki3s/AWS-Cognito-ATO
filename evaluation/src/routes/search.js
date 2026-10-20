const express = require("express");
const Document = require("../models/Document");
const router = express.Router();

// LAB-CASE QUERY-01
router.get("/find", async (req, res) => {
  try {
    const lookup = req.query.filter;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { title: lookup };
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

// LAB-CASE QUERY-02
router.post("/search", async (req, res) => {
  try {
    const lookup = req.body.criteria;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { ownerEmail: lookup };
    const attributes = { ...req.body, ownerEmail: lookup };
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

// LAB-CASE QUERY-03
router.get("/contains", async (req, res) => {
  try {
    const lookup = new RegExp(req.query.q);
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { title: lookup };
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

// LAB-CASE QUERY-04
router.post("/sort", async (req, res) => {
  try {
    const lookup = req.body.orderBy;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { createdAt: lookup };
    const attributes = { ...req.body, createdAt: lookup };
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

// LAB-CASE QUERY-05
router.get("/export", async (req, res) => {
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

module.exports = router;
