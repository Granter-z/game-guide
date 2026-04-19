const OFFICIAL_GAME_NAMES_ZH = require('./officialGameNames.json');

const getOfficialGameNameZh = (slug) => OFFICIAL_GAME_NAMES_ZH[slug] || null;

module.exports = {
  OFFICIAL_GAME_NAMES_ZH,
  getOfficialGameNameZh
};

