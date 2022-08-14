import nodemailer from "nodemailer";
import { buildSendMail } from "mailing-core";

const transport = nodemailer.createTransport({
  jsonTransport: true,
});

const sendMail = buildSendMail({
  transport,
  defaultFrom: "noreply@kokoapps.co.il",
});

export default sendMail;
