import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import * as preloadModule from './lib/preloadImage';

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('App', () => {
  it('renders the upload UI', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /fashionista ai/i })).toBeInTheDocument();
    expect(screen.getByText('Choose File')).toBeInTheDocument();
  });

  it('uploads a file and renders four style tiles', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { public_id: 'test-upload', secure_url: 'https://example.com/test-upload.jpg' },
    });
    vi.spyOn(preloadModule, 'preloadImage').mockResolvedValue(undefined);

    render(<App />);
    const user = userEvent.setup();

    const file = new File(['photo'], 'outfit.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('business casual')).toBeInTheDocument();
      expect(screen.getByText('sporty')).toBeInTheDocument();
      expect(screen.getByText('streetwear')).toBeInTheDocument();
      expect(screen.getByText('elegant')).toBeInTheDocument();
    });

    expect(axios.post).toHaveBeenCalledWith(
      '/api/generate',
      expect.any(FormData),
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  });
});
