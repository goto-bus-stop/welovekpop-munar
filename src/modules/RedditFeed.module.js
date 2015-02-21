const Snoocore = require('snoocore')
const debug = require('debug')('sekshi:reddit-feed')
const Promise = require('promise')
const SekshiModule = require('../Module')

export default class RedditFeed extends SekshiModule {

  constructor(sekshi, options) {
    this.name = 'RedditFeed'
    this.author = 'schrobby'
    this.version = '0.3.0'
    this.description = 'Announces new submissions from a configurable list of subreddits.'

    super(sekshi, options)

    this.permissions = {
      addsubreddit: sekshi.USERROLE.MANAGER,
      removesubreddit: sekshi.USERROLE.MANAGER,
      listsubreddits: sekshi.USERROLE.NONE,
      setfeedinterval: sekshi.USERROLE.COHOST,
      updatereddit: sekshi.USERROLE.NONE
    }

    this.reddit = new Snoocore({ userAgent: `RedditFeed v${this.version} by /u/schrobby` })
    this.lastPost = ''
    this.timer = setTimeout(this.runTimer.bind(this), 0)
  }

  updatereddit() {
    clearTimeout(this.timer)
    this.runTimer()
  }

  defaultOptions() {
    return {
      subreddits: [ 'kpop' ],
      interval: 300000,
      format: '%feed | %title by %submitter | %link'
    }
  }

  destroy() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  runTimer() {
    debug('fetching new posts')
    const subs = this.options.subreddits
    var posts = []
    var requests = []
    var chunk = 50

    for (let i = 0, l = subs.length; i < l; i += chunk) {
      requests.push(subs.slice(i, i + chunk).join('+'))
    }

    let promises = requests.map(uri => {
      return this.reddit('/r/$subreddit/new')
        .listing({
          $subreddit: uri,
          before: this.lastPost,
          limit: 100
        })
        .then(result => result.children)
    })

    Promise.all(promises)
      .then(results => {
        let posts = results.reduce((posts, list) => posts.concat(list), [])
        debug('got new posts', posts.length)
        if (this.lastPost && this.enabled()) {
          posts.forEach(post => {
            this.sekshi.sendChat(`[r/kpop] ${post.data.author} posted: ` +
                              `${post.data.title} https://reddit.com/${post.data.id}`)
          })
        }

        if (posts.length > 0) {
          /*@TODO: find a way to reliably get the most recent post */
          this.lastPost = posts[0].data.name
        }

        this.timer = setTimeout(this.runTimer.bind(this), this.options.interval)
      })
      .catch(e => { debug('reddit error', e) })
  }

}