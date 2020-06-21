export const messaging = {
  host: process.env.RABBITMQ_HOST || 'amqp://localhost?connection_timeout=30',
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
