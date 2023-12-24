import get from 'lodash.get'
import formData from 'form-data'
import Mailgun from 'mailgun.js'
import { IMailgunClient } from 'mailgun.js/Interfaces'

import { LogInterface } from "../logging"

const mailgun = new Mailgun(formData)

export interface MailerSendParams {
  to: string | string[], 
  replyTo?: string, 
  subject: string, 
  text: string, 
  html?: string, 
  attachments?: { filename?: string, contentType?: string, content: string | Buffer }[]
}

export class Mailer {
  private log: LogInterface
  private fromAddress: string
  private domain: string
  private mailClient: IMailgunClient

  constructor(params: { log: LogInterface, apiKey: string, endpoint: string, fromAddress: string }) {
    const { log, apiKey, endpoint, fromAddress } = params

    this.fromAddress = fromAddress
    this.domain = fromAddress.split('@')[1]
    this.log = log.create('mailer')
    this.mailClient = mailgun.client({
      username: 'api',
      url: endpoint,
      key: apiKey,
    })
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
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html: html || text,
      attachments: this._prepareAttachments(attachments),
    }

    if (replyTo) {
      attrs.replyTo = replyTo
    }

    try {
      await this.mailClient.messages.create(this.domain, attrs)      
    } catch (err: any) {
      const errors = get(err, 'response.body.errors', [])
      const errorsStr = errors.map((e: any) => `${e.field}: ${e.message}`).join(`\n`)
      const errMsg = `Error sending email: ${errorsStr ? `\n${errorsStr}` : err.message}`
      throw new Error(errMsg)
    }
  }

  private _prepareAttachments(attachments: MailerSendParams['attachments'] = []) {
    return attachments.map(({ filename, contentType, content }, index) => ({
      filename: filename || `attachment${index + 1}`,
      data: Buffer.isBuffer(content) ? content.toString('base64') : content,
      type: contentType,
    }))
  }
}
