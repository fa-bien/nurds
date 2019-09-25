// remove incorrect entries
function sanitizeConfig() {
    for (key in config) {
        if (! (key in defaultConfig) ) {
            delete config[key];
	}
        if (typeof config[key] != typeof defaultConfig[key]) {
            config[key] = defaultConfig[key];
        }
    }
    for (key in defaultConfig) {
        if ( (! key in config) || (config[key] === undefined) ) {
            config[key] = defaultConfig[key];
	}
    }
}

// function wrapper: restore previously saved config and state
function restoreStoredData() {
    if (storageMethod == 'localStorage') {
        restoreStoredDataLocalStorage();
    } else if (storageMethod.substring(0, 14) == 'chrome.storage' ) {
        restoreStoredDataChromeStorage();
    } else {
        console.log('Unknown storage method:', storageMethod);
    }
}

// restore all data saved from previous sessions: localStorage version
function restoreStoredDataLocalStorage() {
    if (localStorage.config) {
        config = JSON.parse(localStorage.config);
        sanitizeConfig();
    }
    if (localStorage.positionHistory) {
        positionHistory = JSON.parse(localStorage.positionHistory);
        currentPointInHistory = JSON.parse(localStorage.currentPointInHistory);
        if ( currentPointInHistory >= 0 &&
             currentPointInHistory < positionHistory.length ) {
            loadPositions(positionHistory[currentPointInHistory]);
        }
    }
    if (localStorage.bookmarks) {
        bookmarks = JSON.parse(localStorage.bookmarks);
    }
}

// restore all data saved from previous sessions: chrome app version
function restoreStoredDataChromeStorage() {
    var callback = function(items) {
        if ('config' in items) {
            config = items['config'];
            sanitizeConfig();
        }
        if ('positionHistory' in items) {
            positionHistory = items['positionHistory'];
        }
        if ('currentPointInHistory' in items) {
            currentPointInHistory = items['currentPointInHistory'];
            loadPositions(positionHistory[currentPointInHistory]);
        }
        if ('bookmarks' in items) {
            bookmarks = items['bookmarks'];
        }
        checkPositions();
        updateNumbers();
    };
    var keys = ['positionHistory', 'currentPointInHistory',
                'config', 'bookmarks' ];
    if ( storageMethod == 'chrome.storage.local' ) {
        chrome.storage.local.get( keys, callback );
    }
}

// function wrapper: store data for further sessions
function storeData(keys) {
    if (storageMethod == 'localStorage') {
        storeDataLocalStorage(keys);
    } else if (storageMethod.substring(0, 14) == 'chrome.storage' ) {
        storeDataChromeStorage(keys);
    } else {
        console.log('Unknown storage method:', storageMethod);
    }
}

// function wrapper: store data for further sessions
function storeDataLocalStorage(keys) {
    for (var i=0; i < keys.length; i++) {
        if (keys[i] == 'positionHistory') {
            localStorage.positionHistory = JSON.stringify(positionHistory);
        } else if (keys[i] == 'currentPointInHistory') {
            localStorage.currentPointInHistory =
                JSON.stringify(currentPointInHistory);
        } else if (keys[i] == 'config') {
            localStorage.config = JSON.stringify(config);
        } else if (keys[i] == 'bookmarks') {
            localStorage.bookmarks = JSON.stringify(bookmarks);
        }
    }
}

// function wrapper: store data for further sessions
function storeDataChromeStorage(keys) {
    var tmp = {};
    for (var i=0; i < keys.length; i++) {
        if (keys[i] == 'config') {
            tmp['config'] = config;
        } else if (keys[i] == 'positionHistory') {
            tmp['positionHistory'] = positionHistory;
        } else if (keys[i] == 'currentPointInHistory') {
            tmp['currentPointInHistory'] = currentPointInHistory;
        } else if (keys[i] == 'bookmarks') {
            tmp['bookmarks'] = bookmarks;
        }
    }
    var callback = function() {
        ;
    };
    if ( storageMethod == 'chrome.storage.local' ) {
        chrome.storage.local.set( tmp, callback );
    }
}
