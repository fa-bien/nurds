// Interactive Roller Derby track by Wonder Zebra (Vienna Roller Derby)
// April 2013.
// Please send your requests and suggestions to wonderzbra@gmail.com

// This work is available under the GNU General Public License v3, which can
// be found at http://www.gnu.org/licenses/gpl-3.0.txt

// keyboard events

function keyDown(evt) {
    code = parseInt(evt.keyCode);
    if (code == 37) { // left key
        historyBack();
    } else if (code == 39) { // right key
        historyForward();
    } else if (code == '32') { // space bar
        toggleConfigValue('showpack');
        checkPositions();
    } else if (code == '80') { // P
        toggleConfigValue('showOOP');
        checkPositions();
    } else if (code == '66') { // B
        toggleConfigValue('showOOB');
        checkPositions();
    } else if (code == '69') { // E
        toggleConfigValue('showEZ');
        checkPositions();
    } else if (code == '68') { // D
        toggleConfigValue('showdown');
        checkPositions();
    } else if (code == '78') { // N
        toggleConfigValue('shownopack');
        checkPositions();
    } else if (code == '77') { // M
        toggleNumbers();
    } else if (code == '83') { // S
        skate(true, evt.shiftKey);
    } else if (code == '82') { // R
        skate(false, evt.shiftKey);
    } else if (code == '86') { // V
        toggleMiddleLine();
    } else if (code == '90') { // Z
        toggleZebras();
    } else if (code == '27') { // Escape
        resetHistory();
    } else if (code == '73') { // I
        // only toggle popup controls if they are defined
        if (document.getElementById('popupGUI')) {
            toggleOverlay('popupGUI');
        }
    } else if (code == '67') { // C
        // only toggle popup controls if they are defined
        if (document.getElementById('cheatSheet')) {
            toggleOverlay('cheatSheet');
        }
    } else if ( code >= 48 && code <= 57 ) { // digits
        number = getNumberFromKeys(evt);
        if (evt.shiftKey) {
            saveBookmark('', number);
        } else {
            loadBookmark(number);
        }
    } else if (code == '71') { // G
        dumpStatic();
    } else if (code == '72') { // H
        toggleRecording();
    } else if (code == '70') { // F
        toggleFullscreen();
    } else {
        //console.log(code);
    }
}

// alt = +10
function getNumberFromKeys(evt) {
    number = evt.altKey ? 10 : 0;
    code = parseInt(evt.keyCode);
    if (code == 48) { // 0 key
        number += 9;
    } else {
        number += code - 49;
    }
    console.log(number);
    return number;
}
