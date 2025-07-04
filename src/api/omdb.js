const OMDB_API_KEY = "2fc36b79"; // Replace with your OMDb API key

export const fetchOMDbData = async (title, year = null) => {
  if (!title) return null;

  const query = encodeURIComponent(title);
  let url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${query}`;
  if (year) url += `&y=${year}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.Response === "True") {
      return data;
    } else {
      console.warn("OMDb: No data found for", title, year);
      return null;
    }
  } catch (error) {
    console.error("OMDb API Error:", error);
    return null;
  }
};
