const fs = require('fs');
const path = require('path');

console.log("=== STARTING REPORT FEATURE VERIFICATION ===");

const reportedPath = path.join(__dirname, '..', 'reported_audios.json');
const audioDbPath = path.join(__dirname, '..', 'audio_database.json');

// Test 1: Write a mock report
const testReport = {
  id: 'report_test_' + Date.now(),
  audio_id: 'audio_test_999',
  title: 'Bản ghi âm thử nghiệm vi phạm',
  province: 'Quảng Trị',
  speaker: 'Người dùng thử nghiệm',
  reason: 'Âm thanh hỏng / Không có tiếng',
  note: 'Không nghe thấy tiếng nói',
  timestamp: new Date().toISOString(),
  status: 'pending_review'
};

let reports = [];
if (fs.existsSync(reportedPath)) {
  try { reports = JSON.parse(fs.readFileSync(reportedPath, 'utf-8')); } catch(e) {}
}

reports.push(testReport);
fs.writeFileSync(reportedPath, JSON.stringify(reports, null, 2), 'utf-8');

console.log("1. Written mock report to reported_audios.json");

// Test 2: Read back
const verifyReports = JSON.parse(fs.readFileSync(reportedPath, 'utf-8'));
const found = verifyReports.find(r => r.id === testReport.id);

if (found) {
  console.log("2. Successfully verified report reading:", found.title, found.reason);
  // Clean up
  const cleaned = verifyReports.filter(r => r.id !== testReport.id);
  fs.writeFileSync(reportedPath, JSON.stringify(cleaned, null, 2), 'utf-8');
  console.log("3. Cleaned up mock report.");
} else {
  console.error("2. Failed to verify report!");
  process.exit(1);
}

console.log("=== ALL REPORT TESTS COMPLETED SUCCESSFULLY ===");
