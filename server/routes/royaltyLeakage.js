const express = require('express');

const router = express.Router();

router.post('/scan', (req, res) => {
  const units = Array.isArray(req.body?.units)
    ? req.body.units
    : [
        { name: 'Unit 12', reportedSales: 128000, posSales: 134500, royaltyRate: 0.06 },
        { name: 'Unit 18', reportedSales: 92000, posSales: 91800, royaltyRate: 0.06 },
      ];
  const findings = units.map((unit) => {
    const reported = Number(unit.reportedSales || 0);
    const pos = Number(unit.posSales || reported);
    const gap = Math.max(0, pos - reported);
    const leakage = gap * Number(unit.royaltyRate || 0.06);
    return {
      name: unit.name || 'Franchise unit',
      salesGap: Math.round(gap),
      royaltyLeakage: Math.round(leakage),
      risk: gap / Math.max(1, pos) > 0.04 ? 'high' : gap > 0 ? 'medium' : 'low',
    };
  });
  res.json({
    findings,
    totalLeakage: findings.reduce((sum, row) => sum + row.royaltyLeakage, 0),
    actions: ['Request POS export for high-risk units.', 'Compare deposit batches with weekly sales reports.', 'Schedule royalty true-up before close.'],
  });
});

module.exports = router;
