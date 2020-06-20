export const messaging = {
  host: process.env.RABBITMQ_HOST || 'amqp://localhost',
  media: {
    fanoutExchange: 'media',
    queues: {
      encodeVideo: 'encode-video',
    },
    routingKeys: {
      encodingJobAdded: 'encoding-job-added',
    },
  },
}
