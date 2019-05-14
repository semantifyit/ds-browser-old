//Functions regarding the details-page showing the content of a DS depending on the given hash id of the DS and the path within the DS structure
//  route: /*HASHID*/*PATH*

var sorting;

function init_detail(dsData) {
    if (dsData === undefined) {
        //no DS with the given hash ID
        setTitle("No Domain Specification with the given ID");
        $('#description').html("Return to the <a href='" + glob.rootUrl + "'>List of Schemas</a>.");
        showPage();
    } else {
        //show details for the DS
        domainSpecification = dsData;
        initSorting();
        sortingClickHandler();
        if (DSPath === undefined) {
            //redirect to root node
            window.location.href = glob.rootUrl + DSUID + "/" + vocabRemover(domainSpecification["content"]["@graph"][0]["sh:targetClass"]);
        } else {
            SDOVersion = getSDOVersion(domainSpecification["content"]);
            setActualLibrary(SDOVersion);
            renderDsDetail();
        }
    }
}

//get and set sorting options depending on the URL parameters and the local storage variables
function initSorting() {
    var URLSorting = getUrlParameter("sorting");
    if (URLSorting === "alphabetic" || URLSorting === "mandatoryFirst") {
        sorting = URLSorting;
        localStorage.setItem("sorting", sorting);
    } else {
        sorting = localStorage.getItem("sorting");
        if (sorting === null) {
            sorting = "default";
        }
    }
    sortingHoverText();
}

//Update the hover title text of the first column (sorting option)
function sortingHoverText() {
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

//set a clickhandler for the first column (sorting option) to change the sorting
function sortingClickHandler() {
    $('.colProperty span').click(function () {
        var url = "";
        switch (sorting) {
            case "default":
                sorting = "alphabetic";
                url = glob.rootUrl + DSUID + "/" + DSPath + "?sorting=" + sorting;
                break;
            case "alphabetic":
                sorting = "mandatoryFirst";
                url = glob.rootUrl + DSUID + "/" + DSPath + "?sorting=" + sorting;
                break;
            case "mandatoryFirst":
                sorting = "default";
                url = glob.rootUrl + DSUID + "/" + DSPath;
                break;
        }
        history.replaceState(null, null, url);
        localStorage.setItem("sorting", sorting);
        sortingHoverText();
        setTypeTable();
    });
}

//this callback is loaded after the sdo version is loaded for the library
function renderDsDetail() {
    //rendering based on provided data
    try {
        var DSNodeResult = getDSNodeForPath();
    } catch (e) {
        console.log(e);
        //Invalid PATH, show root
        window.location.href = glob.rootUrl + DSUID;
    }
    DSNode = DSNodeResult.DSNode;
    var className;
    if (DSNode['sh:class'] !== undefined) {
        className = vocabRemover(DSNode['sh:class']);
    } else {
        className = vocabRemover(DSNode['sh:targetClass']);
    }
    //"dsv:RestrictedClass", "dsv:RestrictedEnumeration", "dsv:DomainSpecification", or "error"
    switch (DSNodeResult.type) {
        case "Class":
            setTitle(className);
            setPath(DSPath);
            setDescription(actualLibrary.get_class(className).description);
            setTypeTable();
            break;
        case "Enumeration":
            setTitle(className);
            setPath(DSPath);
            setDescription(actualLibrary.get_enumeration(className).description);
            setEnumerationTable();
            break;
        // case "dsv:DomainSpecification":
        //     setTitle(DSNode['schema:name']);
        //     setDSMetaInfo(DSNode);
        //     setDescription(DSNode['schema:description']);
        //     setDSTable();
        //     break;
    }
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

function setTypeTable() {
    var properties;
    if(DSNode["sh:targetClass"] !== undefined){
        //root node
        properties = DSNode["sh:property"].slice(0);
    }else {
        //nested node
        properties = DSNode["sh:node"]["sh:property"].slice(0);
    }
    //delete removable fist
    $('.removable').remove();
    //SORTING
    properties = sortProperties(properties);
    for (var i = 0; i < properties.length; i++) {
        $("#table_type").append(genHTML_Property(properties[i]));
    }
    $("#table_type").show();
}

//sort the ordering of properties for the table
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


function setEnumerationTable() {
    var enumerationMembers = DSNode["sh:in"]["@list"];
    for (var i = 0; i < enumerationMembers.length; i++) {
        $("#table_enumeration").append(genHTML_EnumerationMember(enumerationMembers[i]));
    }
    $("#table_enumeration").show();
}

function genHTML_Property(dsPropertyNode) {
    var name = vocabRemover(dsPropertyNode['sh:path']);
    var isOptional = "";
    if (!dsPropertyNode['sh:minCount'] > 0) {
        isOptional = " (optional)";
    }
    var description = actualLibrary.get_property(name).description;
    var expectedTypes = genHTML_ExpectedTypes(name, dsPropertyNode["sh:or"]["@list"]);
    var code = "<tr class='removable'>";
    //property
    code = code.concat("<th class=\"prop-nam\"><code property=\"rdfs:label\">" + repairLinksInHTMLCode('<a href="/' + name + '">' + name + '</a>') + "</code>" + isOptional + "</th>");
    //expected type
    code = code.concat("<td class=\"prop-ect\">" + expectedTypes + "</td>");
    //description
    code = code.concat("<td class=\"prop-desc\">" + repairLinksInHTMLCode(description) + "</td>");
    return code;
}

function genHTML_EnumerationMember(dsEnumrationNode) {
    var name = vocabRemover(dsEnumrationNode);
    var description = actualLibrary.get_enumerationMember(name).description;
    var code = "<tr>";
    //property
    code = code.concat("<th class=\"prop-nam\"><code property=\"rdfs:label\">" + repairLinksInHTMLCode('<a href="/' + name + '">' + name + '</a>') + "</code></th>");
    //description
    code = code.concat("<td class=\"prop-desc\">" + repairLinksInHTMLCode(description) + "</td>");
    return code;
}

// function createHTMLForDSType(dsNode) {
//     var name = vocabRemover(dsNode['sh:targetClass']);
//     var description = actualLibrary.get_class(name).description;
//     var code = "<tr>";
//     //type
//     var newUrl = location.href.concat("/" + name);
//     var linkCode = "<a href='" + newUrl + "'>" + name + "</a>";
//     code = code.concat("<th class=\"prop-nam\"><code property=\"rdfs:label\">" + linkCode + "</code></th>");
//     //description
//     code = code.concat("<td class=\"prop-desc\">" + repairLinksInHTMLCode(description) + "</td>");
//     return code;
// }

function genHTML_ExpectedTypes(propertyName, expectedTypes) {
    var code = "";
    for (var i = 0; i < expectedTypes.length; i++) {
        var name;
        if (expectedTypes[i]["sh:datatype"]) {
            name = expectedTypes[i]['sh:datatype'];
        } else if (expectedTypes[i]["sh:class"]) {
            name = expectedTypes[i]['sh:class'];
        }
        if (dataTypeMapperFromSHACL(name) !== null) {
            code = code.concat(repairLinksInHTMLCode('<a href="/' + dataTypeMapperFromSHACL(name) + '">' + dataTypeMapperFromSHACL(name) + '</a><br>'));
        } else {
            name = vocabRemover(name);
            var newUrl = glob.rootUrl + DSUID + "/" + DSPath + "/" + propertyName + "/" + name;
            code = code.concat("<a href='" + newUrl + "'>" + name + "</a><br>");
        }
    }
    return code;
}