// Chatiefy API Client
const API_BASE = 'https://chatiefy.vercel.app/api/v1';

interface CheckUsernameResponse {
  available?: boolean;
  error?: string;
  suggestions?: string[];
}

interface RegisterGuestResponse {
  auth: string;
  status: string;
  details: {
    username: string;
    avatar: string;
    thumb: string;
  };
}

interface StartChatResponse {
  random: {
    status: string;
  };
}

interface Message {
  hunter: string;
  message: string;
  time: number;
  seen: number;
  random: number;
  thumb?: string;
}

interface PollMessagesResponse {
  messages?: Message[];
  messageshash?: string;
  partner_state: string;
  notifier_data?: {
    partner: string;
  };
  notifier_hash?: string;
  new_messages_t?: number;
}

interface SendMessageResponse {
  delivery: string;
  msg_id: number;
}

interface Meme {
  id: string;
  filename: string;
  path: string;
  hunter: string;
  rank: string;
  date: string;
  likes: number;
  dislikes: number;
  height: string;
  width: string;
  roomId: string;
}

interface MemesResponse {
  memes: Meme[];
  has_more: boolean;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'API request failed');
  }

  return response.json();
}

export async function checkUsername(username: string): Promise<CheckUsernameResponse> {
  return apiRequest<CheckUsernameResponse>('/auth/check-username', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export async function registerGuest(username: string): Promise<RegisterGuestResponse> {
  return apiRequest<RegisterGuestResponse>('/auth/register-guest', {
    method: 'POST',
    body: JSON.stringify({ username, client_version: '4048' }),
  });
}

export async function startRandomChat(authToken: string, auth: string): Promise<StartChatResponse> {
  return apiRequest<StartChatResponse>(`/random/start?auth_token=${encodeURIComponent(authToken)}`, {
    method: 'POST',
    body: JSON.stringify({ auth }),
  });
}

export async function pollMessages(
  authToken: string,
  auth: string,
  target?: string,
  messageshash?: string,
  notifierHash?: string,
  newMessagesT?: number
): Promise<PollMessagesResponse> {
  return apiRequest<PollMessagesResponse>(`/random/poll?auth_token=${encodeURIComponent(authToken)}`, {
    method: 'POST',
    body: JSON.stringify({
      auth,
      target,
      messageshash,
      notifier_hash: notifierHash,
      new_messages_t: newMessagesT,
    }),
  });
}

export async function sendMessage(
  authToken: string,
  auth: string,
  target: string,
  message: string
): Promise<SendMessageResponse> {
  return apiRequest<SendMessageResponse>(`/random/send?auth_token=${encodeURIComponent(authToken)}`, {
    method: 'POST',
    body: JSON.stringify({ auth, target, message }),
  });
}

export async function disconnectChat(
  authToken: string,
  auth: string,
  partnerIdentifier: string
): Promise<void> {
  return apiRequest(`/random/disconnect?auth_token=${encodeURIComponent(authToken)}`, {
    method: 'POST',
    body: JSON.stringify({ auth, partnerIdentifier }),
  });
}

export async function fetchMemes(
  authToken: string,
  auth: string,
  lastMemeId: string = '0'
): Promise<MemesResponse> {
  return apiRequest<MemesResponse>(`/memes?auth_token=${encodeURIComponent(authToken)}`, {
    method: 'POST',
    body: JSON.stringify({ auth, last_meme_id: lastMemeId }),
  });
}

export type { Message, Meme, PollMessagesResponse };
