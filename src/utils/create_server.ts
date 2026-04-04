import express, {type Express} from 'express';
import router from '../routes';

export default function createServer() {
    const app: Express = express();
    app.use(express.json());
    app.use('/api', router);

    return app;
}