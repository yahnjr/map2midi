async function exists(url) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
    });
    return (
      response.ok &&
      (response.headers.get('Content-Type')?.includes('json') || url.endsWith('.geojson'))
    );
  } catch (error) {
    console.error("Error in exists function:", error);
    return false;
  }
}

const endpoint = "https://yahnjr.github.io/map2midi/docs/Lapine_comment.geojson";

exists(endpoint)
  .then(async (result) => {
    if (result) {
      console.log("File exists!"); // Log success
      try {
        const response = await fetch(endpoint);
        const contentType = response.headers.get('Content-Type');
        console.log("Content-Type:", contentType);
        const data = await response.json();
        console.log("GeoJSON data:", data);
      } catch (error) {
        console.error("Error fetching GeoJSON file:", error);
      }
    } else {
      console.error("File not found or not JSON:", endpoint);
    }
  })
  .catch((error) => {
    console.error("Error checking file existence:", error);
  });
