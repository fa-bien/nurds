// Interactive Roller Derby track by Wonder Zebra (Vienna Roller Derby)
// April 2013.
// Please send your requests and suggestions to wonderzbra@gmail.com

// This work is available under the GNU General Public License v3, which can
// be found at http://www.gnu.org/licenses/gpl-3.0.txt

// everything math-related

function euclideanDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
}

function modulo(a, n) {
    return a - (n * Math.floor(a/n));
}

// convert Cartesian (x, y) coordinates of the skater to track (mu, rho)
// coordinates 
// track coordinates are based on the oval in the middle of the track:
// mu is the distance from the origin (beginning of the first straightaway,
// (x,y) =  (615,80) ) on the oval in the centre of the track
// rho is the distance from the green line, negative values mean "toward the
// centre of the track"
function cartesianToTrack(x, y) {
    var mu, rho;
    mu = cartesianToMu(x, y);
    // case 1: in the first straightaway
    if ( mu <= straightawayLength ) {
        rho = 80 - y;
        // case 2: first curve
    } else if ( mu <= straightawayLength + halfCircleLength ) {
        rho = euclideanDistance(x, y, 265, 275) - virtualLineRadius;
        // case 3: second straightaway
    } else if ( mu <= 2 * straightawayLength + halfCircleLength ) {
            rho = y - 470;
    } else { // last case: second curve
        rho = euclideanDistance(x, y, 615, 275) - virtualLineRadius;
    }
    return { 'mu': mu, 'rho': rho };
}

// width of the track at track coordinate mu
function trackWidth(mu) {
    mu = modulo(mu, trackLength);
    if ( mu <= straightawayLength ) {
        return 150 - 20 * mu / straightawayLength;
        // case 2: first curve
    } else if ( mu <= straightawayLength + halfCircleLength ) {
        var ratio = (mu - straightawayLength) / halfCircleLength;
        // good approximation of the real calculation...
        return 130 + (ratio + 0.11* Math.sin(Math.PI + ratio * 2 * Math.PI)) * 20;
        // faster but worse approximation
        // return 130 + ratio * 20;
        // case 3: second straightaway
    } else if ( mu <= 2 * straightawayLength + halfCircleLength ) {
        return 150 - 20 * (mu - straightawayLength - halfCircleLength)
            / straightawayLength;
    } else { // last case: second curve
        var ratio = (mu - 2 * straightawayLength - halfCircleLength)
            / halfCircleLength;
        return 130 + (ratio + 0.11* Math.sin(Math.PI + ratio * 2 * Math.PI)) * 20;
        // return 130 + ratio * 20;
    }
}

function trackToCartesian(mu, rho) {
    mu = modulo(mu, trackLength);
    var x, y, rho;
    // case 1: in the first straightaway
    if ( mu <= straightawayLength ) {
        x = 615 - mu;
        y = 80 - rho;
        // case 2: first curve
    } else if ( mu <= straightawayLength + halfCircleLength ) {
        var angle = - Math.PI * (mu - straightawayLength) / halfCircleLength
            - Math.PI / 2;
        var radius = virtualLineRadius + rho;
        x = 265 + radius * Math.cos(angle);
        y = 275 + radius * Math.sin(angle);
        // case 3: second straightaway
    } else if ( mu <= 2 * straightawayLength + halfCircleLength ) {
        x = 265 + ( mu - straightawayLength - halfCircleLength );
        y = 470 + rho;
    } else { // last case: second curve
        var angle = - Math.PI
            * (mu - 2 * straightawayLength - halfCircleLength)
            / halfCircleLength
            + Math.PI / 2;
        var radius = virtualLineRadius + rho;
        x = 615 + radius * Math.cos(angle);
        y = 275 + radius * Math.sin(angle);
    }
    return { 'x': x, 'y': y };
}

function cartesianToMu(x, y) {
    // case 1: in the first straightaway
    if ( x <= 615 && x >= 265 && y <= 275 ) {
        return 615 - x;
        // case 2: first curve
    } else if ( x < 265 ) {
        // first we need the angle; the reference point is the half circle's
        // centre at (265, 275)
        var angle = Math.atan( (275.0 - y) / (x - 265.0) ) + Math.PI / 2;
        return straightawayLength + halfCircleLength * (angle / Math.PI);
        // case 3: second straightaway
    } else if ( x < 615 ) {
        return straightawayLength + halfCircleLength + (x - 265.0);
    } else {
        // This time the reference point is the half circle's
        // centre at (615, 275)
        var angle = Math.atan( (275.0 - y) / (x - 615.0) ) + Math.PI / 2;
        return 2 * straightawayLength
            + halfCircleLength * (1 + angle / Math.PI);
    }
}

// shortest relative mu difference between two absolute mu values
// in other words, returns x such that mu2 + x = mu1 modulo trackLength
// and such that |x| is minimised
function shortestMuDifference(mu1, mu2) {
    var diff = Math.abs(mu1 - mu2);
    var reverse = false;
    if (trackLength - diff < diff) {
        diff = trackLength - diff;
    }
    if (Math.abs(modulo(mu2 + diff, trackLength) - mu1) < ZERO) {
        return diff;
    } else {
        return -diff;
    }
}
