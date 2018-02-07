<?php
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $_POST['url']);
    curl_setopt($ch, CURLOPT_HEADER, 'Access-Control-Allow-Origin: *');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $return = curl_exec($ch);
    echo $return;
?>
