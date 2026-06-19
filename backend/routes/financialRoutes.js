const express = require("express");
const router = express.Router();
const finance = require("../controller/Financial/financialController");

router.get("/", finance.getFinancialRecords);
router.get("/summary",  finance.getFinancialSummary);
router.get("/:id", finance.getFinancialRecordById);
router.post("/", finance.addFinancialRecord);
router.put("/:id", finance.updateFinancialRecord);
router.delete("/:id", finance.deleteFinancialRecord);

module.exports = router;