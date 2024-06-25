async function exists(url) {
    try {
        const response = await fetch(url, {
            method: 'HEAD'
        });
        return response.ok && (response.headers.get('Content-Type')?.include.includes('json') || url.endsWith('.json') || url.endsWith('.geojson'));
    } catch (error) {
        return false;
    }

}

const endpoint = "https://github.com/yahnjr/map2midi/blob/main/geo/Lapine_comment.geojson"

exists(endpoint)
exists(endpoint)
  .then(result => {
    if (result) {
      console.log("File exists at", endpoint);
    } else {
      console.log("File does not exist or is not a JSON file at ", endpoint);
    }
  })
  .catch(error => { // Single catch block here
    console.error("Error checking file existence:", error);
  });