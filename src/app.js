/**
 * Splatime Monitor
 * by greater_nemo (Adam Boyd)
 * avboyd@gmail.com
 *
 */

var UI = require('ui');
var Vector2 = require('vector2');
var Vibe = require('ui/vibe');

var regularRotation = false;

var TIME_POSITION = new Vector2(0, 4);
var TIME_SIZE = new Vector2(144, 58);

var RULES_POSITION = new Vector2(0, 66);
var RULES_SIZE = new Vector2(144, 34);

var MAPS_POSITION = new Vector2(0, 104);
var MAPS_SIZE = new Vector2(144, 44);

var platform = Pebble.getActiveWatchInfo().platform;
if (platform == "basalt") {
    console.log("Detected basalt platform: " + Pebble.getActiveWatchInfo().platform);
}
else {
    console.log("Detected aplite platform: " + Pebble.getActiveWatchInfo().platform);
}

var scheduledMaps = function() {
    this.startTime = null;
    this.endTime = null;
    this.times = null;
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
    var timeString = null;
    var start = "";
    var end = "";
    var platformColor = null;
    
    function formatter(aTime) {
        var temp = "";
        if (aTime > 12) {
            temp = aTime-12 + " PM";
        }
        else if (aTime === 0) {
            temp = "12 AM";
        }
        else {
            temp = aTime + " AM";
        }
        return temp;
    }
    
    if (platform == 'basalt'){
        platformColor = 'darkGray';
    }
    else {
        platformColor = 'black';
    }
    
    start = formatter(this.startTime.getHours());
    end = formatter(this.endTime.getHours());
    timeString = new UI.Text({
        text: time + " Rotation:\n" + start + " - " + end,
        font: "gothic-24-bold",
        color: "white",
        backgroundColor: platformColor,
        borderColor: "black",
        textAlign: "center",
        position: TIME_POSITION,
        size: TIME_SIZE,
    });
    
    return timeString;
};

scheduledMaps.prototype.formatData = function(type) {
    var texts = {
        rules: null,
        maps: null,
    };
    
    var color = "";
    if (type == "regular") {
        color = "green";
    }
    else if (type == "ranked") {
        color = "orange";
    }
    
    texts.rules = new UI.Text({
        text: this[type].rules + ":",
        font: "gothic-24-bold",
        color: "black",
        backgroundColor: color,
        borderColor: "black",
        textAlign: "center",
        position: RULES_POSITION,
        size: RULES_SIZE,
    });
    texts.maps = new UI.Text({
        text: this[type].maps[0] + "\n" + this[type].maps[1],
        font: "gothic-18-bold",
        color: "black",
        backgroundColor: color,
        borderColor: "black",
        textAlign: "center",
        position: MAPS_POSITION,
        size: MAPS_SIZE,
    });
    return texts;
};

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

