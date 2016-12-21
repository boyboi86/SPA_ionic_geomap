(function() {

var app = angular.module('starter', ['ionic', 'ngCordova'])

app.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
  .state('map', {
    url: '/',
    templateUrl: 'templates/map.html',
    controller: 'MapCtrl'
  });

  $urlRouterProvider.otherwise("/");

})

app.controller('MapCtrl', function($scope, $state, $window, $cordovaGeolocation, $cordovaVibration, $cordovaDialogs) {
$scope.map = null;
$scope.marker = [];
$scope.locationMarker = [];
$scope.intervals = [];
$window.localStorage.clear();
$window.localStorage.setItem('navigationState', angular.toJson({"state": false, "toggle": false}))

//Initialize Geolocation fn
googleMap();
// watchPosition is not feasible for testing, so use timeout to keep track



function geoLoc(){
// geolocation getCurrentPosition
  var options = {maximumAge: 100, timeout: 30000, enableHighAccuracy: true};
  $cordovaGeolocation.getCurrentPosition(options)
    .then(function(position){
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    geoMapping(latLng, position.coords.latitude, position.coords.longitude);
  })
  .catch(function(error){
    console.log("Could not get location", error);
  })
}

var geoMapping = function(latLng, latitude, longitude){
  // addListenerOnce
  google.maps.event.addListenerOnce($scope.map, 'idle', function(){
    // Marker for current location

   var marker = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.BOUNCE,
        position: latLng
    });

    // // Info Window to display current location
    var currentPositionInfoWindow = new google.maps.InfoWindow({
        content: "Your current location is at " + latLng + " !"
    });
    // For random clicking for the map, includes a marker
    google.maps.event.addListener(marker, 'click', function() {
        currentPositionInfoWindow.open($scope.map, marker);
        console.log(latitude, longitude)
        var geocoder = new google.maps.Geocoder;
        geocoder.geocode({'location': {'lat': latitude, 'lng': longitude}}, function(result){
          document.getElementById('fromLoc').value = result[1].formatted_address
        });
    });
  });
}

