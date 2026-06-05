import asyncHandler from 'express-async-handler';
import ContactMessage from '../models/ContactMessage.js';
import { sendContactEmails } from '../utils/email.js';

// @desc    Submit a contact form message
// @route   POST /api/contact
// @access  Public
export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Simple validation
  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Please enter a valid email address');
  }

  // Create message record in database
  const contactMessage = await ContactMessage.create({
    name,
    email,
    subject,
    message
  });

  // Try sending emails
  try {
    await sendContactEmails({ name, email, subject, message });
  } catch (emailErr) {
    console.error('Contact form email sending failed:', emailErr.message);
    // We do NOT fail the whole request because the message was successfully saved to the database.
    // However, we can log it.
  }

  res.status(201).json({
    success: true,
    message: 'Message sent successfully. We will get back to you shortly.',
    data: contactMessage
  });
});
