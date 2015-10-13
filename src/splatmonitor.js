/**
* splatmonitor.js
* monitor object for tracking app state, retrieving and sorting map data
*/

var sMap = require('splatmap');

var SplatMonitor = function() {
    
    this.state = {
        request: null,
        lastAttempt: null,
        rotation: "standard",
        doRegRulesRotate: false,
        password: ["A", "B", "A", "B", "B", "B", "B", "B"],
        presses: ["", "", "", "", "", "", "", ""],
    };
        
    this.mapState = {
        currMaps: "new",
        nextMaps: "new",
        lastMaps: "new",
    };
    
    this.currMaps = null;
    this.nextMaps = null;
    this.lastMaps = null;
    
};

SplatMonitor.prototype.getMaps = function(debug) {
    
    var xhReq = null;
    
    if (debug) {
        xhReq = debug;
    }
    else {
        xhReq = new XMLHttpRequest();
        xhReq.open('GET', 'http://splatoon.ink/schedule.json', false);
        xhReq.send(null);
    }
    
    if (xhReq.status == 200) {
        console.log('Success - splatoon.ink API returned status 200.');
        this.state.request = xhReq.status;
    }
    else if (xhReq.status !== 200) {
        console.log('Failure - splatoon.ink API returned status ' + xhReq.status);
        this.state.request = xhReq;
        return 'fail';
    }
    
    var iResp = JSON.parse(xhReq.responseText);
    
    if (iResp.schedule[0].hasOwnProperty("ranked")) {
        if (iResp.schedule[0].endTime > Date.now()) {
            var iNum = 0;
            for (iNum = 0; iNum < iResp.schedule.length; iNum++) {
                if (iResp.schedule[iNum].regular.hasOwnProperty("rulesEN")) {
                    this.state.doRegRulesRotate = true;
                }
                else {
                    iResp.schedule[iNum].regular.rulesEN = "Turf War";
                }
            }
            return iResp;
        }
        // Only return splatfest if the first set of maps you get aren't the current maps.
        else {
            return 'splatfest';
        }
    }
    else {
        return 'fail';
    }
};

SplatMonitor.prototype.processInkResponse = function(iResp) {
    var dataPrep = function(data) {
        var newData = [];
        
        if (data == 'fail') {
            console.log("Bailing out due to improper API response.");
            return 'fail';
        }
        else if (data == 'splatfest') {
            console.log("Bailing out due to splatfest reponse.");
            this.state.rotation = "splatfest";
            return 'splatfest';
        }
        else if (data.schedule.length == 3) {
            console.log("Prepping standard rotation data.");
        }
        else if (data.schedule.length < 3) {
            console.log("Prepping nonstandard rotation data.");
            this.state.rotation = "nonstandard";
        }
        else if (data.schedule.length > 3) {
            console.log("schedule.length > 3, bailing out due to wtf.");
            return 'fail';
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
            newData.push(new sMap());
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
    
    var prepData = dataPrep.bind(this);
    
    var newData = prepData(iResp);
    if (newData == 'splatfest') {
        this.state.lastAttempt = 'splatfest';
        return;
    }
    else if (newData == 'fail') {
        this.state.lastAttempt = 'fail';
        return;
    }
    
    this.initMaps();
    
    var dummyMaps = {
        startTime: '*',
        endTime: '*',
        regular: {
            maps: ['No map data', 'available'],
            rules: 'Unreported',
        },
        ranked: {
            maps: ['No map data', 'available'],
            rules: 'Unreported',
        }

    };
    
    for (var myMap in this.mapState) {
        switch (myMap) {
            case "currMaps":
                // There should ALWAYS be a set of current maps if not fail or splatfest.
                this.currMaps.consume(newData[0]);
                console.log('Adding new currMaps to rotation.');
                break;
            case "nextMaps":
                if (newData.length >= 2) {
                    this.nextMaps.consume(newData[1]);
                    this.mapState.nextMaps = 'ready';
                    console.log("Adding new nextMaps to rotation.");
                }
                else {
                    this.nextMaps.consume(dummyMaps);
                    this.mapState.nextMaps = 'none';
                    console.log("No nextMaps to load at index 1.");
                }
                break;
            case "lastMaps":
                if (newData.length == 3) {
                    this.lastMaps.consume(newData[2]);
                    this.mapState.lastMaps = 'ready';
                    console.log("Adding new lastMaps to rotation.");
                }
                else {
                    this.lastMaps.consume(dummyMaps);
                    this.mapState.lastMaps = 'none';
                    console.log("No lastMaps to load at index 2.");
                }
                break;
        }
    }
    this.state.lastAttempt = 'success';
    return;
};

SplatMonitor.prototype.rotateMaps = function(debug) {
    return this.processInkResponse(this.getMaps(debug));
};

SplatMonitor.prototype.handlePress = function(button) {
    // Buttons should be logged "A" for up, "B", for down
    this.state.presses.shift();
    this.state.presses.push(button);
};

SplatMonitor.prototype.clearMaps = function() {
    // Sets all map value to null, trying to save some memory here.
    for (var mapKey in this.mapState) {
        this[mapKey] = null;
    }
};

SplatMonitor.prototype.initMaps = function() {
    for (var mapKey in this.mapState) {
        this[mapKey] = new sMap();
    }
};

SplatMonitor.prototype.formatAll = function(splatView) {
    // Current
    var cReg = this.currMaps.formatData('regular', 'Current');
    splatView.views[0] = cReg;
    var cRank = this.currMaps.formatData('ranked', 'Current');
    splatView.views[1] = cRank;

    // Next
    var nReg = this.nextMaps.formatData('regular', 'Next');
    splatView.views[2] = nReg;
    var nRank = this.nextMaps.formatData('ranked', 'Next');
    splatView.views[3] = nRank;

    // Later
    var lReg = this.lastMaps.formatData('regular', 'Last');
    splatView.views[4] = lReg;
    var lRank = this.lastMaps.formatData('ranked', 'Last');
    splatView.views[5] = lRank;
    
    this.clearMaps();
};

module.exports = SplatMonitor;
