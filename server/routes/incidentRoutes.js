const express = require("express");
const router = express.Router();
const incidentController = require("../controllers/incidentController");
const { uploadIncidentImage } = require("../middleware/upload");
const { requireIncidentOperator } = require("../middleware/adminMiddleware");

// ✅ Get all incidents
router.get("/getIncidents", incidentController.getIncidents);
router.get("/my-reports/:userId", incidentController.getMyIncidentReports);
router.get("/history", incidentController.getIncidentHistory);
router.get("/stats", incidentController.getIncidentStats);
router.get("/typeStats", incidentController.getIncidentTypeStats);
router.get("/trend", incidentController.getTrend);

// ✅ Export single incident PDF
router.get("/export-pdf/:id", incidentController.exportIncidentPdf);

// ✅ Register incident (single image) + prevent undefined body
router.post(
  "/register",
  (req, res, next) => {
    if (!req.body) req.body = {};
    next();
  },
  (req, res, next) => {
    uploadIncidentImage.fields([
      { name: "image", maxCount: 1 },
      { name: "images", maxCount: 2 },
    ])(req, res, (err) => {
      if (err) {
        console.error("INCIDENT IMAGE UPLOAD ERROR:", {
          message: err.message,
          code: err.code,
          field: err.field,
          name: err.name,
        });

        return res.status(400).json({
          message: err.message || "Incident image upload failed.",
          code: err.code || null,
          field: err.field || null,
        });
      }

      console.log("INCIDENT UPLOAD OK:", {
        body: req.body,
        files: req.files || null,
      });

      next();
    });
  },
  incidentController.registerIncident
);

// ✅ Update status
router.put("/updateStatus/:id", requireIncidentOperator, incidentController.updateStatus);
router.put("/aiStatus/:id", requireIncidentOperator, incidentController.updateAIStatus);
router.put("/updateVerification/:id", requireIncidentOperator, incidentController.updateVerification);
router.put("/forceApprove/:id", requireIncidentOperator, incidentController.forceApproveIncident);
router.put("/reverify/:id", requireIncidentOperator, incidentController.reverifyIncident);

// ✅ Delete incident
router.delete("/delete/:id", requireIncidentOperator, incidentController.deleteIncident);

module.exports = router;
