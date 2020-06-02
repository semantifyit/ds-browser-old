$(document).ready(() => {
    const params = getUrlParams();
    initializeView(params);
})

const initializeView = (params) => {
    if (!params.search) {
        params.search = 'Schema';
    }
    let activeBtn = $('#btn' + params.search);
    let activeContent = $('#tab' + params.search);
    activeContent.css("display", "block");
    activeBtn.addClass("active");
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const getUrlParams = () => {
        let pathname = window.location.pathname;
        let splitURL = pathname.split('/');
        let view = window.location.search;
        let splitView = view.split('=');
        let search = splitView[1];
        if (search) {
            search = search.toLowerCase();
            search = capitalizeFirstLetter(search);
        }
        return {
            baseUrl: window.location.origin,
            dshash: splitURL[1],
            search: search
        };
    }
    //wrapper for global variables
let glob = {
    domain: window.location.protocol + "//" + window.location.host + "/", //the domain of this page
    path: window.location.path, //the actual path of the current web page (changes dynamically)
    dsList: undefined, //the list with meta information about the DS (needed for DS overview)
    dsMemory: {}, //a cache for already loaded DS (key is their hash)
    dsUsed: undefined, //a pointer to the actual used DS (object) in the dsMemory
    dsPath: undefined, //the actual showed path within the annotation
    dsNode: undefined, //a pointer to the actual node (object) within the actual used DS
    sortingOption: undefined, //the sorting option for table elements
    mySDOAdapter: undefined //the global used sdo adapter (based on the actual used DS)
};
//global variables for UI elements
let globUI = {
    $loadingContainer: $('#loading-container'),
    $contentContainer: $('#page-wrapper'),
    $dsDetailsLinks: $('#dsDetailsLinks'),
    $shaclLink: $('#shaclLink'),
    $tableLink: $('#tableLink'),
    $treeLink: $('#treeLink'),
    $dsListTable: $('#table-ds-list'),
    $dsListTableContent: $('#table-ds-list__content'),
    $propertiesTable: $('#table-properties'), //the table showing the properties of the current DS Node (a restricted Class)
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
//enumeration for visibility states
const VIS_DS_TABLE = 1;
const VIS_PROPERTY_TABLE = 2;
const VIS_ENUMERATION_TABLE = 3;
const VIS_NO_DS = 4;

$(function() {
    startLoadingOfDSList();
});

async function startLoadingOfDSList() {
    //load list of DS
    glob.dsList = await con_getPublicDomainSpecifications();
    renderState();
}

//logic that checks if the actual URL path makes sense and returns a corrected URL
let checkRedirect = function() {
    let redirect = false;
    if (glob.dsPath === "" && window.location.href.endsWith("/")) {
        return window.location.href.substring(0, window.location.href.length - 1);
    }
    if (glob.dsPath !== undefined) {
        //remove last /
        if (glob.dsPath.endsWith("/")) {
            glob.dsPath = glob.dsPath.substring(0, glob.dsPath.length - 1);
            redirect = true;
        }
        //remove last DSPath item, if it is a property
        let pathParts = glob.dsPath.split('/');
        if (pathParts[pathParts.length - 1].charAt(0).toUpperCase() !== pathParts[pathParts.length - 1].charAt(0)) {
            glob.dsPath = glob.dsPath.substring(0, glob.dsPath.length - pathParts[pathParts.length - 1].length - 1);
            redirect = true;
        }
        if (redirect) {
            return glob.domain + getActualDsHash() + "/" + glob.dsPath;
        }
    }
    return redirect;
};

//hides the loading screen and reveals the content
function showPage() {
    globUI.$loadingContainer.hide();
    globUI.$contentContainer.show();
}

//hides the content and reveals the loading screen
function showLoading() {
    globUI.$contentContainer.hide();
    globUI.$loadingContainer.show();
}

function toggleLore() {
    let loreRef = $('.lore-ref');
    let loreButton = $('.lore-opener > a');
    if (globUI.$loreContainer.hasClass("closed")) {
        //open
        globUI.$loreContainer.removeClass("closed").addClass("opened");
        loreRef.show();
        loreButton.text("Hide references...");
    } else {
        //close
        globUI.$loreContainer.removeClass("opened").addClass("closed");
        loreRef.hide();
        loreButton.text("See references...");
    }
}

function nav(path) {
    showLoading();
    history.pushState(null, null, glob.domain + path);
    renderState();
}

//this is called every time the user uses the back/foward button of the browser
window.addEventListener('popstate', function(e) {
    showLoading();
    renderState()
});

//reads the actual URL and renders the corresponding content
function renderState() {
    let urlParts = readUrlParts();
    let dsHash = urlParts.DsHash;
    glob.dsPath = urlParts.DsPath;

    // only show switch button if no path
    if (glob.dsPath) {
        $('#switchTabs').hide();
    } else {
        $('#switchTabs').show();
    }

    if (dsHash === undefined) {
        //show DS List
        init_overview();
    } else {
        //TODO add tree table view handling
        globUI.$shaclLink.attr("href", glob.domain + "shacl/" + dsHash); //set URL of link
        globUI.$tableLink.attr("href", glob.domain + dsHash + "?view=table"); //set URL of link
        globUI.$treeLink.attr("href", glob.domain + dsHash + "?view=tree"); //set URL of link
        //show details for a DS
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

function setActualVisibility(state) {
    switch (state) {
        case VIS_DS_TABLE:
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
        case VIS_PROPERTY_TABLE:
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
        case VIS_ENUMERATION_TABLE:
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
        case VIS_NO_DS:
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

function getActualDsHash() {
    return glob.dsUsed.hash;
}

let baseUrl;

function switchTab(tabName) {
    // Get all elements with class="tabcontent" and hide them
    var tabContent = $(".tabcontent");
    const url = location.href;
    if (!baseUrl) {
        baseUrl = url;
    }
    switch (tabName) {
        case 'Table':
            //location.href = location.origin + location.pathname + '?view=table'
            window.history.pushState({}, null, location.pathname + '?view=table');
            break;
        case 'Tree':
            //            location.href = location.origin + location.pathname + '?view=tree'
            window.history.pushState({}, null, location.pathname + '?view=tree');
            break;
        default:
            //location.href = location.origin + location.pathname;
            window.history.pushState({}, null, location.pathname);
            break;
    }

    for (var i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    // Get all elements with class="tablinks" and remove the class "active"
    $(".tablinks").removeClass('active');
    $('#tab' + tabName).show();

    // Show the current tab, and add an "active" class to the button that opened the tab
    $('#' + tabName).show();

    let activeBtn = $('#btn' + tabName);
    activeBtn.addClass("active");
}