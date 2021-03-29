import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoAccess } from '../dataLayer/todosAccess'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'

const logger = createLogger('todos')

const todoAccess = new TodoAccess()

export async function getAllTodosForUser(userId: string): Promise<TodoItem[]> {
  
  return todoAccess.getAllTodosByUser(userId)
}

export async function createTodoItem(
  createTodo: CreateTodoRequest,
  userId: string): Promise<TodoItem> {
  logger.info('In createTodoItem() function')
 
  const todoId = uuid.v4()
  logger.info('User Id:' + userId)
 
  return await todoAccess.createTodo(createTodo, userId, todoId)
}

export async function updateTodoItem(
  updateTodo: UpdateTodoRequest,
  userId: string,
  todoId: string) {
  
  logger.info('in updateTodoItem() function')
  
  logger.info('User Id:' + userId)
  
  await todoAccess.updateTodo(updateTodo, userId, todoId)
}

export async function deleteTodoItem(
  userId: string,
  todoId: string) {
  logger.info('In deleteTodoItem() function')
  
  logger.info('User Id:' + userId)  
  
  await todoAccess.deleteTodo(userId, todoId)
  }
  
export async function addAttachmentUrl(userId: string, todoId: string) {
  logger.info('In addAttachmentUrl() function')
  
  const uploadUrl = await todoAccess.getUploadUrl(todoId)
  
  await todoAccess.updateAttachmentUrl(userId, todoId)
  
  return uploadUrl
  }