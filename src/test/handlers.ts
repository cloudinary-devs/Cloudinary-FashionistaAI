import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/generate', async () => {
    return HttpResponse.json({
      public_id: 'test-upload',
      secure_url: 'https://res.cloudinary.com/demo/image/upload/test-upload.jpg',
    });
  }),
];
