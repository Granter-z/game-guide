export const getDisplayGameName = (game) => {
  if (!game) return '';
  return game.official_name_zh || game.name || '';
};

