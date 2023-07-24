# Модуль для загрузки и выгрузки данных в AWS-совместимые хранилища

Для корректной работы необходимо указать переменные 
окружения (см. файл `.env.example`).

*Внимание!* dotenv может не работать в облаке.
Переменные лучше инициализировать другим способом,
например, прописать в конфигурации облачной функции
или контейнера.

Модуль содержит две функции:

## download

Получение данных из облака.

### Parameters

*   `Key`   (optional, default `AWS_DEFAULT_KEY`)
*   `Bucket`   (optional, default `AWS_DEFAULT_BUCKET`)

## upload

Отправка данных в облако.

### Parameters

*   `Body` &#x20;
*   `Key`   (optional, default `AWS_DEFAULT_KEY`)
*   `Bucket`   (optional, default `AWS_DEFAULT_BUCKET`)

## list

Получение списка ключей.

### Parameters

*   `Bucket`   (optional, default `AWS_DEFAULT_BUCKET`)

## exists

Проверка наличия ключа в бакете.

### Parameters

*   `Key`   (optional, default `AWS_DEFAULT_KEY`)
*   `Bucket`   (optional, default `AWS_DEFAULT_BUCKET`)
