// Open the side bar when the arrow is clicked --- only for mobile displays
document.querySelector(".arrow").addEventListener("click", function(event) {
	document.querySelector(".searchAndList").classList.toggle("slipIn");
	document.querySelector(".arrow").classList.toggle("floatRight");
});

var markers = [];
var map;
var pos;
var defaultIcon;
var highlightedIcon;
var largeInfowindow;

var ViewModel = function() {
	// Places Service
	var places = new google.maps.places.PlacesService(map);

	var self = this;

	// The array of places that appear on the map
	this.placeList = ko.observableArray([]);

	// Run the nearby search on the current bounds of the map
	places.nearbySearch({
		location: pos,
		radius: "4000",
		type: "restaurant"
	}, function(results, status) {
		// makeMarkers(results);
		for(var i = 0; i < results.length; i++) {
			results[i].show = ko.observable(true);
			self.placeList.push(results[i]);
		}

		// Put markers on the map
		makeMarkers(self.placeList());
	});

	// Contains the text from the search input field
	this.filterText = ko.observable('');

	// This function filters the placeList whenever the text is inserted in search field
	this.filter = ko.computed(function() {
		// If the search field is empty show all places
		if(this.filterText() === "") {
			for(var i = 0; i < this.placeList().length; i++) {
				this.placeList()[i].show(true);
			}

			// Update markers on the map
			// Have to check if markers array has been populated else we get error.
			// This is because this function gets called before the markers array is populated.
			if(markers.length > 0) {
				updateMarkers(this.placeList());
			}

			return this.placeList();
		}
		// else only show places that match the filter
		else {
			for(var i = 0; i < this.placeList().length ; i++)
			{
				if(this.placeList()[i].name.includes(this.filterText())) {
					// If the marker contains the search text then show it
					this.placeList()[i].show(true);
				}
				else {
					// Else hide it
					this.placeList()[i].show(false);
				}
			}

			// Update markers on the map
			updateMarkers(this.placeList());
			return this.placeList();
		}
	}, this);

	// This function calls the click trigger function whenever a list item is clicked
	this.showInfoWindow = function(index) {
		var marker = markers[index()];
		// populateInfoWindow(marker, largeInfowindow);
		triggerClick(marker);
	};

};

// Callback function that runs when the Google Maps API has loaded successfully
function initMap() {
	// The coordinates below belong to Connaught Place, New Delhi
	pos = new google.maps.LatLng(28.6375771, 77.22336);

	map = new google.maps.Map(document.getElementById("map"), {
		zoom: 15,
		center: pos,
		mapTypeControl: false // Disabling the map type controls since it is not needed currently
	});

	// Code borrowed from Google Maps API course on Udacity
	// Style the markers a bit. This will be our listing marker icon.
    defaultIcon = makeMarkerIcon('0091ff');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
	highlightedIcon = makeMarkerIcon('FFFF24');

    largeInfowindow = new google.maps.InfoWindow();
    // Udacity code ends

	// Bind the ViewModel
	ko.applyBindings(new ViewModel());
}

// This function is called by the nearby search callback function.
// It puts markers on the map for each of the location being returned.
function makeMarkers(results) {
	for(var i = 0; i < results.length; i++) {
		var marker = new google.maps.Marker({
			position: results[i].geometry.location,
			map: map,
			title: results[i].name,
			icon: defaultIcon
		});
		// Push the marker into the markers array
		markers.push(marker);

		// Create an onclick event to open the large infowindow at each marker.
		marker.addListener('click', function() {
			populateInfoWindow(this, largeInfowindow);
			stopMarkerAnimation();
			this.setAnimation(google.maps.Animation.BOUNCE);
		});
		// Two event listeners - one for mouseover, one for mouseout,
		// to change the colors back and forth.
		marker.addListener('mouseover', function() {
			this.setIcon(highlightedIcon);
		});
		marker.addListener('mouseout', function() {
			this.setIcon(defaultIcon);
		});
	}

	// Fit the map bounds to show all the markers
	fitBounds();
}

// Stop the current marker animation
function stopMarkerAnimation() {
	for(var i = 0; i < markers.length; i++) {
		if(markers[i].getAnimation) {
			markers[i].setAnimation(null);
		}
	}
}


// This function will loop through the markers array and display them all.
function fitBounds() {
	var bounds = new google.maps.LatLngBounds();
	// Extend the boundaries of the map for each marker and display the marker
	for (var i = 0; i < markers.length; i++) {
		if(markers[i].getVisible() === true) {
			bounds.extend(markers[i].position);
		}
	}
	map.fitBounds(bounds);
}

// Code borrowed from Udacity's course on Google Maps API
function makeMarkerIcon(markerColor) {
	var markerImage = new google.maps.MarkerImage(
	'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
	'|40|_|%E2%80%A2',
	new google.maps.Size(21, 34),
	new google.maps.Point(0, 0),
	new google.maps.Point(10, 34),
	new google.maps.Size(21,34));
	return markerImage;
}


// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
	// Check to make sure the infowindow is not already opened on this marker.
	if (infowindow.marker != marker) {

		// Get the details from the Zomato API
		$.ajax({
			// Get the entity_id and entity_type
			url: "https://developers.zomato.com/api/v2.1/locations?apikey=7fdd26d8333950e56b339a2038e799c1&query="
			+ marker.title + "&lat=" + marker.position.lat() + "&lon=" + marker.position.lng(),
			success: function(response) {
				var info;
				$.ajax({
					// Get the average cost of two for the particular restaurant
					url: "https://developers.zomato.com/api/v2.1/location_details?apikey=7fdd26d8333950e56b339a2038e799c1" +
					"&entity_id=" + response.location_suggestions[0].entity_id + "&entity_type=" + response.location_suggestions[0].entity_type,
					success: function(response) {
						// If the cost for two details exist show that
						if(response.best_rated_restaurant[0]) {
							info = "<p>" + marker.title + "</p><p>Average Cost of Two = " +
							response.best_rated_restaurant[0].restaurant.average_cost_for_two + "</p>";
						}
						// Else show the nightlife index of the place
						else {
							info = "<p>" + marker.title + "</p><p>Nightlife Index = " +
							response.nightlife_index + "</p>";
						}
						infowindow.marker = marker;
						infowindow.setContent('<div>' + info + '</div>');
						infowindow.open(map, marker);
						// Make sure the marker property is cleared if the infowindow is closed.
						infowindow.addListener('closeclick', function() {
							infowindow.marker = null;
							marker.setAnimation(null);
						});
					},
					error: function() {
						alert("There is a problem with the Zomato API. Please try again after some time");
					},
					crossDomain: true
				});
			},
			error: function(error) {
				alert("There is a problem with the Zomato API. Please try again after some time");
			},
			crossDomain: true
		});

	}
}

// Shows/hides markers when filter is applied
function updateMarkers(placeList) {
	hideMarkers();
	for(var i = 0; i < placeList.length; i++) {
		if(placeList[i].show() === true) {
			markers[i].setVisible(true);
		}
	}

	// Fit the map bounds to show all the markers
	fitBounds();
}


// Hides all the markers in the markers array.
function hideMarkers() {
	for(var i = 0; i < markers.length; i++) {
		markers[i].setVisible(false);
	}
}

// Runs when there is a problem with the Google Maps API
function mapError() {
	alert("The site is not available right now. Please try after some time");
}

// Triggers the click event on the marker passed as argument
function triggerClick(marker) {
	if(marker) {
		google.maps.event.trigger(marker, 'click');
	}
}