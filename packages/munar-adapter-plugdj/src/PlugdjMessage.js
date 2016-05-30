import { Message } from 'munar-core'

export default class PlugdjMessage extends Message {
  constructor (source, message, user) {
    super(source, message.message, message)

    this.user = user
  }

  get username () {
    return this.sourceMessage.username
  }

  delete () {
    this.source.removeMessage(this.sourceMessage.id)
  }
}
