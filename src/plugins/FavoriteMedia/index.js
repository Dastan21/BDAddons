/* global config */

/**
 * @param {import("zerespluginlibrary").Plugin} Plugin
 * @param {import("zerespluginlibrary").BoundAPI} Library
 */
module.exports = (Plugin, Library) => {
  const {
    WebpackModules,
    ReactComponents,
    ContextMenu,
    Utilities,
    ColorConverter,
    Toasts,
    Modals,
    Tooltip,
    DOMTools,
    ReactTools,
    DiscordModules: {
      React,
      ElectronModule,
      Dispatcher,
      LocaleManager,
      MessageStore,
      SelectedChannelStore,
      ChannelStore,
      UserStore,
      Permissions,
      Strings
    }, Patcher
  } = Library
  const { mkdir, lstat, writeFile } = require('fs')
  const path = require('path')
  const https = require('https')
  const BdApi = new window.BdApi('FavoriteMedia')
  const { Webpack, openDialog } = BdApi

  const classModules = {
    icon: WebpackModules.getByProps('hoverScale', 'buttonWrapper', 'button'),
    menu: WebpackModules.getByProps('menu', 'scroller', 'colorDefault'),
    result: WebpackModules.getByProps('desiredItemWidth', 'results', 'result'),
    input: WebpackModules.getByProps('inputWrapper', 'input', 'focused'),
    role: WebpackModules.getByProps('roleCircle'),
    _gif: WebpackModules.getByProps('container', 'gifFavoriteButton', 'embedWrapper'),
    gif: WebpackModules.getByProps('size', 'gifFavoriteButton', 'selected'),
    image: WebpackModules.getByProps('flexCenter', 'imageWrapper', 'imageWrapperBackground'),
    control: WebpackModules.getByProps('container', 'labelRow', 'control'),
    category: WebpackModules.getByProps('container', 'categoryFade', 'categoryFadeBlurple'),
    textarea: WebpackModules.getByProps('textAreaHeight', 'channelTextArea', 'highlighted'),
    gutter: WebpackModules.getByProps('gutterSize', 'container', 'content'),
    _flex: WebpackModules.getByProps('_flex', '_horizontal', '_horizontalReverse'),
    flex: WebpackModules.getByProps('flex', 'alignStart', 'alignEnd'),
    title: WebpackModules.getByProps('title', 'h1', 'h2'),
    container: WebpackModules.getByProps('container', 'inner', 'pointer'),
    scroller: WebpackModules.getByProps('scrollerBase', 'thin', 'fade'),
    look: WebpackModules.getByProps('lowSaturationUnderline', 'button', 'lookFilled'),
    audio: WebpackModules.getByProps('wrapper', 'wrapperAudio', 'wrapperPaused'),
    contentWrapper: WebpackModules.getByProps('contentWrapper', 'resizeHandle', 'drawerSizingWrapper'),
    buttons: WebpackModules.getByProps('profileBioInput', 'buttons', 'attachButton')
  }
  const classes = {
    icon: {
      icon: classModules.icon.icon,
      active: classModules.icon.active,
      button: classModules.icon.button,
      buttonWrapper: classModules.icon.buttonWrapper
    },
    menu: {
      item: classModules.menu.item,
      labelContainer: classModules.menu.labelContainer,
      label: classModules.menu.label,
      colorDefault: classModules.menu.colorDefault,
      focused: classModules.menu.focused
    },
    result: {
      result: classModules.result.result,
      favButton: classModules.result.favButton,
      emptyHints: classModules.result.emptyHints,
      emptyHint: classModules.result.emptyHint,
      emptyHintCard: classModules.result.emptyHintCard,
      emptyHintFavorite: classModules.result.emptyHintFavorite,
      emptyHintText: classModules.result.emptyHintText,
      gif: classModules.result.gif,
      endContainer: classModules.result.endContainer
    },
    input: {
      inputDefault: classModules.input.inputDefault,
      inputWrapper: classModules.input.inputWrapper
    },
    roleCircle: classModules.role.roleCircle,
    gif: {
      gifFavoriteButton1: classModules._gif.gifFavoriteButton,
      size: classModules.gif.size,
      gifFavoriteButton2: classModules.gif.gifFavoriteButton,
      selected: classModules.gif.selected,
      showPulse: classModules.gif.showPulse,
      icon: classModules.gif.icon
    },
    image: {
      imageAccessory: classModules.image.imageAccessory,
      clickable: classModules.image.clickable,
      embedWrapper: classModules._gif.embedWrapper,
      imageWrapper: classModules.image.imageWrapper
    },
    control: classModules.control.control,
    category: {
      categoryFade: classModules.category.categoryFade,
      categoryText: classModules.category.categoryText,
      categoryName: classModules.category.categoryName,
      categoryIcon: classModules.category.categoryIcon,
      container: classModules.category.container
    },
    textarea: {
      channelTextArea: classModules.textarea.channelTextArea,
      buttonContainer: classModules.textarea.buttonContainer,
      button: classModules.textarea.button
    },
    gutter: {
      header: classModules.gutter.header,
      backButton: classModules.gutter.backButton,
      searchHeader: classModules.gutter.searchHeader,
      searchBar: classModules.gutter.searchBar,
      content: classModules.gutter.content,
      container: classModules.gutter.container
    },
    flex: {
      flex: classModules._flex.flex,
      horizontal: classModules._flex.horizontal,
      justifyStart: classModules.flex.justifyStart,
      alignCenter: classModules.flex.alignCenter,
      noWrap: classModules.flex.noWrap
    },
    h5: classModules.title.h5,
    container: {
      container: classModules.container.container,
      medium: classModules.container.medium,
      inner: classModules.container.inner,
      input: classModules.container.input,
      iconLayout: classModules.container.iconLayout,
      iconContainer: classModules.container.iconContainer,
      pointer: classModules.container.pointer,
      clear: classModules.container.clear,
      visible: classModules.container.visible
    },
    scroller: {
      thin: classModules.scroller.thin,
      scrollerBase: classModules.scroller.scrollerBase,
      fade: classModules.scroller.fade,
      content: classModules.scroller.content
    },
    look: {
      button: classModules.look.button,
      lookBlank: classModules.look.lookBlank,
      colorBrand: classModules.look.colorBrand,
      grow: classModules.look.grow,
      contents: classModules.look.contents
    },
    audio: {
      wrapperAudio: classModules.audio.wrapperAudio
    },
    contentWrapper: {
      contentWrapper: classModules.contentWrapper.contentWrapper
    },
    buttons: {
      buttons: classModules.buttons.buttons
    }
  }

  const canClosePicker = { context: '', value: true }
  let closeExpressionPickerKey = ''
  let currentChannelId = ''
  let currentTextareaInput = null

  let ChannelTextAreaButtons
  let ComponentDispatch
  const EPS = {}
  const EPSModules = Webpack.getModule(m => Object.keys(m).some(key => m[key]?.toString?.().includes('isSearchSuggestion')))
  const EPSConstants = Webpack.getModule(Webpack.Filters.byProps('FORUM_CHANNEL_GUIDELINES', 'CREATE_FORUM_POST'), { searchExports: true })
  const GIFUtils = {
    favorite: Webpack.getModule(m => m.toString?.()?.includes('updateAsync("favoriteGifs'), { searchExports: true }),
    unfavorite: Webpack.getModule(m => m.toString?.()?.includes('delete t.gifs'), { searchExports: true })
  }
  const PermissionsConstants = Webpack.getModule(Webpack.Filters.byProps('ADD_REACTIONS'), { searchExports: true })
  const MediaPlayer = Webpack.getModule(m => m.Types?.VIDEO, { searchExports: true })
  const Image = Webpack.getModule(m => m.defaultProps?.zoomable)
  const FilesUpload = Webpack.getModule(Webpack.Filters.byProps('addFiles'))
  const MessagesManager = Webpack.getModule(Webpack.Filters.byProps('sendMessage'))

  const DEFAULT_BACKGROUND_COLOR = '#202225'
  const MediaLoadFailImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABVCAYAAACBzexXAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAxtSURBVHhe7Z17cBXVGcC/b3fvKyFvDCDUgCCd0lKpL5BAEhIgGCBoASmjdKYdSnW0Wlst9I+OdsaOTK3tTGtbpZ1pdRxxLD5AURKQCAKiKIgPKFIUEEkIgUCSe3Mfu/v1O2c3EDqRkAA153p+M5s9+7h3d+/3Pmd3AxqNRqPRaDQajUaj0Wg0Go1Go9FoNBqNRqPRaDQajSaNQH+eVtAlMxASSYSWqL+mJxCAYQDkZRMee4UXNEpAhTORQqUmwVjTX3XeUKiMNSG9SQsPQOZEA503XH8R6BsLcuHo8UJoamYB9vQSicAyLbhs0GH85NlmgnEmwlbH35h2KK8ABFcZCNtd+v6DIXi+rgriqTl8VaPBpVxwTulETzEgYB2DQQUL8eDz2yij3MLYetvfllYorQAEV1sI79qUM3Ucx/xHIGmPZ8H7Wy8AlnmAp0qM1+0hY4KF7qa0UwJlYxzBGLZ8Fn7h9DnQ1v4qxJMsfJcFxAog1Jq3MsIFCI3ozWSDbReB7ayk4XO/LoRP4UkWr08rlPQAFC4zMf66w5Y/GaLxVSykCK+1AQ0LAuY2zuKfZRe+E1qjbXyJ53KNnDjSSTDNG1mJfs3iFwogPpfkKQhB6yMIhyqxpfZzgvGcE2xJ25ygz0M5lVKgNGxOIQVL9rFAOGsrtjkRtClz8mL624qA3LEXULBsLmGx+D6HcILLk2gn5TECJdvo6h8M9vYrTRtPoJwHoABbYGqLQ/0m3w/R9gfYVh2+CoSszDvZQv/KposQKTHBNghSKWHJZ0c4CCLOJTYnKTRpASSTT0r7N/Aj9gg7IGXfyktJ/tYge5UtkJ1VhU0vn0znxLDPQvlVnvWPvCWLLf4D3/qJLfIpuR5GmzRkdo+Vmq1eWjQrwC2+BxDT+6xkeRQp/ycZcjkujxcsfY2m3J0t9x8w84L1OXxZqJUEJhKecBsar2FpF8m2gQ5kRpbJduYAwEPPdW/1X0xn5QlAW6sNDSsXgmW9INSDN8ch5ZTDhveepEhpEI+85FBWpdKdRWqdfMr2BJTk7BwoS7YN3A/52e/JNhm9K/xNDheCsJXyqgdeNI0wZGVnYE6WDUVD5nMSWMPqEeZwkeDjz+LA8zTNWRLG1hqX+k9XVgnUOvGkH3ITydCpej8QaIZw0NsQYSPtDaGg92UufMayPyHbREPZ8q+T7b17knDlFQvAMjd4ngASXHnMhlfeXkYwysCm1S7lTFNSCdTUXJL1vYdlGJDvOQMu17x5Twn6CjBiyHYuIT+WkUAoWEvbUiqoGoHwDuFby45CKDyDleVt3lMoYAJiiQUQKnycNu428OQa9gQzOocQJVDVdZ3+oTk9A9cvy0W7F2Dzq0ThUhN3/CPO3uRRPwwkwXFHwcm2dRSZdCflVt4AA3JyYGRRNSvdDt8TpDgsLYRpd/6RbrzXgKZ98vtUQtnYdRohrA596L0BYnyDQzDMgNa1T7Grf4JXBXmy2dUXQTz5J2iLvQCfNW6Gw0cGQjBQxaFnF28PyN7H9vgdULt9FsJuInOCUpVBGijABSQylBCRIBS5jZO+R8FEL6YIx2LbJiRTReDQTVz/N8Dgwls55DTxFlNujyUGil15u5ypglaATmB7HdElMxFb18QxXvcTiIRnQiiwgiuCfWzxxJb/IWcfy+XORQW7edsn4mNyWXgLBdEK0AnKqEA8+hJRfiW7gUEGtq17GZ5+aB5khK+Hywd/B4YPrsCWmj1y53iKLZ86dzv3Pv58iaSBApybyyUYz8V+AQv2SqRB1WcIi6wSXn+tgbHXiIxiA4/XEEK9S8EyE2df72Lr2qO4Z/lHuPvpRirwa37L4gPzxxRHVQU4/cOLmC3u4TsLlDUFEba4ULWQ5zsJ61cJK5cfolAZor2RBb7NpdG3muhuPlViYvJ1h/KnI4XKkXKnGlwJIFgcCtIIVRWgo+AndsMWZ+meRbMY/xfKm2awBRNlT/0m1L65gku6ZTRu0QC2cpf6TbIg0eztZ5Usgd0HayijvFIuB8bL3waPryZMrCc8UeviiRo6t9FldVBLASy/wgoGGrhWFy4YwaW98PCidrkeu+gJbt7pzZOppZzJ38TK8iPY/em/aO6v+mNbnS08AhkTHuJyjye7guv6x2nsoixMbVGyY6enKKUA7Kq5yPoWsmt+gROzRZAR+j0Eg/dg2ViXMtnNN7zYhXvO8GamUe8P/UahNTYRXtr0JHuD/mRO/C0r0RLeI+Hv1wDzK+OyHU6bYf8vRLkQgPChFDJn6H/nevzneGLNIbkcXdt1bC4c5a2/tHAJe46NvGcml3IpiCdu4Ex+AzjufbxVuI4Q5xKfQiC4EH86O0XAyeChrhQqvVA1B+AYPdEka4JJmZPP6qaxkcu67CkG7l1+HApy5kFADOgAl29oszcYxW3Rj2ywd/iYM/tqbK1lDWPhw+lkMJ1RVgEw9YbDVu1idF23Voota11OBi08vLIBrhj6Xc4lDvJq4d9TPAnh2xC05nNo+ZCTweBXRfgCJRWACrw7g/Dg8+IOnW6vgYZ/D7F5jU3EZcLBw4vZ7Q8Rq3kSHTmurCRsdzENm5PJeUaSIuVpn/x1oJwC0MAqFM/s0dZdBk29JwOTG1yCorMLbN8z3jy38g8Qi/8CSBo4cswX1YMoLWxwnJvhUONyGnZzDravJ8qs+EoogVIKQP0mc6bPws+Zkgtld/wFNu6o5XWlCAfYtou7vBaCq8XgrsgD7uPs/25wXZHhGxAOHIL+2XN40xqeRDiIQcqZCQ1HH5UfjO4Euqzn9xeqhloeoC3qnW8sOQsSyR9zTV/MAn2AqpcEkDa7VHjjGQKj62/j5Xe9Bdup5n1FK8zVQD0U5M7FxtWvQHbWD7mk3Mz+gOtFjgq2M53GLcpDaCJo96rBdEaxEOCfbsqOnOoMNoxcaGwSY/fcPtNg8c3HCHCiv2A8zNPHEAzugPycWfj5i1s51gexpaYexoycCxmh1fz5wxCwfoNblzWLMQM8ulqXgX2Uzk/mON7ATNcgvcE5wlXI1cIqtvwKtvwp2LBqG8F1Jsf6pOjjxy2P1cPwr82DSHgCxtY/Ij8YzpezdEdVBehs6sgR3m92DcJ20d1rYKLuENa/eEyMDCK8LZVI9PHTwGrE95+IYvS1TwkGye/GeF3aW79AVQXohJBTh6y+WGbobnIpUGqIR8vkyGAn2COQUALxQgiE+m4E3/lY3eyqAKoqwOlfXvTvdwwHdzNSh6kNLp6s6VJqQgkw8Xr3HUDoH8vg6vHM4ympDWoqAFfwfktk7S40erfyc1XgzS8mHZXBkeOcjHZ6AwV2aIZaqHXSYf8OrEgocSrjT9p5kHC9Ybt2b1T4otKhZK2xAKRSebItzkWck6DjHBVBLQUI+nfjhIP72eJaZJtoGLRFr5Ft8/9wPZZ/DNu9lv9eLtviXMKB/bLdcY6KoJYCZEa8H3dk0TtsdQdk2yUDou23y3a0HqhwxkW7JhpQjdBW7y20tS8Cx78FCXE/jBjyjmxnhJVSgLNnTX0QMQSM9iaHMioWczxeyh5AvBnEZAu8C9vrZDeufNxbWKLjdnu/YLeIElMMIpmc8SV2uggnXOo3+XaIxv/M68W7CSwIBX/JZeNSsor53DZ37qPQXGjEDZ5yPmJeHlklH/jP8tuEE2wu4+6nirsy5Y4XATGayIp3LxkTbXlM8b4Aq+TfNHR2f7ndPzeVUO6EBRSaJDp1hCUWQ3tiFThOPl9Kiq8mAJb5AVv/SrCsrZBINssETVxlbxyzKPOEFzEN8RzgGEik5vCxivm7xEMgFlhGFEKhmRhdV0cZ5SbG1itn/UoqgIDCk0x2uxwKyku5EniGy0HxaJYnGIEQvHjZE0rRn891im/hOCJCgVzmY5AFpnkC+ucsxCMvPye7lf2eRdVQVgEEFCm3sH29TfnTvs0x+UFI2dNlUnjRYA0QOYVlvslx/2fYunYrwVUWwnYlHwsTKK0AAlYCMagjrY/yplVAPDGfS7QxHLAL2SvIfc4bg92JwaWeaeyCcGgFjB29Emt/F/fuNXi3+97DPozyCiCQL3VO/IdT9UPSSctEcNeBS6G+SYQDz3H3GpZvFueVA/ObcO+z4mlgCQXKDEydQ9dxHyctFEAgM3DHNiAW44t666LEY4LRBgTyELKzXDyWHvcKpI0CdIYGz0KIJRCaW/015wPLWbx7KDNC2KT/f4BGo9FoNBqNRqPRaDQajUaj0Wg0Go1Go9FoNBqNRqPpuwD8F4Nj88ZHDvtKAAAAAElFTkSuQmCC'
  const ImageSVG = () => React.createElement('svg', { className: classes.icon.icon, 'aria-hidden': 'false', viewBox: '0 0 384 384', width: '24', height: '24' }, React.createElement('path', { fill: 'currentColor', d: 'M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z' }))
  const VideoSVG = () => React.createElement('svg', { className: classes.icon.icon, 'aria-hidden': 'false', viewBox: '0 0 298 298', width: '24', height: '24' }, React.createElement('path', { fill: 'currentColor', d: 'M298,33c0-13.255-10.745-24-24-24H24C10.745,9,0,19.745,0,33v232c0,13.255,10.745,24,24,24h250c13.255,0,24-10.745,24-24V33zM91,39h43v34H91V39z M61,259H30v-34h31V259z M61,73H30V39h31V73z M134,259H91v-34h43V259z M123,176.708v-55.417c0-8.25,5.868-11.302,12.77-6.783l40.237,26.272c6.902,4.519,6.958,11.914,0.056,16.434l-40.321,26.277C128.84,188.011,123,184.958,123,176.708z M207,259h-43v-34h43V259z M207,73h-43V39h43V73z M268,259h-31v-34h31V259z M268,73h-31V39h31V73z' }))
  const AudioSVG = () => React.createElement('svg', { className: classes.icon.icon, 'aria-hidden': 'false', viewBox: '0 0 115.3 115.3', width: '24', height: '24' }, React.createElement('path', { fill: 'currentColor', d: 'M47.9,14.306L26,30.706H6c-3.3,0-6,2.7-6,6v41.8c0,3.301,2.7,6,6,6h20l21.9,16.4c4,3,9.6,0.2,9.6-4.8v-77C57.5,14.106,51.8,11.306,47.9,14.306z' }), React.createElement('path', { fill: 'currentColor', d: 'M77.3,24.106c-2.7-2.7-7.2-2.7-9.899,0c-2.7,2.7-2.7,7.2,0,9.9c13,13,13,34.101,0,47.101c-2.7,2.7-2.7,7.2,0,9.899c1.399,1.4,3.199,2,4.899,2s3.601-0.699,4.9-2.1C95.8,72.606,95.8,42.606,77.3,24.106z' }), React.createElement('path', { fill: 'currentColor', d: 'M85.1,8.406c-2.699,2.7-2.699,7.2,0,9.9c10.5,10.5,16.301,24.4,16.301,39.3s-5.801,28.8-16.301,39.3c-2.699,2.7-2.699,7.2,0,9.9c1.4,1.399,3.2,2.1,4.9,2.1c1.8,0,3.6-0.7,4.9-2c13.1-13.1,20.399-30.6,20.399-49.2c0-18.6-7.2-36-20.399-49.2C92.3,5.706,87.9,5.706,85.1,8.406z' }))
  const ColorDot = props => React.createElement('div', { className: classes.roleCircle + ' fm-colorDot', style: { 'background-color': props.color || DEFAULT_BACKGROUND_COLOR } })
  const labels = setLabelsByLanguage()

  function getUrlName (url) {
    // tenor case, otherwise it would always return 'tenor'
    if (url.startsWith('https://tenor.com/view/') || url.startsWith('https://media.tenor.com/view/')) return url.match(/view\/(.*)-gif-/)?.[1]
    return url.replace(/\.([^.]*)$/gm, '').split('/').pop()
  }

  function getUrlExt (url) {
    return url.match(/\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi)?.[0] ?? ''
  }

  async function sendInTextarea () {
    return await new Promise((resolve, reject) => {
      try {
        const enterEvent = new KeyboardEvent('keydown', { charCode: 13, keyCode: 13, bubbles: true })
        setTimeout(() => {
          currentTextareaInput?.dispatchEvent(enterEvent)
          resolve()
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  function uploadFile (type, buffer, media) {
    // if the textarea has not been patched, file uploading will fail
    if (currentTextareaInput == null || !document.body.contains(currentTextareaInput)) return console.error('[FavoriteMedia]', 'Could not find current textarea, upload file canceled.')
    const isGIF = type === 'gif'
    const ext = getUrlExt(media.url)
    const fileName = `${isGIF ? getUrlName(media.url).replace(/ /g, '_') : media.name}${ext}`
    const mime = `${isGIF ? 'image' : type}/${ext.slice(1)}`
    const file = new File([buffer], fileName, { type: mime })
    FilesUpload.addFiles({
      channelId: currentChannelId,
      draftType: 0,
      files: [{ file, platform: 1 }],
      showLargeMessageDialog: false
    })
  }

  async function fetchMedia (media) {
    return await new Promise((resolve, reject) => {
      https.get(media.url, (res) => {
        let bufs = []
        res.on('data', (chunk) => bufs.push(chunk))
        res.on('end', async () => {
          // no longer cached on Discord CDN
          const td = new TextDecoder('utf-8')
          if (td.decode(bufs[0].subarray(0, 5)) === '<?xml') return reject(new Error('Media no longer cached on the server'))
          // tenor GIF case
          if (media.url.startsWith('https://tenor.com/view/')) {
            const td = new TextDecoder('utf-8')
            if (td.decode(bufs[0].subarray(0, 15)) === '<!DOCTYPE html>') {
              bufs = bufs.map((b) => td.decode(b))
              media.url = String(bufs).match(/src="(https:\/\/media\.tenor\.com\/[^"]*)"/)?.[1]
              media.name = media.url.match(/view\/(.*)-gif-/)?.[1]
              bufs = await new Promise((resolve, reject) => {
                https.get(media.url, (res) => {
                  const bufsGIF = []
                  res.on('data', chunk => bufsGIF.push(chunk))
                  res.on('end', () => resolve(bufsGIF))
                  res.on('error', (err) => reject(err))
                })
              })
            }
          }
          resolve(Buffer.concat(bufs))
        })
        res.on('error', (err) => reject(err))
      })
    })
  }

  function findTextareaInput ($button = document.getElementsByClassName(classes.textarea.buttonContainer).item(0)) {
    return $button?.closest(`.${classes.textarea.channelTextArea}`)?.querySelector('[role="textbox"]')
  }

  function findSpoilerButton () {
    return currentTextareaInput?.closest(`.${classes.textarea.channelTextArea}`)?.querySelector('[role="button"]:first-child')
  }

  function findMessageIds ($target) {
    if ($target == null) return [null, null]
    const ids = $target.closest('[id^="chat-messages-"]')?.getAttribute('id').split('-')?.slice(2)
    if (ids == null) return [null, null]
    return ids
  }

  function findMessageLink ($target) {
    if ($target == null) return
    try {
      const [channelId, messageId] = findMessageIds($target)
      const guildId = location.href.match(/channels\/(\d+)/)?.[1]
      return `${location.origin}/channels/${guildId}/${channelId}/${messageId}`
    } catch (error) {
      console.error('[FavoriteMedia]', error)
    }
  }

  function findSourceLink ($target, url) {
    if ($target == null) return
    try {
      const [channelId, messageId] = findMessageIds($target)
      const embed = MessageStore.getMessage(channelId, messageId)?.embeds?.find((e) => {
        if (Array.isArray(e.images)) return e.images.find((i) => i.url === url) != null
        if (e.thumbnail != null) return e.thumbnail?.url === url || e.thumbnail?.proxyURL === url
        return e.image?.url === url || e.image?.proxyURL === url
      })
      if (embed == null) return
      return embed.url
    } catch (error) {
      console.error('[FavoriteMedia]', error)
    }
  }

  function loadModules () {
    loadEPS()
    loadComponentDispatch()
    loadChannelTextAreaButtons()
  }

  function loadEPS () {
    if (EPSModules == null) return
    Object.entries(EPSModules).forEach(([key, fn]) => {
      const code = String(fn)
      if (code.includes('useDebugValue') && fn.getState) {
        EPS.useExpressionPickerStore = fn
      } else if (code.includes('===')) {
        EPS.toggleExpressionPicker = fn
      } else if (code.includes('activeView:null,activeViewType:null')) {
        EPS.closeExpressionPicker = fn
        closeExpressionPickerKey = key
      }
    })
  }

  function loadComponentDispatch () {
    if (ComponentDispatch != null) return
    ComponentDispatch = Webpack.getModule(m => m.dispatchToLastSubscribed && m.emitter?.listeners('CLEAR_TEXT').length && m.emitter?.listeners('INSERT_TEXT').length, { searchExports: true })
  }

  // https://github.com/Strencher/BetterDiscordStuff/blob/master/InvisibleTyping/InvisibleTyping.plugin.js#L483-L494
  function loadChannelTextAreaButtons () {
    const vnode = ReactTools.getReactInstance(document.querySelector(`.${classes.buttons.buttons}`))
    if (!vnode) return
    for (let curr = vnode, max = 100; curr !== null && max--; curr = curr.return) {
      const tree = curr?.pendingProps?.children
      let buttons
      if (Array.isArray(tree) && (buttons = tree.find(s => s?.props?.type && s.props.channel && s.type?.$$typeof))) {
        ChannelTextAreaButtons = buttons.type
        return
      }
    }
  }

  const MediaMenuItemInput = class extends React.Component {
    componentDidMount () {
      const media = Utilities.loadData(config.name, this.props.type, { medias: [] }).medias[this.props.id]
      this.refs.inputName.value = media.name || ''
      this.refs.inputName.onkeydown = (e) => {
        // allow space input
        if (e.key === ' ') {
          const cursor = e.target.selectionStart
          this.refs.inputName.value = this.refs.inputName.value.slice(0, cursor) + ' ' + this.refs.inputName.value.slice(cursor)
          this.refs.inputName.setSelectionRange(cursor + 1, cursor + 1)
        }
        e.stopPropagation()
      }
    }

    componentWillUnmount () {
      const name = this.refs.inputName.value
      if (!name || name === '') return
      const typeData = Utilities.loadData(config.name, this.props.type, { medias: [] })
      if (!typeData.medias.length) return
      if (!typeData.medias[this.props.id]) return
      typeData.medias[this.props.id].name = name
      Utilities.saveData(config.name, this.props.type, typeData)
      this.props.loadMedias()
    }

    render () {
      return React.createElement('div', {
        className: `${classes.menu.item} ${classes.menu.labelContainer}`,
        role: 'menuitem',
        id: 'media-input',
        tabindex: '-1'
      },
      React.createElement('input', {
        className: classes.input.inputDefault,
        name: 'media-name',
        type: 'text',
        placeholder: labels.media.placeholder[this.props.type],
        maxlength: '40',
        ref: 'inputName'
      })
      )
    }
  }

  const CategoryMenuItem = class extends React.Component {
    constructor (props) {
      super(props)

      this.state = {
        focused: false
      }
    }

    render () {
      return React.createElement('div', {
        className: `${classes.menu.item} ${classes.menu.labelContainer} ${classes.menu.colorDefault}${this.state.focused ? ` ${classes.menu.focused}` : ''}`,
        role: 'menuitem',
        id: `${this.props.name}-${this.props.key}`,
        tabindex: '-1',
        onMouseOver: () => this.setState({ focused: true }),
        onMouseOut: () => this.setState({ focused: false })
      },
      React.createElement(ColorDot, { color: this.props.color }),
      React.createElement('div', { className: classes.menu.label }, this.props.name)
      )
    }
  }

  const MediaFavButton = class extends React.Component {
    constructor (props) {
      super(props)

      this.state = {
        favorited: this.isFavorited,
        pulse: false
      }

      this.updateFavorite = this.updateFavorite.bind(this)
      this.changeFavorite = this.changeFavorite.bind(this)
      this.favButton = this.favButton.bind(this)
    }

    componentDidMount () {
      this.tooltipFav = Tooltip.create(this.refs.tooltipFav, this.isFavorited ? Strings.Messages.GIF_TOOLTIP_REMOVE_FROM_FAVORITES : Strings.Messages.GIF_TOOLTIP_ADD_TO_FAVORITES, { style: 'primary' })
      Dispatcher.subscribe('FAVORITE_MEDIA', this.updateFavorite)
    }

    componentWillUnmount () {
      Dispatcher.unsubscribe('FAVORITE_MEDIA', this.updateFavorite)
    }

    get isFavorited () {
      return Utilities.loadData(config.name, this.props.type, { medias: [] }).medias.find(e => e.url === this.props.url) !== undefined
    }

    updateFavorite (data) {
      if (this.props.fromPicker) return
      if (data.url !== this.props.url) return
      const fav = this.isFavorited
      this.setState({ favorited: fav })
      this.tooltipFav.label = fav ? Strings.Messages.GIF_TOOLTIP_REMOVE_FROM_FAVORITES : Strings.Messages.GIF_TOOLTIP_ADD_TO_FAVORITES
    }

    changeFavorite () {
      if (this.state.favorited) MediaFavButton.unfavoriteMedia(this.props)
      else MediaFavButton.favoriteMedia(this.props)
      if (!this.props.fromPicker) this.setState({ favorited: this.isFavorited })
      Dispatcher.dispatch({ type: 'FAVORITE_MEDIA', url: this.props.url })
      if (this.props.fromPicker) return
      this.tooltipFav.label = this.state.favorited ? Strings.Messages.GIF_TOOLTIP_ADD_TO_FAVORITES : Strings.Messages.GIF_TOOLTIP_REMOVE_FROM_FAVORITES
      this.tooltipFav.hide()
      this.tooltipFav.show()
      this.setState({ pulse: true })
      setTimeout(() => {
        this.setState({ pulse: false })
      }, 200)
    }

    static getMediaDataFromProps (props) {
      let data = null
      switch (props.type) {
        case 'gif':
          data = {
            url: props.url,
            src: props.src,
            width: props.width,
            height: props.height,
            name: getUrlName(props.url),
            message: props.message,
            source: props.source
          }
          break
        case 'video':
          data = {
            url: props.url,
            poster: props.poster,
            width: props.width,
            height: props.height,
            name: getUrlName(props.url),
            message: props.message,
            source: props.source
          }
          break
        case 'audio':
          data = {
            url: props.url,
            name: getUrlName(props.url),
            ext: getUrlExt(props.url),
            message: props.message,
            source: props.source
          }
          break
        default: // image
          data = {
            url: props.url,
            width: props.width,
            height: props.height,
            name: getUrlName(props.url),
            message: props.message,
            source: props.source
          }
      }
      return data
    }

    static favoriteMedia (props) {
      // get message and source links
      const $target = props.target.current
      if ($target != null) {
        props.message = findMessageLink($target)
        props.source = findSourceLink($target, props.url)
      }
      if (props.type === 'gif') MediaFavButton.favoriteGIF(props)
      const typeData = Utilities.loadData(config.name, props.type, { medias: [] })
      if (typeData.medias.find(m => m.url === props.url)) return
      const data = MediaFavButton.getMediaDataFromProps(props)
      if (!data) return
      typeData.medias.push(data)
      Utilities.saveData(config.name, props.type, typeData)
    }

    static unfavoriteMedia (props) {
      const typeData = Utilities.loadData(config.name, props.type, { medias: [] })
      if (!typeData.medias.length) return
      if (props.type === 'gif') MediaFavButton.unfavoriteGIF(props)
      typeData.medias = typeData.medias.filter(e => e.url !== props.url)
      Utilities.saveData(config.name, props.type, typeData)
      if (props.fromPicker) Dispatcher.dispatch({ type: 'UPDATE_MEDIAS' })
    }

    static favoriteGIF (props) {
      GIFUtils.favorite({ ...props, format: 2 })
    }

    static unfavoriteGIF (props) {
      GIFUtils.unfavorite(props.url)
    }

    favButton () {
      return React.createElement('div', {
        className: `${this.props.fromPicker ? classes.result.favButton : classes.gif.gifFavoriteButton1} ${classes.gif.size} ${classes.gif.gifFavoriteButton2}${this.state.favorited ? ` ${classes.gif.selected}` : ''}${this.state.pulse ? ` ${classes.gif.showPulse}` : ''}`,
        tabindex: '-1',
        role: 'button',
        ref: 'tooltipFav',
        onClick: this.changeFavorite
      },
      React.createElement(StarSVG, {
        filled: this.state.favorited
      })
      )
    }

    render () {
      return this.props.fromPicker
        ? this.favButton()
        : React.createElement('div', {
          className: `${classes.image.imageAccessory} ${classes.image.clickable} fm-favBtn fm-${this.props.type}${!this.props.uploaded ? 'fm-uploaded' : ''}`
        }, this.favButton())
    }
  }

  const StarSVG = class extends React.Component {
    render () {
      return React.createElement('svg', {
        className: classes.gif.icon,
        'aria-hidden': 'false',
        viewBox: '0 0 24 24',
        width: '16',
        height: '16'
      },
      this.props.filled
        ? React.createElement('path', { fill: 'currentColor', d: 'M12.5,17.6l3.6,2.2a1,1,0,0,0,1.5-1.1l-1-4.1a1,1,0,0,1,.3-1l3.2-2.8A1,1,0,0,0,19.5,9l-4.2-.4a.87.87,0,0,1-.8-.6L12.9,4.1a1.05,1.05,0,0,0-1.9,0l-1.6,4a1,1,0,0,1-.8.6L4.4,9a1.06,1.06,0,0,0-.6,1.8L7,13.6a.91.91,0,0,1,.3,1l-1,4.1a1,1,0,0,0,1.5,1.1l3.6-2.2A1.08,1.08,0,0,1,12.5,17.6Z' })
        : React.createElement('path', { fill: 'currentColor', d: 'M19.6,9l-4.2-0.4c-0.4,0-0.7-0.3-0.8-0.6l-1.6-3.9c-0.3-0.8-1.5-0.8-1.8,0L9.4,8.1C9.3,8.4,9,8.6,8.6,8.7L4.4,9 c-0.9,0.1-1.2,1.2-0.6,1.8L7,13.6c0.3,0.2,0.4,0.6,0.3,1l-1,4.1c-0.2,0.9,0.7,1.5,1.5,1.1l3.6-2.2c0.3-0.2,0.7-0.2,1,0l3.6,2.2 c0.8,0.5,1.7-0.2,1.5-1.1l-1-4.1c-0.1-0.4,0-0.7,0.3-1l3.2-2.8C20.9,10.2,20.5,9.1,19.6,9z M12,15.4l-3.8,2.3l1-4.3l-3.3-2.9 l4.4-0.4l1.7-4l1.7,4l4.4,0.4l-3.3,2.9l1,4.3L12,15.4z' })
      )
    }
  }

  const ColorPicker = class extends React.Component {
    componentDidMount () {
      this.refs.inputColor.value = this.props.color || DEFAULT_BACKGROUND_COLOR
      this.props.setRef(this.refs.inputColor)
      this.refs.inputColor.parentNode.style['background-color'] = this.refs.inputColor.value
    }

    render () {
      return React.createElement('div', {
        className: 'category-input-color',
        style: { width: '48px', height: '48px', 'margin-top': '8px', 'border-radius': '100%' }
      },
      React.createElement('input', {
        type: 'color',
        id: 'category-input-color',
        name: 'category-input-color',
        ref: 'inputColor',
        onChange: e => { e.target.parentNode.style['background-color'] = e.target.value }
      })
      )
    }
  }

  const EmptyFavorites = class extends React.Component {
    render () {
      return React.createElement('div', {
        className: classes.result.emptyHints
      },
      React.createElement('div', {
        className: classes.result.emptyHint
      },
      React.createElement('div', {
        className: classes.result.emptyHintCard
      },
      React.createElement('svg', {
        className: classes.result.emptyHintFavorite,
        'aria-hidden': 'false',
        viewBox: '0 0 24 24',
        width: '16',
        height: '16'
      },
      React.createElement('path', {
        d: 'M0,0H24V24H0Z',
        fill: 'none'
      }),
      React.createElement('path', {
        fill: 'currentColor',
        d: 'M12.5,17.6l3.6,2.2a1,1,0,0,0,1.5-1.1l-1-4.1a1,1,0,0,1,.3-1l3.2-2.8A1,1,0,0,0,19.5,9l-4.2-.4a.87.87,0,0,1-.8-.6L12.9,4.1a1.05,1.05,0,0,0-1.9,0l-1.6,4a1,1,0,0,1-.8.6L4.4,9a1.06,1.06,0,0,0-.6,1.8L7,13.6a.91.91,0,0,1,.3,1l-1,4.1a1,1,0,0,0,1.5,1.1l3.6-2.2A1.08,1.08,0,0,1,12.5,17.6Z'
      })
      ),
      React.createElement('div', {
        className: classes.result.emptyHintText
      }, this.props.type === 'gif' ? Strings.Messages.NO_GIF_FAVORITES_HOW_TO_FAVORITE : labels.media.emptyHint[this.props.type])
      )
      ),
      React.createElement('div', {
        className: classes.result.emptyHint
      },
      React.createElement('div', {
        className: classes.result.emptyHintCard
      },
      React.createElement('div', {
        className: classes.result.emptyHintText
      }, labels.category.emptyHint)
      )
      )
      )
    }
  }

  const CategoryModal = class extends React.Component {
    constructor (props) {
      super(props)

      this.setRef = this.setRef.bind(this)
      this.getValues = this.getValues.bind(this)
    }

    setRef (input) {
      this.inputColor = input
    }

    componentDidMount () {
      this.props.modalRef(this)
      this.refs.inputName.value = this.props.name || ''
    }

    componentWillUnmount () {
      this.props.modalRef(undefined)
    }

    getValues () {
      return {
        name: this.refs.inputName && this.refs.inputName.value,
        color: this.inputColor && this.inputColor.value
      }
    }

    render () {
      return React.createElement('div', {
        className: classes.control,
        style: { display: 'grid', 'grid-template-columns': 'auto 70px', 'margin-right': '-16px' }
      },
      React.createElement('div', {
        className: classes.input.inputWrapper,
        style: { padding: '1em 0', 'margin-right': '16px' }
      },
      React.createElement('input', {
        className: classes.input.inputDefault,
        name: 'category-name',
        type: 'text',
        placeholder: labels.category.placeholder,
        maxlength: '20',
        ref: 'inputName'
      })
      ),
      React.createElement(ColorPicker, {
        color: this.props.color,
        setRef: this.setRef
      })
      )
    }
  }

  const CategoryCard = class extends React.Component {
    constructor (props) {
      super(props)

      this.onContextMenu = this.onContextMenu.bind(this)
      this.onDragStart = this.onDragStart.bind(this)
      this.onDrop = this.onDrop.bind(this)
      this.onError = this.onError.bind(this)
    }

    get nameColor () {
      const rgb = ColorConverter.getRGB(this.props.color)
      const brightness = Math.round(((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) + (parseInt(rgb[2]) * 114)) / 1000)
      if (brightness > 125) return 'black'
      return 'white'
    }

    get showColor () {
      return Utilities.loadSettings(config.name).hideThumbnail || !this.props.thumbnail
    }

    get isGIF () {
      return this.props.type === 'gif'
    }

    onContextMenu (e) {
      canClosePicker.context = 'contextmenu'
      canClosePicker.value = false
      const moveItems = []
      if (this.props.index > 0) {
        moveItems.push({
          id: 'category-movePrevious',
          label: labels.category.movePrevious,
          action: () => moveCategory(this.props.type, this.props.id, -1)
        })
      }
      if (this.props.index < this.props.length - 1) {
        moveItems.push({
          id: 'category-moveNext',
          label: labels.category.moveNext,
          action: () => moveCategory(this.props.type, this.props.id, 1)
        })
      }
      const items = [
        {
          id: 'category-copyColor',
          label: labels.category.copyColor,
          action: () => ElectronModule.copy(this.props.color || DEFAULT_BACKGROUND_COLOR)
        },
        {
          id: 'category-download',
          label: labels.category.download,
          action: () => MediaPicker.downloadCategory({ type: this.props.type, name: this.props.name, categoryId: this.props.id })
        },
        {
          id: 'category-edit',
          label: labels.category.edit,
          action: () => MediaPicker.openCategoryModal(this.props.type, 'edit', { name: this.props.name, color: this.props.color, id: this.props.id })
        }
      ]
      if (this.props.category_id != null) {
        items.push({
          id: 'category-removeFrom',
          label: labels.media.removeFrom,
          danger: true,
          action: () => MediaPicker.removeCategoryCategory(this.props.type, this.props.id)
        })
      }
      items.push({
        id: 'category-delete',
        label: labels.category.delete,
        danger: true,
        action: () => {
          const deleteCategories = () => {
            deleteCategory(this.props.type, this.props.id)
            this.props.setCategory()
          }
          if (MediaPicker.categoryHasSubcategories(this.props.type, this.props.id)) {
            Modals.showConfirmationModal(labels.category.delete, labels.category.deleteConfirm, {
              danger: true,
              onConfirm: () => deleteCategories(),
              confirmText: labels.category.delete,
              cancelText: Strings.Messages.CANCEL
            })
          } else {
            deleteCategories()
          }
        }
      })
      if (moveItems.length > 0) {
        items.unshift({
          id: 'category-move',
          label: labels.category.move,
          type: 'submenu',
          items: moveItems
        })
      }
      ContextMenu.openContextMenu(e, ContextMenu.buildMenu([{
        type: 'group',
        items
      }]), {
        onClose: () => {
          canClosePicker.context = 'contextmenu'
          canClosePicker.value = true
        }
      })
    }

    onDragStart (e) {
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'category', id: this.props.id }))
      e.dataTransfer.effectAllowed = 'move'
    }

    onDrop (e) {
      let data = e.dataTransfer.getData('text/plain')
      try {
        data = JSON.parse(data)
      } catch (err) {
        console.error('[FavoriteMedia]', err)
      }
      if (data == null) return
      if (data.type === 'media') {
        MediaPicker.changeMediaCategory(this.props.type, data.url, this.props.id)
      } else if (data.type === 'category') {
        if (data.id !== this.props.id) MediaPicker.changeCategoryCategory(this.props.type, data.id, this.props.id)
      }
      this.refs.category.classList.remove('category-dragover')
    }

    onError (e) {
      console.warn('[FavoriteMedia]', 'Could not load media:', this.props.thumbnail)
      e.target.src = MediaLoadFailImg
    }

    render () {
      return React.createElement('div', {
        className: classes.result.result,
        tabindex: '-1',
        role: 'button',
        style: {
          position: 'absolute',
          top: `${this.props.positions.top}px`,
          left: `${this.props.positions.left}px`,
          width: `${this.props.positions.width}px`,
          height: '110px'
        },
        ref: 'category',
        onClick: () => this.props.setCategory({ name: this.props.name, color: this.props.color, id: this.props.id, category_id: this.props.category_id }),
        onContextMenu: this.onContextMenu,
        onDragEnter: e => { e.preventDefault(); this.refs.category.classList.add('category-dragover') },
        onDragLeave: e => { e.preventDefault(); this.refs.category.classList.remove('category-dragover') },
        onDragOver: e => { e.stopPropagation(); e.preventDefault() },
        onDragStart: this.onDragStart,
        onDrop: this.onDrop,
        draggable: true
      },
      React.createElement('div', {
        className: classes.category.categoryFade,
        style: { 'background-color': `${this.showColor ? (this.props.color || DEFAULT_BACKGROUND_COLOR) : ''}` }
      }),
      React.createElement('div', { className: classes.category.categoryText },
        React.createElement('span', {
          className: classes.category.categoryName,
          style: this.showColor ? { color: this.nameColor, 'text-shadow': 'none' } : {}
        }, this.props.name)
      ),
      this.props.thumbnail && !Utilities.loadSettings(config.name).hideThumbnail
        ? React.createElement(this.isGIF && !this.props.thumbnail.endsWith('.gif') ? 'video' : 'img', {
          className: classes.result.gif,
          preload: 'auto',
          autoplay: this.isGIF ? '' : undefined,
          loop: this.isGIF ? 'true' : undefined,
          muted: this.isGIF ? 'true' : undefined,
          src: this.props.thumbnail,
          height: '110px',
          width: '100%',
          onError: this.onError
        })
        : null
      )
    }
  }

  const MediaCard = class extends React.Component {
    constructor (props) {
      super(props)

      this.state = {
        showControls: false,
        visible: this.props.positions.top < 350
      }

      this.changeControls = this.changeControls.bind(this)
      this.hideControls = this.hideControls.bind(this)
      this.sendMedia = this.sendMedia.bind(this)
      this.handleVisible = this.handleVisible.bind(this)
      this.onDragStart = this.onDragStart.bind(this)
      this.onError = this.onError.bind(this)
    }

    get isPlayable () {
      return ['video', 'audio'].includes(this.props.type)
    }

    get isGIF () {
      return this.props.type === 'gif'
    }

    get elementTag () {
      if (this.props.type === 'audio') return 'audio'
      else if (this.state.showControls || (this.isGIF && !this.props.src?.endsWith('.gif'))) return 'video'
      return 'img'
    }

    get elementSrc () {
      if (this.props.type === 'video' && !this.state.showControls) return this.props.poster
      if (this.isGIF) return this.props.src
      return this.props.url
    }

    handleVisible ({ scroll }) {
      if (scroll > this.props.positions.top) this.setState({ visible: true })
    }

    componentDidMount () {
      this.url = this.props.url
      if (this.isPlayable) this.tooltipControls = Tooltip.create(this.refs.tooltipControls, this.state.showControls ? labels.media.controls.hide : labels.media.controls.show, { style: 'primary' })
      Dispatcher.subscribe('TOGGLE_CONTROLS', this.hideControls)
      Dispatcher.subscribe('SCROLLING_MEDIAS', this.handleVisible)
      Dispatcher.subscribe('SEND_MEDIA', this.sendMedia)
    }

    componentWillUnmount () {
      Dispatcher.unsubscribe('TOGGLE_CONTROLS', this.hideControls)
      Dispatcher.unsubscribe('SCROLLING_MEDIAS', this.handleVisible)
      Dispatcher.unsubscribe('SEND_MEDIA', this.sendMedia)
    }

    componentDidUpdate () {
      if (this.url !== this.props.url && this.state.showControls) this.changeControls(false)
      if (this.isPlayable && !this.tooltipControls) this.tooltipControls = Tooltip.create(this.refs.tooltipControls, this.state.showControls ? labels.media.controls.hide : labels.media.controls.show, { style: 'primary' })
      this.url = this.props.url
      if (this.state.showControls) this.refs.media.volume = this.props.settings.mediaVolume / 100 || 0.1
    }

    changeControls (force) {
      this.setState((prevState) => {
        const newControls = force !== undefined ? force : !prevState.showControls
        if (this.tooltipControls) {
          this.tooltipControls.label = newControls ? labels.media.controls.hide : labels.media.controls.show
          this.tooltipControls.hide()
          this.tooltipControls.show()
          if (force !== undefined) this.tooltipControls.hide()
        }
        if (newControls) Dispatcher.dispatch({ type: 'TOGGLE_CONTROLS' })
        return ({ showControls: newControls })
      })
    }

    hideControls () {
      if (this.state.showControls) this.changeControls(false)
    }

    onDragStart (e) {
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'media', url: this.props.url }))
      e.dataTransfer.effectAllowed = 'move'
    }

    sendMedia (e) {
      loadComponentDispatch()
      const sendMedia = e.type === 'SEND_MEDIA'
      if (sendMedia) {
        if (e.mediaId !== this.props.id) return
        e = e.e
      }
      if (['path', 'svg'].includes(e.target.tagName)) return
      const shiftPressed = e.shiftKey
      if (!sendMedia && (this.props.settings.alwaysUploadFile || this.props.type === 'audio')) {
        const media = { url: this.props.url, name: this.props.name }
        fetchMedia(media).then((buffer) => {
          uploadFile(this.props.type, buffer, media)
          if (['both', 'file'].includes(this.props.settings.alwaysSendUpload)) {
            sendInTextarea().then(() => ComponentDispatch.dispatchToLastSubscribed('CLEAR_TEXT'))
          }
          if (!shiftPressed) EPS.closeExpressionPicker()
        }).catch((err) => console.error('[FavoriteMedia]', err))
      } else {
        if (!shiftPressed) {
          ComponentDispatch.dispatchToLastSubscribed('INSERT_TEXT', { content: this.props.url, plainText: this.props.url })
          if (['both', 'link'].includes(this.props.settings.alwaysSendUpload)) sendInTextarea().catch((err) => console.error('[FavoriteMedia]', err))
          EPS.closeExpressionPicker()
        } else {
          MessagesManager.sendMessage(currentChannelId, { content: this.props.url, validNonShortcutEmojis: [] })
        }
      }
    }

    onError (e) {
      if (e.target.tagName !== 'IMG') return
      console.warn('[FavoriteMedia]', 'Could not load media:', this.props.url)
      e.target.src = MediaLoadFailImg
    }

    render () {
      return React.createElement('div', {
        className: classes.result.result,
        tabindex: '-1',
        role: 'button',
        style: {
          position: 'absolute',
          top: `${this.props.positions.top}px`,
          left: `${this.props.positions.left}px`,
          width: `${this.props.positions.width}px`,
          height: `${this.props.positions.height}px`,
          'background-color': DEFAULT_BACKGROUND_COLOR
        },
        onContextMenu: e => this.props.onMediaContextMenu(e, this.props.id),
        onClick: this.sendMedia,
        onDragStart: this.onDragStart,
        draggable: true
      },
      this.isPlayable
        ? React.createElement('div', {
          className: `show-controls ${classes.gif.size}${this.state.showControls ? ` ${classes.gif.selected} active` : ''}`,
          tabindex: '-1',
          role: 'button',
          ref: 'tooltipControls',
          onClick: () => this.changeControls()
        },
        React.createElement('svg', {
          className: classes.gif.icon,
          'aria-hidden': 'false',
          viewBox: '0 0 780 780',
          width: '16',
          height: '16'
        },
        React.createElement('path', { fill: 'currentColor', d: 'M490.667,405.333h-56.811C424.619,374.592,396.373,352,362.667,352s-61.931,22.592-71.189,53.333H21.333C9.557,405.333,0,414.891,0,426.667S9.557,448,21.333,448h270.144c9.237,30.741,37.483,53.333,71.189,53.333s61.931-22.592,71.189-53.333h56.811c11.797,0,21.333-9.557,21.333-21.333S502.464,405.333,490.667,405.333zM362.667,458.667c-17.643,0-32-14.357-32-32s14.357-32,32-32s32,14.357,32,32S380.309,458.667,362.667,458.667z' }),
        React.createElement('path', { fill: 'currentColor', d: 'M490.667,64h-56.811c-9.259-30.741-37.483-53.333-71.189-53.333S300.736,33.259,291.477,64H21.333C9.557,64,0,73.557,0,85.333s9.557,21.333,21.333,21.333h270.144C300.736,137.408,328.96,160,362.667,160s61.931-22.592,71.189-53.333h56.811c11.797,0,21.333-9.557,21.333-21.333S502.464,64,490.667,64z M362.667,117.333c-17.643,0-32-14.357-32-32c0-17.643,14.357-32,32-32s32,14.357,32,32C394.667,102.976,380.309,117.333,362.667,117.333z' }),
        React.createElement('path', { fill: 'currentColor', d: 'M490.667,234.667H220.523c-9.259-30.741-37.483-53.333-71.189-53.333s-61.931,22.592-71.189,53.333H21.333C9.557,234.667,0,244.224,0,256c0,11.776,9.557,21.333,21.333,21.333h56.811c9.259,30.741,37.483,53.333,71.189,53.333s61.931-22.592,71.189-53.333h270.144c11.797,0,21.333-9.557,21.333-21.333C512,244.224,502.464,234.667,490.667,234.667zM149.333,288c-17.643,0-32-14.357-32-32s14.357-32,32-32c17.643,0,32,14.357,32,32S166.976,288,149.333,288z' })
        )
        )
        : null,
      React.createElement(MediaFavButton, {
        type: this.props.type,
        url: this.props.url,
        poster: this.props.poster,
        fromPicker: true
      }),
      this.state.visible
        ? React.createElement(this.elementTag, {
          className: classes.result.gif,
          preload: 'auto',
          autoplay: this.isGIF ? '' : undefined,
          loop: this.isGIF ? 'true' : undefined,
          muted: this.isGIF ? 'true' : undefined,
          src: this.elementSrc,
          poster: this.props.poster,
          width: this.props.positions.width,
          height: this.props.positions.height,
          ref: 'media',
          controls: this.state.showControls,
          style: this.props.type === 'audio' ? { position: 'absolute', bottom: '0', left: '0', 'z-index': '2' } : null,
          draggable: false,
          onError: this.onError
        })
        : null,
      this.props.type === 'audio'
        ? React.createElement('div', {
          className: classes.category.categoryFade,
          style: { 'background-color': DEFAULT_BACKGROUND_COLOR }
        })
        : null,
      this.props.type === 'audio'
        ? React.createElement('div', {
          className: classes.category.categoryText,
          style: { top: this.state.showControls ? '-50%' : null }
        },
        React.createElement('svg', {
          className: classes.category.categoryIcon,
          'aria-hidden': false,
          viewBox: '0 0 500 500',
          width: '16',
          height: '16'
        },
        React.createElement('path', { fill: 'currentColor', d: 'M328.712,264.539c12.928-21.632,21.504-48.992,23.168-76.064c1.056-17.376-2.816-35.616-11.2-52.768c-13.152-26.944-35.744-42.08-57.568-56.704c-16.288-10.912-31.68-21.216-42.56-35.936l-1.952-2.624c-6.432-8.64-13.696-18.432-14.848-26.656c-1.152-8.32-8.704-14.24-16.96-13.76c-8.384,0.576-14.88,7.52-14.88,15.936v285.12c-13.408-8.128-29.92-13.12-48-13.12c-44.096,0-80,28.704-80,64s35.904,64,80,64s80-28.704,80-64V165.467c24.032,9.184,63.36,32.576,74.176,87.2c-2.016,2.976-3.936,6.176-6.176,8.736c-5.856,6.624-5.216,16.736,1.44,22.56c6.592,5.888,16.704,5.184,22.56-1.44c4.288-4.864,8.096-10.56,11.744-16.512C328.04,265.563,328.393,265.083,328.712,264.539z' })
        ),
        React.createElement('span', { className: classes.category.categoryName }, React.createElement('div', {}, this.props.name.replace(/_/gm, ' ')))
        )
        : null
      )
    }
  }

  const RenderList = class extends React.Component {
    render () {
      return React.createElement(React.Fragment, {
        children: this.props.items.map((itemProps, i) => React.createElement(this.props.component, {
          ...itemProps,
          ...this.props.componentProps,
          index: i
        }))
      })
    }
  }

  const MediaPicker = class extends React.Component {
    constructor (props) {
      super(props)

      this.state = {
        textFilter: '',
        categories: Utilities.loadData(config.name, this.props.type, { categories: [] }).categories,
        category: null,
        medias: Utilities.loadData(config.name, this.props.type, { medias: [] }).medias,
        contentWidth: null
      }

      this.type = this.props.type
      this.contentHeight = 400

      this.clearSearch = this.clearSearch.bind(this)
      this.setCategory = this.setCategory.bind(this)
      this.onContextMenu = this.onContextMenu.bind(this)
      this.onMediaContextMenu = this.onMediaContextMenu.bind(this)
      this.categoriesItems = this.categoriesItems.bind(this)
      this.loadMedias = this.loadMedias.bind(this)
      this.loadCategories = this.loadCategories.bind(this)
      this.backCategory = this.backCategory.bind(this)
      this.uploadMedia = this.uploadMedia.bind(this)
      this.setContentHeight = this.setContentHeight.bind(this)
      this.sendMedia = this.sendMedia.bind(this)
    }

    componentDidMount () {
      this.refs.input.focus()
      this.setState({ contentWidth: this.refs.content.clientWidth })
      Dispatcher.subscribe('UPDATE_MEDIAS', this.loadMedias)
      Dispatcher.subscribe('UPDATE_CATEGORIES', this.loadCategories)
      Dispatcher.dispatch({ type: 'PICKER_BUTTON_ACTIVE' })
    }

    componentDidUpdate () {
      if (this.type !== this.props.type) {
        this.type = this.props.type
        this.setState({ category: null })
        this.loadCategories()
        this.loadMedias()
        Dispatcher.dispatch({ type: 'PICKER_BUTTON_ACTIVE' })
      }
      if (this.state.contentWidth !== this.refs.content.clientWidth) this.setState({ contentWidth: this.refs.content.clientWidth })
    }

    componentWillUnmount () {
      Dispatcher.unsubscribe('UPDATE_MEDIAS', this.loadMedias)
      Dispatcher.unsubscribe('UPDATE_CATEGORIES', this.loadCategories)
      Dispatcher.dispatch({ type: 'PICKER_BUTTON_ACTIVE' })
    }

    clearSearch () {
      if (this.refs.input) this.refs.input.value = ''
      this.setState({ textFilter: '' })
    }

    get numberOfColumns () {
      return Math.floor(this.state.contentWidth / 200)
    }

    setContentHeight (height) {
      this.contentHeight = height
      if (this.refs.content) this.refs.content.style.height = `${this.contentHeight}px`
      if (this.refs.endSticker) this.refs.endSticker.style.top = `${this.contentHeight + 12}px`
    }

    get heights () {
      const cols = this.numberOfColumns
      const heights = new Array(cols).fill(0)
      const categoriesLen = this.filteredCategories.length
      const rows = Math.ceil(categoriesLen / cols)
      const max = (categoriesLen % cols) || 999
      for (let i = 0; i < cols; i++) { heights[i] = (rows - (i < max ? 0 : 1)) * 122 }
      return heights
    }

    setCategory (category) {
      if (!category) {
        this.loadCategories()
        this.loadMedias()
      } else {
        this.setState({ category })
      }
      this.clearSearch()
    }

    listWithId (list) {
      return list.map((e, i) => ({ ...e, id: i }))
    }

    filterCondition (name, filter) {
      name = name.replace(/(_|-)/gm, ' ')
      filter = filter.replace(/(_|-)/gm, ' ')
      for (const f of filter.split(' ').filter(e => e)) { if (!name.includes(f)) return false }
      return true
    }

    get filteredCategories () {
      const filter = this.state.textFilter
      if (!filter) return this.categoriesInCategory()
      return this.state.categories.filter(c => this.filterCondition(c.name.toLowerCase(), filter.toString().toLowerCase()))
    }

    get filteredMedias () {
      const filter = this.state.textFilter
      if (!filter) return this.mediasInCategory
      return this.listWithId(this.state.medias).filter(m => this.filterCondition(m.name.toLowerCase(), filter.toString().toLowerCase()))
    }

    get positionedCategories () {
      const thumbnails = this.randomThumbnails
      const categories = this.filteredCategories
      const width = this.state.contentWidth || 200
      const n = Math.floor(width / 200)
      const itemWidth = (width - (12 * (n - 1))) / n
      for (let c = 0; c < categories.length; c++) {
        if (this.props.type !== 'audio') categories[c].thumbnail = thumbnails[categories[c].id]
        categories[c].positions = {
          left: (itemWidth + 12) * (c % n),
          top: 122 * Math.floor(c / n),
          width: itemWidth
        }
      }
      return categories
    }

    get positionedMedias () {
      const heights = this.heights
      const width = this.state.contentWidth || 200
      const n = Math.floor(width / 200)
      const offset = this.filteredCategories.length
      const placed = new Array(n)
      placed.fill(false)
      placed.fill(true, 0, offset % n)
      const itemWidth = (width - (12 * (n - 1))) / n
      const medias = this.filteredMedias.reverse()
      for (let m = 0; m < medias.length; m++) {
        const min = {
          height: Math.min(...heights),
          index: heights.indexOf(Math.min(...heights))
        }
        const max = Math.max(...heights)
        const itemHeight = Math.round(100 * itemWidth * medias[m].height / itemWidth) / 100
        let placedIndex = placed.indexOf(false)
        if (placedIndex === -1) { placed.fill(false); placedIndex = 0 }
        if (this.props.type === 'audio') {
          medias[m].positions = {
            left: (itemWidth + 12) * ((offset + m) % n),
            top: 122 * Math.floor((offset + m) / n),
            width: itemWidth,
            height: 110
          }
          heights[min.index] = heights[min.index] + 110 + 12
        } else {
          if ((min.height + itemHeight) < (max + 110) || m === medias.length - 1) {
            medias[m].positions = {
              left: (itemWidth + 12) * (min.index % n),
              top: min.height,
              width: itemWidth,
              height: itemHeight
            }
            heights[min.index] = heights[min.index] + itemHeight + 12
          } else {
            medias[m].positions = {
              left: (itemWidth + 12) * (placedIndex % n),
              top: Math.round(100 * heights[placedIndex]) / 100,
              width: itemWidth,
              height: itemHeight
            }
            heights[placedIndex] = heights[placedIndex] + itemHeight + 12
          }
          placed[placedIndex] = true
        }
      }
      this.setContentHeight(Math.max(...heights))
      return medias
    }

    categoriesInCategory () {
      if (!this.state.category) return this.state.categories.filter(m => m.category_id === undefined)
      return this.state.categories.filter(m => m.category_id === this.state.category.id)
    }

    get mediasInCategory () {
      if (!this.state.category) {
        if (!Utilities.loadSettings(config.name).hideUnsortedMedias) return this.listWithId(this.state.medias)
        else return this.listWithId(this.state.medias).filter(m => m.category_id === undefined)
      }
      return this.listWithId(this.state.medias).filter(m => m.category_id === this.state.category.id)
    }

    static categoryHasSubcategories (type, categoryId) {
      return Utilities.loadData(config.name, type, { categories: [] }).categories.some((c) => c.category_id === categoryId)
    }

    static openCategoryModal (type, op, values, categoryId) {
      let modal
      Modals.showModal(op === 'create' ? labels.category.create : labels.category.edit,
        React.createElement(CategoryModal, {
          ...values,
          modalRef: ref => { modal = ref }
        }),
        {
          danger: false,
          confirmText: op === 'create' ? labels.create : Strings.Messages.EDIT,
          cancelText: Strings.Messages.CANCEL,
          onConfirm: () => {
            let res = false
            if (op === 'create') res = createCategory(type, modal.getValues(), categoryId)
            else res = editCategory(type, modal.getValues(), values.id)
            if (res) Dispatcher.dispatch({ type: 'UPDATE_CATEGORIES' })
          }
        }
      )
    }

    static downloadCategory (props) {
      openDialog({ openDirectory: true }).then(({ filePaths }) => {
        if (!filePaths?.[0]) return
        const categoryFolder = path.join(filePaths[0], props.name ?? '')
        mkdir(categoryFolder, {}, () => {
          const medias = Utilities.loadData(config.name, props.type, { medias: [] }).medias.filter(m => m.category_id === props.categoryId).map(m => { return props.type === 'audio' ? m : { ...m, ext: props.type === 'gif' ? '.gif' : getUrlExt(m.url) } })
          Promise.allSettled(medias.map((media) => new Promise((resolve, reject) => {
            const mediaFileName = `${media.name.replace(/ /g, '_')}${media.ext}`
            const mediaPath = path.join(categoryFolder, mediaFileName)
            lstat(mediaPath, {}, (err) => {
              // checking if the file already exists -> err is not null if that's the case
              if (!err) return resolve()
              fetchMedia(media).then((buffer) => {
                writeFile(mediaPath, buffer, (err) => {
                  if (err) reject(err)
                  else resolve()
                })
              }).catch((err) => reject(err))
            })
          }))).then((results) => {
            Toasts.success(labels.category.success.download)
            results.forEach((res) => {
              if (res.status === 'rejected') console.error('[FavoriteMedia]', 'Failed to download media:', res.reason)
            })
          })
        })
      })
    }

    onContextMenu (e) {
      canClosePicker.context = 'contextmenu'
      canClosePicker.value = false
      ContextMenu.openContextMenu(e,
        ContextMenu.buildMenu([{
          type: 'group',
          items: [
            {
              id: 'category-create',
              label: labels.category.create,
              action: () => MediaPicker.openCategoryModal(this.props.type, 'create', null, this.state.category?.id)
            }, {
              id: 'category-download',
              label: labels.category.download,
              action: () => MediaPicker.downloadCategory({ type: this.props.type, name: this.state.category?.name, categoryId: this.state.category?.id })
            }
          ]
        }]), {
          onClose: () => {
            canClosePicker.context = 'contextmenu'
            canClosePicker.value = true
          }
        })
    }

    onScroll (e) {
      Dispatcher.dispatch({ type: 'SCROLLING_MEDIAS', scroll: e.target.scrollTop + 350 })
    }

    static changeCategoryCategory (type, id, categoryId) {
      const typeData = Utilities.loadData(config.name, type, { medias: [] })
      const index = typeData.categories.findIndex(m => m.id === id)
      if (index < 0) return
      typeData.categories[index].category_id = categoryId
      Utilities.saveData(config.name, type, typeData)
      Toasts.success(labels.category.success.move)
      Dispatcher.dispatch({ type: 'UPDATE_CATEGORIES' })
    }

    static changeMediaCategory (type, url, categoryId) {
      const typeData = Utilities.loadData(config.name, type, { medias: [] })
      const index = typeData.medias.findIndex(m => m.url === url)
      if (index < 0) return
      typeData.medias[index].category_id = categoryId
      Utilities.saveData(config.name, type, typeData)
      Toasts.success(labels.media.success.move[type])
      Dispatcher.dispatch({ type: 'UPDATE_MEDIAS' })
    }

    static removeCategoryCategory (type, categoryId) {
      const typeData = Utilities.loadData(config.name, type)
      const index = typeData.categories.findIndex(m => m.id === categoryId)
      if (index < 0) return
      delete typeData.categories[index].category_id
      Utilities.saveData(config.name, type, typeData)
      Toasts.success(labels.category.success.move)
      Dispatcher.dispatch({ type: 'UPDATE_CATEGORIES' })
    }

    static removeMediaCategory (type, mediaId) {
      const typeData = Utilities.loadData(config.name, type)
      delete typeData.medias[mediaId].category_id
      Utilities.saveData(config.name, type, typeData)
      Toasts.success(labels.media.success.remove[type])
      Dispatcher.dispatch({ type: 'UPDATE_MEDIAS' })
    }

    categoriesItems (media) {
      return this.state.categories
        .filter(c => c.id !== (this.state.category?.id) && c.id !== MediaPicker.isMediaInCategory(this.props.type, media.id))
        .map(c => {
          return {
            id: `category-menu-${c.id}`,
            label: c.name,
            key: c.id,
            action: () => MediaPicker.changeMediaCategory(this.props.type, media.url, c.id),
            render: () => React.createElement(CategoryMenuItem, { ...c, key: c.id })
          }
        })
    }

    static isMediaInCategory (type, mediaId) {
      const media = Utilities.loadData(config.name, type, { medias: [] }).medias[mediaId]
      if (!media) return undefined
      return media.category_id
    }

    get randomThumbnails () {
      const thumbnails = []
      for (let c = 0; c < this.state.categories.length; c++) {
        const id = this.state.categories[c].id
        const medias = this.state.medias.filter(m => m.category_id === id)
        let media = null
        if (medias.length === 0) continue
        else if (medias.length === 1) media = medias[0]
        else media = medias[Math.floor(Math.random() * medias.length)]
        thumbnails[id] = media.poster || media.src || media.url
      }
      return thumbnails
    }

    loadCategories () {
      this.setState({ categories: Utilities.loadData(config.name, this.props.type, { categories: [] }).categories })
    }

    loadMedias () {
      this.setState({ medias: Utilities.loadData(config.name, this.props.type, { medias: [] }).medias })
    }

    backCategory () {
      const prevCategory = this.state.categories.find((c) => c.id === this.state.category.category_id)
      this.setState({ category: prevCategory })
    }

    uploadMedia (mediaId, spoiler = false) {
      loadComponentDispatch()
      const media = this.state.medias[mediaId]
      if (!media) return
      fetchMedia(media).then((buffer) => {
        uploadFile(this.props.type, buffer, media)
        setTimeout(() => {
          if (spoiler) findSpoilerButton()?.click()
          if (['both', 'file'].includes(this.props.settings.alwaysSendUpload)) {
            sendInTextarea().then(() => ComponentDispatch.dispatchToLastSubscribed('CLEAR_TEXT'))
          }
        }, 50)
        EPS.closeExpressionPicker()
      }).catch((err) => console.error('[FavoriteMedia]', err))
    }

    sendMedia (e, mediaId) {
      Dispatcher.dispatch({ type: 'SEND_MEDIA', e, mediaId })
    }

    onMediaContextMenu (e, mediaId) {
      const media = Utilities.loadData(config.name, this.props.type, { medias: [] }).medias[mediaId]
      const items = [{
        id: 'media-input',
        label: 'media-input',
        render: () => React.createElement(MediaMenuItemInput, { id: mediaId, type: this.props.type, loadMedias: this.loadMedias })
      }, {
        id: 'media-copy-url',
        label: Strings.Messages.COPY_MEDIA_LINK,
        action: () => ElectronModule.copy(media.url)
      }]
      if (media.message != null) {
        items.push({
          id: 'media-copy-message',
          label: Strings.Messages.COPY_MESSAGE_LINK,
          action: () => ElectronModule.copy(media.message ?? '')
        })
      }
      if (media.source != null) {
        items.push({
          id: 'media-copy-source',
          label: labels.media.copySource,
          action: () => ElectronModule.copy(media.source ?? '')
        })
      }
      items.push({
        id: 'media-send-title',
        label: Strings.Messages.USER_POPOUT_MESSAGE,
        action: (e) => this.sendMedia(e, mediaId)
      }, {
        id: 'media-upload-title',
        label: labels.media.upload.title,
        type: 'submenu',
        items: [{
          id: 'media-upload-normal',
          label: labels.media.upload.normal,
          action: () => this.uploadMedia(mediaId)
        }, {
          id: 'media-upload-spoiler',
          label: labels.media.upload.spoiler,
          action: () => this.uploadMedia(mediaId, true)
        }]
      }, {
        id: 'media-download',
        label: Strings.Messages.DOWNLOAD,
        action: () => {
          const ext = this.props.type === 'gif' ? '.gif' : getUrlExt(media.url)
          media.name = media.name.replace(/ /g, '_')
          openDialog({ mode: 'save', defaultPath: media.name + ext }).then(({ filePath }) => {
            if (filePath === '') return
            fetchMedia(media).then((buffer) => {
              writeFile(filePath, buffer, (err) => {
                if (err) {
                  console.error('[FavoriteMedia]', err)
                  Toasts.error(labels.media.error.download[this.props.type])
                } else {
                  Toasts.success(labels.media.success.download[this.props.type])
                }
              })
            }).catch((err) => {
              console.error('[FavoriteMedia]', err)
              Toasts.error(labels.media.error.download[this.props.type])
            })
          })
        }
      })
      const itemsCategories = this.categoriesItems(media)
      if (itemsCategories.length > 0) {
        items.splice(1, 0, {
          id: 'media-moveAddTo',
          label: this.state.category || MediaPicker.isMediaInCategory(this.props.type, mediaId) !== undefined ? labels.media.moveTo : labels.media.addTo,
          type: 'submenu',
          items: itemsCategories
        })
      }
      if (MediaPicker.isMediaInCategory(this.props.type, mediaId) !== undefined) {
        items.push({
          id: 'media-removeFrom',
          label: labels.media.removeFrom,
          danger: true,
          action: () => MediaPicker.removeMediaCategory(this.props.type, mediaId)
        })
      }
      canClosePicker.context = 'contextmenu'
      canClosePicker.value = false
      ContextMenu.openContextMenu(e, ContextMenu.buildMenu([
        {
          type: 'group',
          items
        }
      ]), {
        onClose: () => {
          canClosePicker.context = 'contextmenu'
          canClosePicker.value = true
        }
      })
    }

    render () {
      return React.createElement('div', {
        id: `${this.props.type}-picker-tab-panel`,
        role: 'tabpanel',
        'aria-labelledby': `${this.props.type}-picker-tab`,
        className: `${classes.gutter.container} fm-pickerContainer`
      },
      React.createElement('div', {
        className: `${classes.gutter.header} fm-header`
      },
      React.createElement('div', {
        className: `${classes.h5} fm-mediasCounter`
      }, this.filteredMedias.length),
      React.createElement('div', {
        className: `${classes.flex.flex} ${classes.flex.horizontal} ${classes.flex.justifyStart} ${classes.flex.alignCenter} ${classes.flex.noWrap}`,
        style: { flex: '1 1 auto' }
      },
      this.state.category
        ? React.createElement('div', {
          className: classes.gutter.backButton,
          role: 'button',
          tabindex: '0',
          onClick: () => this.backCategory()
        },
        React.createElement('svg', {
          'aria-hidden': false,
          width: '24',
          height: '24',
          viewBox: '0 0 24 24',
          fill: 'none'
        },
        React.createElement('path', {
          fill: 'currentColor',
          d: 'M20 10.9378H14.2199H8.06628L10.502 8.50202L9 7L4 12L9 17L10.502 15.498L8.06628 13.0622H20V10.9378Z'
        })
        )
        )
        : null,
      this.state.category
        ? React.createElement('h5', {
          className: `${classes.h5} ${classes.gutter.searchHeader}`
        }, this.state.category.name)
        : null,
      this.state.textFilter && !this.state.category
        ? React.createElement('div', {
          className: classes.gutter.backButton,
          role: 'button',
          tabindex: '0',
          onClick: this.clearSearch
        },
        React.createElement('svg', {
          'aria-hidden': false,
          width: '24',
          height: '24',
          viewBox: '0 0 24 24',
          fill: 'none'
        },
        React.createElement('path', {
          fill: 'currentColor',
          d: 'M20 10.9378H14.2199H8.06628L10.502 8.50202L9 7L4 12L9 17L10.502 15.498L8.06628 13.0622H20V10.9378Z'
        })
        )
        )
        : null,
      !this.state.category
        ? React.createElement('div', {
          className: `${classes.gutter.searchBar} ${classes.container.container} ${classes.container.medium}`
        },
        React.createElement('div', {
          className: classes.container.inner
        },
        React.createElement('input', {
          className: classes.container.input,
          placeholder: labels.searchItem[this.props.type],
          autofocus: true,
          ref: 'input',
          onChange: e => this.setState({ textFilter: e.target.value })
        }),
        React.createElement('div', {
          className: `${classes.container.iconLayout} ${classes.container.medium} ${this.state.textFilter ? classes.container.pointer : ''}`,
          tabindex: '-1',
          role: 'button',
          onClick: this.clearSearch
        },
        React.createElement('div', {
          className: classes.container.iconContainer
        },
        React.createElement('svg', {
          className: `${classes.container.clear} ${this.state.textFilter ? '' : ` ${classes.container.visible}`}`,
          'aria-hidden': false,
          width: '24',
          height: '24',
          viewBox: '0 0 24 24'
        },
        React.createElement('path', {
          fill: 'currentColor',
          d: 'M21.707 20.293L16.314 14.9C17.403 13.504 18 11.799 18 10C18 7.863 17.167 5.854 15.656 4.344C14.146 2.832 12.137 2 10 2C7.863 2 5.854 2.832 4.344 4.344C2.833 5.854 2 7.863 2 10C2 12.137 2.833 14.146 4.344 15.656C5.854 17.168 7.863 18 10 18C11.799 18 13.504 17.404 14.9 16.314L20.293 21.706L21.707 20.293ZM10 16C8.397 16 6.891 15.376 5.758 14.243C4.624 13.11 4 11.603 4 10C4 8.398 4.624 6.891 5.758 5.758C6.891 4.624 8.397 4 10 4C11.603 4 13.109 4.624 14.242 5.758C15.376 6.891 16 8.398 16 10C16 11.603 15.376 13.11 14.242 14.243C13.109 15.376 11.603 16 10 16Z'
        })
        ),
        React.createElement('svg', {
          className: `${classes.container.clear} ${this.state.textFilter ? ` ${classes.container.visible}` : ''}`,
          'aria-hidden': false,
          width: '24',
          height: '24',
          viewBox: '0 0 24 24'
        },
        React.createElement('path', {
          fill: 'currentColor',
          d: 'M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z'
        })
        )
        )
        )
        )
        )
        : null
      )
      ),
      React.createElement('div', {
        className: `${classes.gutter.content} fm-pickerContent`,
        style: { height: '100%' }
      },
      React.createElement('div', {
        className: `${classes.category.container} ${classes.scroller.thin} ${classes.scroller.scrollerBase} ${classes.scroller.fade} fm-pickerContentContainer`,
        style: { overflow: 'hidden scroll', 'padding-right': '0' },
        onContextMenu: this.onContextMenu,
        onScroll: this.onScroll
      },
      React.createElement('div', {
        className: `${classes.scroller.content} fm-pickerContentContainerContent`
      },
      React.createElement('div', {
        style: { position: 'absolute', left: '12px', top: '12px', width: 'calc(100% - 16px)' },
        ref: 'content'
      },
      !this.state.category && (this.state.categories.length + this.state.medias.length === 0)
        ? React.createElement(EmptyFavorites, { type: this.props.type })
        : null,
      this.state.categories.length > 0 && this.state.contentWidth
        ? React.createElement(RenderList, {
          component: CategoryCard,
          items: this.positionedCategories,
          componentProps: {
            type: this.props.type,
            setCategory: this.setCategory,
            length: this.filteredCategories.length
          }
        })
        : null,
      this.state.medias.length > 0 && this.state.contentWidth
        ? React.createElement(RenderList, {
          component: MediaCard,
          items: this.positionedMedias,
          componentProps: {
            type: this.props.type,
            onMediaContextMenu: this.onMediaContextMenu,
            settings: this.props.settings
          }
        })
        : null
      ),
      this.state.categories.length > 0 || this.state.medias.length > 0
        ? React.createElement('div', {
          style: {
            position: 'absolute',
            left: '12px',
            top: `${this.contentHeight + 12}px`,
            width: 'calc(100% - 16px)',
            height: '220px'
          },
          ref: 'endSticker'
        },
        React.createElement('div', {
          className: classes.result.endContainer,
          style: {
            position: 'sticky',
            top: '0px',
            left: '0px',
            width: '100%',
            height: '220px'
          }
        })
        )
        : null
      )
      )
      )
      )
    }
  }

  const MediaButton = class extends React.Component {
    constructor (props) {
      super(props)

      this.state = {
        active: false
      }

      this.changeActive = this.changeActive.bind(this)
      this.checkPicker = this.checkPicker.bind(this)
    }

    get isActive () {
      const EPSState = EPS.useExpressionPickerStore.getState()
      return EPSState.activeView === this.props.type && EPSState.activeViewType?.analyticsName === this.props.pickerType?.analyticsName
    }

    changeActive () {
      if (this.isActive) {
        currentChannelId = this.props.channelId
        currentTextareaInput = findTextareaInput(this.refs.button)
      }
      this.setState({ active: this.isActive })
    }

    checkPicker () {
      const EPSState = EPS.useExpressionPickerStore.getState()
      canClosePicker.context = 'mediabutton'
      canClosePicker.value = EPSState.activeView == null
    }

    componentDidMount () {
      Dispatcher.subscribe('PICKER_BUTTON_ACTIVE', this.changeActive)
    }

    componentWillUnmount () {
      Dispatcher.unsubscribe('PICKER_BUTTON_ACTIVE', this.changeActive)
    }

    render () {
      return React.createElement('div', {
        onMouseDown: this.checkPicker,
        onClick: () => {
          const EPSState = EPS.useExpressionPickerStore.getState()
          if (EPSState.activeView === this.props.type && EPSState.activeViewType?.analyticsName !== this.props.pickerType?.analyticsName) {
            EPS.toggleExpressionPicker(this.props.type, this.props.pickerType ?? EPSState.activeViewType)
          }
          EPS.toggleExpressionPicker(this.props.type, this.props.pickerType ?? EPSConstants.NORMAL)
        },
        className: `${classes.textarea.buttonContainer} fm-buttonContainer fm-${this.props.type}`,
        ref: 'button'
      },
      React.createElement('button', {
        className: `${classes.look.button} ${classes.look.lookBlank} ${classes.look.colorBrand} ${classes.look.grow}${this.state.active ? ` ${classes.icon.active}` : ''} fm-button`,
        tabindex: '0',
        type: 'button'
      },
      React.createElement('div', {
        className: `${classes.look.contents} ${classes.textarea.button} ${classes.icon.button} fm-buttonContent`
      },
      React.createElement('div', {
        className: `${classes.icon.buttonWrapper} fm-buttonWrapper`,
        style: { opacity: '1', transform: 'none' }
      },
      this.props.type === 'image' ? ImageSVG() : null,
      this.props.type === 'video' ? VideoSVG() : null,
      this.props.type === 'audio' ? AudioSVG() : null
      )
      )
      )
      )
    }
  }

  function categoryValidator (type, name, color, id) {
    if (!name || typeof name !== 'string') return { error: 'error', message: labels.category.error.needName }
    if (name.length > 20) return { error: 'error', message: labels.category.error.invalidNameLength }
    if (!color || typeof color !== 'string' || !color.startsWith('#')) return { error: 'error', message: labels.category.error.wrongColor }
    const typeData = Utilities.loadData(config.name, type, { categories: [], medias: [] })
    if (typeData.categories.find(c => c.name === name && c.id !== id) !== undefined) return { error: 'error', message: labels.category.error.nameExists }
    return typeData
  }

  function createCategory (type, { name, color }, categoryId) {
    const res = categoryValidator(type, name, color)
    if (res.error) {
      console.error('[FavoriteMedia]', res.error)
      Toasts.error(res.message)
      return false
    }

    res.categories.push({ id: ((res.categories.slice(-1)[0] && res.categories.slice(-1)[0].id) || 0) + 1, name, color, category_id: categoryId })
    Utilities.saveData(config.name, type, res)

    Toasts.success(labels.category.success.create)
    return true
  }

  function editCategory (type, { name, color }, id) {
    const res = categoryValidator(type, name, color, id)
    if (res.error) {
      console.error('[FavoriteMedia]', res.error)
      Toasts.error(res.message)
      return false
    }

    res.categories[res.categories.findIndex(c => c.id === id)] = { id, name, color }
    Utilities.saveData(config.name, type, res)

    Toasts.success(labels.category.success.edit)
    return true
  }

  function moveCategory (type, id, inc) {
    const typeData = Utilities.loadData(config.name, type, { categories: [], medias: [] })
    const oldCategory = typeData.categories.find((c) => c.id === id)
    if (oldCategory == null) return
    const categories = typeData.categories.filter((c) => c.category_id === oldCategory.category_id)
    const oldCategoryLocalIndex = categories.findIndex((c) => c.id === id)
    if (oldCategoryLocalIndex < 0) return
    const newCategory = categories[oldCategoryLocalIndex + inc]
    if (newCategory == null) return
    const oldCategoryIndex = typeData.categories.findIndex((c) => c.id === oldCategory.id)
    if (oldCategoryIndex < 0) return
    const newCategoryIndex = typeData.categories.findIndex((c) => c.id === newCategory.id)
    if (newCategoryIndex < 0) return
    typeData.categories[oldCategoryIndex] = newCategory
    typeData.categories[newCategoryIndex] = oldCategory
    Utilities.saveData(config.name, type, typeData)

    Toasts.success(labels.category.success.move)
    Dispatcher.dispatch({ type: 'UPDATE_CATEGORIES' })
  }

  function deleteCategory (type, id) {
    const typeData = Utilities.loadData(config.name, type, { categories: [], medias: [] })
    if (typeData.categories.find(c => c.id === id) === undefined) { Toasts.error(labels.category.error.invalidCategory); return false }
    const deleteCategoryId = (id) => {
      typeData.categories = typeData.categories.filter(c => c.id !== id)
      typeData.medias = typeData.medias.map(m => { if (m.category_id === id) delete m.category_id; return m })
      const categoriesToDelete = typeData.categories.filter((c) => c.category_id === id)
      categoriesToDelete.forEach((c) => deleteCategoryId(c.id))
    }
    deleteCategoryId(id)
    Utilities.saveData(config.name, type, typeData)

    Toasts.success(labels.category.success.delete)
    return true
  }

  return class FavoriteMedia extends Plugin {
    onStart () {
      loadModules()
      this.openMediaTabsByKeybinds()
      this.patchExpressionPicker()
      this.patchMessageContextMenu()
      this.patchGIFTab()
      this.patchClosePicker()
      this.patchMedias()
      this.preloadMedias()
      this.patchChannelTextArea()
      if (this.settings.alwaysDeleteDeadMedias) this.deleteDeadMedias()
      DOMTools.addStyle(this.getName() + '-css', `
        .category-input-color > input[type='color'] {
          opacity: 0;
          -webkit-appearance: none;
          width: 48px;
          height: 48px;
        }
        .category-input-color {
          transition: 0.2s;
        }
        .category-input-color:hover {
          transform: scale(1.1);
        }
        .fm-favBtn.fm-video:not(.fm-uploaded) {
          top: calc(50% - 1em);
        }
        .fm-favBtn.fm-audio {
          right: 0;
          left: auto;
          width: auto;
          margin-right: 10%;
        }
        .show-controls {
          position: absolute;
          top: 8px;
          left: 8px;
          z-index: 4;
          opacity: 0;
          -webkit-box-sizing: border-box;
          box-sizing: border-box;
          -webkit-transform: translateY(-10px);
          transform: translateY(-10px);
          -webkit-transition: opacity .1s ease,-webkit-transform .2s ease;
          transition: opacity .1s ease,-webkit-transform .2s ease;
          transition: transform .2s ease,opacity .1s ease;
          transition: transform .2s ease,opacity .1s ease,-webkit-transform .2s ease;
          width: 26px;
          height: 26px;
          color: var(--interactive-normal);
        }
        .show-controls:hover, .show-controls.active {
          -webkit-transform: none;
          transform: none;
          color: var(--interactive-active);
        }
        div:hover > .show-controls {
          opacity: 1;
          -webkit-transform: none;
          transform: none;
        }
        .${classes.result.result} > .${classes.result.gif}:focus {
          outline: none;
        }
        .${classes.image.imageAccessory} > div:not(.${classes.gif.selected}) > svg {
          filter: drop-shadow(2px 2px 2px rgb(0 0 0 / 0.3));
        }
        .category-dragover:after {
          -webkit-box-shadow: inset 0 0 0 2px var(--brand-experiment), inset 0 0 0 3px #2f3136 !important;
          box-shadow: inset 0 0 0 2px var(--brand-experiment), inset 0 0 0 3px #2f3136 !important;
        }
        .fm-colorDot {
          margin-right: 0.7em;
          margin-left: 0;
        }
        .${classes.image.embedWrapper}:not(.${classes.audio.wrapperAudio.split(' ')[0]}):focus-within .${classes.gif.gifFavoriteButton1},
        .${classes.image.embedWrapper}:not(.${classes.audio.wrapperAudio.split(' ')[0]}):hover .${classes.gif.gifFavoriteButton1} {
          opacity: 0;
          -webkit-transform: unset;
          transform: unset;
        }
        .${classes.image.imageWrapper}:not(.${classes.audio.wrapperAudio.split(' ')[0]}):focus-within .${classes.gif.gifFavoriteButton1},
        .${classes.image.imageWrapper}:not(.${classes.audio.wrapperAudio.split(' ')[0]}):hover .${classes.gif.gifFavoriteButton1} {
          opacity: 1;
          -webkit-transform: translateY(0);f
          transform: translateY(0);
        }
        .fm-pickerContainer {
          height: 100%
        }
        #gif-picker-tab-panel .fm-header {
          padding-top: 16px;
        }
        .fm-header .fm-mediasCounter {
          height: 100%;
          display: flex;
          float: right;
          align-items: center;
          margin: 0 4px 0 16px;
        }
      `)
    }

    onStop () {
      document.head.querySelector('fm-head')?.remove()
      DOMTools.removeStyle(this.getName() + '-css')
      document.removeEventListener('keydown', this.onKeyDown)
      document.removeEventListener('keyup', this.onKeyUp)
      this.contextMenu?.()
      Patcher.unpatchAll()
      Dispatcher.dispatch({ type: 'UNPATCH_ALL' })
    }

    onSwitch () {
      if (!this.patchedCTA) this.patchChannelTextArea()
    }

    getSettingsPanel () {
      return this.buildSettingsPanel().getElement()
    }

    preloadMedias () {
      const mediaTypes = {
        gif: ['url', 'src'],
        image: ['url'],
        video: ['url', 'poster'],
        audio: ['url']
      }
      const fmHead = document.createElement('fm-head')
      Object.entries(mediaTypes).forEach(([type, hrefs]) => {
        const data = Utilities.loadData(config.name, type, { medias: [] })
        data.medias.forEach((media) => {
          hrefs.forEach((href) => {
            if (media[href] == null) return
            const link = document.createElement('link')
            link.rel = 'preload'
            link.href = media[href]
            let mime = type
            if (type === 'gif') {
              mime = media.src?.endsWith('.gif') ? 'image' : 'video'
            } else if (type === 'video' && href === 'poster') {
              mime = 'image'
            }
            link.as = mime
            link.onerror = () => {
              if (!media.dead) {
                media.dead = true
                Utilities.saveData(config.name, type, data)
              }
            }
            fmHead.appendChild(link)
          })
        })
      })
      document.head.appendChild(fmHead)
    }

    detectMultiKeysPressing (keys, callback) {
      const keysDown = {}
      this.onKeyDown = function (e) {
        keysDown[e.key] = true
        if (keys.every(k => keysDown[k] === true)) {
          e.preventDefault()
          e.stopPropagation()
          callback?.(keysDown)
        }
      }
      this.onKeyUp = function (e) {
        delete keysDown[e.key]
      }
      document.addEventListener('keydown', this.onKeyDown)
      document.addEventListener('keyup', this.onKeyUp)
    }

    openMediaTabsByKeybinds () {
      this.detectMultiKeysPressing(['Control', 'm'], (keysDown) => {
        if (this.settings.disableMediasTabKeybind) return
        if (keysDown.i) {
          EPS.toggleExpressionPicker('image', EPSConstants.NORMAL)
        } else if (keysDown.v) {
          EPS.toggleExpressionPicker('video', EPSConstants.NORMAL)
        } else if (keysDown.a) {
          EPS.toggleExpressionPicker('audio', EPSConstants.NORMAL)
        }
      })
    }

    MediaTab (mediaType, elementType) {
      const selected = mediaType === EPS.useExpressionPickerStore.getState().activeView
      return React.createElement(elementType, {
        id: `${mediaType}-picker-tab`,
        'aria-controls': `${mediaType}-picker-tab-panel`,
        'aria-selected': selected,
        className: 'fm-pickerTab',
        viewType: mediaType,
        isActive: selected
      }, labels.tabName[mediaType])
    }

    async waitExpressionPicker () {
      return new Promise((resolve, reject) => {
        const unpatch = () => { reject(new Error('Plugin stopped')) }
        Dispatcher.subscribe('UNPATCH_ALL', unpatch)
        const selector = `.${classes.contentWrapper.contentWrapper}`
        const observerSubscription = DOMTools.observer.subscribeToQuerySelector(() => {
          const $el = document.querySelector(selector)
          if ($el == null) return
          Dispatcher.unsubscribe('UNPATCH_ALL', unpatch)
          resolve(ReactTools.getOwnerInstance($el))
          DOMTools.observer.unsubscribe(observerSubscription)
        }, selector, null, true)
      })
    }

    async patchExpressionPicker () {
      let ExpressionPicker = null
      try {
        ExpressionPicker = await this.waitExpressionPicker()
      } catch (_) {
        // plugin stopped while waiting to expression picker, prevent duplicate patching
        return
      }
      if (ExpressionPicker == null) {
        console.error('[FavoriteMedia]', 'ExpressionPicker module not found')
        return
      }
      ExpressionPicker.forceUpdate()
      // https://github.com/BetterDiscord/BetterDiscord/blob/3b9ad9b75b6ac64e6740e9c2f1d19fd4615010c7/renderer/src/builtins/emotes/emotemenu.js
      Patcher.after(ExpressionPicker.constructor.prototype, 'render', (_, __, returnValue) => {
        const originalChildren = returnValue.props?.children
        if (originalChildren == null) return
        returnValue.props.children = (...args) => {
          const childrenReturn = originalChildren(...args)
          const head = Utilities.findInTree(childrenReturn, (e) => e?.role === 'tablist', { walkable: ['props', 'children', 'return', 'stateNode'] })?.children
          const body = Utilities.findInTree(childrenReturn, (e) => e?.[0]?.type === 'nav', { walkable: ['props', 'children', 'return', 'stateNode'] })
          if (head == null || body == null) return childrenReturn
          try {
            const elementType = head[0].type.type
            if (this.settings.image.enabled) head.push(this.MediaTab('image', elementType))
            if (this.settings.video.enabled) head.push(this.MediaTab('video', elementType))
            if (this.settings.audio.enabled) head.push(this.MediaTab('audio', elementType))
            const activeMediaPicker = EPS.useExpressionPickerStore.getState().activeView
            if (['image', 'video', 'audio'].includes(activeMediaPicker)) {
              body.push(React.createElement(MediaPicker, {
                type: activeMediaPicker,
                settings: this.settings
              }))
            }
          } catch (err) {
            console.error('[FavoriteMedia]', 'Error in ExpressionPicker\n', err)
          }
          return childrenReturn
        }
      })
    }

    patchChannelTextArea () {
      loadChannelTextAreaButtons()
      if (ChannelTextAreaButtons == null) return
      this.patchedCTA = true

      Patcher.after(ChannelTextAreaButtons, 'type', (_, [props], returnValue) => {
        if (Utilities.getNestedProp(returnValue, 'props.children.1.props.type') === 'sidebar') return
        currentChannelId = SelectedChannelStore.getChannelId()
        const channel = ChannelStore.getChannel(currentChannelId)
        const perms = Permissions.can({
          permission: PermissionsConstants.SEND_MESSAGES,
          user: UserStore.getCurrentUser(),
          context: channel
        })
        if (!channel.type && !perms) return
        const buttons = returnValue.props.children
        if (!buttons || !Array.isArray(buttons)) return
        const fmButtons = []
        if (this.settings.image.showBtn && this.settings.image.enabled) fmButtons.push(React.createElement(MediaButton, { type: 'image', pickerType: props.type, channelId: props.channel.id }))
        if (this.settings.video.showBtn && this.settings.video.enabled) fmButtons.push(React.createElement(MediaButton, { type: 'video', pickerType: props.type, channelId: props.channel.id }))
        if (this.settings.audio.showBtn && this.settings.audio.enabled) fmButtons.push(React.createElement(MediaButton, { type: 'audio', pickerType: props.type, channelId: props.channel.id }))
        let index = (buttons.findIndex((b) => b.key === this.settings.position.btnsPositionKey) + (this.settings.position.btnsPosition === 'right' ? 1 : 0))
        if (index < 0) index = buttons.length - 1
        buttons.splice(index, 0, ...fmButtons)
        buttons.forEach((b) => { if (['image', 'video', 'audio'].includes(b.props?.type)) b.key = b.props.type })
        setTimeout(() => {
          currentTextareaInput = findTextareaInput()
        }, 50)
      })
    }

    patchMedias () {
      if (MediaPlayer == null) {
        console.error('[FavoriteMedia]', 'MediaPlayer module not found')
      } else {
        Patcher.after(MediaPlayer.prototype, 'render', ({ props }, __, returnValue) => {
          const type = returnValue.props.children[1].type === 'audio' ? 'audio' : 'video'
          if (!this.settings[type].enabled || !this.settings[type].showStar) return
          let url = props.src
          if (!url) return
          url = url.split('https/')[1]
          if (!url) url = props.src
          else url = 'https://' + url
          // force cdn link because on PC media link videos can't be played
          url = url.replace('media.discordapp.net', 'cdn.discordapp.com')
          returnValue.props.children.push(React.createElement(MediaFavButton, {
            type,
            url,
            poster: props.poster,
            width: props.width,
            height: props.height,
            uploaded: returnValue.props.children[0] != null,
            target: returnValue.props.children[1]?.ref
          }))
        })
      }
      if (Image == null) {
        console.error('[FavoriteMedia]', 'Image module not found')
      } else {
        Patcher.after(Image.prototype, 'render', (_, __, returnValue) => {
          const propsButton = returnValue.props?.children?.props?.children?.[1]?.props
          if (propsButton == null) return
          const propsImg = propsButton.children?.props
          if (propsImg == null) return
          const data = {}
          data.type = propsImg.play != null || propsImg.src?.split('?')[0].endsWith('.gif') ? 'gif' : 'image'
          if (!this.settings[data.type].enabled || !this.settings[data.type].showStar) return
          data.url = returnValue.props.focusTarget.current?.firstChild?.getAttribute('href') || propsImg.src
          if (data.url == null) return
          const onclick = propsButton.onClick
          propsButton.onClick = e => {
            if (e.target?.alt === undefined) e.preventDefault()
            else onclick(e)
          }
          const index = returnValue.props.children.props.children[2] != null ? 2 : returnValue.props.children.props.children
          if (data.type === 'gif') {
            data.src = propsImg.src
            data.url = returnValue.props.focusTarget.current?.parentElement.firstElementChild.getAttribute('href') || data.url
          }
          returnValue.props.children.props.children.splice(index, 1, React.createElement(MediaFavButton, {
            type: data.type,
            src: data.src,
            url: data.url.replace('media.discordapp.net', 'cdn.discordapp.com').replace(/\?width=([\d]*)&height=([\d]*)/, ''),
            width: propsImg.style?.maxWidth || (data.type === 'gif' ? propsImg.width : Number(data.url.match(/\?width=([\d]*)/, '')?.[1])) || 0,
            height: propsImg.style?.maxHeight || (data.type === 'gif' ? propsImg.height : Number(data.url.match(/&height=([\d]*)/, '')?.[1])) || 0,
            target: returnValue.props.focusTarget
          }))
        })
      }
    }

    patchClosePicker () {
      Patcher.instead(EPSModules, closeExpressionPickerKey, (_, __, originalFunction) => {
        if (canClosePicker.value) originalFunction()
        if (canClosePicker.context === 'mediabutton') canClosePicker.value = true
      })
    }

    async patchGIFTab () {
      const GIFPicker = await ReactComponents.getComponent('GIFPicker', '#gif-picker-tab-panel')
      if (GIFPicker == null) {
        console.error('[FavoriteMedia]', 'GIFPicker module not found')
        return
      }
      Patcher.after(GIFPicker.component.prototype, 'renderContent', (_this, _, returnValue) => {
        if (!this.settings.gif.enabled || _this.state.resultType !== 'Favorites') return
        if (!Array.isArray(returnValue.props.data)) return
        const favorites = returnValue.props.data.reverse()
        const savedGIFs = Utilities.loadData(config.name, 'gif', { medias: [] })
        const newGIFs = []
        // keep only favorited GIFs
        favorites.forEach((props) => {
          const data = MediaFavButton.getMediaDataFromProps({ ...props, type: 'gif' })
          if (data == null) return
          const foundGIF = savedGIFs.medias.find((g) => g.url === data.url)
          newGIFs.push(foundGIF ?? data)
        })
        savedGIFs.medias = newGIFs
        Utilities.saveData(config.name, 'gif', savedGIFs)

        returnValue.type = MediaPicker
        returnValue.props = {
          type: 'gif',
          settings: this.settings
        }
      })
    }

    patchMessageContextMenu () {
      this.contextMenu = BdApi.ContextMenu.patch('message', (returnValue, props) => {
        if (props == null) return
        if (returnValue.props?.children?.find(e => e?.props?.id === 'favoriteMedia')) return

        const getMediaContextMenuItems = () => {
          if (props.target == null) return []
          let type = null
          if (props.target.tagName === 'IMG') type = 'image'
          else if (props.target.tagName === 'A' && ['IMG', 'VIDEO'].includes(props.target.nextSibling?.firstChild?.tagName)) type = 'gif'
          else if (props.target.parentElement.firstElementChild.tagName === 'VIDEO') type = 'video'
          else if (props.target.closest('[class*="wrapperAudio"]')) {
            type = 'audio'
            props.target = props.target.closest('[class*="wrapperAudio"]')
          }
          if (type == null) return []
          const data = {
            type,
            url: props.target.getAttribute('href') || props.target.src,
            poster: null,
            width: 0,
            height: 0,
            favorited: undefined,
            target: { current: props.target }
          }
          if (data.type === 'image') {
            let tmpUrl = data.url.split('https/')[1]
            if (!tmpUrl) tmpUrl = data.url
            else tmpUrl = 'https://' + tmpUrl
            data.url = (tmpUrl || data.url || props.target.src).replace(/\?width=([\d]*)&height=([\d]*)/, '')
            data.width = Number(props.target.src.match(/\?width=([\d]*)/, '')?.[1])
            data.height = Number(props.target.src.match(/&height=([\d]*)/, '')?.[1])
          } else if (data.type === 'gif') {
            data.src = props.target.nextSibling.firstChild?.src
            data.width = props.target.nextSibling.firstChild?.width
            data.height = props.target.nextSibling.firstChild?.height
          } else if (data.type === 'video') {
            data.url = props.target.parentElement.firstElementChild.src
            data.poster = props.target.parentElement.firstElementChild.poster
            data.width = props.target.parentElement.firstElementChild.width
            data.height = props.target.parentElement.firstElementChild.height
          } else if (data.type === 'audio') {
            data.url = props.target.querySelector('audio').firstElementChild?.src
          }
          data.url = data.url.replace('media.discordapp.net', 'cdn.discordapp.com')
          data.favorited = this.isFavorited(data.type, data.url)
          const menuItems = [{
            id: `media-${data.favorited ? 'un' : ''}favorite`,
            label: data.favorited ? Strings.Messages.GIF_TOOLTIP_REMOVE_FROM_FAVORITES : Strings.Messages.GIF_TOOLTIP_ADD_TO_FAVORITES,
            icon: () => React.createElement(StarSVG, { filled: !data.favorited }),
            action: () => {
              if (data.favorited) MediaFavButton.unfavoriteMedia(data)
              else MediaFavButton.favoriteMedia(data)
              Dispatcher.dispatch({ type: 'FAVORITE_MEDIA', url: data.url })
            }
          }]
          menuItems.push({
            id: 'media-copy-url',
            label: Strings.Messages.COPY_MEDIA_LINK,
            action: () => ElectronModule.copy(data.url)
          })
          if (data.message != null) {
            menuItems.push({
              id: 'media-copy-message',
              label: Strings.Messages.COPY_MESSAGE_LINK,
              action: () => ElectronModule.copy(data.message ?? '')
            })
          }
          if (data.source != null) {
            menuItems.push({
              id: 'media-copy-source',
              label: labels.media.copySource,
              action: () => ElectronModule.copy(data.source ?? '')
            })
          }
          menuItems.push({
            id: 'media-download',
            label: Strings.Messages.DOWNLOAD,
            action: () => {
              const media = { url: data.url, name: getUrlName(data.url) }
              const ext = data.type === 'gif' ? '.gif' : getUrlExt(media.url)
              media.name = media.name.replace(/ /g, '_')
              openDialog({ mode: 'save', defaultPath: media.name + ext }).then(({ filePath }) => {
                if (filePath === '') return
                fetchMedia(media).then((buffer) => {
                  writeFile(filePath, buffer, (err) => {
                    if (err) {
                      console.error('[FavoriteMedia]', err)
                      Toasts.error(labels.media.error.download[data.type])
                    } else {
                      Toasts.success(labels.media.success.download[data.type])
                    }
                  })
                }).catch((err) => {
                  console.error('[FavoriteMedia]', err)
                  Toasts.error(labels.media.error.download[data.type])
                })
              })
            }
          })
          if (data.favorited) {
            const medias = Utilities.loadData(this._config.name, data.type, { medias: [] }).medias
            const mediaId = medias.findIndex(m => m.url === data.url)
            const categoryId = medias[mediaId]?.category_id
            const categories = Utilities.loadData(this._config.name, data.type, { categories: [] }).categories
            const category = categories.find((c) => c.id === categoryId)
            const buttonCategories = categories.filter(c => categoryId != null ? c.id !== categoryId : true)
            if (buttonCategories.length) {
              const moveAddToItems = []
              if (MediaPicker.isMediaInCategory(data.type, mediaId)) {
                moveAddToItems.push({
                  id: 'media-removeFrom',
                  label: `${labels.media.removeFrom} (${category?.name})`,
                  danger: true,
                  action: () => MediaPicker.removeMediaCategory(data.type, mediaId)
                })
              }
              moveAddToItems.push(...buttonCategories.map(c => ({
                id: `category-edit-${c.id}`,
                label: c.name,
                key: c.id,
                action: () => {
                  MediaPicker.changeMediaCategory(data.type, data.url, c.id)
                },
                render: () => React.createElement(CategoryMenuItem, { ...c, key: c.id })
              })))
              menuItems.push({
                id: 'media-moveAddTo',
                label: categoryId !== undefined ? labels.media.moveTo : labels.media.addTo,
                type: 'submenu',
                items: moveAddToItems
              })
            }
          } else {
            const categories = Utilities.loadData(this._config.name, data.type, { categories: [] }).categories
            if (categories.length) {
              menuItems.push({
                id: 'media-addTo',
                label: labels.media.addTo,
                type: 'submenu',
                items: categories.map(c => ({
                  id: `category-name-${c.id}`,
                  label: c.name,
                  key: c.id,
                  action: () => {
                    MediaFavButton.favoriteMedia(data)
                    MediaPicker.changeMediaCategory(data.type, data.url, c.id)
                    Dispatcher.dispatch({ type: 'FAVORITE_MEDIA', url: data.url })
                  },
                  render: () => React.createElement(CategoryMenuItem, { ...c, key: c.id })
                }))
              })
            }
          }
          return menuItems
        }

        const getCategoryContextMenuItems = () => {
          const getCategories = (type) => Utilities.loadData(this._config.name, type, { categories: [] }).categories
          const mediaTypes = ['gif', 'image', 'video', 'audio']
          return [
            {
              id: 'category-list',
              label: labels.category.list,
              type: 'submenu',
              items: mediaTypes.map((type) => ({
                id: `category-create-${type}`,
                label: type === 'gif' ? Strings.Messages.GIF : labels.tabName[type],
                type: 'submenu',
                items: (() => {
                  const items = [{
                    id: `category-create-${type}`,
                    label: labels.category.create,
                    action: () => MediaPicker.openCategoryModal(type, 'create')
                  }]
                  if (getCategories(type).length > 0) {
                    items.push({
                      id: 'category-edit',
                      label: labels.category.edit,
                      type: 'submenu',
                      items: getCategories(type).map((c) => ({
                        id: `category-edit-${c.id}`,
                        label: c.name,
                        key: c.id,
                        action: () => MediaPicker.openCategoryModal(type, 'edit', { name: c.name, color: c.color, id: c.id }),
                        render: () => React.createElement(CategoryMenuItem, { ...c, key: c.id })
                      }))
                    }, {
                      id: 'category-delete',
                      label: labels.category.delete,
                      type: 'submenu',
                      danger: true,
                      items: getCategories(type).map((c) => ({
                        id: `category-delete-${c.id}`,
                        label: c.name,
                        key: c.id,
                        action: () => {
                          const deleteCategories = () => deleteCategory(type, c.id)
                          if (MediaPicker.categoryHasSubcategories(type, c.id)) {
                            Modals.showConfirmationModal(labels.category.delete, labels.category.deleteConfirm, {
                              danger: true,
                              onConfirm: () => deleteCategories(),
                              confirmText: labels.category.delete,
                              cancelText: Strings.Messages.CANCEL
                            })
                          } else {
                            deleteCategories()
                          }
                        },
                        render: () => React.createElement(CategoryMenuItem, { ...c, key: c.id })
                      }))
                    })
                  }
                  return items
                })()
              }))
            }
          ]
        }

        const separator = ContextMenu.buildMenuItem({ type: 'separator' })
        const mediaItems = getMediaContextMenuItems()
        const categoryItems = getCategoryContextMenuItems()
        const menuItems = [...mediaItems]
        menuItems.push(...categoryItems)
        const fmContextMenu = ContextMenu.buildMenuItem({
          id: 'favoriteMediaMenu',
          label: this._config.name,
          type: 'submenu',
          items: menuItems
        })
        const fmIndex = returnValue.props.children.findIndex((i) => i?.props?.children?.props?.id === 'devmode-copy-id')
        if (fmIndex > -1) returnValue.props.children.splice(fmIndex, 0, separator, fmContextMenu)
        else returnValue.props.children.push(separator, fmContextMenu)
      })
    }

    isFavorited (type, url) {
      return Utilities.loadData(this._config.name, type, { medias: [] }).medias.find(e => e.url === url) !== undefined
    }

    deleteDeadMedias () {
      const types = ['image', 'video', 'audio']
      types.forEach((type) => {
        const typeData = Utilities.loadData(this._config.name, type, { medias: [] })
        typeData.medias = typeData.medias.filter((m) => !m.dead)
        Utilities.saveData(this._config.name, type, typeData)
      })
    }
  }

  function setLabelsByLanguage () {
    switch (LocaleManager.getLocale() ?? 'en') {
      case 'bg': // Bulgarian
        return {
          tabName: {
            image: 'Изображения',
            video: 'Видео',
            audio: 'Аудио'
          },
          create: 'Създайте',
          category: {
            list: 'Категории',
            unsorted: 'Не са сортирани',
            create: 'Създайте категория',
            edit: 'Редактиране на категорията',
            delete: 'Изтриване на категорията',
            deleteConfirm: 'Тази категория съдържа подкатегории. Всички те ще бъдат изтрити. Сигурни ли сте, че искате да изтриете категории?',
            download: 'Изтеглете мултимедия',
            placeholder: 'Име на категория',
            move: 'Ход',
            moveNext: 'След',
            movePrevious: 'Преди',
            color: 'Цвят',
            copyColor: 'Копиране на цвят',
            error: {
              needName: 'Името не може да бъде празно',
              invalidNameLength: 'Името трябва да съдържа максимум 20 знака',
              wrongColor: 'Цветът е невалиден',
              nameExists: 'това име вече съществува',
              invalidCategory: 'Категорията не съществува',
              download: 'Изтеглянето на мултимедия не бе успешно'
            },
            success: {
              create: 'Категорията е създадена!',
              delete: 'Категорията е изтрита!',
              edit: 'Категорията е променена!',
              move: 'Категорията е преместена!',
              download: 'Медиите са качени!'
            },
            emptyHint: 'Щракнете с десния бутон, за да създадете категория!'
          },
          media: {
            emptyHint: {
              image: 'Кликнете върху звездата в ъгъла на изображението, за да го поставите в любимите си',
              video: 'Кликнете върху звездата в ъгъла на видеоклипа, за да го поставите в любимите си',
              audio: 'Кликнете върху звездата в ъгъла на звука, за да го поставите в любимите си'
            },
            addTo: 'Добавяне',
            moveTo: 'Ход',
            removeFrom: 'Премахване от категорията',
            copySource: 'Копиране на медийния източник',
            upload: {
              title: 'Качване',
              normal: 'Нормално',
              spoiler: 'Спойлер'
            },
            success: {
              move: {
                gif: 'GIF е преместен!',
                image: 'Изображението е преместено!',
                video: 'Видеото е преместено!',
                audio: 'Аудиото е преместено!'
              },
              remove: {
                gif: 'GIF-ът е премахнат от категориите!',
                image: 'Изображението е премахнато от категориите!',
                video: 'Видеото е премахнато от категориите!',
                audio: 'Аудиото е премахнато от категориите!'
              },
              download: {
                gif: 'GIF е качен!',
                image: 'Изображението е качено!',
                video: 'Видеото е качено!',
                audio: 'Аудиото е изтеглено!'
              }
            },
            error: {
              download: {
                gif: 'Неуспешно изтегляне на GIF',
                image: 'Качването на изображението не бе успешно',
                video: 'Изтеглянето на видеоклипа не бе успешно',
                audio: 'Изтеглянето на аудио не бе успешно'
              }
            },
            controls: {
              show: 'Показване на поръчки',
              hide: 'Скриване на поръчките'
            },
            placeholder: {
              gif: 'Име на GIF',
              image: 'Име на изображението',
              video: 'Име на видеоклипа',
              audio: 'Име на звука'
            }
          },
          searchItem: {
            gif: 'Търсете GIF файлове или категории',
            image: 'Търсене на изображения или категории',
            video: 'Търсете видеоклипове или категории',
            audio: 'Търсене на аудио или категории'
          }
        }
      case 'da': // Danish
        return {
          tabName: {
            image: 'Billede',
            video: 'Video',
            audio: 'Lyd'
          },
          create: 'skab',
          category: {
            list: 'Kategorier',
            unsorted: 'Ikke sorteret',
            create: 'Opret en kategori',
            edit: 'Rediger kategori',
            delete: 'Slet kategori',
            deleteConfirm: 'Denne kategori indeholder underkategorier. De vil alle blive slettet. Er du sikker på, at du vil slette kategorier?',
            download: 'Download medier',
            placeholder: 'Kategorinavn',
            move: 'Bevæge sig',
            moveNext: 'Efter',
            movePrevious: 'Før',
            color: 'Farve',
            copyColor: 'Kopier farve',
            error: {
              needName: 'Navnet kan ikke være tomt',
              invalidNameLength: 'Navnet skal maksimalt indeholde 20 tegn',
              wrongColor: 'Farven er ugyldig',
              nameExists: 'dette navn findes allerede',
              invalidCategory: 'Kategorien findes ikke',
              download: 'Kunne ikke downloade medier'
            },
            success: {
              create: 'Kategorien er oprettet!',
              delete: 'Kategorien er blevet slettet!',
              edit: 'Kategorien er blevet ændret!',
              move: 'Kategorien er flyttet!',
              download: 'Medierne er blevet uploadet!'
            },
            emptyHint: 'Højreklik for at oprette en kategori!'
          },
          media: {
            emptyHint: {
              image: 'Klik på stjernen i hjørnet af et billede for at placere det i dine favoritter',
              video: 'Klik på stjernen i hjørnet af en video for at placere den i dine favoritter',
              audio: 'Klik på stjernen i hjørnet af en lyd for at placere den i dine favoritter'
            },
            addTo: 'Tilføje',
            moveTo: 'Bevæge sig',
            removeFrom: 'Fjern fra kategori',
            copySource: 'Kopier mediekilde',
            upload: {
              title: 'Upload',
              normal: 'Normal',
              spoiler: 'Spoiler'
            },
            success: {
              move: {
                gif: 'GIF\'en er blevet flyttet!',
                image: 'Billedet er flyttet!',
                video: 'Videoen er flyttet!',
                audio: 'Lyden er flyttet!',
                download: {
                  image: 'Billedet er uploadet!',
                  video: 'Videoen er blevet uploadet!',
                  audio: 'Lyden er downloadet!'
                }
              },
              remove: {
                gif: 'GIF\'en er blevet fjernet fra kategorierne!',
                image: 'Billedet er fjernet fra kategorierne!',
                video: 'Videoen er fjernet fra kategorierne!',
                audio: 'Lyd er fjernet fra kategorier!'
              },
              download: {
                gif: 'GIF\'en er blevet uploadet!',
                image: 'Billedet er uploadet!',
                video: 'Videoen er blevet uploadet!',
                audio: 'Lyden er downloadet!'
              }
            },
            error: {
              download: {
                gif: 'Kunne ikke downloade GIF',
                image: 'Billedet kunne ikke uploades',
                video: 'Videoen kunne ikke downloades',
                audio: 'Kunne ikke downloade lyd'
              }
            },
            controls: {
              show: 'Vis ordrer',
              hide: 'Skjul ordrer'
            },
            placeholder: {
              gif: 'GIF navn',
              image: 'Billednavn',
              video: 'Video navn',
              audio: 'Audio navn'
            }
          },
          searchItem: {
            gif: 'Søg efter GIF\'er eller kategorier',
            image: 'Søg efter billeder eller kategorier',
            video: 'Søg efter videoer eller kategorier',
            audio: 'Søg efter lydbånd eller kategorier'
          }
        }
      case 'de': // German
        return {
          tabName: {
            image: 'Bild',
            video: 'Video',
            audio: 'Audio'
          },
          create: 'Erstellen',
          category: {
            list: 'Kategorien',
            unsorted: 'Nicht sortiert',
            create: 'Erstellen Sie eine Kategorie',
            edit: 'Kategorie bearbeiten',
            delete: 'Kategorie löschen',
            deleteConfirm: 'Diese Kategorie enthält Unterkategorien. Sie werden alle gelöscht. Möchten Sie Kategorien wirklich löschen?',
            download: 'Medien herunterladen',
            placeholder: 'Kategoriename',
            move: 'Bewegung',
            moveNext: 'Nach dem',
            movePrevious: 'Vor',
            color: 'Farbe',
            copyColor: 'Farbe kopieren',
            error: {
              needName: 'Name darf nicht leer sein',
              invalidNameLength: 'Der Name darf maximal 20 Zeichen lang sein',
              wrongColor: 'Farbe ist ungültig',
              nameExists: 'Dieser Name existiert bereits',
              invalidCategory: 'Die Kategorie existiert nicht',
              download: 'Fehler beim Herunterladen der Medien'
            },
            success: {
              create: 'Die Kategorie wurde erstellt!',
              delete: 'Die Kategorie wurde gelöscht!',
              edit: 'Die Kategorie wurde geändert!',
              move: 'Die Kategorie wurde verschoben!',
              download: 'Die Medien wurden hochgeladen!'
            },
            emptyHint: 'Rechtsklick um eine Kategorie zu erstellen!'
          },
          media: {
            emptyHint: {
              image: 'Klicken Sie auf den Stern in der Ecke eines Bildes, um es in Ihre Favoriten aufzunehmen',
              video: 'Klicke auf den Stern in der Ecke eines Videos, um es zu deinen Favoriten hinzuzufügen',
              audio: 'Klicken Sie auf den Stern in der Ecke eines Audios, um es in Ihre Favoriten aufzunehmen'
            },
            addTo: 'Hinzufügen',
            moveTo: 'Bewegung',
            removeFrom: 'Aus Kategorie entfernen',
            copySource: 'Medienquelle kopieren',
            upload: {
              title: 'Hochladen',
              normal: 'Normal',
              spoiler: 'Spoiler'
            },
            success: {
              move: {
                gif: 'Das GIF wurde verschoben!',
                image: 'Das Bild wurde verschoben!',
                video: 'Das Video wurde verschoben!',
                audio: 'Der Ton wurde verschoben!'
              },
              remove: {
                gif: 'Das GIF wurde aus den Kategorien entfernt!',
                image: 'Das Bild wurde aus den Kategorien entfernt!',
                video: 'Das Video wurde aus den Kategorien entfernt!',
                audio: 'Audio wurde aus den Kategorien entfernt!'
              },
              download: {
                gif: 'Das GIF wurde hochgeladen!',
                image: 'Das Bild wurde hochgeladen!',
                video: 'Das Video wurde hochgeladen!',
                audio: 'Die Audiodatei wurde heruntergeladen!'
              }
            },
            error: {
              download: {
                gif: 'GIF konnte nicht heruntergeladen werden',
                image: 'Fehler beim Hochladen des Bildes',
                video: 'Video konnte nicht heruntergeladen werden',
                audio: 'Audio konnte nicht heruntergeladen werden'
              }
            },
            controls: {
              show: 'Bestellungen anzeigen',
              hide: 'Bestellungen ausblenden'
            },
            placeholder: {
              gif: 'GIF-Name',
              image: 'Bildname',
              video: 'Videoname',
              audio: 'Audioname'
            }
          },
          searchItem: {
            gif: 'Nach GIFs oder Kategorien suchen',
            image: 'Nach Bildern oder Kategorien suchen',
            video: 'Nach Videos oder Kategorien suchen',
            audio: 'Nach Audios oder Kategorien suchen'
          }
        }
      case 'el': // Greek
        return {
          tabName: {
            image: 'Εικόνα',
            video: 'βίντεο',
            audio: 'Ήχος'
          },
          create: 'Δημιουργώ',
          category: {
            list: 'Κατηγορίες',
            unsorted: 'Χωρίς ταξινόμηση',
            create: 'Δημιουργήστε μια κατηγορία',
            edit: 'Επεξεργασία κατηγορίας',
            delete: 'Διαγραφή κατηγορίας',
            deleteConfirm: 'Αυτή η κατηγορία περιέχει υποκατηγορίες. Θα διαγραφούν όλα. Είστε βέβαιοι ότι θέλετε να διαγράψετε κατηγορίες;',
            download: 'Λήψη μέσων',
            placeholder: 'Ονομα κατηγορίας',
            move: 'Κίνηση',
            moveNext: 'Μετά',
            movePrevious: 'Πριν',
            color: 'Χρώμα',
            copyColor: 'Αντιγραφή χρώματος',
            error: {
              needName: 'Το όνομα δεν μπορεί να είναι κενό',
              invalidNameLength: 'Το όνομα πρέπει να περιέχει έως και 20 χαρακτήρες',
              wrongColor: 'Το χρώμα δεν είναι έγκυρο',
              nameExists: 'αυτό το όνομα υπάρχει ήδη',
              invalidCategory: 'Η κατηγορία δεν υπάρχει',
              download: 'Αποτυχία λήψης μέσων'
            },
            success: {
              create: 'Η κατηγορία έχει δημιουργηθεί!',
              delete: 'Η κατηγορία διαγράφηκε!',
              edit: 'Η κατηγορία άλλαξε!',
              move: 'Η κατηγορία έχει μετακινηθεί!',
              download: 'Τα μέσα έχουν ανέβει!'
            },
            emptyHint: 'Κάντε δεξί κλικ για να δημιουργήσετε μια κατηγορία!'
          },
          media: {
            emptyHint: {
              image: 'Κάντε κλικ στο αστέρι στη γωνία μιας εικόνας για να την βάλετε στα αγαπημένα σας',
              video: 'Κάντε κλικ στο αστέρι στη γωνία ενός βίντεο για να το βάλετε στα αγαπημένα σας',
              audio: 'Κάντε κλικ στο αστέρι στη γωνία ενός ήχου για να το βάλετε στα αγαπημένα σας'
            },
            addTo: 'Προσθήκη',
            moveTo: 'Κίνηση',
            removeFrom: 'Κατάργηση από την κατηγορία',
            copySource: 'Αντιγραφή πηγής πολυμέσων',
            upload: {
              title: 'Μεταφόρτωση',
              normal: 'Κανονικός',
              spoiler: 'Φθείρων'
            },
            success: {
              move: {
                gif: 'Το GIF έχει μετακινηθεί!',
                image: 'Η εικόνα μετακινήθηκε!',
                video: 'Το βίντεο μετακινήθηκε!',
                audio: 'Ο ήχος μετακινήθηκε!'
              },
              remove: {
                gif: 'Το GIF έχει αφαιρεθεί από τις κατηγορίες!',
                image: 'Η εικόνα έχει αφαιρεθεί από τις κατηγορίες!',
                video: 'Το βίντεο καταργήθηκε από τις κατηγορίες!',
                audio: 'Ο ήχος καταργήθηκε από κατηγορίες!'
              },
              download: {
                gif: 'Το GIF έχει ανέβει!',
                image: 'Η εικόνα ανέβηκε!',
                video: 'Το βίντεο ανέβηκε!',
                audio: 'Ο ήχος έχει γίνει λήψη!'
              }
            },
            error: {
              download: {
                gif: 'Αποτυχία λήψης GIF',
                image: 'Αποτυχία μεταφόρτωσης εικόνας',
                video: 'Αποτυχία λήψης βίντεο',
                audio: 'Αποτυχία λήψης ήχου'
              }
            },
            controls: {
              show: 'Εμφάνιση παραγγελιών',
              hide: 'Απόκρυψη παραγγελιών'
            },
            placeholder: {
              gif: 'Όνομα GIF',
              image: 'Όνομα εικόνας',
              video: 'Όνομα βίντεο',
              audio: 'Όνομα ήχου'
            }
          },
          searchItem: {
            gif: 'Αναζήτηση για GIF ή κατηγορίες',
            image: 'Αναζήτηση εικόνων ή κατηγοριών',
            video: 'Αναζήτηση βίντεο ή κατηγοριών',
            audio: 'Αναζήτηση ήχων ή κατηγοριών'
          }
        }
      case 'es': // Spanish
        return {
          tabName: {
            image: 'Imagen',
            video: 'Video',
            audio: 'Audio'
          },
          create: 'Crear',
          category: {
            list: 'Categorías',
            unsorted: 'No ordenado',
            create: 'Crea una categoria',
            edit: 'Editar categoria',
            delete: 'Eliminar categoría',
            deleteConfirm: 'Esta categoría contiene subcategorías. Todos serán eliminados. ¿Seguro que quieres eliminar categorías?',
            download: 'Descargar medios',
            placeholder: 'Nombre de la categoría',
            move: 'Moverse',
            moveNext: 'Después',
            movePrevious: 'Antes',
            color: 'Color',
            copyColor: 'Copiar color',
            error: {
              needName: 'El nombre no puede estar vacío',
              invalidNameLength: 'El nombre debe contener un máximo de 20 caracteres.',
              wrongColor: 'El color no es válido',
              nameExists: 'Este nombre ya existe',
              invalidCategory: 'La categoría no existe',
              download: '¡Los medios han sido cargados!'
            },
            success: {
              create: '¡La categoría ha sido creada!',
              delete: '¡La categoría ha sido eliminada!',
              edit: '¡La categoría ha sido cambiada!',
              move: '¡La categoría ha sido movida!',
              download: '¡Los medios han sido cargados!'
            },
            emptyHint: '¡Haz clic derecho para crear una categoría!'
          },
          media: {
            emptyHint: {
              image: 'Haga clic en la estrella en la esquina de una imagen para ponerla en sus favoritos',
              video: 'Haga clic en la estrella en la esquina de un video para ponerlo en sus favoritos',
              audio: 'Haga clic en la estrella en la esquina de un audio para ponerlo en sus favoritos'
            },
            addTo: 'Agregar',
            moveTo: 'Moverse',
            removeFrom: 'Quitar de la categoría',
            copySource: 'Copiar fuente multimedia',
            upload: {
              title: 'Subir',
              normal: 'normal',
              spoiler: 'Revelación'
            },
            success: {
              move: {
                gif: '¡El GIF ha sido movido!',
                image: '¡La imagen se ha movido!',
                video: '¡El video se ha movido!',
                audio: '¡El audio se ha movido!'
              },
              remove: {
                gif: '¡El GIF ha sido eliminado de las categorías!',
                image: '¡La imagen ha sido eliminada de las categorías!',
                video: '¡El video ha sido eliminado de las categorías!',
                audio: '¡El audio ha sido eliminado de las categorías!'
              },
              download: {
                gif: '¡El GIF ha sido subido!',
                image: '¡La imagen ha sido cargada!',
                video: '¡El video ha sido subido!',
                audio: '¡El audio se ha descargado!'
              }
            },
            error: {
              download: {
                gif: 'No se pudo descargar del GIF',
                image: 'No se pudo cargar la imagen.',
                video: 'No se pudo descargar el video',
                audio: 'No se pudo descargar el audio'
              }
            },
            controls: {
              show: 'Mostrar pedidos',
              hide: 'Ocultar pedidos'
            },
            placeholder: {
              gif: 'Nombre del GIF',
              image: 'Nombre de la imágen',
              video: 'Nombre del video',
              audio: 'Nombre de audio'
            }
          },
          searchItem: {
            gif: 'Buscar GIFs o categorías',
            image: 'Buscar imágenes o categorías',
            video: 'Buscar videos o categorías',
            audio: 'Busque audios o categorías'
          }
        }
      case 'fi': // Finnish
        return {
          tabName: {
            image: 'Kuva',
            video: 'Video',
            audio: 'Audio'
          },
          create: 'Luoda',
          category: {
            list: 'Luokat',
            unsorted: 'Ei lajiteltu',
            create: 'Luo luokka',
            edit: 'Muokkaa kategoriaa',
            delete: 'Poista luokka',
            deleteConfirm: 'Tämä luokka sisältää alaluokkia. Ne kaikki poistetaan. Haluatko varmasti poistaa luokkia?',
            download: 'Lataa media',
            placeholder: 'Kategorian nimi',
            move: 'Liikkua',
            moveNext: 'Jälkeen',
            movePrevious: 'Ennen',
            color: 'Väri',
            copyColor: 'Kopioi väri',
            error: {
              needName: 'Nimi ei voi olla tyhjä',
              invalidNameLength: 'Nimi saa sisältää enintään 20 merkkiä',
              wrongColor: 'Väri on virheellinen',
              nameExists: 'tämä nimi on jo olemassa',
              invalidCategory: 'Luokkaa ei ole olemassa',
              download: 'Median lataaminen epäonnistui'
            },
            success: {
              create: 'Luokka on luotu!',
              delete: 'Luokka on poistettu!',
              edit: 'Luokkaa on muutettu!',
              move: 'Luokka on siirretty!',
              download: 'Media on ladattu!'
            },
            emptyHint: 'Napsauta hiiren kakkospainikkeella luodaksesi luokan!'
          },
          media: {
            emptyHint: {
              image: 'Napsauta kuvan kulmassa olevaa tähteä lisätäksesi sen suosikkeihisi',
              video: 'Napsauta videon kulmassa olevaa tähteä lisätäksesi sen suosikkeihisi',
              audio: 'Napsauta äänen kulmassa olevaa tähteä lisätäksesi sen suosikkeihisi'
            },
            addTo: 'Lisätä',
            moveTo: 'Liikkua',
            removeFrom: 'Poista luokasta',
            copySource: 'Kopioi medialähde',
            upload: {
              title: 'Lähetä',
              normal: 'Normaali',
              spoiler: 'Spoileri'
            },
            success: {
              move: {
                gif: 'GIF on siirretty!',
                image: 'Kuva on siirretty!',
                video: 'Video on siirretty!',
                audio: 'Ääni on siirretty!'
              },
              remove: {
                gif: 'GIF on poistettu luokista!',
                image: 'Kuva on poistettu luokista!',
                video: 'Video on poistettu luokista!',
                audio: 'Ääni on poistettu luokista!'
              },
              download: {
                gif: 'GIF on ladattu!',
                image: 'Kuva on ladattu!',
                video: 'Video on ladattu!',
                audio: 'Ääni on ladattu!'
              }
            },
            error: {
              download: {
                gif: 'GIF:n lataaminen epäonnistui',
                image: 'Kuvan lataaminen epäonnistui',
                video: 'Videon lataaminen epäonnistui',
                audio: 'Äänen lataaminen epäonnistui'
              }
            },
            controls: {
              show: 'Näytä tilaukset',
              hide: 'Piilota tilaukset'
            },
            placeholder: {
              gif: 'GIF-nimi',
              image: 'Kuvan nimi',
              video: 'Videon nimi',
              audio: 'Äänen nimi'
            }
          },
          searchItem: {
            gif: 'Hae GIF-tiedostoja tai luokkia',
            image: 'Hae kuvia tai luokkia',
            video: 'Hae videoita tai luokkia',
            audio: 'Hae ääniä tai luokkia'
          }
        }
      case 'fr': // French
        return {
          tabName: {
            image: 'Image',
            video: 'Vidéo',
            audio: 'Audio'
          },
          create: 'Créer',
          category: {
            list: 'Catégories',
            unsorted: 'Non trié',
            create: 'Créer une catégorie',
            edit: 'Modifier la catégorie',
            delete: 'Supprimer la catégorie',
            deleteConfirm: 'Cette catégorie contient des sous-catégories. Elles vont toutes être supprimées. Voulez-vous vraiment supprimer les catégories ?',
            download: 'Télécharger les médias',
            placeholder: 'Nom de la catégorie',
            move: 'Déplacer',
            moveNext: 'Après',
            movePrevious: 'Avant',
            color: 'Couleur',
            copyColor: 'Copier la couleur',
            error: {
              needName: 'Le nom ne peut être vide',
              invalidNameLength: 'Le nom doit contenir au maximum 20 caractères',
              wrongColor: 'La couleur est invalide',
              nameExists: 'Ce nom existe déjà',
              invalidCategory: 'La catégorie n\'existe pas',
              download: 'Échec lors du téléchargement des médias'
            },
            success: {
              create: 'La catégorie a été créée !',
              delete: 'La catégorie a été supprimée !',
              edit: 'La catégorie a été modifiée !',
              move: 'La catégorie a été déplacée !',
              download: 'Les médias ont été téléchargés !'
            },
            emptyHint: 'Fais un clique-droit pour créer une catégorie !'
          },
          media: {
            emptyHint: {
              image: 'Clique sur l\'étoile dans le coin d\'une image pour la mettre dans tes favoris',
              video: 'Clique sur l\'étoile dans le coin d\'une vidéo pour la mettre dans tes favoris',
              audio: 'Clique sur l\'étoile dans le coin d\'un audio pour le mettre dans tes favoris'
            },
            addTo: 'Ajouter',
            moveTo: 'Déplacer',
            removeFrom: 'Retirer de la catégorie',
            copySource: 'Copier la source du média',
            upload: {
              title: 'Uploader',
              normal: 'Normal',
              spoiler: 'Spoiler'
            },
            success: {
              move: {
                gif: 'Le GIF a été déplacé !',
                image: 'L\'image a été déplacée !',
                video: 'La vidéo a été déplacée !',
                audio: 'L\'audio a été déplacé !'
              },
              remove: {
                gif: 'Le GIF a été enlevé des catégories !',
                image: 'L\'image a été enlevée des catégories !',
                video: 'La vidéo a été enlevée des catégories !',
                audio: 'L\'audio a été enlevé des catégories !'
              },
              download: {
                gif: 'Le GIF a été téléchargé !',
                image: 'L\'image a été téléchargée !',
                video: 'La vidéo a été téléchargée !',
                audio: 'L\'audio a été téléchargé !'
              }
            },
            error: {
              download: {
                gif: 'Échec lors du téléchargement du GIF',
                image: 'Échec lors du téléchargement de l\'image',
                video: 'Échec lors du téléchargement de la vidéo',
                audio: 'Échec lors du téléchargement de l\'audio'
              }
            },
            controls: {
              show: 'Afficher les commandes',
              hide: 'Cacher les commandes'
            },
            placeholder: {
              gif: 'Nom du GIF',
              image: 'Nom de l\'image',
              video: 'Nom de la vidéo',
              audio: 'Nom de l\'audio'
            }
          },
          searchItem: {
            gif: 'Recherche des GIFs ou des catégories',
            image: 'Recherche des images ou des catégories',
            video: 'Recherche des vidéos ou des catégories',
            audio: 'Recherche des audios ou des catégories'
          }
        }
      case 'hr': // Croatian
        return {
          tabName: {
            image: 'Slika',
            video: 'Video',
            audio: 'Audio'
          },
          create: 'Stvoriti',
          category: {
            list: 'Kategorije',
            unsorted: 'Nije sortirano',
            create: 'Stvorite kategoriju',
            edit: 'Uredi kategoriju',
            delete: 'Izbriši kategoriju',
            deleteConfirm: 'Ova kategorija sadrži potkategorije. Svi će biti izbrisani. Jeste li sigurni da želite izbrisati kategorije?',
            download: 'Preuzmite medije',
            placeholder: 'Ime kategorije',
            move: 'Potez',
            moveNext: 'Nakon',
            movePrevious: 'Prije',
            color: 'Boja',
            copyColor: 'Kopiraj u boji',
            error: {
              needName: 'Ime ne može biti prazno',
              invalidNameLength: 'Ime mora sadržavati najviše 20 znakova',
              wrongColor: 'Boja je nevaljana',
              nameExists: 'ovo ime već postoji',
              invalidCategory: 'Kategorija ne postoji',
              download: 'Preuzimanje medija nije uspjelo'
            },
            success: {
              create: 'Kategorija je stvorena!',
              delete: 'Kategorija je izbrisana!',
              edit: 'Izmijenjena je kategorija!',
              move: 'Kategorija je premještena!',
              download: 'Mediji su učitani!'
            },
            emptyHint: 'Desni klik za stvaranje kategorije!'
          },
          media: {
            emptyHint: {
              image: 'Kliknite zvjezdicu u kutu slike da biste je stavili među svoje favorite',
              video: 'Kliknite zvjezdicu u kutu videozapisa da biste je stavili među svoje favorite',
              audio: 'Kliknite zvjezdicu u kutu zvuka da biste je stavili među svoje favorite'
            },
            addTo: 'Dodati',
            moveTo: 'Potez',
            removeFrom: 'Ukloni iz kategorije',
            copySource: 'Kopiraj izvor medija',
            upload: {
              title: 'Učitaj',
              normal: 'Normalan',
              spoiler: 'Spoiler'
            },
            success: {
              move: {
                gif: 'GIF je premješten!',
                image: 'Slika je premještena!',
                video: 'Video je premješten!',
                audio: 'Zvuk je premješten!'
              },
              remove: {
                gif: 'GIF je uklonjen iz kategorija!',
                image: 'Slika je uklonjena iz kategorija!',
                video: 'Videozapis je uklonjen iz kategorija!',
                audio: 'Audio je uklonjen iz kategorija!'
              },
              download: {
                gif: 'GIF je učitan!',
                image: 'Slika je učitana!',
                video: 'Video je postavljen!',
                audio: 'Zvuk je preuzet!'
              }
            },
            error: {
              download: {
                gif: 'Preuzimanje GIF-a nije uspjelo',
                image: 'Učitavanje slike nije uspjelo',
                video: 'Preuzimanje videozapisa nije uspjelo',
                audio: 'Preuzimanje zvuka nije uspjelo'
              }
            },
            controls: {
              show: 'Prikaži narudžbe',
              hide: 'Sakrij narudžbe'
            },
            placeholder: {
              gif: 'Naziv GIF-a',
              image: 'Naziv slike',
              video: 'Naziv videozapisa',
              audio: 'Naziv zvuka'
            }
          },
          searchItem: {
            gif: 'Potražite GIF-ove ili kategorije',
            image: 'Potražite slike ili kategorije',
            video: 'Potražite videozapise ili kategorije',
            audio: 'Potražite audio ili kategorije'
          }
        }
      case 'hu': // Hungarian
        return {
          tabName: {
            image: 'Kép',
            video: 'Videó',
            audio: 'Hang'
          },
          create: 'Teremt',
          category: {
            list: 'Kategóriák',
            unsorted: 'Nincs rendezve',
            create: 'Hozzon létre egy kategóriát',
            edit: 'Kategória szerkesztése',
            delete: 'Kategória törlése',
            deleteConfirm: 'Ez a kategória alkategóriákat tartalmaz. Mindegyik törlődik. Biztosan törölni szeretné a kategóriákat?',
            download: 'Média letöltése',
            placeholder: 'Kategória név',
            move: 'Mozog',
            moveNext: 'Utána',
            movePrevious: 'Előtt',
            color: 'Szín',
            copyColor: 'Szín másolása',
            error: {
              needName: 'A név nem lehet üres',
              invalidNameLength: 'A név legfeljebb 20 karakterből állhat',
              wrongColor: 'A szín érvénytelen',
              nameExists: 'Ez a név már létezik',
              invalidCategory: 'A kategória nem létezik',
              download: 'Nem sikerült letölteni a médiát'
            },
            success: {
              create: 'A kategória elkészült!',
              delete: 'A kategória törölve lett!',
              edit: 'A kategória megváltozott!',
              move: 'A kategória áthelyezve!',
              download: 'A média feltöltve!'
            },
            emptyHint: 'Kattintson jobb gombbal a kategória létrehozásához!'
          },
          media: {
            emptyHint: {
              image: 'Kattintson a kép sarkában lévő csillagra, hogy a kedvencek közé helyezze',
              video: 'Kattintson a videó sarkában lévő csillagra, hogy a kedvencek közé tegye',
              audio: 'Kattintson a csillagra egy hang sarkában, hogy a kedvencek közé helyezze'
            },
            addTo: 'Hozzáadás',
            moveTo: 'Mozog',
            removeFrom: 'Törlés a kategóriából',
            copySource: 'Médiaforrás másolása',
            upload: {
              title: 'Feltöltés',
              normal: 'Normál',
              spoiler: 'Spoiler'
            },
            success: {
              move: {
                gif: 'A GIF át lett helyezve!',
                image: 'A kép áthelyezve!',
                video: 'A videó áthelyezve!',
                audio: 'A hang áthelyezve!'
              },
              remove: {
                gif: 'A GIF eltávolítva a kategóriákból!',
                image: 'A képet eltávolítottuk a kategóriákból!',
                video: 'A videót eltávolítottuk a kategóriákból!',
                audio: 'A hangot eltávolítottuk a kategóriákból!'
              },
              download: {
                gif: 'A GIF feltöltve!',
                image: 'A kép feltöltve!',
                video: 'A videó feltöltve!',
                audio: 'A hanganyag letöltve!'
              }
            },
            error: {
              download: {
                gif: 'A GIF letöltése sikertelen',
                image: 'Nem sikerült feltölteni a képet',
                video: 'Nem sikerült letölteni a videót',
                audio: 'Nem sikerült letölteni a hangot'
              }
            },
            controls: {
              show: 'Mutasson megrendeléseket',
              hide: 'Parancsok elrejtése'
            },
            placeholder: {
              gif: 'GIF név',
              image: 'Kép neve',
              video: 'Videó neve',
              audio: 'Hang neve'
            }
          },
          searchItem: {
            gif: 'Keressen GIF-eket vagy kategóriákat',
            image: 'Képek vagy kategóriák keresése',
            video: 'Videók vagy kategóriák keresése',
            audio: 'Audió vagy kategória keresése'
          }
        }
      case 'it': // Italian
        return {
          tabName: {
            image: 'Immagine',
            video: 'video',
            audio: 'Audio'
          },
          create: 'Creare',
          category: {
            list: 'Categorie',
            unsorted: 'Non ordinato',
            create: 'Crea una categoria',
            edit: 'Modifica categoria',
            delete: 'Elimina categoria',
            deleteConfirm: 'Questa categoria contiene sottocategorie. Saranno tutti cancellati. Sei sicuro di voler eliminare le categorie?',
            download: 'Scarica file multimediali',
            placeholder: 'Nome della categoria',
            move: 'Spostare',
            moveNext: 'Dopo',
            movePrevious: 'Prima',
            color: 'Colore',
            copyColor: 'Copia colore',
            error: {
              needName: 'Il nome non può essere vuoto',
              invalidNameLength: 'Il nome deve contenere un massimo di 20 caratteri',
              wrongColor: 'Il colore non è valido',
              nameExists: 'Questo nome esiste già',
              invalidCategory: 'La categoria non esiste',
              download: 'Impossibile scaricare i media'
            },
            success: {
              create: 'La categoria è stata creata!',
              delete: 'La categoria è stata eliminata!',
              edit: 'La categoria è stata cambiata!',
              move: 'La categoria è stata spostata!',
              download: 'Il supporto è stato caricato!'
            },
            emptyHint: 'Fare clic con il tasto destro per creare una categoria!'
          },
          media: {
            emptyHint: {
              image: 'Fai clic sulla stella nell\'angolo di un\'immagine per inserirla nei preferiti',
              video: 'Fai clic sulla stella nell\'angolo di un video per inserirlo nei preferiti',
              audio: 'Fai clic sulla stella nell\'angolo di un audio per inserirlo nei preferiti'
            },
            addTo: 'Inserisci',
            moveTo: 'Spostare',
            removeFrom: 'Rimuovi dalla categoria',
            copySource: 'Copia la fonte multimediale',
            upload: {
              title: 'Caricare',
              normal: 'Normale',
              spoiler: 'spoiler'
            },
            success: {
              move: {
                gif: 'La GIF è stata spostata!',
                image: 'L\'immagine è stata spostata!',
                video: 'Il video è stato spostato!',
                audio: 'L\'audio è stato spostato!'
              },
              remove: {
                gif: 'La GIF è stata rimossa dalle categorie!',
                image: 'L\'immagine è stata rimossa dalle categorie!',
                video: 'Il video è stato rimosso dalle categorie!',
                audio: 'L\'audio è stato rimosso dalle categorie!'
              },
              download: {
                gif: 'La GIF è stata caricata!',
                image: 'L\'immagine è stata caricata!',
                video: 'Il video è stato caricato!',
                audio: 'L\'audio è stato scaricato!'
              }
            },
            error: {
              download: {
                gif: 'Impossibile scaricare la GIF',
                image: 'Impossibile caricare l\'immagine',
                video: 'Impossibile scaricare il video',
                audio: 'Impossibile scaricare l\'audio'
              }
            },
            controls: {
              show: 'Mostra ordini',
              hide: 'Nascondi ordini'
            },
            placeholder: {
              gif: 'Nome GIF',
              image: 'Nome immagine',
              video: 'Nome del video',
              audio: 'Nome dell\'audio'
            }
          },
          searchItem: {
            gif: 'Cerca GIF o categorie',
            image: 'Cerca immagini o categorie',
            video: 'Cerca video o categorie',
            audio: 'Cerca audio o categorie'
          }
        }
      case 'ja': // Japanese
        return {
          tabName: {
            image: '画像',
            video: 'ビデオ',
            audio: 'オーディオ'
          },
          create: '作成する',
          category: {
            list: 'カテゴリー',
            unsorted: 'ソートされていません',
            create: 'カテゴリを作成する',
            edit: 'カテゴリを編集',
            delete: 'カテゴリを削除',
            deleteConfirm: 'このカテゴリにはサブカテゴリが含まれています。 それらはすべて削除されます。 カテゴリを削除してもよろしいですか?',
            download: 'メディアをダウンロード',
            placeholder: '種別名',
            move: '移動',
            moveNext: '後',
            movePrevious: '前',
            color: '色',
            copyColor: 'コピーカラー',
            error: {
              needName: '名前を空にすることはできません',
              invalidNameLength: '名前には最大20文字を含める必要があります',
              wrongColor: '色が無効です',
              nameExists: 'この名前はすでに存在します',
              invalidCategory: 'カテゴリが存在しません',
              download: 'メディアのダウンロードに失敗しました'
            },
            success: {
              create: 'カテゴリが作成されました！',
              delete: 'カテゴリが削除されました！',
              edit: 'カテゴリが変更されました！',
              move: 'カテゴリが移動しました！',
              download: 'メディアがアップしました！'
            },
            emptyHint: '右クリックしてカテゴリを作成してください！'
          },
          media: {
            emptyHint: {
              image: '画像の隅にある星をクリックして、お気に入りに追加します',
              video: '動画の隅にある星をクリックして、お気に入りに追加します',
              audio: 'オーディオの隅にある星をクリックして、お気に入りに入れます'
            },
            addTo: '追加',
            moveTo: '移動',
            removeFrom: 'カテゴリから削除',
            copySource: 'メディア ソースのコピー',
            upload: {
              title: 'アップロード',
              normal: '正常',
              spoiler: 'ネタバレ'
            },
            success: {
              move: {
                gif: 'GIFを移動しました！',
                image: '画像が移動しました！',
                video: 'ビデオが移動しました！',
                audio: '音声が移動しました！'
              },
              remove: {
                gif: 'GIF はカテゴリから削除されました。',
                image: '画像はカテゴリから削除されました！',
                video: '動画はカテゴリから削除されました！',
                audio: 'オーディオはカテゴリから削除されました！'
              },
              download: {
                gif: 'GIFをアップしました！',
                image: '画像をアップしました！',
                video: '動画がアップしました！',
                audio: '音声がダウンロードされました！'
              }
            },
            error: {
              download: {
                gif: 'GIF のダウンロードに失敗しました',
                image: '画像のアップロードに失敗しました',
                video: 'ビデオのダウンロードに失敗しました',
                audio: 'オーディオのダウンロードに失敗しました'
              }
            },
            controls: {
              show: '注文を表示',
              hide: '注文を非表示'
            },
            placeholder: {
              gif: 'GIF名',
              image: '画像名',
              video: 'ビデオ名',
              audio: '音声名'
            }
          },
          searchItem: {
            gif: 'GIF またはカテゴリを検索する',
            image: '画像やカテゴリを検索する',
            video: 'ビデオまたはカテゴリを検索する',
            audio: 'オーディオまたはカテゴリを検索する'
          }
        }
      case 'ko': // Korean
        return {
          tabName: {
            image: '그림',
            video: '비디오',
            audio: '오디오'
          },
          create: '창조하다',
          category: {
            list: '카테고리',
            unsorted: '정렬되지 않음',
            create: '카테고리 생성',
            edit: '카테고리 수정',
            delete: '카테고리 삭제',
            deleteConfirm: '이 범주에는 하위 범주가 포함되어 있습니다. 모두 삭제됩니다. 카테고리를 삭제하시겠습니까?',
            download: '미디어 다운로드',
            placeholder: '카테고리 이름',
            move: '움직임',
            moveNext: '후',
            movePrevious: '전에',
            color: '색깔',
            copyColor: '색상 복사',
            error: {
              needName: '이름은 비워 둘 수 없습니다.',
              invalidNameLength: '이름은 최대 20 자 여야합니다.',
              wrongColor: '색상이 잘못되었습니다.',
              nameExists: '이 이름은 이미 존재합니다',
              invalidCategory: '카테고리가 없습니다.',
              download: '미디어 다운로드 실패'
            },
            success: {
              create: '카테고리가 생성되었습니다!',
              delete: '카테고리가 삭제되었습니다!',
              edit: '카테고리가 변경되었습니다!',
              move: '카테고리가 이동되었습니다!',
              download: '미디어가 업로드되었습니다!'
            },
            emptyHint: '카테고리를 만들려면 마우스 오른쪽 버튼을 클릭하십시오!'
          },
          media: {
            emptyHint: {
              image: '이미지 모서리에있는 별을 클릭하여 즐겨 찾기에 추가하세요.',
              video: '동영상 모서리에있는 별표를 클릭하여 즐겨 찾기에 추가하세요.',
              audio: '오디오 모서리에있는 별표를 클릭하여 즐겨 찾기에 넣습니다.'
            },
            addTo: '더하다',
            moveTo: '움직임',
            removeFrom: '카테고리에서 제거',
            copySource: '미디어 소스 복사',
            upload: {
              title: '업로드',
              normal: '표준',
              spoiler: '스포일러'
            },
            success: {
              move: {
                gif: 'GIF가 이동되었습니다!',
                image: '이미지가 이동되었습니다!',
                video: '동영상이 이동되었습니다!',
                audio: '오디오가 이동되었습니다!'
              },
              remove: {
                gif: 'GIF가 카테고리에서 제거되었습니다!',
                image: '카테고리에서 이미지가 제거되었습니다!',
                video: '비디오가 카테고리에서 제거되었습니다!',
                audio: '카테고리에서 오디오가 제거되었습니다!'
              },
              download: {
                gif: 'GIF가 업로드되었습니다!',
                image: '이미지가 업로드되었습니다!',
                video: '영상이 업로드 되었습니다!',
                audio: '오디오가 다운로드되었습니다!'
              }
            },
            error: {
              download: {
                gif: 'GIF 다운로드 실패',
                image: '이미지를 업로드하지 못했습니다.',
                video: '동영상 다운로드 실패',
                audio: '오디오 다운로드 실패'
              }
            },
            controls: {
              show: '주문보기',
              hide: '주문 숨기기'
            },
            placeholder: {
              gif: 'GIF 이름',
              image: '이미지 이름',
              video: '비디오 이름',
              audio: '오디오 이름'
            }
          },
          searchItem: {
            gif: 'GIF 또는 카테고리 검색',
            image: '이미지 또는 카테고리 검색',
            video: '비디오 또는 카테고리 검색',
            audio: '오디오 또는 카테고리 검색'
          }
        }
      case 'lt': // Lithuanian
        return {
          tabName: {
            image: 'Paveikslėlis',
            video: 'Vaizdo įrašas',
            audio: 'Garso įrašas'
          },
          create: 'Kurti',
          category: {
            list: 'Kategorijos',
            unsorted: 'Nerūšiuota',
            create: 'Sukurkite kategoriją',
            edit: 'Redaguoti kategoriją',
            delete: 'Ištrinti kategoriją',
            deleteConfirm: 'Šioje kategorijoje yra subkategorijų. Jie visi bus ištrinti. Ar tikrai norite ištrinti kategorijas?',
            download: 'Parsisiųsti mediją',
            placeholder: 'Kategorijos pavadinimas',
            move: 'Perkelti',
            moveNext: 'Po',
            movePrevious: 'Anksčiau',
            color: 'Spalva',
            copyColor: 'Kopijuoti spalvą',
            error: {
              needName: 'Pavadinimas negali būti tuščias',
              invalidNameLength: 'Pavadinime gali būti ne daugiau kaip 20 simbolių',
              wrongColor: 'Spalva neteisinga',
              nameExists: 'šis vardas jau egzistuoja',
              invalidCategory: 'Kategorija neegzistuoja',
              download: 'Nepavyko atsisiųsti medijos'
            },
            success: {
              create: 'Kategorija sukurta!',
              delete: 'Kategorija ištrinta!',
              edit: 'Kategorija pakeista!',
              move: 'Kategorija perkelta!',
              download: 'Žiniasklaida įkelta!'
            },
            emptyHint: 'Dešiniuoju pelės mygtuku spustelėkite norėdami sukurti kategoriją!'
          },
          media: {
            emptyHint: {
              image: 'Spustelėkite žvaigždutę atvaizdo kampe, kad ją įtrauktumėte į mėgstamiausius',
              video: 'Spustelėkite žvaigždutę vaizdo įrašo kampe, kad įtrauktumėte ją į mėgstamiausius',
              audio: 'Spustelėkite žvaigždutę garso kampe, kad įtrauktumėte ją į mėgstamiausius'
            },
            addTo: 'Papildyti',
            moveTo: 'Perkelti',
            removeFrom: 'Pašalinti iš kategorijos',
            copySource: 'Nukopijuokite medijos šaltinį',
            upload: {
              title: 'Įkelti',
              normal: 'Normalus',
              spoiler: 'Spoileris'
            },
            success: {
              move: {
                gif: 'GIF buvo perkeltas!',
                image: 'Vaizdas perkeltas!',
                video: 'Vaizdo įrašas perkeltas!',
                audio: 'Garso įrašas perkeltas!'
              },
              remove: {
                gif: 'GIF buvo pašalintas iš kategorijų!',
                image: 'Vaizdas pašalintas iš kategorijų!',
                video: 'Vaizdo įrašas pašalintas iš kategorijų!',
                audio: 'Garso įrašas pašalintas iš kategorijų!'
              },
              download: {
                gif: 'GIF failas įkeltas!',
                image: 'Vaizdas įkeltas!',
                video: 'Vaizdo įrašas įkeltas!',
                audio: 'Garso įrašas atsisiųstas!'
              }
            },
            error: {
              download: {
                gif: 'Nepavyko atsisiųsti GIF',
                image: 'Nepavyko įkelti vaizdo',
                video: 'Nepavyko atsisiųsti vaizdo įrašo',
                audio: 'Nepavyko atsisiųsti garso įrašo'
              }
            },
            controls: {
              show: 'Rodyti užsakymus',
              hide: 'Slėpti užsakymus'
            },
            placeholder: {
              gif: 'GIF pavadinimas',
              image: 'Paveikslėlio pavadinimas',
              video: 'Vaizdo įrašo pavadinimas',
              audio: 'Garso įrašo pavadinimas'
            }
          },
          searchItem: {
            gif: 'Ieškokite GIF arba kategorijų',
            image: 'Ieškokite vaizdų ar kategorijų',
            video: 'Ieškokite vaizdo įrašų ar kategorijų',
            audio: 'Ieškokite garso įrašų ar kategorijų'
          }
        }
      case 'nl': // Dutch
        return {
          tabName: {
            image: 'Afbeelding',
            video: 'Video',
            audio: 'Audio'
          },
          create: 'scheppen',
          category: {
            list: 'Kategorier',
            unsorted: 'Niet gesorteerd',
            create: 'Maak een categorie',
            edit: 'Categorie bewerken',
            delete: 'Categorie verwijderen',
            deleteConfirm: 'Deze categorie bevat subcategorieën. Ze worden allemaal verwijderd. Weet u zeker dat u categorieën wilt verwijderen?',
            download: 'Media downloaden',
            placeholder: 'Categorie naam',
            move: 'Verplaatsen, verschuiven',
            moveNext: 'Na',
            movePrevious: 'Voordat',
            color: 'Kleur',
            copyColor: 'Kopieer kleur',
            error: {
              needName: 'Naam mag niet leeg zijn',
              invalidNameLength: 'De naam mag maximaal 20 tekens bevatten',
              wrongColor: 'Kleur is ongeldig',
              nameExists: 'Deze naam bestaat al',
              invalidCategory: 'De categorie bestaat niet',
              download: 'Kan media niet downloaden'
            },
            success: {
              create: 'De categorie is aangemaakt!',
              delete: 'De categorie is verwijderd!',
              edit: 'De categorie is gewijzigd!',
              move: 'De categorie is verplaatst!',
              download: 'De media is geüpload!'
            },
            emptyHint: 'Klik met de rechtermuisknop om een categorie aan te maken!'
          },
          media: {
            emptyHint: {
              image: 'Klik op de ster in de hoek van een afbeelding om deze in je favorieten te plaatsen',
              video: 'Klik op de ster in de hoek van een video om deze in je favorieten te plaatsen',
              audio: 'Klik op de ster in de hoek van een audio om deze in je favorieten te plaatsen'
            },
            addTo: 'Toevoegen',
            moveTo: 'Verplaatsen, verschuiven',
            removeFrom: 'Verwijderen uit categorie',
            copySource: 'Mediabron kopiëren',
            upload: {
              title: 'Uploaden',
              normal: 'normaal',
              spoiler: 'Spoiler'
            },
            success: {
              move: {
                gif: 'GIF\'en er blevet flyttet!',
                image: 'De afbeelding is verplaatst!',
                video: 'De video is verplaatst!',
                audio: 'Het geluid is verplaatst!'
              },
              remove: {
                gif: 'GIF\'en er blevet fjernet fra kategorierne!',
                image: 'De afbeelding is verwijderd uit de categorieën!',
                video: 'De video is verwijderd uit de categorieën!',
                audio: 'Audio is verwijderd uit categorieën!'
              },
              download: {
                gif: 'GIF\'en er blevet uploadet!',
                image: 'De afbeelding is geüpload!',
                video: 'De video is geüpload!',
                audio: 'De audio is gedownload!'
              }
            },
            error: {
              download: {
                gif: 'Kunne ikke downloade GIF',
                image: 'Kan afbeelding niet uploaden',
                video: 'Kan video niet downloaden',
                audio: 'Kan audio niet downloaden'
              }
            },
            controls: {
              show: 'Toon bestellingen',
              hide: 'Verberg bestellingen'
            },
            placeholder: {
              gif: 'GIF navn',
              image: 'Naam afbeelding',
              video: 'Videonaam',
              audio: 'Audionaam'
            }
          },
          searchItem: {
            gif: 'Søg efter GIF\'er eller kategorier',
            image: 'Zoeken naar afbeeldingen of categorieën',
            video: 'Zoeken naar video\'s of categorieën',
            audio: 'Zoeken naar audio of categorieën'
          }
        }
      case 'no': // Norwegian
        return {
          tabName: {
            image: 'Bilde',
            video: 'Video',
            audio: 'Lyd'
          },
          create: 'Skape',
          category: {
            list: 'Kategorier',
            unsorted: 'Ikke sortert',
            create: 'Opprett en kategori',
            edit: 'Rediger kategori',
            delete: 'Slett kategori',
            deleteConfirm: 'Denne kategorien inneholder underkategorier. De vil alle bli slettet. Er du sikker på at du vil slette kategorier?',
            download: 'Last ned media',
            placeholder: 'Kategori navn',
            move: 'Bevege seg',
            moveNext: 'Etter',
            movePrevious: 'Før',
            color: 'Farge',
            copyColor: 'Kopier farge',
            error: {
              needName: 'Navnet kan ikke være tomt',
              invalidNameLength: 'Navnet må inneholde maksimalt 20 tegn',
              wrongColor: 'Fargen er ugyldig',
              nameExists: 'dette navnet eksisterer allerede',
              invalidCategory: 'Kategorien eksisterer ikke',
              download: 'Kunne ikke laste ned medier'
            },
            success: {
              create: 'Kategorien er opprettet!',
              delete: 'Kategorien er slettet!',
              edit: 'Kategorien er endret!',
              move: 'Kategorien er flyttet!',
              download: 'Mediene er lastet opp!'
            },
            emptyHint: 'Høyreklikk for å opprette en kategori!'
          },
          media: {
            emptyHint: {
              image: 'Klikk på stjernen i hjørnet av et bilde for å sette det i favorittene dine',
              video: 'Klikk på stjernen i hjørnet av en video for å sette den i favorittene dine',
              audio: 'Klikk på stjernen i hjørnet av en lyd for å sette den i favorittene dine'
            },
            addTo: 'Legge til',
            moveTo: 'Bevege seg',
            removeFrom: 'Fjern fra kategori',
            copySource: 'Kopier mediekilde',
            upload: {
              title: 'Laste opp',
              normal: 'Vanlig',
              spoiler: 'Spoiler'
            },
            success: {
              move: {
                gif: 'GIF-en er flyttet!',
                image: 'Bildet er flyttet!',
                video: 'Videoen er flyttet!',
                audio: 'Lyden er flyttet!'
              },
              remove: {
                gif: 'GIF-en er fjernet fra kategoriene!',
                image: 'Bildet er fjernet fra kategoriene!',
                video: 'Videoen er fjernet fra kategoriene!',
                audio: 'Lyd er fjernet fra kategorier!'
              },
              download: {
                gif: 'GIF-en er lastet opp!',
                image: 'Bildet er lastet opp!',
                video: 'Videoen er lastet opp!',
                audio: 'Lyden er lastet ned!'
              }
            },
            error: {
              download: {
                gif: 'Kunne ikke laste ned GIF',
                image: 'Kunne ikke laste opp bildet',
                video: 'Kunne ikke laste ned video',
                audio: 'Kunne ikke laste ned lyd'
              }
            },
            controls: {
              show: 'Vis ordrer',
              hide: 'Skjul ordrer'
            },
            placeholder: {
              gif: 'GIF-navn',
              image: 'Bilde navn',
              video: 'Video navn',
              audio: 'Lydnavn'
            }
          },
          searchItem: {
            gif: 'Søk etter GIF-er eller kategorier',
            image: 'Søk etter bilder eller kategorier',
            video: 'Søk etter videoer eller kategorier',
            audio: 'Søk etter lyd eller kategorier'
          }
        }
      case 'pl': // Polish
        return {
          tabName: {
            image: 'Obrazek',
            video: 'Wideo',
            audio: 'Audio'
          },
          create: 'Stwórz',
          category: {
            list: 'Kategorie',
            unsorted: 'Nie posortowane',
            create: 'Utwórz kategorię',
            edit: 'Edytuj kategorię',
            delete: 'Usuń kategorię',
            deleteConfirm: 'Ta kategoria zawiera podkategorie. Wszystkie zostaną usunięte. Czy na pewno chcesz usunąć kategorie?',
            download: 'Pobierz multimedia',
            placeholder: 'Nazwa Kategorii',
            move: 'Ruszaj się',
            moveNext: 'Po',
            movePrevious: 'Przed',
            color: 'Kolor',
            copyColor: 'Kopiuj kolor',
            error: {
              needName: 'Nazwa nie może być pusta',
              invalidNameLength: 'Nazwa musi zawierać maksymalnie 20 znaków',
              wrongColor: 'Kolor jest nieprawidłowy',
              nameExists: 'ta nazwa już istnieje',
              invalidCategory: 'Kategoria nie istnieje',
              download: 'Nie udało się pobrać multimediów'
            },
            success: {
              create: 'Kategoria została stworzona!',
              delete: 'Kategoria została usunięta!',
              edit: 'Kategoria została zmieniona!',
              move: 'Kategoria została przeniesiona!',
              download: 'Media zostały przesłane!'
            },
            emptyHint: 'Kliknij prawym przyciskiem myszy, aby utworzyć kategorię!'
          },
          media: {
            emptyHint: {
              image: 'Kliknij gwiazdkę w rogu obrazu, aby umieścić go w ulubionych',
              video: 'Kliknij gwiazdkę w rogu filmu, aby umieścić go w ulubionych',
              audio: 'Kliknij gwiazdkę w rogu nagrania, aby umieścić go w ulubionych your'
            },
            addTo: 'Dodaj',
            moveTo: 'Ruszaj się',
            removeFrom: 'Usuń z kategorii',
            copySource: 'Kopiuj źródło multimediów',
            upload: {
              title: 'Przekazać plik',
              normal: 'Normalna',
              spoiler: 'Spojler'
            },
            success: {
              move: {
                gif: 'GIF został przeniesiony!',
                image: 'Obraz został przeniesiony!',
                video: 'Film został przeniesiony!',
                audio: 'Dźwięk został przeniesiony!'
              },
              remove: {
                gif: 'GIF został usunięty z kategorii!',
                image: 'Obraz został usunięty z kategorii!',
                video: 'Film został usunięty z kategorii!',
                audio: 'Dźwięk został usunięty z kategorii!'
              },
              download: {
                gif: 'GIF został przesłany!',
                image: 'Obraz został przesłany!',
                video: 'Film został przesłany!',
                audio: 'Dźwięk został pobrany!'
              }
            },
            error: {
              download: {
                gif: 'Nie udało się pobrać GIF-a',
                image: 'Nie udało się przesłać obrazu',
                video: 'Nie udało się pobrać wideo',
                audio: 'Nie udało się pobrać dźwięku'
              }
            },
            controls: {
              show: 'Pokaż zamówienia',
              hide: 'Ukryj zamówienia'
            },
            placeholder: {
              gif: 'Nazwa GIF-a',
              image: 'Nazwa obrazu',
              video: 'Nazwa wideo',
              audio: 'Nazwa dźwięku'
            }
          },
          searchItem: {
            gif: 'Wyszukaj GIF-y lub kategorie',
            image: 'Wyszukaj obrazy lub kategorie',
            video: 'Wyszukaj filmy lub kategorie',
            audio: 'Wyszukaj audio lub kategorie'
          }
        }
      case 'pt-BR': // Portuguese (Brazil)
        return {
          tabName: {
            image: 'Foto',
            video: 'Vídeo',
            audio: 'Áudio'
          },
          create: 'Crio',
          category: {
            list: 'Categorias',
            unsorted: 'Não classificado',
            create: 'Crie uma categoria',
            edit: 'Editar categoria',
            delete: 'Apagar categoria',
            deleteConfirm: 'Esta categoria contém subcategorias. Todos eles serão excluídos. Tem certeza de que deseja excluir as categorias?',
            download: 'Baixar mídia',
            placeholder: 'Nome da Categoria',
            move: 'Mover',
            moveNext: 'Após',
            movePrevious: 'Antes',
            color: 'Cor',
            copyColor: 'Cor da cópia',
            error: {
              needName: 'O nome não pode estar vazio',
              invalidNameLength: 'O nome deve conter no máximo 20 caracteres',
              wrongColor: 'Cor é inválida',
              nameExists: 'Este nome já existe',
              invalidCategory: 'A categoria não existe',
              download: 'Falha ao baixar mídia'
            },
            success: {
              create: 'A categoria foi criada!',
              delete: 'A categoria foi excluída!',
              edit: 'A categoria foi alterada!',
              move: 'A categoria foi movida!',
              download: 'A mídia foi carregada!'
            },
            emptyHint: 'Clique com o botão direito para criar uma categoria!'
          },
          media: {
            emptyHint: {
              image: 'Clique na estrela no canto de uma imagem para colocá-la em seus favoritos',
              video: 'Clique na estrela no canto de um vídeo para colocá-lo em seus favoritos',
              audio: 'Clique na estrela no canto de um áudio para colocá-lo em seus favoritos'
            },
            addTo: 'Adicionar',
            moveTo: 'Mover',
            removeFrom: 'Remover da categoria',
            copySource: 'Copiar fonte de mídia',
            upload: {
              title: 'Envio',
              normal: 'Normal',
              spoiler: 'Spoiler'
            },
            success: {
              move: {
                gif: 'O GIF foi movido!',
                image: 'A imagem foi movida!',
                video: 'O vídeo foi movido!',
                audio: 'O áudio foi movido!'
              },
              remove: {
                gif: 'O GIF foi removido das categorias!',
                image: 'A imagem foi removida das categorias!',
                video: 'O vídeo foi removido das categorias!',
                audio: 'O áudio foi removido das categorias!'
              },
              download: {
                gif: 'O GIF foi carregado!',
                image: 'A imagem foi carregada!',
                video: 'O vídeo foi carregado!',
                audio: 'O áudio foi baixado!'
              }
            },
            error: {
              download: {
                gif: 'Falha ao baixar o GIF',
                image: 'Falha ao carregar imagem',
                video: 'Falha ao baixar o vídeo',
                audio: 'Falha ao baixar áudio'
              }
            },
            controls: {
              show: 'Mostrar pedidos',
              hide: 'Ocultar pedidos'
            },
            placeholder: {
              gif: 'Nome do GIF',
              image: 'Nome da imagem',
              video: 'Nome do vídeo',
              audio: 'Nome de áudio'
            }
          },
          searchItem: {
            gif: 'Pesquise GIFs ou categorias',
            image: 'Pesquise imagens ou categorias',
            video: 'Pesquise vídeos ou categorias',
            audio: 'Pesquise áudios ou categorias'
          }
        }
      case 'ro': // Romanian
        return {
          tabName: {
            image: 'Imagine',
            video: 'Video',
            audio: 'Audio'
          },
          create: 'Crea',
          category: {
            list: 'Categorii',
            unsorted: 'Nu sunt sortate',
            create: 'Creați o categorie',
            edit: 'Editați categoria',
            delete: 'Ștergeți categoria',
            deleteConfirm: 'Această categorie conține subcategorii. Toate vor fi șterse. Sigur doriți să ștergeți categoriile?',
            download: 'Descărcați conținut media',
            placeholder: 'Numele categoriei',
            move: 'Mișcare',
            moveNext: 'După',
            movePrevious: 'Inainte de',
            color: 'Culoare',
            copyColor: 'Copiați culoarea',
            error: {
              needName: 'Numele nu poate fi gol',
              invalidNameLength: 'Numele trebuie să conțină maximum 20 de caractere',
              wrongColor: 'Culoarea nu este validă',
              nameExists: 'Acest nume există deja',
              invalidCategory: 'Categoria nu există',
              download: 'Descărcarea conținutului media nu a reușit'
            },
            success: {
              create: 'Categoria a fost creată!',
              delete: 'Categoria a fost ștearsă!',
              edit: 'Categoria a fost schimbată!',
              move: 'Categoria a fost mutată!',
              download: 'Media a fost încărcată!'
            },
            emptyHint: 'Faceți clic dreapta pentru a crea o categorie!'
          },
          media: {
            emptyHint: {
              image: 'Faceți clic pe steaua din colțul unei imagini pentru ao pune în preferatele dvs.',
              video: 'Faceți clic pe steaua din colțul unui videoclip pentru a-l introduce în preferatele dvs.',
              audio: 'Faceți clic pe steaua din colțul unui sunet pentru ao pune în preferatele dvs.'
            },
            addTo: 'Adăuga',
            moveTo: 'Mișcare',
            removeFrom: 'Eliminați din categorie',
            copySource: 'Copiați sursa media',
            upload: {
              title: 'Încărcare',
              normal: 'Normal',
              spoiler: 'Spoiler'
            },
            success: {
              move: {
                gif: 'GIF-ul a fost mutat!',
                image: 'Imaginea a fost mutată!',
                video: 'Videoclipul a fost mutat!',
                audio: 'Sunetul a fost mutat!'
              },
              remove: {
                gif: 'GIF-ul a fost eliminat din categorii!',
                image: 'Imaginea a fost eliminată din categorii!',
                video: 'Videoclipul a fost eliminat din categorii!',
                audio: 'Sunetul a fost eliminat din categorii!'
              },
              download: {
                gif: 'GIF-ul a fost încărcat!',
                image: 'Imaginea a fost încărcată!',
                video: 'Videoclipul a fost încărcat!',
                audio: 'Sunetul a fost descărcat!'
              }
            },
            error: {
              download: {
                gif: 'Nu s-a putut descărca GIF',
                image: 'Nu s-a încărcat imaginea',
                video: 'Descărcarea videoclipului nu a reușit',
                audio: 'Descărcarea audio nu a reușit'
              }
            },
            controls: {
              show: 'Afișați comenzile',
              hide: 'Ascundeți comenzile'
            },
            placeholder: {
              gif: 'Nume GIF',
              image: 'Numele imaginii',
              video: 'Numele videoclipului',
              audio: 'Numele audio'
            }
          },
          searchItem: {
            gif: 'Căutați GIF-uri sau categorii',
            image: 'Căutați imagini sau categorii',
            video: 'Căutați videoclipuri sau categorii',
            audio: 'Căutați audio sau categorii'
          }
        }
      case 'ru': // Russian
        return {
          tabName: {
            image: 'Картина',
            video: 'Видео',
            audio: 'Аудио'
          },
          create: 'Создавать',
          category: {
            list: 'Категории',
            unsorted: 'Не отсортировано',
            create: 'Создать категорию',
            edit: 'Изменить категорию',
            delete: 'Удалить категорию',
            deleteConfirm: 'Эта категория содержит подкатегории. Все они будут удалены. Вы уверены, что хотите удалить категории?',
            download: 'Скачать медиа',
            placeholder: 'Название категории',
            move: 'Двигаться',
            moveNext: 'После',
            movePrevious: 'Перед',
            color: 'Цвет',
            copyColor: 'Цвет копии',
            error: {
              needName: 'Имя не может быть пустым',
              invalidNameLength: 'Имя должно содержать не более 20 символов.',
              wrongColor: 'Цвет недействителен',
              nameExists: 'Это имя уже существует',
              invalidCategory: 'Категория не существует',
              download: 'Не удалось скачать медиа'
            },
            success: {
              create: 'Категория создана!',
              delete: 'Категория удалена!',
              edit: 'Категория изменена!',
              move: 'Категория перемещена!',
              download: 'Медиа загружена!'
            },
            emptyHint: 'Щелкните правой кнопкой мыши, чтобы создать категорию!'
          },
          media: {
            emptyHint: {
              image: 'Нажмите на звезду в углу изображения, чтобы добавить его в избранное.',
              video: 'Нажмите на звездочку в углу видео, чтобы добавить его в избранное.',
              audio: 'Нажмите на звездочку в углу аудио, чтобы добавить его в избранное.'
            },
            addTo: 'Добавлять',
            moveTo: 'Двигаться',
            removeFrom: 'Удалить из категории',
            copySource: 'Копировать медиа-источник',
            upload: {
              title: 'Загрузить',
              normal: 'Обычный',
              spoiler: 'Спойлер'
            },
            success: {
              move: {
                gif: 'Гифку перенесли!',
                image: 'Изображение было перемещено!',
                video: 'Видео перемещено!',
                audio: 'Звук был перемещен!'
              },
              remove: {
                gif: 'Гифка удалена из категорий!',
                image: 'Изображение удалено из категорий!',
                video: 'Видео удалено из категорий!',
                audio: 'Аудио удалено из категорий!'
              },
              download: {
                gif: 'Гифка загружена!',
                image: 'Изображение загружено!',
                video: 'Видео загружено!',
                audio: 'Аудио скачано!'
              }
            },
            error: {
              download: {
                gif: 'Не удалось скачать GIF',
                image: 'Не удалось загрузить изображение',
                video: 'Не удалось скачать видео',
                audio: 'Не удалось скачать аудио'
              }
            },
            controls: {
              show: 'Показать заказы',
              hide: 'Скрыть заказы'
            },
            placeholder: {
              gif: 'Имя GIF',
              image: 'Имя изображения',
              video: 'Название видео',
              audio: 'Название аудио'
            }
          },
          searchItem: {
            gif: 'Поиск GIF-файлов или категорий',
            image: 'Поиск изображений или категорий',
            video: 'Поиск видео или категорий',
            audio: 'Поиск аудио или категорий'
          }
        }
      case 'sv': // Swedish
        return {
          tabName: {
            image: 'Bild',
            video: 'Video',
            audio: 'Audio'
          },
          create: 'Skapa',
          category: {
            list: 'Kategorier',
            unsorted: 'Inte sorterat',
            create: 'Skapa en kategori',
            edit: 'Redigera kategori',
            delete: 'Ta bort kategori',
            deleteConfirm: 'Denna kategori innehåller underkategorier. De kommer alla att raderas. Är du säker på att du vill ta bort kategorier?',
            download: 'Ladda ner media',
            placeholder: 'Kategori namn',
            move: 'Flytta',
            moveNext: 'Efter',
            movePrevious: 'Innan',
            color: 'Färg',
            copyColor: 'Kopiera färg',
            error: {
              needName: 'Namnet kan inte vara tomt',
              invalidNameLength: 'Namnet måste innehålla högst 20 tecken',
              wrongColor: 'Färgen är ogiltig',
              nameExists: 'detta namn finns redan',
              invalidCategory: 'Kategorin finns inte',
              download: 'Det gick inte att ladda ner media'
            },
            success: {
              create: 'Kategorin har skapats!',
              delete: 'Kategorin har tagits bort!',
              edit: 'Kategorin har ändrats!',
              move: 'Kategorin har flyttats!',
              download: 'Media har laddats upp!'
            },
            emptyHint: 'Högerklicka för att skapa en kategori!'
          },
          media: {
            emptyHint: {
              image: 'Klicka på stjärnan i hörnet av en bild för att lägga den till dina favoriter',
              video: 'Klicka på stjärnan i hörnet av en video för att lägga den till dina favoriter',
              audio: 'Klicka på stjärnan i hörnet av ett ljud för att placera den i dina favoriter'
            },
            addTo: 'Lägg till',
            moveTo: 'Flytta',
            removeFrom: 'Ta bort från kategori',
            copySource: 'Kopiera mediakälla',
            upload: {
              title: 'Ladda upp',
              normal: 'Vanligt',
              spoiler: 'Spoiler'
            },
            success: {
              move: {
                gif: 'GIF:en har flyttats!',
                image: 'Bilden har flyttats!',
                video: 'Videon har flyttats!',
                audio: 'Ljudet har flyttats!'
              },
              remove: {
                gif: 'GIF har tagits bort från kategorierna!',
                image: 'Bilden har tagits bort från kategorierna!',
                video: 'Videon har tagits bort från kategorierna!',
                audio: 'Ljud har tagits bort från kategorier!'
              },
              download: {
                gif: 'GIF-filen har laddats upp!',
                image: 'Bilden har laddats upp!',
                video: 'Videon har laddats upp!',
                audio: 'Ljudet har laddats ner!'
              }
            },
            error: {
              download: {
                gif: 'Det gick inte att ladda ner GIF',
                image: 'Det gick inte att ladda upp bilden',
                video: 'Det gick inte att ladda ner videon',
                audio: 'Det gick inte att ladda ner ljudet'
              }
            },
            controls: {
              show: 'Visa order',
              hide: 'Dölj beställningar'
            },
            placeholder: {
              gif: 'GIF-namn',
              image: 'Bildnamn',
              video: 'Videonamn',
              audio: 'Ljudnamn'
            }
          },
          searchItem: {
            gif: 'Sök efter GIF-filer eller kategorier',
            image: 'Sök efter bilder eller kategorier',
            video: 'Sök efter videor eller kategorier',
            audio: 'Sök efter ljud eller kategorier'
          }
        }
      case 'th': // Thai
        return {
          tabName: {
            image: 'ภาพ',
            video: 'วีดีโอ',
            audio: 'เครื่องเสียง'
          },
          create: 'สร้าง',
          category: {
            list: 'หมวดหมู่',
            unsorted: 'ไม่เรียง',
            create: 'สร้างหมวดหมู่',
            edit: 'แก้ไขหมวดหมู่',
            delete: 'ลบหมวดหมู่',
            deleteConfirm: 'หมวดหมู่นี้มีหมวดหมู่ย่อย พวกเขาทั้งหมดจะถูกลบ คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่',
            download: 'ดาวน์โหลดสื่อ',
            placeholder: 'ชื่อหมวดหมู่',
            move: 'ย้าย',
            moveNext: 'หลังจาก',
            movePrevious: 'ก่อน',
            color: 'สี',
            copyColor: 'คัดลอกสี',
            error: {
              needName: 'ชื่อไม่สามารถเว้นว่างได้',
              invalidNameLength: 'ชื่อต้องมีอักขระไม่เกิน 20 ตัว',
              wrongColor: 'สีไม่ถูกต้อง',
              nameExists: 'มีชื่อนี้แล้ว',
              invalidCategory: 'ไม่มีหมวดหมู่',
              download: 'ไม่สามารถดาวน์โหลดสื่อ'
            },
            success: {
              create: 'หมวดหมู่ถูกสร้างขึ้น!',
              delete: 'หมวดหมู่ถูกลบ!',
              edit: 'หมวดหมู่มีการเปลี่ยนแปลง!',
              move: 'หมวดหมู่ถูกย้าย!',
              download: 'สื่อได้รับการอัปโหลด!'
            },
            emptyHint: 'คลิกขวาเพื่อสร้างหมวดหมู่!'
          },
          media: {
            emptyHint: {
              image: 'คลิกที่ดาวที่มุมของภาพเพื่อใส่ในรายการโปรดของคุณ',
              video: 'คลิกที่ดาวที่มุมของวิดีโอเพื่อใส่ในรายการโปรดของคุณ',
              audio: 'คลิกที่ดาวตรงมุมของเสียงเพื่อใส่ในรายการโปรดของคุณ'
            },
            addTo: 'เพิ่ม',
            moveTo: 'ย้าย',
            removeFrom: 'ลบออกจากหมวดหมู่',
            copySource: 'คัดลอกแหล่งที่มาของสื่อ',
            upload: {
              title: 'ที่อัพโหลด',
              normal: 'ปกติ',
              spoiler: 'สปอยเลอร์'
            },
            success: {
              move: {
                gif: 'ย้าย GIF แล้ว!',
                image: 'ย้ายภาพแล้ว!',
                video: 'วีดีโอถูกย้าย!',
                audio: 'ย้ายเสียงแล้ว!'
              },
              remove: {
                gif: 'GIF ถูกลบออกจากหมวดหมู่แล้ว!',
                image: 'รูปภาพถูกลบออกจากหมวดหมู่!',
                video: 'วิดีโอถูกลบออกจากหมวดหมู่แล้ว!',
                audio: 'เสียงถูกลบออกจากหมวดหมู่!'
              },
              download: {
                gif: 'อัปโหลด GIF แล้ว!',
                image: 'อัปโหลดรูปภาพแล้ว!',
                video: 'อัปโหลดวิดีโอแล้ว!',
                audio: 'ดาวน์โหลดไฟล์เสียงแล้ว!'
              }
            },
            error: {
              download: {
                gif: 'ดาวน์โหลด GIF ไม่สำเร็จ',
                image: 'ไม่สามารถอัปโหลดภาพ',
                video: 'ไม่สามารถดาวน์โหลดวิดีโอ',
                audio: 'ไม่สามารถดาวน์โหลดเสียง'
              }
            },
            controls: {
              show: 'แสดงคำสั่งซื้อ',
              hide: 'ซ่อนคำสั่งซื้อ'
            },
            placeholder: {
              gif: 'ชื่อ GIF',
              image: 'ชื่อภาพ',
              video: 'ชื่อวิดีโอ',
              audio: 'ชื่อเสียง'
            }
          },
          searchItem: {
            gif: 'ค้นหา GIF หรือหมวดหมู่',
            image: 'ค้นหารูปภาพหรือหมวดหมู่',
            video: 'ค้นหาวิดีโอหรือหมวดหมู่',
            audio: 'ค้นหาไฟล์เสียงหรือหมวดหมู่'
          }
        }
      case 'tr': // Turkish
        return {
          tabName: {
            image: 'Resim',
            video: 'Video',
            audio: 'Ses'
          },
          create: 'Oluşturmak',
          category: {
            list: 'Kategoriler',
            unsorted: 'Sıralanmamış',
            create: 'Kategori oluştur',
            edit: 'Kategoriyi düzenle',
            delete: 'Kategoriyi sil',
            deleteConfirm: 'Bu kategori alt kategorileri içerir. Hepsi silinecek. Kategorileri silmek istediğinizden emin misiniz?',
            download: 'Medyayı indir',
            placeholder: 'Kategori adı',
            move: 'Hareket',
            moveNext: 'Sonra',
            movePrevious: 'Önce',
            color: 'Renk',
            copyColor: 'rengi kopyala',
            error: {
              needName: 'Ad boş olamaz',
              invalidNameLength: 'Ad en fazla 20 karakter içermelidir',
              wrongColor: 'Renk geçersiz',
              nameExists: 'bu isim zaten var',
              invalidCategory: 'Kategori mevcut değil',
              download: 'Medya indirilemedi'
            },
            success: {
              create: 'Kategori oluşturuldu!',
              delete: 'Kategori silindi!',
              edit: 'Kategori değiştirildi!',
              move: 'Kategori taşındı!',
              download: 'Medya yüklendi!'
            },
            emptyHint: 'Kategori oluşturmak için sağ tıklayın!'
          },
          media: {
            emptyHint: {
              image: 'Favorilerinize eklemek için bir resmin köşesindeki yıldıza tıklayın',
              video: 'Favorilerinize eklemek için bir videonun köşesindeki yıldıza tıklayın',
              audio: 'Favorilerinize eklemek için bir sesin köşesindeki yıldıza tıklayın'
            },
            addTo: 'Ekle',
            moveTo: 'Hareket',
            removeFrom: 'Kategoriden kaldır',
            copySource: 'Medya kaynağını kopyala',
            upload: {
              title: 'Yükle',
              normal: 'Normal',
              spoiler: 'Bir şeyin önceden reklamı'
            },
            success: {
              move: {
                gif: 'GIF taşındı!',
                image: 'Resim taşındı!',
                video: 'Video taşındı!',
                audio: 'Ses taşındı!'
              },
              remove: {
                gif: 'GIF kategorilerden kaldırıldı!',
                image: 'Resim kategorilerden kaldırıldı!',
                video: 'Video kategorilerden kaldırıldı!',
                audio: 'Ses kategorilerden kaldırıldı!'
              },
              download: {
                gif: 'GIF yüklendi!',
                image: 'Resim yüklendi!',
                video: 'Video yüklendi!',
                audio: 'Ses indirildi!'
              }
            },
            error: {
              download: {
                gif: 'GIF indirilemedi',
                image: 'Resim yüklenemedi',
                video: 'Video indirilemedi',
                audio: 'Ses indirilemedi'
              }
            },
            controls: {
              show: 'Siparişleri göster',
              hide: 'Siparişleri gizle'
            },
            placeholder: {
              gif: 'GIF Adı',
              image: 'Resim adı',
              video: 'video adı',
              audio: 'Ses adı'
            }
          },
          searchItem: {
            gif: 'GIF\'leri veya kategorileri arayın',
            image: 'Resim veya kategori arayın',
            video: 'Videoları veya kategorileri arayın',
            audio: 'Sesleri veya kategorileri arayın'
          }
        }
      case 'uk': // Ukrainian
        return {
          tabName: {
            image: 'Картина',
            video: 'Відео',
            audio: 'Аудіо'
          },
          create: 'Створити',
          category: {
            list: 'Категорії',
            unsorted: 'Не сортується',
            create: 'Створіть категорію',
            edit: 'Редагувати категорію',
            delete: 'Видалити категорію',
            deleteConfirm: 'Ця категорія містить підкатегорії. Усі вони будуть видалені. Ви впевнені, що хочете видалити категорії?',
            download: 'Завантажити медіафайли',
            placeholder: 'Назва категорії',
            move: 'Рухайся',
            moveNext: 'Після',
            movePrevious: 'Раніше',
            color: 'Колір',
            copyColor: 'Копіювати кольорові',
            error: {
              needName: 'Ім\'я не може бути порожнім',
              invalidNameLength: 'Назва повинна містити максимум 20 символів',
              wrongColor: 'Колір недійсний',
              nameExists: 'ця назва вже існує',
              invalidCategory: 'Категорія не існує',
              download: 'Не вдалося завантажити медіафайл'
            },
            success: {
              create: 'Категорію створено!',
              delete: 'Категорію видалено!',
              edit: 'Категорію змінено!',
              move: 'Категорію переміщено!',
              download: 'ЗМІ завантажено!'
            },
            emptyHint: 'Клацніть правою кнопкою миші, щоб створити категорію!'
          },
          media: {
            emptyHint: {
              image: 'Клацніть на зірочку в кутку зображення, щоб помістити його у вибране',
              video: 'Клацніть на зірочку в кутку відео, щоб поставити його у вибране',
              audio: 'Клацніть на зірочку в кутку звукового супроводу, щоб помістити його у вибране'
            },
            addTo: 'Додати',
            moveTo: 'Рухайся',
            removeFrom: 'Вилучити з категорії',
            copySource: 'Копіювати медіа-джерело',
            upload: {
              title: 'Завантажити',
              normal: 'Звичайний',
              spoiler: 'Спойлер'
            },
            success: {
              move: {
                gif: 'GIF переміщено!',
                image: 'Зображення переміщено!',
                video: 'Відео переміщено!',
                audio: 'Аудіо переміщено!'
              },
              remove: {
                gif: 'GIF видалено з категорій!',
                image: 'Зображення видалено з категорій!',
                video: 'Відео видалено з категорій!',
                audio: 'Аудіо вилучено з категорій!'
              },
              download: {
                gif: 'GIF завантажено!',
                image: 'Зображення завантажено!',
                video: 'Відео завантажено!',
                audio: 'Аудіо завантажено!'
              }
            },
            error: {
              download: {
                gif: 'Не вдалося завантажити GIF',
                image: 'Не вдалося завантажити зображення',
                video: 'Не вдалося завантажити відео',
                audio: 'Не вдалося завантажити аудіо'
              }
            },
            controls: {
              show: 'Показати замовлення',
              hide: 'Сховати замовлення'
            },
            placeholder: {
              gif: 'Назва GIF',
              image: 'Назва зображення',
              video: 'Назва відео',
              audio: 'Назва аудіо'
            }
          },
          searchItem: {
            gif: 'Шукайте GIF-файли або категорії',
            image: 'Шукайте зображення або категорії',
            video: 'Шукайте відео або категорії',
            audio: 'Шукайте аудіо чи категорії'
          }
        }
      case 'vi': // Vietnamese
        return {
          tabName: {
            image: 'Hình ảnh',
            video: 'Video',
            audio: 'Âm thanh'
          },
          create: 'Tạo nên',
          category: {
            list: 'Thể loại',
            unsorted: 'Không được sắp xếp',
            create: 'Tạo một danh mục',
            edit: 'Chỉnh sửa danh mục',
            delete: 'Xóa danh mục',
            deleteConfirm: 'Thể loại này chứa các thể loại con. Tất cả chúng sẽ bị xóa. Bạn có chắc chắn muốn xóa danh mục không?',
            download: 'Завантажити медіафайли',
            placeholder: 'Tên danh mục',
            move: 'Di chuyển',
            moveNext: 'Sau',
            movePrevious: 'Trước',
            color: 'Màu sắc',
            copyColor: 'Sao chép màu',
            error: {
              needName: 'Tên không được để trống',
              invalidNameLength: 'Tên phải chứa tối đa 20 ký tự',
              wrongColor: 'Màu không hợp lệ',
              nameExists: 'tên này đã tồn tại',
              invalidCategory: 'Danh mục không tồn tại',
              download: 'Не вдалося завантажити медіафайл'
            },
            success: {
              create: 'Chuyên mục đã được tạo!',
              delete: 'Danh mục đã bị xóa!',
              edit: 'Danh mục đã được thay đổi!',
              move: 'Danh mục đã được di chuyển!',
              download: 'ЗМІ завантажено!'
            },
            emptyHint: 'Nhấp chuột phải để tạo một danh mục!'
          },
          media: {
            emptyHint: {
              image: 'Nhấp vào ngôi sao ở góc của hình ảnh để đưa nó vào mục yêu thích của bạn',
              video: 'Nhấp vào ngôi sao ở góc video để đưa video đó vào mục yêu thích của bạn',
              audio: 'Nhấp vào ngôi sao ở góc của âm thanh để đưa nó vào mục yêu thích của bạn'
            },
            addTo: 'Thêm vào',
            moveTo: 'Di chuyển',
            removeFrom: 'Xóa khỏi danh mục',
            copySource: 'Sao chép nguồn phương tiện',
            upload: {
              title: 'Tải lên',
              normal: 'Bình thường',
              spoiler: 'Spoiler'
            },
            success: {
              move: {
                gif: 'GIF đã được di chuyển!',
                image: 'Hình ảnh đã được di chuyển!',
                video: 'Video đã được chuyển đi!',
                audio: 'Âm thanh đã được di chuyển!'
              },
              remove: {
                gif: 'GIF đã bị xóa khỏi danh mục!',
                image: 'Hình ảnh đã bị xóa khỏi danh mục!',
                video: 'Video đã bị xóa khỏi danh mục!',
                audio: 'Âm thanh đã bị xóa khỏi danh mục!'
              },
              download: {
                gif: 'GIF đã được tải lên!',
                image: 'Зображення завантажено!',
                video: 'Відео завантажено!',
                audio: 'Аудіо завантажено!'
              }
            },
            error: {
              download: {
                gif: 'Không thể tải xuống GIF',
                image: 'Не вдалося завантажити зображення',
                video: 'Не вдалося завантажити відео',
                audio: 'Не вдалося завантажити аудіо'
              }
            },
            controls: {
              show: 'Hiển thị đơn đặt hàng',
              hide: 'Ẩn đơn đặt hàng'
            },
            placeholder: {
              gif: 'Tên GIF',
              image: 'Tên Hình ảnh',
              video: 'Tên video',
              audio: 'Tên âm thanh'
            }
          },
          searchItem: {
            gif: 'Tìm kiếm GIF hoặc danh mục',
            image: 'Tìm kiếm hình ảnh hoặc danh mục',
            video: 'Tìm kiếm video hoặc danh mục',
            audio: 'Tìm kiếm âm thanh hoặc danh mục'
          }
        }
      case 'zh-CN': // Chinese (China)
        return {
          tabName: {
            image: '图片',
            video: '视频',
            audio: '声音的'
          },
          create: '创造',
          category: {
            list: '类别',
            unsorted: '未排序',
            create: '创建一个类别',
            edit: '编辑类别',
            delete: '删除类别',
            deleteConfirm: '此类别包含子类别。 它们都将被删除。 您确定要删除类别吗？',
            download: '下载媒体',
            placeholder: '分类名称',
            move: '移动',
            moveNext: '后',
            movePrevious: '前',
            color: '颜色',
            copyColor: '复印颜色',
            error: {
              needName: '名称不能为空',
              invalidNameLength: '名称必须最多包含 20 个字符',
              wrongColor: '颜色无效',
              nameExists: '这个名字已经存在',
              invalidCategory: '该类别不存在',
              download: '无法下载媒体'
            },
            success: {
              create: '该类别已创建！',
              delete: '该分类已被删除！',
              edit: '类别已更改！',
              move: '类别已移动！',
              download: '媒体已上传！'
            },
            emptyHint: '右键创建一个类别！'
          },
          media: {
            emptyHint: {
              image: '单击图像角落的星星将其放入您的收藏夹',
              video: '点击视频角落的星星，将其放入您的收藏夹',
              audio: '单击音频一角的星星将其放入您的收藏夹'
            },
            addTo: '添加',
            moveTo: '移动',
            removeFrom: '从类别中删除',
            copySource: '复制媒体源',
            upload: {
              title: '上传',
              normal: '普通的',
              spoiler: '剧透'
            },
            success: {
              move: {
                gif: 'GIF已被移动！',
                image: '图片已移动！',
                video: '视频已移！',
                audio: '音频已移动！'
              },
              remove: {
                gif: 'GIF 已从类别中删除！',
                image: '该图片已从类别中删除！',
                video: '该视频已从类别中删除！',
                audio: '音频已从类别中删除！'
              },
              download: {
                gif: 'GIF已上传！',
                image: '图片已上传！',
                video: '视频已上传！',
                audio: '音频已下载！'
              }
            },
            error: {
              download: {
                gif: '无法下载 GIF',
                image: '上传图片失败',
                video: '下载视频失败',
                audio: '无法下载音频'
              }
            },
            controls: {
              show: '显示订单',
              hide: '隐藏订单'
            },
            placeholder: {
              gif: '动图名称',
              image: '图片名称',
              video: '视频名称',
              audio: '音频名称'
            }
          },
          searchItem: {
            gif: '搜索 GIF 或类别',
            image: '搜索图像或类别',
            video: '搜索视频或类别',
            audio: '搜索音频或类别'
          }
        }
      case 'zh-TW': // Chinese (Taiwan)
        return {
          tabName: {
            image: '圖片',
            video: '影片',
            audio: '音訊'
          },
          create: '創建',
          category: {
            list: '類別',
            unsorted: '未排序',
            create: '創建一個分類',
            edit: '編輯分類',
            delete: '刪除分類',
            deleteConfirm: '此類別包含子類別。 它們都將被刪除。 您確定要刪除類別嗎？',
            download: '下載媒體',
            placeholder: '分類名稱',
            move: '移動',
            moveNext: '下一個',
            movePrevious: '上一個',
            color: '顏色',
            copyColor: '複製顏色',
            error: {
              needName: '名稱不能為空',
              invalidNameLength: '名稱需少於20個字符',
              wrongColor: '無效的顏色',
              nameExists: '這個名稱已經存在',
              invalidCategory: '該分類不存在',
              download: '無法下載媒體'
            },
            success: {
              create: '該分類已創建！',
              delete: '該分類已刪除！',
              edit: '分類已更改！',
              move: '分類已移動！',
              download: '媒體已上傳！'
            },
            emptyHint: '右鍵創建一個新分類！'
          },
          media: {
            emptyHint: {
              image: '點擊圖像角落的星星將其放入您的收藏夾',
              video: '點擊影片角落的星星將其放入您的收藏夾',
              audio: '單擊音訊角落的星星將其放入您的收藏夾'
            },
            addTo: '添加',
            moveTo: '移動',
            removeFrom: '從分類中刪除',
            copySource: '複製媒體源',
            upload: {
              title: '上傳',
              normal: '正常',
              spoiler: '防雷'
            },
            success: {
              move: {
                gif: 'GIF已被移動！',
                image: '圖片已移動！',
                video: '影片已移動！',
                audio: '音訊已移動！'
              },
              remove: {
                gif: 'GIF 已從類別中刪除！',
                image: '該圖片已從分類中刪除！',
                video: '該影片已從分類中刪除！',
                audio: '該音訊已從分類中刪除！'
              },
              download: {
                gif: 'GIF已上傳！',
                image: '圖片已上傳！',
                video: '視頻已上傳！',
                audio: '音頻已下載！'
              }
            },
            download: {
              gif: '無法下載 GIF',
              image: '上傳圖片失敗',
              video: '下載視頻失敗',
              audio: '無法下載音頻'
            },
            controls: {
              show: '顯示控制選單',
              hide: '隱藏控制選單'
            },
            placeholder: {
              gif: '動圖名稱',
              image: '圖片名稱',
              video: '影片名稱',
              audio: '音訊名稱'
            }
          },
          searchItem: {
            gif: '搜索 GIF 或類別',
            image: '搜索圖片或分類',
            video: '搜索影片或分類',
            audio: '搜索音訊或分類'
          }
        }
      default: // English
        return {
          tabName: {
            image: 'Image',
            video: 'Video',
            audio: 'Audio'
          },
          create: 'Create',
          category: {
            list: 'Categories',
            unsorted: 'Unsorted',
            create: 'Create Category',
            edit: 'Edit Category',
            delete: 'Delete Category',
            deleteConfirm: 'This category contains sub-categories. They will all get deleted. Are you sure you want to delete the categories?',
            download: 'Download Medias',
            placeholder: 'Category Name',
            move: 'Move',
            moveNext: 'Next',
            movePrevious: 'Previous',
            color: 'Color',
            copyColor: 'Copy Color',
            error: {
              needName: 'Name cannot be empty',
              invalidNameLength: 'Name must contain less than 20 characters',
              wrongColor: 'Invalid color',
              nameExists: 'Name already exists',
              invalidCategory: 'Category not found',
              download: 'Error while downloading medias!'
            },
            success: {
              create: 'Category created!',
              delete: 'Category deleted!',
              edit: 'Category edited!',
              move: 'Category moved!',
              download: 'Medias downloaded!'
            },
            emptyHint: 'Right-click to create a category!'
          },
          media: {
            emptyHint: {
              image: 'Click on the star in the corner of an image to bookmark it',
              video: 'Click on the star in the corner of a video to bookmark it',
              audio: 'Click on the star in the corner of an audio to bookmark it'
            },
            addTo: 'Add',
            moveTo: 'Move',
            removeFrom: 'Remove From Category',
            copySource: 'Copy Source Link',
            upload: {
              title: 'Upload',
              normal: 'Normal',
              spoiler: 'Spoiler'
            },
            success: {
              move: {
                gif: 'GIF moved!',
                image: 'Image moved!',
                video: 'Video moved!',
                audio: 'Audio moved!'
              },
              remove: {
                gif: 'GIF removed from categories!',
                image: 'Image removed from categories!',
                video: 'Video removed from categories!',
                audio: 'Audio removed from categories!'
              },
              download: {
                gif: 'GIF downloaded!',
                image: 'Image downloaded!',
                video: 'Video downloaded!',
                audio: 'Audio downloaded!'
              }
            },
            error: {
              download: {
                gif: 'Failed to download GIF',
                image: 'Failed to download image',
                video: 'Failed to download video',
                audio: 'Failed to download audio'
              }
            },
            controls: {
              show: 'Show Controls',
              hide: 'Hide Controls'
            },
            placeholder: {
              gif: 'GIF Name',
              image: 'Image Name',
              video: 'Video Name',
              audio: 'Audio Name'
            }
          },
          searchItem: {
            gif: 'Search for GIFs or Categories',
            image: 'Search for Images or Categories',
            video: 'Search for Videos or Categories',
            audio: 'Search for Audios or Categories'
          }
        }
    }
  }
}
