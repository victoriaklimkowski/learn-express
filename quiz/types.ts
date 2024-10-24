import { Request } from 'express';

// define relevant types here
export interface User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
}

export interface UserRequest extends Request {
    users?: User[];
}