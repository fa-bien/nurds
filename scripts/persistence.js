// configuration, history, bookmarks

function visitNextBookmark() {
    if (lastVisitedBookmark != -1) {
        index = modulo(lastVisitedBookmark + 1, bookmarks.length);
    } else {
        index = 0;
    }
    loadBookmark(index);
}

function visitPreviousBookmark() {
    if (lastVisitedBookmark != -1) {
        index = modulo(lastVisitedBookmark - 1, bookmarks.length);
    } else {
        index = 0;
    }
    loadBookmark(index);
}

// move one step forward in history
function historyBack(nSteps) {
    nSteps = (typeof nSteps === 'undefined') ? 1 : nSteps;
    currentPointInHistory = Math.max(0, currentPointInHistory - nSteps);
    loadPositions(positionHistory[currentPointInHistory]);
}

function historyForward(nSteps) {
    nSteps = (typeof nSteps === 'undefined') ? 1 : nSteps;
    currentPointInHistory = Math.min(currentPointInHistory + nSteps,
                                     positionHistory.length - 1);
    loadPositions(positionHistory[currentPointInHistory]);
}
    
function savePositionsToHistory() {
    positions = dumpPositions();
    currentPointInHistory += 1;
    positionHistory[currentPointInHistory] = positions;
    timeOfLastSave = new Date().getTime();
    // prune remainder of future history if we start doing stuff again
    if (currentPointInHistory != positionHistory.length - 1) {
        positionHistory.splice(currentPointInHistory + 1);
    }
    // if we're recording a script, update it
    if (recording) {
        updateScript();
    }
    // // if we're running a chrome app, store history data (otherwise we store
    // // it at the end)
    // if (runningChromeApp()) {
        storeData( [ 'positionHistory', 'currentPointInHistory' ] );
    // }
}

// create a copy of current positions
function dumpPositions() {
   var positions = [];
    for (var i=0; i < skaters.length; i++) {
        thisPosition = { 'id': skaters[i].id,
                         'x': skaters[i].getAttribute('x'),
                         'y': skaters[i].getAttribute('y') };
        if (isPlayer(skaters[i])) {
            thisPosition['currentlap'] =
                getNurdsAttr(skaters[i], 'currentlap');
            thisPosition['stance'] =
                getNurdsAttr(skaters[i], 'stance');
        }
        positions.push( thisPosition );
    }
    return positions;
}

// create a copy of the current config
function dumpConfig() {
    var conf = {};
    var keys = Object.keys(config);
    for (var i=0; i < keys.length; i++) {
        conf[keys[i]] = config[keys[i]];
    }
    return conf;
}

function saveBookmark(name, index) {
    console.log('saving bookmark', index);
    bookmark = { 'name': name,
                 'positions': dumpPositions(),
                 'config': dumpConfig() };
    bookmarks[index] = bookmark;
    storeData(['bookmarks']);
}

function loadBookmark(index) {
    console.log('loading bookmark', index);
    if (bookmarks[index]) {
        keys = Object.keys(config);
        for (var i=0; i < keys.length; i++) {
            config[keys[i]] = bookmarks[index]['config'][keys[i]];
        }
        storeData(['config']);
        loadPositions(bookmarks[index]['positions']);
        savePositionsToHistory();
    }
    lastVisitedBookmark = index;
}

function loadPositions(positions) {
    for (var i=0; i < positions.length; i++) {
        var skater = document.getElementById(positions[i]['id']);
        skater.setAttribute('x', positions[i]['x']);
        skater.setAttribute('y', positions[i]['y']);
        if (isPlayer(skater)) {
            // in case there are corrupt states saved in history
            var currentLap = parseInt(positions[i]['currentlap']);
            if (isNaN(currentLap)) {
                currentLap = 0;
            }
            setNurdsAttr(skater, 'currentlap', currentLap);
            // in case there are corrupt states saved in history
            var stance = positions[i]['stance'];
            if (stance != 'upright' && stance != 'down') {
                stance = 'upright';
            }
            setNurdsAttr(skater, 'stance', stance);
        }
    }
    checkPositions();
    updateExtras();
    // // if we're running a chrome app, store history data (otherwise we store
    // // it at the end)
    // if (runningChromeApp()) {
    storeData( [ 'positionHistory', 'currentPointInHistory' ] );
    // }
}

// pre-condition: value is boolean
function toggleConfigValue(key) {
    // not a boolean XOR unfortunately
    //    config[key] ^= true;
    config[key] = config[key] ? false : true;
    storeData(['config']);
    if (context == 'chrome app') {
        updateContextMenu(key);
    }
    if ( document.getElementById('popupGUI') ) {
        updateCheckBox(key);
    }
}

