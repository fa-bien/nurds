function createMenus() {
    var titles = {
        'showpack': 'highlight pack skaters',
        'shownopack': 'highlight no-pack skaters ',
        'showOOP': 'highlight out-of-play skaters',
        'showOOB': 'highlight out-of-bounds skaters',
        'showdown': 'highlight downed skaters',
        'shownumbers': 'show skater numbers',
        'showEZ': 'show engagement zone',
        'showzebras': 'show skating officials',
        'showmiddleline': 'show middle line'
    };

    for (id in titles) {
        chrome.contextMenus.create({ 'type': 'checkbox',
                                     'id': id,
                                     'title': titles[id],
                                     'checked': config[id],
                                     'contexts': ['all'] });
    }
    
    chrome.contextMenus.onClicked.addListener(function(itemData) {
        if (itemData.menuItemId == 'showmiddleline') {
            toggleMiddleLine();
        } else if (itemData.menuItemId == 'showzebras') {
            toggleZebras();
        } else if (itemData.menuItemId == 'shownumbers') {
            toggleNumbers();
        } else {
            toggleConfigValue(itemData.menuItemId);
        }
        checkPositions();
    });
}

function updateContextMenu(id) {
    if (context == 'chrome app') {
        chrome.contextMenus.update(id, { 'checked': config[id] } );
    }
}

if (context == 'chrome app') {
    createMenus();
}
