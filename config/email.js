
const transporter = {
    async sendMail(mailOptions) {
        try {
            const response = await fetch(
                'https://api.brevo.com/v3/smtp/email',
                {
                    method: 'POST',
                    headers: {
                        accept: 'application/json',
                        'api-key': process.env.BREVO_API_KEY,
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        sender: {
                            name: process.env.BREVO_SENDER_NAME || 'VELAURA',
                            email: process.env.BREVO_SENDER_EMAIL
                        },
                        to: [
                            {
                                email: mailOptions.to
                            }
                        ],
                        subject: mailOptions.subject,
                        htmlContent: mailOptions.html,
                        textContent: mailOptions.text
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                console.error('BREVO API ERROR:', result);

                throw new Error(
                    result.message || 'Failed to send email'
                );
            }

            console.log('OTP EMAIL SENT:', result.messageId);

            return {
                messageId: result.messageId,
                response: 'Email sent successfully'
            };

        } catch (error) {
            console.error('BREVO EMAIL ERROR:', error.message);
            throw error;
        }
    }
};

module.exports = transporter;
