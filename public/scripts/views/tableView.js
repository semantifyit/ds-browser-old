// /table/<dsid>

// 1st read dsid from url
// 2nd get ds from semantify
// 3rd call appendTableViewToElement($elementContainer, domainSpecification, true);
// need dummy glob object for con_getDomainSpecificationByHash function


const pathname = window.location.pathname;
let splitURL = pathname.split('/')
const tableTreeCheck = splitURL[1];
//const id = splitURL[2];
console.log('splitURL ', splitURL);

let id = "47tJxjyLE";
let glob = { dsMemory: {} };

con_getDomainSpecificationByHash(id, function() {
    let $elementContainer = $('#dsTable');
    let $treeViewDS = $('#dsTree');
    console.log(glob);
    let domainSpecification = glob.dsUsed;
    //    if (tableTreeCheck === 'table') {
    //      $('#dsTable').show();
    appendTableViewToElement($elementContainer, domainSpecification, true);
    //} else if (tableTreeCheck === 'tree') {
    //  $('#dsTree').show();
    appendDSTreeToElement($treeViewDS, domainSpecification, false);
    //}
})