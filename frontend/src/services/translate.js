import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000
});

export const translateToChinese = async (text) => {
  if (!text) return '';
  try {
    const response = await api.post('/translate', { text });
    return response.data.result || text;
  } catch (error) {
    console.error('Translation failed:', error.message);
    return text;
  }
};

export default translateToChinese;
