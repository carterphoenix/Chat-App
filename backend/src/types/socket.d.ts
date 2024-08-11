import { Socket } from 'socket.io';
import { User } from './user'; // Adjust the import path if necessary


declare module 'socket.io' {
  interface Socket {
    user?: string; // or any other type based on your use case
  }
}
