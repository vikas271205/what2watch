const WATCHMODE_API_KEY = "v9EUGO2MNvQWUcPLPxEFwpZwuPx6xPB2k8wfvdLQ";

// Step 1: Get Watchmode ID using TMDB title and year
export async function getWatchmodeId(title, year) {
  const encodedTitle = encodeURIComponent(title);
  const url = `https://api.watchmode.com/v1/search/?apiKey=${WATCHMODE_API_KEY}&search_value=${encodedTitle}&search_type=movie,tv`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Watchmode 400 or fetch failed for: ${title} Status: ${res.status}`);
      return null;
    }
    const data = await res.json();
    const result = data.title_results?.find(
      (item) => !year || item.year == year
    );
    return result?.id || null;
  } catch (err) {
    console.error("Watchmode fetch error:", err);
    return null;
  }
}







// Step 2: Get streaming sources for the Watchmode ID
export const getStreamingSources = async (watchmodeId) => {
  try {
    const res = await fetch(
      `https://api.watchmode.com/v1/title/${watchmodeId}/sources/?apiKey=v9EUGO2MNvQWUcPLPxEFwpZwuPx6xPB2k8wfvdLQ`
    );
    const data = await res.json();

    const filtered = data.filter(
      (s) => ["sub", "free", "tv_everywhere"].includes(s.type) && s.region === "IN"
    );

    // Remove duplicates by name
    const unique = filtered.reduce((acc, item) => {
      if (!acc.some((a) => a.name === item.name)) acc.push(item);
      return acc;
    }, []);

    return unique;
  } catch (err) {
    console.error("Streaming sources error", err);
    return [];
  }
};

