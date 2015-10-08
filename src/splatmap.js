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
    var timeText = null;
    
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
        
    start = formatter(this.startTime.getHours());
    end = formatter(this.endTime.getHours());
    timeText = {
        text: time + " Rotation:\n" + start + " - " + end,
    };
    
    return timeText;
};

SplatMap.prototype.formatData = function(sType, sTime) {
    var texts = {
        type: null,
        time: null,
        rules: null,
        maps: null,
    };
    var rulesbg = sType + 'bg';
    
    texts.type = sType;
    texts.time = this.formatTime(sTime);
    texts.rules = {
        text: this[sType].rules + ":",
        backgroundColor: sBase.plAttr(rulesbg),
    };
    texts.maps = {
        text: this[sType].maps[0] + "\n" + this[sType].maps[1],
        backgroundColor: sBase.plAttr(rulesbg),
    };
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
