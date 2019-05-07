import { AutoWired, Singleton } from 'typescript-ioc';

@AutoWired
@Singleton
export default class MailController {

    // transporter: Transporter;

    // constructor() {
    //     this.transporter = createTransport({
    //         host: process.env.MAIL_PROVIDER_SMTP_SERVER,
    //         port: +process.env.MAIL_PROVIDER_SMTP_PORT,
    //         secure: true,
    //         auth: {
    //             user: process.env.MAIL_PROVIDER_USERNAME,
    //             pass: process.env.MAIL_PROVIDER_PASSWORD
    //         }
    //     });
    // }

    // async send(recipient: IEmployee, content: string): Promise<any> {
    //     const mailOptions: SendMailOptions = {
    //         from: `"Alexa 🤖" <${process.env.MAIL_PROVIDER_USERNAME}>`,
    //         to: recipient.email,
    //         subject: `Notiz für ${recipient.name}`,
    //         text: content,
    //         html: content
    //     };

    //     return new Promise((resolve, reject) => {
    //         this.transporter.sendMail(mailOptions, (error, info) => {
    //             if (error) {
    //                 reject(error);
    //                 return;
    //             }
    //             resolve(info);
    //         });
    //     });
    // }

}
