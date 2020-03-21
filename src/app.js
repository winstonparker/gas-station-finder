


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
    action: function() {
      // We include Lodash with the DFF as well!
      var bodyText = _.get(this, 'body');
      ngi.vehicle.speak(bodyText);
    },
    // Views can have actions too!
    // Press the button and take a look in your developer console.
    // The DFF provides context-based navigation and rendering information,
    //   all on the 'this' property of your functions.

    actions: [{
      label: 'Locate Nearby Stations',
      action: function() {
        console.log('HI!!!!', this);
        // We include Lodash with the DFF as well!
        var bodyText = _.get(this, 'content.body');
        ngi.vehicle.speak(bodyText);
      }
    }]
  });

ngi.cards('myFlow.welcomeScreen', {
  title: 'Gas Station Locator',
  // images: ['./images/otterlyadorable.jpg'],

  // The following tags are allowed: <b>, <i>, <p>, <br>, <u>, <em>, <strong>, <pre>, <span>.
  // The following classes are allowed: text-left, text-right, text-center, light, medium, bold.
  body: '<p>Welcome to the Gas Station Locator. This application finds the 10 closest gas stations to your current position.</p>',

});

// Specify your own entry flow, this will connect to Splash, Terms, and About.
ngi.init('myFlow');

