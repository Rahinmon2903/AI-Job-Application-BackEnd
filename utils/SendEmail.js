import SibApiV3Sdk from "sib-api-v3-sdk";
import dotenv from "dotenv";

dotenv.config();

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async (to, subject, htmlContent) => {
  const emailData = {
    sender: {
      name: "Resume management system",
      email: process.env.PASS_MAIL,
    },
    to: [{ email: to }],
    subject,
    htmlContent,
  };

  await tranEmailApi.sendTransacEmail(emailData);
};

export default sendEmail;
