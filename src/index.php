<!DOCTYPE html>
<html>
<head>
    <title>Auth Integration</title>
    <!-- build:css css/ui.min.css -->
    <link rel="stylesheet" type="text/css" href="css/ui.css" />
    <!-- endbuild -->

</head>
<body>


<div class="content">
    <div class="header">
        <div class="auth">
            <img class="providerLogo" src=""/>
            <span class="loading">
                <img src="assets/spinner.gif" width="31" height="31"  alt="Loading Auth Libs..."/>Loading Auth Libs...
            </span>
            <div class="authWrapper">
                <button class="noAuthN">Sign In</button>
                <button class="authN">Sign Out</button>
            </div>
        </div>
    </div>

    <div class="playerWrapper"></div>
    <div class="playlist locked"><?php include_once("playlistContainer.php");?></div>
</div>


<!-- [REQUIRED] 3rd Party Libraries -->
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<!-- build:js js/auth.min.js -->
<script src="js/helper/LoadHelper.js"></script>
<script src="js/auth/model/AuthError.js"></script>
<script src="js/auth/model/Provider.js"></script>
<script src="js/auth/adobepass/ErrorMap.js"></script>
<script src="js/auth/adobepass/Loader.js"></script>
<script src="js/auth/adobepass/API.js"></script>
<!-- endbuild -->
<!-- build:js js/example.min.js -->
<script src="js/ui/PlayerDelegate.js"></script>
<script src="js/ui/ProviderSelectorDelegate.js"></script>
<script src="js/ui/ErrorHandler.js"></script>
<script src="js/ui/UIDelegate.js"></script>
<!-- endbuild -->

<script>
</script>

</body>
</html>