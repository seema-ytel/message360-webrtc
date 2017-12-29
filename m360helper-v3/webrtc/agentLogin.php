<?php
require_once "./../vendor/autoload.php";
try{
$requestInput = file_get_contents("php://input");
$requestData = json_decode($requestInput,true);
$dotenv = new Dotenv\Dotenv(__DIR__);
$dotenv->load();
$username = isset($requestData['username']) ? $requestData['username'] : "";
$password = isset($requestData['password']) ? $requestData['password'] : "";
$accountSid = getenv('ACCOUNT_SID');
$authToken = getenv('AUTH_TOKEN');
$clientInstance = new Message360Lib\Message360Client($accountSid, $authToken);
$webrtcInstance = $clientInstance->getWebRTC();

$options = [
    'username' => $username,
    'password' => $password,
    'accountSid' => $accountSid,
    'authToken' => $authToken,
    'environment' => getenv('ENVIRONMENT')
];
$response = $webrtcInstance->createToken($options);

echo json_encode($response);
}catch(Exception $ex){
	echo json_encode([$ex->getMessage(),$ex->getLine()]);
}
