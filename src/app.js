// Your code goes here

// ----- PLEASE NOTE -----
// Although your code is bundled, we do not otherwise transform or transpile your
// user code. ES6+ JavaScript is incompatible with the in-vehicle platform and
// will need to be transpiled into ES5!
// -----------------------

// You can require definitions from other JavaScript and JSON files.
// Your code will be bundled together using WebPack during DFF compilation.
var terms = require("./terms.json");
// Load each term into built-in flow context for Terms & Conditions.
ngi.cards("_ngi:terms", terms);

// Define the Splash screen.
ngi.cards('_ngi:init.splash', {
  icon: './images/splash.png'
});

ngi.flow('myFlow', {
    entry: 'myView' // The first view the task will load.
  })
  .addRoute('myView', {
    layout: 'Detail',

    // Views can have actions too!
    // Press the button and take a look in your developer console.
    // The DFF provides context-based navigation and rendering information,
    //   all on the 'this' property of your functions.

    actions: [{
      label: 'Hello!',
      action: function() {
        console.log('HI!!!!', this);
        // We include Lodash with the DFF as well!
        var bodyText = _.get(this, 'content.body');
        ngi.vehicle.speak(bodyText);
      }
    }]
  });

ngi.cards('myFlow.myView', {
  title: 'Gas Station Locator',
  // Many layouts are responsive to the content they are rendering.
  // Try uncommenting the next line and see how the layout responds.
  // images: ['./images/otterlyadorable.jpg'],

  // Body text may contain _simple_ HTML for formatting purposes.
  // The following tags are allowed: <b>, <i>, <p>, <br>, <u>, <em>, <strong>, <pre>, <span>.
  // The following classes are allowed: text-left, text-right, text-center, light, medium, bold.
  // Anything outside the whitelist will be stripped from the string as it is displayed.
  body: '<p>Welcome to the Driver First Framework</p> <br><p class="text-left">Hurray!</p>'
});

// Specify your own entry flow, this will connect to Splash, Terms, and About.
ngi.init('myFlow');

