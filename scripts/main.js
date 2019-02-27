var DSUID;
var DSPath;
var domainSpecification;
var SDOVersion;
var DSNode;
var sorting;
var URLSorting;

$(document).ready(function () {
    initSorting();
    registerClickHandler();


    //DSUID = getUrlParameter("ds");
    //DSPath = getUrlParameter("path");
    let parts = getUrlPaths();
    DSUID = parts[1];
    DSPath = parts[2];


    //console.log(glob.q_ds, getUrlParameter("ds"));

    URLSorting = getUrlParameter("sorting");
<<<<<<< HEAD
    // console.log("DS UID: " + DSUID);
    // console.log("DS path: " + DSPath);
=======
    console.log("DS UID: " + DSUID);
    console.log("DS path: " + DSPath);
>>>>>>> a5777779cd86e550773813bfc3dc2fce8af7142c
    if (DSUID === undefined) {
        //show index page
        con_getPublicDomainSpecifications(showDSList);
    } else {
        checkRedirect(DSUID, DSPath);
        con_getDomainSpecificationByHash(DSUID, function (data) {
            if (data === undefined) {
                setTitle("No Domain Specification with the given ID");
                $('#description').html("Return to the <a href=\"https://schema-tourism.sti2.org/Schemas\">List of Schemas</a>.")
                showPage();
                return;
            }
            domainSpecification = data;
            if (!pathCheck(domainSpecification, DSPath)) {
                //window.location.search = "ds=" + DSUID + "&path=" + domainSpecification["content"]["dsv:class"][0]["schema:name"];
                // console.log("/" + DSUID + "/" + domainSpecification["content"]["dsv:class"][0]["schema:name"]);
                //window.location.search = "/" + DSUID + "/" + domainSpecification["content"]["dsv:class"][0]["schema:name"];
                window.location.assign(domainSpecification["content"]["dsv:class"][0]["schema:name"]);
            } else {
                SDOVersion = getSDOVersion(domainSpecification);
                // console.log("DS SDO Version: " + SDOVersion);
                sdoLibrary.setVersion(SDOVersion);
            }
        });
    }
});

function initSorting() {
    if (URLSorting === "alphabetic" || URLSorting === "mandatoryFirst") {
        sorting = URLSorting;
        localStorage.setItem("sorting", sorting);
    } else {
        sorting = localStorage.getItem("sorting");
        if (sorting === null) {
            sorting = "default";
        }
    }
    updateHoverText();
}

function registerClickHandler() {
    $('.colProperty span').click(function () {
        switch (sorting) {
            case "default":
                sorting = "alphabetic";
                // history.replaceState(null, null, "index.html?ds=" + DSUID + "&path=" + DSPath + "&sorting=" + sorting);

                break;
            case "alphabetic":
                sorting = "mandatoryFirst";
                // history.replaceState(null, null, "index.html?ds=" + DSUID + "&path=" + DSPath + "&sorting=" + sorting);
                break;
            case "mandatoryFirst":
                sorting = "default";
                // history.replaceState(null, null, "index.html?ds=" + DSUID + "&path=" + DSPath);
                break;
        }
        localStorage.setItem("sorting", sorting);
        updateHoverText();
        setTypeTable();
    });
}

function updateHoverText() {
    switch (sorting) {
        case "alphabetic":
            $('.colProperty span').attr('title', 'Sorted by alphabetic order');
            break;
        case "mandatoryFirst":
            $('.colProperty span').attr('title', 'Sorted by mandatory/optional, then alphabetic order');
            break;
        case "default":
            $('.colProperty span').attr('title', 'Sorted by order in Domain Specification');
            break;
    }
}

//this callback is loaded after the sdo version is loaded for the library
function afterLoading() {
    //rendering based on provided data
    try {
        var DSNodeResult = getDSNodeForPath(domainSpecification, DSPath);
    } catch (e) {
        //Invalid PATH, show root
        //window.location.search = "ds=" + DSUID;
        window.location.search = "/" + DSUID;
    }
    DSNode = DSNodeResult.DSNode;
    // console.log(JSON.stringify(DSNodeResult, null, 2));
    //"dsv:RestrictedClass", "dsv:RestrictedEnumeration", "dsv:DomainSpecification", or "error"
    switch (DSNodeResult.type) {
        case "dsv:RestrictedClass":
            setTitle(DSNode['schema:name']);
            setPath(DSPath);
            setDescription(sdoLibrary.get_class(DSNode['schema:name']).description);
            setTypeTable();
            break;
        case "dsv:RestrictedEnumeration":
            setTitle(DSNode['schema:name']);
            setPath(DSPath);
            setDescription(sdoLibrary.get_enumeration(DSNode['schema:name']).description);
            setEnumerationTable();
            break;
        case "dsv:DomainSpecification":
            setTitle(DSNode['schema:name']);
            setDSMetaInfo(DSNode);
            setDescription(DSNode['schema:description']);
            setDSTable();
            break;
    }
    showPage();
}

