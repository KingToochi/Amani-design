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

export const sendVerificationEmail = async ({ email, verificationUrl }) => {
    return sendEmail({
        to: email,
        subject: "Verify your AmaniSky email address",
        html: `<h1>Verify your email address</h1><p>Please confirm that this email address belongs to you by clicking the link below:</p><p><a href="${verificationUrl}">Verify my email address</a></p><p>This link expires in 24 hours.</p>`,
    });
};

export const changePasswordLink = async({
    email,
    firstName,
    resetPasswordUrl
}) => {
    return sendEmail({
        to : email,
        subject : "change password",
        html: `<h1> Hello ${firstName}</h1>, <h1>Click the link below to  change your password</h1> <p><a href="${resetPasswordUrl}">change password</a></p>`
    })
}

export const sendRejectionEmail = async ({
    email,
    firstName,
    updateUrl,
    rejectedFields
}) => {
    return sendEmail({
        to: email,
        subject: "Action Required: Update Your Vendor Verification Documents",
        html: `
            <h2>Hello ${firstName},</h2>

            <p>
                Your application to join AmaniSky Fashion as a vendor
                could not be approved because your ${rejectedFields}
                did not meet our verification requirements.
            </p>

            <p>
                Please review and update the affected document(s)
                using the link below.
            </p>

            <p>
                <a href="${updateUrl}">Update Your Documents</a>
            </p>

            <p>
                Thank you for choosing AmaniSky Fashion.
            </p>
        `
    });
};

export const sendApprovalEmail = async ({ email, firstName }) => {
    return sendEmail({
        to: email,
        subject: "Congratulations! Your Vendor Application Has Been Approved",
        html: `
            <h2>Hello ${firstName},</h2>

            <p>
                Congratulations! Your application to join
                AmaniSky Fashion as a vendor has been approved.
            </p>

            <p>
                You can now access your vendor account and start
                selling on AmaniSky Fashion.
            </p>

            <p>Thank you for choosing AmaniSky.</p>
        `
    });
};

export const sendSuccessfulPaymentEmail = async({fname,email, paidAmount}) => {
    
}
