/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { setGlobalOptions } = require("firebase-functions");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();
setGlobalOptions({ maxInstances: 10, region: "asia-southeast1" });

exports.sendOrderPushNotification = onDocumentUpdated("Order/{orderId}", async (event) => {
  const IS_NOTIFICATION_ENABLED = true;
  if (!IS_NOTIFICATION_ENABLED) return null;

  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

  // For Customer: They store tokens in the Order document
  if (!afterData.deviceTokens || afterData.deviceTokens.length === 0) {
    console.log("No customer tokens found for order ", event.params.orderId);
    return null;
  }

  const beforeMenu = beforeData.Menu || [];
  const afterMenu = afterData.Menu || [];

  const statusMap = {
    'pending': 'รับออเดอร์แล้ว',
    'cooking': 'กำลังทำอาหาร',
    'dispatched': 'กำลังจัดส่ง',
    'cancelled': 'ถูกยกเลิก'
  };

  let messagesToSend = [];

  afterMenu.forEach(newItem => {
    const oldItem = beforeMenu.find(i => i.cartItemId === newItem.cartItemId);
    if (oldItem && oldItem.itemStatus !== newItem.itemStatus && statusMap[newItem.itemStatus]) {
      messagesToSend.push({
        title: `ออเดอร์ #${afterData.OrderNumber} อัปเดต!`,
        body: `เมนู "${newItem.Name}" ${statusMap[newItem.itemStatus]}`
      });
    }
  });

  if (messagesToSend.length === 0) return null;

  for (const msg of messagesToSend) {
    const messagePayload = {
      notification: {
        title: msg.title,
        body: msg.body
      },
      tokens: afterData.deviceTokens
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(messagePayload);
      console.log(`Successfully sent ${response.successCount} customer messages for order ${afterData.OrderNumber}.`);
    } catch (error) {
      console.error("Error sending push notification to customer:", error);
    }
  }
  
  return null;
});

// Notify Restaurant when a NEW order arrives
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

exports.notifyRestaurantOnNewOrder = onDocumentCreated("Order/{orderId}", async (event) => {
  const data = event.data.data();
  if (!data || !data.Menu) return null;

  // Get unique restaurants in this order
  const restaurantsInOrder = [...new Set(data.Menu.map(item => item.Restaurant))];
  
  for (const restaurantName of restaurantsInOrder) {
    try {
      // Find the restaurant document to get their tokens
      const restSnapshot = await admin.firestore()
        .collection("Restaurant")
        .where("Name", "==", restaurantName)
        .limit(1)
        .get();

      if (restSnapshot.empty) continue;

      const restData = restSnapshot.docs[0].data();
      const tokens = restData.deviceTokens || [];

      if (tokens.length > 0) {
        const payload = {
          notification: {
            title: "มีออเดอร์ใหม่! 🔔",
            body: `ออเดอร์ #${data.OrderNumber} มาถึงแล้ว กรุณาตรวจสอบรายการอาหาร`
          },
          tokens: tokens
        };
        const response = await admin.messaging().sendEachForMulticast(payload);
        console.log(`Notified restaurant "${restaurantName}" (${response.successCount} messages).`);
      }
    } catch (err) {
      console.error(`Failed to notify restaurant ${restaurantName}:`, err);
    }
  }

  return null;
});
