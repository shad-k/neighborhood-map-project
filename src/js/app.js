// Open the side bar when the arrow is clicked
document.querySelector(".arrow").addEventListener("click", function(event) {
	document.querySelector(".searchAndList").classList.toggle("slipIn");
	document.querySelector(".arrow").classList.toggle("floatRight");
});

// Callback function that runs when the Google Maps API has loaded successfully
function initMap() {
	// The coordinates below belong to New Delhi
	var map = new google.maps.Map(document.getElementById("map"), {
		zoom: 15,
		center: {lat: 28.5714851, lng: 77.2591487},
		mapTypeControl: false // Disabling the map type controls since it is not needed currently
	});
}