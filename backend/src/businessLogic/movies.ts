import * as uuid from 'uuid'

import { createLogger } from '../utils/logger'
import { MovieAccess } from '../dataLayer/movieAccess'
import { MovieItem } from '../models/MovieItem'
import { CreateMovieRequest } from '../requests/CreateMovieRequest'
import { UpdateMovieRequest } from '../requests/UpdateMovieRequest'

const logger = createLogger('movies')

const movieAccess = new MovieAccess()

export async function getAllMoviesForUser(userId: string): Promise<MovieItem[]> {
  
  return movieAccess.getAllMoviesByUser(userId)
}

export async function createMovieItem(
  createMovie: CreateMovieRequest,
  userId: string): Promise<MovieItem> {
  logger.info('In createMovieItem() function')
 
  const movieId = uuid.v4()
  logger.info('User Id:' + userId)
 
  return await movieAccess.createMovie(createMovie, userId, movieId)
}

export async function updateMovieItem(
  updateMovie: UpdateMovieRequest,
  userId: string,
  movieId: string) {
  
  logger.info('in updateMovieItem() function')
  
  logger.info('User Id:' + userId)
  
  await movieAccess.updateMovie(updateMovie, userId, movieId)
}

export async function deleteMovieItem(
  userId: string,
  movieId: string) {
  logger.info('In deleteMovieItem() function')
  
  logger.info('User Id:' + userId)  
  
  await movieAccess.deleteMovie(userId, movieId)
  }
  
export async function addAttachmentUrl(userId: string, movieId: string) {
  logger.info('In addAttachmentUrl() function')
  
  const uploadUrl = await movieAccess.getUploadUrl(movieId)
  
  await movieAccess.updateAttachmentUrl(userId, movieId)
  
  return uploadUrl
  }