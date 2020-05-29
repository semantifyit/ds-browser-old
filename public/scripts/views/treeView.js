const pathname = window.location.pathname;
let splitURL = pathname.split('/')
const vocabId = splitURL[1];

console.log(vocabId);

let glob = { dsMemory: {} };


let id = "47tJxjyLE";
con_getDomainSpecificationByHash(id, function() {
    let $treeViewDS = $('#dsTree');

    let domainSpecification = glob.dsUsed;
    console.log(domainSpecification);
    appendDSTreeToElement($treeViewDS, domainSpecification, false);
})