var Monitor = function() {
    this.state = {
        request: null,
        waiting: true,
        waitingFor: "startup",
        rotation: "standard",
    };
        
    this.mapState = {
        currMaps: "new",
        nextMaps: "new",
        lastMaps: "new",
    };
    
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
    
    var iNum = 0;
    for (iNum = 0; iNum < iResp.schedule.length; iNum++) {
        if (iResp.schedule[iNum].regular.hasOwnProperty("rulesEN")) {
            regularRotation = true;
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
            newData.push(new scheduledMaps());
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
        }      
        return newData;
    };
    
    var newData = prepData(iResp);
    for (var myMap in this.mapState) {
        switch (myMap) {
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

var splatUI = function() {
    this.viewIndex = 0;
    this.window = new UI.Window({
        clear: true,
        scrollable: false,
        backgroundColor: 'black',
    });
    this.views = [];
};

var splatTime = new splatUI();

var curr = function() {return splatMonitor.currMaps;};
var next = function() {return splatMonitor.nextMaps;};
var last = function() {return splatMonitor.lastMaps;};

// Current
var cReg = curr().formatData("regular");
cReg.time = curr().formatTime('Current');
splatTime.views.push(cReg);
var cRank = curr().formatData("ranked");
cRank.time = curr().formatTime('Current');
splatTime.views.push(cRank);

// Next
var nReg = next().formatData("regular");
nReg.time = next().formatTime('Next');
splatTime.views.push(nReg);
var nRank = next().formatData("ranked");
nRank.time = next().formatTime('Next');
splatTime.views.push(nRank);

// Later
var lReg = last().formatData("regular");
lReg.time = last().formatTime('Last');
splatTime.views.push(lReg);
var lRank = last().formatData("ranked");
lRank.time = last().formatTime('Last');
splatTime.views.push(lRank);

var splash = new UI.Window({
    fullscreen: true,
    scrollable: false,
    backgroundColor: 'black',
});

var comp = null;
if (platform == "basalt") {
    comp = 'normal';
}
else {
    comp = 'or';
}

var squidmark = new UI.Image({
    position: new Vector2(0, 12),
    size: new Vector2(144, 144),
    image: 'images/squidmark_logo_144x144.png',
    compositing: comp,
});

splash.add(squidmark);
splash.show();

splatTime.window.on('click', 'up', function(e){
    if (splatTime.viewIndex > 0) {
        var thisIndex = null;
        thisIndex += splatTime.viewIndex;
        // hide whatever is visible
        console.log("Hiding view elements at index " + thisIndex);
        splatTime.window.remove(splatTime.views[thisIndex].time);
        splatTime.window.remove(splatTime.views[thisIndex].rules);
        splatTime.window.remove(splatTime.views[thisIndex].maps);
        // show me what I want to see
        splatTime.viewIndex--;
        console.log("Showing view elements at index " + splatTime.viewIndex);
        splatTime.window.add(splatTime.views[splatTime.viewIndex].time);
        splatTime.window.add(splatTime.views[splatTime.viewIndex].rules);
        splatTime.window.add(splatTime.views[splatTime.viewIndex].maps);
    }
    else {
        console.log("Up button was clicked, already at viewIndex 0!");
    }
});

splatTime.window.on('click', 'down', function(e){
    if (splatTime.viewIndex < 5) {
        var thisIndex = null;
        thisIndex += splatTime.viewIndex;
        // hide whatever is visible
        console.log("Hiding view elements at index " + thisIndex);
        splatTime.window.remove(splatTime.views[thisIndex].time);
        splatTime.window.remove(splatTime.views[thisIndex].rules);
        splatTime.window.remove(splatTime.views[thisIndex].maps);
        // show me what I want to see
        splatTime.viewIndex++;
        console.log("Showing view elements at index " + splatTime.viewIndex);
        splatTime.window.add(splatTime.views[splatTime.viewIndex].time);
        splatTime.window.add(splatTime.views[splatTime.viewIndex].rules);
        splatTime.window.add(splatTime.views[splatTime.viewIndex].maps);
    }
    else {
        console.log("Down button was clicked, already at viewIndex 5!");
    }
});

/**
splatTime.window.on('click', 'select', function(e){
    splash.show();
    setTimeout(function() {splatTime.window.show(); splash.hide();}, 10000);
});
*/

splatTime.window.on('accelTap', function(e) {
    console.log("Tapped the screen, forcing refresh");
    Vibe.vibrate('long');
    splash.show();
    splatTime.window.remove(splatTime.views[splatTime.viewIndex].time);
    splatTime.window.remove(splatTime.views[splatTime.viewIndex].rules);
    splatTime.window.remove(splatTime.views[splatTime.viewIndex].maps);
    splatMonitor.rotateMaps();
    splatTime.window.add(splatTime.views[splatTime.viewIndex].time);
    splatTime.window.add(splatTime.views[splatTime.viewIndex].rules);
    splatTime.window.add(splatTime.views[splatTime.viewIndex].maps);
    setTimeout(function() {splatTime.window.show(); splash.hide();}, 1000);
});

// colorize things for the initial open
splatTime.window.add(splatTime.views[0].time);
splatTime.window.add(splatTime.views[0].rules);
splatTime.window.add(splatTime.views[0].maps);
setTimeout(function() {splatTime.window.show(); splash.hide();}, 1000);