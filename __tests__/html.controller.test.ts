import request, {type Response} from 'supertest';
import createServer from '../src/utils/create_server.js';

const app = createServer();

describe('POST /api/html', () => {
    const ENDPOINT: string = '/api/html';

    describe('given`body.html` containing tags', () => {
        // ARRANGE
        const html: string = '<html></html>';

        it('should return status 200 with parsed `tags` array and `message`', async () => {
            // ACT
            const res: Response = await request(app).post(ENDPOINT).send({ html });

            // ASSERT
            expect(res.status).toBe(200);
            expect(res.body.tags).toBeDefined();
            expect(res.body.message).toBeDefined();
        });
    });
    describe('given`body.html` containing no tags', () => {
        // ARRANGE
        const html: string = 'no tags here';

        it('should return status 400 with `tags` array and `message`', async () => {
            // ACT
            const res: Response = await request(app).post(ENDPOINT).send({ html });

            // ASSERT
            expect(res.status).toBe(400);
            expect(res.body.tags.length).toBeDefined();
            expect(res.body.message).toBeDefined();
        });
    });
});
