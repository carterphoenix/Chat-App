import mongoose, { Schema, Document } from 'mongoose';

interface IMessage extends Document {
  room: string;
  sender: string;
  message: string;
  timestamp: Date;
}

const messageSchema: Schema = new Schema({
  room: { type: String, required: true },
  sender: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const Message = mongoose.model<IMessage>('Message', messageSchema);
