import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
    to,
    subject,
    html,
    from,
}: {
    to: string;
    subject: string;
    html: string;
    from?: string;
}) {
    try {
        const { error } = await resend.emails.send({
            from: from ?? 'SalonFlow Bookings <bookings@salonflow.xyz>',
            to,
            subject,
            html,
        });

        if (error) {
            console.error('Email send error:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Email error:', err);
        return false;
    }
}
