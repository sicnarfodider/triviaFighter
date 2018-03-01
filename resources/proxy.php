<?php
    if (strpos($_POST['url'], 'http://superheroapi.com/api.php/10159579732380612/') !== false) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, filter_var($_POST['url'], FILTER_VALIDATE_URL));
        curl_setopt($ch, CURLOPT_HEADER, 'Access-Control-Allow-Origin: *');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $return = curl_exec($ch);
        echo $return;
    }
?>
