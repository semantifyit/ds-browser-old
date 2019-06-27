var DSUID;
var DSPath;
var domainSpecification;
var SDOVersion;
var DSNode;

var glob = {};
glob.rootUrl = window.location.protocol + "//" + window.location.host + "/";
glob.path = window.location.path;

$(document).ready(function () {
    setActualLibrary("latest"); //set a standard version for the SDO library
    let urlParts = readUrlParts();
    DSUID = urlParts.DsUid;
    DSPath = urlParts.DSPath;
    if (DSUID === undefined) {
        $('#backToOverviewLink').hide(); //hide back to overview link + show shacl code
        //show DS List
        con_getPublicDomainSpecifications(init_overview);
    } else {
        $('#shaclLink').attr("href", glob.rootUrl + "shacl/" + DSUID); //set URL of link
        //show details for a DS
        var redirect = checkRedirect();
        if (redirect !== false) {
            window.location.href = redirect;
        } else {
            con_getDomainSpecificationByHash(DSUID, init_detail);
        }
    }
});

//logic that checks if the actual URL path makes sense and returns a corrected URL
var checkRedirect = function () {
    var redirect = false;
    if (DSPath === "" && window.location.href.endsWith("/")) {
        return window.location.href.substring(0, window.location.href.length - 1);
    }
    if (DSPath !== undefined) {
        //remove last /
        if (DSPath.endsWith("/")) {
            DSPath = DSPath.substring(0, DSPath.length - 1);
            redirect = true;
        }
        //remove last DSPath item, if it is a property
        var pathParts = DSPath.split('/');
        if (pathParts[pathParts.length - 1].charAt(0).toUpperCase() !== pathParts[pathParts.length - 1].charAt(0)) {
            DSPath = DSPath.substring(0, DSPath.length - pathParts[pathParts.length - 1].length - 1);
            redirect = true;
        }
        if (redirect) {
            return glob.rootUrl + DSUID + "/" + DSPath;
        }
    }
    return redirect;
};

//reveals the content after it has been generated
function showPage() {
    $("#page-wrapper").fadeIn("fast");
}