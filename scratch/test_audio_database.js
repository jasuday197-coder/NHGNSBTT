const fs = require('fs');
const path = require('path');
const http = require('http');

const dbPath = path.join(__dirname, '..', 'audio_database.json');
console.log('1. Checking audio_database.json path:', dbPath);

// Create scratch audio record test
const testRecord = {
  id: 'audio_test_' + Date.now(),
  title: 'Test Audio Recording',
  province: 'Nghệ An',
  audioUrl: '/uploads/audio_test_123.mp3',
  subtitle: 'Bản ghi âm thử nghiệm phương ngữ Nghệ An',
  transcriptDialect: 'Bản ghi âm thử nghiệm phương ngữ Nghệ An',
  transcriptStandard: 'Bản ghi âm thử nghiệm tiếng phổ thông',
  speaker: 'Tester',
  verified: true,
  timestamp: new Date().toISOString()
};

let currentList = [];
if (fs.existsSync(dbPath)) {
  try {
    currentList = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  } catch (e) {
    currentList = [];
  }
}

currentList.push(testRecord);
fs.writeFileSync(dbPath, JSON.stringify(currentList, null, 2), 'utf-8');

console.log('2. Successfully wrote test record to audio_database.json.');

// Verify reading from file
const verifyList = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const found = verifyList.find(r => r.id === testRecord.id);

if (found) {
  console.log('3. Verification passed: Found record in audio_database.json:', found.title, found.audioUrl);
  // Clean up test record
  const cleanedList = verifyList.filter(r => r.id !== testRecord.id);
  fs.writeFileSync(dbPath, JSON.stringify(cleanedList, null, 2), 'utf-8');
  console.log('4. Cleaned up test record.');
} else {
  console.error('3. Verification FAILED: Test record not found!');
  process.exit(1);
}
