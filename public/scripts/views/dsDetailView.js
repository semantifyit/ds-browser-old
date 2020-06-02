// wrap inside of block to not have function available globally
(function() {
    // Copied from semantify-core\public\domainspecifications\assets\publicDomainSpecifications.js
    let allDomainSpecifications = {
        sortedBy: "",
        allDs: []
    };
    let dsOrderArrayInitiated = false;
    let loadedSDOVersion;
    let defaultDescription = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </br></br> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    let development = false;

    function initPublicDomainSpecifications() {
        con_getPublicDomainSpecificationsMap(function(data) {
            if (data) {
                var $dsContent = $('#public-domainspecifications-content');
                appendSearchFieldToPublicDomainSpecifications($dsContent);
                renderPublicDomainSpecifications(data);
            } else {
                $('#loadingPublicDomainSpecifciations').fadeOut(500); //hide loading animation of dashboard
                var $errorDiv = $('#publicDS_error_div');
                $errorDiv.text("Error loading DomainSpecifications.");
                $errorDiv.show();
                console.log("Couldn't load domain specifications");
            }
        });

    }

    function appendDsDescriptionToElement($element, domainSpecification) {
        let dsContent = domainSpecification.content["@graph"][0];
        let schemaOrgVersion = getSchemaOrgVersion(dsContent);
        let domainSpecificationVersion = dsContent["schema:version"];
        let domainSpecificationUrl = dsContent["schema:url"];
        let domainSpecificationAuthor = dsContent["schema:author"]["schema:name"];
        if (dsContent["schema:author"]["schema:memberOf"]) domainSpecificationAuthor = domainSpecificationAuthor.concat(' (' + dsContent["schema:author"]["schema:memberOf"]["schema:name"] + ')');
        let domainSpecificationDescription = dsContent["schema:description"];
        if (!domainSpecificationDescription) domainSpecificationDescription = defaultDescription;
        let code = "";
        code = code.concat('<div class="descriptionInner">');
        code = code.concat('<table>');
        // code = code.concat('<tr><td colspan="2" style="text-align: center; padding-bottom: 15px">'+domainSpecificationDescription+'</td></tr>')
        code = code.concat('<div class="descriptionText">' + domainSpecificationDescription + '</div>');
        code = code.concat(concatTableRowToCode('DomainSpecification Author:', domainSpecificationAuthor));
        if (domainSpecificationVersion) code = code.concat(concatTableRowToCode('DomainSpecification Version:', domainSpecificationVersion));
        if (schemaOrgVersion) code = code.concat(concatTableRowToCode('<u>schema.org</u> Version:', schemaOrgVersion));
        if (domainSpecificationUrl) code = code.concat(concatTableRowToCode('DomainSpecification URL:', domainSpecificationUrl));
        // if(!notShowDescription) code = code.concat(concatTableRowToCode('Description:', domainSpecificationDescription));
        code = code.concat('</table>');
        code = code.concat('</div>');
        $element.append(code);
    }

    function triggerTableViewVisibility($element, oneDs, scrollTop, showAll) {
        let $tableViewDS = $('#tableViewForDS-' + oneDs._id);
        if (!$tableViewDS.length) $element.append('<div id="tableViewForDS-' + oneDs._id + '" class="tableViewDS row"></div>');
        $element = $('#tableViewForDS-' + oneDs._id);
        let code = "";
        let $dsTableView = $('#dsTableView-' + oneDs._id);
        generateTableViewContent(oneDs, showAll, function(nCode) {
            if (!$dsTableView.length) code = code.concat('<div class="col-md-12 dsTableViewContainer" id="dsTableView-' + oneDs._id + '">');
            else $dsTableView.html("");
            code = code.concat('<div class="dsTableView">');
            code = code.concat(nCode);
            code = code.concat('</div>');
            code = code.concat('</div>');
            $element.append(code);
            var $dsExampleArea = $('#dsExampleArea-' + oneDs._id + '-content');
            appendDSExampleToElement($dsExampleArea, oneDs);
            $dsTableView = $('#dsTableView-' + oneDs._id);
            insertVisibilityOptionsBeforeElement($dsTableView, oneDs, "table", scrollTop, showAll);
        });
    }


    function appendTableViewToElement(element, oneDs, scrollTop) {
        triggerTableViewVisibility(element, oneDs, scrollTop, false);
    }

    function processPropertyWithNoChildren(propertyWithNoChildren) {
        let code = "";
        code = code.concat('<tr>');
        if (propertyWithNoChildren.data.isOptional) code = code.concat('<td><div class="thContent"><i class="fas fa-tag optional-property"></i>' + propertyWithNoChildren.text + '</div></td>');
        else code = code.concat('<td><div class="thContent"><i class="fas fa-tag mandatory-property"></i>' + propertyWithNoChildren.text + '</div> </td>');
        code = code.concat('<td><div class="thContent">' + propertyWithNoChildren.data.dsRange + '</div> </td>');
        code = code.concat('<td style="border-right-style: none"><div class="thContent">' + propertyWithNoChildren.data.dsDescription + '</div> </td>');
        code = code.concat(`<td class="col-md-1 cardinality"><div class="tdcardinality">${genHTML_Cardinality(propertyWithNoChildren.data)}</div> </td>`);
        code = code.concat('</tr>');

        if (propertyWithNoChildren.data.enuMembers) {
            code = code.concat(genHTML_enuMembers(propertyWithNoChildren.data.enuMembers));
        }
        return code;
    }

    function genHTML_enuMembers(enuMemberArray) {
        let code = '';
        enuMemberArray.forEach((enuMember) => {
            code += `<tr class="enuMemberTd">
              <td class="enuMemberTd"></td>
              <td>${enuMember.name}</td>
              <td>${enuMember.description}</td>
              <td class="enuMemberTd"></td>
         </tr>`
        });
        return code;
    }

    // genHTML_Cardinality is taken from project schema-tourism-ds-visualizer , public/details.js line 299-317
    function genHTML_Cardinality(dsPropertyNode) {
        if (dsPropertyNode["minCount"] !== undefined && dsPropertyNode["minCount"] !== 0) {
            if (dsPropertyNode["maxCount"] !== undefined && dsPropertyNode["maxCount"] !== 0) {
                if (dsPropertyNode["maxCount"] !== dsPropertyNode["maxCount"]) {
                    return "<span title='This property is required. It must have between " + dsPropertyNode["minCount"] + " and " + dsPropertyNode["maxCount"] + " value(s).'>" + dsPropertyNode["minCount"] + ".." + dsPropertyNode["maxCount"] + "</span>"
                } else {
                    return "<span title='This property is required. It must have " + dsPropertyNode["minCount"] + " value(s).'>" + dsPropertyNode["minCount"] + "</span>"
                }
            } else {
                return "<span title='This property is required. It must have at least " + dsPropertyNode["minCount"] + " value(s).'>" + dsPropertyNode["minCount"] + "..N</span>"
            }
        } else {
            if (dsPropertyNode["maxCount"] !== undefined && dsPropertyNode["maxCount"] !== 0) {
                return "<span title='This property is optional. It must have at most " + dsPropertyNode["maxCount"] + " value(s).'>0.." + dsPropertyNode["maxCount"] + "</span>"
            } else {
                return "<span title='This property is optional. It may have any amount of values.'>0..N</span>"
            }
        }
    }

    // Justification
    // function processPropertyWithNoChildren(propertyWithNoChildren) {
    //     var code = "";
    //     code = code.concat('<tr>');
    //     if(propertyWithNoChildren.data.isOptional){
    //         if(propertyWithNoChildren.justification && propertyWithNoChildren.justification !==""){
    //             code = code.concat('<td><div class="thContent"><i class="fas fa-tag optional-property"></i>'+propertyWithNoChildren.text+'</div> <div class="rangeJustification col-centered"> '+ propertyWithNoChildren.justification +'</div></td>');
    //         }else{
    //             code = code.concat('<td><div class="thContent"><i class="fas fa-tag optional-property"></i>'+propertyWithNoChildren.text+'</div></td>');
    //         }
    //     }else {
    //         if(propertyWithNoChildren.justification && propertyWithNoChildren.justification !==""){
    //             code = code.concat('<td><div class="thContent"><i class="fas fa-tag mandatory-property"></i>'+propertyWithNoChildren.text+'</div> <div class="rangeJustification col-centered"> '+ propertyWithNoChildren.justification +'</div></td>');
    //         }else{
    //             code = code.concat('<td><div class="thContent"><i class="fas fa-tag mandatory-property"></i>'+propertyWithNoChildren.text+'</div> </td>');
    //         }
    //     }
    //     code = code.concat('<td><div class="thContent">'+propertyWithNoChildren.data.dsRange+'</div> </td>');
    //     if(propertyWithNoChildren.data.rangeJustification && propertyWithNoChildren.data.rangeJustification[0].name !=="" && propertyWithNoChildren.data.rangeJustification[0].justification && propertyWithNoChildren.data.rangeJustification[0].justification !== ""){
    //         code = code.concat('<td style="border-right-style: none"><div class="thContent">'+propertyWithNoChildren.data.dsDescription+'</div><div class="rangeJustification"> '+ propertyWithNoChildren.data.rangeJustification[0].justification +'</div> </td>');
    //     }else{
    //         code = code.concat('<td style="border-right-style: none"><div class="thContent">'+propertyWithNoChildren.data.dsDescription+'</div> </td>');
    //     }
    //     code = code.concat('</tr>');
    //     return code;
    // }

    function testIsOnlyClass(potentialClasses) {
        let isOnlyClass = true;
        let countOfClasses = 0;
        for (let q = 0; q < potentialClasses.length; q++) {
            let cleanClass = potentialClasses[q].replace(/ /g, '');
            if (cleanClass !== "Text" && cleanClass !== "Number" && cleanClass !== "URL" && cleanClass !== "Boolean") countOfClasses++;
        }
        if (countOfClasses > 1) isOnlyClass = false;
        return isOnlyClass;
    }

    function processPropertyWithChildren(propertyWithChildren, level, dsID, propertyNumber) {

        let csClass = "";
        level++;
        let code = "";
        if (level < 4) {
            switch (level) {
                case 1:
                    csClass = "secondLevel"
                    break;
                case 2:
                    csClass = "thirdLevel"
                    break;
                case 3:
                    csClass = "fourthLevel"
                    break;
                default:
                    csClass = "firstLevel"
                    break;
            }
            code = code.concat('<tr>');

            if (propertyWithChildren.data.isOptional) {
                code = code.concat('<td> <div class="thContent"><i class="fas fa-tag optional-property"></i>' + propertyWithChildren.text + '</div> </td>');
            } else {
                code = code.concat('<td><div class="thContent"><i class="fas fa-tag mandatory-property"></i>' + propertyWithChildren.text + '</div> </td>');
            }

            //Justification test
            // if(propertyWithChildren.data.isOptional){
            //     if(propertyWithChildren.justification && propertyWithChildren.justification !==""){
            //         code = code.concat('<td><div class="thContent"><i class="fas fa-tag optional-property"></i>'+propertyWithChildren.text+'</div> <div class="rangeJustification col-centered"> '+ propertyWithChildren.justification +'</div></td>');
            //     }else{
            //         code = code.concat('<td><div class="thContent"><i class="fas fa-tag optional-property"></i>'+propertyWithChildren.text+'</div></td>');
            //     }
            // }else {
            //     if(propertyWithChildren.justification && propertyWithChildren.justification !==""){
            //         code = code.concat('<td><div class="thContent"><i class="fas fa-tag mandatory-property"></i>'+propertyWithChildren.text+'</div> <div class="rangeJustification col-centered"> '+ propertyWithChildren.justification +'</div></td>');
            //     }else{
            //         code = code.concat('<td><div class="thContent"><i class="fas fa-tag mandatory-property"></i>'+propertyWithChildren.text+'</div> </td>');
            //     }
            // }
            let dsRange = "";
            code = code.concat('<td colspan="2" class="' + csClass + '">');
            code = code.concat('<table class="noBorder">');
            code = code.concat('<tr>');
            let isMultipleClasses = false;
            let classes = (propertyWithChildren.data.dsRange).split(" or ");
            if (classes.length > 1) isMultipleClasses = true;
            let isOnlyClass = testIsOnlyClass(classes);
            if (isMultipleClasses) {
                dsRange = dsRange.concat('<table class="noBorderClass" data-firstElement="str-' + dsID + '-l' + level + '-p' + propertyNumber + '-c' + 0 + ' " id="table-' + dsID + '-l' + level + '-p' + propertyNumber + '">');
                dsRange = dsRange.concat('<tr>');
                for (let k = 0; k < classes.length; k++) {
                    if (classes.length > 1) {
                        let isClass = false;
                        let oneClass = classes[k];
                        let cleanClass;
                        if (oneClass.indexOf("strong")) {
                            cleanClass = oneClass.replace("<strong>", "");
                            cleanClass = cleanClass.replace("</strong>", "");
                            cleanClass = cleanClass.replace(/ /g, "");
                            if (cleanClass !== "Text" && cleanClass !== "Number" && cleanClass !== "URL" && cleanClass !== "Boolean") isClass = true;
                        } else {
                            cleanClass = oneClass;
                        }
                        dsRange = dsRange.concat('<td>');
                        if (k > 0) dsRange = dsRange.concat('<div class="classSeperator">or</div>');
                        if (isClass && k !== 0 && !isOnlyClass) dsRange = dsRange.concat('<div id="btn-' + dsID + '-l' + level + '-p' + propertyNumber + '-c' + k + '" class="dsRangeClassBtn" onclick="toggleTableViewClassProperty(\' ' + level + '\',\'' + propertyNumber + '\',\'' + k + '\',\'' + dsID + '\')">');
                        if (isClass) dsRange = dsRange.concat('<strong id="str-' + dsID + '-l' + level + '-p' + propertyNumber + '-c' + k + '">');
                        dsRange = dsRange.concat(cleanClass);
                        if (isClass) dsRange = dsRange.concat('</strong>');
                        if (isClass && k !== 0 && !isOnlyClass) dsRange = dsRange.concat('</div>');
                        dsRange = dsRange.concat('</td>');
                    }
                }
                dsRange = dsRange.concat('</tr>');
                dsRange = dsRange.concat('</table>');
            } else dsRange = propertyWithChildren.data.dsRange;
            code = code.concat('<td class="propertyRange col-md-3">' + dsRange + '</td>');

            code = code.concat('<td class="classDescription col-md-9">' + propertyWithChildren.data.dsDescription + '</td>');
            code = code.concat('<td class="col-md-1 cardinality"><b>Cardinality</b></td>');

            // Justification


            // let justificationText;
            // if(propertyWithChildren.data.rangeJustification && Array.isArray(propertyWithChildren.data.rangeJustification)){
            //     justificationText = "";
            //     for(let i=0;i<propertyWithChildren.data.rangeJustification.length;i++){
            //         if(propertyWithChildren.data.rangeJustification[i].justification && propertyWithChildren.data.rangeJustification[i].justification!==""){
            //             justificationText = justificationText.concat(propertyWithChildren.data.rangeJustification[i].justification + " ");
            //         }
            //     }
            // }
            // if(justificationText){
            //     code = code.concat('<td class="classDescription col-md-9">'+propertyWithChildren.data.dsDescription+'<div class="rangeJustification col-centered"> '+ justificationText +'</div></td>');
            // }else{
            //     code = code.concat('<td class="classDescription col-md-9">'+propertyWithChildren.data.dsDescription+'</td>');
            // }

            code = code.concat('</tr>')
            code = code.concat('</table>')
            code = code.concat('<div class="innerTable">')
            code = code.concat('<table >')
            let properties = propertyWithChildren.children;

            for (let i = 0; i < properties.length; i++) {
                if (properties.length === 1) {
                    code = code.concat(processPropertiesForTableView(properties[i].children, level, dsID));

                } else {
                    code = code.concat('<tr>');
                    if (isOnlyClass || i === 0) {
                        code = code.concat('<tbody class="testDs" id="' + dsID + '-l' + level + '-p' + propertyNumber + '-c' + i + '">')
                    } else {
                        code = code.concat('<tbody style="display: none;" class="testDs" id="' + dsID + '-l' + level + '-p' + propertyNumber + '-c' + i + '">')
                    }
                    code = code.concat(processPropertiesForTableView(properties[i].children, level, dsID));
                    code = code.concat('</tbody>')
                    code = code.concat('</tr>');
                }
            }
            code = code.concat('</table>')
            code = code.concat('</div>');

            code = code.concat(`<td class="col-md-1 cardinality"><div class="tdcardinality">${genHTML_Cardinality(propertyWithChildren.data)}</div> </td>`);
            code = code.concat('</tr>');
        } else console.log("To many levels for table view. Level: " + level);
        return code;
    }

    function toggleTableViewClassProperty(level, propertyNumber, dsClass, dsID) {
        level = level.replace(/ /g, "");
        dsClass = dsClass.replace(/ /g, "");
        propertyNumber = propertyNumber.replace(/ /g, "");
        let itemId = dsID + '-l' + level + '-p' + propertyNumber + '-c' + dsClass;
        let $outerTable = $('#table-' + dsID + '-l' + level + '-p' + propertyNumber);
        let tableData = $outerTable.data();
        tableData = tableData.firstelement;
        let oldElementID = tableData.replace("str-", "");
        let allAttributesRegex = /([0-9a-z]{24})-l([0-9]+)-p([0-9]+)-c([0-9]+)/g;
        let match = allAttributesRegex.exec(oldElementID);
        let $oldElement = $('#' + tableData);
        $outerTable.data({
                firstelement: 'str-' + itemId
            })
            // Remove btn from old Element
        let cnt = $("#btn-" + itemId).contents();
        $("#btn-" + itemId).replaceWith(cnt);
        let button = '<div id="btn-' + match[1] + '-l' + match[2] + '-p' + match[3] + '-c' + match[4] + '" class="dsRangeClassBtn" onclick="toggleTableViewClassProperty(\' ' + match[2] + '\',\'' + match[3] + '\',\'' + match[4] + '\',\'' + match[1] + '\')"></div>'
        $oldElement.wrap(button);
        // FadeOut old Element content
        let $propertyContent = $('#' + oldElementID);
        $propertyContent.fadeOut(500);
        let $newPropertyContent = $('#' + itemId);
        setTimeout(function() {
            $newPropertyContent.fadeIn(500);
        }, 500);
    }

    function processPropertiesForTableView(properties, level, dsID) {
        let code = "";
        for (let x = 0; x < properties.length; x++) {
            if (properties[x].children && properties[x].children.length !== 0 && !properties[x].isEnum) {
                code = code.concat(processPropertyWithChildren(properties[x], level, dsID, x));
            } else {
                code = code.concat(processPropertyWithNoChildren(properties[x], dsID));
            }
        }
        return code;
    }

    function generateTableViewContent(domainSpecification, showAll, callback) {
        let code = "";
        mapDomainSpecificationToJsTreeJson(domainSpecification.content, showAll, function(data) {

            for (let i = 0; i < data.length; i++) {
                let properties = data[i].children;
                let level = 0;
                code = code.concat('<table class="firstLevel">');
                code = code.concat('<tr class="firstRowTableView sti-red">');
                code = code.concat('<td >');
                code = code.concat('<img src="" class="far fa-list-alt">' + data[i].text);
                code = code.concat('</td>');
                code = code.concat('<td colspan="2">');
                code = code.concat('<div class="firstRowDescription sti-red"><div style="padding: 7px;">' + data[i].data.dsDescription + '</div></div>');
                code = code.concat('<div class="dsExampleArea">');
                code = code.concat('<div onclick="toggleExampleVisibility(\'' + domainSpecification._id + '\')" id="showExampleDiv-' + domainSpecification._id + '" class="showExampleDiv material-icons col-md-12"> keyboard_arrow_down</div>')
                code = code.concat('<div id="dsExampleArea-' + domainSpecification._id + '-content" style="display: none"></div>');
                code = code.concat('</div>');
                code = code.concat('</td>');
                code = code.concat('<td><div class="firstRowCardinality"><b>Cardinality</b></div> </td>');
                code = code.concat('</tr>');
                code = code.concat(processPropertiesForTableView(properties, level, domainSpecification._id));
                code = code.concat('</table>');
            }
            callback(code);
        })
    }


    function appendDomainSpecificationCodeToElement(dsContent, oneDS) {
        if (oneDS._id && oneDS.name) {
            dsContent.append('<div id="domainSpecification-container-' + oneDS._id + '" class="domainSpecification-container col-md-12"></div>');
            let $dsContainer = $('#domainSpecification-container-' + oneDS._id);
            $dsContainer.append(createHTMLCodeForDSHeader(oneDS));
            $dsContainer.append('<div style="display: none" id="domainSpecification-' + oneDS._id + '" class="text-center col-md-12 dsId" style="padding-top: 20px"></div>');
            $dsContainer.append('<div style="margin: auto" id="loadingFirst-' + oneDS._id + '" hidden><img src="/images/loading.gif" style="height: 50px; display: block; margin: auto;"></div>');
            let $domainSpecification = $('#domainSpecification-' + oneDS._id);
            $domainSpecification.append('<div id="domainSpecification-' + oneDS._id + '-content" class="text-center col-md-12 domainSpecification-content"  </div>');
            let $annotationWebsiteHeader = $('.content-header');
            appendClickEventToElement($annotationWebsiteHeader);
        } else console.log("No DomainSpecification found.");
    }

    function renderPublicDomainSpecifications(data) {
        let dsContent = $('#public-domainspecifications-content');
        dsContent.html("");
        if (!dsOrderArrayInitiated) allDomainSpecifications.sortedBy = "name";
        if (data && data !== {}) {
            for (let indexOneDS in data) {
                let oneDS = {};
                oneDS.name = data[indexOneDS].name;
                oneDS.hash = data[indexOneDS].hash;
                oneDS.created = data[indexOneDS].created;
                oneDS.updated = data[indexOneDS].updated;
                oneDS._id = indexOneDS;
                if (!dsOrderArrayInitiated) allDomainSpecifications.allDs.push(oneDS);
                appendDomainSpecificationCodeToElement(dsContent, oneDS);
            }
            dsOrderArrayInitiated = true;
        } else appendDomainSpecificationCodeToElement(dsContent, data);
        $.material.init();
        $('#loadingPublicDomainSpecifciations').fadeOut(200); //hide loading animation of dashboard
        $('#public-domainspecifications-content').delay(200).fadeIn(200); //show dashboard content
        processNavigationHash();
    }

    function appendClickEventToElement(element) {
        element.unbind('click');
        element.click(e => {
            if ($(e.target).is('a') || $(e.target).is('i')) {
                return;
            }
            let id = $(e.currentTarget).parent().attr('id').split('-')[2];
            domainSpecificationsToggle(id, true);
        });
    }

    function initiateJSTreeToDisplayDSContent(oneDS, showOptional) {
        mapDomainSpecificationToJsTreeJson(oneDS.content, showOptional, function(data) {
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
                            { "width": "20%", header: "Class / Property" },
                            // { header: "Class / Property"},
                            {
                                header: "Range / Type",
                                value: function(node) {
                                    return (node.data.dsRange);
                                }
                            },
                            {
                                width: "60%",
                                header: "Description",
                                value: function(node) {
                                    return (node.data.dsDescription);
                                }
                            },
                            {
                                width: "20%",
                                header: "Cardinality",
                                value: function(node) {
                                    if (node.data.dsRange) {
                                        return genHTML_Cardinality(node.data)
                                    }
                                }
                            }
                        ],
                    }
                })
                .bind("select_node.jstree", function(event, data) {
                    showPropertyDescription(data);
                })
        })
    }

    function showPropertyDescription(data) {
        let dsDescription = data.node.data.dsdescription;
        let $infoBox = $('#jsTreeDSInfoBox-1');
        $infoBox.text(dsDescription);
    }

    function processNavigationHash() {
        setTimeout(function() {
            if (location.hash) {
                let target = location.hash;
                target = target.replace("#", "");
                let $selectedDsByHash = $('*[data-hash="' + target + '"]');
                let idOfSelectedDs = ($selectedDsByHash.attr('id'));
                idOfSelectedDs = idOfSelectedDs.replace("domainSpecification-", "");
                $('html, body').animate({
                    scrollTop: $($selectedDsByHash).offset().top
                }, 200)
                domainSpecificationsToggle(idOfSelectedDs);
            }
        }, 450)
    }

    function changeVisibilityOfTree(data, showAll, oneDSId) {
        if (showAll) {
            mapDomainSpecificationToJsTreeJson(data.content, true, function(ndata) {
                $('#jstreeDSContent-' + oneDSId).jstree(true).settings.core.data = ndata;
                $('#jstreeDSContent-' + oneDSId).jstree(true).refresh();
            })
        } else {
            mapDomainSpecificationToJsTreeJson(data.content, false, function(ndata) {
                $('#jstreeDSContent-' + oneDSId).jstree(true).settings.core.data = ndata;
                $('#jstreeDSContent-' + oneDSId).jstree(true).refresh();
            })
        }
    }

    function changePropertyVisibility(showAll, oneDSId, type, hash, scrollTop) {
        con_getDomainSpecification(oneDSId, function(data) {
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
                setTimeout(function() {
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
        code = code.concat('<div id="' + type + '-' + oneDS._id + '-optional-inner"><i class="fas fa-tag optional-property"></i> optional</div>');
        if (!showAll) code = code.concat('</div>');
        code = code.concat('</td>');
        code = code.concat('<td>');
        if (showAll) code = code.concat('<div id="' + type + '-' + oneDS._id + '-mandatory" class="btnDS treeInfoBtn" onclick="changePropertyVisibility(false ,\'' + oneDS._id + '\',\'' + type + '\',\'' + oneDS.hash + '\',' + scrollTop + ')">');
        code = code.concat('<div id="' + type + '-' + oneDS._id + '-mandatory-inner" ><i class="fas fa-tag mandatory-property"></i> mandatory</div>');
        if (showAll) code = code.concat('</div>');
        code = code.concat('</td>');
        code = code.concat('</tr>');
        code = code.concat('</table>');
        code = code.concat('<div class="helpBtn"><p><a id="shareDS-' + oneDS._id + '" class="btn button-sti-red btn-fab btn-fab-mini my-fab-info text-right" href="" onclick="triggerHelp(\'' + oneDS._id + '\',\'' + type + '\');return false;" title="Show help for ' + type + '"><i class="far fa-question-circle iconSmall"></i></a><span title="' + "Show help for" + type + '"></span></p></div>');
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

    function triggerHelp(dsID, type) {
        let modal = $('#modal-public-ds');
        let modalBody = modal.find(".modal-body-public-ds");
        let modalHeader = modal.find(".modal-header-public-ds").find('h4');
        modalBody.html('');
        modalHeader.html('');
        switch (type) {
            case "tree":
                modalHeader.html('Help for Tree View.');
                modalBody.html(generateTreeHelpContent());
                break;
            case "table":
                modalHeader.html('Help for Table View');
                modalBody.html(generateTableHelpContent());
                break;
            case "graphical":
                modalHeader.html('Help for Graphical View');
                modalBody.html(generateGraphicalHelpContent());
                break;
        }
        modal.css('display', 'block');
        let span = $(".close")[0];
        span.onclick = function() {
            modal.css('display', 'none');
        }
    }

    function generateTreeHelpContent() {
        let code = "";
        code = code.concat('<div class="">Here comes a description to: </br><h4>how to read the Tree View of a DomainSpecifciation</h4></div>');

        return code;
    }

    function generateTableHelpContent() {
        let code = "";
        code = code.concat('<div class="">Here comes a description to: </br><h4>how to read the Table View of a DomainSpecifciation</h4></div>');

        return code;
    }

    function generateGraphicalHelpContent() {
        let code = "";
        code = code.concat('<div class="">Here comes a description to: </br><h4>how to read the Graphical View of a DomainSpecifciation</h4></div>');

        return code;
    }


    function concatDsMetadata(domainSpecification, type) {
        let code = "";
        let dsMetaData = "";
        switch (type) {
            case "author":
                type = "By:";
                dsMetaData = domainSpecification.content["@graph"][0]["schema:author"]["schema:name"];
                break;
            case "schemaVersion":
                type = "Schema.org Version:";
                dsMetaData = getSchemaOrgVersion(domainSpecification.content["@graph"][0]);
                break;
            case "dsVersion":
                type = "DomainSpecification Version:";
                dsMetaData = domainSpecification.content["@graph"][0]["schema:version"];
                break;
        }
        if (dsMetaData) {
            code = code.concat('<div class="col-md-3 infoDS" >')
            code = code.concat('<p><span style="text-align: left"> ' + type + ' <b>' + dsMetaData + ' </b></span></p>');
            code = code.concat('</div>');
            return code;
        }
    }

    function generateDSTreeFooter(domainSpecification) {
        let code = "";
        code = code.concat('<div class="col-md-11 infoDS">');
        code = code.concat(concatDsMetadata(domainSpecification, "author"));
        // code = code.concat(concatDsMetadata(domainSpecification, "schemaVersion"));
        let metaData = concatDsMetadata(domainSpecification, "dsVersion");
        if (metaData) code = code.concat(metaData);
        code = code.concat('</div>');
        code = code.concat(generateFooterDetailsPageButton(domainSpecification));
        return code;
    }

    function generateFooterDetailsPageButton(oneDS) {
        let code = "";
        let match;
        if (window.location.hash) {
            let anchorRegex = /(.*\/domain[sS]pecifications\/public)#.*/g;
            match = anchorRegex.exec(location.href);
            match = match[1];
        } else match = location;
        code = code.concat('<a href="' + match + '\/' + oneDS.hash + '"> <div class="col-md-1 btnDS">')
        code = code.concat('<i class="material-icons lighter-icon" >description</i>');
        code = code.concat('</div></a>');
        return code;
    }

    function appendDSTreeToElement(element, oneDS, scrollTop) {
        let code = '';
        code = code.concat('<div id="treeViewForDS-' + oneDS._id + '" class="treeViewDS"></div>');
        code = code.concat('<div class="ds-body domainSpecification-' + oneDS._id + '-content-body" >');
        code = code.concat('<div class ="dsContentBodyInner row">');
        code = code.concat('<div id="jstreeDSContent-' + oneDS._id + '-outer" class="col-md-12 jstreeDSContentOuter">');
        code = code.concat('<div id="jstreeDSContent-' + oneDS._id + '" class="jstreeDSContent">');
        code = code.concat('</div>');
        code = code.concat('</div>');
        code = code.concat('</div>');
        code = code.concat('</div>');
        element.append(code);
        initiateJSTreeToDisplayDSContent(oneDS, false);
        insertVisibilityOptionsBeforeElement($('#jstreeDSContent-' + oneDS._id + '-outer'), oneDS, "tree", scrollTop, false);
    }

    function insertVisibilityOptionsBeforeElement($element, oneDS, type, scrollTop, showAll) {
        let code = "";
        code = code.concat('<div class="col-md-12 infoDS">')
        code = code.concat(renderNavigationOptions(oneDS, type, scrollTop, showAll))
        code = code.concat('</div>');
        $element.before(code);
        $('#myBtn')
    }

    function generateDsProperty(usedSDOAdapter, propertyObj, showOptional) {
        let dsProperty = {};
        let isOptional = false;
        let isOpened = false;
        dsProperty.children = [];
        dsProperty.data = {};
        dsProperty.justification = propertyObj["rdfs:comment"];
        dsProperty.text = prettyPrintURI(propertyObj["sh:path"]);
        dsProperty.data.minCount = propertyObj["sh:minCount"];
        dsProperty.data.maxCount = propertyObj["sh:maxCount"];

        let rangeOfProp = propertyObj['sh:or'][0]['sh:class']
        let isEnumeration = false;
        let enuWithSdo;

        try {
            enuWithSdo = usedSDOAdapter.getEnumeration(rangeOfProp);
            isEnumeration = true;
        } catch (e) {
            //ignore 
        }
        dsProperty.isEnum = isEnumeration;
        if (isEnumeration) {
            let enuMembersArray = [];
            if (propertyObj['sh:or'][0]['sh:in']) {
                let enuMembers = propertyObj['sh:or'][0]['sh:in'];
                for (let i = 0; i < enuMembers.length; i++) {
                    let enuMemberName = enuMembers[i]['@id'];
                    enuMemberName = enuMemberName.replace('schema:', '');
                    let enuMember = {};
                    enuMember.name = enuMemberName;
                    enuMembersArray.push(enuMember);
                }
            } else {
                enuMembersArray = enuWithSdo.getEnumerationMembers();
            }
            enuMembersArray.forEach((eachMember) => {
                const enuMemberDesc = usedSDOAdapter.getEnumerationMember(eachMember.name);
                let enuMemberDescription = enuMemberDesc.getDescription()
                eachMember.description = enuMemberDescription;
            });
            dsProperty.data.enuMembers = enuMembersArray;
            enuMembersArray.forEach((enuMem) => {
                let enuMemebersObj = {
                    children: [],
                    data: {
                        dsRange: '',
                        dsDescription: enuMem.description
                    },
                    icon: 'glyphicon glyphicon-chevron-right',
                    text: enuMem.name,
                };
                dsProperty.children.push(enuMemebersObj);
            })

        }

        if (!propertyObj["sh:minCount"] > 0) {
            isOptional = true;
            dsProperty.icon = "fas fa-tag optional-property";
            dsProperty.data.isOptional = true;
        } else {
            dsProperty.icon = "fas fa-tag mandatory-property";
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
        if (isOpened) dsProperty.state = { 'opened': true };
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

    function generateDsClass(usedSDOAdapter, dsvClass, closed, showOptional) {
        let dsClass = {};
        if (dsvClass["sh:targetClass"]) {
            dsClass.text = prettyPrintClassDefinition(dsvClass["sh:targetClass"]);
        } else {
            dsClass.text = prettyPrintClassDefinition(dsvClass["sh:class"]);
        }

        dsClass.icon = "far fa-list-alt";
        if (!closed) dsClass.state = { 'opened': true };
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
                let dsProperty = generateDsProperty(usedSDOAdapter, dsvProperties[i], showOptional);
                if (dsProperty) dsClass.children.push(dsProperty);
            }
        }

        return dsClass;
    }

    function mapDomainSpecificationToJsTreeJson(domainSpecification, showOptional, callback) {
        let vocabsArray = getVocabURLForDS(domainSpecification);
        let usedSDOAdapter = getSDOAdapter(vocabsArray);
        if (usedSDOAdapter === null) {
            //there is no adapter for that vocabulary-combination yet, create one
            let newSDOAdapter = new SDOAdapter();
            createAdapterMemoryItem(vocabsArray, newSDOAdapter);
            newSDOAdapter.addVocabularies(vocabsArray).then(function() {
                registerVocabReady(vocabsArray);
                let dsClass = generateDsClass(newSDOAdapter, domainSpecification["@graph"][0], false, showOptional);
                callback([dsClass]);
            });
        } else {
            if (usedSDOAdapter.initialized === false) {
                //other parallel process has already started the creation of this sdoAdapter, wait until it finishes
                setTimeout(function() {
                    mapDomainSpecificationToJsTreeJson(domainSpecification, showOptional, callback)
                }, 500);
            } else {
                //use the already created adapter for this vocabulary-combination
                let dsClass = generateDsClass(usedSDOAdapter.sdoAdapter, domainSpecification["@graph"][0], false, showOptional);
                callback([dsClass]);
            }
        }
    }

    function orderPublicDomainSpecifications(orderBy) {
        switch (orderBy) {
            case "name":
                if (allDomainSpecifications.sortedBy !== "name") {
                    allDomainSpecifications.allDs.sort(function(date1, date2) {
                        if (date1.name > date2.name) return 1;
                        if (date1.name < date2.name) return -1;
                        return 0;
                    });
                }
                break;
            case "creationDate":
                if (allDomainSpecifications.sortedBy !== "creationDate") {
                    allDomainSpecifications.sortedBy = "creationDate";
                    allDomainSpecifications.allDs.sort(function(date1, date2) {
                        if (date1.created > date2.created) return -1;
                        if (date1.created < date2.created) return 1;
                        return 0;
                    });
                }
                break;
            case "lastUpdateDate":
                if (allDomainSpecifications.sortedBy !== "lastUpdateDate") {
                    allDomainSpecifications.sortedBy = "lastUpdateDate";
                    allDomainSpecifications.allDs.sort(function(date1, date2) {
                        if (date1.updated > date2.updated) return -1;
                        if (date1.updated < date2.updated) return 1;
                        return 0;
                    });
                }
                break;
        }
        renderPublicDomainSpecifications(turnDsArrayIntoObject());
    }

    function turnDsArrayIntoObject() {
        let returnObj = {};
        for (let i = 0; i < allDomainSpecifications.allDs.length; i++) {
            returnObj[allDomainSpecifications.allDs[i]._id] = {
                name: allDomainSpecifications.allDs[i].name,
                hash: allDomainSpecifications.allDs[i].hash,
                created: allDomainSpecifications.allDs[i].created,
                updated: allDomainSpecifications.allDs[i].updated
            }
        }
        return returnObj;
    }

    function appendSearchFieldToPublicDomainSpecifications(containerName) {
        containerName.before(
            '<div class="search-container">' +
            '<fieldset><div class="form-group">' +
            '<label class="col-md-1 control-label">' +
            '<i class="material-icons my-fab-icon">search</i>' +
            '</label>' +
            '<div class="col-md-10">' +
            '<input id="publicDomainSpecification-search" onkeydown="searchDomainSpecification(this)" class="form-control col-md-8" placeholder="Search">' +
            '</div>' +
            '<label id="publicDomainSpecification-search-reset" for="publicDomainSpecification-search" class="col-md-1 control-label">' +
            '<i class="material-icons my-fab-icon">close</i>' +
            '</label>' +
            '</div>' +
            '</fieldset>' +
            '</div>');
        containerName.append('<div id="publicDomainSpecifications-result-box"></div>');
        $('#publicDomainSpecification-search-reset').click(function() {
            $('#publicDomainSpecification-search').val('');
            $('#public-domainspecifications-content').html("");
            renderPublicDomainSpecifications(allDomainSpecifications.allDs);
        });
    }

    let wasSearched = false;

    function searchDomainSpecification(searchCriteria) {
        let searchResult = {};
        if (event.key) {
            if (searchCriteria.value.length > 2) {
                wasSearched = true;
                // let searchResult = {};
                let searchCriteriaRegex = ".*placeholder.*";
                searchCriteriaRegex = searchCriteriaRegex.replace("placeholder", searchCriteria.value);
                searchCriteriaRegex = new RegExp(searchCriteriaRegex, "i");
                for (let i = 0; i < allDomainSpecifications.allDs.length; i++) {
                    if (searchCriteriaRegex.exec(allDomainSpecifications.allDs[i].name)) {
                        searchResult[allDomainSpecifications.allDs[i]._id] = {
                            name: allDomainSpecifications.allDs[i].name,
                            hash: allDomainSpecifications.allDs[i].hash,
                            created: allDomainSpecifications.allDs[i].created,
                            updated: allDomainSpecifications.allDs[i].updated
                        }
                    }
                }
                renderPublicDomainSpecifications(searchResult);
            } else if (wasSearched) {
                for (let i = 0; i < allDomainSpecifications.allDs.length; i++) {
                    searchResult[allDomainSpecifications.allDs[i]._id] = {
                        name: allDomainSpecifications.allDs[i].name,
                        hash: allDomainSpecifications.allDs[i].hash,
                        created: allDomainSpecifications.allDs[i].created,
                        updated: allDomainSpecifications.allDs[i].updated
                    }
                    if (allDomainSpecifications.allDs[i].name === searchCriteria.value) {}
                }
                renderPublicDomainSpecifications(searchResult);
                // renderPublicDomainSpecifications(allDomainSpecifications);
                wasSearched = false;
            }

        }
    }


    /**
     *
     * @param domainSpecification
     * @returns {string}
     */
    //creates HTML code for a header element with a given website
    function createHTMLCodeForDSHeader(domainSpecification) {
        let code = '';
        //container element
        code = code.concat('<div data-hash="' + domainSpecification.hash + '" data-dsUpdated="' + domainSpecification.updated + '" data-dsCreated="' + domainSpecification.created + '" data-dsName="' + domainSpecification.name + '" id="' + domainSpecification._id + '" class="mainDsObj content-header text-center" title="Show/Hide annotations of this website">');
        //left view control buttons
        code = code.concat('<div class="domainSpecification-heading-container text-left">');
        code = code.concat('</div>');
        //center part
        code = code.concat('<div class="dashboard-heading-container-center text-center">');
        //visibility toggle
        code = code.concat('<a href="javascript:domainSpecificationsToggle(\'' + domainSpecification._id + '\',\'true\')" class="btn button-sti-red-action btn-fab btn-fab-mini my-fab-info" title="Show/Hide annotations of this website"><i class="material-icons my-fab-icon iconSmall" id="visibility_icon_' + domainSpecification._id + '">visibility_on</i></a>');
        //website name
        if (domainSpecification.content) code = code.concat(domainSpecification.content["@graph"][0]["schema:name"]);
        else code = code.concat(domainSpecification.name);
        code = code.concat('</div>');
        code = code.concat('<div class="domainSpecification-heading-container text-right">');
        // code = code.concat('<p><div style="display: none" id="printDS-'+ domainSpecification._id +'" class="btn button-sti-red btn-fab btn-fab-mini my-fab-info text-right" onclick="generatePrintableTableViewPage(\''+domainSpecification._id+'\')" title="Print '+ domainSpecification.name+'"><i class="material-icons my-fab-icon iconSmall">print</i></div><span title="' + "print " +  domainSpecification.name+'"></span></p>');
        code = code.concat('<p><a style="display: none" id="shareDS-' + domainSpecification._id + '" class="btn button-sti-red btn-fab btn-fab-mini my-fab-info text-right" href="#' + domainSpecification.hash + '" onclick="scrollToHeader(\'' + domainSpecification._id + '\')" title="Share ' + domainSpecification.name + '"><i class="material-icons my-fab-icon iconSmall">share</i></a><span title="' + "share " + domainSpecification.name + '"></span></p>');
        code = code.concat('<p><a style="display: none" id="detailsDS-' + domainSpecification._id + '" class="btn button-sti-red btn-fab btn-fab-mini my-fab-info text-right" href="' + location + '\/' + domainSpecification.hash + '" title="Show details of ' + domainSpecification.name + '"><i class="material-icons my-fab-icon iconSmall">description</i></a><span title="' + "show details of " + domainSpecification.name + '"></span></p>');
        code = code.concat('</div></div>');
        return code;
    }


    function scrollToHeader(dsID) {
        $('html, body').animate({
            scrollTop: $('#' + dsID).offset().top
        }, 200)
    }

    function appendDSExampleToElement(element, domainSpecification) {
        let code = "";
        code = code.concat('<div class="dsExample ">');
        code = code.concat('</div>');
        code = code.concat('<div id="ds-' + domainSpecification._id + '-exampleContent" class="exampleClassContent">');
        code = code.concat('<div style="margin: auto" id="loadingFirstExample-' + domainSpecification._id + '" hidden><img src="/images/loading.gif" style="height: 50px; display: block; margin: auto;"></div>');
        code = code.concat('</div>');
        element.append(code);
    }

    function toggleExampleVisibility(dsID) {
        let obj = $('#dsExampleArea-' + dsID + '-content');
        let exampleButton = $('#showExampleDiv-' + dsID);
        let $exampleContent = $('#ds-' + dsID + '-exampleContent');
        if (obj.css('display') === "none") {
            exampleButton.text("keyboard_arrow_up");
            obj.slideDown(250);
            $exampleContent.css("background-color", "white");
            $('#loadingFirstExample-' + dsID).show();
            con_getAnnotationFromDomainSpecification(dsID, function(data) {
                if (data.length !== 0) {
                    let modalContent = $('#ds-' + dsID + '-info-modal-content');
                    if (modalContent.length) $('#ds-' + dsID + '-info-modal-content').html("");
                    else {
                        $exampleContent.append('<pre id="ds-' + dsID + '-info-modal-content" class="myOutput"></pre>');
                        modalContent = $('#ds-' + dsID + '-info-modal-content');
                    }
                    let randomExample = Math.floor(Math.random() * data.length);
                    modalContent.html(syntaxHighlight(data[randomExample].content));
                } else $exampleContent.append('Sorry, No Example found.')
                $('#loadingFirstExample-' + dsID).remove();
            })
        } else {
            exampleButton.text("keyboard_arrow_down");
            obj.slideUp(250);
        }
    }

    function getSchemaOrgVersion(domainSpecification) {
        let versionRegex = /.*schema\.org\/version\/([0-9\.]+)\//g;
        let match = versionRegex.exec(domainSpecification["schema:schemaVersion"]);
        return parseFloat(match[1]);
    }

    function domainSpecificationsToggle(dsID, triggeredByUser) {
        let obj = $('#domainSpecification-' + dsID);
        let shareDS = $('#shareDS-' + dsID);
        // let printDS = $('#printDS-' + dsID );
        let detailsDS = $('#detailsDS-' + dsID);
        let visibility_icon = $('#visibility_icon_' + dsID);
        if (obj.css('display') === "none") {
            let annotationWebsiteContent = $('#domainSpecification-' + dsID + '-content');
            let loadNew = true;
            try {
                if (annotationWebsiteContent.length >= 1) loadNew = false;
            } catch (e) {
                loadNew = true;
            }
            obj.slideDown(250);
            visibility_icon.html('visibility_off');
            shareDS.css("display", "");
            // printDS.css("display", "");
            detailsDS.css("display", "");
            $('#loadingFirst-' + dsID).show();
            con_getDomainSpecification(dsID, function(data) {
                let $domainSpecificationsContent = $('#domainSpecification-' + dsID + '-content');
                $domainSpecificationsContent.html("");
                $domainSpecificationsContent.append('<div id="outerDescriptionBox-' + dsID + '" class="descriptionOuter"></div>');
                appendDsDescriptionToElement($('#outerDescriptionBox-' + dsID), data, true);
                $domainSpecificationsContent.append('<h2>Table View</h2><div id="outerTableBox-' + dsID + '" class="tableViewOuter"></div>');
                $domainSpecificationsContent.append('<h2>Tree View</h2><div id="outerTreeBox-' + dsID + '" class="tableViewOuter"></div>');
                let $tableViewBox = $('#outerTableBox-' + dsID);
                let $treeViewDS = $('#outerTreeBox-' + dsID);
                appendTableViewToElement($tableViewBox, data, true);
                appendDSTreeToElement($treeViewDS, data, false);
                let $dsBody = $('#domainSpecification-' + data._id + '-content');
                insertFooterAfterElement($dsBody, data);
                $('#loadingFirst-' + dsID).remove();
            })
        } else {
            obj.slideUp(250);
            if (location.hash) {
                let anchorRegex = /(.*\/domain[sS]pecifications\/public)#.*/g;
                let match = anchorRegex.exec(location);
                history.pushState(null, null, match[1]);
            }
            visibility_icon.html('visibility');
            shareDS.css("display", "none");
            // printDS.css("display", "none");
            detailsDS.css("display", "none");
        }
    }

    function insertFooterAfterElement($element, domainSpecification) {
        let footer = $('#footerDs-' + domainSpecification._id);
        if (!footer.length) {
            let code = "";
            code = code.concat('<div id="footerDs-' + domainSpecification._id + '" class="ds-footer domainSpecification-content-footer" >');
            code = code.concat(generateDSTreeFooter(domainSpecification));
            code = code.concat('</div>');
            $element.after(code);
        }
    }
    // Copied from public/assets/js/utilities.js of semantify-core
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

    function prettyPrintURI(uri) {
        if (typeof uri === "string") {
            if (uri.startsWith("schema:")) {
                return uri.substring("schema:".length)
            }
        }
        return uri;
    }
    // declare globally only needed functions
    window.appendTableViewToElement = appendTableViewToElement;
    window.appendDSTreeToElement = appendDSTreeToElement;
    window.changePropertyVisibility = changePropertyVisibility;
})();