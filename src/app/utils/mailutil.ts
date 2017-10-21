export class MailUtil {
    static isValid(mail: string): boolean {
        const mailReg = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
        return mail.match(mailReg) !== null;
    }
}

