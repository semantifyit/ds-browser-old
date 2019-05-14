//Functions regarding the overview-page showing all DS
//  route: /

function init_overview(dsList) {
    $('#table_ds_list').append(genHTML_dsList(dsList));
    $('#table_ds_list').show();
    $('#legend').hide();
    showPage();
}

//generates the HTML code for the DS overview page
function genHTML_dsList(dsListObj) {
    var code = "";
    var arr = [];
    var keys = Object.keys(dsListObj);
    for (var i = 0; i < keys.length; i++) {
        if (dsListObj[keys[i]]["isInstantAnnotation"] === false && !dsListObj[keys[i]]['name'].startsWith("Broker") && !dsListObj[keys[i]]['name'].startsWith("Simple") && !dsListObj[keys[i]]['name'].startsWith("schema")) {
            if (dsListObj[keys[i]]['name'].charAt(0).toUpperCase() !== dsListObj[keys[i]]['name'].charAt(0)) {
                dsListObj[keys[i]]['name'] = dsListObj[keys[i]]['name'].charAt(0).toUpperCase().concat(dsListObj[keys[i]]['name'].substring(1))
            }
            arr.push(dsListObj[keys[i]]);
        }
    }
    arr = sortByKeyAsc(arr, "name");
    for (var i = 0; i < arr.length; i++) {
        var name = arr[i]['name'];
        var hash = arr[i]['hash'];
        var desc = "";
        if (arr[i]['description'] !== undefined) {
            desc = arr[i]['description'];
        }
        var types = uniquifyArray(arr[i]['types']);
        var typesCode = "<td class=\"prop-types\" hidden>" + genHTML_overview_dsName(hash, types) + "</td>";
        var descCode = "<td class=\"prop-desc\">" + repairLinksInHTMLCode(desc) + "</td>";
        var newUrl = glob.rootUrl + hash;
        var linkCode = "<a href='" + newUrl + "'>" + name + "</a>";
        code = code.concat("<tr><th class=\"prop-nam\"><code property=\"rdfs:label\">" + linkCode + "</code></th>" + typesCode + descCode + "</tr>");
    }
    return code;
}

//generates the HTML code for the name/type of a DS in the DS overview page
function genHTML_overview_dsName(hash, arr) {
    var code = "";
    for (var i = 0; i < arr.length; i++) {
        var name = arr[i];
        //var newUrl = location.href.concat("?ds=" + hash + "&path=" + name);
        var newUrl = glob.rootUrl + "" + hash + "/" + name;
        code = code.concat("<a href='" + newUrl + "'>" + name + "</a><br>");
    }
    return code;
}