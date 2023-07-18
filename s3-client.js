import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

const REGION = "ru-central1";
const ENDPOINT = "https://storage.yandexcloud.net";

const client = new S3Client({ region: REGION, endpoint: ENDPOINT });

const streamToData = (stream, asString = false) =>
    new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () =>
            resolve(asString ? Buffer.concat(chunks).toString("utf8") : Buffer.concat(chunks)))
    });

export const download = async (Bucket, Key) => {
    const command = new GetObjectCommand({ Bucket, Key })
    const { Body } = await client.send(command);
    return (await streamToData(Body));
}

export const upload = async (Bucket, Key, Body) => {
    const command = new PutObjectCommand({ Bucket, Key, Body })
    return await client.send(command);
}
