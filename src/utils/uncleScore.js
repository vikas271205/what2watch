export const calculateUncleScore = (tmdb, imdb, rtPercent) => {
  const tmdbScore = parseFloat(tmdb) || 0;
  const imdbScore = parseFloat(imdb) || 0;
  const rtScore = parseInt(rtPercent?.replace("%", "")) / 10 || 0;

  const uncleScore = (
    (tmdbScore * 0.4) +
    (imdbScore * 0.4) +
    (rtScore * 0.2)
  ).toFixed(1);

  return uncleScore;
};
