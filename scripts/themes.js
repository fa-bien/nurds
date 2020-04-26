function listThemes() {
    for (var i=0; i < document.styleSheets.length; i++) {
        var bn = basename(document.styleSheets[i].href);
        if (bn.startsWith('theme-')) {
            var themeName = bn.substring(6);
            console.log(i, themeName, document.styleSheets[i].href);
        }
    }
}

function basename(url) {
    var at = url.lastIndexOf('/') + 1;
    return url.substring(at, url.length-4);
}

// Use metada stored in CSS theme but not exploited by CSS
function setThemeExtra() {
    var style = getComputedStyle(document.body);
    // skater radius (already defined n globals.js, must be updated)
    skaterSize = parseFloat(style.getPropertyValue('--skater-radius'));
    var s = document.getElementById('skater');
    s.setAttribute('r', skaterSize);
    // pivot stripe height
    var psh = parseFloat(style.getPropertyValue('--pivot-stripe-height'));
    // jersey radius
    var jr = parseFloat(style.getPropertyValue('--jersey-radius'));
    var b = document.getElementById('blockerMark');
    b.setAttribute('r', jr);
    //
    // update all globals which can be modified by the theme
    //
    var element = document.getElementById('skater');
    skaterSW = parseFloat(window.getComputedStyle(element).getPropertyValue('stroke-width'));
    skaterR = skaterSize + skaterSW/2.0;
    element = document.getElementById('trackBoundary');
    trackSW = parseInt(window.getComputedStyle(element).
                       getPropertyValue('stroke-width'));
    smallR2 = Math.pow(125 - trackSW/2.0 + skaterR, 2);
    bigR2 = Math.pow(265 + trackSW/2.0 - skaterR, 2);
    // now we can update pivot stripe
    var ps = document.getElementById('pivotStripe');
    ps.setAttribute('x', skaterSW/2 - skaterSize);
    ps.setAttribute('y', -psh/2);
    ps.setAttribute('height', psh);
    ps.setAttribute('width', 2 * skaterSize - skaterSW);
    ps.setAttribute('rx', 4);
    ps.setAttribute('ry', 4);
}

// converts a *string* in 'rgb(a, b, c)' format to a hex string
function rgbToHex(rgbstring) {
    rgb = rgbstring.substring(4, rgbstring.length-1).split(', ');
    var RR = parseInt(rgb[0]).toString(16).padStart(2, '0') ;
    var GG = parseInt(rgb[1]).toString(16).padStart(2, '0') ;
    var BB = parseInt(rgb[2]).toString(16).padStart(2, '0') ;
    return '#' + RR + GG + BB;
}

// update colour pickers from config team colours 
function updateColourPickers() {
    // update colour pickers to reflect current colours
    var colourA = document.getElementById('button-colour-teamA');
    var aval = getComputedStyle(document.getElementById('pivotA')).fill;
    aval.startsWith('rgb') && (aval = rgbToHex(aval));
    colourA.value = aval;
    var colourB = document.getElementById('button-colour-teamB');
    var bval = getComputedStyle(document.getElementById('pivotB')).fill;
    // var bval = config['teamBcolour'];
    bval.startsWith('rgb') && (bval = rgbToHex(bval));
    colourB.value = bval;
}

// Use CSS theme info to overwrite previous user preference on team colours
function setPreferredTeamColours() {
    var style = getComputedStyle(document.body);
    var colourA = style.getPropertyValue('--preferred-team-A-colour');
    var colourB = style.getPropertyValue('--preferred-team-B-colour');
    config['teamAcolour'] = colourA;
    config['teamBcolour'] = colourB;
    updateTeamColours();
}

// if init is true then we are in the program initialisation
function setTheme(themeName, init=false) {
    for (var i=0; i < document.styleSheets.length; i++) {
        var bn = basename(document.styleSheets[i].href);
        if (bn === 'theme-' + themeName) {
            document.styleSheets[i].disabled = false;
        } else {
            document.styleSheets[i].disabled = true;
        }
    }
    config['theme'] = themeName;
    storeData(['config']);
    ts = document.getElementById('select-theme');
    ts.value = themeName;
    setThemeExtra();
    if (! init) {
        setPreferredTeamColours();
        storeData(['config']);
    }
    updateTeamColours();
    updateColourPickers();
}

function loadThemes() {
    selectWidget = document.getElementById("select-theme");
    for (var i=0; i < document.styleSheets.length; i++) {
        var bn = basename(document.styleSheets[i].href);
        if (bn.startsWith('theme-')) {
            var themeName = bn.substring(6);
            var option = document.createElement("option");
            option.text = themeName;
            selectWidget.add(option);
        }
    }
    // load user favourite theme
    setTheme(config['theme'], true);
}

loadThemes();
