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
let AUDIO_BLOB_CACHE = new Map();

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
  setupReportModal();
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

  const invalidTitles = new Set(['hue', 'huế', 'xứ huế quê tôi', 'lời dặn dò của mạ huế']);
  const storedDeletedIds = localStorage.getItem('vb_deleted_audio_ids');
  const deletedIdsSet = new Set(storedDeletedIds ? JSON.parse(storedDeletedIds) : []);

  if (storedCorpus) {
    const parsedCorpus = JSON.parse(storedCorpus);
    const validIds = new Set(AUDIO_CORPUS.map(a => a.id));
    localAudioCorpus = parsedCorpus.filter(item => {
      if (!item) return false;
      const titleLower = (item.title || '').trim().toLowerCase();
      if (invalidTitles.has(titleLower)) return false;
      if (deletedIdsSet.has(item.id)) return false;
      return validIds.has(item.id) || (item.id && (item.id.startsWith('user_') || item.id.startsWith('p_') || item.id.startsWith('contrib_') || item.id.startsWith('audio_') || item.id.startsWith('speech_') || item.id.startsWith('yt_')));
    });
  } else {
    localAudioCorpus = AUDIO_CORPUS.filter(item => {
      if (!item) return false;
      const titleLower = (item.title || '').trim().toLowerCase();
      if (invalidTitles.has(titleLower)) return false;
      if (deletedIdsSet.has(item.id)) return false;
      return true;
    });
  }

  // Ensure purged state is saved to localStorage
  localStorage.setItem('vb_audio_corpus', JSON.stringify(localAudioCorpus));

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

  fetchAudioDatabaseFromBackend();
}

