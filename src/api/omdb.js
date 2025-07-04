const OMDB_API_KEY = "2fc36b79";
const OMDB_BASE_URL = "https://www.omdbapi.com/";

export const fetchOMDbData = async (title) => {
  try {
    const url = `${OMDB_BASE_URL}?t=${encodeURIComponent(
      title
    )}&apikey=${OMDB_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("OMDb fetch error:", err);
    return null;
  }
};
