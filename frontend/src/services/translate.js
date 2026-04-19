import api from './api';
import { GAME_GLOSSARY } from '../config/glossary';

const CACHE_PREFIX = 'translation:v2:';
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildCacheKey = (text) => `${CACHE_PREFIX}${encodeURIComponent(text)}`;

const getCachedTranslation = (text) => {
  try {
    const raw = localStorage.getItem(buildCacheKey(text));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.value || !parsed?.updatedAt) return null;
    if (Date.now() - parsed.updatedAt > CACHE_MAX_AGE_MS) {
      localStorage.removeItem(buildCacheKey(text));
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
};

const setCachedTranslation = (text, translated) => {
  try {
    localStorage.setItem(
      buildCacheKey(text),
      JSON.stringify({ value: translated, updatedAt: Date.now() })
    );
  } catch {
    // Ignore cache write failures (e.g. quota exceeded).
  }
};

const protectGlossaryTerms = (text) => {
  const protectedTerms = [];
  let result = text;

  Object.entries(GAME_GLOSSARY).forEach(([sourceTerm, targetTerm], index) => {
    const placeholder = `__TERM_${index}__`;
    const pattern = new RegExp(`\\b${escapeRegExp(sourceTerm)}\\b`, 'gi');
    if (pattern.test(result)) {
      result = result.replace(pattern, placeholder);
      protectedTerms.push({ placeholder, targetTerm });
    }
  });

  return { text: result, protectedTerms };
};

const restoreGlossaryTerms = (text, protectedTerms) => {
  let restoredText = text;
  protectedTerms.forEach(({ placeholder, targetTerm }) => {
    restoredText = restoredText.replace(new RegExp(escapeRegExp(placeholder), 'g'), targetTerm);
  });
  return restoredText;
};

export const translateToChinese = async (text) => {
  if (!text) return '';

  const cached = getCachedTranslation(text);
  if (cached) return { text: cached, engine: 'cache' };

  try {
    const { text: protectedText, protectedTerms } = protectGlossaryTerms(text);
    const response = await api.post('/translate', { text: protectedText });
    const translated = response.data?.result;
    const engine = response.data?.engine || 'unknown';
    if (!translated || typeof translated !== 'string') {
      throw new Error('No translation result');
    }
    const finalText = restoreGlossaryTerms(translated, protectedTerms);
    if (!finalText || finalText.trim() === text.trim()) {
      throw new Error('Translation unchanged');
    }
    setCachedTranslation(text, finalText);
    return { text: finalText, engine };
  } catch (error) {
    console.error('Translation failed:', error.message);
    throw error;
  }
};

export default translateToChinese;
