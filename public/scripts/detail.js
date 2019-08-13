//Functions regarding the details-page showing the content of a DS depending on the given hash id of the DS and the path within the DS structure
//  route: /*HASHID*/*PATH*

var sorting;

let mySDOAdapter;

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

        let vocabsArray = getVocabURLForIRIs(analyzeDSVocabularies(domainSpecification["content"]));
        let usedSDOAdapter = getSDOAdapter(vocabsArray);
        if (usedSDOAdapter === null) {
            //there is no adapter for that vocabulary-combination yet, create one
            let newSDOAdapter = new sdoAdapter();
            createAdapterMemoryItem(vocabsArray, newSDOAdapter);
            mySDOAdapter = newSDOAdapter;
            newSDOAdapter.addVocabularies(vocabsArray, function () {
                registerVocabReady(vocabsArray);
                renderDsDetail();
            }.bind(null, vocabsArray));
        } else {
            if (usedSDOAdapter.initialized === false) {
                //other parallel process has already started the creation of this sdoAdapter, wait until it finishes
                setTimeout(function () {
                    mySDOAdapter = usedSDOAdapter.sdoAdapter;
                    renderDsDetail();
                }, 1500);
            } else {
                //use the already created adapter for this vocabulary-combination
                mySDOAdapter = usedSDOAdapter.sdoAdapter;
                renderDsDetail();
            }
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
        className = rangeToString(DSNode['sh:class']);
    } else {
        className = rangeToString(DSNode['sh:targetClass']);
    }
    //"Class", "Enumeration", or "error"
    switch (DSNodeResult.type) {
        case "Class":
            setTitle(className);
            setPath(DSPath);
            if (className.indexOf("+") === -1) {
                try {
                    setDescription(mySDOAdapter.getClass(className).getDescription());
                } catch (e) {
                    //no item/description found
                    setDescription("");
                }
            } else {
                setDescription(""); //is MTE, which description to choose?
            }
            setTypeTable();
            break;
        case "Enumeration":
            setTitle(className);
            setPath(DSPath);
            if (className.indexOf("+") === -1) {
                try {
                    setDescription(mySDOAdapter.getEnumeration(className).getDescription());
                } catch (e) {
                    //no item/description found
                    setDescription("");
                }
            } else {
                setDescription(""); //is MTE, which description to choose?
            }
            setEnumerationTable();
            break;
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
    if (path === undefined) {
        $('#path').html("");
        return;
    }
    var pathSteps = path.split('/');
    var pathText = ""; //html code to append in the view
    var actPath = ""; //actual path for each iteration (url)

    //insert the root class in path
    let rootClassText = rangeToString(domainSpecification["content"]["@graph"][0]["sh:targetClass"]);
    let rootUrl = location.href.replace("/" + path, "");
    pathText = "<a href='" + rootUrl + "'>" + rootClassText + "</a> > ";

    for (var i = 0; i < pathSteps.length; i++) {
        pathSteps[i] = rangeToString(pathSteps[i]);
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
    if (DSNode["sh:targetClass"] !== undefined) {
        //root node
        properties = DSNode["sh:property"].slice(0);
    } else {
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
            return sortByKeyAsc(properties, "sh:path");
        case "mandatoryFirst":
            var arrOpt = [];
            var arrMand = [];
            for (var i = 0; i < properties.length; i++) {
                if (properties[i]["sh:minCount"] === 0 || properties[i]["sh:minCount"] === undefined) {
                    arrOpt.push(properties[i]);
                } else {
                    arrMand.push(properties[i]);
                }
            }
            arrMand = sortByKeyAsc(arrMand, "sh:path");
            arrOpt = sortByKeyAsc(arrOpt, "sh:path");
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
    var name = prettyPrintURI(dsPropertyNode['sh:path']);
    var isOptional = "";
    if (!dsPropertyNode['sh:minCount'] > 0) {
        // isOptional = " (optional)"; //commented out, info is now in cardinality
    }
    var description = "";
    var dsDescription = "";
    try {
        description = mySDOAdapter.getProperty(name).getDescription();
    } catch (e) {
        //no item/description found
    }
    if (dsPropertyNode['rdfs:comment'] !== undefined) {
        dsDescription = dsPropertyNode['rdfs:comment'];
    }
    var descText = "";
    if (description !== "") {
        if (dsDescription !== "") {
            descText = descText.concat("<b>From Vocabulary:</b> ");
        }
        descText = descText.concat(description);
    }
    if (dsDescription !== "") {
        if (description !== "") {
            descText = descText.concat("<br>");
            descText = descText.concat("<b>From Domain Specification:</b> ");
        }
        descText = descText.concat(dsDescription);
    }
    var expectedTypes = genHTML_ExpectedTypes(name, dsPropertyNode["sh:or"]["@list"]);
    var cardinalityCode = genHTML_Cardinality(dsPropertyNode);
    var code = "<tr class='removable'>";
    //property
    code = code.concat("<th class=\"prop-nam\"><code property=\"rdfs:label\">" + repairLinksInHTMLCode('<a href="' + makeURLFromIRI(dsPropertyNode['sh:path']) + '">' + name + '</a>') + "</code>" + isOptional + "</th>");
    //cardinality
    code = code.concat("<td class=\"prop-ect\" style='text-align: center; vertical-align: middle;'>" + cardinalityCode + "</td>");
    //expected type
    code = code.concat("<td class=\"prop-ect\"  style='text-align: center; vertical-align: middle;'>" + expectedTypes + "</td>");
    //description
    code = code.concat("<td class=\"prop-desc\">" + repairLinksInHTMLCode(descText) + "</td>");
    return code;
}

function genHTML_Cardinality(dsPropertyNode) {
    if (dsPropertyNode["sh:minCount"] !== undefined && dsPropertyNode["sh:minCount"] !== 0) {
        if (dsPropertyNode["sh:maxCount"] !== undefined && dsPropertyNode["sh:maxCount"] !== 0) {
            if (dsPropertyNode["sh:maxCount"] !== dsPropertyNode["sh:maxCount"]) {
                return "<span title='This property is required. It must have between " + dsPropertyNode["sh:minCount"] + " and " + dsPropertyNode["sh:maxCount"] + " value(s).'>" + dsPropertyNode["sh:minCount"] + " to " + dsPropertyNode["sh:maxCount"] + "</span>"
            } else {
                return "<span title='This property is required. It must have " + dsPropertyNode["sh:minCount"] + " value(s).'>" + dsPropertyNode["sh:minCount"] + "</span>"
            }
        } else {
            return "<span title='This property is required. It must have at least " + dsPropertyNode["sh:minCount"] + " value(s).'>min. " + dsPropertyNode["sh:minCount"] + "</span>"
        }
    } else {
        if (dsPropertyNode["sh:maxCount"] !== undefined && dsPropertyNode["sh:maxCount"] !== 0) {
            return "<span title='This property is optional. It must have at most " + dsPropertyNode["sh:maxCount"] + " value(s).'>max. " + dsPropertyNode["sh:maxCount"] + "</span>"
        } else {
            return "<span title='This property is optional. It may have any amount of values.'>any amount</span>"
        }
    }
}

function genHTML_EnumerationMember(dsEnumrationNode) {
    var name = prettyPrintURI(dsEnumrationNode);
    var description = "";
    try {
        description = mySDOAdapter.getEnumerationMember(name).getDescription();
    } catch (e) {
        //no item/description found
    }
    var code = "<tr>";
    //property
    code = code.concat("<th class=\"prop-nam\"><code property=\"rdfs:label\">" + repairLinksInHTMLCode('<a href="/' + name + '">' + name + '</a>') + "</code></th>");
    //description
    code = code.concat("<td class=\"prop-desc\">" + repairLinksInHTMLCode(description) + "</td>");
    return code;
}

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
            name = rangeToString(name);
            var newUrl = glob.rootUrl + DSUID + "/";
            if (DSPath === undefined) {
                newUrl = newUrl.concat(propertyName + "/" + name);
            } else {
                newUrl = newUrl.concat(DSPath + "/" + propertyName + "/" + name);
            }
            code = code.concat("<a href='" + newUrl + "'>" + name + "</a><br>");
        }
    }
    return code;
}