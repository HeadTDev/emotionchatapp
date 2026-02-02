import type { ApiResponse } from '../types';

const API_URL = 'http://localhost:8000/api/chat';
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Utility: delay function for retry backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Utility: fetch with timeout using AbortController
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// Utility: exponential backoff retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  timeoutMs: number,
  maxRetries: number
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeoutMs);
      
      // Only retry on 5xx server errors or network failures
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      lastError = new Error(`Server error: ${response.status}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry on client-side errors (4xx would be caught above)
      if (error instanceof Error && error.message === 'Request timeout') {
        console.warn(`Request timeout (attempt ${attempt + 1}/${maxRetries + 1})`);
      } else {
        console.warn(`Network error (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
      }
    }

    // If not last attempt, wait with exponential backoff
    if (attempt < maxRetries) {
      const backoffDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
      console.log(`Retrying in ${backoffDelay}ms...`);
      await delay(backoffDelay);
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

export const chatService = {
  async sendMessage(message: string): Promise<ApiResponse> {
    try {
      const response = await fetchWithRetry(
        API_URL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, history: [] }),
        },
        REQUEST_TIMEOUT,
        MAX_RETRIES
      );

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Chat service error:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }
};