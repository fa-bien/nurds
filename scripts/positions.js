// Interactive Roller Derby track by Wonder Zebra (Vienna Rollergirls)
// April 2013.
// Please send your requests and suggestions to wonderzbra@gmail.com

// This work is available under the GNU General Public License v3, which can
// be found at http://www.gnu.org/licenses/gpl-3.0.txt

// everything related to detecting positions

function isOOB(skater) {
    var x = parseFloat(skater.getAttribute("x"));
    var y = parseFloat(skater.getAttribute("y"));
    // left half-circle
    if ( x < 265 ) {
        return ( Math.pow(265 - x, 2) + Math.pow(275 - y, 2) < smallR2 ||
                 Math.pow(265 - x, 2) + Math.pow(285 - y, 2) > bigR2 );
        // right half-circle
    } else if ( x > 615 ) {
        return ( Math.pow(615 - x, 2) + Math.pow(275 - y, 2) < smallR2 ||
                 Math.pow(615 - x, 2) + Math.pow(265 - y, 2) > bigR2 );
    // inner oval
    } else {
        // note: y coordinates grow when doing down
        if ( y + skaterR - trackSW/2.0 > 150 &&
             y - skaterR + trackSW/2.0  < 400 ) {
            return true;
        // above or below the track
        } else if ( y - skaterR + trackSW/2.0 < lineA * x + upperLineB ||
                    y + skaterR - trackSW/2.0 > lineA * x + lowerLineB ) {
            return true;
        }
    }
    return false;
}

function checkSkaterForOOB(skater) {
    if ( isOOB(skater) ) {
         setUrdumbAttr(skater, 'status', "OOB");
    } else {
         setUrdumbAttr(skater, 'status', "");
    }
}


// origin is the beginning of the first straightaway (x = 615) on lap 0
function distanceToOrigin(skater) {
    var cl = parseInt(getUrdumbAttr(skater, 'currentlap'));
    // sometimes cl is NaN at load time due to poor cache management from the
    // browsers.
    if (! cl) {
	cl = 0;
    }
    return cl * trackLength
        + cartesianToMu( parseFloat(skater.getAttribute('x')),
                         parseFloat(skater.getAttribute('y')) );
}

// distance from hips to hips using the middle-line projection
// the track is circular so we have to try both directions and take the
// shortest one
// d1 is the mu coordinate of skater 1 using track coordinates
// d2 is the mu coordinate of skater 2
function hipDistance(d1, d2) {
    // if (d1 >= d2) {
    //     return Math.min(d1 - d2, Math.abs(d2 + trackLength - d1));
    // } else {
    //     return Math.min(d2 - d1, Math.abs(d1 + trackLength - d2));
    // }
    return Math.abs(d1-d2);
}

// are these two skaters in proximity?
function nearEachOther(skater1, skater2) {
    return ( hipDistance(skater1, skater2) <= 100 );
}

function checkAllOOB() {
    for (var i=0; i < skaters.length; i++) {
        if (isPlayer(skaters[i])) {
            checkSkaterForOOB(skaters[i]);
        }
    }
}

