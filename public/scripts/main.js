// Wrapper for global variables
let glob = {
    domain: window.location.protocol + "//" + window.location.host + "/", // The domain of this page
    path: window.location.path, // The actual path of the current web page (changes dynamically)
    dsListURL: undefined, // The list given in the URL as a parameter, this will be used instead of the standard List
    dsList: undefined, // The list with meta information about the DS (needed for DS overview)
    dsMemory: {}, // A cache for already loaded DS (key is their hash)
    dsUsed: undefined, // A pointer to the actual used DS (object) in the dsMemory
    dsPath: undefined, // The actual showed path within the annotation
    dsNode: undefined, // A pointer to the actual node (object) within the actual used DS
    sortingOption: undefined, // The sorting option for table elements
    mySDOAdapter: undefined, // The global used sdo adapter (based on the actual used DS)
    VIS_DS_TABLE: 1, // Enumeration for visibility states
    VIS_PROPERTY_TABLE: 2, // Enumeration for visibility states
    VIS_ENUMERATION_TABLE: 3, // Enumeration for visibility states
    VIS_NO_DS: 4, // Enumeration for visibility states
};
// Wrapper for global variables (UI elements)
let globUI = {
    $loadingContainer: $('#loading-container'),
    $contentContainer: $('#page-wrapper'),
    $dsDetailsLinks: $('#dsDetailsLinks'),
    $shaclLink: $('#shaclLink'),
    $dsListTable: $('#table-ds-list'),
    $dsListTableContent: $('#table-ds-list__content'),
    $propertiesTable: $('#table-properties'), // The table showing the properties of the current DS Node (a restricted Class)
    $propertiesTableContent: $('#table-properties__content'),
    $enumerationTable: $('#table-enumeration'),
    $enumerationTableContent: $('#table-enumeration__content'),
    $propertiesColumnHeader: $('.colProperty span'),
    $loreContainer: $('.lore-container'),
    $loreOpener: $('.lore-opener'),
    $linkLegend: $('#link-legend'),
    $description: $('#description'),
    $title: $('#title'),
    $path: $('#path'),
};

$(function() {
    startLoadingOfDSList();
    sortingClickHandler();
});

async function startLoadingOfDSList() {
    // Load list of DS
    // glob.dsList = await con_getPublicDomainSpecifications();
    const params = readParams();
    if (params.list) {
        glob.dsListURL = params.list;
        glob.dsList = await con_getDSList(glob.dsListURL);
    } else {
        glob.dsList = await con_getDSList("QAmcV0lZH");
    }
    renderState();
}

