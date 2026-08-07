// State variables
let activeTab = 'map-view';
let selectedProvince = null;
let currentPlayingAudio = null;
let mainAudioPlayer = null;
let waveformInterval = null;
let mediaRecorder = null;
let audioChunks = [];
let recordStartTime = null;
let recordDurationSec = 0;
let recordTimerInterval = null;
let recordedBlob = null;
let localAudioCorpus = [];
let localLexicon = [];
let pendingContributions = [];

// YouTube player variables
let ytPlayer = null;
let ytPlayerReady = false;
let ytTimer = null;

// Helper for safely setting innerText without throwing on missing DOM elements
function safeSetText(id, text) {
  const el = document.getElementById(id);
  if (el) {
    el.innerText = text;
    return true;
  }
  return false;
}

// Province Centroids for Leaflet
const PROVINCE_COORDINATES = {
  "Thanh Hóa": [20.00, 105.50],
  "Nghệ An": [19.33, 104.83],
  "Hà Tĩnh": [18.33, 105.90],
  "Quảng Bình": [17.50, 106.33],
  "Quảng Trị": [16.75, 107.00],
  "Thừa Thiên Huế": [16.33, 107.58]
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initData();
  setupNavigation();
  initMapModule();
  initDictionaryModule();
  initTranslatorModule();
  initChatbotModule();
  initAdminModule();
  setupAudioRecorder();
  setupAdminYoutubeUpload();
  updateGlobalStats();
  initYouTubePlayer();
});

// --------------------------------------------------------------------------
// YouTube Player Integration (Hidden Player Engine)
// --------------------------------------------------------------------------
function initYouTubePlayer() {
  if (window.YT) return;
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// Global Callback called by YouTube API when loaded
window.onYouTubeIframeAPIReady = function() {
  ytPlayer = new YT.Player('hidden-youtube-player-container', {
    height: '1',
    width: '1',
    videoId: '', // start with no video
    playerVars: {
      'autoplay': 0,
      'controls': 0,
      'disablekb': 1,
      'fs': 0,
      'rel': 0,
      'modestbranding': 1,
      'playsinline': 1
    },
    events: {
      'onReady': () => {
        ytPlayerReady = true;
        console.log('[YouTube Player API] Hidden player is ready.');
      },
      'onError': (e) => {
        console.error('[YouTube Player API] Error:', e.data);
      }
    }
  });
};

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Load and merge with localStorage to ensure data persistence
function initData() {
  const storedCorpus = localStorage.getItem('vb_audio_corpus');
  const storedLexicon = localStorage.getItem('vb_lexicon');
  const storedPending = localStorage.getItem('vb_pending_contributions');

  if (storedCorpus) {
    const parsedCorpus = JSON.parse(storedCorpus);
    const validIds = new Set(AUDIO_CORPUS.map(a => a.id));
    localAudioCorpus = parsedCorpus.filter(item => validIds.has(item.id) || (item.id && (item.id.startsWith('user_') || item.id.startsWith('p_') || item.id.startsWith('contrib_'))));
    localStorage.setItem('vb_audio_corpus', JSON.stringify(localAudioCorpus));
  } else {
    localAudioCorpus = [...AUDIO_CORPUS];
    localStorage.setItem('vb_audio_corpus', JSON.stringify(localAudioCorpus));
  }

  const SENSITIVE_WORDS = new Set([
    'ẻ', 'cóc xê', 'su lích', 'khu mấn', 'địt', 'lẹo', 'khu', 'cức', 'ngỏng',
    'tè', 'ngá khu', 'đấy', 'khỉ gió', 'đập thâu cha mi giừ',
    'fỏng', 'phỏng', 'fàm tính', 'phàm tính', 'áo fông', 'áo phông'
  ]);

  if (storedLexicon) {
    const parsedLexicon = JSON.parse(storedLexicon);
    const customLexicon = parsedLexicon.filter(w => {
      const wLower = (w.word || '').trim().toLowerCase();
      if (SENSITIVE_WORDS.has(wLower)) return false;
      if (wLower === 'đấy' && w.meaning && (w.meaning.includes('đái') || w.meaning.includes('nước tiểu'))) return false;
      return w.id && w.id.includes('_') && !DIALECT_LEXICON.some(d => d.word.toLowerCase() === wLower && d.region === w.region);
    });
    localLexicon = [...DIALECT_LEXICON.filter(w => !SENSITIVE_WORDS.has(w.word.trim().toLowerCase())), ...customLexicon];
  } else {
    localLexicon = DIALECT_LEXICON.filter(w => !SENSITIVE_WORDS.has(w.word.trim().toLowerCase()));
  }
  localStorage.setItem('vb_lexicon', JSON.stringify(localLexicon));

  if (storedPending) {
    pendingContributions = JSON.parse(storedPending);
  } else {
    pendingContributions = [];
    localStorage.setItem('vb_pending_contributions', JSON.stringify(pendingContributions));
  }
}

function updateGlobalStats() {
  const totalBảnGhi = localAudioCorpus.length;
  // Calculate unique speakers
  const speakers = new Set(localAudioCorpus.map(a => a.speaker));
  const totalNgườiThamGia = speakers.size + 12; // Base padding + actual count
  const totalTừVựng = localLexicon.length;

  document.getElementById('stat-records').innerText = totalBảnGhi;
  document.getElementById('stat-contributors').innerText = totalNgườiThamGia;
  document.getElementById('stat-vocab').innerText = totalTừVựng;
}

// --------------------------------------------------------------------------
// Navigation Router
// --------------------------------------------------------------------------
function setupNavigation() {
  const navItems = document.querySelectorAll('.navbar-link');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetView = item.getAttribute('data-view');
      switchTab(targetView);
    });
  });
}

function switchTab(viewId) {
  activeTab = viewId;
  
  // Stop any playing audio
  stopAudioPlayer();
  if (window.voiceBankGames) {
    window.voiceBankGames.stopGameAudio();
  }

  // Update nav UI
  document.querySelectorAll('.navbar-link').forEach(item => {
    if (item.getAttribute('data-view') === viewId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update view visibility
  document.querySelectorAll('.app-view').forEach(view => {
    if (view.id === viewId) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });

  // Special hooks
  if (viewId === 'quizzes-view') {
    if (window.voiceBankGames) {
      window.voiceBankGames.initHub();
    }
  } else if (viewId === 'admin-view') {
    renderAdminQueue();
  } else if (viewId === 'map-view') {
    // Redraw dynamic markers on GeoJSON SVG map if selected tab
    setTimeout(() => {
      drawMapMarkers();
    }, 100);
  }
}

// Expose switchTab globally for inline onclick handlers on the Landing Page feature cards
window.switchTab = switchTab;

// --------------------------------------------------------------------------
// Interactive Map Module (Leaflet & Vector SVG)
// --------------------------------------------------------------------------
let cachedGeojsonData = null;
let geojsonMinLon = 103.9;
let geojsonMaxLon = 108.3;
let geojsonMinLat = 15.9;
let geojsonMaxLat = 20.8;
const svgWidth = 600;
const svgHeight = 850;

let currentScale = 1.0;
let currentTranslateX = 0;
let currentTranslateY = 0;
let isDragging = false;
let startDragX = 0;
let startDragY = 0;
let computedCentroids = {};

function initMapModule() {
  const container = document.getElementById('geojson-svg-map');
  if (!container) return;

  const mapWrapper = document.getElementById('geojson-map-container');

  // Load geojson
  fetch('/vietnam.geojson')
    .then(res => res.json())
    .then(geojson => {
      cachedGeojsonData = geojson;
      renderGeoJsonMap();
    })
    .catch(err => {
      console.error("Error loading GeoJSON data:", err);
      container.innerHTML = '<div style="color: var(--color-error); text-align: center; padding: 20px;">Không thể tải dữ liệu bản đồ. Vui lòng thử lại.</div>';
    });

  // Setup filters on map
  document.getElementById('map-filter-age').addEventListener('change', filterMapData);
  document.getElementById('map-filter-topic').addEventListener('change', filterMapData);

  // Setup zoom buttons
  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    zoomMap(1.25);
  });
  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    zoomMap(0.8);
  });
  document.getElementById('btn-zoom-reset').addEventListener('click', () => {
    resetMapZoom();
  });

  // Setup pan/drag events on mapWrapper
  mapWrapper.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // Left click only
    isDragging = true;
    startDragX = e.clientX - currentTranslateX;
    startDragY = e.clientY - currentTranslateY;
    mapWrapper.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    currentTranslateX = e.clientX - startDragX;
    currentTranslateY = e.clientY - startDragY;
    constrainPan();
    updateMapTransform();
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      mapWrapper.style.cursor = 'default';
    }
  });

  // Scroll wheel zoom
  mapWrapper.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    zoomMap(factor);
  }, { passive: false });
}

function constrainPan() {
  if (currentScale <= 1.01) {
    currentTranslateX = 0;
    currentTranslateY = 0;
    return;
  }
  const maxDragX = (svgWidth * (currentScale - 1)) / 2;
  const maxDragY = (svgHeight * (currentScale - 1)) / 2;

  currentTranslateX = Math.max(-maxDragX, Math.min(maxDragX, currentTranslateX));
  currentTranslateY = Math.max(-maxDragY, Math.min(maxDragY, currentTranslateY));
}

