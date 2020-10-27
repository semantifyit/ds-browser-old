// Functions regarding the details-page showing the content of a DS depending on the given hash id of the DS and the path within the DS structure
// Route: /*HASH*/*PATH*
/* global globUI, glob, SDOAdapter, setActualVisibility, getVocabURLForDS, getSDOAdapter, createAdapterMemoryItem, registerVocabReady, readParams, readUrlParts, constructURL, getDSNodeForPath, rangeToString, repairLinksInHTMLCode, sortByKeyAsc, prettyPrintURI, makeURLFromIRI, dataTypeMapperFromSHACL */

async function init_detail() {
    if (!glob.dsUsed) {
        // No DS with the given hash ID
        document.title = "Schema Tourism";
        globUI.$title.text("No Domain Specification with the given hash-code");
        globUI.$description.html("Return to the <a href='" + glob.domain + "'>List of Domain Specifications</a>.");
        setActualVisibility(glob.VIS_NO_DS);
        globUI.$loadingContainer.hide();
        globUI.$contentContainer.show();
    } else {
        // Show details for the DS
        initSorting();
        document.title = "Schema Tourism - " + glob.dsUsed["content"]["@graph"][0]["schema:name"];
        let newSDOAdapter = new SDOAdapter();
        let vocabsArray = await getVocabURLForDS(glob.dsUsed["content"], newSDOAdapter);
        let usedSDOAdapter = getSDOAdapter(vocabsArray);
        if (usedSDOAdapter === null) {
            // There is no adapter for that vocabulary-combination yet, create one
            createAdapterMemoryItem(vocabsArray, newSDOAdapter);
            glob.mySDOAdapter = newSDOAdapter;
            newSDOAdapter.addVocabularies(vocabsArray).then(function() {
                registerVocabReady(vocabsArray);
                renderDsDetail();
            });
        } else {
            if (usedSDOAdapter.initialized === false) {
                // Other parallel process has already started the creation of this sdoAdapter, wait until it finishes
                setTimeout(function() {
                    glob.mySDOAdapter = usedSDOAdapter.sdoAdapter;
                    renderDsDetail();
                }, 1000);
            } else {
                // Use the already created adapter for this vocabulary-combination
                glob.mySDOAdapter = usedSDOAdapter.sdoAdapter;
                renderDsDetail();
            }
        }
    }
}

// Get and set sorting options depending on the URL parameters and the local storage variables
function initSorting() {
    let URLSorting = readParams().sorting;
    if (URLSorting === "alphabetic" || URLSorting === "mandatoryFirst") {
        glob.sortingOption = URLSorting;
        localStorage.setItem("sorting", glob.sortingOption);
    } else {
        glob.sortingOption = localStorage.getItem("sorting");
        if (glob.sortingOption === null) {
            glob.sortingOption = "default";
        }
    }
    sortingHoverText();
}

// Update the hover title text of the first column (sorting option)
function sortingHoverText() {
    switch (glob.sortingOption) {
        case "alphabetic":
            globUI.$propertiesColumnHeader.attr('title', 'Sorted by alphabetic order');
            break;
        case "mandatoryFirst":
            globUI.$propertiesColumnHeader.attr('title', 'Sorted by mandatory/optional, then alphabetic order');
            break;
        case "default":
            globUI.$propertiesColumnHeader.attr('title', 'Sorted by order in Domain Specification');
            break;
    }
}

// Set a click-handler for the first column (sorting option) to change the sorting
function sortingClickHandler() {
    globUI.$propertiesColumnHeader.on("click", function() {
        switch (glob.sortingOption) {
            case "default":
                glob.sortingOption = "alphabetic";
                break;
            case "alphabetic":
                glob.sortingOption = "mandatoryFirst";
                break;
            case "mandatoryFirst":
                glob.sortingOption = "default";
                break;
        }
        let urlParts = readUrlParts();
        let path = urlParts.DsHash;
        if (urlParts.DsPath) {
            path += "/" + urlParts.DsPath;
        }
        history.replaceState(null, null, constructURL(path));
        localStorage.setItem("sorting", glob.sortingOption);
        sortingHoverText();
        setPropertiesTable();
    });
}