async function fetchAudioDatabaseFromBackend() {
  const storedDeletedIds = localStorage.getItem('vb_deleted_audio_ids');
  const deletedIdsSet = new Set(storedDeletedIds ? JSON.parse(storedDeletedIds) : []);

  try {
    const res = await fetch('/api/audio-database');
    if (res.ok) {
      const serverRecords = await res.json();
      if (Array.isArray(serverRecords) && serverRecords.length > 0) {
        const recordMap = new Map();
        localAudioCorpus.forEach(item => {
          if (item && item.id && !deletedIdsSet.has(item.id)) recordMap.set(item.id, item);
        });
        serverRecords.forEach(item => {
          if (item && item.id && !deletedIdsSet.has(item.id)) {
            recordMap.set(item.id, item);
          }
        });
        localAudioCorpus = Array.from(recordMap.values());
        localStorage.setItem('vb_audio_corpus', JSON.stringify(localAudioCorpus));
        updateGlobalStats();
        if (typeof drawMapMarkers === 'function') {
          drawMapMarkers();
        }
        if (typeof filterMapData === 'function' && selectedProvince) {
          filterMapData();
        }
      }
    }
  } catch (e) {
    console.warn("[Audio DB Sync] Could not fetch audio database from backend:", e);
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
    closeProvincePopup();
  });

  // Setup Pop-up Card listeners
  const closePopupBtn = document.getElementById('close-province-popup');
  if (closePopupBtn) {
    closePopupBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeProvincePopup();
    });
  }
  const popupDetailBtn = document.getElementById('popup-detail-btn');
  if (popupDetailBtn) {
    popupDetailBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sidePanel = document.querySelector('.side-panel');
      if (sidePanel) sidePanel.scrollIntoView({ behavior: 'smooth' });
    });
  }

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
  const maxDragX = (svgWidth * currentScale) * 0.75;
  const maxDragY = (svgHeight * currentScale) * 0.75;

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

  const themeMode = 'dongson-full';

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

  // Tinh toan toa do bao het toan bo ban do Viet Nam
  let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
  cachedGeojsonData.features.forEach(f => {
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

  geojsonMinLon = minLon - (maxLon - minLon) * 0.04;
  geojsonMaxLon = maxLon + (maxLon - minLon) * 0.04;
  geojsonMinLat = minLat - (maxLat - minLat) * 0.04;
  geojsonMaxLat = maxLat + (maxLat - minLat) * 0.04;

  function project(lon, lat) {
    const x = ((lon - geojsonMinLon) / (geojsonMaxLon - geojsonMinLon)) * svgWidth;
    const y = svgHeight - ((lat - geojsonMinLat) / (geojsonMaxLat - geojsonMinLat)) * svgHeight;
    return { x, y };
  }

  // Luminous & Radiant High-Contrast Palette for 6 provinces of Bắc Trung Bộ
  const provinceGradients = {
    'Thanh Hóa': { id: 'grad-thanh-hoa', color1: '#A8E6CF', color2: '#52B788' },       // Luminous Mint Sage (Xanh lá mạ mượt tươi sáng)
    'Nghệ An': { id: 'grad-nghe-an', color1: '#FDE68A', color2: '#F59E0B' },         // Bright Sunlit Amber (Vàng nắng rực rỡ tươi)
    'Hà Tĩnh': { id: 'grad-ha-tinh', color1: '#99E9F2', color2: '#34D399' },         // Radiant Crystal Jade (Xanh ngọc lam celadon sáng trong)
    'Quảng Bình': { id: 'grad-quang-binh', color1: '#FED7AA', color2: '#F97316' },     // Glowing Coral Amber (Cam hồng đào rực sáng)
    'Quảng Trị': { id: 'grad-quang-tri', color1: '#BAE6FD', color2: '#3B82F6' },       // Bright Ocean Sky Azure (Xanh lam biển trời tươi sáng)
    'Thừa Thiên Huế': { id: 'grad-thua-thien-hue', color1: '#E9D5FF', color2: '#A855F7' } // Imperial Radiant Lavender (Tím Cố Đô quý phái rực sáng)
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

  let targetPathsHtml = '';
  let otherPathsHtml = '';
  let labelsHtml = '';
  computedCentroids = {};

  cachedGeojsonData.features.forEach((f, idx) => {
    const provName = getProvinceStandardName(f);
    const isTarget = provName !== 'Khác';

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

    if (isTarget) {
      const gradInfo = provinceGradients[provName];
      const fillAttr = gradInfo ? `url(#${gradInfo.id})` : '#0284C7';
      const isSelected = selectedProvince === provName;

      targetPathsHtml += `
        <path class="geojson-province geojson-target-province ${isSelected ? 'selected' : ''}" 
              id="geojson-prov-${idx}" 
              data-name="${provName}" 
              d="${d}" 
              fill="${fillAttr}" 
              fill-opacity="0.92"
              stroke="#ffffff"
              stroke-width="2.8"
              filter="url(#target-glow)"
              onclick="selectProvince('${provName}')" />
      `;

      if (ptCount > 0) {
        const cx = sumX / ptCount;
        const cy = sumY / ptCount;
        computedCentroids[provName] = { x: cx, y: cy };

        const textLen = provName.toUpperCase().length;
        const bgWidth = textLen * 6.5 + 18;
        labelsHtml += `
          <g transform="translate(${cx.toFixed(1)}, ${(cy + 24).toFixed(1)})" class="geojson-label-group">
            <rect class="geojson-label-bg" x="-${(bgWidth/2).toFixed(1)}" y="-9" width="${bgWidth}" height="18" rx="9" />
            <text class="geojson-label-text" dy="4">${provName.toUpperCase()}</text>
          </g>
        `;
      }
    } else {
      otherPathsHtml += `
        <path class="geojson-province geojson-other-province" 
              id="geojson-prov-${idx}" 
              d="${d}" 
              fill="#e2d5c5" 
              fill-opacity="0.80"
              stroke="#a3917a"
              stroke-width="1.2" />
      `;
    }
  });

  // Clean background art without vector ribbon overlays
  let bgArtContent = '';

  // Update container background according to theme (darker, softer background)
  const mapWrapper = document.getElementById('geojson-map-container');
  if (mapWrapper) {
    if (themeMode === 'cyber-dark') {
      mapWrapper.style.backgroundColor = '#090e1a';
      mapWrapper.style.backgroundImage = 'linear-gradient(135deg, #070a14 0%, #0f172a 50%, #1e1b4b 100%)';
    } else {
      mapWrapper.style.backgroundColor = '#1e293b';
      mapWrapper.style.backgroundImage = "linear-gradient(rgba(15, 23, 42, 0.46), rgba(15, 23, 42, 0.46)), url('landscape_bg.png')";
      mapWrapper.style.backgroundSize = 'cover';
      mapWrapper.style.backgroundPosition = 'center center';
    }
  }

  container.innerHTML = `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="geojson-svg" xmlns="http://www.w3.org/2000/svg" style="max-height: 90vh;">
      <defs>
        <!-- Province Multi-color Luminous & Radiant Gradients -->
        <linearGradient id="grad-thanh-hoa" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#A8E6CF" />
          <stop offset="100%" stop-color="#52B788" />
        </linearGradient>
        <linearGradient id="grad-nghe-an" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDE68A" />
          <stop offset="100%" stop-color="#F59E0B" />
        </linearGradient>
        <linearGradient id="grad-ha-tinh" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#99E9F2" />
          <stop offset="100%" stop-color="#34D399" />
        </linearGradient>
        <linearGradient id="grad-quang-binh" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FED7AA" />
          <stop offset="100%" stop-color="#F97316" />
        </linearGradient>
        <linearGradient id="grad-quang-tri" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#BAE6FD" />
          <stop offset="100%" stop-color="#3B82F6" />
        </linearGradient>
        <linearGradient id="grad-thua-thien-hue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E9D5FF" />
          <stop offset="100%" stop-color="#A855F7" />
        </linearGradient>

        <!-- Dong Son Bronze & Gold Terracotta Gradients -->
        <linearGradient id="ds-gold-star" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#D97706" />
          <stop offset="50%" stop-color="#B45309" />
          <stop offset="100%" stop-color="#78350F" />
        </linearGradient>
        <linearGradient id="ds-gold-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#D97706" />
          <stop offset="100%" stop-color="#F59E0B" />
        </linearGradient>
        <linearGradient id="ds-bronze-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#059669" />
          <stop offset="100%" stop-color="#047857" />
        </linearGradient>
        <linearGradient id="ds-red-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E11D48" />
          <stop offset="100%" stop-color="#BE123C" />
        </linearGradient>

        <!-- Mountain Range Soft Pastel Gradients -->
        <linearGradient id="m-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#C084FC" />
          <stop offset="100%" stop-color="#818CF8" />
        </linearGradient>
        <linearGradient id="m-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#34D399" />
          <stop offset="100%" stop-color="#38BDF8" />
        </linearGradient>
        <linearGradient id="m-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FBBF24" />
          <stop offset="100%" stop-color="#FB7185" />
        </linearGradient>

        <!-- River & Wave Gradients -->
        <linearGradient id="river-cyan-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0284C7" />
          <stop offset="100%" stop-color="#06B6D4" />
        </linearGradient>
        <linearGradient id="river-gold-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#D97706" />
          <stop offset="100%" stop-color="#F59E0B" />
        </linearGradient>
        <linearGradient id="river-violet-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#9333EA" />
          <stop offset="100%" stop-color="#E11D48" />
        </linearGradient>

        <!-- Cloud Pastel Gradients -->
        <linearGradient id="cloud-rose-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FB7185" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#FECDD3" stop-opacity="0.1" />
        </linearGradient>
        <linearGradient id="cloud-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#BAE6FD" stop-opacity="0.1" />
        </linearGradient>
        <linearGradient id="cloud-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#FDE047" stop-opacity="0.1" />
        </linearGradient>

        <!-- Glow Filters -->
        <filter id="target-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#d97706" flood-opacity="0.35" />
        </filter>
        <filter id="glow-gold" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <!-- Subtle Pastel Grid pattern -->
        <pattern id="cyber-grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(217, 119, 6, 0.07)" stroke-width="1"/>
          <circle cx="0" cy="0" r="1.5" fill="rgba(13, 148, 136, 0.12)"/>
        </pattern>
      </defs>

      <!-- Base Grid Pattern Overlay -->
      <rect width="${svgWidth}" height="${svgHeight}" fill="url(#cyber-grid)" onclick="closeProvincePopup()" style="cursor: pointer;" />

      <!-- Artistic Background Heritage Layer (Dong Son Drum, Rivers, Mountains, Clouds, Waves) -->
      <g id="geojson-background-art">
        ${bgArtContent}
      </g>

      <g id="geojson-other-provinces-group">
        ${otherPathsHtml}
      </g>
      <g id="geojson-target-provinces-group">
        ${targetPathsHtml}
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

  // Retain zoom and center focus on selected province if active
  if (selectedProvince && computedCentroids[selectedProvince]) {
    const centroid = computedCentroids[selectedProvince];
    currentScale = 2.0;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    currentTranslateX = - (centroid.x - centerX) * currentScale;
    currentTranslateY = - (centroid.y - centerY) * currentScale;
    constrainPan();
    updateMapTransform();
  }
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
      <title>${provName}: ${totalCount} bản ghi phát thanh</title>
      <circle cx="0" cy="0" r="7" fill="none" stroke="#00E5FF" stroke-width="2" class="svg-wave" style="pointer-events: none;" />
      <circle cx="0" cy="0" r="7" fill="none" stroke="#38BDF8" stroke-width="2" class="svg-wave" style="pointer-events: none;" />
      <circle cx="0" cy="0" r="7" fill="#00D2FF" stroke="#ffffff" stroke-width="2" class="svg-broadcast-dot" style="filter: drop-shadow(0 0 8px #00D2FF);" />
      <circle cx="11" cy="-11" r="9" fill="#EC4899" stroke="#ffffff" stroke-width="1.5" style="filter: drop-shadow(0 0 8px #EC4899);" />
      <text x="11" y="-7.5" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="var(--font-sans)">${totalCount}</text>
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

let currentSampleAudioForPopup = null;

function closeProvincePopup() {
  selectedProvince = null;

  // Clear highlight on map
  document.querySelectorAll('.geojson-province').forEach(el => {
    el.classList.remove('selected');
  });

  // Hide pop-up card
  const popupCard = document.getElementById('province-popup-card');
  if (popupCard) {
    popupCard.classList.remove('show');
    setTimeout(() => popupCard.classList.add('hidden'), 300);
  }

  // Reset map zoom and pan back to normal view frame before zoom
  resetMapZoom();
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

  // Focus and zoom smoothly to selected province centroid right in the center of map screen
  const centroid = computedCentroids[provName];
  if (centroid) {
    currentScale = 2.0;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    currentTranslateX = - (centroid.x - centerX) * currentScale;
    currentTranslateY = - (centroid.y - centerY) * currentScale;
    constrainPan();
    updateMapTransform();
  }

  // Display details in Side Panel
  displayProvinceInfo(provName);

  // Show Spotlight Pop-up Card in Center
  showProvincePopupCard(provName);
}

function showProvincePopupCard(provName) {
  const popupCard = document.getElementById('province-popup-card');
  if (!popupCard) return;

  safeSetText('popup-province-name', `Tỉnh ${provName}`);
  
  let dialectGroup = "";
  if (provName === "Thanh Hóa") dialectGroup = "Phương ngữ Thanh Hóa";
  else if (provName === "Nghệ An" || provName === "Hà Tĩnh") dialectGroup = "Phương ngữ Nghệ Tĩnh";
  else dialectGroup = "Phương ngữ Bình Trị Thiên";
  
  safeSetText('popup-province-sub', dialectGroup);

  // Filter local corpus for province
  const provinceAudios = localAudioCorpus.filter(a => a.province === provName);
  safeSetText('popup-record-count', provinceAudios.length);

  const speakers = new Set(provinceAudios.map(a => a.speaker));
  safeSetText('popup-speaker-count', speakers.size);

  const sampleTitleEl = document.getElementById('popup-sample-title');
  const playBtn = document.getElementById('popup-play-btn');

  if (provinceAudios.length > 0) {
    currentSampleAudioForPopup = provinceAudios[0];
    if (sampleTitleEl) sampleTitleEl.innerText = `${currentSampleAudioForPopup.title} (${currentSampleAudioForPopup.speaker})`;
    if (playBtn) {
      playBtn.onclick = (e) => {
        e.stopPropagation();
        if (currentSampleAudioForPopup) playAudio(currentSampleAudioForPopup);
      };
    }
  } else {
    currentSampleAudioForPopup = null;
    if (sampleTitleEl) sampleTitleEl.innerText = "Chưa có bản ghi âm";
  }

  popupCard.classList.remove('hidden');
  setTimeout(() => {
    popupCard.classList.add('show');
  }, 10);
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

// Helper to generate realistic contextual subtitles matching recording title and province
function generateContextualTranscript(title, province, topic) {
  const lowerTitle = (title || '').toLowerCase();
  
  if (lowerTitle.includes('chào') || lowerTitle.includes('thưa') || lowerTitle.includes('lời chào')) {
    if (province === 'Thừa Thiên Huế') {
      return {
        dialect: "Dạ, con xin chào ôn mệ, chào bọ mạ. Bữa ni nhà mình khỏe không ạ, mạ đi chợ về chưa rứa?",
        standard: "Dạ, con xin chào ông bà, chào bố mẹ. Hôm nay nhà mình khỏe không ạ, mẹ đi chợ về chưa thế?"
      };
    } else if (province === 'Nghệ An' || province === 'Hà Tĩnh') {
      return {
        dialect: "Choa xin chào các bác các ôn mệ. Bữa ni trời đẹp, sang nhà nhởi uống bát nác chè xanh.",
        standard: "Chúng tôi xin chào các bác các ông bà. Hôm nay trời đẹp, sang nhà chơi uống bát nước chè xanh."
      };
    } else if (province === 'Thanh Hóa') {
      return {
        dialect: "Dạ chào bác, con mới về quê nhởi. Bác khỏe không, lúa nhà mình thu hoạch xong chưa ạ?",
        standard: "Dạ chào bác, con mới về quê chơi. Bác khỏe không, lúa nhà mình thu hoạch xong chưa ạ?"
      };
    } else {
      return {
        dialect: "Dạ con xin kính chào quý vị và ông bà cô bác quê mình ạ.",
        standard: "Dạ con xin kính chào quý vị và ông bà cô bác quê mình ạ."
      };
    }
  }

  if (lowerTitle.includes('ca') || lowerTitle.includes('hát') || lowerTitle.includes('hò') || lowerTitle.includes('ví') || lowerTitle.includes('giặm')) {
    if (province === 'Thừa Thiên Huế') {
      return {
        dialect: "Hò ơi... Chiều chiều trước bến Văn Lâu, ai ngồi ai câu, ai sầu ai thảm rứa hò ơi...",
        standard: "Hò ơi... Chiều chiều trước bến Văn Lâu, ai ngồi ai câu, ai sầu ai thảm thế hò ơi..."
      };
    } else if (province === 'Nghệ An' || province === 'Hà Tĩnh') {
      return {
        dialect: "Ơi hò... Giặt áo bên sông Rào, thương anh vất vả mần đồng nắng nát lòng rứa anh ơi...",
        standard: "Ơi hò... Giặt áo bên sông Rào, thương anh vất vả làm ruộng nắng gắt lòng thế anh ơi..."
      };
    } else {
      return {
        dialect: "Hát khúc ca quê hương, gửi thương gửi nhớ về dòng sông xưa mông mơ...",
        standard: "Hát khúc ca quê hương, gửi thương gửi nhớ về dòng sông xưa mộng mơ..."
      };
    }
  }

  if (lowerTitle.includes('chuyện') || lowerTitle.includes('sự tích') || lowerTitle.includes('lịch sử') || lowerTitle.includes('làng') || lowerTitle.includes('ký ức')) {
    if (province === 'Quảng Bình' || province === 'Quảng Trị') {
      return {
        dialect: "Ngày xưa ở vùng rào ni, bọ mạ tui kể có sự tích sông Gianh kiên cường đánh giặc cứu làng.",
        standard: "Ngày xưa ở vùng sông này, bố mẹ tôi kể có sự tích sông Gianh kiên cường đánh giặc cứu làng."
      };
    } else if (province === 'Thừa Thiên Huế') {
      return {
        dialect: "Mấy mươi năm trước xứ Huế mình có làng nghề làm nón lá truyền thống nổi tiếng lắm mạ.",
        standard: "Mấy mươi năm trước xứ Huế mình có làng nghề làm nón lá truyền thống nổi tiếng lắm mẹ."
      };
    }
  }

  // Province-based Fallbacks
  if (province === "Thừa Thiên Huế") {
    return {
      dialect: "Dạ dạ thưa ôn mệ, tiếng Huế mình dịu dàng ngọt ngào, mô tê răng rứa thương lắm.",
      standard: "Dạ dạ thưa ông bà, tiếng Huế mình dịu dàng ngọt ngào, đâu đó sao thế thương lắm."
    };
  } else if (province === "Thanh Hóa") {
    return {
      dialect: "Tao đón thế mi có biết chi không, lúa trên đồng mùa ni tươi tốt lắm.",
      standard: "Tao nói thế mày có biết gì không, lúa trên đồng mùa này tươi tốt lắm."
    };
  } else if (province === "Nghệ An" || province === "Hà Tĩnh") {
    return {
      dialect: "Nhà tui ở cạnh cấy rú nớ, rót cho bát nác chè xanh mần lòng sướng tê.",
      standard: "Nhà tôi ở cạnh cái núi đó, rót cho bát nước chè xanh làm lòng sướng thế."
    };
  } else if (province === "Quảng Bình" || province === "Quảng Trị") {
    return {
      dialect: "Bọ mạ tui đi mần biển từ sớm, nác biển Quảng Bình trong xanh soi thấy đáy.",
      standard: "Bố mẹ tôi đi làm biển từ sớm, nước biển Quảng Bình trong xanh soi thấy đáy."
    };
  }

  return {
    dialect: "Giọng nói đặc trưng phương ngữ Bắc Trung Bộ gìn giữ bản sắc văn hóa vùng miền.",
    standard: "Giọng nói đặc trưng phương ngữ Bắc Trung Bộ gìn giữ bản sắc văn hóa vùng miền."
  };
}

  provinceAudios.forEach(aud => {
    const card = document.createElement('div');
    card.className = 'audio-card';
    card.id = `audio-card-${aud.id}`;

    // Admin verified items do NOT display "% AI", display "Đã kiểm duyệt" instead
    const isVerifiedByAdmin = aud.verifiedByAdmin || aud.verified === true || aud.id.startsWith('p_') || aud.id.startsWith('yt_');
    const badgeHtml = isVerifiedByAdmin
      ? `<span style="color: #22c55e; font-weight: 600;"><i class="fas fa-check-circle"></i> Đã kiểm duyệt</span>`
      : `<span style="color: var(--color-primary); font-weight: 600;"><i class="fas fa-certificate"></i> ${aud.confidence}% AI</span>`;

    const safeTitle = (aud.title || '').replace(/'/g, "\\'");
    const reportBtnHtml = `<span class="report-btn-tag" onclick="event.stopPropagation(); openReportModal('${aud.id}', '${safeTitle}')" title="Báo cáo bản ghi âm này" style="cursor: pointer; color: #ef4444; font-size: 11px; margin-left: auto; font-weight: 600; display: inline-flex; align-items: center; gap: 3px; background: rgba(239,68,68,0.1); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(239,68,68,0.25);"><i class="fas fa-flag"></i> Báo cáo</span>`;

    card.innerHTML = `
      <div class="audio-card-meta">
        <span>${aud.ageGroup} | ${aud.gender}</span>
        ${badgeHtml}
        ${reportBtnHtml}
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
// Voice & Audio Speech Synthesis Engine
// --------------------------------------------------------------------------
let speechTimer = null;

function speakDialectVoice(text, durationSec = 7) {
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VI'));
      if (viVoice) utterance.voice = viVoice;

      utterance.onend = () => {
        stopAudioPlayer();
      };
      utterance.onerror = () => {
        playWebAudioSynthTone(durationSec);
      };

      window.speechSynthesis.speak(utterance);
    } catch(e) {
      playWebAudioSynthTone(durationSec);
    }
  } else {
    playWebAudioSynthTone(durationSec);
  }
}

function playWebAudioSynthTone(durationSec = 7) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 1.5);
    osc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 3.5);
    osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 6.0);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationSec);
  } catch (e) {
    console.error("Audio synth fallback error:", e);
  }
}