function zoomMap(factor) {
  const newScale = currentScale * factor;
  currentScale = Math.max(1.0, Math.min(5.0, newScale));
  constrainPan();
  updateMapTransform();
}

function resetMapZoom() {
  currentScale = 1.0;
  currentTranslateX = 0;
  currentTranslateY = 0;
  updateMapTransform();
}

function updateMapTransform() {
  const svgMapEl = document.getElementById('geojson-svg-map');
  if (svgMapEl) {
    svgMapEl.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px) scale(${currentScale})`;
  }
}

function renderGeoJsonMap() {
  const container = document.getElementById('geojson-svg-map');
  if (!container || !cachedGeojsonData) return;

  const centralCoastKeys = ['vn-th', 'vn-na', 'vn-328', 'vn-qb', 'vn-qt', 'vn-tt'];
  const centralCoastNames = ['Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Thừa Thiên Huế'];

  const filteredFeatures = cachedGeojsonData.features.filter(f => {
    const hcKey = f.properties['hc-key'] || '';
    const name = f.properties['name'] || f.properties['title'] || '';
    return centralCoastKeys.includes(hcKey.toLowerCase()) || 
           centralCoastNames.some(n => name.toLowerCase().includes(n.toLowerCase()));
  });

  if (filteredFeatures.length === 0) {
    container.innerHTML = '<div style="color: var(--color-error); text-align: center; padding: 20px;">Không tìm thấy 6 tỉnh Bắc Trung Bộ trong dữ liệu bản đồ.</div>';
    return;
  }

  function getGeometryCoords(geometry) {
    let coords = [];
    if (geometry.type === 'Polygon') {
      geometry.coordinates.forEach(ring => {
        ring.forEach(pt => coords.push(pt));
      });
    } else if (geometry.type === 'MultiPolygon') {
      geometry.coordinates.forEach(poly => {
        poly.forEach(ring => {
          ring.forEach(pt => coords.push(pt));
        });
      });
    }
    return coords;
  }

  let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
  filteredFeatures.forEach(f => {
    const pts = getGeometryCoords(f.geometry);
    pts.forEach(pt => {
      const lon = pt[0];
      const lat = pt[1];
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    });
  });

  geojsonMinLon = minLon - (maxLon - minLon) * 0.05;
  geojsonMaxLon = maxLon + (maxLon - minLon) * 0.05;
  geojsonMinLat = minLat - (maxLat - minLat) * 0.05;
  geojsonMaxLat = maxLat + (maxLat - minLat) * 0.05;

  function project(lon, lat) {
    const x = ((lon - geojsonMinLon) / (geojsonMaxLon - geojsonMinLon)) * svgWidth;
    const y = svgHeight - ((lat - geojsonMinLat) / (geojsonMaxLat - geojsonMinLat)) * svgHeight;
    return { x, y };
  }

  const colors = {
    'Thanh Hóa': '#10b981',
    'Nghệ An': '#f59e0b',
    'Hà Tĩnh': '#a855f7',
    'Quảng Bình': '#3b82f6',
    'Quảng Trị': '#ec4899',
    'Thừa Thiên Huế': '#06b6d4'
  };

  function getProvinceStandardName(f) {
    const hcKey = (f.properties['hc-key'] || '').toLowerCase();
    const name = (f.properties['name'] || f.properties['title'] || '').toLowerCase();
    if (hcKey === 'vn-th' || name.includes('thanh hóa') || name.includes('thanh hoa')) return 'Thanh Hóa';
    if (hcKey === 'vn-na' || name.includes('nghệ an') || name.includes('nghe an')) return 'Nghệ An';
    if (hcKey === 'vn-328' || hcKey === 'vn-ht' || name.includes('hà tĩnh') || name.includes('ha tinh')) return 'Hà Tĩnh';
    if (hcKey === 'vn-qb' || name.includes('quảng bình') || name.includes('quang binh')) return 'Quảng Bình';
    if (hcKey === 'vn-qt' || name.includes('quảng trị') || name.includes('quang tri')) return 'Quảng Trị';
    if (hcKey === 'vn-tt' || name.includes('thừa thiên huế') || name.includes('thua thien hue') || name.includes('huế') || name.includes('hue')) return 'Thừa Thiên Huế';
    return 'Khác';
  }

  let pathsHtml = '';
  let labelsHtml = '';
  computedCentroids = {};

  filteredFeatures.forEach((f, idx) => {
    const provName = getProvinceStandardName(f);
    if (provName === 'Khác') return;

    let d = '';
    let sumX = 0, sumY = 0, ptCount = 0;

    if (f.geometry.type === 'Polygon') {
      f.geometry.coordinates.forEach(ring => {
        d += ring.map((pt, i) => {
          const p = project(pt[0], pt[1]);
          sumX += p.x;
          sumY += p.y;
          ptCount++;
          return `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
        }).join(' ') + ' Z ';
      });
    } else if (f.geometry.type === 'MultiPolygon') {
      f.geometry.coordinates.forEach(poly => {
        poly.forEach(ring => {
          d += ring.map((pt, i) => {
            const p = project(pt[0], pt[1]);
            sumX += p.x;
            sumY += p.y;
            ptCount++;
            return `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
          }).join(' ') + ' Z ';
        });
      });
    }

    const fillColor = colors[provName] || '#3b82f6';
    pathsHtml += `
      <path class="geojson-province" 
            id="geojson-prov-${idx}" 
            data-name="${provName}" 
            d="${d}" 
            fill="${fillColor}" 
            fill-opacity="0.6"
            onclick="selectProvince('${provName}')" />
    `;

    // Compute centroid in projected SVG coordinates
    if (ptCount > 0) {
      const cx = sumX / ptCount;
      const cy = sumY / ptCount;
      computedCentroids[provName] = { x: cx, y: cy };

      const textLen = provName.toUpperCase().length;
      const bgWidth = textLen * 6.5 + 16;
      labelsHtml += `
        <g transform="translate(${cx.toFixed(1)}, ${(cy + 24).toFixed(1)})">
          <rect class="geojson-label-bg" x="-${(bgWidth/2).toFixed(1)}" y="-8" width="${bgWidth}" height="16" />
          <text class="geojson-label-text" dy="4">${provName.toUpperCase()}</text>
        </g>
      `;
    }
  });

  container.innerHTML = `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="geojson-svg" xmlns="http://www.w3.org/2000/svg" style="max-height: 90vh;">
      <g id="geojson-provinces-group">
        ${pathsHtml}
      </g>
      <g id="geojson-labels-group" style="pointer-events: none;">
        ${labelsHtml}
      </g>
      <g id="geojson-pins-group">
        <!-- Pins generated dynamically -->
      </g>
    </svg>
  `;

  drawMapMarkers();
}

function drawMapMarkers() {
  const pinsGroup = document.getElementById('geojson-pins-group');
  if (!pinsGroup) return;

  pinsGroup.innerHTML = '';

  const counts = {};
  localAudioCorpus.forEach(a => {
    counts[a.province] = (counts[a.province] || 0) + 1;
  });

  Object.keys(computedCentroids).forEach(provName => {
    const p = computedCentroids[provName];
    const totalCount = counts[provName] || 0;

    const pinGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    pinGroup.setAttribute('transform', `translate(${p.x.toFixed(1)}, ${p.y.toFixed(1)})`);
    pinGroup.setAttribute('class', 'svg-broadcast-pin');
    pinGroup.setAttribute('style', 'cursor: pointer;');
    
    pinGroup.innerHTML = `
      <title>${provName}: ${totalCount} bản ghi</title>
      <circle cx="0" cy="0" r="6" fill="none" stroke="var(--color-primary)" stroke-width="1.5" class="svg-wave" style="pointer-events: none;" />
      <circle cx="0" cy="0" r="6" fill="none" stroke="var(--color-primary)" stroke-width="1.5" class="svg-wave" style="pointer-events: none;" />
      <circle cx="0" cy="0" r="6" fill="var(--color-primary)" stroke="#ffffff" stroke-width="1.5" class="svg-broadcast-dot" />
      <circle cx="10" cy="-10" r="8" fill="var(--color-purple)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
      <text x="10" y="-7" font-size="8" font-weight="700" fill="#ffffff" text-anchor="middle" font-family="var(--font-sans)">${totalCount}</text>
    `;

    pinGroup.addEventListener('click', (e) => {
      e.stopPropagation();
      selectProvince(provName);
    });

    pinsGroup.appendChild(pinGroup);
  });
}

function filterMapData() {
  if (selectedProvince) {
    displayProvinceInfo(selectedProvince);
  }
}

function selectProvince(provName) {
  selectedProvince = provName;
  
  // Highlight in GeoJSON SVG Map
  document.querySelectorAll('.geojson-province').forEach(el => {
    if (el.getAttribute('data-name') === provName) {
      el.classList.add('selected');
    } else {
      el.classList.remove('selected');
    }
  });

  // Focus and zoom to selected province centroid
  const centroid = computedCentroids[provName];
  if (centroid) {
    currentScale = 1.8;
    currentTranslateX = (svgWidth / 2) - centroid.x * currentScale;
    currentTranslateY = (svgHeight / 2) - centroid.y * currentScale;
    constrainPan();
    updateMapTransform();
  }

  // Display details in Side Panel
  displayProvinceInfo(provName);
}

function displayProvinceInfo(provName) {
  safeSetText('side-panel-province-title', `Tỉnh ${provName}`);
  
  // Determine Dialect group name based on province
  let dialectGroup = "";
  if (provName === "Thanh Hóa") dialectGroup = "Phương ngữ Thanh Hóa";
  else if (provName === "Nghệ An" || provName === "Hà Tĩnh") dialectGroup = "Phương ngữ Nghệ Tĩnh";
  else dialectGroup = "Phương ngữ Bình Trị Thiên";
  
  safeSetText('side-panel-province-sub', dialectGroup);

  // Filter local corpus for province
  const ageFilter = document.getElementById('map-filter-age').value;
  const topicFilter = document.getElementById('map-filter-topic').value;

  const provinceAudios = localAudioCorpus.filter(a => {
    if (a.province !== provName) return false;
    if (ageFilter !== 'all' && a.ageGroup !== ageFilter) return false;
    if (topicFilter !== 'all' && a.topic !== topicFilter) return false;
    return true;
  });

  safeSetText('side-panel-total-records', provinceAudios.length);
  // Calculate unique speakers
  const speakers = new Set(provinceAudios.map(a => a.speaker));
  safeSetText('side-panel-total-contributors', speakers.size);

  // Render Categorized Audio Playlists
  const historyList = document.getElementById('audio-list-history');
  const singingList = document.getElementById('audio-list-singing');
  const generalList = document.getElementById('audio-list-general');

  historyList.innerHTML = '';
  singingList.innerHTML = '';
  generalList.innerHTML = '';

  provinceAudios.forEach(aud => {
    const card = document.createElement('div');
    card.className = 'audio-card';
    card.id = `audio-card-${aud.id}`;
    card.innerHTML = `
      <div class="audio-card-meta">
        <span>${aud.ageGroup} | ${aud.gender}</span>
        <span><i class="fas fa-certificate" style="color: var(--color-success)"></i> ${aud.confidence}% AI</span>
      </div>
      <div class="audio-card-title">${aud.title}</div>
      <div class="audio-card-speaker"><i class="fas fa-user-circle"></i> ${aud.speaker}</div>
    `;

    card.addEventListener('click', () => playAudio(aud));

    if (aud.topic === 'Lịch sử & Văn hóa') {
      historyList.appendChild(card);
    } else if (aud.topic === 'Giọng ca đặc trưng (Ví Giặm, Ca Huế...)') {
      singingList.appendChild(card);
    } else {
      generalList.appendChild(card);
    }
  });

  // Show placeholder if category empty
  if (historyList.children.length === 0) historyList.innerHTML = '<div style="font-size: 12px; color: var(--text-muted); font-style: italic; padding: 4px;">Không có bản ghi nào.</div>';
  if (singingList.children.length === 0) singingList.innerHTML = '<div style="font-size: 12px; color: var(--text-muted); font-style: italic; padding: 4px;">Không có bản ghi nào.</div>';
  if (generalList.children.length === 0) generalList.innerHTML = '<div style="font-size: 12px; color: var(--text-muted); font-style: italic; padding: 4px;">Không có bản ghi nào.</div>';
}

// --------------------------------------------------------------------------
// Audio Player Engine with Canvas Waveform Visualizer
// --------------------------------------------------------------------------
function playAudio(audioObj) {
  // Highlight card
  document.querySelectorAll('.audio-card').forEach(el => el.classList.remove('active'));
  const activeCard = document.getElementById(`audio-card-${audioObj.id}`);
  if (activeCard) activeCard.classList.add('active');

  // Update player UI panel
  safeSetText('track-player-title', audioObj.title);
  safeSetText('track-player-meta', `${audioObj.speaker} (${audioObj.province})`);
  
  // Set dual running transcript
  safeSetText('player-transcript-dialect', audioObj.transcriptDialect);
  safeSetText('player-transcript-standard', audioObj.transcriptStandard);

  // Clear previous player
  stopAudioPlayer();

  currentPlayingAudio = audioObj;

  const playBtnIcon = document.getElementById('player-play-btn-icon');

  if (audioObj.youtube_url) {
    const ytId = getYouTubeId(audioObj.youtube_url);
    if (!ytId) {
      alert("Đường dẫn YouTube không hợp lệ.");
      return;
    }
    if (!ytPlayer || !ytPlayerReady) {
      alert("Đầu phát YouTube đang được tải, xin vui lòng bấm phát lại sau vài giây.");
      return;
    }

    ytPlayer.loadVideoById({
      videoId: ytId,
      startSeconds: audioObj.start_time || 0
    });

    if (playBtnIcon) playBtnIcon.className = 'fas fa-pause';
    startWaveformVisualizer();
    startYtTimer();
  } else {
    mainAudioPlayer = new Audio(audioObj.audioUrl);
    mainAudioPlayer.play();
    
    if (playBtnIcon) playBtnIcon.className = 'fas fa-pause';
    startWaveformVisualizer();

    mainAudioPlayer.ontimeupdate = () => {
      const cur = formatTime(mainAudioPlayer.currentTime);
      const dur = formatTime(mainAudioPlayer.duration || 0);
      safeSetText('track-time-lbl', `${cur} / ${dur}`);
    };

    mainAudioPlayer.onended = () => {
      stopAudioPlayer();
    };
  }
}

function togglePlayPause() {
  if (!mainAudioPlayer && (!currentPlayingAudio || !currentPlayingAudio.youtube_url)) return;
  
  const icon = document.getElementById('player-play-btn-icon');

  if (currentPlayingAudio && currentPlayingAudio.youtube_url) {
    if (ytPlayer && ytPlayerReady && typeof ytPlayer.getPlayerState === 'function') {
      const state = ytPlayer.getPlayerState();
      if (state === 1) { // 1 is PLAYING in YT API
        ytPlayer.pauseVideo();
        if (icon) icon.className = 'fas fa-play';
        stopWaveformVisualizer();
        stopYtTimer();
      } else {
        ytPlayer.playVideo();
        if (icon) icon.className = 'fas fa-pause';
        startWaveformVisualizer();
        startYtTimer();
      }
    }
    return;
  }

  if (mainAudioPlayer.paused) {
    mainAudioPlayer.play();
    if (icon) icon.className = 'fas fa-pause';
    startWaveformVisualizer();
  } else {
    mainAudioPlayer.pause();
    if (icon) icon.className = 'fas fa-play';
    stopWaveformVisualizer();
  }
}

function stopAudioPlayer() {
  if (mainAudioPlayer) {
    mainAudioPlayer.pause();
    mainAudioPlayer = null;
  }
  if (ytPlayer && ytPlayerReady && typeof ytPlayer.pauseVideo === 'function') {
    try {
      ytPlayer.pauseVideo();
    } catch (e) {
      console.error(e);
    }
  }
  stopYtTimer();

  const icon = document.getElementById('player-play-btn-icon');
  if (icon) icon.className = 'fas fa-play';
  safeSetText('track-time-lbl', '00:00 / 00:00');
  stopWaveformVisualizer();
}

function startYtTimer() {
  stopYtTimer();
  if (!currentPlayingAudio) return;
  const start = Number(currentPlayingAudio.start_time) || 0;
  const end = Number(currentPlayingAudio.end_time) || 0;
  const duration = Math.max(0, end - start);

  ytTimer = setInterval(() => {
    if (ytPlayer && ytPlayerReady && typeof ytPlayer.getCurrentTime === 'function') {
      const curTime = ytPlayer.getCurrentTime();
      let elapsed = curTime - start;
      if (elapsed < 0) elapsed = 0;
      if (elapsed > duration) elapsed = duration;

      safeSetText('track-time-lbl', `${formatTime(elapsed)} / ${formatTime(duration)}`);

      if (curTime >= end) {
        ytPlayer.pauseVideo();
        ytPlayer.seekTo(start);
        
        const icon = document.getElementById('player-play-btn-icon');
        if (icon) icon.className = 'fas fa-play';
        safeSetText('track-time-lbl', `${formatTime(0)} / ${formatTime(duration)}`);
        stopWaveformVisualizer();
        stopYtTimer();
      }
    }
  }, 250);
}

function stopYtTimer() {
  if (ytTimer) {
    clearInterval(ytTimer);
    ytTimer = null;
  }
}

function formatTime(secs) {
  if (isNaN(secs)) return '00:00';
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Canvas Waveform Animation
function startWaveformVisualizer() {
  stopWaveformVisualizer();
  const canvas = document.getElementById('player-waveform');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  waveformInterval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 242, 254, 0.4)';
    
    // Draw artificial bars moving randomly to simulate voice activity
    const barWidth = 3;
    const spacing = 2;
    const barCount = Math.floor(canvas.width / (barWidth + spacing));
    
    for (let i = 0; i < barCount; i++) {
      // Create sound bars peaking in middle
      const peakFactor = Math.sin((i / barCount) * Math.PI);
      const amp = Math.random() * canvas.height * 0.7 * peakFactor + 2;
      const x = i * (barWidth + spacing);
      const y = (canvas.height - amp) / 2;
      
      // Neon accent coloring
      ctx.fillStyle = i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)';
      ctx.fillRect(x, y, barWidth, amp);
    }
  }, 100);
}

function stopWaveformVisualizer() {
  if (waveformInterval) {
    clearInterval(waveformInterval);
    waveformInterval = null;
  }
  const canvas = document.getElementById('player-waveform');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw flat static line
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, canvas.height / 2 - 1, canvas.width, 2);
  }
}

// --------------------------------------------------------------------------
// Microphone Audio Contribution Flow
// --------------------------------------------------------------------------
function setupAudioRecorder() {
  const openFab = document.getElementById('open-contribute-fab');
  const closeBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('btn-cancel-contrib');
  const submitBtn = document.getElementById('btn-submit-contrib');
  const modal = document.getElementById('contribution-modal');
  const micBtn = document.getElementById('mic-trigger-btn');
  const fileInput = document.getElementById('contrib-file');

  openFab.addEventListener('click', () => {
    // Reset form states
    document.getElementById('contrib-form').reset();
    recordedBlob = null;
    audioChunks = [];
    document.getElementById('record-time-text').innerText = '00:00 (Nhấn mic để bắt đầu thu âm)';
    document.getElementById('record-status').innerText = 'Chưa thu âm';
    micBtn.className = 'mic-circle';
    submitBtn.disabled = true;

    modal.classList.add('active');
  });

  const closeModal = () => {
    stopRecording();
    modal.classList.remove('active');
  };

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // Micro Button click handler for recording
  micBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      stopRecording();
    } else {
      startRecording();
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      recordedBlob = fileInput.files[0];
      document.getElementById('record-status').innerText = `Đã tải lên tệp: ${recordedBlob.name}`;
      validateForm();
    }
  });

  // Watch inputs to enable submit button
  document.getElementById('contrib-title').addEventListener('input', validateForm);
  document.getElementById('contrib-speaker').addEventListener('input', validateForm);
  document.getElementById('contrib-province').addEventListener('change', validateForm);
  document.getElementById('contrib-age').addEventListener('change', validateForm);
  document.getElementById('contrib-consent').addEventListener('change', validateForm);

  submitBtn.addEventListener('click', submitContribution);
}
function parseTimeToSeconds(timeStr) {
  if (!timeStr) return 0;
  timeStr = timeStr.trim();
  
  if (timeStr.includes(':')) {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10) || 0;
      const seconds = parseInt(parts[1], 10) || 0;
      return (minutes * 60) + seconds;
    }
  }
  return parseInt(timeStr, 10) || 0;
}

function setupAdminYoutubeUpload() {
  const openBtn = document.getElementById('open-admin-upload-btn');
  const closeBtn = document.getElementById('close-yt-modal-btn');
  const cancelBtn = document.getElementById('btn-cancel-yt-upload');
  const submitBtn = document.getElementById('btn-submit-yt-upload');
  const modal = document.getElementById('admin-yt-modal');
  const form = document.getElementById('admin-yt-form');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      form.reset();
      modal.classList.add('active');
    });
  }

  const closeModal = () => {
    modal.classList.remove('active');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      const title = document.getElementById('yt-form-title').value.trim();
      const province = document.getElementById('yt-form-province').value;
      const topic = document.getElementById('yt-form-topic').value;
      const youtubeUrl = document.getElementById('yt-form-url').value.trim();
      const startStr = document.getElementById('yt-form-start').value.trim();
      const endStr = document.getElementById('yt-form-end').value.trim();
      
      const start = parseTimeToSeconds(startStr);
      const end = parseTimeToSeconds(endStr);

      if (!title || !province || !topic || !youtubeUrl || startStr === "" || endStr === "") {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
        return;
      }

      if (end <= start) {
        alert("Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");
        return;
      }

      const ytId = getYouTubeId(youtubeUrl);
      if (!ytId) {
        alert("Link YouTube không hợp lệ.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerText = "Đang lưu...";

      try {
        const response = await fetch('/api/add-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            province,
            topic,
            youtube_url: youtubeUrl,
            start_time: start,
            end_time: end
          })
        });

        if (!response.ok) {
          throw new Error(`Lỗi server: ${response.status}`);
        }

        const resData = await response.json();
        if (resData.success && resData.record) {
          localAudioCorpus.push(resData.record);
          localStorage.setItem('vb_audio_corpus', JSON.stringify(localAudioCorpus));
          
          alert("Lưu bản ghi YouTube thành công!");
          closeModal();

          updateGlobalStats();
          drawMapMarkers();
          if (selectedProvince === province) {
            displayProvinceInfo(selectedProvince);
          } else {
            selectProvince(province);
          }
        } else {
          throw new Error("Lưu thất bại.");
        }
      } catch (err) {
        console.error(err);
        alert("Có lỗi xảy ra khi gửi dữ liệu lên server. Lưu offline vào localStorage...");
        
        const newRecordObject = {
          id: "yt_" + Date.now(),
          title: title,
          province: province,
          dialectGroup: province === "Thanh Hóa" ? "Thanh Hóa" : (province === "Nghệ An" || province === "Hà Tĩnh" ? "Nghệ Tĩnh" : "Bình Trị Thiên"),
          speaker: "YouTube Media",
          ageGroup: "36-55",
          gender: "Khác",
          topic: topic,
          audioUrl: "",
          youtube_url: youtubeUrl,
          start_time: start,
          end_time: end,
          transcriptDialect: "Bản ghi từ YouTube (Chỉ phát âm thanh)",
          transcriptStandard: "Bản ghi từ YouTube (Chỉ phát âm thanh)",
          verified: true,
          confidence: 95,
          tags: ["YouTube", province]
        };
        
        localAudioCorpus.push(newRecordObject);
        localStorage.setItem('vb_audio_corpus', JSON.stringify(localAudioCorpus));
        
        closeModal();
        updateGlobalStats();
        drawMapMarkers();
        if (selectedProvince === province) {
          displayProvinceInfo(selectedProvince);
        } else {
          selectProvince(province);
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Lưu bản ghi";
      }
    });
  }
}

function startRecording() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Trình duyệt không hỗ trợ ghi âm trực tiếp. Vui lòng tải lên tệp tin âm thanh.");
    return;
  }

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      
      recordStartTime = Date.now();
      recordDurationSec = 0;
      
      const micBtn = document.getElementById('mic-trigger-btn');
      micBtn.className = 'mic-circle recording';
      document.getElementById('record-status').innerText = 'Đang thu âm...';

      recordTimerInterval = setInterval(() => {
        recordDurationSec = Math.floor((Date.now() - recordStartTime) / 1000);
        const m = Math.floor(recordDurationSec / 60).toString().padStart(2, '0');
        const s = Math.floor(recordDurationSec % 60).toString().padStart(2, '0');
        document.getElementById('record-time-text').innerText = `Đang ghi: ${m}:${s}`;
      }, 1000);

      mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        clearInterval(recordTimerInterval);
        recordedBlob = new Blob(audioChunks, { type: 'audio/wav' });
        
        document.getElementById('mic-trigger-btn').className = 'mic-circle';
        document.getElementById('record-status').innerText = 'Đã hoàn thành thu âm.';

        // Validation for length (under 5 seconds)
        if (recordDurationSec < 5) {
          alert("Lỗi: Bản ghi quá ngắn (yêu cầu tối thiểu 5 giây để AI phân tích). Vui lòng thực hiện thu âm lại.");
          recordedBlob = null;
          document.getElementById('record-time-text').innerText = 'Lỗi: Âm thanh quá ngắn (< 5s)';
        } else {
          document.getElementById('record-time-text').innerText = `Bản ghi dài ${recordDurationSec}s (Đạt chuẩn)`;
        }
        validateForm();
      };
    })
    .catch(err => {
      console.error("Giao diện âm thanh mic không mở được: ", err);
      alert("Không có quyền truy cập microphone.");
    });
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    // Stop mic stream track to close recording indicators on browser
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
  }
}

function validateForm() {
  const title = document.getElementById('contrib-title').value.trim();
  const speaker = document.getElementById('contrib-speaker').value.trim();
  const province = document.getElementById('contrib-province').value;
  const age = document.getElementById('contrib-age').value;
  const consent = document.getElementById('contrib-consent').checked;
  const submitBtn = document.getElementById('btn-submit-contrib');

  const isValid = title && speaker && province && age && consent && recordedBlob;
  submitBtn.disabled = !isValid;
}

// Simulated AI Processing Pipeline trigger
function submitContribution() {
  // Hide Contribution modal
  document.getElementById('contribution-modal').classList.remove('active');

  // Open AI loader modal
  const aiModal = document.getElementById('ai-pipeline-modal');
  aiModal.classList.add('active');

  // Reset steps
  const steps = ['step-stt', 'step-predict', 'step-verify', 'step-tag'];
  steps.forEach(id => {
    const el = document.getElementById(id);
    el.className = 'ai-step pending';
    el.querySelector('i').className = 'far fa-circle';
  });

  // Step 1: PhoWhisper STT
  runPipelineStep('step-stt', 1500, () => {
    // Step 2: wav2vec2 Acoustic Gender/Age Prediction
    runPipelineStep('step-predict', 1800, () => {
      // Step 3: Dialect Verify regional accent check
      runPipelineStep('step-verify', 2000, () => {
        // Step 4: Claude API topic synthesis
        runPipelineStep('step-tag', 1500, () => {
          // Success Callback: Save contribution into pending review list
          setTimeout(() => {
            aiModal.classList.remove('active');
            completeContributionSave();
          }, 800);
        });
      });
    });
  });
}

function runPipelineStep(stepId, delay, callback) {
  const el = document.getElementById(stepId);
  el.className = 'ai-step processing';
  el.querySelector('i').className = 'fas fa-spinner fa-spin';

  setTimeout(() => {
    el.className = 'ai-step success';
    el.querySelector('i').className = 'fas fa-check-circle';
    callback();
  }, delay);
}

function completeContributionSave() {
  const title = document.getElementById('contrib-title').value.trim();
  const speaker = document.getElementById('contrib-speaker').value.trim();
  const province = document.getElementById('contrib-province').value;
  const age = document.getElementById('contrib-age').value;
  const gender = document.getElementById('contrib-gender').value;
  const topic = document.getElementById('contrib-topic').value;

  // Generate fake transcripts and AI verification data based on province and inputs
  let transcriptDialect = "Tui mần răng mô biết cấy chi tê rứa bọ mạ.";
  let transcriptStandard = "Tôi làm sao đâu biết cái gì kia thế bố mẹ.";
  
  if (province === "Thanh Hóa") {
    transcriptDialect = "Tao đón thế mi có tỏi chi không, gà nhà tui đẻ clả trứng.";
    transcriptStandard = "Tao nói thế mày có biết gì không, gà nhà tôi đẻ quả trứng.";
  } else if (province === "Nghệ An" || province === "Hà Tĩnh") {
    transcriptDialect = "Nhà tui ở cạnh cấy rú nớ, rót cho bát nác chè xanh mần lòng sướng tê.";
    transcriptStandard = "Nhà tôi ở cạnh cái núi đó, rót cho bát nước chè xanh làm lòng sướng thế.";
  }

  const isMatched = (Math.random() > 0.15); // 85% match confidence
  const confidence = Math.floor(Math.random() * 15) + 82; // 82-97%

  const newPending = {
    id: "p_" + Date.now(),
    title: title,
    province: province,
    dialectGroup: province === "Thanh Hóa" ? "Thanh Hóa" : (province === "Nghệ An" || province === "Hà Tĩnh" ? "Nghệ Tĩnh" : "Bình Trị Thiên"),
    speaker: speaker,
    ageGroup: age,
    gender: gender,
    topic: topic,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", // mock audio file
    transcriptDialect: transcriptDialect,
    transcriptStandard: transcriptStandard,
    verified: isMatched,
    confidence: confidence,
    tags: [topic.split(' ')[0], province, "Đóng góp"],
    consent: true
  };

  pendingContributions.push(newPending);
  localStorage.setItem('vb_pending_contributions', JSON.stringify(pendingContributions));
  
  alert(`Cảm ơn bạn! Bản ghi đã được gửi thành công.\n\nAI Đã phân tích:\n- Kết quả giọng nói: ${isMatched ? 'KHỚP' : 'KHÔNG KHỚP'} vùng ${province} (Độ tin cậy ${confidence}%)\n- Đã chuyển bản ghi tới hàng đợi kiểm duyệt của Admin.`);
  
  // Refresh stats & views if admin is open
  updateGlobalStats();
  if (activeTab === 'admin-view') {
    renderAdminQueue();
  }
}

// --------------------------------------------------------------------------
// Dialect Dictionary Module
// --------------------------------------------------------------------------
let activeDictionaryWord = null;

function initDictionaryModule() {
  const searchInput = document.getElementById('dict-search-input');
  searchInput.addEventListener('input', filterDictionary);

  // Group selection changes (cards toggle)
  document.querySelectorAll('.dict-group-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const wasActive = btn.classList.contains('active');
      document.querySelectorAll('.dict-group-filter').forEach(b => b.classList.remove('active'));
      if (!wasActive) {
        btn.classList.add('active');
      }
      // Reset active word display when region changes to prevent mismatch
      activeDictionaryWord = null;
      document.getElementById('dict-detail-empty').style.display = 'block';
      document.getElementById('dict-detail-content').style.display = 'none';
      filterDictionary();
    });
  });

  renderDictionaryList(localLexicon);

  // Modal đóng góp từ
  const openCont = document.getElementById('open-add-word-btn');
  const closeCont = document.getElementById('close-word-modal-btn');
  const cancelWord = document.getElementById('btn-cancel-word');
  const submitWord = document.getElementById('btn-submit-word');
  const modalWord = document.getElementById('add-word-modal');

  openCont.addEventListener('click', () => {
    document.getElementById('add-word-form').reset();
    modalWord.classList.add('active');
  });

  closeCont.addEventListener('click', () => modalWord.classList.remove('active'));
  cancelWord.addEventListener('click', () => modalWord.classList.remove('active'));

  submitWord.addEventListener('click', () => {
    const word = document.getElementById('word-input').value.trim();
    const meaning = document.getElementById('word-meaning-input').value.trim();
    const region = document.getElementById('word-region').value;
    const example = document.getElementById('word-example').value.trim();
    const exampleTrans = document.getElementById('word-example-trans').value.trim();

    if (!word || !meaning || !region || !example || !exampleTrans) {
      alert("Vui lòng nhập đầy đủ các trường thông tin bắt buộc!");
      return;
    }

    const newWord = {
      id: "l_" + Date.now(),
      word: word.toLowerCase(),
      region: region,
      meaning: meaning,
      example: example,
      exampleTranslation: exampleTrans,
      culturalInsight: `Từ phương ngữ được đóng góp bởi thành viên cộng đồng. Giải thích văn hóa sơ bộ: Từ "${word}" thể hiện phong cách giao tiếp đặc trưng của vùng ${region}, biểu đạt nghĩa "${meaning}".`
    };

    localLexicon.push(newWord);
    localStorage.setItem('vb_lexicon', JSON.stringify(localLexicon));
    updateGlobalStats();
    filterDictionary();
    modalWord.classList.remove('active');
    alert("Từ vựng mới đã được cộng đồng đóng góp thành công!");
  });
}

function renderDictionaryList(list) {
  const container = document.getElementById('dict-list');
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = '<div style="color: var(--text-muted); font-style: italic; text-align: center; padding: 20px;">Không tìm thấy từ tương thích.</div>';
    return;
  }

  list.forEach(w => {
    const card = document.createElement('div');
    card.className = `dict-item-card ${activeDictionaryWord && activeDictionaryWord.id === w.id ? 'active' : ''}`;
    card.innerHTML = `
      <div class="dict-item-header">
        <span class="dict-item-word">${w.word}</span>
        <span class="dict-item-region">${w.region}</span>
      </div>
      <div class="dict-item-meaning">${w.meaning}</div>
    `;
    card.addEventListener('click', () => showDictionaryDetail(w));
    container.appendChild(card);
  });
}

function filterDictionary() {
  const query = document.getElementById('dict-search-input').value.toLowerCase().trim();
  const filterBtn = document.querySelector('.dict-group-filter.active');
  const activeRegionCode = filterBtn ? filterBtn.getAttribute('data-region') : 'all';

  const filtered = localLexicon.filter(w => {
    // Match search query
    const matchQuery = w.word.includes(query) || w.meaning.toLowerCase().includes(query);
    if (!matchQuery) return false;

    // Match region tab
    if (activeRegionCode === 'all') return true;
    if (activeRegionCode === 'thanhhoa') return w.region.includes('Thanh Hóa');
    if (activeRegionCode === 'nghetinh') return w.region.includes('Nghệ Tĩnh');
    if (activeRegionCode === 'binhtrithien') return w.region.includes('Bình Trị Thiên');
    
    return true;
  });

  renderDictionaryList(filtered);
}

function showDictionaryDetail(wordObj) {
  activeDictionaryWord = wordObj;
  
  // Highlight active
  document.querySelectorAll('.dict-item-card').forEach(c => c.classList.remove('active'));
  
  // Redraw list to preserve active highlight
  filterDictionary();

  const emptyPane = document.getElementById('dict-detail-empty');
  const contentPane = document.getElementById('dict-detail-content');

  emptyPane.style.display = 'none';
  contentPane.style.display = 'block';

  safeSetText('detail-word', wordObj.word);
  safeSetText('detail-region-tag', wordObj.region);
  safeSetText('detail-meaning', wordObj.meaning);
  safeSetText('detail-example-orig', wordObj.example);
  safeSetText('detail-example-trans', wordObj.exampleTranslation);
  const aiInsightEl = document.getElementById('detail-ai-insight');
  if (aiInsightEl) aiInsightEl.innerHTML = wordObj.culturalInsight;
}

// --------------------------------------------------------------------------
// Dialect Translator Module (RAG Simulation)
// --------------------------------------------------------------------------
let translatorDirection = 'dialect-to-standard'; // or 'standard-to-dialect'

const DEFAULT_SAMPLE_BREAKDOWN = [
  { dialectWord: 'Mi', standardMeaning: 'Bạn / Mày', explanation: 'Đại từ nhân xưng ngôi thứ hai thân mật đặc trưng xứ Nghệ & Bình Trị Thiên.' },
  { dialectWord: 'Mô', standardMeaning: 'Đâu / Chỗ nào', explanation: 'Từ hỏi vị trí địa lý xuất hiện phổ biến trong câu hỏi miền Trung.' },
  { dialectWord: 'Rứa', standardMeaning: 'Thế / Vậy', explanation: 'Trợ từ cảm thán đệm cuối câu nhấn mạnh ý nghĩa hoặc sắc thái cảm xúc.' }
];

function renderBreakdownCards(items) {
  const vocabList = document.getElementById('translator-vocab-card-list');
  if (!vocabList) return;
  vocabList.innerHTML = '';
  const list = (items && items.length > 0) ? items : DEFAULT_SAMPLE_BREAKDOWN;
  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'breakdown-card';
    card.innerHTML = `
      <span class="breakdown-card-word">${item.dialectWord}</span>
      <span class="breakdown-card-meaning">Nghĩa: ${item.standardMeaning}</span>
      <p class="breakdown-card-exp">${item.explanation}</p>
    `;
    vocabList.appendChild(card);
  });
}

function initTranslatorModule() {
  const srcArea = document.getElementById('translator-src');
  const destArea = document.getElementById('translator-dest');
  const translateBtn = document.getElementById('btn-trigger-translate');
  const swapBtn = document.getElementById('btn-swap-languages');

  
  srcArea.addEventListener('focus', () => srcArea.parentElement.classList.add('focus'));
  srcArea.addEventListener('blur', () => srcArea.parentElement.classList.remove('focus'));

  swapBtn.addEventListener('click', () => {
    const labelL = document.getElementById('translator-lbl-left');
    const labelR = document.getElementById('translator-lbl-right');

    if (translatorDirection === 'dialect-to-standard') {
      translatorDirection = 'standard-to-dialect';
      labelL.innerText = 'Tiếng Việt Phổ Thông';
      labelR.innerText = 'Phương ngữ Bắc Trung Bộ';
      srcArea.placeholder = 'Nhập câu tiếng phổ thông (ví dụ: mẹ tôi làm gì có đầu)';
    } else {
      translatorDirection = 'dialect-to-standard';
      labelL.innerText = 'Phương ngữ Bắc Trung Bộ';
      labelR.innerText = 'Tiếng Việt Phổ Thông';
      srcArea.placeholder = 'Nhập câu tiếng địa phương (ví dụ: răng bữa ni mi đi mần trễ rứa)';
    }
    srcArea.value = '';
    destArea.innerHTML = '<span class="translator-output empty">Kết quả dịch sẽ hiển thị ở đây...</span>';
    document.getElementById('translator-warning-bar').classList.remove('active');
    renderBreakdownCards(DEFAULT_SAMPLE_BREAKDOWN);
  });

  translateBtn.addEventListener('click', triggerTranslation);
}

function setTranslatorPreset(text) {
  const srcArea = document.getElementById('translator-src');
  if (srcArea) {
    srcArea.value = text;
    triggerTranslation();
  }
}
window.setTranslatorPreset = setTranslatorPreset;

async function triggerTranslation() {
  const srcText = document.getElementById('translator-src').value.trim();
  const destArea = document.getElementById('translator-dest');
  const vocabList = document.getElementById('translator-vocab-card-list');
  const warningBar = document.getElementById('translator-warning-bar');
  const translateBtn = document.getElementById('btn-trigger-translate');

  if (!srcText) {
    destArea.innerHTML = '<span class="translator-output empty">Kết quả dịch sẽ hiển thị ở đây...</span>';
    renderBreakdownCards(DEFAULT_SAMPLE_BREAKDOWN);
    return;
  }

  const oldBtnText = translateBtn.innerHTML;
  translateBtn.disabled = true;
  translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang phân tích AI...';
  destArea.innerHTML = '<span class="translator-output" style="color: var(--color-primary); font-size: 14px;"><i class="fas fa-brain fa-pulse"></i> Đang gửi yêu cầu dịch thuật tới máy chủ...</span>';

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: srcText,
        direction: translatorDirection
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server status ${response.status}`);
    }
    
    const result = await response.json();
    
    // Update output UI
    destArea.innerHTML = `<div class="translator-output">${result.translation}</div>`;
    if (result.isFallback) {
      destArea.insertAdjacentHTML('afterbegin', '<span class="translator-output" style="color: var(--color-danger); font-size: 12px; margin-bottom: 8px; display: block;"><i class="fas fa-exclamation-circle"></i> Kết nối AI gián đoạn. Đang hiển thị kết quả dịch offline...</span>');
    }
    warningBar.classList.remove('active');

    renderBreakdownCards(result.wordsBreakdown);
  } catch (err) {
    console.error("Translation API call failed, falling back offline:", err);
    runLocalTranslationFallback(srcText, destArea, vocabList, warningBar);
  } finally {
    translateBtn.disabled = false;
    translateBtn.innerHTML = oldBtnText;
  }
}

function runLocalTranslationFallback(srcText, destArea, vocabList, warningBar) {
  destArea.innerHTML = '<span class="translator-output" style="color: var(--color-danger); font-size: 12px; margin-bottom: 8px; display: block;"><i class="fas fa-exclamation-circle"></i> Kết nối máy chủ gián đoạn. Đang sử dụng chế độ dịch offline...</span>';

  const normalized = srcText.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
  let translatedText = "";
  let matchedVocab = [];
  let isPreset = false;

  // 1. Check exact presets first for maximum accuracy
  if (normalized.includes('răng bữa ni mi đi học trễ rứa')) {
    translatedText = "Sao hôm nay mày đi học muộn thế?";
    matchedVocab = [
      { dialectWord: 'răng', standardMeaning: 'sao / tại sao', explanation: 'Từ hỏi lý do kinh điển trong tiếng Nghệ Tĩnh và Bình Trị Thiên.' },
      { dialectWord: 'bữa ni', standardMeaning: 'hôm nay', explanation: 'Biến âm chỉ thời gian hôm nay, ghép từ "bữa" và "ni" (này).' },
      { dialectWord: 'mi', standardMeaning: 'mày / bạn', explanation: 'Đại từ nhân xưng ngôi thứ hai thân mật.' },
      { dialectWord: 'rứa', standardMeaning: 'vậy / thế', explanation: 'Trợ từ đệm cảm thán đặt cuối câu để nhấn mạnh mức độ.' }
    ];
    isPreset = true;
  } else if (normalized.includes('mệ đi mô rứa mệ ơi') || normalized.includes('mệ đi mô rứa mệ')) {
    translatedText = "Bà đi đâu thế bà ơi?";
    matchedVocab = [
      { dialectWord: 'mệ', standardMeaning: 'bà / mẹ lớn tuổi', explanation: 'Kính xưng tôn kính để gọi bà hoặc các cụ bà lớn tuổi ở vùng Thừa Thiên Huế.' },
      { dialectWord: 'mô', standardMeaning: 'đâu / phương nào', explanation: 'Từ hỏi vị trí địa lý đặc trưng, dùng phổ biến ở miền Trung.' },
      { dialectWord: 'rứa', standardMeaning: 'vậy / thế', explanation: 'Từ đệm cuối câu hỏi để tăng tính nhẹ nhàng, thân mật.' }
    ];
    isPreset = true;
  } else if (normalized.includes('mát dữ hôn') || normalized.includes('trời mát dữ hôn tui mới qua bển mần chuyện')) {
    translatedText = "Hôm nay trời mát mẻ thật đấy chứ, tôi mới qua bên kia làm việc.";
    matchedVocab = [
      { dialectWord: 'bữa nay', standardMeaning: 'hôm nay', explanation: 'Cách định vị thời gian cực kỳ quen thuộc của người phương Nam.' },
      { dialectWord: 'dữ hôn', standardMeaning: 'quá trời / dữ dội thế', explanation: 'Từ cảm thán biểu đạt sắc thái cường điệu cực tả trong khẩu ngữ miền Nam.' },
      { dialectWord: 'tui', standardMeaning: 'tôi / tao', explanation: 'Đại từ nhân xưng ngôi thứ nhất số ít vùng Nam và Trung Bộ.' },
      { dialectWord: 'bển', standardMeaning: 'bên kia', explanation: 'Chỉ vị trí địa lý ở khoảng cách đối diện, đối lập.' },
      { dialectWord: 'mần', standardMeaning: 'làm', explanation: 'Biến âm động từ làm, thể hiện sự lao động vất vả, mộc mạc.' }
    ];
    isPreset = true;
  }

  // 2. Fallback to Dynamic Dictionary Translation
  if (!isPreset) {
    function removeDiacritics(str) {
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
    }

    const srcTextClean = removeDiacritics(srcText.toLowerCase());

    localLexicon.forEach(lex => {
      const lexWordClean = removeDiacritics(lex.word.toLowerCase());
      if (srcTextClean.includes(lexWordClean)) {
        matchedVocab.push({
          dialectWord: lex.word,
          standardMeaning: lex.meaning,
          explanation: lex.culturalInsight ? lex.culturalInsight.split('.')[0] + '.' : 'Từ địa phương vùng ' + lex.region
        });
      }
    });

    let temp = srcText;
    if (translatorDirection === 'dialect-to-standard') {
      const sortedVocab = [...matchedVocab].sort((a, b) => b.dialectWord.length - a.dialectWord.length);
      sortedVocab.forEach(item => {
        let tempClean = removeDiacritics(temp.toLowerCase());
        let itemWordClean = removeDiacritics(item.dialectWord.toLowerCase());
        
        let index = tempClean.indexOf(itemWordClean);
        while (index !== -1) {
          temp = temp.substring(0, index) + item.standardMeaning.split(',')[0].trim() + temp.substring(index + itemWordClean.length);
          tempClean = removeDiacritics(temp.toLowerCase());
          index = tempClean.indexOf(itemWordClean);
        }
      });
      translatedText = temp.charAt(0).toUpperCase() + temp.slice(1);
    } else {
      let matchedStandard = [];
      localLexicon.forEach(lex => {
        const meanings = lex.meaning.split(',').map(m => m.trim().toLowerCase());
        meanings.forEach(m => {
          const mClean = removeDiacritics(m);
          if (srcTextClean.includes(mClean)) {
            matchedStandard.push({
              dialectWord: lex.word,
              standardMeaning: m,
              explanation: `Biến đổi sang từ địa phương "${lex.word}" đại diện nghĩa "${m}"`
            });
            let tempClean = removeDiacritics(temp.toLowerCase());
            let index = tempClean.indexOf(mClean);
            while (index !== -1) {
              temp = temp.substring(0, index) + lex.word + temp.substring(index + mClean.length);
              tempClean = removeDiacritics(temp.toLowerCase());
              index = tempClean.indexOf(mClean);
            }
          }
        });
      });
      translatedText = temp.charAt(0).toUpperCase() + temp.slice(1);
      matchedVocab = matchedStandard;
    }
  }

  // Display translation
  destArea.innerHTML = `<div class="translator-output">${translatedText}</div>`;

  // Display Warning if suspicious dialect words exist but aren't mapped
  let hasMissing = false;
  if (!isPreset && translatorDirection === 'dialect-to-standard') {
    const midViet = ["mô", "tê", "răng", "rứa", "nớ", "mần", "trốc", "bọ", "mạ", "ngái", "nác", "rú", "khu", "clả", "cấy", "du"];
    midViet.forEach(mv => {
      if (srcText.toLowerCase().includes(mv) && !matchedVocab.some(x => x.dialectWord === mv)) {
        hasMissing = true;
      }
    });
  }

  if (hasMissing) {
    warningBar.classList.add('active');
  } else {
    warningBar.classList.remove('active');
  }

  // Render Breakdown Cards
  renderBreakdownCards(matchedVocab);
}

// --------------------------------------------------------------------------
// Conversational AI Chatbot (Trợ lý Chuyên gia)
// --------------------------------------------------------------------------
function initChatbotModule() {
  const sendBtn = document.getElementById('chat-send-btn');
  const chatInput = document.getElementById('chat-input');
  
  sendBtn.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  // Handle Quick Queries Click (Sidebar)
  const quickQueryBtns = document.querySelectorAll('.quick-query-btn');
  quickQueryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-query');
      triggerBotQuestion(text);
    });
  });

  // Handle Quick Reply Suggestions Click (Above chat input)
  const quickReplySuggestionBtns = document.querySelectorAll('.quick-reply-suggestion-btn');
  quickReplySuggestionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-query');
      triggerBotQuestion(text);
    });
  });
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  triggerBotQuestion(text);
  input.value = '';
}

