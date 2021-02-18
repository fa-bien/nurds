// Interactive Roller Derby track by Wonder Zebra (Vienna Roller Derby)
// April 2013.
// Please send your requests and suggestions to wonderzbra@gmail.com

// This work is available under the GNU General Public License v3, which can
// be found at http://www.gnu.org/licenses/gpl-3.0.txt

// Everything related to moving skaters

// called when mouse button is pressed while over a skater
function mouseDownOnSkater(evt) {
    if (evt.button == 0) {
        var target = evt.currentTarget;
        buttonDown = true;
        motionStartX = evt.clientX;
        motionStartY = evt.clientY;
        // only select movable objects for dragging
        if (memberOf(target, 'movable') ) {
            currentObject = target;
            updateLastPoint(evt);
        }
        // do not pass event to lower layers
        evt.stopPropagation();
        // now if we're pressing ctrl we keep selecting
        if (evt.ctrlKey) {
            if (memberOf(target, 'selected') ) {
                deselectSkater(target);
            } else {
                selectSkater(target);
            }
        } else {
            if (! memberOf(target, 'selected')) {
                for (var s=0; s < skaters.length; s++) {
                    deselectSkater(skaters[s]);
                }
                selectSkater(currentObject);
            }
        }
    }
}

function mouseDownOnBackground(evt) {
    if (evt.button == 0) {
        buttonDown = true;
        mousePoint.x = evt.clientX;
        mousePoint.y = evt.clientY;
        boxPoint = mousePoint.matrixTransform(svg.getScreenCTM().inverse());
        setNurdsAttr(selectionRectangle, 'startX', boxPoint.x);
        setNurdsAttr(selectionRectangle, 'startY', boxPoint.y);
        selectionRectangle.setAttribute('x', boxPoint.x);
        selectionRectangle.setAttribute('y', boxPoint.y);
        selectionRectangle.setAttribute('width', 0);
        selectionRectangle.setAttribute('height', 0);
        safeRemoveClass(selectionRectangle, 'invisible');
        checkPreviouslySelected(evt.ctrlKey);
        updateSelectionFromRectangle();
    }
}

function checkPreviouslySelected(ctrlKey) {
    // keep track of which skater was (un)selected previously
    previouslySelected = {};
    for (var s=0; s < skaters.length; s++) {
        previouslySelected[skaters[s].id] =
            ctrlKey && memberOf(skaters[s], 'selected');
    }
}    

function doubleClick(evt) {
    var target = evt.currentTarget;
    if (isPlayer(target)) {
        toggleSkaterDown(target);
    }
}

function mouseUp(evt) {
    // save the current position in case there was a modification from
    // the previous one
    if ( currentObject &&
         (evt.clientX != motionStartX || evt.clientY != motionStartY) ) {
        savePositionsToHistory();
    }
    // the mouse is up, we don't drag anything anymore
    buttonDown = false;
    // therefore we're also not selecting anything any longer
    if (! memberOf(selectionRectangle, 'invisible') ) {
        safeAddClass(selectionRectangle, 'invisible');
    }
    //
    if (currentObject &&
        ! evt.ctrlKey &&
        ! memberOf(currentObject, 'selected')) {
        for (var s=0; s < skaters.length; s++) {
            deselectSkater(skaters[s]);
        }
        selectSkater(currentObject);
    }
    currentObject = 0;
    if (evt.ctrlKey) {
        evt.stopPropagation();
    }
}

function mouseMove(evt){
    // case where we're dragging a skater
    if (buttonDown && currentObject) {
        drag(evt);
        checkPositions();
        saveIfNeeded();
    } else if (buttonDown) { // case where we select using a rectangle
        mousePoint.x = evt.clientX;
        mousePoint.y = evt.clientY;
        boxPoint = mousePoint.matrixTransform(svg.getScreenCTM().inverse());
        var nurdsX = getNurdsAttr(selectionRectangle, 'startX');
        var nurdsY = getNurdsAttr(selectionRectangle, 'startY');
        // set x and width
        if (nurdsX <= boxPoint.x) {
            selectionRectangle.setAttribute('x', nurdsX);
            selectionRectangle.setAttribute('width',
                                              boxPoint.x - nurdsX);
        } else {
            selectionRectangle.setAttribute('x', boxPoint.x);
            selectionRectangle.setAttribute('width',
                                              nurdsX - boxPoint.x);
        }
        // set y and height
        if (nurdsY <= boxPoint.y) {
            selectionRectangle.setAttribute('y', nurdsY);
            selectionRectangle.setAttribute('height',
                                              boxPoint.y - nurdsY);
        } else {
            selectionRectangle.setAttribute('y', boxPoint.y);
            selectionRectangle.setAttribute('height',
                                              nurdsY - boxPoint.y);
        }
        // now we can update the selection with the new rectangle
        updateSelectionFromRectangle();
    }
}

