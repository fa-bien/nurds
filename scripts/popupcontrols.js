function toggleOverlay(name) {
    var current = document.getElementById(name).style.visibility;
    if (current == 'visible') {
        hideOverlay(name);
    } else {
        showOverlay(name);
    }
}

function hideOverlay(name) {
    document.getElementById(name).style.visibility = 'hidden';
    document.getElementById(name + 'Starter').style.visibility = 'visible';
}

function showOverlay(name) {
    document.getElementById(name).style.visibility = 'visible';
    document.getElementById(name + 'Starter').style.visibility = 'hidden';
}

function clickOnOverlay(evt) {
    evt.stopPropagation();
}

function mouseDownOnOverlay(evt) {
    evt.stopPropagation();
}

function initialiseControls() {
    for (key in config) {
        if (key && key in defaultConfig) {
	    if (key.substr(0, 4) == "show") {
		document.getElementById('checkbox-' + key).checked
		    = config[key];
            } else if (key.substr(key.length-6) == "colour") {
		// update currently selected colour (useful at startup)
		var button = document.getElementById( "button-colour-" +
						      key.substr(0, 5) );
		button.value = config[key];

		    // update currently selected colour (useful at startup)
//		    var button = document.getElementById("button-colour-" +
//							 team);
//		    button.value = colour;


	    }
        } else {
            delete config[key];
        }
    }
}

function updateCheckBox(key) {
    document.getElementById('checkbox-' + key).checked = config[key];
}

function addOverlayListeners() {
    document.getElementById('popupGUI').
        addEventListener('click', clickOnOverlay);
    document.getElementById('popupGUI').
        addEventListener('mousedown', mouseDownOnOverlay);
    document.getElementById('cheatSheet').
        addEventListener('click', clickOnOverlay);
    document.getElementById('cheatSheet').
        addEventListener('mousedown', mouseDownOnOverlay);
    // block mouse wheel
    document.getElementById('popupGUI').
        addEventListener('mousewheel', mouseDownOnOverlay);
    document.getElementById('popupGUI').
        addEventListener('onmousewheel', mouseDownOnOverlay);
    document.getElementById('popupGUI').
        addEventListener('DOMMouseScroll', mouseDownOnOverlay);
    document.getElementById('cheatSheet').
        addEventListener('mousewheel', mouseDownOnOverlay);
    document.getElementById('cheatSheet').
        addEventListener('onmousewheel', mouseDownOnOverlay);
    document.getElementById('cheatSheet').
        addEventListener('DOMMouseScroll', mouseDownOnOverlay);
    // GUI checkboxes
    document.getElementById('checkbox-showzebras').
        addEventListener('click',
                         function(evt) { toggleZebras(); } );
    document.getElementById('checkbox-countlaps').
        addEventListener('click',
                         function(evt) { toggleLapCount(); } );
    document.getElementById('checkbox-shownumbers').
        addEventListener('click',
                         function(evt) { toggleNumbers(); } );
    document.getElementById('checkbox-showmiddleline').
        addEventListener('click',
                         function(evt) { toggleMiddleLine(); } );
    document.getElementById('checkbox-showpack').
        addEventListener('click',
                         function(evt) { toggleConfigValue('showpack');
                                         checkPositions() } );
    document.getElementById('checkbox-shownopack').
        addEventListener('click',
                         function(evt) { toggleConfigValue('shownopack');
                                         checkPositions() } );
    document.getElementById('checkbox-showOOB').
        addEventListener('click',
                         function(evt) { toggleConfigValue('showOOB');
                                         checkPositions() } );
    document.getElementById('checkbox-showOOP').
        addEventListener('click',
                         function(evt) { toggleConfigValue('showOOP');
                                         checkPositions() } );
    document.getElementById('checkbox-showdown').
        addEventListener('click',
                         function(evt) { toggleConfigValue('showdown');
                                         checkPositions() } );
    document.getElementById('checkbox-showEZ').
        addEventListener('click',
                         function(evt) { toggleConfigValue('showEZ');
                                         checkPositions() } );
    // history navigation
    document.getElementById('button-fastrewind').
        addEventListener('click', function(evt) { historyBack(10); } );
    document.getElementById('button-rewind').
        addEventListener('click', function(evt) { historyBack(1); } );
    document.getElementById('button-forward').
        addEventListener('click', function(evt) { historyForward(1); } );
    document.getElementById('button-fastforward').
        addEventListener('click', function(evt) { historyForward(10); } );
    document.getElementById('button-resethistory').
        addEventListener('click', function(evt) { resetHistory(); } );
    // bookmark save/load
    var bookmarkSelect = document.getElementById('select-bookmarks');
    document.getElementById('button-savebookmark').
        addEventListener('click',
                         function(evt) {
                             var tmp = bookmarkSelect.value;
                             saveBookmark('', parseInt(tmp));
                         } );
    document.getElementById('button-loadbookmark').
        addEventListener('click',
                         function(evt) {
                             var tmp = bookmarkSelect.value;
                             loadBookmark(parseInt(tmp));
                         } );
    // colour selection
    var colourA = document.getElementById('button-colour-teamA');
    colourA.addEventListener('input', function(evt) {
        setTeamColour('teamA', colourA.value);
    } );
    var colourB = document.getElementById('button-colour-teamB');
    colourB.addEventListener('input', function(evt) {
        setTeamColour('teamB', colourB.value);
    } );
    // theme selection
    var ts = document.getElementById('select-theme');
    ts.addEventListener('input', function(evt) {
        setTheme(ts.value);
    } );

    // GUI display
    document.getElementById('hidePopupGUIButton').
        addEventListener('click',
                         function(evt) { hideOverlay('popupGUI'); } );
    document.getElementById('showPopupGUIButton').
        addEventListener('click', function(evt) { showOverlay('popupGUI'); } );
    // cheat sheet display
    document.getElementById('hideCheatSheetButton').
        addEventListener('click',
                         function(evt) { hideOverlay('cheatSheet'); } );
    document.getElementById('showCheatSheetButton').
        addEventListener('click', function(evt) { showOverlay('cheatSheet'); });
}

initialiseControls();
addOverlayListeners();
