/* scipt.js
Things that happen in this script:
 - Get current location
 - Getting info from the heroku server 
 - Caculating distance based on current location
 - Rendering onto the map.
 */ 
var myLat = 0;
var myLng = 0;
var username = "vXeUlZrk";
var me = new google.maps.LatLng(myLat, myLng);
var myOptions = {
	zoom: 13, // The larger the zoom number, the bigger the zoom
	center: me,
	mapTypeId: google.maps.MapTypeId.ROADMAP
	};
var map;
var marker;
var infowindow = new google.maps.InfoWindow();
			
function init()
{
	map = new google.maps.Map(document.getElementById("map"), myOptions);
	getMyLocation();
}
			
function getMyLocation() {
	if (navigator.geolocation) { // the navigator.geolocation object is supported on your browser
		navigator.geolocation.getCurrentPosition(function(position) {
		myLat = position.coords.latitude;
		myLng = position.coords.longitude;
		renderMap();
		});
	}
	else {
		alert("Geolocation is not supported by your web browser.  What a shame!");
	}
}
function renderMap() {
	
	me = new google.maps.LatLng(myLat, myLng);
				
	// Update map and go there...
	map.panTo(me);
	
	// Create a marker
	// TODO: Make this a unique icon
	marker = new google.maps.Marker({
		position: me,
		title: username
		});
	marker.setMap(map);
	getOthersLocation();				
	// Open info window on click of marker
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(marker.title);
		infowindow.open(map, marker);
		});
}
function getOthersLocation() {
	var request = new XMLHttpRequest();
	request.open("POST", "https://defense-in-derpth.herokuapp.com/submit", true);
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	request.onreadystatechange = function(){
		if (request.readyState == 4 && request.status == 200 ){
			elements = JSON.parse(request.responseText);
			console.log(elements);
			renderOthers(elements);
		}
	}
	request.send("username=vXeUlZrk&lat="+myLat+"&lng="+myLng);
}
function renderOthers(elements){

	for (i = 0; i < elements.length; i++){
		// calculate distance
		var theirLat = elements[i].lat;
		var theirLng = elements[i].lng;
		var them = new google.maps.LatLng({lat: theirLat, lng: theirLng});
		var dist = google.maps.geometry.spherical.computeDistanceBetween(me, them);
		// meters to miles conversion
		dist = dist * 0.000621371;
		// extract username
		var who = elements[i].username;
		// render w/ driver marker
		var driver = google.maps.Marker({
			position: them,
			title: who
		});
		driver.setMap(map);
		google.maps.event.addListener(driver, 'click', function () {
                                infoWindow.setContent(this.content);
                                infoWindow.open(map, this);
                            });
	}
}