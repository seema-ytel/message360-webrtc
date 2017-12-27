<?php
require_once "./../vendor/autoload.php";

$dotenv = new Dotenv\Dotenv(__DIR__);
$dotenv->load();

$accountSid = getenv('ACCOUNT_SID');
$authToken = getenv('AUTH_TOKEN');

$clientInstance = new Message360Lib\Message360Client($accountSid, $authToken);
$webrtcController = $clientInstance->getWebRTC();


$options = [
    'accountSid' => $accountSid,
    'authToken' => $authToken,
];

$response = $webrtcController->createCheckFunds($options);
echo json_encode($response);