function mouseWheel(evt) {
    var value;
    if ('wheelDelta' in evt) {
        value = evt.wheelDelta;
    } else if ('detail' in evt) { // firefox
        value = evt.detail * -40;
    }
    if (evt.altKey) {
        if (value < 0) {
            visitPreviousBookmark();
        } else {
            visitNextBookmark();
        }
    } else {
        if (value < 0) {
            historyBack();
        } else {
            historyForward();
        }
    }
}


function toggleNumbers() {
    toggleConfigValue('shownumbers');
    updateNumbers();
    updateContextMenu('shownumbers');
    if ( document.getElementById('popupGUI') ) {
        updateCheckBox('shownumbers');
    }
}

function toggleZebras() {
    toggleConfigValue('showzebras');
    updateZebras();
    updateContextMenu('showzebras');
    if ( document.getElementById('popupGUI') ) {
        updateCheckBox('showzebras');
    }
}

function toggleMiddleLine() {
    toggleConfigValue('showmiddleline');
    updateMiddleLine();
    updateContextMenu('showmiddleline');
    if ( document.getElementById('popupGUI') ) {
        updateCheckBox('showmiddleline');
    }
}

function toggleLapCount() {
    toggleConfigValue('countlaps');
    checkPositions();
    updateContextMenu('countlaps');
    if ( document.getElementById('popupGUI') ) {
        updateCheckBox('countlaps');
    }
}

function updateExtras() {
    updateNumbers();
    updateZebras();
    updateMiddleLine();
}

// start/stop recording
function toggleRecording() {
    recording = recording ? false : true;
    // recording ^= true;
    if (recording) {
        startRecording();
    } else {
        updateScript();
        stopRecording();
    }
}

function resetHistory() {
    positionHistory = JSON.parse(JSON.stringify(defaultHistory));
    currentPointInHistory = 0;    
    loadPositions(positionHistory[currentPointInHistory]);
    savePositionsToHistory();
}

// called when we start recording a script
function startRecording() {
    elementLastValue = { 'x': {}, 'y': {}, 'class': {}, 'd': {} };
    nScriptFrames = 0;
    scriptSteps = [];
    updateScript();
    recording = true;
    // set a visual signal that we're recording
    var recButton = document.getElementById('recButton');
    recButton.setAttribute('class', 'recButton');
}

// called when we conclude recording a script
function stopRecording() {
    var recButton = document.getElementById('recButton');
    recButton.setAttribute('class', 'invisible');
    recording = false;
    dumpScript();
}

// called every time a new frame from a script is stored
function updateScript() {
    // if a skater's attribute changed, keep track of it
    function keepTrack(elementId, attribute) {
        var element = document.getElementById(elementId);
        elementLastValue[attribute][element.id] =
            element.getAttribute(attribute);
        var value = elementLastValue[attribute][element.id]
        // do not track selection of objects
        if (attribute == 'class') {
            value = value.replace('selected', '').replace('  ', ' ');
        }
        scriptSteps.push({ 'id': element.id,
                           'attribute': attribute,
                           'value': value,
                           'frame': nScriptFrames
                         });
    }
    // each key is an element to track
    // each value is a list of attributes to track for this element
    // track EZ
    var elementAndAttributes = {
        engagementZone : [ 'class', 'd' ]
    };
    // track each skater
    for (var s = 0; s < skaters.length; s++) {
        elementAndAttributes[skaters[s].id] = [ 'x', 'y', 'class' ];
    }
    // skater numbers
    var numbers = document.getElementsByClassName('blockerNumber');
    for (var n=0; n < numbers.length; n++) {
        elementAndAttributes[numbers[n].id] = [ 'class' ];
    }
    // now for each element in the list, track its attributes
    for ( var element in elementAndAttributes ) {
        attributes = elementAndAttributes[element];
        for (var a = 0; a < attributes.length; a++) {
            if (! ( element.id in elementLastValue[attributes[a]] &&
                    elementLastValue[attributes[a]][element.id] ==
                    element.getAttribute(attributes[a])) ) {
                keepTrack(element, attributes[a]);
            }
        }
    }
    // move to next frame
    nScriptFrames += 1;
    // console.log(scriptSteps);
}

function setTeamColour(team, colour) {
    config[team + 'colour'] = colour;
    storeData(['config']);
    updateTeamColours();
}
