const { setGlobalOptions } = require("firebase-functions");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();
setGlobalOptions({ maxInstances: 10, region: "asia-southeast1" });

exports.sendOrderPushNotification = onDocumentUpdated(
  "Order/{orderId}",
  async (event) => {
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
      pending: "รับออเดอร์แล้ว",
      cooking: "กำลังทำอาหาร",
      dispatched: "กำลังจัดส่ง",
      cancelled: "ถูกยกเลิก",
    };

    let messagesToSend = [];

    afterMenu.forEach((newItem) => {
      const oldItem = beforeMenu.find(
        (i) => i.cartItemId === newItem.cartItemId,
      );
      if (
        oldItem &&
        oldItem.MenuStatus !== newItem.MenuStatus &&
        statusMap[newItem.MenuStatus]
      ) {
        const menuName =
          newItem.MenuName || newItem.menuName || newItem.Name || "รายการอาหาร";
        const restaurantName =
          newItem.RestaurantName || newItem.Restaurant || "ร้านอาหาร";
        messagesToSend.push({
          title: `ออเดอร์ #${afterData.OrderNumber} อัปเดต!`,
          body: `จากร้าน ${restaurantName} เมนู "${menuName}" ${statusMap[newItem.MenuStatus]}`,
        });
      }
    });

    if (messagesToSend.length === 0) return null;

    for (const msg of messagesToSend) {
      const messagePayload = {
        notification: {
          title: msg.title,
          body: msg.body,
        },
        tokens: afterData.deviceTokens,
      };

      try {
        const response = await admin
          .messaging()
          .sendEachForMulticast(messagePayload);
        console.log(
          `Successfully sent ${response.successCount} customer messages for order ${afterData.OrderNumber}.`,
        );
      } catch (error) {
        console.error("Error sending push notification to customer:", error);
      }
    }

    return null;
  },
);
