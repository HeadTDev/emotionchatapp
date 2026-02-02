import type { ApiResponse } from '../types';

const API_URL = 'http://localhost:8000/api/chat';

export const chatService = {
  async sendMessage(message: string): Promise<ApiResponse> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: [] }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response.json();
  }
};