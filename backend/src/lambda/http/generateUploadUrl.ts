import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { addAttachmentUrl } from '../../businessLogic/movies'

const logger = createLogger('uploadUrl-movie')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const movieId = event.pathParameters.movieId
    const userId = getUserId(event)
    const uploadUrl = await addAttachmentUrl(userId, movieId)
  
    // TODO: Return a presigned URL to upload a file for a Movie item with the provided id
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl
      })
    }
  } catch (e) {
    logger.error('Error: ' + e.message)
    
    return {
      statusCode: 500,
      body: e.message
    }
  }
}