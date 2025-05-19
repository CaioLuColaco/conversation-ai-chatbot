export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Modelo do chat',
    description: 'Modelo padrão',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Modelo de raciocínio',
    description: 'Modelo avançado',
  },
];
