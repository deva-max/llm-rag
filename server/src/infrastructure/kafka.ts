import { Kafka, Producer, Consumer, logLevel } from 'kafkajs'
import { AppConfig } from '@/config'

export interface KafkaEventLog {
  id: string
  topic: string
  payload: any
  timestamp: string
  status: 'published' | 'processed' | 'fallback'
}

const eventLogs: KafkaEventLog[] = []

let kafkaClient: Kafka | null = null
let kafkaProducer: Producer | null = null
let kafkaConsumer: Consumer | null = null
let isConnected = false

export function getKafkaLogs(): KafkaEventLog[] {
  return eventLogs
}

/**
 * Initializes Kafka client and starts producer/consumer loops.
 * Falls back gracefully to internal event emitter when Kafka broker is unreachable.
 */
export async function initKafka(): Promise<boolean> {
  const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')

  // Silence partitioner warning
  process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1'

  try {
    kafkaClient = new Kafka({
      clientId: 'memory-context-rag-engine',
      brokers,
      logLevel: logLevel.NOTHING,
      retry: {
        retries: 0
      }
    })

    kafkaProducer = kafkaClient.producer()
    await kafkaProducer.connect()

    kafkaConsumer = kafkaClient.consumer({ groupId: 'rag-workers-group' })
    await kafkaConsumer.connect()

    // Subscribe to topics
    await kafkaConsumer.subscribe({ topics: ['rag.ingest', 'memory.extract', 'search.audit'], fromBeginning: false })

    // Start background processing worker loop
    await kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const payload = message.value ? JSON.parse(message.value.toString()) : {}
        console.log(`[Kafka Consumer] Processed event on topic "${topic}":`, payload)

        eventLogs.unshift({
          id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          topic,
          payload,
          timestamp: new Date().toISOString(),
          status: 'processed'
        })

        if (eventLogs.length > 50) eventLogs.pop()
      }
    })

    isConnected = true
    console.log(`✅ Kafka Broker connected successfully on ${brokers.join(', ')}`)
    return true
  } catch (err: any) {
    console.log(`ℹ️  Running without Kafka. Using local in-memory event stream fallback.`)
    isConnected = false
    return false
  }
}

/**
 * Produces an event to a Kafka topic.
 */
export async function publishKafkaEvent(topic: string, payload: any): Promise<boolean> {
  const eventRecord: KafkaEventLog = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    topic,
    payload,
    timestamp: new Date().toISOString(),
    status: isConnected ? 'published' : 'fallback'
  }

  eventLogs.unshift(eventRecord)
  if (eventLogs.length > 50) eventLogs.pop()

  if (isConnected && kafkaProducer) {
    try {
      await kafkaProducer.send({
        topic,
        messages: [{ value: JSON.stringify(payload) }]
      })
      return true
    } catch (err) {
      console.warn(`Failed to publish event to Kafka topic ${topic}:`, err)
    }
  }

  return false
}

export function isKafkaConnected(): boolean {
  return isConnected
}
