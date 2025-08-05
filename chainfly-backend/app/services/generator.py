# generator.py - Document generation logic will be implemented here.

# ... existing code ... 

import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import socket

load_dotenv()  # Load environment variables from .env

def send_email(to_email: str, subject: str, body: str):
    sender_email = os.getenv("EMAIL_USER")
    sender_password = os.getenv("EMAIL_PASS")
    
    # Debug: Check if environment variables are loaded
    print(f"Debug - Email: {sender_email}")
    print(f"Debug - Password length: {len(sender_password) if sender_password else 0}")
    
    if not sender_email or not sender_password:
        print("Error: Email credentials not found in environment variables")
        return
    
    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        print("Connecting to Gmail SMTP...")
        # Set timeout to 10 seconds
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10)
        print("SMTP connection established!")
        
        print("Attempting login...")
        server.login(sender_email, sender_password)
        print("Login successful!")
        
        print(f"Sending email to {to_email}...")
        server.sendmail(sender_email, to_email, msg.as_string())
        print(f"Email sent successfully to {to_email}")
        
        server.quit()
        print("SMTP connection closed.")
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"Authentication failed: {e}")
    except smtplib.SMTPException as e:
        print(f"SMTP error: {e}")
    except socket.timeout as e:
        print(f"Connection timeout: {e}")
    except Exception as e:
        print(f"Failed to send email: {e}") 