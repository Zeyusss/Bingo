import * as dotenv from "dotenv";
dotenv.config();

import { kafka } from "@packages/utils/kafka";
import {
  updateUserAnalytics,
  updateShopAnalytics,
} from "./services/analytics.service";

const consumer = kafka.consumer({ groupId: "user-events-group" });

const eventQueue: any[] = [];

let isProcessing = false;
const processQueue = async () => {
  if (isProcessing || eventQueue.length === 0) return;
  isProcessing = true;
  const events = [...eventQueue];
  eventQueue.length = 0;
  try {
    for (const event of events) {
      if (event.action === "shop_visit") {
        try {
          await updateShopAnalytics(event);
        } catch (error) {
          console.error("Error processing shop analytics:", error);
        }
      }
      const validActions = [
        "add_to_wishlist",
        "add_to_cart",
        "product_view",
        "remove_from_cart",
        "remove_from_wishlist",
        "purchase",
      ];
      if (!event.action || !validActions.includes(event.action)) {
        continue;
      }
      try {
        await updateUserAnalytics(event);
      } catch (error) {
        console.error("Error processing event:", error);
      }
    }
  } finally {
    isProcessing = false;
  }
};

setInterval(processQueue, 3000); // 3 sec

//kafka consumer
export const consumeKafkaMessages = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "users-events", fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString());
      eventQueue.push(event);
    },
  });
};

consumeKafkaMessages().catch(console.error);