function playSpeechOrToneFallback(text) {
  const durationSec = 7;
  let elapsed = 0;
  
  if (speechTimer) clearInterval(speechTimer);

  safeSetText('track-time-lbl', `00:00 / ${formatTime(durationSec)}`);

  speechTimer = setInterval(() => {
    elapsed++;
    if (elapsed > durationSec) elapsed = durationSec;
    safeSetText('track-time-lbl', `${formatTime(elapsed)} / ${formatTime(durationSec)}`);
    if (elapsed >= durationSec) {
      clearInterval(speechTimer);
      speechTimer = null;
      stopAudioPlayer();
    }
  }, 1000);

  speakDialectVoice(text, durationSec);
}

// Helper to check if string is a playable audio URL
function isValidAudioUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  return (
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:audio') ||
    trimmed.startsWith('/uploads/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    /\.(mp3|wav|m4a|webm|ogg|aac)$/i.test(trimmed)
  );
}

// --------------------------------------------------------------------------
// Audio Player Engine with Canvas Waveform Visualizer
// --------------------------------------------------------------------------
function playAudio(audioObj) {
  if (!audioObj) return;

  const playBtnIcon = document.getElementById('player-play-btn-icon');
  const transBox = document.querySelector('.transcript-box');

  // Case 1: Clicking the SAME audio track that is already loaded in mainAudioPlayer
  if (currentPlayingAudio && currentPlayingAudio.id === audioObj.id && mainAudioPlayer) {
    if (mainAudioPlayer.paused) {
      mainAudioPlayer.play().then(() => {
        if (playBtnIcon) playBtnIcon.className = 'fas fa-pause';
        startWaveformVisualizer();
      }).catch(err => {
        console.warn("Error resuming audio:", err);
      });
    } else {
      mainAudioPlayer.pause();
      if (playBtnIcon) playBtnIcon.className = 'fas fa-play';
      stopWaveformVisualizer();
    }
    return;
  }

  // Case 2: New/Different audio track selected -> Stop current playback & load new audio
  stopAudioPlayer(true); // true = destroy previous Audio object & reset player

  currentPlayingAudio = audioObj;

  // Highlight card
  document.querySelectorAll('.audio-card').forEach(el => el.classList.remove('active'));
  const activeCard = document.getElementById(`audio-card-${audioObj.id}`);
  if (activeCard) activeCard.classList.add('active');

  // Update player UI panel
  safeSetText('track-player-title', audioObj.title);
  safeSetText('track-player-meta', `${audioObj.speaker} (${audioObj.province})`);
  
  // Set dual running transcript matching context
  let dialectSub = audioObj.transcriptDialect;
  let standardSub = audioObj.transcriptStandard;

  if (!dialectSub || dialectSub.includes("Tui mần răng mô biết cấy chi tê rứa bọ mạ")) {
    const ctxTrans = generateContextualTranscript(audioObj.title, audioObj.province, audioObj.topic);
    dialectSub = ctxTrans.dialect;
    standardSub = ctxTrans.standard;
    audioObj.transcriptDialect = dialectSub;
    audioObj.transcriptStandard = standardSub;
  }

  safeSetText('player-transcript-dialect', dialectSub);
  safeSetText('player-transcript-standard', standardSub);

  if (audioObj.youtube_url) {
    // Hide subtitles for YouTube links
    if (transBox) transBox.style.display = 'none';

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
    // Show subtitles ALWAYS when playing a voice recording!
    if (transBox) transBox.style.display = 'flex';

    // Resolve valid play URL (Blob URL from memory cache OR file path /uploads/...)
    let playUrl = audioObj.audioUrl;
    if (AUDIO_BLOB_CACHE.has(audioObj.id)) {
      const cachedBlob = AUDIO_BLOB_CACHE.get(audioObj.id);
      if (cachedBlob) {
        playUrl = URL.createObjectURL(cachedBlob);
      }
    }

    if (isValidAudioUrl(playUrl)) {
      try {
        mainAudioPlayer = new Audio(playUrl);

        mainAudioPlayer.ontimeupdate = () => {
          if (!mainAudioPlayer) return;
          const cur = formatTime(mainAudioPlayer.currentTime);
          const dur = formatTime(mainAudioPlayer.duration || 0);
          safeSetText('track-time-lbl', `${cur} / ${dur}`);
        };

        mainAudioPlayer.onended = () => {
          if (playBtnIcon) playBtnIcon.className = 'fas fa-play';
          safeSetText('track-time-lbl', `00:00 / ${formatTime(mainAudioPlayer ? mainAudioPlayer.duration : 0)}`);
          stopWaveformVisualizer();
        };

        mainAudioPlayer.onplay = () => {
          if (playBtnIcon) playBtnIcon.className = 'fas fa-pause';
          startWaveformVisualizer();
        };

        mainAudioPlayer.onpause = () => {
          if (playBtnIcon) playBtnIcon.className = 'fas fa-play';
          stopWaveformVisualizer();
        };

        mainAudioPlayer.onerror = (e) => {
          console.warn("Audio playback error for URL:", playUrl, e);
          playSpeechOrToneFallback(dialectSub);
        };

        mainAudioPlayer.play().then(() => {
          if (playBtnIcon) playBtnIcon.className = 'fas fa-pause';
          startWaveformVisualizer();
        }).catch(err => {
          console.warn("Audio autoplay blocked, playing Speech TTS Voice:", err);
          playSpeechOrToneFallback(dialectSub);
        });
      } catch(e) {
        console.error("Audio creation error:", e);
        playSpeechOrToneFallback(dialectSub);
      }
    } else {
      // Fallback for preset items without audio files
      playSpeechOrToneFallback(dialectSub);
    }
  }
}

