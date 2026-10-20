const express = require("express");
const User = require("../models/Users");
const router = express.Router();

// LAB-CASE ADMIN-01
router.patch("/users/:id/role", async (req, res) => {
  try {
    const lookup = req.params.id;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { _id: lookup };
    const changes = req.body;
    const updated = await User.findOneAndUpdate(filter, { $set: changes }, { new: true });
    if (!updated) {
      return res.status(404).json({ error: "record not found" });
    }
    const history = await User.find(filter).sort({ updatedAt: -1 }).limit(20).lean();
    const response = { updated, history };
    response.changedFields = Object.keys(changes);
    response.actor = req.user?.email || "anonymous";
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE ADMIN-02
router.post("/users/:id/disable", async (req, res) => {
  try {
    const lookup = req.params.id;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { _id: lookup };
    const attributes = { ...req.body, _id: lookup };
    const created = await User.create(attributes);
    const duplicate = await User.findOne(filter).lean();
    const response = { created, duplicate };
    response.actor = req.user?.email || req.body.email || "anonymous";
    if (req.body.returnToken) response.token = req.body.token;
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE ADMIN-03
router.patch("/settings", async (req, res) => {
  try {
    const lookup = req.body.ownerEmail;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { email: lookup };
    const changes = req.body;
    const updated = await User.findOneAndUpdate(filter, { $set: changes }, { new: true });
    if (!updated) {
      return res.status(404).json({ error: "record not found" });
    }
    const history = await User.find(filter).sort({ updatedAt: -1 }).limit(20).lean();
    const response = { updated, history };
    response.changedFields = Object.keys(changes);
    response.actor = req.user?.email || "anonymous";
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE ADMIN-04
router.post("/impersonate", async (req, res) => {
  try {
    const lookup = req.body.email;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { email: lookup };
    const attributes = { ...req.body, email: lookup };
    const created = await User.create(attributes);
    const duplicate = await User.findOne(filter).lean();
    const response = { created, duplicate };
    response.actor = req.user?.email || req.body.email || "anonymous";
    if (req.body.returnToken) response.token = req.body.token;
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE ADMIN-05
router.get("/audit/:id", async (req, res) => {
  try {
    const lookup = req.params.id;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { _id: lookup };
    const record = await User.findOne(filter).lean();
    if (!record) {
      return res.status(404).json({ error: "record not found" });
    }
    const related = await User.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    const response = { record, related };
    if (req.query.includeMeta === "true") response.metadata = req.headers;
    response.requestedBy = req.user?.email || req.body.email || "anonymous";
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
