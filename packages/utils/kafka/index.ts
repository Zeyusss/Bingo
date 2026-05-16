import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "kafka-service",
  brokers: [
    "d83ls1hto7lor6koghug.any.us-east-1.mpx.prd.cloud.redpanda.com:9092",
  ],
  ssl: true,
  sasl: {
    mechanism: "scram-sha-256",
    username: process.env.KAFKA_API_KEY!,
    password: process.env.KAFKA_API_SECRET!,
  },
});
