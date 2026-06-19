const Financial = require("../../models/Financial/financialModel");

async function getFinancialRecords(req, res) {
  try {
    const { month, year, type, category } = req.query;
    let query = {};
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    if (type) query.type = type;
    if (category) query.category = category;
    
    const records = await Financial.find(query)
      .populate("recordedBy", "name email")
      .sort({ date: -1 });
    
    res.json({ success: true, data: records });
  } catch (err) {
    console.error("Error fetching financial records:", err);
    res.status(400).json({ success: false, message: err.message });
  }
}

async function addFinancialRecord(req, res) {
  try {
    const { date, type, category, description, amount, paymentMethod, reference } = req.body;
    
    const newRecord = new Financial({ 
      date, 
      type, 
      category, 
      description, 
      amount, 
      paymentMethod, 
      reference,
      recordedBy: req.userId 
    });
    
    await newRecord.save();
    await newRecord.populate("recordedBy", "name email");
    
    res.json({ success: true, message: "Financial record added successfully!", data: newRecord });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function updateFinancialRecord(req, res) {
  try {
    const { date, type, category, description, amount, paymentMethod, reference } = req.body;
    const recordId = req.params.id;
    
    const updatedRecord = await Financial.findByIdAndUpdate(
      recordId, 
      { date, type, category, description, amount, paymentMethod, reference },
      { new: true, runValidators: true }
    ).populate("recordedBy", "name email");
    
    if (!updatedRecord) {
      return res.status(404).json({ success: false, message: "Financial record not found" });
    }
    
    res.json({ 
      success: true, 
      message: "Financial record updated successfully!", 
      data: updatedRecord 
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function deleteFinancialRecord(req, res) {
  try {
    const recordId = req.params.id;
    const record = await Financial.findByIdAndDelete(recordId);
    
    if (!record) {
      return res.status(404).json({ success: false, message: "Financial record not found" });
    }
    
    res.json({ success: true, message: "Financial record deleted successfully!" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function getFinancialRecordById(req, res) {
  try {
    const record = await Financial.findById(req.params.id).populate("recordedBy", "name email");
    
    if (!record) {
      return res.status(404).json({ success: false, message: "Financial record not found" });
    }
    
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function getFinancialSummary(req, res) {
  try {
    const { month, year } = req.query;
    let query = {};
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const records = await Financial.find(query);
    
    const totalIncome = records
      .filter(record => record.type === "Income")
      .reduce((sum, record) => sum + record.amount, 0);
    
    const totalOutcome = records
      .filter(record => record.type === "Outcome")
      .reduce((sum, record) => sum + record.amount, 0);
    
    const netProfit = totalIncome - totalOutcome;
    
    // Category-wise breakdown
    const categoryBreakdown = {};
    records.forEach(record => {
      if (!categoryBreakdown[record.category]) {
        categoryBreakdown[record.category] = { income: 0, outcome: 0 };
      }
      
      if (record.type === "Income") {
        categoryBreakdown[record.category].income += record.amount;
      } else {
        categoryBreakdown[record.category].outcome += record.amount;
      }
    });
    
    res.json({ 
      success: true, 
      data: {
        totalIncome,
        totalOutcome,
        netProfit,
        categoryBreakdown,
        recordCount: records.length
      }
    });
  } catch (err) {
    console.error("Error fetching financial summary:", err);
    res.status(400).json({ success: false, message: err.message });
  }
}

module.exports = { 
  getFinancialRecords, 
  addFinancialRecord, 
  updateFinancialRecord, 
  deleteFinancialRecord, 
  getFinancialRecordById,
  getFinancialSummary
};