/**
 * @name HideEmbedLink
 * @description Hides embed messages link.
 * @version 2.2.1
 * @author Dastan
 * @authorId 310450863845933057
 * @source https://github.com/Dastan21/BDAddons/blob/main/plugins/HideEmbedLink
 * @donate https://ko-fi.com/dastan
 */

/* global BdApi */

const FIX_LIST = [
  {
    match: /^https:\/\/.*youtu.be\/.*/,
    replace: href => 'https://www.youtube.com/watch?v=' + String(href).split('/')?.pop()?.split('?si=')[0],
  },
  {
    match: /^https:\/\/.*youtube.com\/shorts\/.*/,
    replace: href => 'https://www.youtube.com/watch?v=' + String(href).split('/')?.pop()?.split('?si=')[0],
  },
  {
    match: /^https:\/\/x.com\/.*/,
    replace: href => 'https://twitter.com/' + String(href).split('x.com/')?.pop(),
  },
]

// Discord classes
const embedSuppressButton = BdApi.Webpack.getByKeys('embedMedia', 'embedVideo', 'embedSuppressButton')?.embedSuppressButton ?? ''

// Icons
const ShowIcon = BdApi.React.createElement('path', { fill: 'currentColor', d: 'M113,37.66667c-75.33333,0 -103.58333,75.33333 -103.58333,75.33333c0,0 28.25,75.33333 103.58333,75.33333c75.33333,0 103.58333,-75.33333 103.58333,-75.33333c0,0 -28.25,-75.33333 -103.58333,-75.33333zM113,65.91667c25.99942,0 47.08333,21.08392 47.08333,47.08333c0,25.99942 -21.08392,47.08333 -47.08333,47.08333c-25.99942,0 -47.08333,-21.08392 -47.08333,-47.08333c0,-25.99942 21.08392,-47.08333 47.08333,-47.08333zM113,84.75c-15.60204,0 -28.25,12.64796 -28.25,28.25c0,15.60204 12.64796,28.25 28.25,28.25c15.60204,0 28.25,-12.64796 28.25,-28.25c0,-15.60204 -12.64796,-28.25 -28.25,-28.25z' })
const HideIcon = BdApi.React.createElement('path', { fill: 'currentColor', d: 'M37.57471,28.15804c-3.83186,0.00101 -7.28105,2.32361 -8.72295,5.87384c-1.4419,3.55022 -0.58897,7.62011 2.15703,10.29267l16.79183,16.79183c-18.19175,14.60996 -29.9888,32.52303 -35.82747,43.03711c-3.12633,5.63117 -3.02363,12.41043 0.03678,18.07927c10.87625,20.13283 42.14532,66.10058 100.99007,66.10058c19.54493,0 35.83986,-5.13463 49.36394,-12.65365l19.31152,19.31152c2.36186,2.46002 5.8691,3.45098 9.16909,2.5907c3.3,-0.86028 5.87708,-3.43736 6.73736,-6.73736c0.86028,-3.3 -0.13068,-6.80724 -2.5907,-9.16909l-150.66666,-150.66667c-1.77289,-1.82243 -4.20732,-2.8506 -6.74984,-2.85075zM113,37.66667c-11.413,0 -21.60375,1.88068 -30.91683,4.81869l24.11182,24.11182c2.23175,-0.32958 4.47909,-0.6805 6.80501,-0.6805c25.99942,0 47.08333,21.08392 47.08333,47.08333c0,2.32592 -0.35092,4.57326 -0.6805,6.80501l32.29623,32.29623c10.1135,-11.22467 17.51573,-22.61015 21.94157,-30.18115c3.3335,-5.68767 3.32011,-12.67425 0.16553,-18.4655c-11.00808,-20.27408 -42.2439,-65.78792 -100.80615,-65.78792zM73.77002,87.08577l13.77555,13.77556c-1.77707,3.67147 -2.79557,7.77466 -2.79557,12.13867c0,15.60342 12.64658,28.25 28.25,28.25c4.364,0 8.46719,-1.01851 12.13867,-2.79557l13.79395,13.79395c-9.356,6.20362 -21.03043,9.17606 -33.4733,7.24642c-19.75617,-3.06983 -35.88427,-19.19794 -38.9541,-38.9541c-1.92879,-12.43739 1.0665,-24.10096 7.26481,-33.45491z' })

