export type ErrorType =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'rate_limit'
  | 'offline';

export type Surface =
  | 'chat'
  | 'auth'
  | 'api'
  | 'stream'
  | 'database'
  | 'history'
  | 'vote'
  | 'document'
  | 'suggestions';

export type ErrorCode = `${ErrorType}:${Surface}`;

export type ErrorVisibility = 'response' | 'log' | 'none';

export const visibilityBySurface: Record<Surface, ErrorVisibility> = {
  database: 'log',
  chat: 'response',
  auth: 'response',
  stream: 'response',
  api: 'response',
  history: 'response',
  vote: 'response',
  document: 'response',
  suggestions: 'response',
};

export class ChatSDKError extends Error {
  public type: ErrorType;
  public surface: Surface;
  public statusCode: number;

  constructor(errorCode: ErrorCode, cause?: string) {
    super();

    const [type, surface] = errorCode.split(':');

    this.type = type as ErrorType;
    this.cause = cause;
    this.surface = surface as Surface;
    this.message = getMessageByErrorCode(errorCode);
    this.statusCode = getStatusCodeByType(this.type);
  }

  public toResponse() {
    const code: ErrorCode = `${this.type}:${this.surface}`;
    const visibility = visibilityBySurface[this.surface];

    const { message, cause, statusCode } = this;

    if (visibility === 'log') {
      console.error({
        code,
        message,
        cause,
      });

      return Response.json(
        { code: '', message: 'Something went wrong. Please try again later.' },
        { status: statusCode },
      );
    }

    return Response.json({ code, message, cause }, { status: statusCode });
  }
}

export function getMessageByErrorCode(errorCode: ErrorCode): string {
  if (errorCode.includes('database')) {
    return 'An error occurred while executing a database query.';
  }

  switch (errorCode) {
    case 'bad_request:api':
      return "Essa requisição não pode ser processada. Por favor, verifique os seus dados e tente novamente.";

    case 'unauthorized:auth':
      return 'Você precisa logar para continuar.';
    case 'forbidden:auth':
      return 'Sua conta não tem acesso a essa melhoria.';

    case 'rate_limit:chat':
      return 'Você chegou ao limite de mensagens por hoje. Tente novamente mais tarde.';
    case 'not_found:chat':
      return 'A conversa solicitada não foi encontrada. Por favor, verifique e tente novamente.';
    case 'forbidden:chat':
      return 'Esse chat é de outro usuário. Por favor, verifique e tente novamente.';
    case 'unauthorized:chat':
      return 'Você precisa logar para ver esse chat. Por favor, logue e tente novamente.';
    case 'offline:chat':
      return "Estamos tendo um problema para enviar a sua mensagem. Por favor, verifique a sua conexão tente novamente mais tarde.";

    case 'not_found:document':
      return 'Esse documento não foi encontrado. Por favor, verifique e tente novamente.';
    case 'forbidden:document':
      return 'Esse documento é de outro usuário. Por favor, verifique e tente novamente.';
    case 'unauthorized:document':
      return 'Voce precisa logar para ver esse documento. Por favor, logue e tente novamente.';
    case 'bad_request:document':
      return 'Essa solicitacao nao pode ser processada. Por favor, verifique os seus dados e tente novamente.';

    default:
      return 'Ocorreu um erro desconhecido, por favor, tente novamente mais tarde.';
  }
}

function getStatusCodeByType(type: ErrorType) {
  switch (type) {
    case 'bad_request':
      return 400;
    case 'unauthorized':
      return 401;
    case 'forbidden':
      return 403;
    case 'not_found':
      return 404;
    case 'rate_limit':
      return 429;
    case 'offline':
      return 503;
    default:
      return 500;
  }
}
