/**
 * Hurk
 *
 * hurk!
 */

var Settings = require('settings');
var UI = require('ui');
var Vector2 = require('vector2');
var Clock = require('clock');

var regularRotation = false;
var RR = function() {
    return regularRotation;
};

// This is a bit of future-proofing. If Ninty adds alternate modes to Random
// matches in the future, they will presumably be formatted the same way as
// the Ranked rules data is now. This will catch the alternate rules data if
// it exists.

var scheduledMaps = function() {
    this.startTime = null;
    this.endTime = null;
    this.regular = {
        maps: ["", "", ""],
        rules: "",
    };
    this.ranked = {
        maps: ["", "", ""],
        rules: "",
    };
};

scheduledMaps.prototype.formatTime = function(time) {
    var timeString = "";
    console.log(time.toLocaleTimeString());
    console.log(time.getHours());
    
    if (time.getHours() > 12) {
        timeString = time.getHours()-12 + " PM";
    }
    else if (time.getHours() === 0) {
        timeString = "12 AM";
    }
    else {
        timeString = time.getHours() + " AM";
    }
    return timeString;
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

//scheduledMaps.prototype.start = function() {};
//scheduledMaps.prototype.end = function() {};


var Monitor = function() {
    this.state = {
        request: null,
        waiting: true,
        waitingFor: "startup",
        rotation: "standard",
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

Monitor.prototype.getMaps = function() {
    
    var xhReq = new XMLHttpRequest();
    xhReq.open('GET', 'http://splatoon.ink/schedule.json', false);
    xhReq.send(null);
    
    if (xhReq.status == 200) {
        console.log("Success - Request to splatoon.ink API returned status 200.");
        this.state.request = xhReq.status;
    }
    else if (xhReq.status !== 200) {
        console.log("Error - Request to splatoon.ink API returned status " + xhReq.status);
        this.state.request = xhReq;
    }
    
    var iResp = JSON.parse(xhReq.responseText);
    //console.log(iResponse);
    //console.log("response: " + iResponse);
    
    var iNum = 0;
    for (iNum = 0; iNum < iResp.schedule.length; iNum++) {
        if (iResp.schedule[iNum].regular.hasOwnProperty("rulesEN")) {
        }
        else {
            iResp.schedule[iNum].regular.rulesEN = "Turf War";
        }
    }
    return iResp;
};

Monitor.prototype.processInkResponse = function(iResp) {
    var prepData = function(data) {
        var newData = [];
        
        if (data.schedule.length == 3) {
            console.log("Prepping standard rotation data.");
        }
        else {
            console.log("Prepping nonstandard rotation data. " +
                        "Schedule length is " + data.schedule.length);
            this.state.rotation = "nonstandard";
        }
        
        var pullEN = function(info, opt) {
            var temp = [];
            var ident = opt + "EN";
            console.log("info: " + info);
            console.log(opt);
            if (info.hasOwnProperty("length")) {
                for (var i = 0; i < info.length; i++) {
                    temp.push(info[i][ident]);
                }
            }
            else {
                temp = info[ident];
            }
            return temp;
        };
        
        for (var iMap = 0; iMap < data.schedule.length; iMap++) {
            console.log("start: " + data.schedule[iMap].startTime +
                        "  end: " + data.schedule[iMap].endTime);
            newData.push(new scheduledMaps());
            console.log("" + data.schedule[iMap].regular.maps.length);
            newData[iMap].consume({
                startTime: new Date(data.schedule[iMap].startTime),
                endTime: new Date(data.schedule[iMap].endTime),
                regular: {
                    maps: pullEN(data.schedule[iMap].regular.maps, "name"),
                    rules: pullEN(data.schedule[iMap].regular, "rules"),
                },
                ranked: {
                    maps: pullEN(data.schedule[iMap].ranked.maps, "name"),
                    rules: pullEN(data.schedule[iMap].ranked, "rules"),
                }

            });
            console.log('iMap: ' + iMap);
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

Monitor.prototype.rotateMaps = function() {
    return this.processInkResponse(this.getMaps());
};

var splatMonitor = new Monitor();
splatMonitor.rotateMaps();

//var monitor = new UI.Window({
//    fullscreen: true,
//});
var splatTime = new UI.Card({
    title: 'Splatime!',
    subtitle: 'Next rotation: ' +
      splatMonitor.currMaps.formatTime(splatMonitor.currMaps.endTime),
    body: splatMonitor.currMaps.regular.rules + ":\n" +
      splatMonitor.currMaps.regular.maps[0] + ",\n" +
      splatMonitor.currMaps.regular.maps[1] + "\n\n" +
      splatMonitor.currMaps.ranked.rules + ":\n" +
      splatMonitor.currMaps.ranked.maps[0] + ",\n" +
      splatMonitor.currMaps.ranked.maps[1],
    scrollable: true,
    style: "small",
});
console.log(splatMonitor.currMaps.endTime.toTimeString());
console.log(splatMonitor.currMaps.endTime.toUTCString());
console.log(splatMonitor.nextMaps.endTime.toTimeString());
console.log(splatMonitor.nextMaps.endTime.toUTCString());
console.log(splatMonitor.lastMaps.endTime.toTimeString());
console.log(splatMonitor.lastMaps.endTime.toUTCString());

splatTime.show();

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