import { getStore } from '@netlify/blobs';

export default async (req) => {
  const store = getStore('tasks');
  const method = req.method;

  try {
    if (method === 'GET') {
      const { blobs } = await store.list();
      const tasks = await Promise.all(
        blobs.map((b) => store.get(b.key, { type: 'json' }))
      );
      const valid = tasks.filter(Boolean);
      valid.sort((a, b) => b.created_at - a.created_at);
      return Response.json(valid);
    }

    if (method === 'POST') {
      const { title, description } = await req.json();
      if (!title) return Response.json({ error: 'Title required' }, { status: 400 });

      const id = Date.now().toString() + Math.random().toString(36).slice(2, 8);
      const task = {
        id,
        title,
        description: description || '',
        completed: false,
        created_at: Date.now()
      };

      await store.setJSON(id, task);
      return Response.json(task, { status: 201 });
    }

    if (method === 'PUT') {
      const { id, completed } = await req.json();
      const task = await store.get(id, { type: 'json' });
      if (!task) return Response.json({ error: 'Task not found' }, { status: 404 });

      task.completed = completed;
      await store.setJSON(id, task);
      return Response.json(task);
    }

    if (method === 'DELETE') {
      const id = new URL(req.url).searchParams.get('id');
      if (!id) return Response.json({ error: 'ID required' }, { status: 400 });

      await store.delete(id);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (err) {
    console.error('Error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const config = {
  path: '/api/tasks'
};
