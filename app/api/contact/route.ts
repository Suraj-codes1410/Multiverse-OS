import { NextResponse } from 'next/server';

// Initialize global rate-limiting storage across requests
const globalAny = global as any;
if (!globalAny.contactRateLimits) {
  globalAny.contactRateLimits = new Map<string, number>();
}

export async function POST(req: Request) {
  console.log("========== CONTACT API HIT ==========");
  
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, subject, message, honeypot } = body;

    // 1. Spam protection - Honeypot trigger
    if (honeypot && typeof honeypot === 'string' && honeypot.trim() !== '') {
      console.warn("SPAM_PROTECTION: Bot detected via honeypot. Simulating successful message submission.");
      return NextResponse.json({ success: true, message: 'Message sent successfully.' });
    }

    // 2. Validation: Required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'Name is required.' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'Email address is required.' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'Message payload is required.' }, { status: 400 });
    }

    // 3. Validation: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'Invalid email address format.' }, { status: 400 });
    }

    // 4. Validation: Character lengths
    if (name.length > 100) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'Name must not exceed 100 characters.' }, { status: 400 });
    }
    if (subject && typeof subject === 'string' && subject.length > 150) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'Subject must not exceed 150 characters.' }, { status: 400 });
    }
    if (message.length < 10) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'Message must be at least 10 characters long.' }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'VALIDATION_ERROR', message: 'Message must not exceed 5000 characters.' }, { status: 400 });
    }

    // 5. Rate limiting: 60 seconds per IP or email
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown-ip';
    const now = Date.now();
    
    const lastIpTime = globalAny.contactRateLimits.get(ip);
    if (lastIpTime && now - lastIpTime < 60000) {
      const waitTime = Math.ceil((60000 - (now - lastIpTime)) / 1000);
      return NextResponse.json({ 
        error: 'RATE_LIMIT_EXCEEDED', 
        message: `Rate limit exceeded. Please wait ${waitTime} seconds before sending another message.` 
      }, { status: 429 });
    }

    const lastEmailTime = globalAny.contactRateLimits.get(email.toLowerCase().trim());
    if (lastEmailTime && now - lastEmailTime < 60000) {
      const waitTime = Math.ceil((60000 - (now - lastEmailTime)) / 1000);
      return NextResponse.json({ 
        error: 'RATE_LIMIT_EXCEEDED', 
        message: `Rate limit exceeded. Please wait ${waitTime} seconds before sending another message.` 
      }, { status: 429 });
    }

    // Update timestamps
    globalAny.contactRateLimits.set(ip, now);
    globalAny.contactRateLimits.set(email.toLowerCase().trim(), now);

    // 6. Resend Email Dispatch
    const resendApiKey = process.env.RESEND_API_KEY;
    const recipientEmail = process.env.CONTACT_EMAIL || 'samantasuraj1410@gmail.com';

    if (!resendApiKey) {
      console.warn("VERCEL_COMPATIBLE: RESEND_API_KEY is not configured. Simulating mail delivery in development mode.");
      console.log(`[SIMULATED EMAIL TO ${recipientEmail}]:
Subject: New Portfolio Contact: ${subject || 'No Subject'}
Body:
New Portfolio Contact

Name: ${name}
Email: ${email}
Subject: ${subject || 'N/A'}
Message: ${message}
Timestamp: ${new Date(now).toISOString()}`);
      
      console.log(`[SIMULATED AUTO-REPLY TO ${email}]:
Subject: Message Received
Body:
Thank you for contacting Suraj Samanta.
Your message has been received and I will respond as soon as possible.`);

      return NextResponse.json({ success: true, message: 'Message sent successfully (simulated).' });
    }

    // Send notification email to owner
    const ownerEmailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: recipientEmail,
        subject: `New Portfolio Contact: ${subject || 'No Subject'}`,
        text: `New Portfolio Contact\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject || 'N/A'}\nMessage: ${message}\nTimestamp: ${new Date(now).toISOString()}`
      })
    });

    if (!ownerEmailRes.ok) {
      const errText = await ownerEmailRes.text();
      console.error('Failed to send notification email via Resend:', errText);
      return NextResponse.json({ error: 'EMAIL_DISPATCH_FAILURE', message: 'Failed to deliver message via email service.' }, { status: 502 });
    }

    // Try sending automatic acknowledgement email to sender
    // Free tiers with unverified onboarding domains will fail to send to external addresses, 
    // so we catch and ignore errors here to avoid impacting form submission success.
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'Portfolio Auto-Reply <onboarding@resend.dev>',
          to: email.trim(),
          subject: 'Message Received',
          text: `Thank you for contacting Suraj Samanta.\nYour message has been received and I will respond as soon as possible.`
        })
      });
      console.log(`Auto-acknowledgement email triggered successfully for ${email}`);
    } catch (autoErr) {
      console.warn('Auto-acknowledgement email could not be sent to external recipient:', autoErr);
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully.' });
  } catch (error: any) {
    console.error('Error in Contact API route:', error);
    return NextResponse.json({ error: 'SERVER_ERROR', message: error.message || 'Internal server error occurred.' }, { status: 500 });
  }
}