function updateSelectionFromRectangle() {
    // more convenient this way
    boxPoint.x = selectionRectangle.getAttribute('x');
    boxPoint.y = selectionRectangle.getAttribute('y');
    var w = parseFloat(selectionRectangle.getAttribute('width'));
    var h = parseFloat(selectionRectangle.getAttribute('height'));
    // now we check each skater for potential selection
    // first the skaters who were not previously selected
    for (var s=0; s < skaters.length; s++) {
        var thisPoint = svg.createSVGPoint();
        thisPoint.x = skaters[s].getAttribute('x');
        thisPoint.y = skaters[s].getAttribute('y');
        // point is inside rectangle
        if ( thisPoint.x >= boxPoint.x &&
             thisPoint.x <= boxPoint.x + w &&
             thisPoint.y >= boxPoint.y &&
             thisPoint.y <= boxPoint.y + h ) {
            if ( previouslySelected[skaters[s].id] ) {
                deselectSkater(skaters[s]);
            } else {
                selectSkater(skaters[s]);
            }
        } else {
            if ( previouslySelected[skaters[s].id] ) {
                selectSkater(skaters[s]);
            } else {
                deselectSkater(skaters[s]);
            }
        }
    }
}

function selectSkater(skater) {
    safeAddClass(skater, 'selected');
}

function deselectSkater(skater) {
    safeRemoveClass(skater, 'selected');
}

function drag(evt) {
    // capture mouse movement since last event
    var dx = evt.clientX - currentX;
    var dy = evt.clientY - currentY;
    if (evt.shiftKey) {
        dragPolar(evt, dx, dy);
    } else {
        dragCartesian(evt, dx, dy);
    }
    for (var s=0; s < skaters.length; s++) {
        // update skater after moving it: test for collisions, OOB, etc
        if (memberOf(skaters[s], 'selected')) {
            checkCollisions(skaters[s]);
        }
    }
    // keep track of this move for the next one
    updateLastPoint(evt);
}

function translateOnScreen(skater, dx, dy) {
    // convert coordinates of moved object to mouse coordinate system
    boxPoint.x = skater.getAttribute('x');
    boxPoint.y = skater.getAttribute('y');
    mousePoint = boxPoint.matrixTransform(svg.getScreenCTM());
    // apply translation
    mousePoint.x += dx;
    mousePoint.y += dy;
    // re-convert to object's coordinate system
    boxPoint = mousePoint.matrixTransform(svg.getScreenCTM().inverse());
    // move object
    moveSkater( skater, boxPoint.x, boxPoint.y );
}

function dragPolar(evt, dx, dy) {
    // first calculate the polar difference for the skater under the mouse
    var oldTrackCoords = cartesianToTrack(
        currentObject.getAttribute('x'),
        currentObject.getAttribute('y'));
    translateOnScreen(currentObject, dx, dy);
    var newTrackCoords = cartesianToTrack(
        currentObject.getAttribute('x'),
        currentObject.getAttribute('y'));
    // console.log('x = ', currentObject.getAttribute('x'),
    //             '\ty = ', currentObject.getAttribute('y'));
    // console.log(newTrackCoords);
    var dmu = newTrackCoords['mu'] - oldTrackCoords['mu'];
    var drho = newTrackCoords['rho'] - oldTrackCoords['rho'];
    var tmpCoords;
    // then we can apply the same thing to all selected skaters
    for (var s=0; s < skaters.length; s++) {
        if ( memberOf(skaters[s], 'selected') &&
             skaters[s] !== currentObject ) {
            tmpCoords = cartesianToTrack(
                skaters[s].getAttribute('x'),
                skaters[s].getAttribute('y'));
            tmpCoords = trackToCartesian(tmpCoords['mu'] + dmu,
                                         tmpCoords['rho'] + drho);
            moveSkater(skaters[s], tmpCoords['x'], tmpCoords['y']);
        }
    }
}

