/**
 * splatview.js
 * ui object to hold windows and visual elements
 */

var UI = require('ui');
var sBase = require('splatbase');

var SplatView = function() {
    this.viewIndex = 0;

    this.mainWindow = sBase.aWindow({});

    this.splash = null;
    this.woomySplash = sBase.aWindow({
        fullscreen: true,
    });
    this.squidmarkSplash = sBase.aWindow({
        fullscreen: true,
    });

    this.status = sBase.aWindow({});

    this.elems = {
        squidmark: new UI.Image({
            image: sBase.squidmark.img,
            compositing: sBase.plAttr('comp'),
            position: sBase.squidmark.pos,
            size: sBase.squidmark.size,
        }),
        woomy: new UI.Text({
            font: sBase.woomy.font,
            color: sBase.woomy.color,
            textAlign: sBase.woomy.align,
            position: sBase.woomy.pos,
            size: sBase.woomy.size,
        }),
        time: new UI.Text({
            font: sBase.time.font,
            color: sBase.time.color,
            backgroundColor: sBase.plAttr('timebg'),
            borderColor: sBase.time.border,
            textAlign: sBase.time.align,
            position: sBase.time.pos,
            size: sBase.time.size,
        }),
        rules: new UI.Text({
            font: sBase.rules.font,
            color: sBase.rules.color,
            borderColor: sBase.rules.border,
            textAlign: sBase.rules.align,
            position: sBase.rules.pos,
            size: sBase.rules.size,
        }),
        maps: new UI.Text({
            font: sBase.maps.font,
            color: sBase.maps.color,
            borderColor: sBase.maps.border,
            textAlign: sBase.maps.align,
            position: sBase.maps.pos,
            size: sBase.maps.size,
        }),
        message: new UI.Text({
            font: sBase.message.font,
            color: sBase.message.color,
            textAlign: sBase.message.align,
            position: sBase.message.pos,
            size: sBase.message.size,
        }),
        squid: new UI.Image({
            compositing: sBase.plAttr('comp'),
            position: sBase.squid.pos,
            size: sBase.squid.size,
        }),
    };

    this.views = [null, null, null, null, null, null];

    // This is how I eventually figured out how to get all this work.
    // There are 4 windows: mainWindow, woomySplash, squidmarkSplash, and status
    // The squidmarkSplash window is static.
    // The woomySplash window is dynamic and is randomly used as the splash screen
    // instead of the squidmarkSplash window.
    // The status window is dynamic and is used to display messages in the event of
    // API failure or Splatfests.
    // The mainWindow window holds the time, rules, and maps elements. When a user
    // scrolls up and down through the current maps, the mainWindow elements are
    // updated to display the info at the current viewIndex.

    this.mainWindow.add(this.elems.time);
    this.mainWindow.add(this.elems.rules);
    this.mainWindow.add(this.elems.maps);

    this.woomySplash.add(this.elems.woomy);
    this.squidmarkSplash.add(this.elems.squidmark);

    this.status.add(this.elems.message);
    this.status.add(this.elems.squid);
};

SplatView.prototype.updateMain = function() {
    //console.log("Showing view elements at index " + this.viewIndex);
    for (var i = 0; i < sBase.main.length; i++) {
        for (var mapKey in this.views[this.viewIndex][sBase.main[i]]) {
            this.elems[sBase.main[i]][mapKey](this.views[this.viewIndex][sBase.main[i]][mapKey]);
        }
    }
};

// Shows status splash pages in the event of API failure or Splatfest events

SplatView.prototype.showFail = function() {
    this.showStatus('fail');
};

SplatView.prototype.showFest = function() {
    this.showStatus('splatfest');
};

SplatView.prototype.showStatus = function(state) {
    this.elems.message.text(sBase.message[state]);
    this.elems.squid.image(sBase.squid[state]);
    this.status.show();
    this.splash.hide();
};

// Generates random splash pages

SplatView.prototype.woomy = function() {
    var seed = sBase.randInt(1, 15);
    var bonus = sBase.randInt(1, 5);

    if (seed == 4 && bonus == 2) {
        console.log("seed == 4, bonus == 2, BOOTY!");
        this.splash = this.woomySplash;
        this.elems.woomy.text('BOOTY!');
    } else if (seed == 7) {
        console.log("seed == 7, WOOMY!");
        this.splash = this.woomySplash;
        this.elems.woomy.text('WOOMY!');
    } else if (seed == 13) {
        console.log("seed == 13, NGYES!");
        this.splash = this.woomySplash;
        this.elems.woomy.text('NGYES!');
    } else {
        this.splash = this.squidmarkSplash;
    }

    this.splash.show();
};

module.exports = SplatView;