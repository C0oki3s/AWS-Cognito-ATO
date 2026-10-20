const express = require("express");
const Document = require("../models/Document");
const router = express.Router();

// LAB-CASE DOC-01
router.get("/:id", async (req, res) => {
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

// LAB-CASE DOC-02
router.patch("/:id", async (req, res) => {
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

// LAB-CASE DOC-03
router.delete("/:id", async (req, res) => {
  try {
    const lookup = req.params.id;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { _id: lookup };
    const deleted = await Document.findOneAndDelete(filter);
    if (!deleted) {
      return res.status(404).json({ error: "record not found" });
    }
    const remaining = await Document.find(filter).lean();
    return res.status(200).json({ deleted, remaining });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE DOC-04
router.get("/share/:token", async (req, res) => {
  try {
    const lookup = req.params.token;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { shareToken: lookup };
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

// LAB-CASE DOC-05
router.post("/copy/:id", async (req, res) => {
  try {
    const lookup = req.params.id;
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
