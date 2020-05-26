
//TODO FIND HOME
insertVisibilityOptionsBeforeElement($('#jstreeDSContent-' + oneDS._id + '-outer'), oneDS, "tree", scrollTop, false);




function insertVisibilityOptionsBeforeElement($element, oneDS, type, scrollTop, showAll) {
    let code = "";
    code = code.concat('<div class="col-md-12 infoDS">')
    code = code.concat(renderNavigationOptions(oneDS, type, scrollTop, showAll))
    code = code.concat('</div>');
    $element.before(code);
    $('#myBtn')
}



function changeVisibilityOfTree(data, showAll, oneDSId) {
    if (showAll) {
        mapDomainSpecificationToJsTreeJson(data.content, true, function (ndata) {
            $('#jstreeDSContent-' + oneDSId).jstree(true).settings.core.data = ndata;
            $('#jstreeDSContent-' + oneDSId).jstree(true).refresh();
        })
    } else {
        mapDomainSpecificationToJsTreeJson(data.content, false, function (ndata) {
            $('#jstreeDSContent-' + oneDSId).jstree(true).settings.core.data = ndata;
            $('#jstreeDSContent-' + oneDSId).jstree(true).refresh();
        })
    }
}



function changePropertyVisibility(showAll, oneDSId, type, hash, scrollTop) {
    //TODO change to con_getDomainSpecificationByHash
    con_getDomainSpecification(oneDSId, function (data) {
        let visibility = "mandatory";
        if (showAll) visibility = "optional";
        let cnt = $('#' + type + '-' + oneDSId + '-' + visibility).contents();
        $('#' + type + '-' + oneDSId + '-' + visibility).replaceWith(cnt);
        let oppositeShowAll = !showAll;
        if (visibility === "mandatory") visibility = "optional";
        else visibility = "mandatory";
        let button = '<div id="' + type + '-' + oneDSId + '-' + visibility + '" class="btnDS treeInfoBtn" onclick="changePropertyVisibility(' + oppositeShowAll + ' ,\'' + oneDSId + '\',\'' + type + '\',\'' + hash + '\',' + scrollTop + ')"></div>';
        let innerElement = $('#' + type + '-' + oneDSId + '-' + visibility + '-inner')
        innerElement.wrap(button);
        let target = $('#' + oneDSId);
        if (type === "tree") {
            changeVisibilityOfTree(data, showAll, oneDSId);
            target = $('#treeViewForDS-' + oneDSId);
        } else if (type === "table") {
            let $tableViewDS = $('#tableViewForDS-' + oneDSId);
            $tableViewDS.html("");
            target = $tableViewDS;
            triggerTableViewVisibility($tableViewDS, data, scrollTop, showAll);
        } else {
            let src = "";
            if (development) {
                src = 'http://localhost:8000/?hash=' + hash + '&showAll=' + showAll
            } else {
                src = '/domainspecifications/lib/deploy/index.html?hash=' + hash + '&showAll=' + showAll
            }
            $('#iframeGraphical').attr('src', src);
            target = $('#ds-' + oneDSId + '-graphicalContent');
        }
        if (scrollTop) {
            setTimeout(function () {
                $('html, body').animate({
                    scrollTop: $(target).offset().top
                }, 200)
            }, 50)
        }

    });
}

