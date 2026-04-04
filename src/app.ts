import express from 'express';
import routes from './routes';
import config from 'config';

const PORT = config.get<number>('port');

const app = express();
app.use(express.json());
routes(app);

app.listen(PORT, async () => {
    console.log(`App listening on port ${PORT}`);
});