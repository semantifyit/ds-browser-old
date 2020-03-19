//Functions regarding the overview-page showing all DS
//  route: /

function init_overview() {
    globUI.$dsListTableContent.html("");
    globUI.$dsListTableContent.append(genHTML_dsList());
    document.title = "Schema Tourism - Domain Specifications";
    setActualVisibility(VIS_DS_TABLE);
    showPage();
}

//until we have the List feature, we have to filter the DS we want to show
function curateDSList(dsListObj) {
    let arr = [];
    let keys = Object.keys(dsListObj);
    for (let i = 0; i < keys.length; i++) {
        if (dsListObj[keys[i]]["isInstantAnnotation"] === false && !dsListObj[keys[i]]['name'].startsWith("Broker") && !dsListObj[keys[i]]['name'].startsWith("Simple") && !dsListObj[keys[i]]['name'].startsWith("schema")) {
            if (dsListObj[keys[i]]['name'].charAt(0).toUpperCase() !== dsListObj[keys[i]]['name'].charAt(0)) {
                dsListObj[keys[i]]['name'] = dsListObj[keys[i]]['name'].charAt(0).toUpperCase().concat(dsListObj[keys[i]]['name'].substring(1))
            }
            arr.push(dsListObj[keys[i]]);
        }
    }
    return arr;
}

//generates the HTML code for the DS overview page
function genHTML_dsList() {
    let code = "";
    let arr = curateDSList(glob.dsList);
    arr = sortByKeyAsc(arr, "name");
    for (let i = 0; i < arr.length; i++) {
        let name = arr[i]['name'];
        let hash = arr[i]['hash'];
        let desc = "";
        if (arr[i]['description'] !== undefined) {
            desc = arr[i]['description'];
        }
        let types = uniquifyArray(arr[i]['types']);
        let typesCode = "<td class=\"prop-types\" hidden>" + genHTML_overview_dsName(hash, types) + "</td>";
        let descCode = "<td class=\"prop-desc\">" + repairLinksInHTMLCode(desc) + "</td>";
        let linkCode = "<a href='javascript:nav(\"" + hash + "\")'>" + name + "</a>";
        code = code.concat("<tr><th class=\"prop-nam\"><code property=\"rdfs:label\">" + linkCode + "</code></th>" + typesCode + descCode + "</tr>");
    }
    return code;
}

//generates the HTML code for the name/type of a DS in the DS overview page
function genHTML_overview_dsName(hash, arr) {
    let code = "";
    for (let i = 0; i < arr.length; i++) {
        let name = arr[i];
        //let newUrl = location.href.concat("?ds=" + hash + "&path=" + name);
        let newUrl = hash + "/" + name;
        code = code.concat("<a href='javascript:nav(\'" + newUrl + "\')'>" + name + "</a><br>");
    }
    return code;
}