function renderNavigationOptions(oneDS, type, scrollTop, showAll) {
    let code = "";
    code = code.concat('<table class="treeInfoButtons">');
    code = code.concat('<tr>');
    code = code.concat('<td>');
    code = code.concat('<span style="text-align: left"> Show: ');
    code = code.concat('</span>');
    code = code.concat('</td>');
    code = code.concat('<td>');
    if (!showAll) code = code.concat('<div id="' + type + '-' + oneDS._id + '-optional" class="btnDS treeInfoBtn" onclick="changePropertyVisibility(true ,\'' + oneDS._id + '\',\'' + type + '\',\'' + oneDS.hash + '\',' + scrollTop + ')">');
    code = code.concat('<div id="' + type + '-' + oneDS._id + '-optional-inner"><img  src="" class="glyphicon glyphicon-tag optional-property"> optional</div>');
    if (!showAll) code = code.concat('</div>');
    code = code.concat('</td>');
    code = code.concat('<td>');
    if (showAll) code = code.concat('<div id="' + type + '-' + oneDS._id + '-mandatory" class="btnDS treeInfoBtn" onclick="changePropertyVisibility(false ,\'' + oneDS._id + '\',\'' + type + '\',\'' + oneDS.hash + '\',' + scrollTop + ')">');
    code = code.concat('<div id="' + type + '-' + oneDS._id + '-mandatory-inner" ><img src=""  class="glyphicon glyphicon-tag mandatory-property"> mandatory</div>');
    if (showAll) code = code.concat('</div>');
    code = code.concat('</td>');
    code = code.concat('</tr>');
    code = code.concat('</table>');
    code = code.concat('<div class="helpBtn"><p><a id="shareDS-' + oneDS._id + '" class="btn button-sti-red btn-fab btn-fab-mini my-fab-info text-right" href="" onclick="triggerHelp(\'' + oneDS._id + '\',\'' + type + '\');return false;" title="Show help for ' + type + '"><i class="material-icons my-fab-icon iconSmall">help</i></a><span title="' + "Show help for" + type + '"></span></p></div>');
    code = code.concat('<div id="modal-public-ds" class="modal-public-ds-class">');
    code = code.concat('<div class="modal-content-public-ds">');
    code = code.concat('<div class="modal-header-public-ds sti-red">')
    code = code.concat('<span class="close">&times;</span>');
    code = code.concat('<h4>Modal Header</h4>');
    code = code.concat('</div>')
    code = code.concat('<div class="modal-body-public-ds">');
    code = code.concat('<p>Some text in the Modal Body</p>');
    code = code.concat('<p>Some other text...</p>');
    code = code.concat('</div>');
    code = code.concat('<div class="modal-footer-public-ds sti-red">');
    // code = code.concat('<h3>Modal Footer</h3>');
    code = code.concat('</div>');
    code = code.concat('</div>');
    code = code.concat('</div>');
    return code;
}

function initiateJSTreeToDisplayDSContent(oneDS, showOptional) {
    mapDomainSpecificationToJsTreeJson(oneDS.content, showOptional, function (data) {
        $('#jstreeDSContent-' + oneDS._id)
            .jstree({
                plugins: ["search", "grid"],
                core: {
                    "themes": {
                        "icons": true,
                        "dots": true,
                        "responsive": true,
                        "stripes": true,
                        rootVisible: false,
                    },
                    "data": data
                },
                grid: {
                    columns: [
                        {"width": "20%", header: "Class / Property"},
                        // { header: "Class / Property"},

                        {
                            header: "Range / Type", value: function (node) {
                                return (node.data.dsRange);
                            }
                        },
                        {
                            width: "80%", header: "Description", value: function (node) {
                                return (node.data.dsDescription);
                            }
                        }
                    ],
                }
            })
            .bind("select_node.jstree", function (event, data) {
                showPropertyDescription(data);
            })
    })
}



// Preprocessing for Tree View Library
function mapDomainSpecificationToJsTreeJson(domainSpecification, showOptional, callback) {
    let vocabsArray = getVocabURLForDS(domainSpecification);
    let usedSDOAdapter = getSDOAdapter(vocabsArray);
    if (usedSDOAdapter === null) {
        //there is no adapter for that vocabulary-combination yet, create one
        let newSDOAdapter = new SDOAdapter();
        createAdapterMemoryItem(vocabsArray, newSDOAdapter);
        newSDOAdapter.addVocabularies(vocabsArray).then(function () {
            registerVocabReady(vocabsArray);
            let dsClass = generateDsClass(newSDOAdapter, domainSpecification["@graph"][0], false, showOptional);
            callback([dsClass]);
        });
    } else {
        if (usedSDOAdapter.initialized === false) {
            //other parallel process has already started the creation of this sdoAdapter, wait until it finishes
            setTimeout(function () {
                mapDomainSpecificationToJsTreeJson(domainSpecification, showOptional, callback)
            }, 500);
        } else {
            //use the already created adapter for this vocabulary-combination
            let dsClass = generateDsClass(usedSDOAdapter.sdoAdapter, domainSpecification["@graph"][0], false, showOptional);
            callback([dsClass]);
        }
    }
}

function generateDsClass(usedSDOAdapter, dsvClass, closed, showOptional) {
    let dsClass = {};
    if (dsvClass["sh:targetClass"]) {
        dsClass.text = prettyPrintClassDefinition(dsvClass["sh:targetClass"]);
    } else {
        dsClass.text = prettyPrintClassDefinition(dsvClass["sh:class"]);
    }

    dsClass.icon = "glyphicon glyphicon-list-alt";
    if (!closed) dsClass.state = {'opened': true};
    let description;
    try {
        if (dsClass.text.indexOf(",") === -1) {
            description = usedSDOAdapter.getClass(dsClass.text).getDescription();
        } else {
            description = "No description found."
        }
    } catch (e) {
        description = "No description found."
    }
    dsClass.data = {};
    if (dsvClass['rdfs:comment']) dsClass.justification = dsvClass['rdfs:comment']; //was dsv:justification
    dsClass.children = [];
    dsClass.data.dsDescription = description;
    let dsvProperties;
    if (dsvClass["sh:property"]) {
        dsvProperties = dsvClass["sh:property"];
    } else if (dsvClass["sh:node"] && dsvClass["sh:node"]["sh:property"]) {
        dsvProperties = dsvClass["sh:node"]["sh:property"];
    }
    if (dsvProperties !== undefined) {
        for (let i = 0; i < dsvProperties.length; i++) {
            let dsProperty = generateDsProperty(usedSDOAdapter, dsvProperties[i], showOptional)
            if (dsProperty) dsClass.children.push(dsProperty);
        }
    }

    return dsClass;
}

