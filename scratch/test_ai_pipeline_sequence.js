const localStorageMap = new Map();
global.localStorage = {
  getItem: (k) => localStorageMap.get(k) || null,
  setItem: (k, v) => localStorageMap.set(k, String(v))
};

function runPipelineStepPromise(stepName, delay) {
  return new Promise((resolve) => {
    console.log(`  -> Processing AI Step: ${stepName} (${delay}ms)...`);
    setTimeout(() => {
      console.log(`  ✓ Completed AI Step: ${stepName}`);
      resolve();
    }, delay);
  });
}

async function simulateAiPipelineWorkflow() {
  console.log("=== STEP 1: Opening AI Pipeline Modal ===");
  console.log("Modal #ai-pipeline-modal opened.");

  console.log("=== STEP 2: Executing Async AI Pipeline Simulation ===");
  await runPipelineStepPromise("Chuyển tự âm thanh STT (PhoWhisper)", 100);
  await runPipelineStepPromise("Dự đoán Nhóm tuổi & Giới tính (wav2vec2)", 100);
  await runPipelineStepPromise("Xác minh độ khớp phương ngữ tỉnh đã chọn", 100);
  await runPipelineStepPromise("LLM Tự động gắn tag & tóm tắt bối cảnh", 100);

  console.log("=== STEP 3: Complete & Push Payload to Admin Queue ===");
  const newSubmission = {
    id: "contrib_" + Date.now(),
    title: "Hue_Nam_18-35_AnDanh_001.ogg",
    speaker: "AnDanh",
    province: "Thừa Thiên Huế",
    ageGroup: "18-35 tuổi",
    gender: "Nam",
    topic: "Lịch sử & Văn hóa",
    tags: ["STT_Verified", "Age_Matched", "Context_LLM"],
    status: "pending",
    timestamp: new Date().toISOString()
  };

  const list = [newSubmission];
  localStorage.setItem("vb_pending_contributions", JSON.stringify(list));
  console.log("Saved to localStorage:", JSON.parse(localStorage.getItem("vb_pending_contributions")));
  console.log("Modal closed -> Navigated to Admin tab.");
}

simulateAiPipelineWorkflow().then(() => {
  console.log("=== FULL AI PIPELINE SEQUENCE TEST PASSED! ===");
});
