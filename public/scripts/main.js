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
        //show DS List
        con_getPublicDomainSpecifications(init_overview);
    } else {
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

// function setDSMetaInfo(DS) {
//     $("#ds_author").text(DS["schema:author"]);
//     $("#ds_version").text(DS["schema:version"]);
//     $("#ds_sdo_version").text(DS["schema:schemaVersion"]);
//     $("#dsInfo").show();
// }
//
// function setDSTable() {
//     $("#table_ds").append(createHTMLForDSType(DSNode["@graph"][0]));
//     $("#table_ds").show();
// }


