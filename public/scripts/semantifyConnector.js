// Retrieve a DomainSpecification by its hash code (specified in its meta data already loaded)
function con_getDomainSpecification(uid, callback) {
    $.ajax({
        type: "GET",
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        url: '/api/domainSpecification/hash/' + uid,
        success: function(data) {
            glob.dsMemory[uid] = data;
            glob.dsUsed = glob.dsMemory[uid];
            callback();
        }.bind(this),
        error: function(data, xhr, status, err) {
            glob.dsUsed = glob.dsMemory[uid];
            callback(); // send undefined in order to handle the error in the front end
            console.error("error: " + data.responseText);
        }.bind(this)
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