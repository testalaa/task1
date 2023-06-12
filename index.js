import http from 'http';

let tasks = [];

const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (url === '/tasks') {
    if (method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const task = JSON.parse(body);
          validateTask(task);
          task.id = tasks.length + 1;
          tasks.push(task);
          res.statusCode = 201; // Created
          res.end(JSON.stringify(task));
        } catch (error) {
          res.statusCode = 400; // Bad Request
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    } else if (method === 'GET') {
      res.statusCode = 200; // OK
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(tasks));
    } else {
      res.statusCode = 405; // Method Not Allowed
      res.end();
    }
  } else if (url.startsWith('/tasks/')) {
    const taskId = parseInt(url.split('/')[2]);

    if (method === 'PUT') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const taskData = JSON.parse(body);
          validateTask(taskData);
          const taskIndex = tasks.findIndex(task => task.id === taskId);
          if (taskIndex === -1) {
            res.statusCode = 404; // Not Found
            res.end(JSON.stringify({ error: 'Task not found' }));
          } else {
            tasks[taskIndex].name = taskData.name;
            tasks[taskIndex].priority = taskData.priority;
            res.statusCode = 200; // OK
            res.end(JSON.stringify(tasks[taskIndex]));
          }
        } catch (error) {
          res.statusCode = 400; // Bad Request
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    } else if (method === 'DELETE') {
      const taskIndex = tasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) {
        res.statusCode = 404; // Not Found
        res.end(JSON.stringify({ error: 'Task not found' }));
      } else {
        tasks.splice(taskIndex, 1);
        res.statusCode = 204; // No Content
        res.end();
      }
    } else {
      res.statusCode = 405; // Method Not Allowed
      res.end();
    }
  } else {
    res.statusCode = 404; // Not Found
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});

function validateTask(task) {
  if (typeof task.name !== 'string' || task.name.trim() === '') {
    throw new Error('Invalid task name');
  }
  if (!Number.isInteger(task.priority) || task.priority < 1 || task.priority > 5) {
    throw new Error('Invalid task priority');
  }
}
