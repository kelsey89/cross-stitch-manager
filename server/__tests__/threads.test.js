// server/__tests__/threads.test.js

const request = require('supertest');
const app     = require('../index');   // your Express app
const db      = require('../db');

describe('Threads API', () => {
  let token;

  // Before all tests, register and log in a test user to get a JWT
  beforeAll(async () => {
    // Register
    await request(app)
      .post('/api/register')
      .send({ username: 'testuser', password: 'password123' })
      .expect(200)
      .then(res => {
        expect(res.body.token).toBeDefined();
        token = res.body.token;
      });
  });

  // After all tests, close the database connection
  afterAll(done => {
    db.close(err => {
      if (err) console.error(err);
      done();
    });
  });

  it('starts with no threads', async () => {
    await request(app)
      .get('/api/threads')
      .set('Authorization', `Bearer ${token}`)
      .expect(200, []);
  });

  it('creates a new thread', async () => {
    await request(app)
      .post('/api/threads')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: '123', name: 'Test Color', hex: '#abcdef', owned: false })
      .expect(200)
      .then(res => {
        expect(res.body).toMatchObject({
          id: expect.any(Number),
          code: '123',
          name: 'Test Color',
          hex: '#abcdef',
          owned: false
        });
      });
  });

  it('lists the newly created thread', async () => {
    await request(app)
      .get('/api/threads')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then(res => {
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toMatchObject({ code: '123', name: 'Test Color' });
      });
  });

  it('updates an existing thread', async () => {
    // First, fetch the thread to get its id
    const threadsRes = await request(app)
      .get('/api/threads')
      .set('Authorization', `Bearer ${token}`);
    const threadId = threadsRes.body[0].id;

    // Perform update
    await request(app)
      .put(`/api/threads/${threadId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ code: '124', name: 'Updated Color', hex: '#123456', owned: true })
      .expect(200)
      .then(res => {
        expect(res.body).toMatchObject({
          id: threadId,
          code: '124',
          name: 'Updated Color',
          hex: '#123456',
          owned: true
        });
      });
  });

  it('deletes a thread', async () => {
    // Fetch to get id
    const threadsRes = await request(app)
      .get('/api/threads')
      .set('Authorization', `Bearer ${token}`);
    const threadId = threadsRes.body[0].id;

    // Delete it
    await request(app)
      .delete(`/api/threads/${threadId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then(res => {
        expect(res.body).toMatchObject({ deleted: 1 });
      });

    // Confirm it’s gone
    await request(app)
      .get('/api/threads')
      .set('Authorization', `Bearer ${token}`)
      .expect(200, []);
  });
});