function checkPositions() {
    resetAllStatus();
    // check for OOB skaters before calculating distances
    checkAllOOB();
    // position for each blocker
    for (var i=0; i < blockers.length; i++) {
        muForSkaterId[blockers[i].id] = distanceToOrigin(blockers[i]);
    }
    // largest proximity groups found using the distance matrix
    groups = eligibleGroups();
    // set downed skaters as such w.r.t. status purpose
    for (var i=0; i < skaters.length; i++) {
        if (isPlayer(skaters[i]) &&
            getUrdumbAttr(skaters[i], 'stance') == 'down') {
            setUrdumbAttr(skaters[i], 'status', 'down');
        }
    }
    // case where there is more (or less) than one group: no pack
    if (groups.length != 1) {
        for (var i=0; i < blockers.length; i++) {
            if ( getUrdumbAttr(blockers[i], 'status') != 'OOB' &&
                 getUrdumbAttr(blockers[i], 'status') != 'down' ) {
                setUrdumbAttr(blockers[i], 'status', 'nopack');
            }
        }
        foremostInPlay = null;
        rearmostInPlay = null;
        hideEZ();
    } else {
        packIds = groups[0];
        // set pack skaters
        for (var i=0; i < packIds.length; i++) {
            var packBlocker = document.getElementById(packIds[i]);
            setUrdumbAttr(packBlocker, 'status', 'pack');
        }
        // now check for OOP
        for (var i=0; i < blockers.length; i++) {
            if (getUrdumbAttr(blockers[i], 'status') != 'pack' &&
                getUrdumbAttr(blockers[i], 'status') != 'OOB' &&
                getUrdumbAttr(blockers[i], 'status') != 'down' &&
                (! inPlay (blockers[i].id, packIds) )
               ) {
                setUrdumbAttr(blockers[i], 'status', 'OOP');
            }
        }
        // determine engagement zone
        updateEZ(packIds);
        // update foremost and rearmost in play blockers
        updateForemostRearmost();
    }
    // now update the class list of each skater to reflect graphically
    // their status
    updateSkaterClasses();
    // also update their description
    updateSkaterDescriptions();
}

function updateForemostRearmost() {
    foremostInPlay = null;
    rearmostInPlay = null;
    var foremostDist = 0;
    var rearmostDist = 0;
    for (var i=0; i < blockers.length; i++) {
        if (getUrdumbAttr(blockers[i], 'status') != 'OOP' &&
            getUrdumbAttr(blockers[i], 'status') != 'OOB' &&
            getUrdumbAttr(blockers[i], 'status') != 'down'
           ) {
            var thisDist = distanceToOrigin(blockers[i]);
            if ( foremostInPlay === null ||
                 foremostDist < thisDist ) {
                foremostInPlay = blockers[i];
                foremostDist = thisDist;
            }
            if ( rearmostInPlay === null ||
                 rearmostDist > thisDist ) {
                rearmostInPlay = blockers[i];
                rearmostDist = thisDist;
            }
        }
    }
}

function trackSteps(firstMu, lastMu) {
    var nextMu = modulo(firstMu, trackLength);
    var endMu = modulo(lastMu, trackLength);
    var currentIndex = 0;
    var result = [];
    while (nextMu > trackMuSteps[currentIndex+1]) {
        currentIndex += 1;
    }
    while (nextMu != endMu) {
        step = { 'from': nextMu };
        if (endMu <= trackMuSteps[currentIndex+1] &&
            endMu > trackMuSteps[currentIndex]) {
            nextMu = endMu;
        } else {
            nextMu =  trackMuSteps[currentIndex+1];
        }
        step['lineType'] = trackLineTypes[currentIndex];
        step['to'] = nextMu;
        result.push(step);
        currentIndex = modulo(currentIndex + 1, trackMuSteps.length - 1);
    }
    return result;
}

// update the engagement zone with the given pack skater mu coordinates
// packIds contains the id of every skater in the pack, sorted from rearmost
// to frontmost
function updateEZ(packIds) {
    if ( ! config['showEZ'] ) {
        hideEZ();
    } else if ( config['showEZ'] ) {
        var firstMu = muForSkaterId[packIds[0]] - 200;
        var lastMu = muForSkaterId[packIds[packIds.length-1]] + 200;
        steps = trackSteps(firstMu, lastMu);
        // first way (inside the track)
        var point = trackToCartesian(firstMu, -innerBoundaryToVirtualLine);
        var newPath = 'M ' + point['x'] + ',' + point['y'];
        for (var i=0; i < steps.length; i++) {
            point = trackToCartesian(steps[i]['to'],
                                     -innerBoundaryToVirtualLine);
            if (steps[i]['lineType'] == 'line') {
                newPath += ' L ' + point['x'] + ',' + point['y'];
            } else if (steps[i]['lineType'] == 'curve') {
                newPath += ' A 125,125 0 0,0 ' + point['x'] + ',' + point['y'];
            }
        }
        // cross the track
        point = trackToCartesian(lastMu,
                                 trackWidth(lastMu)
                                 - innerBoundaryToVirtualLine);
        newPath += ' L ' + point['x'] + ',' + point['y'];
        // way back (outside of the track)
        for (var i=steps.length-1; i >= 0; i--) {
            point = trackToCartesian(steps[i]['from'],
                                     trackWidth(steps[i]['from'])
                                     - innerBoundaryToVirtualLine);
            if (steps[i]['lineType'] == 'line') {
                newPath += ' L ' + point['x'] + ',' + point['y'];
            } else if (steps[i]['lineType'] == 'curve') {
                newPath += ' A 265,265 0 0,1 ' + point['x'] + ',' + point['y'];
            }
        }
        // close it
        newPath += ' Z';
        setEZ(newPath);
        showEZ();
    }
}

