const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const officer = require("../controllers/officerController");
const alerts = require("../controllers/alertController");
const photo = require("../controllers/photoRiskController");
const panchayats = require("../controllers/panchayatController");
const router = express.Router();

router.use(requireAuth, requireRole("OFFICER"));
router.get("/dashboard", officer.dashboard);
router.get("/farmer-reports", officer.farmerReports);
router.post("/farmer-reports/:id/review", photo.officerReview);
router.post("/alerts", alerts.createAlert);
router.post("/alerts/:id/close", alerts.deactivateAlert);
router.put("/panchayats/:id", panchayats.updatePanchayat);
router.get("/audit-logs", officer.auditLogs);
module.exports = router;
