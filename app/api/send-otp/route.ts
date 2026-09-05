import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    // ৬ ডিজিটের র্যান্ডম ওটিপি জেনারেট
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ১. ডাটাবেসে OTP সেভ করা
    await supabase.from('email_otps').insert([{ email, otp }]);

    // ২. Resend এর মাধ্যমে ইমেইল পাঠানো
    const { error } = await resend.emails.send({
      from: 'NovaChat <onboarding@resend.dev>', // Resend-এর ডিফল্ট টেস্টিং ইমেইল
      to: email,
      subject: 'Verification Code - NovaChat',
      html: `
        <div style="font-family: sans-serif; text-align: center; padding: 40px; background: #05050f; color: #fff;">
          <h2 style="color: #6366f1;">NovaChat Verification</h2>
          <p style="color: #a5b4fc;">Your verification code is:</p>
          <div style="font-size: 42px; font-weight: 800; letter-spacing: 10px; color: #fff; background: #1e1e2e; padding: 20px; border-radius: 16px; margin: 20px 0; border: 1px solid #313146; display: inline-block;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 13px;">This code will expire soon. Please do not share it.</p>
        </div>
      `,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
