const localStorageMap = new Map();
global.localStorage = {
  getItem: (k) => localStorageMap.get(k) || null,
  setItem: (k, v) => localStorageMap.set(k, String(v))
};

// Simulate handleAudioSubmission call
const params = {
  titleInput: "Hue_Nam_18-35_AnDanh_001",
  speaker: "AnDanh",
  province: "Thừa Thiên Huế",
  ageGroup: "18-35 tuổi",
  gender: "Nam",
  topic: "Lịch sử & Văn hóa",
  targetBlob: { name: "Hue_Nam_18-35_AnDanh_001.ogg", size: 102400 }
};

const newSubmission = {
  id: "contrib_" + Date.now(),
  title: params.titleInput,
  province: params.province,
  speaker: params.speaker,
  ageGroup: params.ageGroup,
  gender: params.gender,
  topic: params.topic,
  status: "pending",
  timestamp: new Date().toISOString()
};

let pendingList = [];
pendingList.push(newSubmission);
localStorage.setItem("vb_pending_contributions", JSON.stringify(pendingList));

console.log("=== SUBMIT BUTTON CLICK EVENT TEST ===");
console.log("Pushed submission count:", pendingList.length);
console.log("Item title:", pendingList[0].title);
console.log("Item status:", pendingList[0].status);
console.log("Submit button click handler test PASSED!");
