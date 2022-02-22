const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

class Email {
    constructor(user, url) {
        this.to = user.email;
        this.from = `Fidia <${process.env.EMAIL_FROM}>`;
        this.url = url;
        this.name = user.name.split(' ')[0];
    }

    transport() {
        // mailtrap service
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async send(template, subject) {
        const html = pug.renderFile(
            `${__dirname}/../views/email/${template}.pug`,
            {
                name: this.name,
                email: this.to,
                url: this.url,
                subject,
            }
        );

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: convert(html),
        };

        await this.transport().sendMail(mailOptions);
    }

    async sendVerificationMail() {
        await this.send('welcome', 'Welcome To Fidia 🤗!');
    }

    async resendVerificationMail() {
        await this.send('resend-verification', 'Password change successful');
    }

    async verificationSuccessMail() {
        await this.send(
            'verification-success',
            'Fidia Account Successfully Activated'
        );
    }
}

module.exports = Email;