// Cache
const hideLinksCache = {}

class EyeIcon extends BdApi.React.Component {
  constructor (props) {
    super(props)

    this.state = {
      show: false,
    }
  }

  componentDidMount () {
    this.setState({ show: !this.isHidden })
  }

  get isHidden () {
    return Array.from(this.links ?? []).every(($l) => $l.classList?.contains('hel-hideLink') ?? false)
  }

  get links () {
    return document.querySelectorAll(`div[id^='message-content-${this.props.messageId}'] a.hel-embedLink[href="${this.props.url}"]`)
  }

  render () {
    return BdApi.React.createElement('span', {
      className: `${embedSuppressButton} hel-eye`,
      onClick: () => {
        const isHidden = this.isHidden
        this.setState({ show: isHidden })
        this.links?.forEach(($l) => $l.classList.toggle('hel-hideLink', !isHidden))
        hideLinksCache[`${this.props.messageId}_${this.props.index}_${this.props.url}`] = !isHidden
      },
      title: `${this.state.show ? 'Hide' : 'Show'} link`,
    }, BdApi.React.createElement('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 226 226',
    }, this.state.show ? HideIcon : ShowIcon))
  }
}

module.exports = class HideEmbedLink {
  constructor (meta) {
    this.meta = meta

    this.settings = this.loadSettings()
  }

  start () {
    this.patchMessageContent()
    this.patchEmbed()
    this.patchMessageAccessories()

    BdApi.DOM.addStyle(this.meta.name, this.css)
  }

  stop () {
    BdApi.DOM.removeStyle(this.meta.name)
    BdApi.Patcher.unpatchAll(this.meta.name)
  }

  loadSettings () {
    const settingsData = BdApi.Data.load(this.meta.name, 'settings') ?? {}
    const settings = structuredClone(this.defaultSettings)
    this.prepareSettings(settings, settingsData)

    // Default value
    for (const setting of settings) {
      if (setting.type !== 'category') {
        settingsData[setting.id] ??= setting.value
      } else {
        for (const subSetting of setting.settings) {
          settingsData[setting.id] ??= {}
          settingsData[setting.id][subSetting.id] ??= subSetting.value
        }
      }
    }

    BdApi.Data.save(this.meta.name, 'settings', settingsData)

    return settingsData
  }

  prepareSettings (settings, settingsData) {
    for (const setting of settings) {
      if (setting.type !== 'category') {
        if (!Object.hasOwn(settingsData, setting.id)) {
          settingsData[setting.id] = setting.value
        } else {
          setting.value = settingsData[setting.id]
        }
      } else {
        this.prepareSettings(setting.settings, settingsData[setting.id] ?? {})
      }
    }
  }

  getSettingsPanel () {
    const settings = structuredClone(this.defaultSettings)

    this.prepareSettings(settings, this.settings)

    return BdApi.UI.buildSettingsPanel({
      settings,
      onChange: (category, id, value) => {
        const settingsData = BdApi.Data.load(this.meta.name, 'settings') ?? {}
        if (category != null) {
          settingsData[category] ??= {}
          settingsData[category][id] = value
        } else {
          settingsData[id] = value
        }
        BdApi.Data.save(this.meta.name, 'settings', settingsData)
      },
    })
  }

  patchMessageContent () {
    const MessageContentModule = BdApi.Webpack.getModules(m => m?.type?.toString().includes('isEdited'))?.[1]
    if (MessageContentModule?.type == null) {
      BdApi.Logger.error(this.meta.name, 'Cannot find MessageContent module')
      return
    }

    BdApi.Patcher.after(this.meta.name, MessageContentModule, 'type', (_, [props], ret) => {
      if (!props.message.embeds.length || !props.content.length) return

      let hasEmbeds = false
      ret.props.children[0].forEach(m => {
        if (m.props && this.hasEmbed(m, props.message.embeds)) {
          hasEmbeds = true
          m.props.className = 'hel-embedLink'
        }
      })
      if (!hasEmbeds) return

      props.message.showLinks = props.message.showLinks ?? false
      let i = 0
      ret.props.children[0].forEach((m) => {
        if (props.message.showLinks == null || m.props == null || !this.hasEmbed(m, props.message.embeds)) return

        const index = Math.min(i, props.message.embeds.length - 1)
        const isMedia = props.message.embeds[index].rawDescription == null
        const hide = hideLinksCache[`${props.message.id}_${index}_${m.props.href}`] ?? (isMedia || (!isMedia && !this.settings.hideMediasOnly))
        if (hide) m.props.className += ' hel-hideLink'
        i++
      })
    })
  }

  patchEmbed () {
    const EmbedModule = BdApi.Webpack.getModule(m => m.prototype?.constructor?.toString().includes('renderSuppressButton'), { searchExports: true })
    if (EmbedModule?.prototype?.render == null) {
      BdApi.Logger.error(this.meta.name, 'Cannot find Embed module')
      return
    }

    BdApi.Patcher.after(this.meta.name, EmbedModule.prototype, 'render', (t, _, ret) => {
      if (t.props.embed.url == null) return

      const messageId = t.props['aria-hel-id']
      const url = t.props['aria-hel-url']
      const index = t.props['aria-hel-index']
      ret.props['aria-hel-id'] = messageId
      ret.props['aria-hel-url'] = url
      ret.props['aria-hel-index'] = index
      if (messageId == null || url == null) return

      ret.props.children?.props?.children?.props?.children?.unshift(BdApi.React.createElement(EyeIcon, { messageId, url, index }))
    })
  }

  patchMessageAccessories () {
    const MessageAccessoriesModule = BdApi.Webpack.getModule(m => m.prototype?.constructor?.toString().includes('attachmentToDelete'), { searchExports: true })
    if (MessageAccessoriesModule?.prototype?.render == null) {
      BdApi.Logger.error(this.meta.name, 'Cannot find MessageAccessories module')
      return
    }

    BdApi.Patcher.after(this.meta.name, MessageAccessoriesModule.prototype, 'render', (t, _, ret) => {
      if (t.props?.message?.content == null || t.props.message.content === '') return

      const embeds = ret.props?.children?.find(c => Array.isArray(c) && c?.[0]?.key?.startsWith('embed'))
      if (embeds == null || embeds?.length < 1) return

      embeds.forEach((e, i) => {
        if (e.props?.children?.props == null) return

        e.props.children.props['aria-hel-id'] = t.props.message.id
        e.props.children.props['aria-hel-url'] = Array
          .from(document.querySelectorAll(`div[id='message-content-${t.props.message.id}'] a.hel-embedLink`))
          .find(link => this.isValid(link.getAttribute('href'), [t.props.message.embeds[i].url]))?.getAttribute('href')
        e.props.children.props['aria-hel-index'] = i
      })
    })
  }

  hasEmbed (m, embeds) {
    const embedURLs = embeds.map(e => e.url)
    if (!m.props) return false
    return m.type && this.isValid(m.props.href, embedURLs)
  }

  isValid (href, urls = []) {
    if (!href || !urls?.length) return false
    if (urls.includes(href)) return true
    return FIX_LIST.some(l => l.match.test(String(href)) && urls.includes(l.replace(href)))
  }

  get css () {
    return `
      div[id^="message-content-"]:not([class*="repliedTextContent"]) a.hel-embedLink.hel-hideLink,
      div[id^="message-content-"]:not([class*="repliedTextContent"]) span[class*="interactive"].hel-embedLink.hel-hideLink {
        display: none;
      }
      .hel-eye, .hel-eye ~ .${embedSuppressButton} {
        line-height: 0;
      }
      .hel-eye ~ .${embedSuppressButton} {
        top: 18px;
      }
      .hel-eye {
        user-select: none;
      }
    `
  }

  get defaultSettings () {
    return [
      {
        type: 'switch',
        id: 'hideMediasOnly',
        name: 'Hide Only Medias',
        note: 'Hide only medias links, like images, videos...',
        value: false,
      },
    ]
  }
}
