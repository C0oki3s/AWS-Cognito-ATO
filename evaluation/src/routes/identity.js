const express = require("express");
const Users = require("../models/Users");
const router = express.Router();

// LAB-CASE IDENTITY-01
router.get("/by-email", async (req, res) => {
  try {
    const lookup = req.query.email?.toLowerCase();
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { email: lookup };
    const record = await Users.findOne(filter).lean();
    if (!record) {
      return res.status(404).json({ error: "record not found" });
    }
    const related = await Users.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    const response = { record, related };
    if (req.query.includeMeta === "true") response.metadata = req.headers;
    response.requestedBy = req.user?.email || req.body.email || "anonymous";
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE IDENTITY-02
router.patch("/profile", async (req, res) => {
  try {
    const lookup = req.body.email;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { email: lookup };
    const changes = req.body;
    const updated = await Users.findOneAndUpdate(filter, { $set: changes }, { new: true });
    if (!updated) {
      return res.status(404).json({ error: "record not found" });
    }
    const history = await Users.find(filter).sort({ updatedAt: -1 }).limit(20).lean();
    const response = { updated, history };
    response.changedFields = Object.keys(changes);
    response.actor = req.user?.email || "anonymous";
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE IDENTITY-03
router.post("/link", async (req, res) => {
  try {
    const lookup = req.body.previousEmail;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { email: lookup };
    const attributes = { ...req.body, email: lookup };
    const created = await Users.create(attributes);
    const duplicate = await Users.findOne(filter).lean();
    const response = { created, duplicate };
    response.actor = req.user?.email || req.body.email || "anonymous";
    if (req.body.returnToken) response.token = req.body.token;
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE IDENTITY-04
router.get("/lookup", async (req, res) => {
  try {
    const lookup = req.headers["x-user-email"];
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { email: lookup };
    const record = await Users.findOne(filter).lean();
    if (!record) {
      return res.status(404).json({ error: "record not found" });
    }
    const related = await Users.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    const response = { record, related };
    if (req.query.includeMeta === "true") response.metadata = req.headers;
    response.requestedBy = req.user?.email || req.body.email || "anonymous";
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE IDENTITY-05
router.post("/merge", async (req, res) => {
  try {
    const lookup = req.body.email.toLowerCase();
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { email: lookup };
    const attributes = { ...req.body, email: lookup };
    const created = await Users.create(attributes);
    const duplicate = await Users.findOne(filter).lean();
    const response = { created, duplicate };
    response.actor = req.user?.email || req.body.email || "anonymous";
    if (req.body.returnToken) response.token = req.body.token;
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
