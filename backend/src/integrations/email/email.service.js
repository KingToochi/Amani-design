import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({
    to,
    subject,
    html,
}) => {

    const { data, error } = await resend.emails.send({
        from: "AmaniSky <contact@amanisky.tech>",
        to: [to],
        subject,
        html,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

export const sendRegistrationEmails = async ({
    email,
    firstName,
    verificationUrl,
}) => {
    const safeFirstName = String(firstName || "there");

    const results = await Promise.allSettled([
        sendEmail({
            to: email,
            subject: "Welcome to AmaniSky",
            html: `<h1>Welcome to AmaniSky, ${safeFirstName}!</h1><p>Thank you for creating your account. We are glad to have you with us.</p>`,
        }),
        sendEmail({
            to: email,
            subject: "Verify your AmaniSky email address",
            html: `<h1>Verify your email address</h1><p>Please confirm that this email address belongs to you by clicking the link below:</p><p><a href="${verificationUrl}">Verify my email address</a></p><p>This link expires in 24 hours.</p>`,
        }),
    ]);

    const failedEmails = results.filter(result => result.status === "rejected");
    if (failedEmails.length > 0) {
        failedEmails.forEach(result => console.error("Registration email failed:", result.reason));
    }
};