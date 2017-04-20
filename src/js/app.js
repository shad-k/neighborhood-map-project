// Open the side bar when the arrow is clicked
document.querySelector(".arrow").addEventListener("click", function(event) {
	document.querySelector(".searchAndList").classList.toggle("slipIn");
	document.querySelector(".arrow").classList.toggle("floatRight");
});

var markers = [];
var map;

// Callback function that runs when the Google Maps API has loaded successfully
function initMap() {
	var pos = new google.maps.LatLng(28.5714851, 77.2591487);
	// The coordinates below belong to New Delhi
	map = new google.maps.Map(document.getElementById("map"), {
		zoom: 15,
		center: pos,
		mapTypeControl: false // Disabling the map type controls since it is not needed currently
	});


	// Places Service

	var places = new google.maps.places.PlacesService(map);

	places.nearbySearch({
		location: pos,
		radius: "2000",
		rankBy: google.maps.places.RankBy.PROMINENCE
	}, function(results, status) {
		makeMarkers(results);
	});
}

function makeMarkers(results) {
	results.forEach(function(result) {
		var marker = new google.maps.Marker({
			position: result.geometry.location,
			map: map
		});
		markers.push(marker);
	})
}