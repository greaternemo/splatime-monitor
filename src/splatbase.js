/**
* splatbase.js
* global values for splatime monitor
*/

var UI = require('ui');
var Vector2 = require('vector2');

var SplatBase = {
    
    randInt: function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },

    time: {
        font: "gothic-24-bold",
        color: "white",
        border: "black",
        align: "center",
        pos: new Vector2(0, 4),
        size: new Vector2(144, 58),
    },

    rules: {
        font: "gothic-24-bold",
        color: "black",
        border: "black",
        align: "center",
        pos: new Vector2(0, 66),
        size: new Vector2(144, 34),
    },

    maps: {
        font: "gothic-18-bold",
        color: "black",
        border: "black",
        align: "center",
        pos: new Vector2(0, 104),
        size: new Vector2(144, 44),
    },
    
    squidmark: {
        pos: new Vector2(0, 12),
        size: new Vector2(144, 144),
        img: 'images/squidmark_logo_144x144.png',
    },
    
    woomy: {
        color: 'white',
        font: 'bitham-30-black',
        align: 'center',
        pos: new Vector2(0, 70),
        size: new Vector2(144, 30),
    },
    
    main: ["time", "rules", "maps"],
    
    platform: (function() {
        if (Pebble.getActiveWatchInfo) {
            console.log("Platform: " + Pebble.getActiveWatchInfo().platform);
            return Pebble.getActiveWatchInfo().platform;
        }
        else {
            console.log("Platform: aplite");
            return "aplite";
        }
    })(),
    
    aWindow: function (alts) {
        return new UI.Window({
            fullscreen: alts.fullscreen ? alts.fullscreen : false,
            scrollable: alts.scrollable ? alts.scrollable : false,
            backgroundColor: alts.backgroundColor ? alts.backgroundColor : 'black',
        });
    },
    
    message: {
        fail: 'Unable to reach splatoon.ink API for maps!',
        splatfest: 'Today is a Splatfest! Go support your team!',
        color: 'white',
        font: 'gothic-24-bold',
        align: 'center',
        pos: new Vector2(0, 28),
        size: new Vector2(144, 140),
    },
    
    squid: {
        fail: 'images/squidfail.png',
        splatfest: 'images/squidfest.png',
        pos: new Vector2(57, 0),
        size: new Vector2(28, 28),        
    },
};

SplatBase.plAttr = function (attr) {
    if (SplatBase.platform == "basalt" || SplatBase.platform == "chalk") {
        switch (attr) {
            case 'comp':
                return 'normal';
            case 'timebg':
                return 'darkGray';
            case 'regularbg':
                return 'green';
            case 'rankedbg':
                return 'orange';
        }
    }
    else {
        switch (attr) {
            case 'comp':
                return 'or';
            case 'timebg':
                return 'black';
            case 'regularbg':
                return 'white';
            case 'rankedbg':
                return 'white';
        }
    }
};
    
module.exports = SplatBase;