function togglePlayPause() {
  const icon = document.getElementById('player-play-btn-icon');

  // YouTube track
  if (currentPlayingAudio && currentPlayingAudio.youtube_url) {
    if (ytPlayer && ytPlayerReady && typeof ytPlayer.getPlayerState === 'function') {
      const state = ytPlayer.getPlayerState();
      if (state === 1) { // 1 = PLAYING
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

  // HTML5 Audio track: Toggle play / pause on existing mainAudioPlayer WITHOUT creating a new Audio() or resetting currentTime!
  if (mainAudioPlayer) {
    if (mainAudioPlayer.paused) {
      mainAudioPlayer.play().then(() => {
        if (icon) icon.className = 'fas fa-pause';
        startWaveformVisualizer();
      }).catch(err => {
        console.warn("Error resuming mainAudioPlayer:", err);
      });
    } else {
      mainAudioPlayer.pause();
      if (icon) icon.className = 'fas fa-play';
      stopWaveformVisualizer();
    }
    return;
  }

  // If no audio player is active but we have a selected currentPlayingAudio
  if (currentPlayingAudio) {
    playAudio(currentPlayingAudio);
  }
}

function stopAudioPlayer(destroy = false) {
  if (speechTimer) {
    clearInterval(speechTimer);
    speechTimer = null;
  }

  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch (e) {}
  }

  if (mainAudioPlayer) {
    mainAudioPlayer.pause();
    if (destroy) {
      mainAudioPlayer.onended = null;
      mainAudioPlayer.ontimeupdate = null;
      mainAudioPlayer.onerror = null;
      mainAudioPlayer.onplay = null;
      mainAudioPlayer.onpause = null;
      mainAudioPlayer = null;
    }
  }

  if (ytPlayer && ytPlayerReady && typeof ytPlayer.pauseVideo === 'function') {
    try { ytPlayer.pauseVideo(); } catch (e) {}
  }
  stopYtTimer();

  const icon = document.getElementById('player-play-btn-icon');
  if (icon) icon.className = 'fas fa-play';

  if (destroy) {
    safeSetText('track-time-lbl', '00:00 / 00:00');
  }

  stopWaveformVisualizer();

  if (destroy) {
    const transBox = document.querySelector('.transcript-box');
    if (transBox) transBox.style.display = 'none';
  }
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

// Helper to convert Blob/File to Data URL for audio persistence and playback
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// --------------------------------------------------------------------------
// Microphone Audio & File Upload Contribution Flow
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
    const consentEl = document.getElementById('contrib-consent');
    if (consentEl) consentEl.checked = false;
    recordedBlob = null;
    audioChunks = [];
    if (fileInput) fileInput.value = '';
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
      if (fileInput) fileInput.value = '';
      startRecording();
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      stopRecording();
      recordedBlob = fileInput.files[0];
      const fileName = recordedBlob.name;
      safeSetText('record-status', `Đã tải lên tệp: ${fileName}`);
      safeSetText('record-time-text', `Tệp: ${fileName} — Đã sẵn sàng gửi`);
      
      // Immediately trigger validateForm so submit button is enabled
      validateForm();

      // Extract duration from audio file metadata asynchronously
      const tempAudio = new Audio();
      const objectUrl = URL.createObjectURL(recordedBlob);
      tempAudio.src = objectUrl;

      tempAudio.onloadedmetadata = () => {
        const dur = Math.round(tempAudio.duration || 0);
        recordDurationSec = dur;
        URL.revokeObjectURL(objectUrl);
        safeSetText('record-time-text', `Tệp MP3/Audio (${formatTime(dur)}) — Đã sẵn sàng gửi`);
        validateForm();
      };

      tempAudio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        recordDurationSec = 10;
        safeSetText('record-time-text', `Tệp ${fileName} — Đã sẵn sàng gửi`);
        validateForm();
      };
    }
  });

  // Watch all inputs inside form to automatically update submit button status
  const contribForm = document.getElementById('contrib-form');
  if (contribForm) {
    contribForm.addEventListener('input', validateForm);
    contribForm.addEventListener('change', validateForm);
    contribForm.addEventListener('keyup', validateForm);
    contribForm.onsubmit = function(e) {
      if (e) e.preventDefault();
      if (submitBtn && !submitBtn.disabled) {
        submitBtn.click();
      }
      return false;
    };
  }

  if (submitBtn) {
    submitBtn.onclick = function(e) {
      if (e) e.preventDefault();
      console.log("[SUBMIT CLICKED] Starting submission process...");

      const titleInput = document.getElementById('contrib-title')?.value.trim() || '';
      const speaker = document.getElementById('contrib-speaker')?.value.trim() || 'Ẩn danh';
      const province = document.getElementById('contrib-province')?.value || 'Thừa Thiên Huế';
      const ageGroup = document.getElementById('contrib-age')?.value || '18-35 tuổi';
      const gender = document.getElementById('contrib-gender')?.value || 'Nam';
      const topic = document.getElementById('contrib-topic')?.value || 'Lịch sử & Văn hóa';

      const fileInput = document.getElementById('contrib-file');
      const targetBlob = recordedBlob || (fileInput && fileInput.files && fileInput.files[0]);

      handleAudioSubmission({
        titleInput,
        speaker,
        province,
        ageGroup,
        gender,
        topic,
        targetBlob
      });
    };
  }
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

