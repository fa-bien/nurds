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
function updateSkaterClasses(skatersToUpdate) {
    for (const skater of skatersToUpdate) {
        let status = getNurdsAttr(skater, 'status');
        if (config['show' + status]) {
            addClass(skater, status);
        }
    }
}

// update the description of each skater
function updateSkaterDescriptions(skatersToUpdate) {
    for (skater of skatersToUpdate) {
        // Current convention: each skater has exactly one child, which is its
        // title element. We use it for the tooltip showing the lap count.
        let titleChild = skater.children[0];
        let newTitle = config['countlaps'] ? 'lap ' + getNurdsAttr(skater, 'currentlap') : "";
        if (titleChild.textContent != newTitle) {
            titleChild.textContent = newTitle;
        }
    }
}

function isPlayer(skater) {
    return (memberOf(skater, 'blocker') || memberOf(skater, 'jammer') );
}
