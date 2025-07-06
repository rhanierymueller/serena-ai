export interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
}

export interface SpeechRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
}

export interface TextToSpeechConfig {
  rate: number;
  pitch: number;
  language: string;
  voice?: SpeechSynthesisVoice;
}

export type UserPlan = 'pro' | 'free';
export type MessageSender = 'user' | 'bot';