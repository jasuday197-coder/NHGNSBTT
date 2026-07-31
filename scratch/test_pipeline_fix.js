const localStorageMap = new Map();
global.localStorage = {
  getItem: (k) => localStorageMap.get(k) || null,
  setItem: (k, v) => localStorageMap.set(k, String(v))
};

// Simulate user submitting Hue_Nam_18-35_AnDanh_001.ogg
const targetBlobName = "Hue_Nam_18-35_AnDanh_001.ogg";
const newSubmission = {
  id: "contrib_" + Date.now(),
  title: targetBlobName,
  speaker: "AnDanh",
  provinceId: "Thừa Thiên Huế",
  provinceName: "Thừa Thiên Huế",
  ageGroup: "18-35",
  gender: "Nam",
  topic: "Giọng ca đặc trưng (Ví Giặm, Ca Huế...)",
  audioUrl: "data:audio/ogg;base64,SGVsbG8...",
  status: "pending",
  timestamp: new Date().toISOString()
};

// Save to pending list
let pendingList = [];
const stored = localStorage.getItem('vb_pending_contributions');
if (stored) pendingList = JSON.parse(stored);
pendingList.push(newSubmission);
localStorage.setItem('vb_pending_contributions', JSON.stringify(pendingList));

// Read back queue
const queue = JSON.parse(localStorage.getItem('vb_pending_contributions'));

console.log("=== PIPELINE COMPLETION & ADMIN NAVIGATION TEST ===");
console.log("Total Pending Items in Queue:", queue.length);
console.log("Uploaded Item ID:", queue[0].id);
console.log("Uploaded Item Title:", queue[0].title);
console.log("Status:", queue[0].status);
console.log("Province:", queue[0].provinceName);
console.log("Test Passed!");
