import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';

const multerInstance = multer({ storage: multer.memoryStorage() });

export function uploadSingle(fieldName: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        multerInstance.single(fieldName)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                res.status(400).json({ error: err.message });
                return;
            }
            next(err ?? undefined);
        });
    };
}
