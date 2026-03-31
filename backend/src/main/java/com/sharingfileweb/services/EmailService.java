package com.sharingfileweb.services;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final Resend resend;
    
    @Value("${FRONTEND_URL:http://localhost:3000}")
    private String frontendUrl;

    public EmailService(@Value("${RESEND_API_KEY:}") String apiKey) {
        if (apiKey == null || apiKey.isEmpty()) {
            logger.warn("RESEND_API_KEY is not set. Emails will not be sent.");
            this.resend = null;
        } else {
            this.resend = new Resend(apiKey);
        }
    }

    @Async
    public void sendShareInvitationEmail(String recipientEmail, String ownerName, String fileName, String fileId) {
        if (this.resend == null) {
            logger.warn("Resend client is not initialized, aborting email send to {}", recipientEmail);
            return;
        }

        try {
            // Build the link to the file/folder access
            String link = frontendUrl + "/app/share/" + fileId; // adjust to actual route if needed
            
            String htmlContent = buildLuxuryHtmlTemplate(recipientEmail, ownerName, fileName, link);

            CreateEmailOptions sendEmailRequest = CreateEmailOptions.builder()
                    .from("Sharing File Web <onboarding@resend.dev>")
                    .to(recipientEmail)
                    .subject("Exclusive Invitation: " + ownerName + " shared a file with you")
                    .html(htmlContent)
                    .build();

            CreateEmailResponse data = resend.emails().send(sendEmailRequest);
            logger.info("Successfully sent invitation email to {} with id {}", recipientEmail, data.getId());
        } catch (ResendException e) {
            logger.error("Failed to send invitation email via Resend API", e);
        } catch (Exception e) {
            logger.error("Unexpected error during email send", e);
        }
    }

    private String buildLuxuryHtmlTemplate(String recipientEmail, String ownerName, String fileName, String link) {
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "<style>\n" +
                "  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }\n" +
                "  .email-wrapper { max-width: 600px; margin: 40px auto; background-color: #000000; color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }\n" +
                "  .email-header { padding: 40px 20px; text-align: center; border-bottom: 1px solid #333333; }\n" +
                "  .email-header h1 { margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; }\n" +
                "  .email-body { padding: 40px 30px; text-align: center; }\n" +
                "  .email-body p { font-size: 16px; line-height: 1.6; color: #cccccc; margin-bottom: 24px; }\n" +
                "  .highlight { color: #ffffff; font-weight: bold; }\n" +
                "  .btn-wrapper { margin: 40px 0; }\n" +
                "  .btn { display: inline-block; padding: 14px 32px; background-color: #ffffff; color: #000000; text-decoration: none; font-size: 14px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; border-radius: 4px; transition: background-color 0.3s; }\n" +
                "  .email-footer { padding: 20px; text-align: center; font-size: 12px; color: #666666; border-top: 1px solid #333333; }\n" +
                "</style>\n" +
                "</head>\n" +
                "<body>\n" +
                "  <div class=\"email-wrapper\">\n" +
                "    <div class=\"email-header\">\n" +
                "      <h1>Exclusive Invitation</h1>\n" +
                "    </div>\n" +
                "    <div class=\"email-body\">\n" +
                "      <p>Hello <span class=\"highlight\">" + recipientEmail + "</span>,</p>\n" +
                "      <p><span class=\"highlight\">" + ownerName + "</span> has invited you to access a secure workspace.</p>\n" +
                "      <p>File: <span class=\"highlight\">" + fileName + "</span></p>\n" +
                "      <div class=\"btn-wrapper\">\n" +
                "        <a href=\"" + link + "\" class=\"btn\">View Content</a>\n" +
                "      </div>\n" +
                "      <p>If you did not expect this invitation, please ignore this email.</p>\n" +
                "    </div>\n" +
                "    <div class=\"email-footer\">\n" +
                "      &copy; 2026 Sharing File Web. All rights reserved.\n" +
                "    </div>\n" +
                "  </div>\n" +
                "</body>\n" +
                "</html>";
    }
}
