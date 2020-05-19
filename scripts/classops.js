// Interactive Roller Derby track by Wonder Zebra (Vienna Rollergirls)
// April 2013.
// Please send your requests and suggestions to wonderzbra@gmail.com

// This work is available under the GNU General Public License v3, which can
// be found at http://www.gnu.org/licenses/gpl-3.0.txt

// class membership operations

// wrappers based on the main document's type
function getNurdsAttr(object, attribute) {
    if (docType == 'SVG') {
        return object.getAttributeNS('https://nurds.space', attribute);
    } else {
        return object.getAttribute('nurds:' + attribute);
    }
}

function setNurdsAttr(object, attribute, value) {
    if (docType == 'SVG') {
        object.setAttributeNS('https://nurds.space', attribute, value);
    } else {
        object.setAttribute('nurds:' + attribute, value);
    }
}

// abstraction for class membership
function memberOf(object, className) {
    // classList is not supported by some browsers
    if (object.classList) {
        return object.classList.contains(className);
    } else {
        return object.className.baseVal.split(' ').indexOf(className) != -1;
    }
}

function addClass(object, className) {
    // classList is not supported by some browsers
    if (object.classList) {
        object.classList.add(className);
    } else {
        object.className.baseVal += " " + className;
    }
}

function removeClass(object, className) {
    // classList is not supported by some browsers
    if (object.classList) {
        object.classList.remove(className);
    } else {
        object.className.baseVal =
            object.className.baseVal.replace(' ' + className, "")
            .replace(className, "");
    }
}

function safeRemoveClass(object, className) {
    while (memberOf(object, className)) {
        removeClass(object, className);
    }
}

function safeAddClass(object, className) {
    if (! memberOf(object, className) ) {
        addClass(object, className);
    }
}

// update the class list of each skater to match their status
function updateSkaterClasses() {
    var status;
    for (var i=0; i < skaters.length; i++) {
        status = getNurdsAttr(skaters[i], 'status');
        if ( config['show' + status]) {
            addClass( skaters[i], status );
        }
    }
}

// update the description of each skater
function updateSkaterDescriptions() {
    var currentLap;
    for (var i=0; i < skaters.length; i++) {
        currentLap = getNurdsAttr(skaters[i], 'currentlap');
        skaters[i].setAttribute('title', 'lap ' + currentLap);
    }
}

function isPlayer(skater) {
    return (memberOf(skater, 'blocker') || memberOf(skater, 'jammer') );
}
