// Open the side bar when the arrow is clicked
document.querySelector(".arrow").addEventListener("click", function(event) {
	document.querySelector(".searchAndList").classList.toggle("slipIn");
	document.querySelector(".arrow").classList.toggle("floatRight");
});

var markers = [];
var map;
var pos;

var ViewModel = function() {
	// Places Service
	var places = new google.maps.places.PlacesService(map);

	this.filter = ko.observable();

	var self = this;

	this.placeList = ko.observableArray([]);

	// Run the nearby search on the current bounds of the map
	places.nearbySearch({
		location: pos,
		radius: "4000",
		rankBy: google.maps.places.RankBy.PROMINENCE
	}, function(results, status) {
		// makeMarkers(results);
		for(var i = 0; i < results.length; i++) {
			results[i].show = ko.observable(true);
			// var marker = new google.maps.Marker({
			// 	position: results[i].geometry.location,
			// 	map: map
			// });
			// // Push the marker into the markers array
			// markers.push(marker);
			self.placeList.push(results[i]);
		}

		makeMarkers(self.placeList());
	});

	this.filterText = ko.observable();

	this.filter = function(data, event) {
		if(event.keyCode === 13) {
			for(var i = 0; i < self.placeList().length ; i++)
			{
				if(self.placeList()[i].name.includes(self.filterText())) {
					self.placeList()[i].show(true);
					console.log(self.placeList()[i].show());
				}
				else {
					self.placeList()[i].show(false);
				}
			}
			makeMarkers(self.placeList());
		}
	}

};

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
	// map.addListener("idle", runNearbySearch);

	// runNearbySearch();

	ko.applyBindings(new ViewModel());
}


function runNearbySearch() {
	// Places Service
	var places = new google.maps.places.PlacesService(map);

	// Run the nearby search on the current bounds of the map
	places.nearbySearch({
		location: pos,
		radius: "4000",
		rankBy: google.maps.places.RankBy.PROMINENCE
	}, function(results, status) {
		makeMarkers(results);
	});
}

// This function is called by the nearby search callback function.
// It puts markers on the map for each of the location being returned.
function makeMarkers(results) {
	// clearing the markers array
	hideMarkers();
	markers.length = 0;
	for(var i = 0; i < results.length; i++) {
		if(results[i].show() === true) {
				console.log(i);
				var marker = new google.maps.Marker({
				position: results[i].geometry.location,
				map: map
			});
			// Push the marker into the markers array
			markers.push(marker);
		}
	}
}

function hideMarkers() {
	for(var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
}

function mapError() {
	alert("The site is not available right now. Please try after some time");
}