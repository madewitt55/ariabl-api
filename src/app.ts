import express from 'express';
import routes from './routes';
import config from 'config';
import createServer from './utils/create_server';

const PORT = config.get<number>('port');

const app = createServer();

app.listen(PORT, async () => {
    console.log(`App listening on port ${PORT}`);
});