/**
* Storage file for things I don't want in app.js but don't want to delete
*/

/**

//var Settings = require('settings');

if (Settings.option("reloaded") === true) {
    //wooo
    console.log("Options reloaded successfully from localStorage");
}
else {
    console.log("Initializing new Settings.options");
    // set default options if there's nothing in localStorage
    Settings.option({
        pins: false,
        vibe: false,
        favoritism: {
            enabled: false,
            tw: false,
            sz: false,
            tc: false,
            rm: false,
        },
    });
}

Settings.config(
    { url: 'http://mivida.juegos/apps/splatime-monitor/index.html' },
    function(opts) {
        console.log('Opening config page');
        console.log('opts: ' + JSON.stringify(opts));
    },
    function(opts) {
        console.log('Closed config page');
        console.log('opts: ' + JSON.stringify(opts));
    }
);



*/