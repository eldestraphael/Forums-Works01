import { StaticMessage } from "@/app/api/constants/StaticMessages";
import { generateOTP } from "@/app/api/helpers/otpGenerator";
let nodemailer = require("nodemailer");
import { createEvent, EventAttributes } from "ics";
import { convertForumDate } from "./convertForumDate";

export class EmailController {
  async resetPasswordOTP(email_id: string, otp: string): Promise<void> {
    try {
      let transporter = await nodemailer.createTransport({
        host: process.env.EMAIL_SERVICE_HOST,
        port: process.env.EMAIL_SERVICE_PORT,
        auth: {
          user: process.env.EMAIL_SERVICE_AUTH_USER,
          pass: process.env.EMAIL_AUTH_KEY,
        },
      });

      const logoURL =
        "https://app.forumsatwork.com/_next/static/media/forums-logo.cdb976a3.png";

      const emailTemplateForResetPasswordOTP = (otp: string) => `
      <!DOCTYPE html>
      <html>
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> 
      <title>Password Reset - Forums@Work</title>
      <style>
        body {
          font-family: 'Work Sans', sans-serif;
          background-color: #f7f7f7;
          margin: 0;
          padding: 0;
          color: #333;
        }

        table {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
          border-collapse: collapse;
          border-radius: 5px;
        }

        th, td {
          padding: 20px;
          text-align: left;
        }

        th {
          background-color: #2A2F42;
        }

        .header {
          background-color: #2A2F42;
          color: #fff;
          text-align: center;
          padding: 20px 0;
        }

        .content {
          padding: 20px;
        }

        .button {
          background-color: #2a2f42;
          color: #fff;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          text-decoration: none;
        }

        .footer {
          text-align: center;
          padding: 20px;
          background-color: #f8f8f8;
          font-size: 14px;
        }
      </style>
      </head>
      <body>
      <table>
        <tr>
          <td class="header">
            <h1><img src="${logoURL}" alt="forums@work" style="width: 300px; height: auto;"></h1>
          </td>
        </tr>
        <tr>
          <td class="content">
            <table>
              <tr>
                <td>
                  <h3>Password Reset Request</h3>
                  <p>We’ve received a request to reset your password for your Forums@Work account.</p>
                  <p>Here is the OTP <b>${otp}</b> for reseting your password. This OTP is valid only for 15 minutes.</p>
                  <p>If you didn’t request this password reset or if you have any concerns, please contact our support team immediately at <a href="mailto:${process.env.EMAIL_SUPPORT}">${process.env.EMAIL_SUPPORT}</a>.</p>
                  <p>Your security is important to us, and we’re here to help if you need any assistance during this process.</p>
                  <p>Thank you for being a part of the Forums@Work community!</p>
                  <p>Best regards,<br>The Forums@Work Team</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="footer">
            <p>Copyright © 2024 Forums@Work. All rights reserved.</p>
          </td>
        </tr>
      </table>
      </body>
      </html>
    `;

      var options = {
        from: process.env.EMAIL_FROM,
        to: `${email_id}`,
        subject: "Reset Your Forums@Work Password",
        html: emailTemplateForResetPasswordOTP(otp),
      };
      let mailStatus: any = await transporter.sendMail(options);
      if (!mailStatus) {
        throw { message: StaticMessage.OTPEmailFailed, data: {} };
      }
    } catch (err: any) {
      throw err;
    }
  }

