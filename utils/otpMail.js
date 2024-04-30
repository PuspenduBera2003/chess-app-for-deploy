const otpMail = (otp, username) => {
    return `
<html>
<head>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #2b2927;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            width: 100vw;
        }

        .container {
            background: linear-gradient(to right, rgb(8, 27, 27), rgb(26, 35, 26));
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 0 10px rgba(245, 244, 244, 0.1);
            max-width: 90vw;
            width: 100%;
            text-align: center;
            margin: 10px;
        }

        h2 {
            color: #f4f4f4;
        }

        p {
            color: #b4b2b2;
            margin-bottom: 20px;
        }

        .otp-code {
            font-size: 24px;
            font-weight: bold;
            color: #f9fdfa;
        }

        img {
            margin-top: 15px;
            width: 100px;
            height: auto;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://i.ibb.co/q0pYdhH/king.png" alt="king">
        <h2>Your One-Time Password (OTP)</h2>
        <p>Dear ${username},</p>
        <p>You have requested a One-Time Password (OTP) to verify your identity. Please find your OTP below:</p>
        <p class="otp-code">${otp}</p>
        <p>This OTP is valid for 5 minutes only and is intended for a single use only. Do not share this OTP with anyone for security reasons.</p>
        <p>If you did not request this OTP, please ignore this email.</p>
        <p>Thank you for using our services.</p>
        <p>Best regards,<br><b>CHESSHUB</b></p>
    </div>
</body>
</html>`
}

module.exports = otpMail;