function readParams() {
    let params = {};
    let query = window.location.search.substring(1);
    let vars = query.split('&');
    for (let actVar of vars) {
        let pair = actVar.split('=');
        params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return params;
}

// Logic that checks if the actual URL path makes sense and returns a corrected URL
let checkRedirect = function() {
    let redirect = false;
    if (glob.dsPath === "" && window.location.href.endsWith("/")) {
        return window.location.href.substring(0, window.location.href.length - 1);
    }
    if (glob.dsPath !== undefined) {
        // Remove last /
        if (glob.dsPath.endsWith("/")) {
            glob.dsPath = glob.dsPath.substring(0, glob.dsPath.length - 1);
            redirect = true;
        }
        // Remove last DSPath item, if it is a property
        let pathParts = glob.dsPath.split('/');
        if (pathParts[pathParts.length - 1].charAt(0).toUpperCase() !== pathParts[pathParts.length - 1].charAt(0)) {
            glob.dsPath = glob.dsPath.substring(0, glob.dsPath.length - pathParts[pathParts.length - 1].length - 1);
            redirect = true;
        }
        if (redirect) {
            return glob.domain + glob.dsUsed.hash + "/" + glob.dsPath;
        }
    }
    return redirect;
};

function toggleLore() {
    let loreRef = $('.lore-ref');
    let loreButton = $('.lore-opener > a');
    if (globUI.$loreContainer.hasClass("closed")) {
        // Open
        globUI.$loreContainer.removeClass("closed").addClass("opened");
        loreRef.show();
        loreButton.text("Hide references...");
    } else {
        // Close
        globUI.$loreContainer.removeClass("opened").addClass("closed");
        loreRef.hide();
        loreButton.text("See references...");
    }
}

// internal navigation function, instead of calling a new URL/webpage we simulate the navigation to be faster and more efficient
function nav(path) {
    globUI.$contentContainer.hide();
    globUI.$loadingContainer.show();
    history.pushState(null, null, constructURL(path));
    renderState();
}

// constructs a new URL considering the actual global variables
function constructURL(path) {
    // 1. Domain always used
    let url = glob.domain;
    // 2. Path, only used when showing details of a DS
    if (path) {
        url += path;
    }
    // 3. List, always used when a List parameter is given (else the standard list will be used)
    if (glob.dsListURL) {
        url += "?list=" + glob.dsListURL;
    }
    // 4. Sorting, only used when showing details of a DS
    if (glob.sortingOption && glob.sortingOption !== "default") {
        if (glob.dsListURL) {
            url += "&";
        } else {
            url += "?";
        }
        url += "sorting=" + glob.sortingOption;
    }
    return url;
}

// This is called every time the user uses the back/foward button of the browser
window.addEventListener('popstate', function(e) {
    globUI.$contentContainer.hide();
    globUI.$loadingContainer.show();
    renderState();
});

// Reads the actual URL and renders the corresponding content
function renderState() {
    let urlParts = readUrlParts();
    let dsHash = urlParts.DsHash;
    glob.dsPath = urlParts.DsPath;
    if (dsHash === undefined) {
        // Show DS List
        init_overview();
    } else {
        globUI.$shaclLink.attr("href", glob.domain + "shacl/" + dsHash); // Set URL of link
        // Show details for a DS
        let redirect = checkRedirect();
        if (redirect !== false) {
            window.location.href = redirect;
        } else {
            if (!glob.dsMemory[dsHash]) {
                con_getDomainSpecificationByHash(dsHash, init_detail);
            } else {
                glob.dsUsed = glob.dsMemory[dsHash];
                init_detail();
            }
        }
    }
}

// Switch the visibility of elements depending on the current state
function setActualVisibility(state) {
    switch (state) {
        case glob.VIS_DS_TABLE:
            globUI.$loreContainer.show();
            globUI.$loreOpener.show();
            globUI.$dsListTable.show();
            globUI.$dsDetailsLinks.hide();
            globUI.$enumerationTable.hide();
            globUI.$propertiesTable.hide();
            globUI.$linkLegend.hide();
            globUI.$description.hide();
            globUI.$title.hide();
            globUI.$path.hide();
            break;
        case glob.VIS_PROPERTY_TABLE:
            globUI.$loreContainer.hide();
            globUI.$loreOpener.hide();
            globUI.$dsListTable.hide();
            globUI.$dsDetailsLinks.show();
            globUI.$enumerationTable.hide();
            globUI.$propertiesTable.show();
            globUI.$linkLegend.show();
            globUI.$description.show();
            globUI.$title.show();
            globUI.$path.show();
            break;
        case glob.VIS_ENUMERATION_TABLE:
            globUI.$loreContainer.hide();
            globUI.$loreOpener.hide();
            globUI.$dsListTable.hide();
            globUI.$dsDetailsLinks.show();
            globUI.$enumerationTable.show();
            globUI.$propertiesTable.hide();
            globUI.$linkLegend.show();
            globUI.$description.show();
            globUI.$title.show();
            globUI.$path.show();
            break;
        case glob.VIS_NO_DS:
            globUI.$loreContainer.hide();
            globUI.$loreOpener.hide();
            globUI.$dsListTable.hide();
            globUI.$dsDetailsLinks.hide();
            globUI.$enumerationTable.hide();
            globUI.$propertiesTable.hide();
            globUI.$linkLegend.hide();
            globUI.$description.show();
            globUI.$title.show();
            globUI.$path.hide();
            break;
    }
}