function prettyPrintClassDefinition(classDefinition) {
    //classDefinition can be a string, or an array of strings (MTE)
    //classDefinition include strings with the vocab indicator in them
    //remove vocab if it is the standard schema:
    //return a human readable string of the classDefinition
    if (Array.isArray(classDefinition)) {
        let string = "";
        for (let i = 0; i < classDefinition.length; i++) {
            string = string.concat(prettyPrintURI(classDefinition[i]));
            if (i + 1 !== classDefinition.length) {
                string = string.concat(", ");
            }
        }
        return string
    } else {
        return prettyPrintURI(classDefinition);
    }
}

function createAdapterMemoryItem(vocabsArray, sdoAdapterInstance) {
    adapterMemory.push({
        "vocabsArray": vocabsArray,
        "sdoAdapter": sdoAdapterInstance,
        "initialized": false
    });
}
function registerVocabReady(vocabsArray) {
    let sdoAdapterItem = getSDOAdapter(vocabsArray);
    if (sdoAdapterItem !== null) {
        sdoAdapterItem.initialized = true;
    }
}
function generateDsProperty(usedSDOAdapter, propertyObj, showOptional) {
    let dsProperty = {};
    let isOptional = false;
    let isOpened = false;
    dsProperty.children = [];
    dsProperty.data = {};
    dsProperty.justification = propertyObj["rdfs:comment"];
    dsProperty.text = prettyPrintURI(propertyObj["sh:path"]);
    if (!propertyObj["sh:minCount"] > 0) {
        isOptional = true;
        dsProperty.icon = "glyphicon glyphicon-tag optional-property";
        dsProperty.data.isOptional = true;
    } else {
        dsProperty.icon = "glyphicon glyphicon-tag mandatory-property";
        dsProperty.data.isOptional = false;
    }
    let dsvExpectedTypes = propertyObj["sh:or"];
    if (dsvExpectedTypes) {
        let dsRange = generateDsRange(dsvExpectedTypes);
        dsProperty.data.dsRange = dsRange.rangeAsString;
        dsProperty.data.rangeJustification = dsRange.rangeJustification;
        let description;
        try {
            description = usedSDOAdapter.getProperty(dsProperty.text).getDescription();
        } catch (e) {
            description = "No description found."
        }
        dsProperty.data.dsDescription = description;
        for (let i = 0; i < dsvExpectedTypes.length; i++) {
            if (dsvExpectedTypes[i]["sh:node"]) { //was dsv:restrictedClass
                isOpened = true;
                dsProperty.children.push(generateDsClass(usedSDOAdapter, dsvExpectedTypes[i], true, showOptional));
            }
        }
    }
    if (isOpened) dsProperty.state = {'opened': true};
    if (showOptional) return dsProperty;
    else if (!isOptional) return dsProperty;
}
function generateDsRange(dsvExpectedTypes) {
    let returnObj = {
        rangeAsString: "",
        rangeJustification: []
    };
    let dsRange = "";
    for (let i = 0; i < dsvExpectedTypes.length; i++) {
        let justification = {};
        let name;
        //datatype
        if (dsvExpectedTypes[i]["sh:datatype"]) {
            name = prettyPrintURI(dataTypeMapperFromSHACL(dsvExpectedTypes[i]["sh:datatype"]));
            dsRange = dsRange.concat(name);
        } else if (dsvExpectedTypes[i]["sh:node"]) {
            //restricted class
            name = prettyPrintClassDefinition(dsvExpectedTypes[i]["sh:class"]);
            dsRange = dsRange.concat('<strong>' + name + '</strong>');
        } else {
            //enumeration
            //standard class
            name = prettyPrintClassDefinition(dsvExpectedTypes[i]["sh:class"]);
            dsRange = dsRange.concat(name);
        }

        justification.name = name;
        justification.justification = dsvExpectedTypes[i]["rdfs:comment"]; //was dsv:justification
        if (i < dsvExpectedTypes.length - 1) {
            dsRange = dsRange.concat(" or ");
        }
        returnObj.rangeJustification.push(justification);
    }
    returnObj.rangeAsString = dsRange;
    return returnObj;
}