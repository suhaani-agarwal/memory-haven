// pages/api/send-alert.js
// import twilio from 'twilio';

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = twilio(accountSid, authToken);

// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     const { to, message } = req.body;

//     try {
//       const sms = await client.messages.create({
//         body: message,
//         from: process.env.TWILIO_PHONE_NUMBER,
//         to: to,
//       });

//       res.status(200).json({ success: true, message: 'SMS sent successfully.' });
//     } catch (error) {
//       console.error('Error sending SMS:', error);
//       res.status(500).json({ success: false, message: 'Failed to send SMS.' });
//     }
//   } else {
//     res.status(405).json({ message: 'Method not allowed' });
//   }
// }


// pages/api/send-alert.js
import twilio from 'twilio';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle POST request
  if (req.method === 'POST') {
    const { to, message } = req.body;

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      return res.status(500).json({ 
        success: false, 
        message: 'Twilio credentials are not properly configured' 
      });
    }

    try {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const sms = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });

      return res.status(200).json({ 
        success: true, 
        message: 'SMS sent successfully',
        messageId: sms.sid 
      });
    } catch (error) {
      console.error('Twilio Error:', error);
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to send SMS' 
      });
    }
  }

  // Handle any other HTTP method
  return res.status(405).json({ 
    success: false, 
    message: 'Method not allowed' 
  });
}