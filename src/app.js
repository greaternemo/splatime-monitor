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
var sBase = require('splatbase');
var splatMonitor = require('splatmonitor');
var splatView = require('splatview');


// go go go

var sMonitor = new splatMonitor();
sMonitor.rotateMaps();

var sView = new splatView();
sView.woomy();

// Now we're ready to do stuff.

var upflag = false;
var downflag = false;
var debugflag = false;
var shakeflag = false;

function confirmData() {
    // If the API request failed, show an error splash. That's it.
    if (sMonitor.state.lastAttempt == 'fail') {
        sView.showFail();
        return false;
    }

    // If we didn't get back data that we understand, show a Splatfest splash.
    else if (sMonitor.state.lastAttempt == 'splatfest') {
        sView.showFest();
        return false;
    }
    else {

        // If we got a 200 from the API request AND we got back data we understand,
        // handle it.

        sMonitor.formatAll(sView);

        if (upflag === false) {
            sView.window.on('click', 'up', function(e){
                sMonitor.handlePress("A");
                if (sView.viewIndex > 0) {
                    sView.viewIndex--;
                    sView.updateMain();
                }
                else {
                    //console.log("Up button was clicked, already at viewIndex 0!");
                }
            });
            upflag = true;
        }

        if (downflag === false) {
            sView.window.on('click', 'down', function(e){
                sMonitor.handlePress("B");
                if (sView.viewIndex < 5) {
                    sView.viewIndex++;
                    sView.updateMain();
                }
                else {
                    //console.log("Down button was clicked, already at viewIndex 5!");
                }
            });
            downflag = true;
        }

        // Debug menu for errors, requires secret password :3

        if (debugflag === false) {
            sView.window.on('longClick', 'select', function(e) {
                if (sMonitor.state.presses.toString() == sMonitor.state.password.toString()) {
                    console.log("Debug password entered! Loading debug menu!");
                    var debugMenu = new UI.Menu({
                        sections: [{
                            title: 'Error Pages',
                            items: [{
                                title: 'Bad Status',
                                subtitle: 'Response !== 200',
                            }, 
                                    {
                                        title: 'Bad Data',
                                        subtitle: 'Bad JSON returned',
                                    },
                                    {
                                        title: 'Old Data',
                                        subtitle: 'Later than endTime',
                                    },
                                    {
                                        title: 'Missing Data',
                                        subtitle: 'Incomplete JSON returned',
                                    },
                                    {
                                        title: 'Splash Page',
                                        subtitle: 'Uses woomy() function',
                                    }],
                        }],
                    });

                    debugMenu.on('select', function(e) {
                        // These need to be extended to mock the fail conditions.
                        if (e.item.title == 'Bad Status') {
                            sMonitor.rotateMaps(sBase.badstatus);
                            confirmData();
                        }
                        else if (e.item.title == 'Bad Data') {
                            sMonitor.rotateMaps(sBase.baddata);
                            confirmData();
                        }
                        else if (e.item.title == 'Old Data') {
                            sMonitor.rotateMaps(sBase.olddata);
                            confirmData();
                        }
                        else if (e.item.title == 'Missing Data') {
                            sMonitor.rotateMaps(sBase.missingdata);
                            confirmData();
                        }
                        else if (e.item.title == 'Splash Page') {
                            sView.woomy();
                            setTimeout(
                                function() {sView.splash.hide(); sView.splash.hide();},
                                2000
                            );
                        }
                    });

                    debugMenu.show();
                }
            });
            debugflag = true;
        }

        if (shakeflag === false) {
            sView.window.on('accelTap', function(e) {
                console.log("Shook the watch, forcing refresh");
                Vibe.vibrate('short');
                sView.woomy();
                sMonitor.rotateMaps();
                // If the API request failed, show an error splash. That's it.
                if (sMonitor.state.lastAttempt == 'fail') {
                    sView.showFail();
                }
                // If we didn't get back data that we understand, show a Splatfest splash.
                else if (sMonitor.state.lastAttempt == 'splatfest') {
                    sView.showFest();
                }
                else {
                    sMonitor.formatAll(sView);
                    sView.updateMain();
                    setTimeout(function() {sView.window.show(); sView.splash.hide();}, 1000);
                }
            });
            shakeflag = true;
        }

        // colorize things for the initial open
        sView.updateMain();
        setTimeout(function() {sView.window.show(); sView.splash.hide();}, 1000);
    }
}

confirmData();