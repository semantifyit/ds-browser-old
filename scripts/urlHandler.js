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

var checkRedirect = function (dsUID, path) {
    if (dsUID === undefined) {
        //no DS UID in the URL, redirect to index of DS
        window.location = "https://schema-tourism.sti2.org/Schemas";
    }
    if (path !== undefined) {
        var redirect = false;
        //remove last /
        if (path.endsWith("/")) {
            path = path.substring(0, path.length - 1);
            redirect = true;
        }
        //remove last path item, if it is a property
        var pathSteps = path.split('/');
        if (pathSteps[pathSteps.length - 1].charAt(0).toUpperCase() !== pathSteps[pathSteps.length - 1].charAt(0)) {
            path = path.substring(0, path.length - pathSteps[pathSteps.length - 1].length - 1);
            redirect = true;
        }
        if (redirect) {
            window.location.search = "ds=" + DSUID + "&path=" + path;
        }
    }
    return true;
};

//for when the URL with / is possible
function readURL() {
    var urlPath = window.location.pathname.substring(1);
    if (urlPath.startsWith("ds/")) {
        urlPath = urlPath.substring("ds/".length, urlPath.length);
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

//for when the URL with / is possible
function setURL(uid, path, sortingOption) {
    let newUrl = "/ds";
    if (uid !== null) {
        newUrl = newUrl.concat("/" + uid);
        if (path !== null) {
            newUrl = newUrl.concat("/" + path);
            if (sortingOption !== null) {
                newUrl = newUrl.concat("?sorting=" + sortingOption);
            }
        }
    }
    window.location.pathname = newUrl;
}