function dragCartesian(evt, dx, dy) {
    // alert(evt.clientX + ',' + evt.clientY);
    // alert(currentX + ',' + currentY);
    // alert(dx + ',' + dy);
    for (var s=0; s < skaters.length; s++) {
        if (memberOf(skaters[s], 'selected')) {
            translateOnScreen(skaters[s], dx, dy);
        }
    }
}

// update last point where the currently selected object was dragged
function updateLastPoint(evt) {
    currentX = evt.clientX;
    currentY = evt.clientY;
}

function toggleSkaterDown(skater) {
    if (getNurdsAttr(skater, 'stance') == 'upright') {
        setNurdsAttr(skater, 'stance', 'down');
    } else if (getNurdsAttr(skater, 'stance') == 'down') {
        setNurdsAttr(skater, 'stance', 'upright');
    } else {
        console.log(getNurdsAttr(skater, 'stance'));
    }
    checkPositions();
    savePositionsToHistory();
}

function moveSkater(skater, x, y) {
    if (y < 275) { // we're on the top straightaway
    // if (! isOOB(skater) && y < 275) { // we're on the top straightaway
        var oldX = parseFloat(skater.getAttribute('x') );
        var oldY = parseFloat(skater.getAttribute('y') );
        var currentLap = parseInt( getNurdsAttr(skater, 'currentlap' ) );
        // pass the origin again in bounds
        if ( isPlayer(skater) && oldX >= 615 && x < 615 ) {
            setNurdsAttr(skater, 'currentlap', currentLap + 1);
        } else if ( isPlayer(skater) && oldX <= 615 && x > 615 ) {
            setNurdsAttr(skater, 'currentlap', currentLap - 1);
        }
    }
    skater.setAttribute('x', x );
    skater.setAttribute('y', y );
}


function checkAllCollisions() {
    for (var s=0; s < skaters.length; s++) {
        checkCollisions(skaters[s]);
    }
}

function checkCollisions(skater) {
    // first we list all the objects collided by this one
    var toProcess = [];
    var distance, minDist, dx, dy;
    for (var i=0; i < skaters.length; i++) {
        if ( skater == skaters[i] ||
             ( ! memberOf(skater, 'selected') &&
               memberOf(skaters[i], 'selected') )
           ) continue; // selected skaters shouldn't be pushed by others
        dx = skaters[i].getAttribute('x')
            - skater.getAttribute('x');
        dy = skaters[i].getAttribute('y')
            - skater.getAttribute('y');
        // distance between the centres of the two circles
        distance = Math.sqrt(dx*dx + dy*dy);
        // minimal acceptable distance
        minDist = (skaterSize ) * 2 + skaterSW - 1;
        // case of a collision
        if (distance < minDist) {
            // first push this skater
            var ratio = 2 * (minDist-distance) / minDist;
            var x = parseFloat(skaters[i].getAttribute('x'));
            var y = parseFloat(skaters[i].getAttribute('y'));
            // var x = parseFloat(skaters[i].getAttribute('x'));
            // var y = parseFloat(skaters[i].getAttribute('y'));
            moveSkater(skaters[i], x + dx * ratio, y + dy * ratio);
            // then queue it for subsequent collision testing
            toProcess.push(skaters[i]);
        }
    }
    // now we can recursively check for new collisions
    for (var i=0; i < toProcess.length; i++) {
        checkCollisions(toProcess[i]);
    }
}

// rho is the curent rho-value for this skater in the track coordinate system
function correctRho(skater, rho, skaterType) {
    if (skaterType == 'blocker') {
        // skater is already OOB
        if ( getNurdsAttr(skater, 'status') == 'OOB' ||
             rho >= 130 - innerBoundaryToVirtualLine - skaterR ) {
            // skater will be OOB
            return rho * .95;
        } else {
            return rho;
            // // random move
            // return rho * (.98 + Math.random() * .04);
        }
    } else {
        var idealRho;
        if (skaterType == 'jammer') {
            // try to get close to the inside of the track
            idealRho = - innerBoundaryToVirtualLine / 2;
        } else if (skaterType == 'JR') {
            var mod = 0;
            if (skater.getAttribute('id') == 'JRA') {
                mod = -2 * skaterSize;
            }
            idealRho = - innerBoundaryToVirtualLine - 1.6 * skaterSize + mod;
        } else if (skaterType == 'IPR') {
            idealRho = -2.3 * innerBoundaryToVirtualLine;
        } else if (skaterType == 'OPR') {
            idealRho = innerBoundaryToVirtualLine + 2 * skaterSize;
        } else {
            console.log('unknown skater type: ', skaterType);
            return rho;
        }
        var difference = rho - idealRho ;
        return idealRho + .9 * difference;
    }
}

