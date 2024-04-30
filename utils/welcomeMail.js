const welcomeMail = (username) => {
    return `
    <html>
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ChessHub</title>
        <style>
        .container {
            background: linear-gradient(to right, rgb(8, 27, 27), rgb(26, 35, 26));
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 0 10px rgba(245, 244, 244, 0.1);
            max-width: 90vw;
            width: 100%;
            text-align: center;
            margin: 0px;
        }   
    </style>
    </head>
    
    <body style=" font-family: 'Arial', sans-serif; color: white; margin: 0; padding: 0; font-size: 16px;">
        <div class="container">
            <div style="font-size: 1.5rem; line-height: 2rem; margin-bottom: 10px;">Dear ${username},</div>
    
            <div style="text-align: justify; margin-bottom: 20px;">Welcome to ChessHub! We're excited to have you join our community of chess enthusiasts and players from around the world. Whether you're a beginner or a seasoned player, ChessHub is here to provide you with a fantastic chess experience.</div>
    
            <div style="margin-bottom: 10px;">Explore Chess Games: Dive into our collection of chess games. You can play against the computer, play offline, or challenge other players online.</div>
    
            <div style="margin-bottom: 10px;">Learn and Improve: Check out our resources for learning chess strategies, tactics, and tips. Improve your skills and climb the ranks!</div>
    
            <div style="margin-bottom: 10px;">Connect with the Community: Engage with fellow chess lovers in our forums, chat rooms, and social media channels. Share your experiences, ask questions, and make new friends.</div>
    
            <div style="margin-bottom: 10px;">Customize Your Profile: Personalize your ChessHub profile with your avatar, bio, and favorite chess openings. Let others know about your chess style!</div>
    
            <div style="margin-bottom: 10px;">Stay Updated: Keep an eye on your inbox for updates on new features, and chess news. We'll make sure you're always in the loop.</div>
    
            <div style="text-align: justify; margin-bottom: 20px;">If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:chesshub.authentication@gmail.com" style="color: #ffd700; text-decoration: none;">chesshub.authentication@gmail.com</a>. We're here to help you make the most out of your chess journey on ChessHub.</div>
    
            <div style="text-align: justify; margin-bottom: 20px;">Once again, welcome to ChessHub! Get ready to experience the thrill of chess like never before.</div>
    
            <div style="width: 100%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <a href="https://www.chesshub.top" style="display: inline-block; padding: 10px 20px; background-color: #ffd700; color: #000; text-decoration: none; border-radius: 5px; transition: background-color 0.3s ease;" target="_blank" rel="noopener noreferrer">Visit ChessHub</a>
            </div>
    
            <div style="font-size: 1.5rem;">Best regards,</div>
            <div>ChessHub Team</div>
        </div>
    </body>
    
    </html>`;
}

module.exports = welcomeMail;