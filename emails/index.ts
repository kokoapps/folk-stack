import nodemailer from "nodemailer";
import { buildSendMail } from "mailing-core";

const transport = nodemailer.createTransport({
  jsonTransport: true,
});

const sendMail = buildSendMail({
  transport,
  defaultFrom: "noreply@previewsender.co.il",
});

export default sendMail;
