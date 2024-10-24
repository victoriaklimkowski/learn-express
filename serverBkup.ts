import fs from 'fs';
import path from 'path';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bkupEmitter from './pubusb/bkupEmitter';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

interface UserRequest extends Request {
  users?: User[];
}

const app: Express = express();
const port: number = 8000;

const dataFile = './data/users.json';
const bkupFile = './data/bkup.json'

let users: User[];

fs.readFile(path.resolve(__dirname, dataFile), (err, data) => {
    console.log('reading data file ... ');
    if (err) throw err;
    users = JSON.parse(data.toString());
});

const addMsgToRequest = (req: UserRequest, res: Response, next: NextFunction) => {
  if (users) {
    req.users = users;
    next();
  } else {
    return res.json({
      error: { message: 'users not found', status: 404 }
    });
  }
};

app.use(cors({ origin: 'http://localhost:3000' }));
app.use('/read/usernames', addMsgToRequest);

app.get('/read/usernames', (req: UserRequest, res: Response) => {
  let usernames = req.users?.map((user) => {
    return { id: user.id, username: user.username };
  });
  res.send(usernames);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/write/adduser', addMsgToRequest);

app.post('/write/adduser', (req: UserRequest, res: Response) => {
  let newuser = req.body as User;
  users.push(newuser);
  /**
   * Synchronous call to compute the size of the data file
   */
  const dataFileSize = fs.statSync(path.resolve(__dirname, dataFile)).size;
  // Create an artificial fail by limiting to 10 bytes to test the backup
  if(dataFileSize > 1024) {
    // IF fail triggered, called bakupEmmitter in bkupEmitter.ts
    // Pass the parameters: user information and the path to the backup file
    // event emmiter is a type of eventbus
    // see this in bkup.json - a new json file created after use (in class)
    bkupEmitter.emit('bkup', users, path.resolve(__dirname, bkupFile)); // emit bkup event when the file size is over 10 Kb
  }
  else {
    fs.writeFile(path.resolve(__dirname, dataFile), JSON.stringify(users), (err) => {
        if (err) console.log('Failed to write');
        else console.log('User Saved');
      });
  }
  res.send('done');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});