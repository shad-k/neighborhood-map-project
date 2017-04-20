// Open the side bar when the arrow is clicked
document.querySelector(".arrow").addEventListener("click", function(event) {
	document.querySelector(".searchAndList").classList.toggle("slipIn");
	document.querySelector(".arrow").classList.toggle("floatRight");
});

var markers = [];
var map;
var pos;

// Callback function that runs when the Google Maps API has loaded successfully
function initMap() {
	pos = new google.maps.LatLng(28.5714851, 77.2591487);
	// The coordinates below belong to New Delhi
	map = new google.maps.Map(document.getElementById("map"), {
		zoom: 15,
		center: pos,
		mapTypeControl: false // Disabling the map type controls since it is not needed currently
	});

	// This line registers a listener for whenever the map becomes idle after being moved.
	// This runs the places api's nearby search afresh.
	map.addListener("idle", runNearbySearch);
}


function runNearbySearch() {
	// Places Service
	var places = new google.maps.places.PlacesService(map);

	// Run the nearby search on the current bounds of the map
	places.nearbySearch({
		bounds: map.getBounds(),
		radius: "2000",
		rankBy: google.maps.places.RankBy.PROMINENCE
	}, function(results, status) {
		makeMarkers(results);
	});
}

// This function is called by the nearby search callback function.
// It puts markers on the map for each of the location being returned.
function makeMarkers(results) {
	results.forEach(function(result) {
		var marker = new google.maps.Marker({
			position: result.geometry.location,
			map: map
		});

		// Push the marker into the "markers" array
		markers.push(marker);
	});
}