  async sendPasswordToUser(email_id: string, password: string): Promise<void> {
    try {
      let transporter = await nodemailer.createTransport({
        host: process.env.EMAIL_SERVICE_HOST,
        port: process.env.EMAIL_SERVICE_PORT,
        auth: {
          user: process.env.EMAIL_SERVICE_AUTH_USER,
          pass: process.env.EMAIL_AUTH_KEY,
        },
      });

      const logoURL =
        "https://app.forumsatwork.com/_next/static/media/forums-logo.cdb976a3.png";
      const loginLink = `${process.env.NEXTAUTH_URL}/sign-in`;
      const supportEmail = process.env.EMAIL_SUPPORT;

      const emailTemplateForPassword = (password: string) => `
      <!DOCTYPE html>
      <html>
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> 
      <title>Welcome to Forums@Work</title>
      <style>
        body {
          font-family: 'Work Sans', sans-serif;
          background-color: #f7f7f7;
          margin: 0;
          padding: 0;
          color: #333;
        }

        table {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
          border-collapse: collapse;
          border-radius: 5px;
        }

        th, td {
          padding: 20px;
          text-align: left;
        }

        th {
          background-color: #2A2F42;
        }

        .header {
          background-color: #2A2F42;
          color: #fff;
          text-align: center;
          padding: 20px 0;
        }

        .content {
          padding: 20px;
        }

        .button {
          background-color: #2a2f42;
          color: #fff;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          text-decoration: none;
        }

        .footer {
          text-align: center;
          padding: 20px;
          background-color: #f8f8f8;
          font-size: 14px;
        }
      </style>
      </head>
      <body>
      <table>
        <tr>
          <td class="header">
            <h1><img src="${logoURL}" alt="forums@work" style="width: 300px; height: auto;"></h1>
          </td>
        </tr>
        <tr>
          <td class="content">
            <table>
              <tr>
                <td>
                  <h3>Welcome to Forums@Work!</h3>
                  <br>
                  <p>We’re genuinely excited to have you join our community. You’ve just taken a powerful step towards personal and professional growth. At Forums@Work, we believe that every conversation and connection has the potential to transform your work life and beyond.</p>
                  <br>
                  <p><b>Here’s how to get started:</b></p>
                  <ul>
                    <li><b>Temporary Password:</b> ${password}</li>
                  </ul>
                  <br>
                  <p>To begin your journey, please log in to our platform here: <a href="${loginLink}">${loginLink}</a></p>
                  <br>
                  <p>We’re here to support you every step of the way. If you have any questions or need assistance, please don’t hesitate to reach out to us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
                  <br>
                  <p>Welcome aboard—your journey to a more fulfilling and impactful career starts now!</p>
                  <br>
                  <p>Warmest regards,<br>The Forums@Work Team</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="footer">
            <p>Copyright © 2024 Forums@Work. All rights reserved.</p>
          </td>
        </tr>
      </table>
      </body>
      </html>
    `;

      var options = {
        from: process.env.EMAIL_FROM,
        to: `${email_id}`,
        subject: "Welcome to Forums@Work! Your Path to Growth Starts Here",
        html: emailTemplateForPassword(password),
      };
      let mailStatus: any = await transporter.sendMail(options);
      if (!mailStatus) {
        throw { message: StaticMessage.PasswordEmailFailed, data: {} };
      }
      return;
    } catch (err: any) {
      throw err;
    }
  }

  async sendForumCreatedEmail(forum: any): Promise<void> {
    try {
      let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVICE_HOST,
        port: Number(process.env.EMAIL_SERVICE_PORT),
        auth: {
          user: process.env.EMAIL_SERVICE_AUTH_USER,
          pass: process.env.EMAIL_AUTH_KEY,
        },
      });

      const startDate = new Date(forum.starting_date);
      const meetingDay = forum.meeting_day;
      const meetingTime = forum.meeting_time;

      const [hours, minutes] = meetingTime.split(":").map(Number);

      const start = new Date(startDate);
      start.setHours(hours, minutes, 0);

      const end = new Date(start);
      end.setHours(end.getHours() + 1);

