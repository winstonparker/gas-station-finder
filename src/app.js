//HTTP and GPS Requests
var remote = {
  getStationData: function (lat, lng) {
    return ngi.http.get(`https://developer.nrel.gov/api/alt-fuel-stations/v1/nearest.json?limit=10&api_key=cgikuqoeKNuhs0V371QmsjnKPBUgsraymWFHjWcv&format=JSON&latitude=${lat}&longitude=${lng}&radius=50&status=E&fuel_type=E85`).then(function (response) {
      var data = response.payload.fuel_stations;
      return data;
    }).catch(function (error) {
      console.log("Error:", error);
    });
  },
  getPostionData: function () {
    return new Promise(function (resolve) {
      gm.info.getCurrentPosition(function (position) {
        var lat = position.coords.latitude.toFixed(6);
        var lng = position.coords.longitude.toFixed(6);
        resolve({
          lat: lat,
          lng: lng
        });
      }, true);
    });
  }
}

//Called when using the vehicle nav system
var navigate = function (destination) {
  gm.nav.setDestination(success, failure, destination, true);

  function success() {
    console.log('Destination has been set');
    var alertTile = `The Destination Has Been Set`;
    var alertDetail = `Please check the Emulator Toolbar Map.`
    gm.ui.showAlert({
      alertTitle: alertTile,
      alertDetail: alertDetail,
      primaryButtonText: 'Close',
      primaryAction: function closeAlert() {}
    });
  }

  function failure(err) {
    console.log('Error:', err);
  }
}

//Save Station Data and Selected Index
var stations = [];
var stationDataList = [];
var stationIndex = 0;

// Load each term into built-in flow context for Terms & Conditions.
var terms = require("./terms.json");
ngi.cards("_ngi:terms", terms);

// Define the Splash screen.
ngi.cards('_ngi:init.splash', {
  icon: './images/splash.png'
});

//Setup the flow
ngi.flow('myFlow', {
    entry: 'welcomeScreen' // The first view the task will load.
  })
  .addRoute('welcomeScreen', {
    layout: 'Detail',
    links: {
      neighbors: ['stationList']
    },
    actions: [{
      label: 'Locate Nearby Stations',
      action: function () {
        this.route('stationList');
      }
    }]
  }).addRoute('stationList', {
    layout: 'VerticalList',
    title: 'Select a Nearby Gas Station',
    links: {
      back: 'welcomeScreen',
      neighbors: ['infoScreen']
    },
    listActions: [{
      label: 'Select',
      action: function (index) {
        console.log(index);
        stationIndex = index;
        this.route('infoScreen');
      }
    }],
    beforeEnter: function () {
      return remote.getPostionData().then(function (pos) {
        return remote.getStationData(pos.lat, pos.lng).then(function (data) {
          var dataLimit = data.slice(0, 10);
          stations = dataLimit;
          stationDataList = dataLimit.map(function (station) {
            var stationDistanceInMiles = station.distance.toFixed(2);
            return {
              title: `${station.station_name} - ${stationDistanceInMiles} miles`
            };
          });
          ngi.cards("myFlow.stationList", stationDataList, true);

        }).catch(function (err) {
          console.log("Error", err);
          return Promise.reject(err);
        })
      }).catch(function (err) {
        console.log("Error", err);
        return Promise.reject(err);
      })
    },
  }).addRoute('infoScreen', {
    layout: 'Detail',
    links: {
      back: 'stationList'
    },
    actions: [{
      label: 'Navigate to Station',
      action: function () {
        var stationInfo = stations[stationIndex];
        var destination = {
          latitude: stationInfo.latitude,
          longitude: stationInfo.longitude
        };
        navigate(destination);
      }
    }],
    beforeEnter: function () {
      var stationInfo = stations[stationIndex];
      var infoCard = ngi.cards('myFlow.infoScreen').get(0).value();
      ngi.util.set(infoCard, 'title', stationInfo.station_name);

      var stationInfoBody = `<p>Distance: ${stationInfo.distance.toFixed(2)} Miles</p> <p>Position: ${stationInfo.latitude}, ${stationInfo.longitude}</p> <p>Hours: ${stationInfo.access_days_time}</p><p>Address: ${stationInfo.street_address}, ${stationInfo.city}, ${stationInfo.state}, ${stationInfo.zip}</p>`;
      ngi.util.set(infoCard, 'body', stationInfoBody);


    },
  })

ngi.cards('myFlow.welcomeScreen', {
  title: 'Gas Station Locator',
  body: '<p>Welcome to the Gas Station Locator. This application finds the 10 closest gas stations to your current position.</p>',
});

ngi.cards('myFlow.infoScreen', {
  title: 'Info Screen',
  body: '<p>This is a generic info screen.</p>',
});

// Entry flow, this will connect to Splash, Terms, and About.
ngi.init('myFlow');