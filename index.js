import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

/**
 * Необходимые переменные среды и их проверка.
 * Внимание! 
 * dotenv может не работать в облаке.
 * Переменные лучше инициализировать другим способом,
 * например, прописать в конфигурации облачной функции
 * или контейнера.
 */ 

const {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_DEFAULT_KEY,
    AWS_DEFAULT_BUCKET,
    AWS_REGION,
    AWS_ENDPOINT
} = process.env

if(!AWS_ACCESS_KEY_ID) throw 'Не указан идентификатор ключа доступа.'
if(!AWS_SECRET_ACCESS_KEY) throw 'Не указано значение ключа доступа.'
if(!AWS_DEFAULT_KEY) throw 'Не указано имя ключа по умолчанию'
if(!AWS_DEFAULT_BUCKET) throw 'Не указано имя хранилища по умолчанию.'
if(!AWS_REGION) throw 'Не указан регион облачного хранилища.'
if(!AWS_ENDPOINT) throw 'Не указана конечная точка облачного хранилища.'

/**
 * Создание клиента AWS S3.
 */

const client = new S3Client({ region: AWS_REGION, endpoint: AWS_ENDPOINT });

/**
 * Вспомогательная функция для соединения фрагментов потока
 * в единый буфер. Второй аргумент позволяет сразу получить строку.
 */

const streamToData = (stream, asString = false) =>
    new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () =>
            resolve(asString ? Buffer.concat(chunks).toString("utf8") : Buffer.concat(chunks)))
    });

/**
 * Получение данных из облака.
 */

export const download = async (Bucket = AWS_DEFAULT_BUCKET, Key = AWS_DEFAULT_KEY) => {
    const command = new GetObjectCommand({ Bucket, Key })
    const { Body } = await client.send(command);
    return (await streamToData(Body));
}

/**
 * Отправка данных в облако.
 */ 

export const upload = async (Body, Bucket = AWS_DEFAULT_BUCKET, Key = AWS_DEFAULT_KEY) => {
    const command = new PutObjectCommand({ Bucket, Key, Body })
    return await client.send(command);
}
