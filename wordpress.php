<?php

$site = get_site_url();
$path = "schema-tourism-ds-visualizer/";


?>

<script>

    var glob = {};
    glob.site = "<?php echo $site; ?>";
    glob.path = "<?php echo $path; ?>";
</script>


<script src="https://code.jquery.com/jquery-1.9.1.min.js"></script>
<script src="<?php echo $site; ?>/schema-tourism-ds-visualizer/scripts/semantifyConnector.js"></script>
<script src="<?php echo $site; ?>/schema-tourism-ds-visualizer/scripts/urlHandler.js"></script>
<script src="<?php echo $site; ?>/schema-tourism-ds-visualizer/scripts/DSManipulation.js"></script>
<script src="<?php echo $site; ?>/schema-tourism-ds-visualizer/sdoData/sdoLibrary_browser.js"></script>
<script src="<?php echo $site; ?>/schema-tourism-ds-visualizer/scripts/propertyRowConstructor.js"></script>
<script src="<?php echo $site; ?>/schema-tourism-ds-visualizer/scripts/main.js"></script>


<link rel="stylesheet" href="<?php echo $site; ?>/schema-tourism-ds-visualizer/styles/main.css">
<link rel="stylesheet" href="<?php echo $site; ?>/schema-tourism-ds-visualizer/styles/sdo.css">

<div id="content">
    <div id="page-wrapper" class="content-wrapper text-left">
        <h1 id="title"></h1>
        <h4 id="path"></h4>
        <p id="description"></p>
        <p id="dsInfo">
            <b>Author:</b> <span id="ds_author"></span><br>
            <b>Domain specification version:</b> <span id="ds_version"></span><br>
            <b>Schema.org version:</b> <span id="ds_sdo_version"></span><br>
        </p>
        <p id="legend"><span class="outgoingLink"></span>External link<span class="outgoingLinkRed"></span>External link
            to schema.org</p>
        <!--Table for Types-->
        <table id="table_type" class="definition-table">
            <thead>
            <tr>
                <th class="colProperty"><span title="Sorted by order in Domain Specification">Property</span></th>
                <th class="colExpectedType">Expected Type</th>
                <th class="colDescription">Description</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td colspan="3"></td>
            </tr>
            </tbody>
        </table>
        <!--Table for Enumerations-->
        <table id="table_enumeration" class="definition-table">
            <thead>
            <tr>
                <th class="colEnumerationMember">Enumeration member</th>
                <th class="colDescription">Description</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td colspan="2"></td>
            </tr>
            </tbody>
        </table>
        <!--Table for Domain Specifications-->
        <table id="table_ds" class="definition-table">
            <thead>
            <tr>
                <th class="colEnumerationMember">Type</th>
                <th class="colDescription">Description</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td colspan="2"></td>
            </tr>
            </tbody>
        </table>
        <!--Table for Domain Specification list-->
        <table id="table_ds_list" class="definition-table">
            <thead>
            <tr>
                <th class="colEnumerationMember">Domain Specification</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td colspan="2"></td>
            </tr>
            </tbody>
        </table>

    </div>
</div>


</body>
</html>