      const event: EventAttributes = {
        start: [
          start.getFullYear(),
          start.getMonth() + 1,
          start.getDate(),
          start.getHours(),
          start.getMinutes(),
        ],
        end: [
          end.getFullYear(),
          end.getMonth() + 1,
          end.getDate(),
          end.getHours(),
          end.getMinutes(),
        ],
        startInputType: "utc",
        endInputType: "utc",
        recurrenceRule: `FREQ=WEEKLY;BYDAY=${meetingDay
          .substring(0, 2)
          .toUpperCase()}`,
        title: `${forum.forum_name} forum meeting`,
        description: `Meeting for ${forum.forum_name}`,
        location: "Hybrid",
        url: `${process.env.NEXTAUTH_URL}`,
        status: "CONFIRMED",
        organizer: { name: "Forums@Work", email: process.env.EMAIL_FROM },
        attendees: forum.users_info.map((user: any) => ({
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          rsvp: false,
          partstat: "ACCEPTED",
          role: "REQ-PARTICIPANT",
        })),
        alarms: [
          {
            action: "display",
            description: "Your forum meeting is in 30 minutes",
            trigger: { minutes: 30, before: true },
          },
        ],
      };

      const { error, value: icsContent } = createEvent(event);
      if (error) {
        throw error;
      }

      const logoURL =
        "https://app.forumsatwork.com/_next/static/media/forums-logo.cdb976a3.png";
      const loginLink = `${process.env.NEXTAUTH_URL}/sign-in`;
      const supportEmail = process.env.EMAIL_SUPPORT;

      const emailTemplate = (user: any) => `
      <!DOCTYPE html>
      <html>
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> 
      <title>Mail regarding your Forums At Work account</title>
      <style>
        body {
          font-family: 'Work Sans', sans-serif;
          background-color: #f7f7f7;
          margin: 0;
          padding: 0;
          color: #333;
        }

        table {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
          border-collapse: collapse;
          border-radius: 5px;
        }

        th, td {
          padding: 20px;
          text-align: left;
        }

        th {
          background-color: #2A2F42;
        }

        .header {
          background-color: #2A2F42;
          color: #fff;
          text-align: center;
          padding: 20px 0;
        }

        .content {
          padding: 20px;
        }

        .button {
          background-color: #2a2f42;
          color: #fff;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          margin-top: 10px;
        }

        .footer {
          text-align: center;
          padding: 20px;
          background-color: #f8f8f8;
          font-size: 14px;
        }
      </style>
      </head>
      <body>
      <table>
        <tr>
          <td class="header">
            <h1><img src="${logoURL}" alt="forums@work" style="width: 300px; height: auto;"></h1>
          </td>
        </tr>
        <tr>
          <td class="content">
            <table>
              <tr>
                <td>
                  <p>Hi ${user.first_name},</p>
                  <br>
                  <p>You have been added to the forum <b>${forum.forum_name}</b>, which meets every <b>${forum.meeting_day}</b>.</p>
                  <br>
                  <p>To get the most out of your forum experience, here are a few steps to help you get started on our platform:</p>
                  <ul>
                    <li>Log in to the platform: <a href="${loginLink}">${loginLink}</a></li>
                    <li>Click on the "Experience Forum" button to view upcoming meetings and pre-forum materials.</li>
                    <li>Prepare for your first meeting by reviewing any pre-meeting materials provided.</li>
                  </ul>
                  <br>
                  <p>We’re here to help you make the most of this opportunity for growth and connection. If you have any questions, please don’t hesitate to reach out to us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
                  <br>
                  <p>Looking forward to your participation!</p>
                  <p>Best regards,<br>The Forums@Work Team</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="footer">
            <p>Copyright © 2024 Forums@Work. All rights reserved.</p>
          </td>
        </tr>
      </table>
      </body>
      </html>
    `;