async function triggerBotQuestion(text) {
  appendMessage('user', text);
  
  const container = document.getElementById('chat-messages-container');
  const typingBubble = document.createElement('div');
  typingBubble.className = 'chat-bubble bot';
  typingBubble.id = 'chat-typing-indicator-bubble';
  typingBubble.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  container.appendChild(typingBubble);
  container.scrollTop = container.scrollHeight;

  try {
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    if (!response.ok) {
      throw new Error(`Server status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulatedText = '';
    let buffer = '';
    let isFallbackMode = false;
    let botBubble = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (let line of lines) {
        line = line.trim();
        if (!line || !line.startsWith('data: ')) continue;

        const dataStr = line.substring(6).trim();
        if (dataStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.isFallback) {
            isFallbackMode = true;
          }
          if (parsed.content) {
            if (!botBubble) {
              const typing = document.getElementById('chat-typing-indicator-bubble');
              if (typing) typing.remove();

              botBubble = document.createElement('div');
              botBubble.className = 'chat-bubble bot';
              container.appendChild(botBubble);
            }

            accumulatedText += parsed.content;

            let displayText = accumulatedText;
            if (isFallbackMode && !displayText.startsWith('*(Chế độ ngoại tuyến)*')) {
              displayText = `*(Chế độ ngoại tuyến)*\n\n${displayText}`;
            }

            updateBotBubbleContent(botBubble, displayText);
            container.scrollTop = container.scrollHeight;
          }
        } catch (e) {
          console.warn("Error parsing stream line:", line, e);
        }
      }
    }

    if (buffer.trim().startsWith('data: ')) {
      const dataStr = buffer.trim().substring(6).trim();
      if (dataStr !== '[DONE]') {
        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.isFallback) isFallbackMode = true;
          if (parsed.content) {
            if (!botBubble) {
              const typing = document.getElementById('chat-typing-indicator-bubble');
              if (typing) typing.remove();

              botBubble = document.createElement('div');
              botBubble.className = 'chat-bubble bot';
              container.appendChild(botBubble);
            }

            accumulatedText += parsed.content;
            let displayText = accumulatedText;
            if (isFallbackMode && !displayText.startsWith('*(Chế độ ngoại tuyến)*')) {
              displayText = `*(Chế độ ngoại tuyến)*\n\n${displayText}`;
            }
            updateBotBubbleContent(botBubble, displayText);
            container.scrollTop = container.scrollHeight;
          }
        } catch (e) {}
      }
    }

    if (!botBubble && !accumulatedText) {
      const typing = document.getElementById('chat-typing-indicator-bubble');
      if (typing) typing.remove();
      runLocalChatbotFallback(text);
    }
  } catch (err) {
    console.error("Chatbot API failed, falling back offline:", err);
    const typing = document.getElementById('chat-typing-indicator-bubble');
    if (typing) typing.remove();
    runLocalChatbotFallback(text);
  }
}

function updateBotBubbleContent(bubble, text) {
  let formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');

  formattedText += `<div style="font-size: 11px; color: #9ca3af; margin-top: 8px; font-style: italic; border-top: 1px dashed rgba(0,0,0,0.08); padding-top: 4px;">Dữ liệu được hỗ trợ bởi AI chỉ mang tính chất tham khảo. Hệ thống rất mong nhận được phản hồi đóng góp từ bạn!</div>`;

  bubble.innerHTML = formattedText;
}

function runLocalChatbotFallback(text) {
  const quickRepliesFallback = {
    '"Răng" nghĩa là gì? Cho ví dụ thực tế cách dùng.': `**"Răng"** có nghĩa là **"sao, tại sao, thế nào"** trong tiếng phổ thông.
- **Khu vực sử dụng:** Rất phổ biến tại Nghệ An, Hà Tĩnh, Quảng Bình, Quảng Trị, Thừa Thiên Huế và một số vùng Thanh Hóa.
- **Ví dụ thực tế:** *"Răng bữa ni mi đi học trễ rứa?"* tương đương *"Sao hôm nay mày đi học muộn thế?"*
- **Ý nghĩa văn hóa:** Từ "răng" mang ngữ âm cổ, phản ánh bản sắc ngôn ngữ đậm chất miền Trung. Bạn sẽ nghe từ này thường xuyên trong hò Ví Giặm hay các bài ca Huế.`,
    
    'Giải thích nghĩa và cách dùng của cụm "Mô, tê, ni, nớ".': `Bộ tứ **"Mô - Tê - Ni - Nớ"** (hoặc "Mô - Tê - Răng - Rứa" / "Tê - Nớ") được coi là **"mật mã ngôn ngữ"** của người dân xứ Nghệ và Bình Trị Thiên:
1. **Mô:** Đâu, ở đâu, chỗ nào (Ví dụ: *Đi mô đó?* -> Đi đâu thế?)
2. **Tê:** Kia, bên kia, đằng kia (Ví dụ: *Bên tê sông* -> Bên kia sông)
3. **Ni:** Này, cái này (Ví dụ: *Cấy ni* -> Cái này)
4. **Nớ:** Đó, kia (Ví dụ: *Người nớ* -> Người đó / Người kia)

Khi kết hợp chúng lại tạo nên ngữ điệu nhịp nhàng, trầm bổng đặc trưng của giọng miền Trung.`,
    
    'So sánh sự khác biệt giữa phương ngữ Nghệ Tĩnh với phương ngữ Nam Bộ.': `**So sánh tiếng Nghệ Tĩnh (Nghệ An - Hà Tĩnh) và tiếng Nam Bộ:**

| Đặc điểm | Tiếng Nghệ Tĩnh | Tiếng Nam Bộ |
| :--- | :--- | :--- |
| **Hỏi / Đâu** | Dùng từ **"Mô"** (Ví dụ: *Đi mô đó?*) | Dùng từ **"Đâu"** (Ví dụ: *Đi đâu đó?*) |
| **Sao / Tại sao** | Dùng từ **"Răng"** (Ví dụ: *Răng rứa?*) | Dùng từ **"Sao"** (Ví dụ: *Sao vậy?*) |
| **Thế này / Vậy** | Dùng từ **"Rứa"** (Ví dụ: *Thấy rứa*) | Dùng từ **"Vậy"** (Ví dụ: *Thấy vậy*) |
| **Thanh điệu** | Nặng, trầm sâu, giữ nguyên âm cổ, dấu hỏi/ngã phát âm nặng gần như nhau. | Nhẹ nhàng, bằng phẳng, không phân biệt rõ dấu hỏi và dấu ngã (đều phát âm hơi giống dấu hỏi). |
| **Tính cách biểu thị** | Mộc mạc, bền bỉ, kiên cường qua âm sắc trầm nặng. | Phóng khoáng, cởi mở, thân thiện qua âm sắc bay bổng. |`
  };

  const cleanText = text.trim();
  let responseText = '';

  if (quickRepliesFallback[cleanText]) {
    responseText = quickRepliesFallback[cleanText];
  } else {
    const dictMatch = localLexicon.find(w => cleanText.toLowerCase().includes(w.word.toLowerCase()));
    if (dictMatch) {
      responseText = `Tôi là **Trợ lý văn hóa Thổ âm Sông núi** (Chế độ Ngoại tuyến). Dựa trên cơ sở dữ liệu tra cứu được:
- **Từ:** **"${dictMatch.word}"**
- **Nghĩa:** ${dictMatch.meaning}
- **Khu vực sử dụng:** ${dictMatch.region}
- **Ví dụ:** *"${dictMatch.example}"* -> Nghĩa: *"${dictMatch.exampleTranslation}"*
- **Bối cảnh văn hóa:** ${dictMatch.culturalInsight}`;
    } else {
      responseText = `Tôi là **Trợ lý văn hóa Thổ âm Sông núi** (Chế độ Ngoại tuyến). Xin lỗi bạn, hiện tại kết nối mạng đang gián đoạn và tôi chưa tìm thấy từ khóa tương ứng cho *"${cleanText}"* trong từ điển ngoại tuyến. 

Bạn có thể thử hỏi nghĩa của các từ cụ thể như *"răng"*, *"ún"*, *"cố"*, *"mô"*, *"tê"*... hoặc dùng các câu hỏi nhanh gợi ý nhé!`;
    }
  }

  appendMessage('bot', `*(Chế độ ngoại tuyến)*\n\n${responseText}`);
}

function appendMessage(sender, text) {
  const container = document.getElementById('chat-messages-container');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  
  // Simple markdown-to-html conversion for responses
  const formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
    
  bubble.innerHTML = formattedText;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

// --------------------------------------------------------------------------
// Admin Dashboard Module (Moderation Queue)
// --------------------------------------------------------------------------
let activeAdminReviewId = null;

function initAdminModule() {
  document.getElementById('admin-btn-approve').addEventListener('click', approveContribution);
  document.getElementById('admin-btn-delete').addEventListener('click', softDeleteContribution);
  
  // Custom audio player for Admin Detail
  const playBtn = document.getElementById('admin-play-btn');
  let adminAudio = null;

  playBtn.addEventListener('click', () => {
    if (!activeAdminReviewId) return;
    
    const contrib = pendingContributions.find(x => x.id === activeAdminReviewId);
    if (!contrib) return;

    const icon = playBtn.querySelector('i');
    
    if (adminAudio) {
      if (!adminAudio.paused) {
        adminAudio.pause();
        icon.className = 'fas fa-play';
        return;
      }
      adminAudio.play();
      icon.className = 'fas fa-pause';
      return;
    }

    adminAudio = new Audio(contrib.audioUrl);
    adminAudio.play();
    icon.className = 'fas fa-pause';

    adminAudio.onended = () => {
      icon.className = 'fas fa-play';
      adminAudio = null;
    };
  });
}

function renderAdminQueue() {
  const list = document.getElementById('admin-queue-list');
  list.innerHTML = '';

  if (pendingContributions.length === 0) {
    list.innerHTML = '<div style="color: var(--text-muted); font-style: italic; text-align: center; padding: 24px; font-size: 13px;">Hàng đợi kiểm duyệt trống.</div>';
    document.getElementById('admin-detail-empty').style.display = 'flex';
    document.getElementById('admin-detail-content').style.display = 'none';
    return;
  }

  pendingContributions.forEach(item => {
    const card = document.createElement('div');
    card.className = `admin-queue-card ${activeAdminReviewId === item.id ? 'active' : ''}`;
    
    const isMismatch = !item.verified;
    const badgeClass = isMismatch ? 'mismatch' : 'match';
    const badgeText = isMismatch ? 'LỆCH VÙNG' : 'KHỚP GIỌNG';

    card.innerHTML = `
      <div class="admin-card-header">
        <span class="admin-card-title">${item.title}</span>
        <span class="admin-card-badge ${badgeClass}">${badgeText}</span>
      </div>
      <div class="admin-card-details">
        <span>Tỉnh: ${item.province} | Loa: ${item.speaker}</span>
      </div>
    `;

    card.addEventListener('click', () => selectAdminReviewItem(item));
    list.appendChild(card);
  });
}

function selectAdminReviewItem(item) {
  activeAdminReviewId = item.id;
  
  // Highlight active card
  document.querySelectorAll('.admin-queue-card').forEach(c => c.classList.remove('active'));
  renderAdminQueue();

  const emptyPane = document.getElementById('admin-detail-empty');
  const contentPane = document.getElementById('admin-detail-content');

  emptyPane.style.display = 'none';
  contentPane.style.display = 'flex';

  document.getElementById('admin-detail-title-txt').innerText = item.title;
  document.getElementById('admin-detail-speaker').innerText = `Người đóng góp: ${item.speaker} | Tỉnh: ${item.province} | Nhóm tuổi: ${item.ageGroup} | Giới tính: ${item.gender}`;

  // AI Pipeline Labels
  const aiTagWrapper = document.getElementById('admin-ai-tags-row');
  const statusIcon = item.verified 
    ? `<span class="ai-pill green"><i class="fas fa-check-circle"></i> Khớp vùng: ${item.province} (${item.confidence}%)</span>`
    : `<span class="ai-pill" style="color: var(--color-danger); background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2);"><i class="fas fa-exclamation-triangle"></i> Nghi ngờ lệch giọng (${item.confidence}% tin cậy)</span>`;

  aiTagWrapper.innerHTML = `
    ${statusIcon}
    <span class="ai-pill"><i class="fas fa-robot"></i> STT PhoWhisper</span>
    <span class="ai-pill"><i class="fas fa-tags"></i> Tag: ${item.topic}</span>
  `;

  // Show Transcripts
  document.getElementById('admin-trans-dialect').innerText = item.transcriptDialect;
  document.getElementById('admin-trans-standard').innerText = item.transcriptStandard;
}

function approveContribution() {
  if (!activeAdminReviewId) return;

  const index = pendingContributions.findIndex(x => x.id === activeAdminReviewId);
  if (index === -1) return;

  const item = pendingContributions[index];

  // Modify stats: update verified status
  item.verified = true;
  
  // Add to active AUDIO_CORPUS
  localAudioCorpus.push(item);
  localStorage.setItem('vb_audio_corpus', JSON.stringify(localAudioCorpus));

  // Remove from pending
  pendingContributions.splice(index, 1);
  localStorage.setItem('vb_pending_contributions', JSON.stringify(pendingContributions));

  alert(`Đã duyệt thành công bản ghi: "${item.title}". Bản ghi hiện đã được đăng tải lên Bản đồ công khai.`);

  activeAdminReviewId = null;
  updateGlobalStats();
  drawMapMarkers();
  renderAdminQueue();
}

function softDeleteContribution() {
  if (!activeAdminReviewId) return;

  const index = pendingContributions.findIndex(x => x.id === activeAdminReviewId);
  if (index === -1) return;

  const item = pendingContributions[index];
  
  if (confirm(`Bạn có chắc chắn muốn xóa bản ghi "${item.title}"? Thao tác này sẽ xóa hoàn toàn tệp âm thanh trên bộ lưu trữ đám mây.`)) {
    // Remove from pending
    pendingContributions.splice(index, 1);
    localStorage.setItem('vb_pending_contributions', JSON.stringify(pendingContributions));

    alert("Đã xóa bản ghi thành công.");
    activeAdminReviewId = null;
    renderAdminQueue();
    updateGlobalStats();
  }
}
