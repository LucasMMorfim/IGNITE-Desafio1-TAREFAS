import { randomUUID } from 'node:crypto';
import { Database } from "./database.js"
import { buildRoutePath } from '../utils/build-route-path.js';
import { format } from 'date-fns';

const database = new Database()

const timeZone = 'America/Sao_Paulo'; // Fuso horário brasileiro

// LISTA TODAS AS TASKS

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select('tasks', search ? {
        title: search,
        description: search
      } : null )

      return res.end(JSON.stringify(tasks))
    }
  },


// INSERE UMA TASKS

  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const {title, description} = req.body

      if (!title) {
        return res.writeHead(400).end(
          JSON.stringify({ message: 'title is required' }),
        )
      }

      if (!description) {
        return res.writeHead(400).end(
          JSON.stringify({message: 'description is required' })
        )
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        created_at: format(new Date(), "yyyy/MM/dd HH:mm:ss", { timeZone }),
        completed_at: null,
        updated_at: null,
      }
  
      database.insert('tasks', task)
  
      return res.writeHead(201).end(JSON.stringify({message: 'Registered successfully' })
      )
    }
  },


// DELETA UMA TASK

  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const [task] = database.select('tasks', { id })

      if (!task) {
        return res.writeHead(404).end('non-existent task')
      }

      database.delete('tasks', id)

      return res.writeHead(200).end(JSON.stringify({message: 'Successfully deleted' })
      )
    }
  },


// EDITA UMA TASK

  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { title, description, completed_at, created_at} = req.body

      if (!title || !description) {
        return res.writeHead(400).end(
          JSON.stringify({ message: 'title or description are required' })
        )
      }

      const [task] = database.select('tasks', { id })

      if (!task) {
        return res.writeHead(404).end('non-existent task')
      }

      database.update('tasks', id, {
        title,
        description,
        created_at,
        completed_at,
        updated_at: format(new Date(), "yyyy/MM/dd HH:mm:ss", { timeZone }),
      })

      return res.end(JSON.stringify({ message: 'Successfully edited   -    para esta mensagem aparecer o status code teve que ser 200' })
      )
    }
  },


  // EDITA UMA TASK

  
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id'),
    handler: async (req, res) => {
      const { id } = req.params;
      const { title, description, completed_at } = req.body;
  
      try {
        const task = await database.select('tasks', { id });
  
        if (!task) {
          return res.writeHead(404).end('non-existent task');
        }
  
        const updatedData = {
          title: title !== undefined ? title : task.title,
          description,
          completed_at,
          updated_at: format(new Date(), "yyyy/MM/dd HH:mm:ss", { timeZone }),
        };
  
        database.patch('tasks', id, updatedData);
  
        return res.end(JSON.stringify({ message: 'Successfully edited   -    para esta mensagem aparecer o status code teve que ser 200' }));
      } catch (error) {
        console.error(error);
        return res.writeHead(500).end('error updating task');
      }
    }
  }
]