      for (let user of forum.users_info) {
        const options = {
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: `Welcome to Your New Forum: ${forum.forum_name}!`,
          html: emailTemplate(user),
          attachments: [
            {
              filename: `${forum.forum_name} forum meeting invitation.ics`,
              content: icsContent,
              contentType: "text/calendar",
            },
          ],
        };

        let mailStatus = await transporter.sendMail(options);
        if (!mailStatus) {
          throw {
            message: "Forum created notification email failed",
            data: null,
            statusCode: 500,
          };
        }
      }
    } catch (err: any) {
      throw err;
    }
  }

  async sendForumUpdatedEmail(
    forum: any,
    updatedInformation: any
  ): Promise<void> {
    try {
      let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVICE_HOST,
        port: Number(process.env.EMAIL_SERVICE_PORT),
        auth: {
          user: process.env.EMAIL_SERVICE_AUTH_USER,
          pass: process.env.EMAIL_AUTH_KEY,
        },
      });

      const startDate = new Date(forum.starting_date);
      const meetingDay = forum.meeting_day;
      const meetingTime = forum.meeting_time;

      const [hours, minutes] = meetingTime.split(":").map(Number);

      const start = new Date(startDate);
      start.setHours(hours, minutes, 0);

      const end = new Date(start);
      end.setHours(end.getHours() + 1);

      const event: EventAttributes = {
        start: [
          start.getFullYear(),
          start.getMonth() + 1,
          start.getDate(),
          start.getHours(),
          start.getMinutes(),
        ],
        end: [
          end.getFullYear(),
          end.getMonth() + 1,
          end.getDate(),
          end.getHours(),
        ],
        startInputType: "utc",
        endInputType: "utc",
        recurrenceRule: `FREQ=WEEKLY;BYDAY=${meetingDay
          .substring(0, 2)
          .toUpperCase()}`,
        title: `${forum.forum_name} forum meeting`,
        description: `Meeting for ${forum.forum_name}`,
        location: "Hybrid",
        url: `${process.env.NEXTAUTH_URL}`,
        status: "CONFIRMED",
        organizer: { name: "Forums@Work", email: process.env.EMAIL_FROM },
        attendees: forum.users_info.map((user: any) => ({
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          rsvp: false,
          partstat: "ACCEPTED",
          role: "REQ-PARTICIPANT",
        })),
        alarms: [
          {
            action: "display",
            description: "Your forum meeting is in 30 minutes",
            trigger: { minutes: 30, before: true },
          },
        ],
      };

      const { error, value: icsContent } = createEvent(event);
      if (error) {
        throw error;
      }

      const logoURL =
        "https://app.forumsatwork.com/_next/static/media/forums-logo.cdb976a3.png";
      const loginLink = `${process.env.NEXTAUTH_URL}/sign-in`;
      const supportEmail = process.env.EMAIL_SUPPORT;

      const emailTemplate = (user: any) => `
      <!DOCTYPE html>
      <html>
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> 
      <title>Forum Update Notification</title>
      <style>
        body {
          font-family: 'Work Sans', sans-serif;
          background-color: #f7f7f7;
          margin: 0;
          padding: 0;
          color: #333;
        }

        table {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
          border-collapse: collapse;
          border-radius: 5px;
        }

        th, td {
          padding: 20px;
          text-align: left;
        }

        th {
          background-color: #2A2F42;
        }

        .header {
          background-color: #2A2F42;
          color: #fff;
          text-align: center;
          padding: 20px 0;
        }

        .content {
          padding: 20px;
        }

        .button {
          background-color: #2a2f42;
          color: #fff;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          text-decoration: none;
        }

        .footer {
          text-align: center;
          padding: 20px;
          background-color: #f8f8f8;
          font-size: 14px;
        }
      </style>
      </head>
      <body>
      <table>
        <tr>
          <td class="header">
            <h1><img src="${logoURL}" alt="forums@work" style="width: 300px; height: auto;"></h1>
          </td>
        </tr>
        <tr>
          <td class="content">
            <table>
              <tr>
                <td>
                  <p>Hi ${user.first_name},</p>
                  <br>
                  <p>We want to inform you that there have been some updates to the <b>${forum.forum_name}</b> forum that you are a part of.</p>
                  <br>
                  <p><b>Updated Information:</b></p>
                  <ul>
                   ${updatedInformation}
                  </ul>
                  <br>
                  <p>Please take a moment to review the updated details to ensure you’re prepared for our next meeting. You can log in to the platform to see all the latest information: <a href="${loginLink}">${loginLink}</a></p>
                  <br>
                  <p>If you have any questions or need further clarification, feel free to reach out to us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
                  <br>
                  <p>Thank you for your continued engagement!</p>
                  <p>Best regards,<br>The Forums@Work Team</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="footer">
            <p>Copyright © 2024 Forums@Work. All rights reserved.</p>
          </td>
        </tr>
      </table>
      </body>
      </html>
    `;

      for (let user of forum.users_info) {
        const options = {
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: `Important Update: Changes to Your Forum: ${forum.forum_name}`,
          html: emailTemplate(user),
          attachments: [
            {
              filename: `${forum.forum_name} forum meeting invitation.ics`,
              content: icsContent,
              contentType: "text/calendar",
            },
          ],
        };

        let mailStatus = await transporter.sendMail(options);
        if (!mailStatus) {
          throw {
            message: "Forum update notification email failed",
            data: null,
            statusCode: 500,
          };
        }
      }
    } catch (err: any) {
      throw err;
    }
  }

  async sendUserWeeklyReportEmail(forumData: any): Promise<void> {
    try {
      let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVICE_HOST,
        port: Number(process.env.EMAIL_SERVICE_PORT),
        auth: {
          user: process.env.EMAIL_SERVICE_AUTH_USER,
          pass: process.env.EMAIL_AUTH_KEY,
        },
      });

      const logoURL =
        "https://app.forumsatwork.com/_next/static/media/forums-logo.cdb976a3.png";
      const contactEmail = process.env.EMAIL_SUPPORT;

      const emailTemplateForWeeklyReport = (forum: any) => `
      <!DOCTYPE html>
      <html>
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> 
      <title>Forum Weekly Report</title>
      <style>
        body {
          font-family: 'Work Sans', sans-serif;
          background-color: #f7f7f7;
          margin: 0;
          padding: 0;
          color: #333;
        }

        table {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
          border-collapse: collapse;
          border-radius: 5px;
        }

        th, td {
          padding: 20px;
          text-align: left;
        }

        th {
          background-color: #2A2F42;
        }

        .header {
          background-color: #2A2F42;
          color: #fff;
          text-align: center;
          padding: 20px 0;
        }

        .content {
          padding: 20px;
        }

        .button {
          background-color: #2a2f42;
          color: #fff;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          text-decoration: none;
        }

        .footer {
          text-align: center;
          padding: 20px;
          background-color: #f8f8f8;
          font-size: 14px;
        }
      </style>
      </head>
      <body>
      <table>
        <tr>
          <td class="header">
            <h1><img src="${logoURL}" alt="forums@work" style="width: 300px; height: auto;"></h1>
          </td>
        </tr>
        <tr>
          <td class="content">
            <table>
              <tr>
                <td>
                  <h3>Hi ${forum.first_name},</h3>
                  <br>
                  <p>Here is a reminder that your next <b>${forum.forum_name}</b> meeting is scheduled for <b>${convertForumDate()}</b>!</p>
                  <br>
                  <p><b>Forum Health Update:</b> Currently, your Forum Health is at <b>${forum.avg_score}%</b>.</p>
                  <br>
                  <p>To improve this score and ensure a productive meeting, please complete all pre-work before the forum. Your preparation is key to a productive and engaging session!</p>
                  <br><br>
                  <p>If you have any questions or need assistance, please reach out to your forum lead or admin at <a href="mailto:${contactEmail}">${contactEmail}</a>.</p>
                  <br>
                  <p>We hope you have an amazing forum!</p>
                  <p>Warm regards,<br>The Forums@Work Team</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="footer">
            <p>Copyright © 2024 Forums@Work. All rights reserved.</p>
          </td>
        </tr>
      </table>
      </body>
      </html>
    `;

      for (let data of forumData) {
        var options = {
          from: process.env.EMAIL_FROM,
          to: `${data.email}`,
          subject: `Get Ready! Your Forum Meeting for ${data.forum_name} is This ${data.meeting_day}! 🎉`,
          html: emailTemplateForWeeklyReport(data),
        };
        let mailStatus: any = await transporter.sendMail(options);
        if (!mailStatus) {
          throw { message: "Forum weekly report email failed", data: {} };
        }
      }
    } catch (err: any) {
      throw err;
    }
  }

  async sendCompanyMonthlyReportEmail(companyData: any) {
    try {
      let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVICE_HOST,
        port: Number(process.env.EMAIL_SERVICE_PORT),
        auth: {
          user: process.env.EMAIL_SERVICE_AUTH_USER,
          pass: process.env.EMAIL_AUTH_KEY,
        },
      });

      const logoURL =
        "https://app.forumsatwork.com/_next/static/media/forums-logo.cdb976a3.png";

      const emailTemplateForMonthlyReport = (company: any) => `
      <!DOCTYPE html>
      <html>
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> 
      <title>Company Monthly Report</title>
      <style>
        body {
          font-family: 'Work Sans', sans-serif;
          background-color: #f7f7f7;
          margin: 0;
          padding: 0;
          color: #333;
        }
  
        table {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
          border-collapse: collapse;
          border-radius: 5px;
        }
  
        th, td {
          padding: 20px;
          text-align: left;
        }
  
        th {
          background-color: #2A2F42;
          color: #fff;
        }
  
        .header {
          background-color: #2A2F42;
          color: #fff;
          text-align: center;
          padding: 20px 0;
        }
  
        .content {
          padding: 20px;
        }
  
        .footer {
          text-align: center;
          padding: 20px;
          background-color: #f8f8f8;
          font-size: 14px;
        }
      </style>
      </head>
      <body>
      <table>
        <tr>
          <td class="header">
            <h1><img src="${logoURL}" alt="forums@work" style="width: 300px; height: auto;"></h1>
          </td>
        </tr>
        <tr>
          <td class="content">
            <table>
              <tr>
                <td>
                  <h3>Hello Team at ${company.company_name},</h3>
                  <br>
                  <p>Here is your monthly report for ${
                    company.company_name
                  }.</p>
                  <br>
                  <p>Your average forum score for this month is <b>${
                    company.avg_score
                  }%</b>.</p>
                  <br>
                  <h4>Top Forums:</h4>
                  <ul>
                    ${company.top_forums
                      .map(
                        (forum: any) =>
                          `<li>${forum.forum_name}: ${forum.total_score.toFixed(
                            2
                          )}</li>`
                      )
                      .join("")}
                  </ul>
                  <br>
                  <h4>Bottom Forums:</h4>
                  <ul>
                    ${company.bottom_forums
                      .map(
                        (forum: any) =>
                          `<li>${forum.forum_name}: ${forum.total_score.toFixed(
                            2
                          )}</li>`
                      )
                      .join("")}
                  </ul>
                  <br>
                  <p>If you have any questions, please don't hesitate to reach out to your forum lead or admin.<p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="footer">
            <p>Copyright © 2024 Forums@Work. All rights reserved.</p>
          </td>
        </tr>
      </table>
      </body>
      </html>
      `;
      for (let company of companyData) {
        for (let adminEmail of company.admin_emails) {
          var options = {
            from: process.env.EMAIL_FROM,
            to: adminEmail,
            subject: `Monthly Report for ${company.company_name}`,
            html: emailTemplateForMonthlyReport(company),
          };
          let mailStatus = await transporter.sendMail(options);
          if (!mailStatus) {
            throw {
              statusCode: 500,
              message: "Failed to send the monthly report email",
              data: null,
            };
          }
        }
      }
    } catch (err) {
      throw err;
    }
  }

  async getNextDayOfWeek(date: Date, dayOfWeek: any) {
    const resultDate = new Date(date.getTime());
    resultDate.setDate(date.getDate() + ((7 + dayOfWeek - date.getDay()) % 7));
    return resultDate;
  }
}
