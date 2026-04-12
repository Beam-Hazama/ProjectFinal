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
  // FEATURE FLAG: เปลี่ยนเป็น true หากต้องการเปิดระบบแจ้งเตือนกะพริบ
  const IS_NOTIFICATION_ENABLED = false;
  if (!IS_NOTIFICATION_ENABLED) return null;

  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

  if (!afterData.deviceTokens || afterData.deviceTokens.length === 0) {
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
    const oldItem = beforeMenu.find(i => i.id === newItem.id);
    // If status changed and is one of the target statuses
    if (oldItem && oldItem.itemStatus !== newItem.itemStatus && statusMap[newItem.itemStatus]) {
      messagesToSend.push({
        title: `ออเดอร์ #${afterData.OrderNumber} อัปเดต!`,
        body: `เมนู "${newItem.Name}" ${statusMap[newItem.itemStatus]}`
      });
    }
  });

  if (messagesToSend.length === 0) {
    return null;
  }

  // Send the first relevant message to all tokens
  const messagePayload = {
    notification: {
      title: messagesToSend[0].title,
      body: messagesToSend[0].body
    },
    tokens: afterData.deviceTokens
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(messagePayload);
    console.log(`Successfully sent ${response.successCount} messages.`);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
  
  return null;
});