function setEZ(path) {
    engagementZone.setAttribute('d', path);
}

function hideEZ() {
    safeAddClass(engagementZone, 'invisible');
}

function showEZ() {
    safeRemoveClass(engagementZone, 'invisible');
}


// pre-condition: muForSkaterId is up to date
function inPlay(blockerId, packIds) {
    return hipDistance(muForSkaterId[blockerId],
                       muForSkaterId[packIds[0]]) <= 200 ||
        hipDistance(muForSkaterId[blockerId],
                    muForSkaterId[packIds[packIds.length - 1]]) <= 200;
}

// true if the skater with that id is OOB
function idIsOOB(id) {
    return (getUrdumbAttr(blockersById[id], 'status') == 'OOB');
}

// true if the skater with that id is down
function idIsDown(id) {
    return (getUrdumbAttr(blockersById[id], 'stance') == 'down');
}

// return groups of indices of skaters in proximity of each other
// useful for defining the pack
// pre-condition: muForSkaterId is up to date
function eligibleGroups() {
    var groups=[];
    // sort blockers according to their mu-position on the track
    var sortedBlockerIds = blockerIds.sort( function(x, y) {
        return parseFloat(muForSkaterId[x]) - parseFloat(muForSkaterId[y]) } );
    var usefulBlockerIds = sortedBlockerIds.filter(
        function(element, index, array) { return ! (idIsOOB(element)
                                                    || idIsDown(element) ) } );
    // if no skater is upright and in bounds, our job is done
    if (usefulBlockerIds.length == 0) {
        return [];
    }
    // now we sweep skaters from front to back
    var i = 0;
    var currentGroup = [usefulBlockerIds[0]];
    var tmpBlocker = document.getElementById(usefulBlockerIds[0]);
    var currentTeams = {};
    currentTeams[getUrdumbAttr(tmpBlocker, 'team')] = true;
    while (i < usefulBlockerIds.length - 1) {
        // no proximity: process previous group and start a new one
        if ( hipDistance( muForSkaterId[usefulBlockerIds[i]],
                          muForSkaterId[usefulBlockerIds[i+1]] ) > 100 ) {
            // add this group to our list if it is eligible
            if (Object.keys(currentTeams).length == 2) {
                groups.push(currentGroup);
            }
            // reset current group
            currentGroup = [];
            currentTeams = [];
        }
        tmpBlocker = document.getElementById(usefulBlockerIds[i+1]);
        currentGroup.push( usefulBlockerIds[i+1] );
        currentTeams[getUrdumbAttr(tmpBlocker, 'team')] = true;
        i += 1;
    }
    // add last group to our list if it is eligible
    if (Object.keys(currentTeams).length == 2) {
        groups.push(currentGroup);
    }
    // now process groups and return the eligible ones
    if (groups.length == 0) {
        return groups;
    } else {
        sorted = groups.sort( function(a, b) { return b.length - a.length } );
        var len = sorted[0].length;
        filtered = sorted.filter( function(element, index, array) {
            return element.length == len } );
        return filtered;
    }
}

function resetAllStatus() {
    for (var i=0; i < skaters.length; i++) {
        if (isPlayer(skaters[i])) {
            setUrdumbAttr(skaters[i], 'status', '');
            for (var s=0; s < skaterStatuses.length; s++) {
                if (memberOf(skaters[i], skaterStatuses[s]) ) {
                    removeClass(skaters[i], skaterStatuses[s]);
                }
            }
        }
    }
}
