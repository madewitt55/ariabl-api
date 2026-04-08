import express, {type Express} from 'express';
import cors from 'cors';
import router from '../routes';

export default function createServer() {
    const app: Express = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api', router);
    

    return app;
}