const sendEmail = async ({
    to,
    subject,
    html,
    attachments = []
}) => {

    const body = {
        from: process.env.SENDLIB_FROM_EMAIL,
        to,
        subject,
        html
    };

    if (attachments.length > 0) {
        body.attachments = attachments;
    }

    const response = await fetch(
        "https://sendlib.samueltuoyo.com/api/send",
        {
            method: "POST",
            headers: {
                "Authorization":
                    `Bearer ${process.env.SENDLIB_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error("Sendlib API Error:", data);

        throw new Error(
            data.message || "Failed to send email"
        );
    }

    return data;
};

module.exports = { sendEmail };