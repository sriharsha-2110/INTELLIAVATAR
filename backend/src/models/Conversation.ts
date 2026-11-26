import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  id: string;
  sender: 'user' | 'teacher';
  text: string;
  audioUrl?: string;
  gesture?: string;
  conceptDemo?: any;
  timestamp: Date;
}

export interface IConversation extends Document {
  userId: string;
  avatarId: string;
  messages: IMessage[];
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  id: { type: String, required: true },
  sender: { type: String, enum: ['user', 'teacher'], required: true },
  text: { type: String, required: true },
  audioUrl: { type: String },
  gesture: { type: String },
  conceptDemo: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

const ConversationSchema = new Schema<IConversation>({
  userId: { type: String, required: true, index: true },
  avatarId: { type: String, required: true, index: true },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
});

export const ConversationModel = mongoose.model<IConversation>('Conversation', ConversationSchema);
