"""
Simple Flask backend for the portfolio site.

What it does:
1. Serves index.html, style.css, script.js as static files.
2. Exposes POST /contact which receives {name, email, message} as JSON
   from the contact form and emails it to you via SMTP.

Setup:
    pip install -r requirements.txt

Environment variables (set these before running, don't hardcode secrets):
    SMTP_HOST       e.g. smtp.gmail.com
    SMTP_PORT       e.g. 587
    SMTP_USER       your sending email address
    SMTP_PASS       your email account password / app password
    CONTACT_TO      the email address you want messages delivered to

Run locally:
    export SMTP_HOST=smtp.gmail.com
    export SMTP_PORT=587
    export SMTP_USER=you@example.com
    export SMTP_PASS=your-app-password
    export CONTACT_TO=you@example.com
    python app.py

Then open http://localhost:5000
"""

import os
import smtplib
from email.message import EmailMessage

from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder=".", static_url_path="")

SMTP_HOST = os.environ.get("SMTP_HOST")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASS = os.environ.get("SMTP_PASS")
CONTACT_TO = os.environ.get("CONTACT_TO", SMTP_USER)


@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/contact", methods=["POST"])
def contact():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    message = (data.get("message") or "").strip()

    if not name or not email or not message:
        return jsonify({"ok": False, "error": "name, email and message are required"}), 400

    # If SMTP isn't configured, just log the message so local testing still works.
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASS:
        print(f"[contact form] {name} <{email}>: {message}")
        return jsonify({"ok": True, "note": "SMTP not configured, message logged only"}), 200

    try:
        msg = EmailMessage()
        msg["Subject"] = f"Portfolio contact from {name}"
        msg["From"] = SMTP_USER
        msg["To"] = CONTACT_TO
        msg["Reply-To"] = email
        msg.set_content(f"From: {name} <{email}>\n\n{message}")

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)

        return jsonify({"ok": True}), 200

    except Exception as exc:  # noqa: BLE001 - surface a generic error to the client
        print(f"[contact form] failed to send email: {exc}")
        return jsonify({"ok": False, "error": "Could not send message right now"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
