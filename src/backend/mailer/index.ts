import get from 'lodash.get'
import { LogInterface } from "../logging"

const sgMail = require('@sendgrid/mail')

export interface MailerSendParams {
  to: string, 
  replyTo?: string, 
  subject: string, 
  text: string, 
  html?: string, 
  attachments?: { filename?: string, contentType?: string, content: string | Buffer }[]
}

export class Mailer {
  private log: LogInterface
  private fromAddress: string

  constructor(params: { log: LogInterface, apiKey: string, fromAddress: string }) {
    const { log, apiKey, fromAddress } = params

    this.fromAddress = fromAddress
    this.log = log.create('mailer')
    sgMail.setApiKey(apiKey)
  }

  async send(params: MailerSendParams) {
    const { to, replyTo, subject, text, html = '', attachments = [] } = params

    const att = this._prepareAttachments(attachments)

    this.log.info(`Sending email to ${to} with subject ${subject}`)

    this.log.debug(`
Mailer is sending:

to: ${to}
replyTo: ${replyTo}
subject: ${subject}
text: ${text}
html: ${html}
attachments: ${att.map(a => `${a.filename} (${a.type}`).join(', ')}
    `
    )

    const attrs: any = {
      from: this.fromAddress,
      to,
      subject,
      text,
      html: html || text,
      attachments: this._prepareAttachments(attachments),
    }

    if (replyTo) {
      attrs.replyTo = replyTo
    }

    try {
      await sgMail.send(attrs)
    } catch (err: any) {
      const errors = get(err, 'response.body.errors', [])
      const errorsStr = errors.map((e: any) => `${e.field}: ${e.message}`).join(`\n`)
      const errMsg = `Error sending email: ${errorsStr ? `\n${errorsStr}` : err.message}`
      throw new Error(errMsg)
    }
  }

  private _prepareAttachments(attachments: MailerSendParams['attachments'] = []) {
    return attachments.map(({ filename, contentType, content }, index) => ({
      content: Buffer.isBuffer(content) ? content.toString('base64') : content,
      filename: filename || `attachment${index + 1}`,
      type: contentType,
      disposition: 'attachment',
    }))
  }
}
