import express, { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { UserRequest } from './types';

const router = express.Router()
const writeFile = '../data/users.json'

router.post('/adduser', (req: UserRequest, res: Response) => {
    let newuser = req.body;
    req.users?.push(newuser);
    fs.writeFile(path.resolve(__dirname, writeFile), JSON.stringify(req.users), (err) => {
        if (err) console.log('Failed to write');
        else console.log('User Saved');
    });
    res.send('done');
});

export default router;