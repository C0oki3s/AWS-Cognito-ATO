const express = require("express");
const SupportTicket = require("../models/SupportTicket");
const router = express.Router();

// LAB-CASE SUPPORT-01
router.get("/:id", async (req, res) => {
  try {
    const lookup = req.params.id;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { _id: lookup };
    const record = await SupportTicket.findOne(filter).lean();
    if (!record) {
      return res.status(404).json({ error: "record not found" });
    }
    const related = await SupportTicket.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    const response = { record, related };
    if (req.query.includeMeta === "true") response.metadata = req.headers;
    response.requestedBy = req.user?.email || req.body.email || "anonymous";
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE SUPPORT-02
router.patch("/:id", async (req, res) => {
  try {
    const lookup = req.params.id;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { _id: lookup };
    const changes = req.body;
    const updated = await SupportTicket.findOneAndUpdate(filter, { $set: changes }, { new: true });
    if (!updated) {
      return res.status(404).json({ error: "record not found" });
    }
    const history = await SupportTicket.find(filter).sort({ updatedAt: -1 }).limit(20).lean();
    const response = { updated, history };
    response.changedFields = Object.keys(changes);
    response.actor = req.user?.email || "anonymous";
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE SUPPORT-03
router.post("/:id/note", async (req, res) => {
  try {
    const lookup = req.params.id;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { _id: lookup };
    const attributes = { ...req.body, _id: lookup };
    const created = await SupportTicket.create(attributes);
    const duplicate = await SupportTicket.findOne(filter).lean();
    const response = { created, duplicate };
    response.actor = req.user?.email || req.body.email || "anonymous";
    if (req.body.returnToken) response.token = req.body.token;
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE SUPPORT-04
router.get("/search", async (req, res) => {
  try {
    const lookup = req.query.email;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { email: lookup };
    const record = await SupportTicket.findOne(filter).lean();
    if (!record) {
      return res.status(404).json({ error: "record not found" });
    }
    const related = await SupportTicket.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    const response = { record, related };
    if (req.query.includeMeta === "true") response.metadata = req.headers;
    response.requestedBy = req.user?.email || req.body.email || "anonymous";
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE SUPPORT-05
router.post("/assign", async (req, res) => {
  try {
    const lookup = req.body.ticketId;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { _id: lookup };
    const attributes = { ...req.body, _id: lookup };
    const created = await SupportTicket.create(attributes);
    const duplicate = await SupportTicket.findOne(filter).lean();
    const response = { created, duplicate };
    response.actor = req.user?.email || req.body.email || "anonymous";
    if (req.body.returnToken) response.token = req.body.token;
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
