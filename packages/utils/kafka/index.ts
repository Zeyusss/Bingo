import {Kafka} from "kafkajs";

export const kafka = new Kafka({
    clientId : "kafka-service",
    brokers : ["d2d8t4d6crocq0g2oco0.any.eu-central-1.mpx.prd.cloud.redpanda.com:9092"],
    ssl:true,
    sasl:{
        mechanism:"scram-sha-256",
        username: process.env.KAFKA_API_KEY!,
        password: process.env.KAFKA_API_SECRET!,
    },
})