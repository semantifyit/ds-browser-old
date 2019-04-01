var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

var checkRedirect = function () {
    if (DSPath !== undefined) {
        var redirect = false;
        //remove last /
        if (DSPath.endsWith("/")) {
            DSPath = DSPath.substring(0, DSPath.length - 1);
            redirect = true;
        }
        //remove last DSPath item, if it is a property
        var pathSteps = DSPath.split('/');
        if (pathSteps[pathSteps.length - 1].charAt(0).toUpperCase() !== pathSteps[pathSteps.length - 1].charAt(0)) {
            DSPath = DSPath.substring(0, DSPath.length - pathSteps[pathSteps.length - 1].length - 1);
            redirect = true;
        }
        if (redirect) {
            window.location.href = glob.rootUrl + DSUID + "/" + DSPath;
        }
    }
    return true;
};

//for when the URL with / is possible
function readURL() {
    var urlPath = window.location.pathname.substring(1);
    if (urlPath.startsWith("/")) {
        urlPath = urlPath.substring("/".length, urlPath.length);
    }
    if (urlPath === "") {
        DSUID = undefined;
        DSPath = undefined;
    } else {
        var URLpathTokens = urlPath.split('/');
        if (URLpathTokens[0] !== undefined) {
            DSUID = URLpathTokens[0];
        }
        if (URLpathTokens[1] !== undefined) {
            DSPath = urlPath.substring(DSUID.length + 1);
        }
    }
}

function getUrlPaths() {
    var output = {
        "DsUid": undefined,
        "DSPath": undefined
    };
    var path = window.location.pathname;
    var paths = path.split('/');
    if (paths[1] !== "") {
        output.DsUid = paths[1];
    }
    if (paths[2] !== undefined) {
        output.DSPath = path.replace("/" + paths[1] + "/", '');
    }
    return output;
}