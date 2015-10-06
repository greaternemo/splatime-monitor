/**
* splatmap.js
* object containing scheduled map info and formatting methods
*/

var sBase = require("splatbase");
var UI = require("ui");

var SplatMap = function() {
    this.time = "";
    this.startTime = null;
    this.endTime = null;
    this.regular = {
        maps: ["", ""],
        rules: "",
    };
    this.ranked = {
        maps: ["", ""],
        rules: "",
    };
};

SplatMap.prototype.formatTime = function(time) {
    var start = null;
    var end = null;
    var platformColor = null;
    var timeString = null;
    
    function formatter(aTime) {
        var temp = "";
        
        if (aTime === 0) {
            aTime += 12;
        }
        
        if (aTime > 12) {
            temp = aTime-12 + " PM";
        }
        else {
            temp = aTime + " AM";
        }
        
        return temp;
    }
    
    if (sBase.platform == 'basalt' || sBase.platform == 'chalk'){
        platformColor = 'darkGray';
    }
    else {
        platformColor = 'black';
    }
    
    start = formatter(this.startTime.getHours());
    end = formatter(this.endTime.getHours());
    timeString = new UI.Text({
        text: time + " Rotation:\n" + start + " - " + end,
        font: sBase.time.font,
        color: sBase.time.color,
        backgroundColor: platformColor,
        borderColor: sBase.time.border,
        textAlign: sBase.time.align,
        position: sBase.time.pos,
        size: sBase.time.size,
    });
    
    return timeString;
};

SplatMap.prototype.formatData = function(type) {
    var texts = {
        time: null,
        rules: null,
        maps: null,
    };
    
    var rulesColor = "";
    if (type == "regular") {
        rulesColor = "green";
    }
    else if (type == "ranked") {
        rulesColor = "orange";
    }
    
    texts.time = this.formatTime(this.time);
    texts.rules = new UI.Text({
        text: this[type].rules + ":",
        font: sBase.rules.font,
        color: sBase.rules.color,
        backgroundColor: rulesColor,
        borderColor: sBase.rules.border,
        textAlign: sBase.rules.align,
        position: sBase.rules.pos,
        size: sBase.rules.size,
    });
    texts.maps = new UI.Text({
        text: this[type].maps[0] + "\n" + this[type].maps[1],
        font: sBase.maps.font,
        color: sBase.maps.color,
        backgroundColor: rulesColor,
        borderColor: sBase.maps.border,
        textAlign: sBase.maps.align,
        position: sBase.maps.pos,
        size: sBase.maps.size,
    });
    return texts;
};

// These are for dumping one schedule's data into another.
// Usage:
// prevMaps.consume(currMaps.feed());
// currMaps.consume(nextMaps.feed());
// nextMaps.consume(lastMaps.feed());

SplatMap.prototype.feed = function() {
    return {
        startTime: this.startTime,
        endTime: this.endTime,
        regular: this.regular,
        ranked: this.ranked,
    };
};
SplatMap.prototype.consume = function(mapsData) {
    for (var dataKey in mapsData) {
        this[dataKey] = mapsData[dataKey];
    }
};

module.exports = SplatMap;