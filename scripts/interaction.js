// Interactive Roller Derby track by Fabien Tricoire (Vienna Roller Derby)
// April 2013.
// Please send your requests and suggestions to wonderzbra@gmail.com

// This work is available under the GNU General Public License v3, which can
// be found at http://www.gnu.org/licenses/gpl-3.0.txt

// This means you can use it, modify it and redistribute it as long as you
// also provide the source code of the provided software and of any
// derivative work based on it, and as long as you cite the original authors
// of the program (copyright information). Other restrictions apply.
// The most important restriction is that you cannot distribute proprietay
// software based on the provided programs and libraries.

function updateNumbers() {
    var numbers = document.getElementsByClassName('blockerNumber');
    if (config['shownumbers']) {
        for (var i=0; i < numbers.length; i++) {
            safeRemoveClass(numbers[i], 'invisible');
        }
    } else {
        for (var i=0; i < numbers.length; i++) {
            safeAddClass(numbers[i], 'invisible');
        }
    }
}

function updateZebras() {
    var zebras = document.getElementsByClassName('zebra');
    if (config['showzebras']) {
        for (var i=0; i < zebras.length; i++) {
            safeRemoveClass(zebras[i], 'invisible');
        }
    } else {
        for (var i=0; i < zebras.length; i++) {
            safeAddClass(zebras[i], 'invisible');
        }
    }
}

function updateMiddleLine() {
    var middleLine = document.getElementById('virtualDistanceLine');
    if (config['showmiddleline']) {
        safeRemoveClass(middleLine, 'invisible');
    } else {
        safeAddClass(middleLine, 'invisible');
    }
}

function updateTeamColours() {
    for (var i=0; i < document.styleSheets.length; i++) {
        if (document.styleSheets[i].disabled) continue;
        var str = document.styleSheets[i].href;
        if (str) {
            var rules = document.styleSheets[i].cssRules;
            for (var j=0; j < rules.length; j++) {
		if (rules[j].selectorText.substr(0, 5) == '.team') {
		    var suffix = rules[j].selectorText[5];
		    var colour = config['team' + suffix + 'colour'];
		    var newRule = ".team" + suffix + ' { stroke: ' + colour
			+ '; fill: ' + colour + '; }'
		    document.styleSheets[i].deleteRule(j);
		    document.styleSheets[i].insertRule(newRule, j);
		}
	    }
        }
    }
}

function addAllListeners() {
    document.addEventListener('mousedown', mouseDownOnBackground);
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);

    document.addEventListener('keydown', keyDown);

    document.addEventListener('mousewheel', mouseWheel);
    document.addEventListener('onmousewheel', mouseWheel);
    document.addEventListener('DOMMouseScroll', mouseWheel);

    // block browser events such as ctrl-click and shift-click
    document.addEventListener('click', blockEvent);
    // document.addEventListener('mousedown', blockEvent);

    for (var i=0; i < skaters.length; i++) {
        skaters[i].addEventListener('mousedown', mouseDownOnSkater);
        skaters[i].addEventListener('dblclick', doubleClick);
        // skaters[i].addEventListener('mousedown', blockEvent);
    }
    // save configuration before leaving
    // window.addEventListener('beforeunload', endOfSession);

    if (context == 'chrome app') {
        chrome.runtime.onSuspend.addListener(endOfSession);
        ; // instead we save data all the time asynchronously
    } else {
        window.addEventListener('beforeunload', endOfSession);
        // window.addEventListener('unload', endOfSession);
    }
}

function initialise() {
    // restore data from previous sessions
    restoreStoredData();
    // set history to default if non-existing
    if (positionHistory.length == 0) {
        resetHistory();
    }
    // initial position detection
    updateNumbers();
    updateMiddleLine();
    updateZebras();
    addAllListeners();
    checkPositions();
    // updateTeamColours(); NOW DONE WHEN SETTING A THEME
    //
    // // start a new history if there isn't already one
    // if (positionHistory.length == 0) {
    //     // store initial position in history
    //     savePositionsToHistory();
    // } else {
        timeOfLastSave = new Date().getTime();
    // }
    
    // BLM button
    document.getElementById('BLMButton').
        addEventListener('click', function(evt) {
            window.open("https://blacklivesmatter.com/"); } );
    
}

function endOfSession(event) {
    // save history
    storeData( [ 'positionHistory', 'currentPointInHistory' ] );


    // var msg = "hop hop hop";
    // (event || window.event).returnValue = msg;
    // return msg;
}

function blockEvent(evt) {
    if (evt.ctrlKey || evt.shiftKey) {
        evt.preventDefault();
    }
}

function contextBasedInit() {
    if (context != 'cordova' && context != 'mobile browser') {
        safeRemoveClass( document.getElementById('cheatSheetStarter'),
                         'invisible' );
    } else {
        safeAddClass( document.getElementById('cheatSheetStarter'),
                      'invisible' );
    }
    if (context !== 'cordova') {
        safeRemoveClass( document.getElementById('fullscreenToggler'),
                         'invisible' );
    } else {
        safeAddClass( document.getElementById('fullscreenToggler'),
                      'invisible' );
    }
}

initialise();
contextBasedInit();

// For debugging only
// document.getElementById('contextText').textContent = 'context: ' + context;
// safeRemoveClass(document.getElementById('contextText'), 'invisible');
