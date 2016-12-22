# SPA_ionic_geomap

## Introduction

A Geolocation navigation ionic application, that can detect when passengers are close to their specified location and notify them. If passengers got off track from origin path, they will also be notified via message tones/ vibrations/ alert windows.

Application is suitable for both young and old.


##User stories

Implement a mobile app that can solve the above problems.

Implement facebook Authentication to identify unique users.

Used Mobile-Backend-As-Service, firebase.

Used Google map APIs.

Users can save up to 2 favorite geolocation directions. (Fave1 & Fave2 pre-set locations)

Users can press `find me` to get immediate real-time location update, with respective to any existing direction path (if any).

Users can toggle tracking on or off with periodic geolocation updates, as well as notification on their distance from target markers.

Users can also use tracking to assist them with actual navigation.

##instructions

### How to make it run

download zipfile or `git clone` to working directory

go to working directory in terminal, `npm install` and `bower install` to fetch all the node packages.

### Download the following:

`bower install ngCordova`

`cordova plugin add cordova-plugin-geolocation`

`cordova plugin add cordova-plugin-dialogs`

`cordova plugin add cordova-plugin-vibration`

### Once all download is done

`ionic serve --address localhost --port 8100`

Ionic will open a new browser tab when it is ready, just be patient and wait for a while.

### Note

When trying the application DO NOT TRY to refresh the browser.

For best results, toggle mobile mode under developer tools in chrome.

In order to try the `track` (yellow color tab in side menu), you will need to search for a direction.

For `fave1` & `fave2`, if it is the first time user is saving a direction, the second time the user press the button. It will map the pre-set directions into google map.

if there is a direction set regarding with or without tracking, clicking `find me` will show current location as well as any other relevant remaining checkpoints.

There are some items that are meant for real android device, which cannot be tested.

Remember to login and logout, it would be best to shut down the program entirely if not using it's feature.

Lastly, you are assumed to know ionic/ ngCordova/ PhoneGap/ Ionic-native.
