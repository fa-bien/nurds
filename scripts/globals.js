// Global variables

// Size of a skater
var skaterSize = parseFloat(document.getElementById('skater').
                            getAttribute('r'));
// used multiple times for mouse movement
var svg = document.getElementsByTagName('svg')[0];
var mousePoint = svg.createSVGPoint();
var boxPoint = svg.createSVGPoint();
var buttonDown = 0;
var currentObject = 0;
// used multiple times for OOB detection
var element = document.getElementById('skater');
var skaterSW = parseFloat(window.getComputedStyle(element).getPropertyValue('stroke-width'));
// used multiple times for pack detection
var blockers = document.getElementsByClassName('blocker');
var jammers = document.getElementsByClassName('jammer');
var blockerIds = [];
var blockersById = {};
for (var i=0; i < blockers.length; i++) {
    blockerIds.push(blockers[i].id);
    blockersById[blockers[i].id] = blockers[i];
}
// used multiple times
var skaters = document.getElementsByClassName('movable');
// used all the time to make a selection
var selectionRectangle = document.getElementById('selectionRectangle');
var background = document.getElementById('background');
// how far the visual border of the skater is from its center, squared
var skaterR = skaterSize + skaterSW/2.0;
var element = document.getElementById('trackBoundary');
var trackSW = parseInt(window.getComputedStyle(element).
                       getPropertyValue('stroke-width'));
// radiuses used for OOB detection, taking into account visual elements such as
// stroke width, skater radius
// value for the inner circle
var smallR2 = Math.pow(125 - trackSW/2.0 + skaterR, 2);
// value for the outer circle
var bigR2 = Math.pow(265 + trackSW/2.0 - skaterR, 2);
// slope and y-intercept for the upper and lower lines
var lineA = -20.0/350;
var upperLineB = - lineA * 615;
var lowerLineB = 550 - lineA * 265;
// radius for the round sides of the virtual line used for distance calculation
var innerBoundaryToVirtualLine = 70;
var virtualLineRadius = 125 + innerBoundaryToVirtualLine;
// length of a straightaway
var straightawayLength = 350;
// length of half a circle following the virtual line
var halfCircleLength = Math.PI * virtualLineRadius;
var trackLength = 2 * (straightawayLength + halfCircleLength);
// classes used by CSS to represent graphically skater status
var skaterStatuses = [ 'OOP', 'OOB', 'pack', 'nopack', 'down' ]
// console.log(skaterSW, trackSW);
// how often we save history when moving stuff (in milliseconds)
var historySavePeriod = 200;
var trackMuSteps = [ 0,
                     straightawayLength,
                     straightawayLength + halfCircleLength,
                     2 * straightawayLength + halfCircleLength,
                     trackLength ];
var trackLineTypes = [ 'line', 'curve', 'line', 'curve', 'line' ]
// used multiple times for pack and EZ detection
var muForSkaterId = {}
// EZ object, updated all the time
var engagementZone = document.getElementById('engagementZone');
// skater speed for automatic animation
var blockerSpeed = 2;
var jammerSpeed = 5;
var refSpeed = 10;
// at which distance from the jammer is the JR close enough
var refCloseEnough = 0;
// ugly but necessary
const ZERO = .00001;
// are we recording a script?
var recording = false;

// used to guide referees
var foremostInPlay = null;
var rearmostInPlay = null;

defaultConfig = {
    'showpack': true,
    'showOOP': true,
    'showdown': true,
    'showOOB': true,
    'shownopack': true,
    'shownumbers': true,
    'showEZ': true,
    'showmiddleline': false,
    'showzebras': true,
    'teamAcolour': "#ffbb00",
    'teamBcolour': "#bb00bb",
    'theme': 'classic',
}

config = {};
for (key in defaultConfig) {
    config[key] = defaultConfig[key];
}

// history management
bookmarks = [];
lastVisitedBookmark = -1;
currentPointInHistory = 0;
// actual array used for history
positionHistory = []
// default history value
defaultHistory = [[{"id":"pivotA","x":"546","y":"22","currentlap":"0","stance":"upright"},{"id":"pivotB","x":"513","y":"123","currentlap":"0","stance":"upright"},{"id":"blockerA1","x":"545","y":"61","currentlap":"0","stance":"upright"},{"id":"blockerA2","x":"546","y":"91","currentlap":"0","stance":"upright"},{"id":"blockerA3","x":"546","y":"122","currentlap":"0","stance":"upright"},{"id":"blockerB1","x":"516","y":"53","currentlap":"0","stance":"upright"},{"id":"blockerB2","x":"517","y":"84","currentlap":"0","stance":"upright"},{"id":"blockerB3","x":"516","y":"23","currentlap":"0","stance":"upright"},{"id":"jammerA","x":"584","y":"59","currentlap":"0","stance":"upright"},{"id":"jammerB","x":"583","y":"90","currentlap":"0","stance":"upright"},{"id":"IPR1","x":"396","y":"231"},{"id":"IPR2","x":"579","y":"228"},{"id":"OPR1","x":"260","y":"-20"},{"id":"OPR2","x":"476","y":"-22"},{"id":"OPR3","x":"566","y":"-30"},{"id":"JRA","x":"569","y":"185"},{"id":"JRB","x":"594","y":"169"}]]

function setContext() {
    context = 'browser';
    storageMethod = 'localStorage';
    if (!!('ontouchstart' in window)) {
        context = 'mobile browser';
        // touch screen with file protocol means app
        if ( document.URL.indexOf('file://') !== -1 ) {
            context = 'cordova';
        }
    }
    if (window.chrome && chrome.runtime && chrome.runtime.id) {
        if (localStorage === undefined) {
            context = 'chrome app';
            storageMethod = 'chrome.storage.local';
        }
    }
}

setContext();
