const debug = require('debug')('sekshi:social-media')
const SekshiModule = require('../Module')

export default class Links extends SekshiModule {

  constructor(sekshi, options) {
    super(sekshi, options)

    this.author = 'ReAnna'
    this.version = '0.1.1'
    this.description = 'Throws links at people.'

    this.permissions = {
      fb: sekshi.USERROLE.NONE,
      web: sekshi.USERROLE.NONE,
      gh: sekshi.USERROLE.NONE,
      help: sekshi.USERROLE.NONE
    }
  }

  fb() {
    this.sekshi.sendChat('Like us on Facebook for the latest event announcements! https://facebook.com/welovekpop.club')
  }

  web() {
    this.sekshi.sendChat('Check out our website for rules, tutorials, popular videos and more! http://welovekpop.club')
  }

  gh() {
    this.sekshi.sendChat('SekshiBot is on Github! Check out https://github.com/welovekpop for code and goodies :)')
  }

  help(user) {
    this.sekshi.sendChat(`@${user.username} SekshiBot commands can be found on our website. http://welovekpop.club/sekshibot`)
  }

}
