import request, {type Response} from 'supertest';
import createServer from '../src/utils/create_server.js';

const app = createServer();

describe('POST /api/html', () => {
    const ENDPOINT: string = '/api/html';

    describe('given valid `body.html`', () => {
        // ARRANGE
        const html: string = '<html><head></head><body></body></html>';

        it('should return status 200', async () => {
            // ACT
            const res: Response = await request(app).post(ENDPOINT).send({ html });

            // ASSERT
            expect(res.status).toBe(200);
            expect(res.body.tags).toBeDefined();
        });
    });
    describe('given `body.html` with no tags', () => {
        // ARRANGE
        const html = 'no tags here';

        it('should return status 400', async () => {
            // ACT
            const res: Response = await request(app).post(ENDPOINT).send({ html });

            // ASSERT
            expect(res.status).toBe(400);
        });
    });
    describe('given `body.html` with unclosed tags', () => {
        // ARRANGE
        const html: string = '<html><head></head>';

        it('should return status 400', async () => {
            // ACT
            const res: Response = await request(app).post(ENDPOINT).send({ html });

            // ASSERT
            expect(res.status).toBe(400);
        });
    });
    describe('given a valid html file upload', () => {
        // ARRANGE
        const buffer: Buffer = Buffer.from('<html><head></head><body></body></html>');

        it('should return status 200', async () => {
            // ACT
            const res: Response = await request(app)
                .post(ENDPOINT)
                .attach('file', buffer, { filename: 'test.html', contentType: 'text/html' });

            // ASSERT
            expect(res.status).toBe(200);
        });
    });
});
