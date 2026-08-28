'use strict';

/**
 * Output Guardrails Module for Chatbot & LLM Services.
 * Enforces pure Vietnamese outputs, translates/removes foreign CJK characters,
 * and strips internal system token leaks or safety trigger prefixes.
 */

// Common CJK linguistic/grammar terms leaked by LLMs mapped to proper standard Vietnamese
const CJK_TRANSLATION_MAP = [
  [/\b発言者\b|発言者/g, 'người nói'],
  [/\b話し手\b|話し手/g, 'người nói'],
  [/\b話者\b|話者/g, 'người nói'],
  [/\b聞き手\b|聞き手/g, 'người nghe'],
  [/\b聴者\b|聴者/g, 'người nghe'],
  [/\b対象\b|対象/g, 'đối tượng'],
  [/\b事物\b|事物/g, 'sự vật'],
  [/\b発音\b|発音/g, 'phát âm'],
  [/\b方言\b|方言/g, 'phương ngữ'],
  [/\b単語\b|単語/g, 'từ vựng'],
  [/\b意味\b|意味/g, 'nghĩa'],
  [/\b文脈\b|文脈/g, 'bối cảnh'],
  [/\b例文\b|例文/g, 'ví dụ']
];

// Regex matching any remaining CJK Kanji/Hanzi, Kana, Hangul characters
const CJK_REGEX = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/g;

// Regex matching internal safety prefixes, system tokens, role labels, segment dividers
const SYSTEM_TAGS_PATTERNS = [
  /user:safety/gi,
  /safety:user/gi,
  /system:safety/gi,
  /\[SAFETY\]/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /<\|system\|>/gi,
  /<\|user\|>/gi,
  /<\|assistant\|>/gi,
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /<<SYS>>/gi,
  /<<\/SYS>>/gi,
  /\buser:\s*/gi,
  /\bassistant:\s*/gi,
  /\bsystem:\s*/gi,
  /\bsafety:\s*/gi
];

/**
 * Sanitizes full text output from LLM before presenting to user.
 * @param {string} text 
 * @returns {string} Cleaned, pure Vietnamese string
 */
function sanitizeOutput(text) {
  if (typeof text !== 'string' || !text) return text || '';

  let cleaned = text;

  // 1. Translate known CJK linguistic terms into Vietnamese with smart spacing
  for (const [pattern, replacement] of CJK_TRANSLATION_MAP) {
    cleaned = cleaned.replace(pattern, (match, offset, string) => {
      const prevChar = offset > 0 ? string[offset - 1] : '';
      const nextChar = offset + match.length < string.length ? string[offset + match.length] : '';
      let res = replacement;
      // Add leading space if preceded by a Vietnamese/Latin character
      if (/[a-zA-ZàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸᔤĐ]/.test(prevChar)) {
        res = ' ' + res;
      }
      // Add trailing space if followed by a Vietnamese/Latin character
      if (/[a-zA-ZàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸᔤĐ]/.test(nextChar)) {
        res = res + ' ';
      }
      return res;
    });
  }

  // 2. Remove any remaining raw CJK / Kana / Hangul characters
  cleaned = cleaned.replace(CJK_REGEX, '');

  // 3. Strip internal system token leaks and safety tags
  for (const pattern of SYSTEM_TAGS_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }

  // 4. Clean up inline artifacts (like redundant system token prefixes in text)
  cleaned = cleaned.replace(/(^|\n)(?:user|assistant|system|safety):\s*/gi, '$1');

  // 5. Normalize whitespace (avoid multiple consecutive spaces left by character removal)
  cleaned = cleaned.replace(/[ \t]{2,}/g, ' ');

  return cleaned;
}

/**
 * Creates a stream sanitizer instance with a sliding buffer to process SSE chunks.
 * Handles potential token splits across stream chunk boundaries.
 * @param {function(string): void} onSafeChunk - Callback invoked with cleaned chunk content.
 * @returns {{ processChunk: function(string): void, flush: function(): void }}
 */
function createStreamSanitizer(onSafeChunk) {
  let buffer = '';
  const MIN_LOOKAHEAD = 40; // Hold back trailing window to prevent token splitting across chunks

  return {
    processChunk(chunk) {
      if (!chunk) return;
      buffer += chunk;

      if (buffer.length > MIN_LOOKAHEAD) {
        // Find safe cut point (e.g. space or newline) to avoid breaking a word mid-stream
        const cutIndex = buffer.lastIndexOf(' ', buffer.length - MIN_LOOKAHEAD);
        const safeIndex = cutIndex > 0 ? cutIndex : buffer.length - MIN_LOOKAHEAD;

        const toSanitize = buffer.slice(0, safeIndex);
        buffer = buffer.slice(safeIndex);

        const safeCleaned = sanitizeOutput(toSanitize);
        if (safeCleaned) {
          onSafeChunk(safeCleaned);
        }
      }
    },

    flush() {
      if (buffer) {
        const safeCleaned = sanitizeOutput(buffer);
        buffer = '';
        if (safeCleaned) {
          onSafeChunk(safeCleaned);
        }
      }
    }
  };
}

module.exports = {
  sanitizeOutput,
  createStreamSanitizer,
  CJK_TRANSLATION_MAP,
  CJK_REGEX,
  SYSTEM_TAGS_PATTERNS
};
