// based on http://www.sitepoint.com/use-html5-full-screen-api/
//
function fsAvailable() {
    return document.fullscreenEnabled || 
        document.webkitFullscreenEnabled || 
        document.mozFullScreenEnabled ||
        document.msFullscreenEnabled;
}

function enterFS() {
    if (docType == 'html5') {
        var i = document.getElementById('body');
    } else {
        var i = svg;//document.getElementById('svg');
    }
    // go full-screen
    if (i.requestFullscreen) {
        i.requestFullscreen();
    } else if (i.webkitRequestFullscreen) {
        i.webkitRequestFullscreen();
    } else if (i.mozRequestFullScreen) {
        i.mozRequestFullScreen();
    } else if (i.msRequestFullscreen) {
        i.msRequestFullscreen();
    }
}

function exitFS() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

function currentlyFS() {
    return document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
}

function toggleFullscreen() {
    if ( fsAvailable() ) {
        // are we full-screen?
        if ( currentlyFS() ) { // yes: then we exit fullscreen
            exitFS();
        } else {
            enterFS();
        }
    } else {
        console.log('full screen unavailable');
    }
}

if (docType == 'html5') {
    document.getElementById('fullscreenToggleButton').
        addEventListener('click', function(evt) { toggleFullscreen(); } );
}
