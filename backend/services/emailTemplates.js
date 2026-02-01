export const contestNotificationTemplate = (contestData, studentName, isPublic = false) => {
    const { title, description, startTime, endTime, duration } = contestData;
    
    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });
    };

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contest Notification</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                line-height: 1.6;
                color: hsl(222.2, 84%, 4.9%);
                background-color: hsl(0, 0%, 98%);
                padding: 20px;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: hsl(0, 0%, 100%);
                border-radius: 12px;
                border: 1px solid hsl(214.3, 31.8%, 91.4%);
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, hsl(222.2, 47.4%, 11.2%) 0%, hsl(215.4, 16.3%, 46.9%) 100%);
                color: hsl(210, 40%, 98%);
                padding: 32px 24px;
                text-align: center;
            }
            
            .logo {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
                letter-spacing: -0.025em;
            }
            
            .header-subtitle {
                font-size: 16px;
                opacity: 0.9;
                font-weight: 500;
            }
            
            .content {
                padding: 32px 24px;
            }
            
            .greeting {
                font-size: 16px;
                margin-bottom: 24px;
                color: hsl(222.2, 84%, 4.9%);
            }
            
            .contest-title {
                font-size: 24px;
                font-weight: 700;
                color: hsl(222.2, 84%, 4.9%);
                margin: 24px 0;
                padding: 20px;
                background-color: hsl(210, 40%, 98%);
                border: 1px solid hsl(214.3, 31.8%, 91.4%);
                border-radius: 8px;
                text-align: center;
                letter-spacing: -0.025em;
            }
            
            .contest-info {
                background-color: hsl(210, 40%, 98%);
                border: 1px solid hsl(214.3, 31.8%, 91.4%);
                border-radius: 8px;
                padding: 24px;
                margin: 24px 0;
            }
            
            .info-grid {
                display: grid;
                gap: 16px;
            }
            
            .info-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid hsl(214.3, 31.8%, 91.4%);
            }
            
            .info-item:last-child {
                border-bottom: none;
            }
            
            .info-label {
                font-weight: 600;
                color: hsl(222.2, 84%, 4.9%);
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
            }
            
            .info-value {
                color: hsl(215.4, 16.3%, 46.9%);
                font-weight: 500;
                text-align: right;
                font-size: 14px;
            }
            
            .description-section {
                background-color: hsl(47.9, 95.8%, 53.1%, 0.1);
                border: 1px solid hsl(47.9, 95.8%, 53.1%, 0.2);
                border-radius: 8px;
                padding: 20px;
                margin: 24px 0;
            }
            
            .description-title {
                font-weight: 600;
                color: hsl(222.2, 84%, 4.9%);
                margin-bottom: 12px;
                font-size: 16px;
            }
            
            .description-text {
                color: hsl(215.4, 16.3%, 46.9%);
                line-height: 1.6;
            }
            
            .cta-button {
                display: inline-block;
                background-color: hsl(222.2, 47.4%, 11.2%);
                color: hsl(210, 40%, 98%);
                padding: 10px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 500;
                text-align: center;
                margin: 24px auto;
                display: block;
                width: fit-content;
                transition: all 0.2s ease;
                font-size: 14px;
                letter-spacing: -0.025em;
                border: 1px solid hsl(214.3, 31.8%, 91.4%);
            }
            
            .cta-button:hover {
                background-color: hsl(222.2, 47.4%, 11.2%, 0.9);
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .instructions {
                background-color: hsl(210, 40%, 98%);
                border: 1px solid hsl(214.3, 31.8%, 91.4%);
                border-radius: 8px;
                padding: 20px;
                margin: 24px 0;
            }
            
            .instructions-title {
                color: hsl(222.2, 84%, 4.9%);
                font-weight: 600;
                margin-bottom: 12px;
                font-size: 16px;
            }
            
            .instructions-list {
                color: hsl(215.4, 16.3%, 46.9%);
                margin: 0;
                padding-left: 20px;
            }
            
            .instructions-list li {
                margin-bottom: 8px;
                line-height: 1.5;
            }
            
            .footer {
                background-color: hsl(210, 40%, 98%);
                padding: 24px;
                text-align: center;
                border-top: 1px solid hsl(214.3, 31.8%, 91.4%);
            }
            
            .footer-text {
                color: hsl(215.4, 16.3%, 46.9%);
                font-size: 14px;
                margin-bottom: 8px;
            }
            
            .footer-highlight {
                font-weight: 600;
                color: hsl(222.2, 84%, 4.9%);
                margin-top: 16px;
            }
            
            .badge {
                background-color: hsl(47.9, 95.8%, 53.1%);
                color: hsl(222.2, 84%, 4.9%);
                padding: 4px 12px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .public-badge {
                background-color: hsl(142.1, 76.2%, 36.3%);
                color: hsl(210, 40%, 98%);
                padding: 4px 12px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            @media (max-width: 600px) {
                body {
                    padding: 10px;
                }
                
                .content {
                    padding: 24px 16px;
                }
                
                .header {
                    padding: 24px 16px;
                }
                
                .contest-title {
                    font-size: 20px;
                    padding: 16px;
                }
                
                .info-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                }
                
                .info-value {
                    text-align: left;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏆 Code-E-Pariksha</div>
                <div class="header-subtitle">New Contest Notification</div>
            </div>

            <div class="content">
                <div class="greeting">
                    Hello <strong>${studentName}</strong>,
                </div>
                
                <p>${isPublic ? 'A new public programming contest is now available for everyone!' : 'You have been invited to participate in a new programming contest!'}</p>

                <div class="contest-title">
                    ${title}
                </div>

                <div class="contest-info">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">📅 Start Time</span>
                            <span class="info-value">${formatDate(startTime)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">⏰ End Time</span>
                            <span class="info-value">${formatDate(endTime)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">⏱️ Duration</span>
                            <span class="info-value">${duration} minutes</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">🎯 Type</span>
                            <span class="info-value">
                                ${isPublic ? 
                                    '<span class="public-badge">Public Contest</span>' : 
                                    '<span class="badge">Private Contest</span>'
                                }
                            </span>
                        </div>
                    </div>
                </div>

                ${description ? `
                <div class="description-section">
                    <div class="description-title">📝 Contest Description</div>
                    <div class="description-text">${description}</div>
                </div>
                ` : ''}

                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/contests" class="cta-button">
                    View Contest & Register
                </a>

                <div class="instructions">
                    <div class="instructions-title">📋 What to do next:</div>
                    <ul class="instructions-list">
                        <li>Click the button above to view the contest details</li>
                        <li>Register for the contest before it starts</li>
                        <li>Prepare your coding environment</li>
                        <li>Join on time and give your best effort!</li>
                    </ul>
                </div>
            </div>

            <div class="footer">
                <div class="footer-text">This is an automated notification from Code-E-Pariksha.</div>
                <div class="footer-text">If you have any questions, please contact your instructor.</div>
                <div class="footer-highlight">Good luck and happy coding! 💻✨</div>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const contestReminderTemplate = (contestData, studentName, timeUntilStart) => {
    const { title, startTime } = contestData;
    
    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });
    };

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contest Reminder</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                line-height: 1.6;
                color: hsl(222.2, 84%, 4.9%);
                background-color: hsl(0, 0%, 98%);
                padding: 20px;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: hsl(0, 0%, 100%);
                border-radius: 12px;
                border: 1px solid hsl(214.3, 31.8%, 91.4%);
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                overflow: hidden;
            }
            
            .header {
                background-color: hsl(222.2, 47.4%, 11.2%);
                color: hsl(210, 40%, 98%);
                padding: 32px 24px;
                text-align: center;
            }
            
            .logo {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
                letter-spacing: -0.025em;
            }
            
            .header-subtitle {
                font-size: 16px;
                opacity: 0.9;
                font-weight: 500;
            }
            
            .content {
                padding: 32px 24px;
            }
            
            .reminder-badge {
                background-color: hsl(0, 84.2%, 60.2%);
                color: hsl(210, 40%, 98%);
                padding: 12px 20px;
                border-radius: 6px;
                font-size: 16px;
                font-weight: 600;
                text-align: center;
                margin: 24px 0;
                letter-spacing: -0.025em;
            }
            
            .contest-title {
                font-size: 24px;
                font-weight: 700;
                color: hsl(222.2, 84%, 4.9%);
                margin: 24px 0;
                padding: 20px;
                background-color: hsl(210, 40%, 98%);
                border: 1px solid hsl(214.3, 31.8%, 91.4%);
                border-radius: 8px;
                text-align: center;
                letter-spacing: -0.025em;
            }
            
            .start-time {
                background-color: hsl(210, 40%, 98%);
                border: 1px solid hsl(214.3, 31.8%, 91.4%);
                border-radius: 8px;
                padding: 16px;
                margin: 24px 0;
                text-align: center;
            }
            
            .start-time-label {
                font-weight: 600;
                color: hsl(222.2, 84%, 4.9%);
                margin-bottom: 8px;
            }
            
            .start-time-value {
                color: hsl(215.4, 16.3%, 46.9%);
                font-weight: 500;
            }
            
            .cta-button {
                display: inline-block;
                background-color: hsl(222.2, 47.4%, 11.2%);
                color: hsl(210, 40%, 98%);
                padding: 10px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 500;
                text-align: center;
                margin: 24px auto;
                display: block;
                width: fit-content;
                transition: all 0.2s ease;
                font-size: 14px;
                letter-spacing: -0.025em;
                border: 1px solid hsl(214.3, 31.8%, 91.4%);
            }
            
            .cta-button:hover {
                background-color: hsl(222.2, 47.4%, 11.2%, 0.9);
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .tips-section {
                background-color: hsl(47.9, 95.8%, 53.1%, 0.1);
                border: 1px solid hsl(47.9, 95.8%, 53.1%, 0.2);
                border-radius: 8px;
                padding: 20px;
                margin: 24px 0;
            }
            
            .tips-title {
                font-weight: 600;
                color: hsl(222.2, 84%, 4.9%);
                margin-bottom: 12px;
                font-size: 16px;
            }
            
            .tips-list {
                color: hsl(215.4, 16.3%, 46.9%);
                margin: 0;
                padding-left: 20px;
            }
            
            .tips-list li {
                margin-bottom: 8px;
                line-height: 1.5;
            }
            
            .footer {
                background-color: hsl(210, 40%, 98%);
                padding: 24px;
                text-align: center;
                border-top: 1px solid hsl(214.3, 31.8%, 91.4%);
            }
            
            .footer-text {
                color: hsl(215.4, 16.3%, 46.9%);
                font-size: 14px;
                font-weight: 600;
            }
            
            @media (max-width: 600px) {
                body {
                    padding: 10px;
                }
                
                .content {
                    padding: 24px 16px;
                }
                
                .header {
                    padding: 24px 16px;
                }
                
                .contest-title {
                    font-size: 20px;
                    padding: 16px;
                }
                
                .reminder-badge {
                    font-size: 16px;
                    padding: 12px 16px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">⏰ Code-E-Pariksha</div>
                <div class="header-subtitle">Contest Reminder</div>
            </div>

            <div class="content">
                <div class="reminder-badge">
                    🚨 Contest starting ${timeUntilStart}!
                </div>

                <p>Hello <strong>${studentName}</strong>,</p>
                
                <p>This is a friendly reminder that the contest you registered for is starting soon!</p>

                <div class="contest-title">
                    ${title}
                </div>

                <div class="start-time">
                    <div class="start-time-label">Start Time:</div>
                    <div class="start-time-value">${formatDate(startTime)}</div>
                </div>

                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/contests" class="cta-button">
                    Join Contest Now
                </a>

                <div class="tips-section">
                    <div class="tips-title">💡 Last-minute tips:</div>
                    <ul class="tips-list">
                        <li>Make sure you have a stable internet connection</li>
                        <li>Test your coding environment</li>
                        <li>Read all problems carefully before starting</li>
                        <li>Manage your time wisely</li>
                    </ul>
                </div>
            </div>

            <div class="footer">
                <div class="footer-text">Good luck! 🍀</div>
            </div>
        </div>
    </body>
    </html>
    `;
};