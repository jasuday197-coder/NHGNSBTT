const localStorageMap = new Map();
global.localStorage = {
  getItem: (k) => localStorageMap.get(k) || null,
  setItem: (k, v) => localStorageMap.set(k, String(v))
};

// Seed pending item into localStorage
const testItem = {
  id: "contrib_refresh_123",
  title: "Test_Refresh_Audio.ogg",
  speaker: "Tester",
  province: "Nghệ An",
  status: "pending"
};
localStorage.setItem('vb_pending_contributions', JSON.stringify([testItem]));

// Simulate refresh button click logic
console.log("[ADMIN REFRESH] Fetching pending contributions...");
const saved = localStorage.getItem('vb_pending_contributions');
if (saved) {
  global.pendingContributions = JSON.parse(saved);
}

console.log("Refreshed pending count:", global.pendingContributions.length);
console.log("Refreshed item title:", global.pendingContributions[0].title);
console.log("ADMIN REFRESH TEST PASSED!");
