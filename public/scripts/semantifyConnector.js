// Retrieve a DomainSpecification by its hash code (specified in its meta data already loaded)
function con_getDomainSpecification(uid, successCb, errorCb) {
    $.ajax({
        type: "GET",
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        url: '/api/ds/' + uid,
        success: successCb,
        error: errorCb
    });
}

// Retrieve a DS-List from backend
async function con_getDSList(uid = "") {
    return $.ajax({
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        url: '/api/list/'+uid,
    });
}