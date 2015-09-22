/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var ajax =  require('ajax');
var Settings = require('settings');
var UI = require('ui');
var Vector2 = require('vector2');
var Clock = require('clock');

var 

//var mainWindow = new UI.Window({
//    fullscreen: true,
//});

var getMaps = function() {			
	return ajax(
        {
            url: 'http://splatoon.ink/schedule.json',
            type: 'GET',
        },
        function(data, status, request) {
            console.log("response successful");
            console.log("data: " +  data);
            console.log("status: " + status);
            console.log("request: " + request);
        },
        function(data, status, request) {
            console.log("response failure");
            console.log("data: " +  data);
            console.log("status: " + status);
            console.log("request: " + request);
        }
	);
};

var inkResponse = getMaps();

var regular_rotation = false
var RR = function() {return regular_rotation};

// This is a bit of future-proofing. If Ninty adds alternate modes to Random
// matches in the future, they will presumably be formatted the same way as
// the Ranked rules data is now. This will catch the alternate rules data if
// it exists.

if (inkResponse.schedule[0].maps.hasOwnProperty("rulesEN")) {
    regular_rotation = true;
}

var scheduledMaps = function() {
    this.startTime = null;
    this.endTime = null;
    this.regular = {
        maps: [],
        rules: "",
    };
    this.ranked = {
        maps: [],
        rules: "",
    };
};

scheduledMaps.prototype.update = function() {};

// These are for dumping one schedule's data into another.
// Usage:
// prevMaps.consume(currMaps.feed());
// currMaps.consume(nextMaps.feed());
// nextMaps.consume(lastMaps.feed());
scheduledMaps.prototype.feed = function() {
    return {
        startTime: this.startTime,
        endTime: this.endTime,
        regular: this.regular,
        ranked: this.ranked,
    };
};
scheduledMaps.prototype.consume = function(mapsData) {
    for (var dataKey in mapsData) {
        this[dataKey] = mapsData[dataKey];
    }
};

scheduledMaps.prototype.start = function() {};
scheduledMaps.prototype.end = function() {};


var inkData = {
    hasMaps: function() {},
    
    hasPrev: false,
    hasCurr: false,
    hasNext: false,
    hasLast: false,
    
    
    prevMaps: new scheduledMaps(),
    currMaps: new scheduledMaps(),
    nextMaps: new scheduledMaps(),
    lastMaps: new scheduledMaps(),
};


console.log(inkResponse);

//var now = new Date();
//var timezone = now.getTimezoneOffset();
//var time = now.getTime();


/**
var main = new UI.Card({
  title: 'Pebble.js',
  icon: 'images/menu_icon.png',
  subtitle: 'Hello World!',
  body: 'Press any button.'
});

main.show();

var nextTime = Clock.weekday('tuesday', 6, 0);
console.log('Seconds until then: ' + (nextTime - Date.now()));

main.on('click', 'up', function(e) {
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Pebble.js',
        icon: 'images/menu_icon.png',
        subtitle: 'Can do Menus'
      }, {
        title: 'Second Item',
        subtitle: 'Subtitle Text'
      }]
    }]
  });
  menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
  });
  menu.show();
});

main.on('click', 'select', function(e) {
  var wind = new UI.Window({
    fullscreen: true,
  });
  var textfield = new UI.Text({
    position: new Vector2(0, 65),
    size: new Vector2(144, 30),
    font: 'gothic-24-bold',
    text: 'Text Anywhere!',
    textAlign: 'center'
  });
  wind.add(textfield);
  wind.show();
});

main.on('click', 'down', function(e) {
  var card = new UI.Card();
  card.title('A Card');
  card.subtitle('Is a Window');
  card.body('The simplest window type in Pebble.js.');
  card.show();
});
*/