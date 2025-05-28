#!/usr/bin/env node

/**
 * Simple test script for email notifications using Resend API directly
 * This bypasses TypeScript compilation issues for testing
 */

const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

async function testEmailWithResend() {
  console.log("🧪 Testing Email Notifications with Resend API...\n");

  // Check environment variables
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY not found in environment variables");
    console.log("Please add RESEND_API_KEY to your .env file");
    process.exit(1);
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    console.error("❌ RESEND_FROM_EMAIL not found in environment variables");
    console.log("Please add RESEND_FROM_EMAIL to your .env file");
    process.exit(1);
  }

  console.log("✅ Environment variables found");
  console.log(`From Email: ${process.env.RESEND_FROM_EMAIL}`);
  console.log(`API Key: ${process.env.RESEND_API_KEY.substring(0, 10)}...`);
  console.log("");

  // Import Resend (assuming it's available)
  let Resend;
  try {
    const resendModule = require("resend");
    Resend = resendModule.Resend;
  } catch (error) {
    console.error(
      "❌ Could not import Resend. Make sure it's installed:",
      error.message
    );
    process.exit(1);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Test sending a simple email
  const testEmail = {
    from: process.env.RESEND_FROM_EMAIL,
    to: ["douglasswm94@gmail.com"], // Change this to your email
    subject: "Test Email from 1 Minute Shop",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Test Email</h1>
        <p>This is a test email to verify that the Resend integration is working properly.</p>
        <p>If you receive this email, the email notification system is configured correctly!</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Sent from 1 Minute Shop Email Notification System
        </p>
      </div>
    `,
  };

  try {
    console.log("📤 Sending test email...");
    const { data, error } = await resend.emails.send(testEmail);

    if (error) {
      console.error("❌ Failed to send email:", error);
      return;
    }

    console.log("✅ Test email sent successfully!");
    console.log("📧 Email ID:", data.id);
    console.log("");
    console.log("🎯 Check your email inbox for the test email.");
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
}

testEmailWithResend().catch(console.error);
