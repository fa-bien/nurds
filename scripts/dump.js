// Interactive Roller Derby track by Wonder Zebra (Vienna Rollergirls)
// August 2013.
// Please send your requests and suggestions to wonderzbra@gmail.com

// This work is available under the GNU General Public License v3, which can
// be found at http://www.gnu.org/licenses/gpl-3.0.txt

// export-to-image functions: new version 2019-05-23
// most modern browsers won't open data URIs so we use a blob instead

function svgFileContent() {
    var clonedSVG = svg.cloneNode(true);
    var style = document.createElementNS(svg.ns, "style");
    style.textContent += '<![CDATA[' + '\n';
    // get stylesheet for svg
    // all styles are in urdumb.css
    // very much inspired from an answer at
    // http://code.google.com/p/canvg/issues/detail?id=143
    for (var i=0; i < document.styleSheets.length; i++) {
        var str = document.styleSheets[i].href;
        if (str.substr(str.length-10) == 'urdumb.css') {
            var rules = document.styleSheets[i].cssRules;
            for (var j=0; j < rules.length; j++) {
                if (rules[j].cssText.substr(0, 8) !=
                    '.movable') {
                    style.textContent += (rules[j].cssText + ' \n');
                }
            }
            break;
        }
    }
    style.textContent += '\n' + ' ]]> ' + '\n';
    clonedSVG.getElementsByTagName("defs")[0].appendChild(style);
    var prout = (new XMLSerializer()).serializeToString(clonedSVG);
    // correct < and > escaping
    prout = prout.replace('&lt;', '<').
        replace('&gt;', '>').
        replace('%20', ' ');
    prout = unescape(prout);
    // correct style specification
    prout = prout.replace(/<style[^>]*>/g, '<style type="text/css">');
    // remove scripts from the generated svg
    prout = prout.replace(/<script[^>]*\/>/g,'');
    data = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>' + '\n' +
        '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"' + '\n' +
        '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' + '\n\n' +
        prout;
    return data;
}

function createAnimation(repeat) {
    // default behaviour: repeat the animation
    repeat = typeof repeat !== 'undefined' ? repeat : true;
    // duration of one frame in seconds
    var frameDuration = historySavePeriod / 1000.0;
    // this is where we store the animation
    var animation = '<set id="scriptStart" xlink:href="#recButton"' +
        ' attributeName="class" to="invisible" dur="1ms" begin="0';
    if (repeat) {
        animation += '; scriptEnd.end';
    }
    animation += '" />\n';
    // compute every step
    var lastDate;
    for (var step=0; step < scriptSteps.length; step++) {
        lastFrame = scriptSteps[step]['frame'];
        animation += '<set xlink:href="#' + scriptSteps[step]['id'] +
            '" attributeName="' + scriptSteps[step]['attribute'] +
            '" to="' + scriptSteps[step]['value'] +
            '" begin="scriptStart.end + ' +
            frameDuration * lastFrame +
            '" />\n';
    }
    // end of the animation
    animation += '<set id="scriptEnd" xlink:href="#recButton" ' +
        ' attributeName="class" to="invisible" begin="scriptStart.end + ' +
        frameDuration * lastFrame +
        '" dur="1s" />\n';
    return animation;
}

// inspired from the answers at https://stackoverflow.com/questions/23218174/how-do-i-save-export-an-svg-file-after-creating-an-svg-with-d3-js-ie-safari-an
function saveSvgContent(content, name) {
    var svgBlob = new Blob([content],
			   {type:"image/svg+xml;charset=utf-8"});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function dumpStatic() {
    saveSvgContent(svgFileContent(), 'urdumb-static.svg')
}

function dumpScript() {
    content = svgFileContent()
    animation = createAnimation(frames);
    content = content.replace('</svg>', animation + '</svg>');
    saveSvgContent(content, 'urdumb-animated.svg')
}
