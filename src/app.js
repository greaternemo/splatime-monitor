/**
 * Hurk
 *
 * hurk!
 */

var ajax =  require('ajax');
var Settings = require('settings');
var UI = require('ui');
var Vector2 = require('vector2');
var Clock = require('clock');

var regularRotation = false;
var RR = function() {
    return regularRotation;
};

var Holding = function () {
    this.value = null;
};

var holder = new Holding();

var getMaps = function(holder) {

    var iResponse = holder;
    
    ajax(
        {
            url: 'http://splatoon.ink/schedule.json',
            type: 'json',
            method: 'GET',
        },
        function(data, status, request) {
            console.log("response successful");
            console.log(data.schedule[0].toString());
            console.log("data: " + data);
            iResponse.schedule = data.schedule;
            console.log(iResponse.schedule[0].ranked.rulesEN);
        },
        function(data, status, request) {
            console.log("response failure");
            console.log("data: " +  data);
            console.log("status: " + status);
            console.log("request: " + request);
        }
    );
    
    console.log(iResponse.schedule[0].ranked.rulesEN);
    
    var inkNum = 0;
    for (inkNum = 0; inkNum < iResponse.schedule.length; inkNum++) {
        if (iResponse.schedule[inkNum].regular.hasOwnProperty("rulesEN")) {
        }
        else {
            iResponse.schedule[inkNum].regular.rulesEN = "Turf War";
        }
    }
    
    return iResponse;
};

var inkResponse = getMaps(holder);


// This is a bit of future-proofing. If Ninty adds alternate modes to Random
// matches in the future, they will presumably be formatted the same way as
// the Ranked rules data is now. This will catch the alternate rules data if
// it exists.

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


var inkData = function() {
    this.state = {
        waiting: true,
        waitingFor: "startup",
    };
        
    this.mapState = {
        prevMaps: "new",
        currMaps: "new",
        nextMaps: "new",
        lastMaps: "new",
    };
    
    this.prevMaps = new scheduledMaps();
    this.currMaps = new scheduledMaps();
    this.nextMaps = new scheduledMaps();
    this.lastMaps = new scheduledMaps();
    
};

console.log(inkResponse);

inkData.prototype.processInkResponse = function(iResp) {
    var prepData = function(data) {
        var newData = [];
        var stdData =  true;
        var mapBase = {
            startTime: null,
            endTime: null,
            regular: {
                maps: [],
                rules: "",
            },
            ranked: {
                maps: [],
                rules: "",
            },
        };
        
        if (data.schedule.length == 3) {
            console.log("Prepping standard rotation data.");
        }
        else {
            console.log("Prepping nonstandard rotation data. " +
                        "Schedule length is " + data.schedule.length);
            stdData = false;
        }
        
        for (var iMap = 0; iMap < data.schedule.length; iMap++) {
            mapBase.startTime = data.schedule[iMap].startTime;
            mapBase.endTime = data.schedule[iMap].endTime;
            mapBase.regular.maps = data.schedule[iMap].regular.maps;
            mapBase.regular.rules = data.schedule[iMap].regular.rulesEN;
            mapBase.ranked.maps = data.schedule[iMap].ranked.maps;
            mapBase.ranked.rules = data.schedule[iMap].ranked.rulesEN;
            newData.push(mapBase);
        }
        
        return newData;
    };
    
    var newData = prepData(iResp);
    for (var myMap in this.mapState) {
        switch (myMap) {
            case "prevMaps":
                if (this.mapState[myMap] == "new") {
                    this.mapState[myMap] = "empty";
                    console.log("prevMaps marked as empty");
                }
                else if (this.mapState[myMap] == "rotate") {
                    this[myMap].consume(this.currMaps.feed());
                    console.log("Rotating currMaps into prevMaps.");
                    this.mapState[myMap] = "waiting";
                }
                break;
            case "currMaps":
                if (this.mapState[myMap] == "new") {
                    this[myMap].consume(newData[0]);
                    console.log("Adding new currMaps to rotation.");
                    this.mapState[myMap] = "waiting";
                }
                else if (this.mapState[myMap] == "rotate") {
                    this[myMap].consume(this.nextMaps.feed());
                    console.log("Rotating nextMaps into currMaps.");
                    this.mapState[myMap] = "waiting";
                }
                break;
            case "nextMaps":
                if (this.mapState[myMap] == "new") {
                    this[myMap].consume(newData[1]);
                    console.log("Adding new nextMaps to rotation.");
                    this.mapState[myMap] = "waiting";
                }
                else if (this.mapState[myMap] == "rotate") {
                    this[myMap].consume(this.lastMaps.feed());
                    console.log("Rotating lastMaps into nextMaps.");
                    this.mapState[myMap] = "waiting";
                }
                break;
            case "lastMaps":
                if (this.mapState[myMap] == "new") {
                    this[myMap].consume(newData[2]);
                    console.log("Adding new lastMaps to rotation.");
                    this.mapState[myMap] = "waiting";
                }
                else if (this.mapState[myMap] == "rotate") {
                    this[myMap].consume(newData[2]);
                    console.log("Adding new lastMaps to rotation.");
                    this.mapState[myMap] = "waiting";
                }
                break;
        }
    }
};

var splatime = new inkData();
inkData.processInkResponse(inkResponse);

//var monitor = new UI.Window({
//    fullscreen: true,
//});
var monitor = new UI.Card({
    title: 'Splatime!',
    subtitle: 'TW maps:',
    body: splatime.currMaps.maps[0] + ", " + splatime.currMaps[1],
});

monitor.show();

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