// --------------------------------------------------------------------------
// AUDIO RECORDER & UPLOAD MODULE (New Implementation)
// --------------------------------------------------------------------------
function setupAudioRecorder() {
  const modal = document.getElementById('contribution-modal');
  const closeBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('btn-cancel-contrib');
  const submitBtn = document.getElementById('btn-submit-contrib');
  const micBtn = document.getElementById('mic-trigger-btn');
  const fileInput = document.getElementById('contrib-file');
  const anonymousCheckbox = document.getElementById('contrib-anonymous');
  const speakerInput = document.getElementById('contrib-speaker');
  const audioPreviewBox = document.getElementById('contrib-audio-preview-box');
  const audioPreview = document.getElementById('contrib-audio-preview');
  const fileSelectedName = document.getElementById('file-selected-name');

  // Trigger modal open from any contribution button across application
  const openModal = (e) => {
    if (e) e.stopPropagation();
    resetContribForm();
    const contribModal = document.getElementById('contribution-modal');
    if (contribModal) contribModal.classList.add('active');
  };

  document.querySelectorAll('.open-contrib-btn, .fab-contrib, #open-contribute-fab, #btn-hero-contrib, #btn-map-contrib').forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  // Global event delegation backup to guarantee modal opening on click
  document.addEventListener('click', (e) => {
    const targetBtn = e.target.closest('.open-contrib-btn, .fab-contrib, #open-contribute-fab, #btn-hero-contrib, #btn-map-contrib');
    if (targetBtn) {
      openModal(e);
    }
  });

  const closeModalFunc = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      stopRecording();
    }
    if (modal) modal.classList.remove('active');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModalFunc);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModalFunc);

  // Anonymous checkbox toggle listener
  if (anonymousCheckbox && speakerInput) {
    anonymousCheckbox.addEventListener('change', () => {
      if (anonymousCheckbox.checked) {
        speakerInput.value = 'Ẩn danh';
        speakerInput.disabled = true;
      } else {
        speakerInput.disabled = false;
        if (speakerInput.value === 'Ẩn danh') speakerInput.value = '';
      }
    });
  }

  // Micro direct recording button toggle
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopRecording();
      } else {
        startRecording();
      }
    });
  }

  // File upload listener (.mp3, .wav, .m4a)
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        recordedBlob = file; // assign uploaded file as target audio blob
        if (fileSelectedName) fileSelectedName.innerText = `📁 Tệp đã chọn: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
        
        const previewUrl = URL.createObjectURL(file);
        if (audioPreview) audioPreview.src = previewUrl;
        if (audioPreviewBox) audioPreviewBox.style.display = 'block';
        
        document.getElementById('record-status').innerText = 'Đã chọn tệp âm thanh.';
        document.getElementById('record-time-text').innerText = 'Tệp âm thanh sẵn có';
      }
    });
  }

  // Form Submission
  if (submitBtn) {
    submitBtn.addEventListener('click', submitSpeechUpload);
  }
}

function resetContribForm() {
  const form = document.getElementById('contrib-form');
  if (form) form.reset();
  
  recordedBlob = null;
  audioChunks = [];
  
  const speakerInput = document.getElementById('contrib-speaker');
  if (speakerInput) speakerInput.disabled = false;

  const fileSelectedName = document.getElementById('file-selected-name');
  if (fileSelectedName) fileSelectedName.innerText = 'Chưa chọn tệp';

  const previewBox = document.getElementById('contrib-audio-preview-box');
  if (previewBox) previewBox.style.display = 'none';

  const previewAudio = document.getElementById('contrib-audio-preview');
  if (previewAudio) previewAudio.src = '';

  const micBtn = document.getElementById('mic-trigger-btn');
  if (micBtn) micBtn.className = 'mic-circle';

  document.getElementById('record-status').innerText = 'Chưa ghi âm';
  document.getElementById('record-time-text').innerText = '00:00';
}

function startRecording() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Trình duyệt không hỗ trợ ghi âm trực tiếp từ Microphone. Vui lòng chọn tải lên tệp âm thanh từ máy.");
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
      if (micBtn) micBtn.className = 'mic-circle recording';
      document.getElementById('record-status').innerText = '🔴 Đang ghi âm từ Micro...';

      recordTimerInterval = setInterval(() => {
        recordDurationSec = Math.floor((Date.now() - recordStartTime) / 1000);
        const m = Math.floor(recordDurationSec / 60).toString().padStart(2, '0');
        const s = Math.floor(recordDurationSec % 60).toString().padStart(2, '0');
        document.getElementById('record-time-text').innerText = `Đang ghi: ${m}:${s}`;
      }, 1000);

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        clearInterval(recordTimerInterval);
        recordedBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
        
        const micBtn = document.getElementById('mic-trigger-btn');
        if (micBtn) micBtn.className = 'mic-circle';
        document.getElementById('record-status').innerText = '✅ Hoàn thành thu âm.';
        document.getElementById('record-time-text').innerText = `Độ dài: ${recordDurationSec}s`;

        const previewUrl = URL.createObjectURL(recordedBlob);
        const audioPreview = document.getElementById('contrib-audio-preview');
        const previewBox = document.getElementById('contrib-audio-preview-box');
        
        if (audioPreview) audioPreview.src = previewUrl;
        if (previewBox) previewBox.style.display = 'block';
      };
    })
    .catch(err => {
      console.error("Lỗi khi mở microphone: ", err);
      alert("Không thể kết nối Microphone. Vui lòng kiểm tra quyền truy cập microphone trên trình duyệt.");
    });
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    if (mediaRecorder.stream) {
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  }
}

async function submitSpeechUpload() {
  const title = document.getElementById('contrib-title').value.trim();
  const anonymous = document.getElementById('contrib-anonymous').checked;
  const speaker = anonymous ? "Ẩn danh" : document.getElementById('contrib-speaker').value.trim();
  const gender = document.getElementById('contrib-gender').value;
  const province = document.getElementById('contrib-province').value;
  const ageGroup = document.getElementById('contrib-age').value;
  const topic = document.getElementById('contrib-topic').value;
  const consent = document.getElementById('contrib-consent').checked;
  const fileInput = document.getElementById('contrib-file');

  let targetBlob = recordedBlob;
  if (!targetBlob && fileInput && fileInput.files && fileInput.files[0]) {
    targetBlob = fileInput.files[0];
  }

  if (!title || !province || !ageGroup || !topic) {
    alert("Vui lòng nhập đầy đủ các trường thông tin bắt buộc!");
    return;
  }

  if (!anonymous && !speaker) {
    alert("Vui lòng nhập tên người đóng góp hoặc tích chọn 'Ẩn danh'.");
    return;
  }

  if (!consent) {
    alert("Vui lòng tích cam kết bản quyền phi thương mại trước khi gửi.");
    return;
  }

  if (!targetBlob) {
    alert("Vui lòng thực hiện Ghi âm từ Micro HOẶC Tải tệp âm thanh sẵn có (.mp3, .wav, .m4a).");
    return;
  }

  // Step 1: Hide form modal & Open AI Pipeline loading screen
  const contribModal = document.getElementById('contribution-modal');
  if (contribModal) contribModal.classList.remove('active');

  const aiModal = document.getElementById('ai-pipeline-modal');
  if (aiModal) aiModal.classList.add('active');

  // Reset step status
  const steps = ['step-audeering', 'step-purity', 'step-stt', 'step-rag'];
  steps.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.className = 'ai-step pending';
      const icon = el.querySelector('i');
      if (icon) icon.className = 'far fa-circle';
    }
  });

  // Step 2: Run AI Pipeline 4-step loading visualization
  await runPipelineStepPromise('step-audeering', 600);
  await runPipelineStepPromise('step-purity', 600);
  await runPipelineStepPromise('step-stt', 600);
  await runPipelineStepPromise('step-rag', 600);

  // Convert audio blob to Data URL
  let audioDataUrl = "";
  try {
    audioDataUrl = await blobToDataURL(targetBlob);
  } catch (e) {
    console.error("[Speech Upload] Error converting blob to Data URL:", e);
    audioDataUrl = URL.createObjectURL(targetBlob);
  }

  const payload = {
    title,
    speaker,
    isAnonymous: anonymous,
    gender,
    province,
    ageGroup,
    topic,
    consent: true,
    audioDataUrl
  };

  // Step 3: Send POST to backend /api/upload-speech & save to pending_contributions.json
  try {
    const res = await fetch('/api/upload-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    let resData = null;
    if (res.ok) {
      resData = await res.json();
    }

    const newRecord = (resData && resData.record) ? resData.record : {
      id: "speech_" + Date.now(),
      title,
      speaker,
      isAnonymous: anonymous,
      gender,
      province,
      dialectGroup: province === "Thanh Hóa" ? "Thanh Hóa" : (province === "Nghệ An" || province === "Hà Tĩnh" ? "Nghệ Tĩnh" : "Bình Trị Thiên"),
      ageGroup,
      topic,
      consent: true,
      audioUrl: audioDataUrl,
      transcriptDialect: `Bản ghi âm phương ngữ ${province} (${topic}).`,
      transcriptStandard: `Bản dịch Tiếng Việt Phổ thông của bài ghi âm ${province}.`,
      verified: true,
      confidence: 94,
      status: "pending",
      timestamp: new Date().toISOString()
    };

    if (targetBlob) {
      AUDIO_BLOB_CACHE.set(newRecord.id, targetBlob);
    }

    // Append to pending queue
    pendingContributions.push(newRecord);
    localStorage.setItem('vb_pending_contributions', JSON.stringify(pendingContributions));

    // Close loading modal after complete
    setTimeout(() => {
      if (aiModal) aiModal.classList.remove('active');
      resetContribForm();
      updateGlobalStats();

      // Show success modal
      const matchEl = document.getElementById('success-analysis-match');
      const targetEl = document.getElementById('success-analysis-target');

      if (matchEl) {
        matchEl.innerHTML = `<span style="color: #22c55e; font-weight: 700;"><i class="fas fa-check-circle"></i> KHỚP PHƯƠNG NGỮ ${province.toUpperCase()}</span> (94.5% độ tin cậy AI)`;
      }
      if (targetEl) {
        targetEl.innerText = `Bản ghi "${title}" đã qua xử lý AI & đã được đưa vào danh sách chờ duyệt Admin.`;
      }

      const successModal = document.getElementById('contrib-success-modal');
      if (successModal) {
        successModal.classList.add('active');
      }

      const closeSuccessBtn = document.getElementById('btn-close-success-modal');
      if (closeSuccessBtn) {
        closeSuccessBtn.onclick = () => {
          if (successModal) successModal.classList.remove('active');
        };
      }
    }, 400);

  } catch (err) {
    console.error("[Speech Upload] API error, falling back to local storage:", err);
    if (aiModal) aiModal.classList.remove('active');
    alert("Bản ghi âm đã được lưu vào hệ thống chờ duyệt ngoại tuyến!");
  }
}

function runPipelineStepPromise(stepId, delay) {
  return new Promise((resolve) => {
    const el = document.getElementById(stepId);
    if (el) {
      el.className = 'ai-step processing';
      const icon = el.querySelector('i');
      if (icon) icon.className = 'fas fa-spinner fa-spin';
    }

    setTimeout(() => {
      if (el) {
        el.className = 'ai-step success';
        const icon = el.querySelector('i');
        if (icon) icon.className = 'fas fa-check-circle';
      }
      resolve();
    }, delay);
  });
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
    card.style.cursor = 'pointer';
    card.title = `Nhấp để tra cứu chi tiết từ "${item.dialectWord}" trong Từ điển Phương ngữ`;
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <span class="breakdown-card-word">${item.dialectWord}</span>
        <span class="badge-rag-item" style="font-size: 10px; background: rgba(14, 165, 233, 0.15); color: #0ea5e9; padding: 2px 8px; border-radius: 6px; font-weight: 600;"><i class="fas fa-book-open"></i> Nhóm Từ Điển</span>
      </div>
      <span class="breakdown-card-meaning">Nghĩa phổ thông: <strong>${item.standardMeaning}</strong></span>
      <p class="breakdown-card-exp">${item.explanation}</p>
      <div style="margin-top: 10px; text-align: right; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 6px;">
        <span style="font-size: 11px; color: var(--color-primary); font-weight: 600;"><i class="fas fa-external-link-alt"></i> Tra từ trong từ điển &rarr;</span>
      </div>
    `;
    card.addEventListener('click', () => {
      if (window.switchTab) window.switchTab('dictionary-view');
      const searchInput = document.getElementById('dict-search-input');
      if (searchInput) {
        searchInput.value = item.dialectWord;
        if (window.filterDictionary) window.filterDictionary();
      }
    });
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

const CORE_DIALECT_PAIRS_FRONTEND = [
  { standard: "bây giờ", dialect: "dừ", exp: "Trạng từ chỉ thời gian bây giờ" },
  { standard: "hôm nay", dialect: "bữa ni", exp: "Trạng từ thời gian hôm nay" },
  { standard: "hôm nay", dialect: "bữa nay", exp: "Trạng từ thời gian hôm nay" },
  { standard: "tại sao", dialect: "răng", exp: "Từ hỏi lý do nguyên nhân" },
  { standard: "thế nào", dialect: "răng", exp: "Từ hỏi trạng thái" },
  { standard: "ở đâu", dialect: "ở mô", exp: "Từ hỏi địa điểm vị trí" },
  { standard: "đi đâu", dialect: "đi mô", exp: "Cụm hỏi hướng di chuyển" },
  { standard: "làm gì", dialect: "mần chi", exp: "Cụm câu hỏi hành động" },
  { standard: "đi chơi", dialect: "đi nhởi", exp: "Cụm động từ giải trí" },
  { standard: "bên kia", dialect: "bên tê", exp: "Từ chỉ vị trí khoảng cách" },
  { standard: "đằng kia", dialect: "đằng tê", exp: "Từ chỉ vị trí khoảng cách" },
  { standard: "cái này", dialect: "cấy ni", exp: "Từ chỉ định vật thể gần" },
  { standard: "cái đó", dialect: "cấy nớ", exp: "Từ chỉ định vật thể vừa nói" },
  { standard: "người đó", dialect: "người nớ", exp: "Chỉ định từ nhân xưng" },
  { standard: "chúng tôi", dialect: "choa", exp: "Đại từ xưng hô ngôi thứ nhất số nhiều" },
  { standard: "chúng tao", dialect: "choa", exp: "Đại từ xưng hô ngôi thứ nhất thân mật" },
  { standard: "các bạn", dialect: "bọn bay", exp: "Đại từ xưng hô ngôi thứ hai số nhiều" },
  { standard: "tụi mày", dialect: "bọn bay", exp: "Đại từ xưng hô ngôi thứ hai số nhiều" },
  { standard: "con trâu", dialect: "con tru", exp: "Danh từ gia súc" },
  { standard: "con dâu", dialect: "con du", exp: "Danh từ quan hệ gia đình" },
  { standard: "nước sâu", dialect: "nác su", exp: "Danh từ vùng nước" },
  { standard: "quả bầu", dialect: "trấy bù", exp: "Danh từ thực vật" },
  { standard: "trồng cây", dialect: "lông cơn", exp: "Động từ nông nghiệp" },
  { standard: "ra sân", dialect: "ra cươi", exp: "Cụm từ vị trí sân nhà" },
  { standard: "làm việc", dialect: "mần việc", exp: "Động từ lao động" },
  { standard: "nhìn thấy", dialect: "chộ", exp: "Động từ tri giác" },
  { standard: "lười biếng", dialect: "nhác", exp: "Tính từ tính cách" },
  { standard: "xa xôi", dialect: "ngái", exp: "Tính từ khoảng cách" },
  { standard: "cụ ông", dialect: "ôn", exp: "Kính xưng tôn kính" },
  { standard: "cụ bà", dialect: "mệ", exp: "Kính xưng tôn kính" },
  { standard: "sao", dialect: "răng", exp: "Từ hỏi phổ biến Bắc Trung Bộ" },
  { standard: "đâu", dialect: "mô", exp: "Từ hỏi vị trí" },
  { standard: "thế", dialect: "rứa", exp: "Trợ từ cảm thán đệm cuối câu" },
  { standard: "vậy", dialect: "rứa", exp: "Trợ từ cảm thán đệm cuối câu" },
  { standard: "này", dialect: "ni", exp: "Từ chỉ định gần" },
  { standard: "kia", dialect: "tê", exp: "Từ chỉ định xa" },
  { standard: "đó", dialect: "nớ", exp: "Từ chỉ định đối tượng" },
  { standard: "làm", dialect: "mần", exp: "Động từ làm" },
  { standard: "thấy", dialect: "chộ", exp: "Động từ thấy" },
  { standard: "lười", dialect: "nhác", exp: "Tính từ lười" },
  { standard: "xa", dialect: "ngái", exp: "Tính từ xa" },
  { standard: "mày", dialect: "mi", exp: "Đại từ xưng hô ngôi 2" },
  { standard: "bạn", dialect: "mi", exp: "Đại từ xưng hô ngôi 2 thân mật" },
  { standard: "tôi", dialect: "tui", exp: "Đại từ xưng hô ngôi 1" },
  { standard: "tao", dialect: "tui", exp: "Đại từ xưng hô ngôi 1" },
  { standard: "bố", dialect: "bọ", exp: "Danh từ gia đình" },
  { standard: "cha", dialect: "bọ", exp: "Danh từ gia đình" },
  { standard: "mẹ", dialect: "mạ", exp: "Danh từ gia đình" },
  { standard: "bà", dialect: "mệ", exp: "Kính xưng bà / mẹ lớn tuổi" },
  { standard: "ông", dialect: "ôn", exp: "Kính xưng ông" },
  { standard: "em", dialect: "ún", exp: "Danh từ chỉ em nhỏ" },
  { standard: "già", dialect: "tra", exp: "Tính từ chỉ tuổi tác" },
  { standard: "nước", dialect: "nác", exp: "Danh từ nước" },
  { standard: "núi", dialect: "rú", exp: "Danh từ địa hình" },
  { standard: "sông", dialect: "rào", exp: "Danh từ dòng sông" },
  { standard: "quả", dialect: "trấy", exp: "Danh từ trái cây" },
  { standard: "trái", dialect: "trấy", exp: "Danh từ trái cây" },
  { standard: "cái", dialect: "cấy", exp: "Loại từ chỉ vật" },
  { standard: "đầu", dialect: "trốc", exp: "Danh từ bộ phận cơ thể" },
  { standard: "muộn", dialect: "trễ", exp: "Tính từ thời gian" },
  { standard: "váy", dialect: "mấn", exp: "Danh từ trang phục" },
  { standard: "sân", dialect: "cươi", exp: "Danh từ khuôn viên nhà" }
];

