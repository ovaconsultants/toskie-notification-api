const express = require('express');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
var serviceAccount = require('./firebaseServiceAccountKey.json'); // Path to your service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(express.json());

// POST /send-notification
// Expected JSON payload:
// {
//   "token": "device_fcm_token_here",
//   "title": "Notification Title",
//   "body": "Notification Body",
//   "data": {
//     "key1": "value1",
//     "key2": "value2"
//   }
// }

app.post('/send-notification', async (req, res) => {
  try {
    const { token, title, body, data } = req.body;
    if (!token || !title || !body) {
      return res.status(400).json({ error: 'Missing required fields: token, title, body.' });
    }

    const message = {
      token: token,
      notification: {
        title: title,
        body: body
      },
      // 'data' field is optional. You can remove it if you have no custom data.
      // data payload is typically for background processing on the client side
      data: data || {}
    };

    // Send a message to the device corresponding to the provided token.
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return res.json({ success: true, response });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to send notification', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
