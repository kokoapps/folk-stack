import nodemailer from "nodemailer";
import { buildSendMail } from "mailing-core";

const transport = nodemailer.createTransport({ jsonTransport: true });

const sendMail = buildSendMail({
  transport,
  defaultFrom: " Folk Stack <noreply@folk-stack.com>",
});

export default sendMail;
