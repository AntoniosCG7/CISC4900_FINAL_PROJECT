const postmark = require("postmark");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = `LinguaConnect <${process.env.EMAIL_FROM}>`;
    this.client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);
  }

  async send(subject, textBody) {
    await this.client.sendEmail({
      From: this.from,
      To: this.to,
      Subject: subject,
      TextBody: textBody,
    });
  }

  async sendWelcome(username) {
    await this.client.sendEmailWithTemplate({
      From: this.from,
      To: this.to,
      TemplateAlias: "welcome",
      TemplateModel: {
        username: username,
        product_name: "LinguaConnect",
      },
    });
  }

  async sendPasswordReset(username, actionUrl) {
    await this.client.sendEmailWithTemplate({
      From: this.from,
      To: this.to,
      TemplateAlias: "password-reset",
      TemplateModel: {
        username: username,
        product_name: "LinguaConnect",
        action_url: actionUrl,
      },
    });
  }
};
