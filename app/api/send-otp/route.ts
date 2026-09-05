import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { email } = await request.json();
    
    // ৬ ডিজিটের র্যান্ডম ওটিপি জেনারেট
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ডাটাবেসে OTP সেভ করা
    await supabase.from('email_otps').insert([{ email, otp }]);

    // প্রিমিয়াম ইমেইল টেমপ্লেট
    const { error } = await resend.emails.send({
      from: 'NovaChat <noreply@linkys.2bd.net>', // লাইভ ডোমেইন থাকলে এখানে পরিবর্তন করবেন
      to: email,
      subject: 'Verification Code - NovaChat',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #020205; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #020205; padding: 50px 20px;">
            <tr>
              <td align="center">
                <!-- Main Card -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #0a0a14; border-radius: 24px; border: 1px solid #1e1e2e; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                  
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 40px 20px 20px 20px;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: -1px;">
                        Nova<span style="color: #6366f1;">Chat</span>
                      </h1>
                    </td>
                  </tr>

                  <!-- Title & Message -->
                  <tr>
                    <td align="center" style="padding: 10px 40px 30px 40px;">
                      <h2 style="margin: 0 0 15px 0; color: #e2e8f0; font-size: 22px; font-weight: 600;">Verify your email</h2>
                      <p style="margin: 0; color: #94a3b8; font-size: 15px; line-height: 1.6;">
                        You are almost ready to join the futuristic conversation. Please use the verification code below to complete your setup.
                      </p>
                    </td>
                  </tr>

                  <!-- OTP Box -->
                  <tr>
                    <td align="center" style="padding: 10px 40px 40px 40px;">
                      <div style="background-color: #12121e; border: 1px solid #2d2d44; border-radius: 16px; padding: 24px 30px; display: inline-block;">
                        <span style="font-family: monospace; font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #818cf8; margin-right: -12px;">${otp}</span>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer / Disclaimer -->
                  <tr>
                    <td align="center" style="padding: 0 40px 40px 40px;">
                      <p style="margin: 0 0 15px 0; color: #64748b; font-size: 13px;">
                        This code will expire in 10 minutes. If you did not request this email, you can safely ignore it.
                      </p>
                      <hr style="border: none; border-top: 1px solid #1e1e2e; margin: 20px 0;" />
                      <p style="margin: 0; color: #475569; font-size: 12px;">
                        &copy; ${new Date().getFullYear()} NovaChat. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
