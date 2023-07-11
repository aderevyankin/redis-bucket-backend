import fs from 'fs';
import { download, upload } from './s3-client.js';
import dotenv from 'dotenv';

dotenv.config();
const DUMP = 'dump.rdb';

async function test(params) {
    if (process.argv[2] === 'up') {
        const dump = fs.createReadStream(DUMP);
        let result = await upload('redis-dumps', DUMP, dump);
        console.log(result.$metadata.httpStatusCode === 200 ? 'Данные выгружены успешно' : 'Что то пошло не так!');
    } else {
        let result = await download('redis-dumps', 'dump.rdb');
        await fs.writeFile(DUMP, result, () => console.log('Дамп успешно загружен!'));
    }
}

test();