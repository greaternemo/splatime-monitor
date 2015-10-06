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
    this.status= sBase.aWindow({
        clear: true,
    });
    this.elems = {
        squidmark: new UI.Image({
            position: sBase.squidmark.pos,
            size: sBase.squidmark.base,
            image: sBase.squidmark.img,
            compositing: sBase.comp(),
        }),
        woomy: new UI.Text({
            text: 'WOOMY',
            color: sBase.splashtxt.color,
            font: sBase.splashtxt.font,
            textAlign: sBase.splashtxt.align,
            position: sBase.splashtxt.pos,
            size: sBase.splashtxt.size,
        }),
        ngyes: new UI.Text({
            text: 'NGYES',
            color: sBase.splashtxt.color,
            font: sBase.splashtxt.font,
            textAlign: sBase.splashtxt.align,
            position: sBase.splashtxt.pos,
            size: sBase.splashtxt.size,
        }),
        status: new UI.Text({
            color: sBase.status.color,
            font: sBase.status.font,
            textAlign: sBase.status.align,
            position: sBase.status.pos,
            size: sBase.status.size,
        }),
        squid: new UI.Image({
            position: sBase.squid.pos,
            size: sBase.squid.size,
            compositing: sBase.comp(),
        }),
    };
    this.views = [];
};

SplatView.prototype.showMain = function () {
    console.log("Showing view elements at index " + this.viewIndex);
    this.alterMain('add');
};

SplatView.prototype.hideMain = function () {
    console.log("Hiding view elements at index " + this.viewIndex);
    this.alterMain('remove');
};

SplatView.prototype.alterMain = function (act) {
    for (var i = 0; i < sBase.main.length; i++) {
        this.window[act](this.views[this.viewIndex][sBase.main[i]]);
    }
};

SplatView.prototype.showFail = function () {
    this.elems.status.text = 'Unable to reach splatoon.ink API for maps!';
    this.elems.squid.image = 'images/squid_fail.png';
    this.showStatus();
};

SplatView.prototype.showSplatfest = function () {
    this.elems.status.text = 'Today is a Splatfest! Go support your team!';
    this.elems.squid.image = 'images/squid_splatfest.png';
    this.showStatus();
};

SplatView.prototype.showStatus = function () {
    this.status.add(this.elems.status);
    this.status.add(this.elems.squid);
    this.status.show();
    this.splash.hide();
};

SplatView.prototype.woomy = function () {
    this.splash.each( function(element) {
        element.remove();
    });

    var seed = 9;
    //var seed = sBase.randInt(1, 15);
    console.log("seed: " + seed);
    if (seed == 7) {
        this.splash.add(this.elems.woomy);
    }
    else if (seed == 13) {
        this.splash.add(this.elems.ngyes);
    }
    else {
        this.splash.add(this.elems.squidmark);
    }
};

module.exports = SplatView;