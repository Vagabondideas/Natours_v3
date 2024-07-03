export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoidmFnYWJvbmRpZGVhcyIsImEiOiJjbHdqdHFyeHIxM2I4MmpxZmIxdHpxdzIzIn0.0s2lxwV36pyf3wZN_NNncA';

  var map = new mapboxgl.Map({
    container: 'map', // container ID
    //   style: 'mapbox://styles/mapbox/streets-v12', // DEFAULT style URL
    style: 'mapbox://styles/vagabondideas/clwjyembf03fz01nxejs1b1he',
    scrollZoom: false,
    // center: [-118.11, 34.11], // starting position [lng, lat]
    // zoom: 9, // starting zoom
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add ToolTip (pop-up)
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