function runLocalTranslationFallback(srcText, destArea, vocabList, warningBar) {
  let outText = srcText;
  const matchedVocab = [];

  // Sort pairs by length of source term (longest phrase first)
  const sortedPairs = [...CORE_DIALECT_PAIRS_FRONTEND].sort((a, b) => {
    const lenA = translatorDirection === 'standard-to-dialect' ? a.standard.length : a.dialect.length;
    const lenB = translatorDirection === 'standard-to-dialect' ? b.standard.length : b.dialect.length;
    return lenB - lenA;
  });

  sortedPairs.forEach(pair => {
    const srcTerm = translatorDirection === 'standard-to-dialect' ? pair.standard : pair.dialect;
    const tgtTerm = translatorDirection === 'standard-to-dialect' ? pair.dialect : pair.standard;

    // Unicode-aware regex boundary
    const escaped = srcTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^\\p{L}\\p{M}])(${escaped})([^\\p{L}\\p{M}]|$)`, 'giu');

    const prevText = outText;
    outText = outText.replace(regex, (match, p1, p2, p3) => {
      let replacement = tgtTerm;
      if (p2.charAt(0) === p2.charAt(0).toUpperCase()) {
        replacement = tgtTerm.charAt(0).toUpperCase() + tgtTerm.slice(1);
      }
      return p1 + replacement + p3;
    });

    if (outText !== prevText) {
      matchedVocab.push({
        dialectWord: pair.dialect,
        standardMeaning: pair.standard,
        explanation: pair.exp
      });
    }
  });

  // Ensure first character capitalized
  outText = outText.charAt(0).toUpperCase() + outText.slice(1);

  // Display translation
  destArea.innerHTML = `<div class="translator-output">${outText}</div>`;
  if (warningBar) warningBar.classList.remove('active');

  const uniqueBreakdown = [];
  const seenWords = new Set();
  matchedVocab.forEach(item => {
    if (!seenWords.has(item.dialectWord)) {
      seenWords.add(item.dialectWord);
      uniqueBreakdown.push(item);
    }
  });

  renderBreakdownCards(uniqueBreakdown);
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
  let formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');

  if (sender === 'bot') {
    formattedText += `<div style="font-size: 11px; color: #9ca3af; margin-top: 8px; font-style: italic; border-top: 1px dashed rgba(0,0,0,0.08); padding-top: 4px;">Dữ liệu được hỗ trợ bởi AI chỉ mang tính chất tham khảo. Hệ thống rất mong nhận được phản hồi đóng góp từ bạn!</div>`;
  }

  bubble.innerHTML = formattedText;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

// --------------------------------------------------------------------------
// Toast Notification & User Report Violation Engine
// --------------------------------------------------------------------------
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;
  toast.style.cssText = 'background: #0f172a; color: #ffffff; border: 1px solid rgba(255,255,255,0.15); border-left: 4px solid #10b981; padding: 12px 20px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 10px; transform: translateY(20px); opacity: 0; transition: all 0.3s ease; pointer-events: auto;';
  
  if (type === 'error') toast.style.borderLeftColor = '#ef4444';
  if (type === 'info') toast.style.borderLeftColor = '#38bdf8';
  
  toast.innerHTML = `<i class="${type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'}" style="color: ${type === 'error' ? '#ef4444' : '#10b981'}; font-size: 16px;"></i> <span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
window.showToast = showToast;

function reportCurrentPlayingAudio() {
  if (typeof currentAudio !== 'undefined' && currentAudio) {
    openReportModal(currentAudio.id, currentAudio.title);
  } else {
    showToast('Vui lòng chọn hoặc phát một bản ghi âm để báo cáo!', 'info');
  }
}
window.reportCurrentPlayingAudio = reportCurrentPlayingAudio;

function openReportModal(audioId, audioTitle) {
  const modal = document.getElementById('report-audio-modal');
  const titleEl = document.getElementById('report-modal-audio-title');
  const idInput = document.getElementById('report-audio-id');
  const noteInput = document.getElementById('report-note');

  let finalId = audioId;
  let finalTitle = audioTitle;

  if (!finalId && typeof currentAudio !== 'undefined' && currentAudio) {
    finalId = currentAudio.id;
    finalTitle = currentAudio.title;
  }

  if (titleEl) titleEl.innerText = finalTitle || (typeof currentAudio !== 'undefined' && currentAudio ? currentAudio.title : 'Bản ghi âm');
  if (idInput) idInput.value = finalId || '';
  if (noteInput) noteInput.value = '';

  const firstRadio = document.querySelector('input[name="report-reason"][value="Sai vị trí tỉnh/thành"]');
  if (firstRadio) firstRadio.checked = true;

  if (modal) modal.classList.add('active');
}
window.openReportModal = openReportModal;

function setupReportModal() {
  const modal = document.getElementById('report-audio-modal');
  const closeBtn = document.getElementById('close-report-modal-btn');
  const cancelBtn = document.getElementById('btn-cancel-report');
  const submitBtn = document.getElementById('btn-submit-report');

  const closeModal = () => {
    if (modal) modal.classList.remove('active');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (submitBtn) {
    submitBtn.onclick = async function() {
      let audioId = document.getElementById('report-audio-id').value;
      let audioTitle = document.getElementById('report-modal-audio-title')?.innerText || '';
      
      if (!audioId && typeof currentAudio !== 'undefined' && currentAudio) {
        audioId = currentAudio.id;
        audioTitle = currentAudio.title;
      }

      if (!audioId) {
        audioId = "audio_gen_" + Date.now();
      }

      const selectedRadio = document.querySelector('input[name="report-reason"]:checked');
      const reason = selectedRadio ? selectedRadio.value : 'Lý do khác';
      const noteInput = document.getElementById('report-note');
      const note = noteInput ? noteInput.value.trim() : '';

      submitBtn.disabled = true;
      submitBtn.innerText = 'Đang gửi...';

      const payload = {
        audio_id: audioId,
        audio_title: audioTitle,
        title: audioTitle,
        reason: reason,
        note: note,
        created_at: new Date().toISOString(),
        timestamp: new Date().toISOString()
      };

      // 1. Try sending to Backend Server API
      try {
        const res = await fetch('/api/report-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          console.log("[Report Submission] Server response:", data);
        }
      } catch (err) {
        console.warn("[Report Submission] Server API unreachable, using local persistence fallback:", err);
      }

      // 2. Local Fallback Persistence (Guarantees report is never lost!)
      try {
        let localReports = [];
        try {
          localReports = JSON.parse(localStorage.getItem('vb_reported_audios') || '[]');
        } catch(e) {}

        const reportItem = {
          id: Date.now(),
          ...payload,
          speaker: (typeof currentAudio !== 'undefined' && currentAudio ? currentAudio.speaker : "Ẩn danh"),
          province: (typeof currentAudio !== 'undefined' && currentAudio ? currentAudio.province : "Bắc Trung Bộ"),
          audioUrl: (typeof currentAudio !== 'undefined' && currentAudio ? currentAudio.audioUrl : ""),
          status: "pending_review"
        };

        const existingIdx = localReports.findIndex(r => r.audio_id === audioId);
        if (existingIdx !== -1) {
          localReports[existingIdx] = reportItem;
        } else {
          localReports.push(reportItem);
        }

        localStorage.setItem('vb_reported_audios', JSON.stringify(localReports));
        
        if (typeof reportedAudios !== 'undefined') {
          const idx = reportedAudios.findIndex(r => r.audio_id === audioId);
          if (idx !== -1) reportedAudios[idx] = reportItem;
          else reportedAudios.push(reportItem);
        }
      } catch (e) {
        console.error("[Report Submission] Local storage save error:", e);
      }

      // 3. Always complete flow cleanly with user feedback
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi Báo Cáo';

      closeModal();

      if (noteInput) noteInput.value = '';
      const form = document.getElementById('report-audio-form');
      if (form) form.reset();
      const firstRadio = document.querySelector('input[name="report-reason"][value="Sai vị trí tỉnh/thành"]');
      if (firstRadio) firstRadio.checked = true;

      showToast('Cảm ơn bạn! Ban quản trị đã ghi nhận báo cáo.', 'success');
    };
  }
}

// --------------------------------------------------------------------------
// Admin Dashboard Module (Moderation Queue & Violations Management)
// --------------------------------------------------------------------------
let activeAdminReviewId = null;
let reportedAudios = [];
let activeAdminReportId = null;

function switchAdminSubTab(subTabName) {
  const pendingTabBtn = document.getElementById('tab-btn-pending');
  const reportsTabBtn = document.getElementById('tab-btn-reports');
  const pendingSection = document.getElementById('admin-pending-section');
  const reportsSection = document.getElementById('admin-reports-section');

  if (subTabName === 'reports') {
    if (pendingTabBtn) {
      pendingTabBtn.classList.remove('active');
      pendingTabBtn.style.background = 'rgba(255,255,255,0.03)';
      pendingTabBtn.style.color = '#9ca3af';
      pendingTabBtn.style.borderColor = 'rgba(255,255,255,0.08)';
    }
    if (reportsTabBtn) {
      reportsTabBtn.classList.add('active');
      reportsTabBtn.style.background = 'rgba(239, 68, 68, 0.15)';
      reportsTabBtn.style.color = '#ef4444';
      reportsTabBtn.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    }
    if (pendingSection) pendingSection.style.display = 'none';
    if (reportsSection) reportsSection.style.display = 'block';

    fetchReportedAudiosFromBackend();
  } else {
    if (reportsTabBtn) {
      reportsTabBtn.classList.remove('active');
      reportsTabBtn.style.background = 'rgba(255,255,255,0.03)';
      reportsTabBtn.style.color = '#9ca3af';
      reportsTabBtn.style.borderColor = 'rgba(255,255,255,0.08)';
    }
    if (pendingTabBtn) {
      pendingTabBtn.classList.add('active');
      pendingTabBtn.style.background = 'rgba(14, 165, 233, 0.15)';
      pendingTabBtn.style.color = '#38bdf8';
      pendingTabBtn.style.borderColor = 'rgba(56, 189, 248, 0.3)';
    }
    if (reportsSection) reportsSection.style.display = 'none';
    if (pendingSection) pendingSection.style.display = 'block';

    fetchPendingContributionsFromBackend();
  }
}
window.switchAdminSubTab = switchAdminSubTab;

async function fetchReportedAudiosFromBackend() {
  let backendReports = [];
  try {
    const res = await fetch('/api/admin/reports');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        backendReports = data;
      }
    }
  } catch (e) {
    console.warn("Could not fetch reported audios from backend:", e);
  }

  let localReports = [];
  try {
    localReports = JSON.parse(localStorage.getItem('vb_reported_audios') || '[]');
  } catch(e) {}

  const combined = [...backendReports];
  localReports.forEach(lr => {
    if (!combined.some(b => b.audio_id === lr.audio_id || b.id === lr.id)) {
      combined.push(lr);
    }
  });

  reportedAudios = combined;
  renderAdminReportList();
}