function googleMap(){
  var options = {maximumAge: 100, timeout: 30000, enableHighAccuracy: true};
  $cordovaGeolocation.getCurrentPosition(options)
  .then(function(position){
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var mapOptions = {
      center: latLng,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
  // Create a map based on geolocation
  $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
  // Enable transit layer for google map
  var transitLayer = new google.maps.TransitLayer();
  transitLayer.setMap($scope.map);
  geoLoc();
  })
  .catch(function(error){
    console.log("GoogleMap not Initialize")
  })
}


  // submit form from search page
  $scope.AutocompleteDirectionsHandler = function(fromLocation, toLocation){
    fromLocation = document.getElementById('fromLoc').value;
    console.log(fromLocation, toLocation);

    // Instantiate a directions service.
      var directionsService = new google.maps.DirectionsService;
      // Create a renderer for directions and bind it to the map.
      var directionsDisplay = new google.maps.DirectionsRenderer({map: $scope.map});
      // Instantiate an info window to hold step text.
      var stepDisplay = new google.maps.InfoWindow;
      // Display the route between the initial start and end selections.
      calculateAndDisplayRoute(directionsDisplay, directionsService, $scope.marker, stepDisplay, $scope.map);
      // Listen to change events from the start and end lists.
      var onChangeHandler = function() {
        calculateAndDisplayRoute( directionsDisplay, directionsService, $scope.marker, stepDisplay, $scope.map);
      };
      onChangeHandler();

    function calculateAndDisplayRoute(directionsDisplay, directionsService, marker, stepDisplay, map) {
      // First, remove any existing markers from the map.
      for (var i = 0; i < marker.length; i++) {
        marker[i].setMap(null);
      }

      // Retrieve the start and end locations and create a DirectionsRequest using
      // TRANSIT directions.
      directionsService.route({
        origin: fromLocation,
        destination: toLocation,
        travelMode: 'TRANSIT'
      }, function(response, status) {
        // Route the directions and pass the response to a function to create
        // markers for each step.
        if (status === 'OK') {
          directionsDisplay.setDirections(response);
          showSteps(response, $scope.marker, stepDisplay, $scope.map, fromLocation, toLocation);
        } else {
          $cordovaDialogs.alert('Directions request failed due to ' + status, "Try again!");
        }
      });
    }

    function showSteps(directionResult, markerArr, stepDisplay, map, fromLocation, toLocation) {
      // For each step, place a marker, and add the text to the marker's infowindow.
      // Also attach the marker to an array so we can keep track of it and remove it
      // when calculating new routes.
      var Arr = [];
      var myRoute = directionResult.routes[0].legs[0];
      for (var i = 0; i < myRoute.steps.length; i++) {
        var marker = markerArr[i] = markerArr[i] || new google.maps.Marker;
        marker.setMap(map);
        marker.setPosition(myRoute.steps[i].start_location);
        var lat = marker.getPosition().lat()
        var lng = marker.getPosition().lng()
        console.log(lat, lng);
        Arr.push({"lat": lat, "lng": lng});
        attachInstructionText(stepDisplay, marker, myRoute.steps[i].instructions, $scope.map);
        console.log(Arr);
      }
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({'address': toLocation}, function(results, status) {
        console.log(results[0].geometry.location.lat(), results[0].geometry.location.lng());
        var toLocObj = {"lat": results[0].geometry.location.lat(), "lng": results[0].geometry.location.lng()}
        Arr.push(toLocObj);

        $window.localStorage.setItem('recentSearch', angular.toJson({from: fromLocation, to: toLocation, marker: Arr}));
      });
      // $window.localStorage.setItem('recentSearch', angular.toJson({from: fromLocation, to: toLocation, marker: Arr}));
    }

    function attachInstructionText(stepDisplay, marker, text, map) {
      google.maps.event.addListener(marker, 'click', function() {
        // Open an info window when the marker is clicked on, containing the text
        // of the step.
        stepDisplay.setContent(text);
        stepDisplay.open(map, marker);
      });
    }
  }
// trigger this function to have update on existing current position + any previous routes
$scope.findMeHandler = function(){
    var options = {timeout: 10000, enableHighAccuracy: true};

  $cordovaGeolocation.getCurrentPosition(options).then(function(position){

    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    var mapOptions = {
      center: latLng,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    var recentSearch = angular.fromJson($window.localStorage.getItem('recentSearch'));
    if(recentSearch){
      $scope.AutocompleteDirectionsHandler(recentSearch.from, recentSearch.to);
    }
    geoMapping(latLng, position.coords.latitude, position.coords.longitude);
  }, function(error){
    console.log("Could not get location");
  });
}
// Calculate distance between 2 markers/ geolocation
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2, index, totalIndex) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  console.log(d);
  if(ionic.Platform.isAndroid() === true && d <= 0.3){
    // if you are using chrome, if device set to android this will become a valid arguement
    nativeDeviceAlarm(index, d);
  }
  if(d <= 0.3){
    index += 1;
    $cordovaDialogs.alert("You are " + d.toFixed(3) + " Km" + " away" + " from " + index + " of " + totalIndex + " check point!");
  }
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function nativeDeviceAlarm(index, dist){
  // feature only available in real device
  index += 1;
  $cordovaDialogs.beep(index);
  $cordovaDialogs.alert("You are " + dist.toFixed(3) + " Km" + " away", index + " of " + totalIndex + " check point!");
  $cordovaVibration.vibrate(2000);
}

// for checking coordinates distance loop fn
function checkDistbetweenMarkers(currentLat, currentLng){
  var recentSearch = angular.fromJson($window.localStorage.getItem('recentSearch'));
  var Arr = recentSearch.marker
  for(var i = 0; i < Arr.length; i++){
    var lat = Arr[i].lat;
    var lng = Arr[i].lng;
    getDistanceFromLatLonInKm(currentLat, currentLng, lat, lng, i, Arr.length);
  }
}
// GPS interval tracking to ensure users are notified once they are close by fn
function toggleNavigationTracking(){
  var options = {maximumAge: 0, timeout: 30000, enableHighAccuracy: true};
  $cordovaGeolocation.getCurrentPosition(options)
    .then(function(position){
    checkDistbetweenMarkers(position.coords.latitude, position.coords.longitude);
    $scope.startInterval();
  })
  .catch(function(error){
    console.log("Navigation tracking not enabled!", error);
  })
  console.log("toggleNavigationTracking intialized")
}

// trigger to have loop fn for constant GPS update
$scope.changeToggleState = function(){
  var navigationState = $window.localStorage.getItem('navigationState');
  var localStore = angular.fromJson(navigationState);
  var state = localStore.state
  var toggle = localStore.toggle
  $scope.startInterval = function(){
    $scope.toggleInt = $window.setTimeout(toggleNavigationTracking, 10000);
  }

  $scope.stopInterval = function(){
    $window.clearTimeout($scope.toggleInt);
  }

  if(state == true && toggle == true || state == 'true' && toggle == 'true'){
    $window.localStorage.setItem('navigationState', angular.toJson({"state": false, "toggle": false}));
    $scope.stopInterval();
    $cordovaDialogs.alert("tracking off")
  }

  if(state == false && toggle == false || state == 'false' && toggle == 'false'){
    $window.localStorage.setItem('navigationState', angular.toJson({"state": true, "toggle": true}));
    $scope.startInterval()
    $cordovaDialogs.alert("tracking on")
  }
}



});

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
}());