function showDSList(data) {
    // console.log(JSON.stringify(data,null,2));
    $('#table_ds_list').append(createHTMLForDSList(data));
    $('#table_ds_list').show();
    $('#legend').hide();
    showPage();
}

function setTitle(title) {
    $('#title').text(title);
}

function setDescription(description) {
    if (description !== undefined) {
        $('#description').html(repairLinksInHTMLCode(description));
    }
}

function setPath(path) {
    var pathSteps = path.split('/');
    var pathText = ""; //html code to append in the view
    var actPath = ""; //actual path for each iteration (url)
    for (var i = 0; i < pathSteps.length; i++) {
        if (pathSteps[i].charAt(0).toUpperCase() === pathSteps[i].charAt(0)) {
            var newUrl;
            if (i === 0) {
                //newUrl = location.href.replace("path=" + path, "path=" + pathSteps[i]);
                newUrl = location.href.replace("/" + path, "/" + pathSteps[i]);
            } else {
                //newUrl = location.href.replace("path=" + path, "path=" + actPath + "/" + pathSteps[i]);
                newUrl = location.href.replace("/" + path, "/" + actPath + "/" + pathSteps[i]);
            }
            pathText = pathText.concat("<a href='" + newUrl + "'>" + pathSteps[i] + "</a>");
        } else {
            if (i === pathSteps.length - 1) {
                //last part of path is a property, skip to show containing class
                break;
            } else {
                pathText = pathText.concat(pathSteps[i]);
            }
        }
        if (i === 0) {
            actPath = actPath.concat(pathSteps[i]);
        } else {
            actPath = actPath.concat("/" + pathSteps[i]);
        }
        if (i < pathSteps.length - 2 || pathSteps[i].charAt(0).toUpperCase() !== pathSteps[i].charAt(0)) {
            pathText = pathText.concat(" > ");
        }
    }
    $('#path').html(pathText);
}

function setDSMetaInfo(DS) {
    $("#ds_author").text(DS["schema:author"]);
    $("#ds_version").text(DS["schema:version"]);
    $("#ds_sdo_version").text(DS["schema:schemaVersion"]);
    $("#dsInfo").show();
}

function setTypeTable() {
    var properties = DSNode["dsv:property"].slice(0);
    //delete removable fist
    $('.removable').remove();
    //SORTING
    properties = sortProperties(properties);
    for (var i = 0; i < properties.length; i++) {
        $("#table_type").append(createHTMLForProperty(properties[i]));
    }
    $("#table_type").show();
}

function sortProperties(properties) {
    switch (sorting) {
        case "default":
            return properties;
        case "alphabetic":
            return sortByKeyAsc(properties, "schema:name");
        case "mandatoryFirst":
            var arrOpt = [];
            var arrMand = [];
            for (var i = 0; i < properties.length; i++) {
                if (properties[i]["dsv:isOptional"] === true) {
                    arrOpt.push(properties[i]);
                } else {
                    arrMand.push(properties[i]);
                }
            }
            arrMand = sortByKeyAsc(arrMand, "schema:name");
            arrOpt = sortByKeyAsc(arrOpt, "schema:name");
            Array.prototype.push.apply(arrMand, arrOpt);
            return arrMand;
    }
}

function sortByKeyAsc(array, key) {
    return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function setEnumerationTable() {
    var enumerationMembers = DSNode["dsv:expectedEnumerationValue"];
    for (var i = 0; i < enumerationMembers.length; i++) {
        $("#table_enumeration").append(createHTMLForEnumerationMember(enumerationMembers[i]));
    }
    $("#table_enumeration").show();
}

function setDSTable() {
    var types = DSNode["dsv:class"];
    for (var i = 0; i < types.length; i++) {
        $("#table_ds").append(createHTMLForDSType(types[i]));
    }
    $("#table_ds").show();
}


function showPage() {
    $("#page-wrapper").fadeIn("fast");
}