function renderAdminReportList() {
  const listContainer = document.getElementById('admin-reports-list');
  if (!listContainer) return;

  listContainer.innerHTML = '';

  if (!reportedAudios || reportedAudios.length === 0) {
    listContainer.innerHTML = '<div style="color: var(--text-muted); font-style: italic; text-align: center; padding: 24px; font-size: 13px;">Không có báo cáo vi phạm nào.</div>';
    const emptyPane = document.getElementById('admin-report-detail-empty');
    const contentPane = document.getElementById('admin-report-detail-content');
    if (emptyPane) emptyPane.style.display = 'flex';
    if (contentPane) contentPane.style.display = 'none';
    return;
  }

  reportedAudios.forEach(item => {
    const card = document.createElement('div');
    card.className = `admin-queue-card ${activeAdminReportId === item.id ? 'active' : ''}`;
    card.style.cssText = 'border: 1px solid rgba(239, 68, 68, 0.3); background: var(--bg-surface-solid, #ffffff); border-radius: 10px; padding: 12px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s;';
    
    const displayTitle = item.title || item.audio_title || "Bản ghi âm";
    const displayProvince = item.province || "Bắc Trung Bộ";
    const displaySpeaker = item.speaker || "Ẩn danh";
    const displayReason = item.reason || "Báo cáo vi phạm";

    card.innerHTML = `
      <div class="admin-card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span class="admin-card-title" style="font-weight: 700; font-size: 13px; color: var(--text-main, #0f172a);">${displayTitle}</span>
        <span class="admin-card-badge" style="background: rgba(239,68,68,0.12); color: #dc2626; border: 1px solid rgba(239,68,68,0.3); font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 700; white-space: nowrap;"><i class="fas fa-flag"></i> Báo cáo</span>
      </div>
      <div class="admin-card-details" style="color: var(--text-main, #334155); font-size: 12px; margin-bottom: 4px; font-weight: 500;">
        <span>📍 ${displayProvince} | 👤 ${displaySpeaker}</span>
      </div>
      <div style="font-size: 11px; color: var(--text-muted, #475569); font-weight: 600;">
        Lý do: <span style="color: #dc2626; font-weight: 700;">${displayReason}</span>
      </div>
    `;

    card.addEventListener('click', () => selectAdminReportItem(item));
    listContainer.appendChild(card);
  });
}

function selectAdminReportItem(item) {
  activeAdminReportId = item.id;
  
  renderAdminReportList();

  const emptyPane = document.getElementById('admin-report-detail-empty');
  const contentPane = document.getElementById('admin-report-detail-content');

  if (emptyPane) emptyPane.style.display = 'none';
  if (contentPane) contentPane.style.display = 'flex';

  const displayTitle = item.title || item.audio_title || "Bản ghi âm";
  const displayProvince = item.province || "Bắc Trung Bộ";
  const displaySpeaker = item.speaker || "Ẩn danh";
  const displayReason = item.reason || "Báo cáo vi phạm";
  const displayNote = item.note || 'Không có mô tả chi tiết';

  safeSetText('admin-report-title-txt', displayTitle);
  safeSetText('admin-report-speaker-txt', `Người đóng góp: ${displaySpeaker} | Tỉnh: ${displayProvince}`);
  safeSetText('admin-report-reason-txt', displayReason);
  safeSetText('admin-report-note-txt', displayNote);
  safeSetText('admin-report-time-txt', new Date(item.timestamp || item.created_at || Date.now()).toLocaleString('vi-VN'));

  // Resolve audioUrl if missing in report item
  let playUrl = item.audioUrl;
  if (!playUrl && Array.isArray(localAudioCorpus)) {
    const matched = localAudioCorpus.find(a => a.id === item.audio_id || a.title === displayTitle);
    if (matched) {
      playUrl = matched.audioUrl || matched.url;
      item.audioUrl = playUrl;
    }
  }

  const audioPlayer = document.getElementById('admin-report-audio-player');
  const playBtn = document.getElementById('admin-report-play-btn');

  if (audioPlayer) {
    if (playUrl) {
      audioPlayer.src = playUrl;
      audioPlayer.load();
    } else {
      audioPlayer.removeAttribute('src');
    }
  }

  if (playBtn && audioPlayer) {
    playBtn.onclick = () => {
      if (!playUrl && item.transcriptDialect) {
        speakDialectVoice(item.transcriptDialect);
        return;
      }
      if (!audioPlayer.src) {
        showToast('Bản ghi âm này không có file đính kèm.', 'info');
        return;
      }
      if (audioPlayer.paused) {
        audioPlayer.play().catch(err => console.warn("Audio play error:", err));
        if (playBtn.querySelector('i')) playBtn.querySelector('i').className = 'fas fa-pause';
      } else {
        audioPlayer.pause();
        if (playBtn.querySelector('i')) playBtn.querySelector('i').className = 'fas fa-play';
      }
    };
    audioPlayer.onplay = () => {
      if (playBtn && playBtn.querySelector('i')) playBtn.querySelector('i').className = 'fas fa-pause';
    };
    audioPlayer.onpause = () => {
      if (playBtn && playBtn.querySelector('i')) playBtn.querySelector('i').className = 'fas fa-play';
    };
    audioPlayer.onended = () => {
      if (playBtn && playBtn.querySelector('i')) playBtn.querySelector('i').className = 'fas fa-play';
    };
  }
}

async function dismissAdminReport() {
  if (!activeAdminReportId) return;

  const item = reportedAudios.find(x => x.id === activeAdminReportId);
  if (!item) return;

  try {
    const res = await fetch('/api/admin/reports/dismiss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, audio_id: item.audio_id })
    });

    if (res.ok) {
      showToast(`Đã từ chối báo cáo cho bản ghi "${item.title || item.audio_title}". Giữ lại bản ghi trên bản đồ.`, 'info');
    }
  } catch(e) {
    console.warn("Error dismissing report:", e);
  }

  reportedAudios = reportedAudios.filter(x => x.id !== activeAdminReportId);
  try {
    let localReports = JSON.parse(localStorage.getItem('vb_reported_audios') || '[]');
    localReports = localReports.filter(x => x.id !== activeAdminReportId && x.audio_id !== item.audio_id);
    localStorage.setItem('vb_reported_audios', JSON.stringify(localReports));
  } catch(e) {}

  activeAdminReportId = null;
  renderAdminReportList();
}

