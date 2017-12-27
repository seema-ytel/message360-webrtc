<?php
require_once "./../vendor/autoload.php";
try{
$requestInput = file_get_contents("php://input");
$requestData = json_decode($requestInput,true);
$dotenv = new Dotenv\Dotenv(__DIR__);
$dotenv->load();
$accountSid = getenv('ACCOUNT_SID');
$authToken = getenv('AUTH_TOKEN');
$clientInstance = new Message360Lib\Message360Client($accountSid, $authToken);
$wrtc = $clientInstance->getWebRTC();
//Store data for API call in array
$collect['accountSid'] = $accountSid;
$collect['authToken'] = $authToken;
$collect['phoneNumber'] = isset($requestData['phone_number']) ? $requestData['phone_number'] : "";
$collect['username'] = isset($requestData['username']) ? $requestData['username'] : "";
//Make the API call, passing the data we stored in the array
$res = $wrtc->getWebRtcLogs($collect);

//Send response as JSON back to client
echo json_encode($res);
}catch(Exception $ex){
	echo json_encode([$ex->getMessage(),$ex->getLine()]);
}