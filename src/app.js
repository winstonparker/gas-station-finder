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
        var lat = position.coords.latitude.toFixed(8);
        var lng = position.coords.longitude.toFixed(8);
        resolve({
          lat: lat,
          lng: lng
        });
      }, true);
    });
  }
}

var stations = [];

var terms = require("./terms.json");
// Load each term into built-in flow context for Terms & Conditions.
ngi.cards("_ngi:terms", terms);

// Define the Splash screen.
ngi.cards('_ngi:init.splash', {
  icon: './images/splash.png'
});

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
      back: 'welcomeScreen'
    },
    beforeEnter: function () {
      var self = this;
      return remote.getPostionData().then(function (pos) {
        return remote.getStationData(pos.lat, pos.lng).then(function(data){
          stations = data.map(function(station) {
            var stationDistanceInMiles = station.distance.toFixed(2);
            return {
              title: `${station.station_name} - ${stationDistanceInMiles} miles`,
            };
          });
          ngi.cards("myFlow.stationList", stations);

        }).catch(function (err) {
          console.log("Error", err);
          return Promise.reject(err);
        })
      }).catch(function (err) {
        console.log("Error", err);
        return Promise.reject(err);
      })
    },
  });

ngi.cards('myFlow.welcomeScreen', {
  title: 'Gas Station Locator',
  body: '<p>Welcome to the Gas Station Locator. This application finds the 10 closest gas stations to your current position.</p>',
});






// ngi.cards('myFlow.stationList', {});

// Specify your own entry flow, this will connect to Splash, Terms, and About.
ngi.init('myFlow');