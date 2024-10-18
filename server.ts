import fs from 'fs';
import path from 'path';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';

// How many middleware's are we using? 
// 3

// Define an object, the user object, stored in JSON file
interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

// Define the type we will use for the request object
// We will only accept requests that have this format,
// otherwise reject them
interface UserRequest extends Request {
  users?: User[];
}

const app: Express = express();
const port: number = 8000;

// Read this file when the server starts up
// users.json is the resource we are exposing to the client
const dataFile = './data/users.json';

// Populate the user object if everything works fine
let users: User[];

// Asynchronously read the file and store the data in the users variable
// Could be a large file, so we don't want to block the event loop
// Call the handler when the file is read
fs.readFile(path.resolve(__dirname, dataFile), (err, data) => {
  console.log('reading file ... ');
  if (err) throw err;
  users = JSON.parse(data.toString());
});

// Defining our own middleware function.
// Always take 3 parameters: req, res, next 
// because of chain of responsibility pattern
const addMsgToRequest = (req: UserRequest, res: Response, next: NextFunction) => {
  if (users) {
    req.users = users;
    next(); // the function that appears right below it in the middleware chain
  } else {
    return res.json({
      error: { message: 'users not found', status: 404 }
    });
  }
};

// Use the middleware function to read usernames
// Essentially saying "I only trust localhost:300"
// Don't accept anything else
// This is a security measure
// IF this is empty, it means we trust anyone, which is a big security flaw
// Can also create a list of trusted domains
app.use(cors({ origin: 'http://localhost:3000' }));
app.use('/read/usernames', addMsgToRequest);

// More of our own middleware functions
app.get('/read/usernames', (req: UserRequest, res: Response) => {
  let usernames = req.users?.map((user) => {
    return { id: user.id, username: user.username };
  });
  // We don't have to call the next function anymore
  // because we are sending a response back to the client
  res.send(usernames); 
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/write/adduser', addMsgToRequest);

// 
app.post('/write/adduser', (req: UserRequest, res: Response) => {
  // Body is going to be JSON, which is why we use middleware to pre-process it
  // Clicking on this takes us to the interface for this Node module which does that
  // So this parses the JSON and puts it into this variable
  let newuser = req.body as User;
  // Set users property to the users array
  users.push(newuser);
  // Construct a new user - assuming the client is sending me one
  // Once done, write this to a file asynchronously because this is a long running task
  // So store it in a temp variable for now while it gets written to the file
  fs.writeFile(path.resolve(__dirname, dataFile), JSON.stringify(users), (err) => {
    // What if this fails though? We should use a design pattern to address this issue
    // when we come back to it. 
    if (err) console.log('Failed to write');
    else console.log('User Saved');
  });
  res.send('done');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});