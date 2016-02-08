/**
 * splatbase.js
 * global values for splatime monitor
 */

var UI = require('ui');
var Vector2 = require('vector2');

var SplatBase = {

    randInt: function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },

    // Formatting and positioning config for time, rules, and maps display

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

    // Formatting and config for squidmark and woomy splash pages

    squidmark: {
        pos: new Vector2(0, 12),
        size: new Vector2(144, 144),
        img: 'SQUIDMARK_ICON_SPLASH',
    },

    woomy: {
        color: 'white',
        font: 'bitham-30-black',
        align: 'center',
        pos: new Vector2(0, 70),
        size: new Vector2(144, 30),
    },

    // Fields in the mainWindow

    main: ["time", "rules", "maps"],

    // Current watch platform, determined at startup

    platform: (function() {
        if (Pebble.getActiveWatchInfo) {
            console.log("Platform: " + Pebble.getActiveWatchInfo().platform);
            return Pebble.getActiveWatchInfo().platform;
        } else {
            console.log("Platform: aplite");
            return "aplite";
        }
    })(),

    // Shortcut for creating new windows

    aWindow: function(alts) {
        return new UI.Window({
            fullscreen: alts.fullscreen ? alts.fullscreen : false,
            scrollable: alts.scrollable ? alts.scrollable : false,
            backgroundColor: alts.backgroundColor ? alts.backgroundColor : 'black',
        });
    },

    // Positioning and config data for fail and splatfest status splash images

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
        fail: 'SQUIDFAIL_ICON',
        splatfest: 'SQUIDFEST_ICON',
        pos: new Vector2(57, 0),
        size: new Vector2(28, 28),
    },

    // Alternate declarations for testing failure or splatfest

    // Triggers fail status with bad HTTP request status
    badstatus: {
        status: 403
    },

    // Triggers fail status with schedule[0].hasOwnProperty('ranked') === false
    baddata: {
        status: 200,
        responseText: JSON.stringify({
            schedule: ['NOPE', 'NOPE', 'NOPE'],
            splatfest: false,
        })
    },

    // Triggers splatfest status with Date.now() > endTime
    olddata: {
        status: 200,
        responseText: JSON.stringify({
            schedule: [{
                startTime: 1444543200000,
                endTime: Date.now() - 86400000,
                regular: {
                    maps: [{
                        name: {
                            en: "Urchin Underpass",
                        },
                    }, {
                        name: {
                            en: "Blackbelly Skatepark",
                        },
                    }],
                    rules: {
                        en: "Turf War",
                    }
                },
                ranked: {
                    maps: [{
                        name: {
                            en: "Arowana Mall",
                        },
                    }, {
                        name: {
                            en: "Port Mackerel",
                        },
                    }],
                    rules: {
                        en: "Splat Zones",
                    }
                },
            }],
            splatfest: false,
        })
    },

    // Triggers splatfest status with responseText.splatfest !== false
    splatfestdata: {
        status: 200,
        responseText: JSON.stringify({
            schedule: [{
                startTime: 1444543200000,
                endTime: Date.now() + 86400000,
                regular: {
                    maps: [{
                        name: {
                            en: "Urchin Underpass",
                        },
                    }, {
                        name: {
                            en: "Blackbelly Skatepark",
                        },
                    }],
                    rules: {
                        en: "Turf War",
                    }
                },
                ranked: {
                    maps: [{
                        name: {
                            en: "Arowana Mall",
                        },
                    }, {
                        name: {
                            en: "Port Mackerel",
                        },
                    }],
                    rules: {
                        en: "Splat Zones",
                    }
                },
            }],
            splatfest: true,
        })
    },

    // Triggers unreported maps for Next Rotation and Last Rotation
    missingdata: {
        status: 200,
        responseText: JSON.stringify({
            schedule: [{
                startTime: 1444543200000,
                endTime: Date.now() + 86400000,
                regular: {
                    maps: [{
                        name: {
                            en: "Urchin Underpass",
                        },
                    }, {
                        name: {
                            en: "Blackbelly Skatepark",
                        },
                    }],
                    rules: {
                        en: "Turf War",
                    }
                },
                ranked: {
                    maps: [{
                        name: {
                            en: "Arowana Mall",
                        },
                    }, {
                        name: {
                            en: "Port Mackerel",
                        },
                    }],
                    rules: {
                        en: "Splat Zones",
                    }
                },
            }],
            splatfest: false,
        })
    },
};

// Function to divine the current platform and return the proper color attribute values

SplatBase.plAttr = function(attr) {
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
    } else {
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