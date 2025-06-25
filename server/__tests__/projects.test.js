// server/__tests__/projects.test.js

const request = require('supertest');
const app     = require('../index'); // your Express app
const db      = require('../db');

describe('Projects API', () => {
  let token;
  let threadId;
  let projectId;

  // Register & log in a user, then create one thread for assignments
  beforeAll(async () => {
    // 1) Register
    await request(app)
      .post('/api/register')
      .send({ username: 'projuser', password: 'projpass' })
      .expect(200)
      .then(res => {
        expect(res.body.token).toBeDefined();
        token = res.body.token;
      });

    // 2) Create a thread to assign later
    await request(app)
      .post('/api/threads')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: '999', name: 'SeedThread', hex: '#123123', owned: false })
      .expect(200)
      .then(res => {
        expect(res.body.id).toBeDefined();
        threadId = res.body.id;
      });
  });

  afterAll(done => {
    db.close(err => {
      if (err) console.error(err);
      done();
    });
  });

  it('starts with no projects', async () => {
    await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .expect(200, []);
  });

  it('creates a new project', async () => {
    await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'MyProj', description: 'Test project' })
      .expect(200)
      .then(res => {
        expect(res.body).toMatchObject({
          id: expect.any(Number),
          name: 'MyProj',
          description: 'Test project'
        });
        projectId = res.body.id;
      });
  });

  it('lists the newly created project', async () => {
    await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then(res => {
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toMatchObject({ name: 'MyProj' });
      });
  });

  it('retrieves a project by id, with no threads initially', async () => {
    await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then(res => {
        expect(res.body).toMatchObject({
          id: projectId,
          name: 'MyProj',
          description: 'Test project'
        });
        expect(Array.isArray(res.body.threads)).toBe(true);
        expect(res.body.threads).toHaveLength(0);
      });
  });

  it('updates an existing project', async () => {
    await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'MyProjUpdated', description: 'Updated desc' })
      .expect(200)
      .then(res => {
        expect(res.body).toMatchObject({
          id: projectId,
          name: 'MyProjUpdated',
          description: 'Updated desc'
        });
      });
  });

  it('assigns a thread to the project', async () => {
    await request(app)
      .post(`/api/projects/${projectId}/threads/${threadId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then(res => {
        expect(res.body).toMatchObject({
          projectId,
          threadId
        });
      });

    // Confirm assignment shows up
    await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then(res => {
        expect(res.body.threads).toHaveLength(1);
        expect(res.body.threads[0]).toMatchObject({
          id: threadId,
          code: '999',
          name: 'SeedThread'
        });
      });
  });

  it('unassigns the thread from the project', async () => {
    await request(app)
      .delete(`/api/projects/${projectId}/threads/${threadId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then(res => {
        expect(res.body).toMatchObject({ deleted: 1 });
      });

    // Confirm removal
    await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then(res => {
        expect(res.body.threads).toHaveLength(0);
      });
  });

  it('deletes the project', async () => {
    await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then(res => {
        expect(res.body).toMatchObject({ deleted: 1 });
      });

    // Confirm no projects left
    await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .expect(200, []);
  });
});