// This callback is loaded after the sdo version is loaded for the library
function renderDsDetail() {
    // Rendering based on provided data
    let DSNodeResult;
    try {
        DSNodeResult = getDSNodeForPath();
    } catch (e) {
        console.log(e);
        // Invalid PATH, show root
        window.location.href = glob.domain + glob.dsUsed.hash;
    }
    glob.dsNode = DSNodeResult.DSNode;
    let className;
    if (glob.dsNode['sh:class'] !== undefined) {
        className = rangeToString(glob.dsNode['sh:class']);
    } else {
        className = rangeToString(glob.dsNode['sh:targetClass']);
    }
    // "Class", "Enumeration", or "error"
    switch (DSNodeResult.type) {
        case "Class":
            globUI.$title.text(className);
            setPath(glob.dsPath);
            if (className.indexOf("+") === -1) {
                try {
                    setDescription(glob.mySDOAdapter.getClass(className).getDescription());
                } catch (e) {
                    // No item/description found
                    setDescription("");
                }
            } else {
                setDescription(""); // Is MTE, which description to choose?
            }
            setPropertiesTable();
            setActualVisibility(glob.VIS_PROPERTY_TABLE);
            globUI.$propertiesTable.show();
            globUI.$enumerationTable.hide();
            break;
        case "Enumeration":
            globUI.$title.text(className);
            setPath(glob.dsPath);
            if (className.indexOf("+") === -1) {
                try {
                    setDescription(glob.mySDOAdapter.getEnumeration(className).getDescription());
                } catch (e) {
                    // No item/description found
                    setDescription("");
                }
            } else {
                setDescription(""); // Is MTE, which description to choose?
            }
            setActualVisibility(glob.VIS_ENUMERATION_TABLE);
            // Show table only if members are defined
            if (glob.dsNode && glob.dsNode["sh:in"]) {
                setEnumerationTable();
                globUI.$enumerationTable.show();
            } else {
                globUI.$enumerationTable.hide();
            }
            break;
    }
    globUI.$loadingContainer.hide();
    globUI.$contentContainer.show();
}

function setDescription(description) {
    if (description !== undefined) {
        globUI.$description.html(repairLinksInHTMLCode(description));
    } else {
        globUI.$description.html("");
    }
}