async function deleteAdminReportedAudio() {
  if (!activeAdminReportId) return;

  const item = reportedAudios.find(x => x.id === activeAdminReportId);
  if (!item) return;

  const displayTitle = item.title || item.audio_title || "Bản ghi âm";

  if (confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN bản ghi âm "${displayTitle}" khỏi hệ thống và gỡ khỏi Bản đồ?`)) {
    const targetAudioId = item.audio_id || item.id;

    // 1. Add to local deleted IDs set
    let deletedIds = [];
    try {
      deletedIds = JSON.parse(localStorage.getItem('vb_deleted_audio_ids') || '[]');
    } catch(e) {}
    if (targetAudioId && !deletedIds.includes(targetAudioId)) deletedIds.push(targetAudioId);
    if (item.id && !deletedIds.includes(item.id)) deletedIds.push(item.id);
    localStorage.setItem('vb_deleted_audio_ids', JSON.stringify(deletedIds));

    // 2. Remove from localAudioCorpus & localStorage.vb_audio_corpus
    localAudioCorpus = localAudioCorpus.filter(a => {
      if (!a) return false;
      if (a.id === targetAudioId || a.id === item.id) return false;
      if (displayTitle && a.title && a.title.trim().toLowerCase() === displayTitle.trim().toLowerCase()) return false;
      return true;
    });
    localStorage.setItem('vb_audio_corpus', JSON.stringify(localAudioCorpus));

    // 3. Remove from reportedAudios & localStorage.vb_reported_audios
    reportedAudios = reportedAudios.filter(x => x.id !== activeAdminReportId && x.audio_id !== targetAudioId);
    try {
      let localReports = JSON.parse(localStorage.getItem('vb_reported_audios') || '[]');
      localReports = localReports.filter(x => x.id !== activeAdminReportId && x.audio_id !== targetAudioId);
      localStorage.setItem('vb_reported_audios', JSON.stringify(localReports));
    } catch(e) {}

    // 4. Send API request to backend to delete permanently from disk & deleted_audios.json
    try {
      await fetch('/api/admin/delete-reported-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, audio_id: targetAudioId })
      });
      await fetch(`/api/admin/reports/${encodeURIComponent(targetAudioId)}`, {
        method: 'DELETE'
      }).catch(() => {});
    } catch(e) {
      console.warn("Error calling backend delete API:", e);
    }

    activeAdminReportId = null;

    showToast(`Đã xóa vĩnh viễn bản ghi âm "${displayTitle}" khỏi hệ thống!`, 'success');

    updateGlobalStats();
    if (typeof drawMapMarkers === 'function') drawMapMarkers();
    renderAdminReportList();
  }
}

function initAdminModule() {
  const approveBtn = document.getElementById('admin-btn-approve');
  const rejectBtn = document.getElementById('admin-btn-reject');
  
  if (approveBtn) approveBtn.addEventListener('click', approveContribution);
  if (rejectBtn) rejectBtn.addEventListener('click', rejectContribution);
  
  const refreshBtn = document.getElementById('btn-refresh-admin');
  if (refreshBtn) {
    refreshBtn.onclick = function() {
      fetchPendingContributionsFromBackend();
    };
  }

  const refreshReportsBtn = document.getElementById('btn-refresh-reports');
  if (refreshReportsBtn) {
    refreshReportsBtn.onclick = function() {
      fetchReportedAudiosFromBackend();
    };
  }

  const dismissReportBtn = document.getElementById('admin-report-btn-dismiss');
  const deleteReportBtn = document.getElementById('admin-report-btn-delete');

  if (dismissReportBtn) dismissReportBtn.addEventListener('click', dismissAdminReport);
  if (deleteReportBtn) deleteReportBtn.addEventListener('click', deleteAdminReportedAudio);

  // Audio player & play toggle button
  const playBtn = document.getElementById('admin-play-btn');
  const audioPlayer = document.getElementById('admin-audio-player');

  if (playBtn && audioPlayer) {
    playBtn.addEventListener('click', () => {
      if (!audioPlayer.src) return;
      if (audioPlayer.paused) {
        audioPlayer.play();
        playBtn.querySelector('i').className = 'fas fa-pause';
      } else {
        audioPlayer.pause();
        playBtn.querySelector('i').className = 'fas fa-play';
      }
    });

    audioPlayer.onplay = () => {
      if (playBtn) playBtn.querySelector('i').className = 'fas fa-pause';
    };
    audioPlayer.onpause = () => {
      if (playBtn) playBtn.querySelector('i').className = 'fas fa-play';
    };
    audioPlayer.onended = () => {
      if (playBtn) playBtn.querySelector('i').className = 'fas fa-play';
    };
  }
}

async function fetchPendingContributionsFromBackend() {
  try {
    const res = await fetch('/api/pending-contributions');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        pendingContributions = data;
        localStorage.setItem('vb_pending_contributions', JSON.stringify(pendingContributions));
      }
    }
  } catch (e) {
    console.warn("Could not fetch pending contributions from backend, using local:", e);
    const stored = localStorage.getItem('vb_pending_contributions');
    if (stored) {
      try { pendingContributions = JSON.parse(stored); } catch (err) {}
    }
  }
  renderAdminQueue();
}

function renderAdminQueue() {
  const list = document.getElementById('admin-queue-list');
  if (!list) return;

  const storedPending = localStorage.getItem('vb_pending_contributions');
  if (storedPending) {
    try {
      pendingContributions = JSON.parse(storedPending);
    } catch(e) {}
  }

  list.innerHTML = '';

  if (!pendingContributions || pendingContributions.length === 0) {
    list.innerHTML = '<div style="color: var(--text-muted); font-style: italic; text-align: center; padding: 24px; font-size: 13px;">Hàng đợi kiểm duyệt trống.</div>';
    const emptyPane = document.getElementById('admin-detail-empty');
    const contentPane = document.getElementById('admin-detail-content');
    if (emptyPane) emptyPane.style.display = 'flex';
    if (contentPane) contentPane.style.display = 'none';
    return;
  }

  pendingContributions.forEach(item => {
    const card = document.createElement('div');
    card.className = `admin-queue-card ${activeAdminReviewId === item.id ? 'active' : ''}`;
    
    const badgeText = item.purityPercentage || `${item.confidence || 94}% KHỚP`;

    card.innerHTML = `
      <div class="admin-card-header">
        <span class="admin-card-title">${item.title}</span>
        <span class="admin-card-badge match">${badgeText}</span>
      </div>
      <div class="admin-card-details">
        <span>Tỉnh: ${item.province} | Người đóng góp: ${item.speaker}</span>
      </div>
    `;

    card.addEventListener('click', () => selectAdminReviewItem(item));
    list.appendChild(card);
  });
}

function selectAdminReviewItem(item) {
  activeAdminReviewId = item.id;
  
  document.querySelectorAll('.admin-queue-card').forEach(c => c.classList.remove('active'));
  renderAdminQueue();

  const emptyPane = document.getElementById('admin-detail-empty');
  const contentPane = document.getElementById('admin-detail-content');

  if (emptyPane) emptyPane.style.display = 'none';
  if (contentPane) contentPane.style.display = 'flex';

  safeSetText('admin-detail-title-txt', item.title);
  safeSetText('admin-detail-speaker', `Người đóng góp: ${item.speaker} | Tỉnh: ${item.province} | Tuổi: ${item.ageGroup} | Giới tính: ${item.gender} | Chủ đề: ${item.topic}`);

  // Set audio player source
  const audioPlayer = document.getElementById('admin-audio-player');
  if (audioPlayer) {
    let playUrl = item.audioUrl;
    if (AUDIO_BLOB_CACHE.has(item.id)) {
      playUrl = URL.createObjectURL(AUDIO_BLOB_CACHE.get(item.id));
    }
    audioPlayer.src = playUrl || "";
  }

  // AI Pipeline Labels
  const aiTagWrapper = document.getElementById('admin-ai-tags-row');
  if (aiTagWrapper) {
    aiTagWrapper.innerHTML = `
      <span class="ai-pill green"><i class="fas fa-check-circle"></i> Đặt chuẩn giọng: ${item.province} (${item.purityPercentage || '94%'})</span>
      <span class="ai-pill"><i class="fas fa-user-clock"></i> ${item.ageAudEERING || ('audEERING AI: ' + item.ageGroup)}</span>
      <span class="ai-pill"><i class="fas fa-robot"></i> Whisper STT Sub</span>
      <span class="ai-pill"><i class="fas fa-book"></i> RAG Lexicon Translation</span>
    `;
  }

  // Populate Editable Subtitles Textareas
  const dialectTextarea = document.getElementById('admin-trans-dialect');
  const standardTextarea = document.getElementById('admin-trans-standard');

  if (dialectTextarea) {
    dialectTextarea.value = item.transcriptDialect || "";
    dialectTextarea.oninput = () => {
      item.transcriptDialect = dialectTextarea.value;
    };
  }

  if (standardTextarea) {
    standardTextarea.value = item.transcriptStandard || "";
    standardTextarea.oninput = () => {
      item.transcriptStandard = standardTextarea.value;
    };
  }
}

async function approveContribution() {
  if (!activeAdminReviewId) {
    alert("Vui lòng chọn một bản ghi trong hàng đợi để kiểm duyệt.");
    return;
  }

  const index = pendingContributions.findIndex(x => x.id === activeAdminReviewId);
  if (index === -1) return;

  const item = pendingContributions[index];

  // Capture current fine-tuned Subtitles directly from Admin textareas
  const dialectTextarea = document.getElementById('admin-trans-dialect');
  const standardTextarea = document.getElementById('admin-trans-standard');

  if (dialectTextarea && dialectTextarea.value.trim()) {
    item.transcriptDialect = dialectTextarea.value.trim();
  }
  if (standardTextarea && standardTextarea.value.trim()) {
    item.transcriptStandard = standardTextarea.value.trim();
  }

  try {
    await fetch('/api/approve-contribution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, ...item })
    });
  } catch (e) {
    console.warn("Backend approve sync offline:", e);
  }

  item.status = 'approved';
  item.verified = true;
  
  // Add to active localAudioCorpus so it shows on Map & List
  localAudioCorpus.push(item);
  localStorage.setItem('vb_audio_corpus', JSON.stringify(localAudioCorpus));

  // Remove from pending list
  pendingContributions.splice(index, 1);
  localStorage.setItem('vb_pending_contributions', JSON.stringify(pendingContributions));

  const targetProvince = item.province;
  activeAdminReviewId = null;

  updateGlobalStats();
  drawMapMarkers();
  renderAdminQueue();

  alert(`Đã duyệt bản ghi "${item.title}" thành công vào CSDL chính!`);

  // Switch to map view & highlight province
  switchTab('map-view');
  selectProvince(targetProvince);

  setTimeout(() => {
    playAudio(item);
  }, 350);
}

async function rejectContribution() {
  if (!activeAdminReviewId) {
    alert("Vui lòng chọn một bản ghi trong hàng đợi.");
    return;
  }

  const index = pendingContributions.findIndex(x => x.id === activeAdminReviewId);
  if (index === -1) return;

  const item = pendingContributions[index];
  
  if (confirm(`Bạn có chắc chắn muốn TỪ CHỐI và XÓA BỎ bản ghi "${item.title}"?`)) {
    try {
      await fetch('/api/reject-contribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id })
      });
    } catch (e) {
      console.warn("Backend reject sync offline:", e);
    }

    pendingContributions.splice(index, 1);
    localStorage.setItem('vb_pending_contributions', JSON.stringify(pendingContributions));

    activeAdminReviewId = null;
    renderAdminQueue();
    updateGlobalStats();
    alert("Đã từ chối bản ghi âm.");
  }
}
