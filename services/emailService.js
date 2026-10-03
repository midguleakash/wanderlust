const sendEmail = async ({ to, subject, html }) => {
    const response = await fetch("https://sendlib.samueltuoyo.com/api/send", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.SENDLIB_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: process.env.SENDLIB_FROM_EMAIL,
            to,
            subject,
            html
        })
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Sendlib API Error:", data);
        throw new Error(data.message || "Failed to send email");
    }

    

    return data;
};

module.exports = { sendEmail };