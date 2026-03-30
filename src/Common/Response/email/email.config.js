import { createTransport } from "nodemailer";

const transport = createTransport({
    service: "gmail",
    auth:{
        user:EMAIL_USER,
        pass:EMAIL_PASS,
    },
})

async function sendMail({to, subject, text, html, attachements}) {
    const info = await transport.sendMail({
        from: `<${EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
        attachements,
    })
    console.log("Email Sended: ", info.messageId);
}

export default sendMail