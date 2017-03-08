/* scipt.js
Things that happen in this script:
 - Get current location
 - Getting info from the heroku server 
 - Caculating distance based on current location
 - Rendering onto the map
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
		title: username,
		icon: "me.png"
		});
	marker.setMap(map);			
	// Open info window on click of marker
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(this.title);
		infowindow.open(map, this);
		});
	getOthersLocation();	
}
function getOthersLocation() {
	var request = new XMLHttpRequest();
	request.open("POST", "https://defense-in-derpth.herokuapp.com/submit", true);
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	request.onreadystatechange = function(){
		if (request.readyState == 4 && request.status == 200 ){
			elements = JSON.parse(request.responseText);
			renderOthers(elements);
		}
	}
	request.send("username="+username+"&lat="+myLat+"&lng="+myLng);
}
function renderOthers(elements){
	//determining what we will render, since this could change
	if (elements["vehicles"]){
		var type = "vehicles";
		var image = "black_car.png";
	}
	else {
		var type = "passengers";
		var image = "passenger.png";
	}
	for (i = 0; i < elements[type].length; i++){
		// calculate distance
		var theirLat = elements[type][i].lat;
		var theirLng = elements[type][i].lng;
		var them = new google.maps.LatLng(theirLat, theirLng);
		var dist = google.maps.geometry.spherical.computeDistanceBetween(me, them);
		// meters to miles conversion
		dist = dist/1609.344;
		dist = dist.toString();
		// extract username
		var who = elements[type][i].username;
		// render w/ marker
		var driver = new google.maps.Marker({
			position: them,
			title: who,
			content: who+ ": " + dist + " miles away",
			icon: image
		});
		driver.setMap(map);
		google.maps.event.addListener(driver, 'click', function () {
                                infowindow.setContent(this.content);
                                infowindow.open(map, this);
        });
	}
}