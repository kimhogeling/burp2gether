<?php

use CloudEvents\V1\CloudEventInterface;
use Google\Cloud\Firestore\FirestoreClient;
use Google\Cloud\Storage\StorageClient;
use Google\CloudFunctions\FunctionsFramework;


// Register the function with Functions Framework.
// This enables omitting the `FUNCTIONS_SIGNATURE_TYPE=cloudevent` environment
// variable when deploying. The `FUNCTION_TARGET` environment variable should
// match the first parameter.
FunctionsFramework::cloudEvent('audioFileToMP3', 'audioFileToMP3');

function audioFileToMP3(CloudEventInterface $cloudevent)
{
    $log = fopen(getenv('LOGGER_OUTPUT') ?: 'php://stderr', 'wb');
    $data = $cloudevent->getData();
    $bucketName = $data['bucket'];
    $fileName = $data['name'];

    fwrite($log, 'Event test by kim: ' . $cloudevent->getId() . PHP_EOL);
    fwrite($log, 'Event Type: ' . $cloudevent->getType() . PHP_EOL);
    fwrite($log, 'Bucket: ' . $bucketName . PHP_EOL);
    fwrite($log, 'File: ' . $fileName . PHP_EOL);
    fwrite($log, 'Metageneration: ' . $data['metageneration'] . PHP_EOL);
    fwrite($log, 'Created: ' . $data['timeCreated'] . PHP_EOL);
    fwrite($log, 'Updated: ' . $data['updated'] . PHP_EOL);


    if (pathinfo($fileName, PATHINFO_EXTENSION) !== 'webm' && pathinfo($fileName, PATHINFO_EXTENSION) !== 'mp4') {
        fwrite($log, "Skipping non-webm / non-mp4 file: $fileName" . PHP_EOL);
        return;
    }

    fwrite($log, "File OK");

    $storage = new StorageClient();
    $bucket = $storage->bucket($bucketName);
    $object = $bucket->object($fileName);

    // Download the file to a temporary location
    $tempFile = tempnam(sys_get_temp_dir(), 'audio');
    $object->downloadToFile($tempFile);

    // Convert the file to mp3 using ffmpeg
    $outputFile = tempnam(sys_get_temp_dir(), 'audio') . '.mp3';
    shell_exec("ffmpeg -i $tempFile -vn -ab 128k -ar 44100 -y $outputFile");

    // Upload the converted file back to the bucket
    $newFileName = 'burp/' . pathinfo($fileName, PATHINFO_FILENAME) . '.mp3';
    $newObject = $bucket->upload(
        fopen($outputFile, 'r'),
        ['name' => $newFileName]
    );

    fwrite($log, "Converted file: gs://$bucketName/$newFileName" . PHP_EOL);
}
