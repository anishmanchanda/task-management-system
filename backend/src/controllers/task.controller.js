import * as taskService from '../services/task.service.js';
import { HttpError } from '../utils/httpError.js';

function notFound(id) {
  return new HttpError(404, `Task ${id} not found`);
}

export function list(_req, res) {
  res.json(taskService.listTasks(res.locals.query));
}

export function get(req, res) {
  const task = taskService.getTask(req.params.id);
  if (!task) throw notFound(req.params.id);
  res.json({ data: task });
}

export function create(req, res) {
  res.status(201).json({ data: taskService.createTask(req.body) });
}

export function update(req, res) {
  const task = taskService.updateTask(req.params.id, req.body);
  if (!task) throw notFound(req.params.id);
  res.json({ data: task });
}

export function remove(req, res) {
  const task = taskService.deleteTask(req.params.id);
  if (!task) throw notFound(req.params.id);
  res.json({ data: task, message: 'Task deleted' });
}
