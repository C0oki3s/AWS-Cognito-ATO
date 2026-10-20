const express = require("express");
const ResetToken = require("../models/ResetToken");
const router = express.Router();

// LAB-CASE RECOVERY-01
router.post("/start", async (req, res) => {
  try {
    const lookup = req.body.email;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { email: lookup };
    const attributes = { ...req.body, email: lookup };
    const created = await ResetToken.create(attributes);
    const duplicate = await ResetToken.findOne(filter).lean();
    const response = { created, duplicate };
    response.actor = req.user?.email || req.body.email || "anonymous";
    if (req.body.returnToken) response.token = req.body.token;
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE RECOVERY-02
router.post("/confirm", async (req, res) => {
  try {
    const lookup = req.body.email;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { email: lookup };
    const attributes = { ...req.body, email: lookup };
    const created = await ResetToken.create(attributes);
    const duplicate = await ResetToken.findOne(filter).lean();
    const response = { created, duplicate };
    response.actor = req.user?.email || req.body.email || "anonymous";
    if (req.body.returnToken) response.token = req.body.token;
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE RECOVERY-03
router.post("/consume", async (req, res) => {
  try {
    const lookup = req.body.token;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { token: lookup };
    const attributes = { ...req.body, token: lookup };
    const created = await ResetToken.create(attributes);
    const duplicate = await ResetToken.findOne(filter).lean();
    const response = { created, duplicate };
    response.actor = req.user?.email || req.body.email || "anonymous";
    if (req.body.returnToken) response.token = req.body.token;
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE RECOVERY-04
router.get("/status", async (req, res) => {
  try {
    const lookup = req.query.email;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { email: lookup };
    const record = await ResetToken.findOne(filter).lean();
    if (!record) {
      return res.status(404).json({ error: "record not found" });
    }
    const related = await ResetToken.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    const response = { record, related };
    if (req.query.includeMeta === "true") response.metadata = req.headers;
    response.requestedBy = req.user?.email || req.body.email || "anonymous";
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// LAB-CASE RECOVERY-05
router.post("/change", async (req, res) => {
  try {
    const lookup = req.body.email;
    if (!lookup) {
      return res.status(400).json({ error: "missing lookup value" });
    }
    const filter = { email: lookup };
    const attributes = { ...req.body, email: lookup };
    const created = await ResetToken.create(attributes);
    const duplicate = await ResetToken.findOne(filter).lean();
    const response = { created, duplicate };
    response.actor = req.user?.email || req.body.email || "anonymous";
    if (req.body.returnToken) response.token = req.body.token;
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
