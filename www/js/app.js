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

app.controller('MapCtrl', function($scope, $state, $interval, $window, $cordovaGeolocation, $cordovaVibration, $cordovaMedia) {
$scope.map = null;
$scope.marker = [];
$scope.locationMarker = [];
//Initialize Geolocation fn
googleMap();
// watchPosition is not feasible for testing, so use intervals to keep track
// $interval(geoLoc, 40000 );



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
          $window.alert('Directions request failed due to ' + status);
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
      $window.localStorage.setItem('recentSearch', angular.toJson({from: fromLocation, to: toLocation, marker: Arr}));
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

$scope.findMeHandler = function(){
    var options = {timeout: 10000, enableHighAccuracy: true};

  $cordovaGeolocation.getCurrentPosition(options).then(function(position){

    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    var mapOptions = {
      center: latLng,
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    var recentSearch = angular.fromJson($window.localStorage.getItem('recentSearch'))
    $scope.AutocompleteDirectionsHandler(recentSearch.from, recentSearch.to);
    geoMapping(latLng, position.coords.latitude, position.coords.longitude);
  }, function(error){
    console.log("Could not get location");
  });
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
