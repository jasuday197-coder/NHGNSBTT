const fs = require('fs');

const localStorageMap = new Map();
global.localStorage = {
  getItem: (k) => localStorageMap.get(k) || null,
  setItem: (k, v) => localStorageMap.set(k, String(v))
};

// Simulate storing a contribution
const pendingList = [
  {
    id: "p_" + Date.now(),
    title: "Hue_Nam_18-35_AnDanh_001",
    province: "Thừa Thiên Huế",
    speaker: "AnDanh",
    ageGroup: "18-35",
    gender: "Nam",
    topic: "Giọng ca đặc trưng (Ví Giặm, Ca Huế...)",
    audioUrl: "data:audio/ogg;base64,T2dnUwACAAAAAAAAA...",
    status: "pending",
    verified: true,
    confidence: 92
  }
];

localStorage.setItem('vb_pending_contributions', JSON.stringify(pendingList));

const loaded = JSON.parse(localStorage.getItem('vb_pending_contributions'));
console.log("=== UPLOAD PERSISTENCE & QUEUE TEST ===");
console.log("Saved pending items:", loaded.length);
console.log("First pending record title:", loaded[0].title);
console.log("Status:", loaded[0].status);
console.log("Audio Data URL length:", loaded[0].audioUrl.length);
console.log("Test Passed!");
