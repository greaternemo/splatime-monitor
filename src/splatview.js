/**
* splatview.js
* ui object to hold windows and visual elements
*/

var UI = require('ui');
var sBase = require('splatbase');

var SplatView = function() {
    this.viewIndex = 0;
    this.window = sBase.aWindow({
        clear: true,
    });
    this.splash = sBase.aWindow({
        fullscreen: true,
    });
    this.status = sBase.aWindow({
        clear: true,
    });
    this.elems = {
        squidmark: new UI.Image({
            position: sBase.squidmark.pos,
            size: sBase.squidmark.size,
            image: sBase.squidmark.img,
            compositing: sBase.comp(),
        }),
        woomy: new UI.Text({
            text: 'WOOMY!',
            color: sBase.woomy.color,
            font: sBase.woomy.font,
            textAlign: sBase.woomy.align,
            position: sBase.woomy.pos,
            size: sBase.woomy.size,
        }),
        ngyes: new UI.Text({
            text: 'NGYES!',
            color: sBase.woomy.color,
            font: sBase.woomy.font,
            textAlign: sBase.woomy.align,
            position: sBase.woomy.pos,
            size: sBase.woomy.size,
        }),
        booty: new UI.Text({
            text: 'BOOTY!',
            color: sBase.woomy.color,
            font: sBase.woomy.font,
            textAlign: sBase.woomy.align,
            position: sBase.woomy.pos,
            size: sBase.woomy.size,
        }),
        fail: new UI.Text({
            text: 'Unable to reach splatoon.ink API for maps!',
            color: sBase.status.color,
            font: sBase.status.font,
            textAlign: sBase.status.align,
            position: sBase.status.pos,
            size: sBase.status.size,
        }),
        splatfest: new UI.Text({
            text: 'Today is a Splatfest! Go support your team!',
            color: sBase.status.color,
            font: sBase.status.font,
            textAlign: sBase.status.align,
            position: sBase.status.pos,
            size: sBase.status.size,
        }),
        squidfail: new UI.Image({
            image: 'images/squidfail.png',
            position: sBase.squid.pos,
            size: sBase.squid.size,
            compositing: sBase.comp(),
        }),
        squidfest: new UI.Image({
            image: 'images/squidfest.png',
            position: sBase.squid.pos,
            size: sBase.squid.size,
            compositing: sBase.comp(),
        }),
    };
    this.views = [];
};

SplatView.prototype.showMain = function () {
    //console.log("Showing view elements at index " + this.viewIndex);
    this.alterMain('add');
};

SplatView.prototype.hideMain = function () {
    //console.log("Hiding view elements at index " + this.viewIndex);
    this.alterMain('remove');
};

SplatView.prototype.alterMain = function (act) {
    for (var i = 0; i < sBase.main.length; i++) {
        this.window[act](this.views[this.viewIndex][sBase.main[i]]);
    }
};

SplatView.prototype.showFail = function () {
    this.status.each( function(element) {
        element.remove();
    });
    this.status.add(this.elems.fail);
    this.status.add(this.elems.squidfail);
    this.showStatus();
};

SplatView.prototype.showFest = function () {
    this.status.each( function(element) {
        element.remove();
    });
    this.status.add(this.elems.splatfest);
    this.status.add(this.elems.squidfest);
    this.showStatus();
};

SplatView.prototype.showStatus = function () {
    this.status.show();
    this.splash.hide();
};

SplatView.prototype.woomy = function () {
    this.splash.each( function(element) {
        element.remove();
    });

    var seed = sBase.randInt(1, 15);
    var bonus = sBase.randInt(1, 5);
    //console.log("seed: " + seed);
    //console.log("bonus: " + bonus);
    
    if (seed == 4 && bonus == 2) {
        console.log("seed == 4, bonus == 2, BOOTY!");
        this.splash.add(this.elems.booty);
    }
    else if (seed == 7) {
        console.log("seed == 7, WOOMY!");
        this.splash.add(this.elems.woomy);
    }
    else if (seed == 13) {
        console.log("seed == 13, NGYES!");
        this.splash.add(this.elems.ngyes);
    }
    else {
        this.splash.add(this.elems.squidmark);
    }
};

module.exports = SplatView;
