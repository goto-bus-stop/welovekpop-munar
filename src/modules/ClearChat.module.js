import { Module, command } from '../'
import { joinList } from '../utils'

const LINK_RX = /https?:\/\/(\S{4,})/i
const COMMAND_RX = /^!\S+/i

export default class ClearChat extends Module {
  author = 'ReAnna'
  description = 'Provides a !clearchat command to clean up spam.'

  init () {
    this.sekshi.cacheChat(true)
    // size of the default chat history in plug's UI
    this.sekshi.setChatCacheSize(512)
  }

  _delete (filter) {
    this.sekshi.getChat()
      .filter(filter)
      .reverse() // delete recent messages first
      .forEach((msg) => this.sekshi.removeChatMessage(msg.cid))
  }

  @command('clearchat', { role: command.ROLE.BOUNCER })
  clearchat (user, ...types) {
    if (types.length === 0) {
      types = [ 'all' ]
    }
    if (types.indexOf('all') !== -1) {
      this._delete(() => true)
      this.sekshi.sendChat(`@${user.username} Clearing chat!`)
      return
    }

    let dels = []
    let deletedUsers = []

    types.forEach((type) => {
      if (type === 'link' || type === 'links') {
        this._delete((msg) => LINK_RX.test(msg.message))
        dels.push('links')
      } else if (type === 'commands') {
        this._delete((msg) => COMMAND_RX.test(msg.message))
        dels.push('commands')
      } else if (type) {
        if (type.charAt(0) === '@') type = type.slice(1)
        let username = type.toLowerCase()
        this._delete((msg) => msg.username.toLowerCase() === username)
        // get proper capitalisation for users who are in the room
        let user = this.sekshi.getUserByName(type)
        deletedUsers.push(user ? user.username : type)
      }
    })

    if (deletedUsers.length > 0) {
      dels.push(`messages by ${joinList(deletedUsers)}`)
    }
    this.sekshi.sendChat(`@${user.username} Deleting ${joinList(dels)} from chat!`)
  }
}
