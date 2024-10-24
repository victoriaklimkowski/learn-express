import EventEmitter from "events";
import * as fs from 'fs';

const bkupEmitter = new EventEmitter();

// Invokes by the backup event in serverBkup.ts 
// and hypothetically any event in the server
bkupEmitter.on('bkup', (users: Object[], path: fs.PathOrFileDescriptor) => {
    // Backup the data to the specified path - some file
    fs.writeFile(path, JSON.stringify(users), (err) => {
        if (err) console.log('Backup failed');
        else console.log('Backup succeded');
      });
})

export default bkupEmitter;