function setPath(path) {
    if (path === undefined) {
        globUI.$path.html("");
        return;
    }
    let pathSteps = path.split('/');
    let actPath = ""; // Actual path for each iteration (url)
    // Insert the root class in path
    let rootClassText = rangeToString(glob.dsUsed["content"]["@graph"][0]["sh:targetClass"]);
    let pathText = "<a href='javascript:nav(\"" + glob.dsUsed.hash + "\")'>" + rootClassText + "</a> > "; // Html code to append in the view
    for (let i = 0; i < pathSteps.length; i++) {
        pathSteps[i] = rangeToString(pathSteps[i]);
        if (pathSteps[i].charAt(0).toUpperCase() === pathSteps[i].charAt(0)) {
            let newUrl;
            if (i === 0) {
                newUrl = glob.dsUsed.hash + "/" + pathSteps[i];
            } else {
                newUrl = glob.dsUsed.hash + "/" + actPath + "/" + pathSteps[i];
            }
            pathText = pathText.concat("<a href='javascript:nav(\"" + newUrl + "\")'>" + pathSteps[i] + "</a>");
        } else {
            if (i === pathSteps.length - 1) {
                // Last part of path is a property, skip to show containing class
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
    globUI.$path.html(pathText);
}

function setPropertiesTable() {
    let properties;
    if (glob.dsNode["sh:targetClass"] !== undefined) {
        // Root node
        properties = glob.dsNode["sh:property"].slice(0);
    } else {
        // Nested node
        properties = glob.dsNode["sh:node"]["sh:property"].slice(0);
    }
    // Delete removable fist
    $('.removable').remove();
    // SORTING
    properties = sortProperties(properties);
    globUI.$propertiesTableContent.html(""); // Clear content first
    for (let i = 0; i < properties.length; i++) {
        globUI.$propertiesTableContent.append(genHTML_Property(properties[i]));
    }
}

// Sort the ordering of properties for the table
function sortProperties(properties) {
    let arrOpt = [];
    let arrMand = [];
    switch (glob.sortingOption) {
        case "default":
            return properties;
        case "alphabetic":
            return sortByKeyAsc(properties, "sh:path");
        case "mandatoryFirst":
            arrOpt = properties.filter(p => p["sh:minCount"] === 0 || !p["sh:minCount"]);
            arrMand = properties.filter(p => p["sh:minCount"] && p["sh:minCount"] !== 0);
            arrMand = sortByKeyAsc(arrMand, "sh:path");
            arrOpt = sortByKeyAsc(arrOpt, "sh:path");
            Array.prototype.push.apply(arrMand, arrOpt);
            return arrMand;
    }
}

function setEnumerationTable() {
    let enumerationMembers = glob.dsNode["sh:in"];
    globUI.$enumerationTableContent.html(""); // Clear content first
    for (let i = 0; i < enumerationMembers.length; i++) {
        globUI.$enumerationTableContent.append(genHTML_EnumerationMember(enumerationMembers[i]));
    }
}

function genHTML_Property(dsPropertyNode) {
    let name = prettyPrintURI(dsPropertyNode['sh:path']);
    let isOptional = "";
    let description = "";
    let dsDescription = "";
    try {
        description = glob.mySDOAdapter.getProperty(name).getDescription();
    } catch (e) {
        // No item/description found
    }
    if (dsPropertyNode['rdfs:comment'] !== undefined) {
        dsDescription = dsPropertyNode['rdfs:comment'];
    }
    let descText = "";
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
    let expectedTypes = genHTML_ExpectedTypes(name, dsPropertyNode["sh:or"]);
    let cardinalityCode = genHTML_Cardinality(dsPropertyNode);
    let code = "<tr class='removable'>";
    // Property
    code = code.concat("<th class=\"prop-nam\"><code property=\"rdfs:label\">" + repairLinksInHTMLCode('<a href="' + makeURLFromIRI(dsPropertyNode['sh:path']) + '">' + name + '</a>') + "</code>" + isOptional + "</th>");
    // Expected type
    code = code.concat("<td class=\"prop-ect\"  style='text-align: center; vertical-align: middle;'>" + expectedTypes + "</td>");
    // Description
    code = code.concat("<td class=\"prop-desc\">" + repairLinksInHTMLCode(descText) + "</td>");
    // Cardinality
    code = code.concat("<td class=\"prop-ect\" style='text-align: center; vertical-align: middle;'>" + cardinalityCode + "</td>");
    return code;
}

function genHTML_Cardinality(dsPropertyNode) {
    if (dsPropertyNode["sh:minCount"] !== undefined && dsPropertyNode["sh:minCount"] !== 0) {
        if (dsPropertyNode["sh:maxCount"] !== undefined && dsPropertyNode["sh:maxCount"] !== 0) {
            if (dsPropertyNode["sh:minCount"] !== dsPropertyNode["sh:maxCount"]) {
                return "<span title='This property is required. It must have between " + dsPropertyNode["sh:minCount"] + " and " + dsPropertyNode["sh:maxCount"] + " value(s).'>" + dsPropertyNode["sh:minCount"] + ".." + dsPropertyNode["sh:maxCount"] + "</span>";
            } else {
                return "<span title='This property is required. It must have " + dsPropertyNode["sh:minCount"] + " value(s).'>" + dsPropertyNode["sh:minCount"] + "</span>";
            }
        } else {
            return "<span title='This property is required. It must have at least " + dsPropertyNode["sh:minCount"] + " value(s).'>" + dsPropertyNode["sh:minCount"] + "..N</span>";
        }
    } else {
        if (dsPropertyNode["sh:maxCount"] !== undefined && dsPropertyNode["sh:maxCount"] !== 0) {
            return "<span title='This property is optional. It must have at most " + dsPropertyNode["sh:maxCount"] + " value(s).'>0.." + dsPropertyNode["sh:maxCount"] + "</span>";
        } else {
            return "<span title='This property is optional. It may have any amount of values.'>0..N</span>";
        }
    }
}

function genHTML_EnumerationMember(dsEnumerationNode) {
    let URI = dsEnumerationNode["@id"];
    let description = "";
    try {
        description = glob.mySDOAdapter.getEnumerationMember(URI).getDescription();
    } catch (e) {
        // No item/description found
    }
    let code = "<tr>";
    // Property
    code = code.concat("<th class=\"prop-nam\"><code property=\"rdfs:label\">" + repairLinksInHTMLCode('<a href="' + getAbsoluteURI(URI) + '">' + prettyPrintURI(URI) + '</a>') + "</code></th>");
    // Description
    code = code.concat("<td class=\"prop-desc\">" + repairLinksInHTMLCode(description) + "</td>");
    return code;
}

// Uses the DS context to transform a prefixed uri into an absolute URI
function getAbsoluteURI(URI) {
    let vocabs = glob.dsUsed.content["@context"];
    let vocabKeys = Object.keys(vocabs);
    for (let i = 0; i < vocabKeys.length; i++) {
        if (vocabKeys[i] === URI.substring(0, URI.indexOf(":"))) {
            return vocabs[vocabKeys[i]] + URI.substring(URI.indexOf(":") + 1);
        }
    }
    return URI;
}

function genHTML_ExpectedTypes(propertyName, expectedTypes) {
    let code = "";
    for (let i = 0; i < expectedTypes.length; i++) {
        let name;
        if (expectedTypes[i]["sh:datatype"]) {
            name = expectedTypes[i]['sh:datatype'];
        } else if (expectedTypes[i]["sh:class"]) {
            name = expectedTypes[i]['sh:class'];
        }
        if (dataTypeMapperFromSHACL(name) !== null) {
            code = code.concat(repairLinksInHTMLCode('<a href="/' + dataTypeMapperFromSHACL(name) + '">' + dataTypeMapperFromSHACL(name) + '</a><br>'));
        } else {
            name = rangeToString(name);
            let newUrl = glob.dsUsed.hash + "/";
            if (glob.dsPath === undefined) {
                newUrl = newUrl.concat(propertyName + "/" + name);
            } else {
                newUrl = newUrl.concat(glob.dsPath + "/" + propertyName + "/" + name);
            }
            code = code.concat("<a href='javascript:nav(\"" + newUrl + "\")'>" + name + "</a><br>");
        }
    }
    return code;
}
