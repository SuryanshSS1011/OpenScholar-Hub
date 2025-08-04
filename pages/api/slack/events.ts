import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { type, challenge } = req.body;

  // Handle Slack URL verification
  if (type === 'url_verification') {
    return res.status(200).json({ challenge });
  }

  // Handle other Slack events
  if (type === 'event_callback') {
    // Process the event
    console.log('Received Slack event:', req.body);
    return res.status(200).json({ ok: true });
  }

  res.status(400).json({ message: 'Invalid event type' });
}
