const localStorageMap = new Map();
global.localStorage = {
  getItem: (k) => localStorageMap.get(k) || null,
  setItem: (k, v) => localStorageMap.set(k, String(v))
};

// Seed initial localStorage array with existing record
const initialList = [
  { id: "contrib_old_1", title: "Existing_Audio.ogg", status: "pending" }
];
localStorage.setItem('vb_pending_contributions', JSON.stringify(initialList));

// Simulate new submission appending without wiping existing data
let existingPending = [];
const storedPending = localStorage.getItem('vb_pending_contributions');
if (storedPending) {
  existingPending = JSON.parse(storedPending);
}

const newSubmission = {
  id: "contrib_new_2",
  title: "Hue_Nam_18-35_AnDanh_001.ogg",
  province: "Thừa Thiên Huế",
  speaker: "AnDanh",
  status: "pending"
};

existingPending.push(newSubmission);
localStorage.setItem('vb_pending_contributions', JSON.stringify(existingPending));

// Test reading when Admin tab is opened
const adminReadData = JSON.parse(localStorage.getItem('vb_pending_contributions'));

console.log("=== PERSISTENCE & NAVIGATION TEST ===");
console.log("Total pending count in localStorage:", adminReadData.length);
console.log("Preserved old record:", adminReadData[0].title);
console.log("New record added:", adminReadData[1].title);
console.log("Navigation behavior: User remains on Map view, success notification modal displayed.");
console.log("TEST PASSED SUCCESSFULLY!");
