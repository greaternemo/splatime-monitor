/**
 * Splatime Monitor
 * by greater_nemo (Adam Boyd)
 * avboyd@gmail.com
 *
 */

var UI = require('ui');
//var Vector2 = require('vector2');
var Vibe = require('ui/vibe');
//var sMaps = require('splatmap');
//var sBase = require('splatbase');
var splatMonitor = require('splatmonitor');
var splatView = require('splatview');


// go go go

var sMonitor = new splatMonitor();
sMonitor.rotateMaps();

var sView = new splatView();
sView.woomy();
sView.splash.show();

// Now we're ready to do stuff.

// If the API request failed, show an error splash. That's it.
if (sMonitor.state.lastAttempt == 'fail') {
    sView.showFail();
}

// If we didn't get back data that we understand, show a Splatfest splash.
else if (sMonitor.state.lastAttempt == 'splatfest') {
    sView.showFest();
}

// If we got a 200 from the API request AND we got back data we understand,
// handle it.
else {
    
    var curr = function() {return sMonitor.currMaps;};
    var next = function() {return sMonitor.nextMaps;};
    var last = function() {return sMonitor.lastMaps;};

    // Current
    var cReg = curr().formatData("regular");
    sView.views.push(cReg);
    var cRank = curr().formatData("ranked");
    sView.views.push(cRank);

    // Next
    var nReg = next().formatData("regular");
    sView.views.push(nReg);
    var nRank = next().formatData("ranked");
    sView.views.push(nRank);

    // Later
    var lReg = last().formatData("regular");
    sView.views.push(lReg);
    var lRank = last().formatData("ranked");
    sView.views.push(lRank);

    sView.window.on('click', 'up', function(e){
        sMonitor.handlePress("A");
        if (sView.viewIndex > 0) {
            sView.hideMain();
            sView.viewIndex--;
            sView.showMain();
        }
        else {
            //console.log("Up button was clicked, already at viewIndex 0!");
        }
    });

    sView.window.on('click', 'down', function(e){
        sMonitor.handlePress("B");
        if (sView.viewIndex < 5) {
            sView.hideMain();
            sView.viewIndex++;
            sView.showMain();
        }
        else {
            //console.log("Down button was clicked, already at viewIndex 5!");
        }
    });
    
    // Debug menu for errors, requires secret password :3
    
    sView.window.on('longClick', 'select', function(e) {
        if (sMonitor.state.presses.toString() == sMonitor.state.password.toString()) {
            console.log("Debug password entered! Loading debug menu!");
            var debugMenu = new UI.Menu({
                backgroundColor: 'black',
                textColor: 'white',
                highlightBackgroundColor: 'white',
                highlightTextColor: 'black',
                sections: [{
                    title: 'Error Pages',
                    items: [{
                        title: 'Fail Page',
                        subtitle: 'Response !== 200',
                    }, 
                    {
                        title: 'Splatfest Page',
                        subtitle: 'Bad JSON returned',
                    },
                    {
                        title: 'Splash Page',
                        subtitle: 'Uses woomy() function',
                    }],
                }],
            });

            debugMenu.on('select', function(e) {
                // These need to be extended to mock the fail conditions.
                if (e.item.title == 'Fail Page') {
                    sView.showFail();
                }
                else if (e.item.title == 'Splatfest Page') {
                    sView.showFest();
                }
                else if (e.item.title == 'Splash Page') {
                    sView.woomy();
                    sView.splash.show();
                    setTimeout(
                        function() {sView.splash.hide(); sView.splash.hide();},
                        2000
                    );
                }
            });

            debugMenu.show();
        }
    });

    sView.window.on('accelTap', function(e) {
        console.log("Shook the watch, forcing refresh");
        Vibe.vibrate('short');
        sView.woomy();
        sView.splash.show();
        sView.hideMain();
        sMonitor.rotateMaps();
        sView.showMain();
        setTimeout(function() {sView.window.show(); sView.splash.hide();}, 1000);
    });

    // colorize things for the initial open
    sView.showMain();
    setTimeout(function() {sView.window.show(); sView.splash.hide();}, 1000);
}
