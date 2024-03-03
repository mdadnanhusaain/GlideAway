mapboxgl.accessToken = mapToken;

let coordinates = listing.geometry.coordinates;
if (coordinates.length == 0) coordinates = [77.209006, 28.613895];
console.log(coordinates);
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v12", // style URL
  center: coordinates, // starting position [lng, lat]
  zoom: 9, // starting zoom
});

const marker1 = new mapboxgl.Marker({ color: "red" })
  .setLngLat(coordinates) // Listings.geometry.coordinates
  .setPopup(
    new mapboxgl.Popup({ offset: 25 })
      .setHTML(
        `<h4>${listing.title}</h4><p>Exact Location will be provided after Booking</p>`
      )
      .addTo(map)
  )
  .addTo(map);
