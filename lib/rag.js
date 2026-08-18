'use strict';

const store = require('./store');
const { CORE_DIALECT_PAIRS } = require('./dialect-pairs');

// Tu dien duoc nap tu MySQL mot lan roi giu trong RAM (385 muc, rat nhe).
// invalidate() duoc goi sau khi admin sua tu dien.
let lexiconCache = null;
let ragCache = null;

async function getLexicon() {
  if (!lexiconCache) lexiconCache = await store.listLexicon();
  return lexiconCache;
}

async function getChatbotRag() {
  if (!ragCache) ragCache = await store.listChatbotRag();
  return ragCache;
}

function invalidate() {
  lexiconCache = null;
  ragCache = null;
}

const removeDiacritics = (str) => str
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D');

/**
 * Tim cac muc tu dien lien quan den cau dau vao (Kho A).
 * Doi sanh ca co dau va khong dau de bat duoc go tat.
 */
async function retrieveContext(inputText) {
  if (!inputText) return { khoA: [], khoB: [] };

  const lexicon = await getLexicon();
  const cleanInput = inputText.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '');
  const cleanInputNoDiacritics = removeDiacritics(cleanInput);

  const matches = [];
  const seenIds = new Set();

  for (const lex of lexicon) {
    if (!lex.word) continue;

    const lexWord = lex.word.toLowerCase();
    let isMatched = cleanInput.includes(lexWord) ||
                    cleanInputNoDiacritics.includes(removeDiacritics(lexWord));

    if (!isMatched && lex.meaning) {
      for (const meaning of lex.meaning.split(/[,;/]/)) {
        const m = meaning.trim().toLowerCase();
        if (!m) continue;
        const mNoDiacritics = removeDiacritics(m);
        if (cleanInput.includes(m) || (mNoDiacritics.length >= 2 && cleanInputNoDiacritics.includes(mNoDiacritics))) {
          isMatched = true;
          break;
        }
      }
    }

    if (isMatched && !seenIds.has(lex.id)) {
      seenIds.add(lex.id);
      matches.push(lex);
    }
  }

  return { khoA: matches.slice(0, 15), khoB: [] };
}

/**
 * Bo dich ngoai tuyen dua tren bang cap tu. Chay khi khong co API key
 * hoac khi goi API that bai, de nguoi dung luon nhan duoc ket qua.
 */
function fallbackTranslate(text, direction, reason = 'network_error') {
  let outText = text;
  const matchedVocab = [];

  // Thay cum dai truoc de "bay gio" khong bi cat thanh "gio"
  const sortedPairs = [...CORE_DIALECT_PAIRS].sort((a, b) => {
    const key = direction === 'standard-to-dialect' ? 'standard' : 'dialect';
    return b[key].length - a[key].length;
  });

  for (const pair of sortedPairs) {
    const srcTerm = direction === 'standard-to-dialect' ? pair.standard : pair.dialect;
    const tgtTerm = direction === 'standard-to-dialect' ? pair.dialect : pair.standard;

    const escaped = srcTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^\\p{L}\\p{M}])(${escaped})([^\\p{L}\\p{M}]|$)`, 'giu');

    const prevText = outText;
    outText = outText.replace(regex, (match, before, word, after) => {
      const isCapitalized = word.charAt(0) === word.charAt(0).toUpperCase();
      const replacement = isCapitalized
        ? tgtTerm.charAt(0).toUpperCase() + tgtTerm.slice(1)
        : tgtTerm;
      return before + replacement + after;
    });

    if (outText !== prevText) {
      matchedVocab.push({
        dialectWord: pair.dialect,
        standardMeaning: pair.standard,
        explanation: pair.exp
      });
    }
  }

  outText = outText.charAt(0).toUpperCase() + outText.slice(1);

  const uniqueBreakdown = [];
  const seenWords = new Set();
  for (const item of matchedVocab) {
    if (seenWords.has(item.dialectWord)) continue;
    seenWords.add(item.dialectWord);
    uniqueBreakdown.push(item);
  }

  const defaultBreakdown = [
    { dialectWord: 'Răng', standardMeaning: 'Sao / Tại sao', explanation: 'Từ hỏi phổ biến phương ngữ miền Trung' },
    { dialectWord: 'Mô', standardMeaning: 'Đâu / Chỗ nào', explanation: 'Từ hỏi vị trí địa lý' },
    { dialectWord: 'Rứa', standardMeaning: 'Thế / Vậy', explanation: 'Trợ từ cảm thán đệm cuối câu' }
  ];

  return {
    translation: outText,
    wordsBreakdown: uniqueBreakdown.length ? uniqueBreakdown : defaultBreakdown,
    isFallback: true,
    reason
  };
}

/** Tra loi chatbot khi khong goi duoc AI: tra kho RAG roi den tu dien. */
async function offlineChatbotReply(message) {
  const rag = await getChatbotRag();
  const lower = message.toLowerCase();

  for (const entry of rag) {
    if (entry.keywords.some((keyword) => lower.includes(String(keyword).toLowerCase()))) {
      return entry.response;
    }
  }

  const lexicon = await getLexicon();
  const match = lexicon.find((word) => word.word && lower.includes(word.word.toLowerCase()));

  if (match) {
    return `Tôi là **Trợ lý văn hóa Thổ âm Sông núi** (Chế độ Ngoại tuyến). Dựa trên cơ sở dữ liệu tra cứu được:
- **Từ:** **"${match.word}"**
- **Nghĩa:** ${match.meaning}
- **Khu vực sử dụng:** ${match.region}
- **Ví dụ:** *"${match.example}"* -> Nghĩa: *"${match.exampleTranslation}"*
- **Bối cảnh văn hóa:** ${match.culturalInsight}`;
  }

  return `Tôi là **Trợ lý văn hóa Thổ âm Sông núi** (Chế độ Ngoại tuyến). Xin lỗi bạn, hiện tại kết nối AI đang gián đoạn và tôi chưa tìm thấy từ khóa tương ứng cho *"${message}"* trong từ điển ngoại tuyến.

Bạn có thể thử hỏi nghĩa của các từ cụ thể như *"răng"*, *"ún"*, *"cố"*, *"mô"*, *"tê"*... hoặc dùng các câu hỏi nhanh gợi ý nhé!`;
}

module.exports = {
  getLexicon,
  getChatbotRag,
  invalidate,
  retrieveContext,
  fallbackTranslate,
  offlineChatbotReply,
  CORE_DIALECT_PAIRS
};