function skate(forward, faster) {
    var trackCoords, cartesianCoords;
    for (var i=0; i < skaters.length; i++) {
        // downed skaters need time to stand back up
        if ( isPlayer(skaters[i]) &&
             getNurdsAttr(skaters[i], 'stance') == 'down') {
            if (Math.random() < .05) {
                setNurdsAttr(skaters[i], 'stance', 'upright');
            }
        } else {
            if (memberOf(skaters[i], 'blocker') ) {
                skateBlocker(skaters[i], forward, faster);
            } else if (memberOf(skaters[i], 'jammer') ) {
                skateJammer(skaters[i], forward, faster);
            } else if (memberOf(skaters[i], 'zebra') ) {
                skateRef(skaters[i], forward, faster);
            } else {
                console.log('Unknown skater type! ', skaters[i]);
            }
        }
    }
    checkAllCollisions();
    checkPositions();
    saveIfNeeded();
}

function skateSkater(skater, baseSpeed, forward, faster, skaterType) {
    var speed = forward ? baseSpeed : - baseSpeed;
    if (faster) {
        speed *= 5;
    }
    trackCoords = cartesianToTrack(
        parseFloat(skater.getAttribute('x') ),
        parseFloat(skater.getAttribute('y') ) );
    cartesianCoords = trackToCartesian(
        trackCoords['mu'] + speed,
        correctRho(skater, trackCoords['rho'], skaterType ) );
    moveSkater(skater, cartesianCoords['x'], cartesianCoords['y']);
}

function skateBlocker(blocker, forward, faster) {
    skateSkater(blocker, blockerSpeed, forward, faster, 'blocker');
}

function skateJammer(jammer, forward, faster) {
    skateSkater(jammer, jammerSpeed, forward, faster, 'jammer');
}

function skateRef(ref, forward, faster) {
    var target = null;
    var refType;
    var baseSpeed;
    var offset = 0;
    if (memberOf(ref, 'IPR')) {
        refType = 'IPR';
        baseSpeed = blockerSpeed;
        if (ref.getAttribute('id') == 'IPR1') {
            target = foremostInPlay;
            offset = 100;
        } else {
            target = rearmostInPlay;
            offset = -30;
        }
    } else if (memberOf(ref, 'OPR')) {
        refType = 'OPR';
        baseSpeed = blockerSpeed;
        if (ref.getAttribute('id') == 'OPR1') {
            target = foremostInPlay;
            offset = 150;
        } else if (ref.getAttribute('id') == 'OPR2') {
            target = foremostInPlay;
            offset = -10;
        } else {
            target = rearmostInPlay;
            offset = -80;
        }
    } else if (memberOf(ref, 'JR')) {
        refType = 'JR';
        baseSpeed = jammerSpeed;
        // jammer refs follow jammers
        var target;
        if (ref.getAttribute('id') == 'JRA') {
            target = document.getElementById('jammerA');
        } else {
            target = document.getElementById('jammerB');
        }
    } else {
        console.log('Unknown ref type: ', ref);
    }
    if (target !== null) {
        mu = modulo (
            cartesianToMu(parseFloat(target.getAttribute('x') ),
                          parseFloat(target.getAttribute('y') ) )
                + offset,
            trackLength );
        refFollowsMu(ref, mu, baseSpeed, forward, faster, refType, offset);
    } else {
        skateSkater(ref, baseSpeed, forward, faster, refType);
    }
}

function refFollowsMu(ref, mu, baseSpeed, forward, faster, refType) {
    var current = cartesianToMu(parseFloat(ref.getAttribute('x') ),
                                parseFloat(ref.getAttribute('y') ));
    var diff = shortestMuDifference(mu, current);
    // now if we're close enough to the target we skate normally,
    if (Math.abs(diff) < refCloseEnough) {
        skateSkater(ref, baseSpeed, forward, faster, refType);
    } else {         // otherwise we get closer to it
        var speed = Math.min(Math.abs(diff) * .3, refSpeed);
        skateSkater(ref, speed, diff >= 0, faster, refType);
    }
}

function saveIfNeeded() {
    if (new Date().getTime() - timeOfLastSave > historySavePeriod) {
        savePositionsToHistory();
    }
}
