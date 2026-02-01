import { sendEmail } from '../utils/sendEmail.js';
import { contestNotificationTemplate, contestReminderTemplate } from './emailTemplates.js';
import User from '../models/User.model.js';
import Class from '../models/Class.model.js';
import Contest from '../models/Contest.model.js';

class NotificationService {
    // Send contest notification to students in specified classes
    async sendContestNotification(contest, classIds) {
        try {
            console.log(`Sending contest notifications for contest: ${contest.title}`);
            console.log(`Target classes: ${classIds}`);

            // Get all students from the specified classes
            const classes = await Class.find({ 
                _id: { $in: classIds } 
            }).populate('students', 'name email');

            if (!classes || classes.length === 0) {
                console.log('No classes found for the given IDs');
                return { success: false, message: 'No classes found' };
            }

            // Collect all unique students
            const studentSet = new Set();
            const students = [];

            classes.forEach(classObj => {
                classObj.students.forEach(student => {
                    if (!studentSet.has(student._id.toString())) {
                        studentSet.add(student._id.toString());
                        students.push(student);
                    }
                });
            });

            console.log(`Found ${students.length} unique students to notify`);

            if (students.length === 0) {
                return { success: false, message: 'No students found in the specified classes' };
            }

            // Send emails to all students
            const emailPromises = students.map(async (student) => {
                try {
                    const emailHtml = contestNotificationTemplate(contest, student.name, false);
                    
                    await sendEmail({
                        to: student.email,
                        subject: `🏆 New Contest: ${contest.title} - You're Invited!`,
                        html: emailHtml
                    });

                    console.log(`Email sent successfully to ${student.email}`);
                    return { success: true, email: student.email };
                } catch (error) {
                    console.error(`Failed to send email to ${student.email}:`, error.message);
                    return { success: false, email: student.email, error: error.message };
                }
            });

            const results = await Promise.allSettled(emailPromises);
            
            const successful = results.filter(result => 
                result.status === 'fulfilled' && result.value.success
            ).length;
            
            const failed = results.length - successful;

            console.log(`Email notification results: ${successful} successful, ${failed} failed`);

            return {
                success: true,
                message: `Contest notifications sent successfully`,
                stats: {
                    totalStudents: students.length,
                    successful,
                    failed,
                    classCount: classes.length
                }
            };

        } catch (error) {
            console.error('Error in sendContestNotification:', error);
            return {
                success: false,
                message: 'Failed to send contest notifications',
                error: error.message
            };
        }
    }

    // Send public contest notification to all students
    async sendPublicContestNotification(contest) {
        try {
            console.log(`Sending public contest notifications for contest: ${contest.title}`);

            // Get all students from the database
            const students = await User.find({ role: 'student' }, 'name email');

            console.log(`Found ${students.length} students to notify`);

            if (students.length === 0) {
                return { success: false, message: 'No students found in the system' };
            }

            // Send emails to all students
            const emailPromises = students.map(async (student) => {
                try {
                    const emailHtml = contestNotificationTemplate(contest, student.name, true);
                    
                    await sendEmail({
                        to: student.email,
                        subject: `🏆 New Public Contest: ${contest.title} - Open to All!`,
                        html: emailHtml
                    });

                    console.log(`Email sent successfully to ${student.email}`);
                    return { success: true, email: student.email };
                } catch (error) {
                    console.error(`Failed to send email to ${student.email}:`, error.message);
                    return { success: false, email: student.email, error: error.message };
                }
            });

            const results = await Promise.allSettled(emailPromises);
            
            const successful = results.filter(result => 
                result.status === 'fulfilled' && result.value.success
            ).length;
            
            const failed = results.length - successful;

            console.log(`Public contest email notification results: ${successful} successful, ${failed} failed`);

            return {
                success: true,
                message: `Public contest notifications sent successfully`,
                stats: {
                    totalStudents: students.length,
                    successful,
                    failed,
                    contestType: 'public'
                }
            };

        } catch (error) {
            console.error('Error in sendPublicContestNotification:', error);
            return {
                success: false,
                message: 'Failed to send public contest notifications',
                error: error.message
            };
        }
    }

    // Send contest reminder (can be used for scheduled reminders)
    async sendContestReminder(contest, timeUntilStart = 'soon') {
        try {
            // Get registered participants
            const contestWithParticipants = await Contest.findById(contest._id)
                .populate('participants.user', 'name email');

            if (!contestWithParticipants.participants || contestWithParticipants.participants.length === 0) {
                return { success: false, message: 'No participants found for this contest' };
            }

            const emailPromises = contestWithParticipants.participants.map(async (participant) => {
                try {
                    const emailHtml = contestReminderTemplate(contest, participant.user.name, timeUntilStart);
                    
                    await sendEmail({
                        to: participant.user.email,
                        subject: `⏰ Reminder: ${contest.title} starts ${timeUntilStart}!`,
                        html: emailHtml
                    });

                    return { success: true, email: participant.user.email };
                } catch (error) {
                    console.error(`Failed to send reminder to ${participant.user.email}:`, error.message);
                    return { success: false, email: participant.user.email, error: error.message };
                }
            });

            const results = await Promise.allSettled(emailPromises);
            
            const successful = results.filter(result => 
                result.status === 'fulfilled' && result.value.success
            ).length;

            return {
                success: true,
                message: `Contest reminders sent successfully`,
                stats: {
                    totalParticipants: contestWithParticipants.participants.length,
                    successful,
                    failed: results.length - successful
                }
            };

        } catch (error) {
            console.error('Error in sendContestReminder:', error);
            return {
                success: false,
                message: 'Failed to send contest reminders',
                error: error.message
            };
        }
    }

    // Send individual email notification
    async sendIndividualNotification(userEmail, subject, htmlContent) {
        try {
            await sendEmail({
                to: userEmail,
                subject,
                html: htmlContent
            });

            return { success: true, message: 'Email sent successfully' };
        } catch (error) {
            console.error(`Failed to send email to ${userEmail}:`, error.message);
            return { success: false, message: 'Failed to send email', error: error.message };
        }
    }

    // Validate email configuration
    async validateEmailConfig() {
        try {
            const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD', 'EMAIL_FROM'];
            const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

            if (missingVars.length > 0) {
                return {
                    success: false,
                    message: `Missing email configuration: ${missingVars.join(', ')}`
                };
            }

            return { success: true, message: 'Email configuration is valid' };
        } catch (error) {
            return { success: false, message: 'Email configuration validation failed', error: error.message };
        }
    }
}

export const notificationService = new NotificationService();
export default notificationService;