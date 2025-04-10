/**
 * @name FavoriteMedia
 * @description Allows to favorite GIFs, images, videos, audios and files.
 * @version 1.12.11
 * @author Dastan
 * @authorId 310450863845933057
 * @source https://github.com/Dastan21/BDAddons/blob/main/plugins/FavoriteMedia
 * @donate https://ko-fi.com/dastan
 */

/* global BdApi */

const { mkdir, lstat, readFileSync, writeFileSync } = require('fs')
const path = require('path')

const DEFAULT_BACKGROUND_COLOR = '#202225'
const INTL_CODE_HASH = {
  GIF_TOOLTIP_ADD_TO_FAVORITES: '4wcdEx',
  GIF_TOOLTIP_REMOVE_FROM_FAVORITES: '4VpUw8',
  NO_GIF_FAVORITES_HOW_TO_FAVORITE: '3gyw4e',
  EDIT: 'bt75u7',
  GIF: 'I5gL2N',
  DOWNLOAD: '1WjMbG',
  USER_POPOUT_MESSAGE: 'GuUH7+',
  COPY_MEDIA_LINK: '92CPQ0',
  COPY_MESSAGE_LINK: 'Xrt5Pj',
}
const ALL_TYPES = ['image', 'video', 'audio', 'file']

const StarSVG = (props) => BdApi.React.createElement('svg', { className: classes.gif.icon, 'aria-hidden': 'false', viewBox: '0 0 24 24', width: '20', height: '20' }, props.filled ? BdApi.React.createElement('path', { fill: 'currentColor', d: 'M10.81 2.86c.38-1.15 2-1.15 2.38 0l1.89 5.83h6.12c1.2 0 1.71 1.54.73 2.25l-4.95 3.6 1.9 5.82a1.25 1.25 0 0 1-1.93 1.4L12 18.16l-4.95 3.6c-.98.7-2.3-.25-1.92-1.4l1.89-5.82-4.95-3.6a1.25 1.25 0 0 1 .73-2.25h6.12l1.9-5.83Z' }) : BdApi.React.createElement('path', { fill: 'currentColor', 'fill-rule': 'evenodd', 'clip-rule': 'evenodd', d: 'M2.07 10.94a1.25 1.25 0 0 1 .73-2.25h6.12l1.9-5.83c.37-1.15 2-1.15 2.37 0l1.89 5.83h6.12c1.2 0 1.71 1.54.73 2.25l-4.95 3.6 1.9 5.82a1.25 1.25 0 0 1-1.93 1.4L12 18.16l-4.95 3.6c-.98.7-2.3-.25-1.92-1.4l1.89-5.82-4.95-3.6Zm11.55-.25h5.26l-4.25 3.09 1.62 5-4.25-3.1-4.25 3.1 1.62-5-4.25-3.1h5.26l1.62-5 1.62 5Z' }))
const ImageSVG = () => BdApi.React.createElement('svg', { className: classes.icon.icon, 'aria-hidden': 'false', viewBox: '0 0 384 384', width: '24', height: '24' }, BdApi.React.createElement('path', { fill: 'currentColor', d: 'M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z' }))
const VideoSVG = () => BdApi.React.createElement('svg', { className: classes.icon.icon, 'aria-hidden': 'false', viewBox: '0 0 298 298', width: '24', height: '24' }, BdApi.React.createElement('path', { fill: 'currentColor', d: 'M298,33c0-13.255-10.745-24-24-24H24C10.745,9,0,19.745,0,33v232c0,13.255,10.745,24,24,24h250c13.255,0,24-10.745,24-24V33zM91,39h43v34H91V39z M61,259H30v-34h31V259z M61,73H30V39h31V73z M134,259H91v-34h43V259z M123,176.708v-55.417c0-8.25,5.868-11.302,12.77-6.783l40.237,26.272c6.902,4.519,6.958,11.914,0.056,16.434l-40.321,26.277C128.84,188.011,123,184.958,123,176.708z M207,259h-43v-34h43V259z M207,73h-43V39h43V73z M268,259h-31v-34h31V259z M268,73h-31V39h31V73z' }))
const AudioSVG = () => BdApi.React.createElement('svg', { className: classes.icon.icon, 'aria-hidden': 'false', viewBox: '0 0 115.3 115.3', width: '24', height: '24' }, BdApi.React.createElement('path', { fill: 'currentColor', d: 'M47.9,14.306L26,30.706H6c-3.3,0-6,2.7-6,6v41.8c0,3.301,2.7,6,6,6h20l21.9,16.4c4,3,9.6,0.2,9.6-4.8v-77C57.5,14.106,51.8,11.306,47.9,14.306z' }), BdApi.React.createElement('path', { fill: 'currentColor', d: 'M77.3,24.106c-2.7-2.7-7.2-2.7-9.899,0c-2.7,2.7-2.7,7.2,0,9.9c13,13,13,34.101,0,47.101c-2.7,2.7-2.7,7.2,0,9.899c1.399,1.4,3.199,2,4.899,2s3.601-0.699,4.9-2.1C95.8,72.606,95.8,42.606,77.3,24.106z' }), BdApi.React.createElement('path', { fill: 'currentColor', d: 'M85.1,8.406c-2.699,2.7-2.699,7.2,0,9.9c10.5,10.5,16.301,24.4,16.301,39.3s-5.801,28.8-16.301,39.3c-2.699,2.7-2.699,7.2,0,9.9c1.4,1.399,3.2,2.1,4.9,2.1c1.8,0,3.6-0.7,4.9-2c13.1-13.1,20.399-30.6,20.399-49.2c0-18.6-7.2-36-20.399-49.2C92.3,5.706,87.9,5.706,85.1,8.406z' }))
const FileSVG = () => BdApi.React.createElement('svg', { className: classes.icon.icon, 'aria-hidden': 'false', viewBox: '2 2 20 20', width: '24', height: '24' }, BdApi.React.createElement('path', { fill: 'currentColor', d: 'M16,2l4,4H16ZM14,2H5A1,1,0,0,0,4,3V21a1,1,0,0,0,1,1H19a1,1,0,0,0,1-1V8H14Z' }))
const ImportSVG = () => BdApi.React.createElement('svg', { className: classes.icon.icon, 'aria-hidden': 'false', viewBox: '0 0 24 24', width: '24', height: '24' }, BdApi.React.createElement('path', { fill: 'currentColor', d: 'M6.29289 9.70711L11.2929 14.7071L12 15.4142L12.7071 14.7071L17.7071 9.70711L16.2929 8.29289L13 11.5858V4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H11L11 11.5858L7.70711 8.29289L6.29289 9.70711Z' }))
const DatabaseSVG = () => BdApi.React.createElement('svg', { className: classes.icon.icon, 'aria-hidden': 'false', viewBox: '0 -8 72 72', width: '24', height: '24' }, BdApi.React.createElement('path', { fill: 'currentColor', d: 'M36,4.07c-11.85,0-21.46,3.21-21.46,7.19v5.89c0,4,9.61,7.19,21.46,7.19s21.45-3.21,21.45-7.19V11.26C57.46,7.28,47.85,4.07,36,4.07Z' }), BdApi.React.createElement('path', { fill: 'currentColor', d: 'M36,27.78c-11.32,0-20.64-2.93-21.46-6.66,0,.18,0,9.75,0,9.75,0,4,9.61,7.18,21.46,7.18s21.45-3.21,21.45-7.18c0,0,0-9.57,0-9.75C56.63,24.85,47.32,27.78,36,27.78Z' }), BdApi.React.createElement('path', { fill: 'currentColor', d: 'M57.44,35c-.82,3.72-10.12,6.66-21.43,6.66S15.37,38.72,14.55,35v9.75c0,4,9.61,7.18,21.46,7.18s21.45-3.21,21.45-7.18Z' }))
const CogSVG = () => BdApi.React.createElement('svg', { className: classes.icon.icon, 'aria-hidden': 'false', viewBox: '-15 -15 30 30', width: '24', height: '24' }, BdApi.React.createElement('path', { fill: 'currentColor', d: 'M-1.4420000314712524,-10.906000137329102 C-1.8949999809265137,-10.847000122070312 -2.1470000743865967,-10.375 -2.078000068664551,-9.92300033569336 C-1.899999976158142,-8.756999969482422 -2.265000104904175,-7.7210001945495605 -3.061000108718872,-7.390999794006348 C-3.8570001125335693,-7.060999870300293 -4.8480000495910645,-7.534999847412109 -5.546000003814697,-8.484999656677246 C-5.816999912261963,-8.852999687194824 -6.329999923706055,-9.008999824523926 -6.691999912261963,-8.730999946594238 C-7.458000183105469,-8.142999649047852 -8.142999649047852,-7.458000183105469 -8.730999946594238,-6.691999912261963 C-9.008999824523926,-6.329999923706055 -8.852999687194824,-5.816999912261963 -8.484999656677246,-5.546000003814697 C-7.534999847412109,-4.8480000495910645 -7.060999870300293,-3.8570001125335693 -7.390999794006348,-3.061000108718872 C-7.7210001945495605,-2.265000104904175 -8.756999969482422,-1.899999976158142 -9.92300033569336,-2.078000068664551 C-10.375,-2.1470000743865967 -10.847000122070312,-1.8949999809265137 -10.906000137329102,-1.4420000314712524 C-10.968000411987305,-0.9700000286102295 -11,-0.48899999260902405 -11,0 C-11,0.48899999260902405 -10.968000411987305,0.9700000286102295 -10.906000137329102,1.4420000314712524 C-10.847000122070312,1.8949999809265137 -10.375,2.1470000743865967 -9.92300033569336,2.078000068664551 C-8.756999969482422,1.899999976158142 -7.7210001945495605,2.265000104904175 -7.390999794006348,3.061000108718872 C-7.060999870300293,3.8570001125335693 -7.534999847412109,4.8470001220703125 -8.484999656677246,5.546000003814697 C-8.852999687194824,5.816999912261963 -9.008999824523926,6.328999996185303 -8.730999946594238,6.691999912261963 C-8.142999649047852,7.458000183105469 -7.458000183105469,8.142999649047852 -6.691999912261963,8.730999946594238 C-6.329999923706055,9.008999824523926 -5.816999912261963,8.852999687194824 -5.546000003814697,8.484999656677246 C-4.8480000495910645,7.534999847412109 -3.8570001125335693,7.060999870300293 -3.061000108718872,7.390999794006348 C-2.265000104904175,7.7210001945495605 -1.899999976158142,8.756999969482422 -2.078000068664551,9.92300033569336 C-2.1470000743865967,10.375 -1.8949999809265137,10.847000122070312 -1.4420000314712524,10.906000137329102 C-0.9700000286102295,10.968000411987305 -0.48899999260902405,11 0,11 C0.48899999260902405,11 0.9700000286102295,10.968000411987305 1.4420000314712524,10.906000137329102 C1.8949999809265137,10.847000122070312 2.1470000743865967,10.375 2.078000068664551,9.92300033569336 C1.899999976158142,8.756999969482422 2.2660000324249268,7.7210001945495605 3.062000036239624,7.390999794006348 C3.8580000400543213,7.060999870300293 4.8480000495910645,7.534999847412109 5.546000003814697,8.484999656677246 C5.816999912261963,8.852999687194824 6.328999996185303,9.008999824523926 6.691999912261963,8.730999946594238 C7.458000183105469,8.142999649047852 8.142999649047852,7.458000183105469 8.730999946594238,6.691999912261963 C9.008999824523926,6.328999996185303 8.852999687194824,5.816999912261963 8.484999656677246,5.546000003814697 C7.534999847412109,4.8480000495910645 7.060999870300293,3.8570001125335693 7.390999794006348,3.061000108718872 C7.7210001945495605,2.265000104904175 8.756999969482422,1.899999976158142 9.92300033569336,2.078000068664551 C10.375,2.1470000743865967 10.847000122070312,1.8949999809265137 10.906000137329102,1.4420000314712524 C10.968000411987305,0.9700000286102295 11,0.48899999260902405 11,0 C11,-0.48899999260902405 10.968000411987305,-0.9700000286102295 10.906000137329102,-1.4420000314712524 C10.847000122070312,-1.8949999809265137 10.375,-2.1470000743865967 9.92300033569336,-2.078000068664551 C8.756999969482422,-1.899999976158142 7.7210001945495605,-2.265000104904175 7.390999794006348,-3.061000108718872 C7.060999870300293,-3.8570001125335693 7.534999847412109,-4.8480000495910645 8.484999656677246,-5.546000003814697 C8.852999687194824,-5.816999912261963 9.008999824523926,-6.329999923706055 8.730999946594238,-6.691999912261963 C8.142999649047852,-7.458000183105469 7.458000183105469,-8.142999649047852 6.691999912261963,-8.730999946594238 C6.328999996185303,-9.008999824523926 5.817999839782715,-8.852999687194824 5.546999931335449,-8.484999656677246 C4.848999977111816,-7.534999847412109 3.8580000400543213,-7.060999870300293 3.062000036239624,-7.390999794006348 C2.2660000324249268,-7.7210001945495605 1.9010000228881836,-8.756999969482422 2.0789999961853027,-9.92300033569336 C2.1480000019073486,-10.375 1.8949999809265137,-10.847000122070312 1.4420000314712524,-10.906000137329102 C0.9700000286102295,-10.968000411987305 0.48899999260902405,-11 0,-11 C-0.48899999260902405,-11 -0.9700000286102295,-10.968000411987305 -1.4420000314712524,-10.906000137329102z M4,0 C4,2.2090001106262207 2.2090001106262207,4 0,4 C-2.2090001106262207,4 -4,2.2090001106262207 -4,0 C-4,-2.2090001106262207 -2.2090001106262207,-4 0,-4 C2.2090001106262207,-4 4,-2.2090001106262207 4,0z' }))
const MusicNoteSVG = (props) => BdApi.React.createElement('svg', { className: classes.icon.icon, 'aria-hidden': false, viewBox: '0 0 500 500', width: '16', height: '16', ...props }, BdApi.React.createElement('path', { fill: 'currentColor', d: 'M328.712,264.539c12.928-21.632,21.504-48.992,23.168-76.064c1.056-17.376-2.816-35.616-11.2-52.768c-13.152-26.944-35.744-42.08-57.568-56.704c-16.288-10.912-31.68-21.216-42.56-35.936l-1.952-2.624c-6.432-8.64-13.696-18.432-14.848-26.656c-1.152-8.32-8.704-14.24-16.96-13.76c-8.384,0.576-14.88,7.52-14.88,15.936v285.12c-13.408-8.128-29.92-13.12-48-13.12c-44.096,0-80,28.704-80,64s35.904,64,80,64s80-28.704,80-64V165.467c24.032,9.184,63.36,32.576,74.176,87.2c-2.016,2.976-3.936,6.176-6.176,8.736c-5.856,6.624-5.216,16.736,1.44,22.56c6.592,5.888,16.704,5.184,22.56-1.44c4.288-4.864,8.096-10.56,11.744-16.512C328.04,265.563,328.393,265.083,328.712,264.539z' }))
const MiniFileSVG = (props) => BdApi.React.createElement('svg', { className: classes.icon.icon, 'aria-hidden': false, viewBox: '-32 0 512 512', width: '16', height: '16', ...props }, BdApi.React.createElement('path', { fill: 'currentColor', d: 'M96 448Q81 448 73 440 64 431 64 416L64 96Q64 81 73 73 81 64 96 64L217 64Q240 64 256 80L368 192Q384 208 384 231L384 416Q384 431 376 440 367 448 352 448L96 448ZM336 400L336 240 208 240 208 112 112 112 112 400 336 400Z' }))
const RefreshSVG = () => BdApi.React.createElement('svg', { className: classes.icon.icon, 'aria-hidden': 'false', viewBox: '0 0 24 24', width: '24', height: '24' }, BdApi.React.createElement('path', { fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 12C3 16.9706 7.02944 21 12 21C14.3051 21 16.4077 20.1334 18 18.7083L21 16M21 12C21 7.02944 16.9706 3 12 3C9.69494 3 7.59227 3.86656 6 5.29168L3 8M21 21V16M21 16H16M3 3V8M3 8H8' }))

const classModules = {
  icon: BdApi.Webpack.getByKeys('icon', 'active', 'buttonWrapper'),
  menu: BdApi.Webpack.getByKeys('menu', 'labelContainer', 'colorDefault'),
  result: BdApi.Webpack.getByKeys('result', 'emptyHints', 'emptyHintText'),
  input: BdApi.Webpack.getByKeys('inputDefault', 'inputWrapper', 'inputPrefix'),
  role: BdApi.Webpack.getByKeys('roleCircle', 'dot'),
  gif: BdApi.Webpack.getByKeys('icon', 'gifFavoriteButton', 'selected'),
  gif2: BdApi.Webpack.getByKeys('container', 'gifFavoriteButton', 'embedWrapper'),
  file: BdApi.Webpack.getByKeys('size', 'file', 'fileInner'),
  image: BdApi.Webpack.getByKeys('clickable', 'imageWrapper', 'imageAccessory'),
  control: BdApi.Webpack.getByKeys('container', 'labelRow', 'control'),
  category: BdApi.Webpack.getByKeys('container', 'categoryFade', 'categoryName'),
  textarea: BdApi.Webpack.getByKeys('channelTextArea', 'buttonContainer', 'button'),
  gutter: BdApi.Webpack.getByKeys('header', 'backButton', 'searchHeader'),
  horizontal: BdApi.Webpack.getByKeys('flex', 'flexChild', 'horizontal'),
  flex: BdApi.Webpack.getByKeys('flex', 'alignStart', 'alignEnd'),
  title: BdApi.Webpack.getByKeys('title', 'h1', 'h5'),
  container: BdApi.Webpack.getByKeys('container', 'inner', 'pointer'),
  scroller: BdApi.Webpack.getByKeys('disableScrollAnchor', 'thin', 'fade'),
  look: BdApi.Webpack.getByKeys('button', 'lookBlank', 'colorBrand'),
  audio: BdApi.Webpack.getByKeys('wrapperAudio', 'wrapperPaused', 'wrapperPlaying'),
  contentWrapper: BdApi.Webpack.getByKeys('contentWrapper', 'nav', 'positionLayer'),
  buttons: BdApi.Webpack.getByKeys('profileBioInput', 'buttons', 'attachButton'),
  upload: BdApi.Webpack.getByKeys('actionBarContainer', 'actionBar', 'upload'),
  button: BdApi.Webpack.getByKeys('button', 'separator', 'dangerous'),
  color: BdApi.Webpack.getByKeys('colorStandard', 'colorBrand', 'colorError'),
  visual: BdApi.Webpack.getByKeys('nonVisualMediaItemContainer', 'nonVisualMediaItem', 'visualMediaItemContainer'),
  code: BdApi.Webpack.getByKeys('newMosaicStyle', 'attachmentName', 'codeView'),
}

const classes = {
  icon: {
    icon: classModules.icon.icon,
    active: classModules.icon.active,
    button: classModules.icon.button,
    buttonWrapper: classModules.icon.buttonWrapper,
  },
  menu: {
    item: classModules.menu.item,
    labelContainer: classModules.menu.labelContainer,
    label: classModules.menu.label,
    colorDefault: classModules.menu.colorDefault,
    focused: classModules.menu.focused,
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
    endContainer: classModules.result.endContainer,
  },
  input: {
    inputDefault: classModules.input.inputDefault,
    inputWrapper: classModules.input.inputWrapper,
  },
  roleCircle: classModules.role.roleCircle,
  gif: {
    gifFavoriteButton1: classModules.gif2.gifFavoriteButton,
    size: classModules.file.size,
    gifFavoriteButton2: classModules.gif.gifFavoriteButton,
    selected: classModules.gif.selected,
    showPulse: classModules.gif.showPulse,
    icon: classModules.gif.icon,
  },
  image: {
    imageAccessory: classModules.image.imageAccessory,
    clickable: classModules.image.clickable,
    embedWrapper: classModules.gif2.embedWrapper,
    imageWrapper: classModules.image.imageWrapper,
  },
  control: classModules.control.control,
  category: {
    categoryFade: classModules.category.categoryFade,
    categoryText: classModules.category.categoryText,
    categoryName: classModules.category.categoryName,
    categoryIcon: classModules.category.categoryIcon,
    container: classModules.category.container,
  },
  textarea: {
    channelTextArea: classModules.textarea.channelTextArea,
    buttonContainer: classModules.textarea.buttonContainer,
    button: classModules.textarea.button,
  },
  gutter: {
    header: classModules.gutter.header,
    backButton: classModules.gutter.backButton,
    searchHeader: classModules.gutter.searchHeader,
    searchBar: classModules.gutter.searchBar,
    content: classModules.gutter.content,
    container: classModules.gutter.container,
  },
  flex: {
    flex: classModules.horizontal.flex,
    horizontal: classModules.horizontal.horizontal,
    justifyStart: classModules.flex.justifyStart,
    alignCenter: classModules.flex.alignCenter,
    noWrap: classModules.flex.noWrap,
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
    visible: classModules.container.visible,
  },
  scroller: {
    thin: classModules.scroller.thin,
    fade: classModules.scroller.fade,
    content: classModules.scroller.content,
  },
  look: {
    button: classModules.look.button,
    lookBlank: classModules.look.lookBlank,
    colorBrand: classModules.look.colorBrand,
    grow: classModules.look.grow,
    contents: classModules.look.contents,
  },
  audio: {
    wrapperAudio: classModules.audio.wrapperAudio,
  },
  contentWrapper: {
    contentWrapper: classModules.contentWrapper.contentWrapper,
  },
  buttons: {
    buttons: classModules.buttons.buttons,
    button: classModules.button.button,
  },
  upload: {
    actionBarContainer: classModules.upload.actionBarContainer,
  },
  color: {
    colorStandard: classModules.color.colorStandard,
  },
  visual: {
    nonVisualMediaItemContainer: classModules.visual.nonVisualMediaItemContainer,
  },
  code: {
    newMosaicStyle: classModules.code.newMosaicStyle,
  },
}

const plugin = BdApi.Plugins.get('FavoriteMedia')

const Dispatcher = BdApi.Webpack.getByKeys('dispatch', 'subscribe')
const ElectronModule = BdApi.Webpack.getByKeys('setBadge')
const MessageStore = BdApi.Webpack.getByKeys('getMessage', 'getMessages')
const ChannelStore = BdApi.Webpack.getByKeys('getChannel', 'getDMFromUserId')
const SelectedChannelStore = BdApi.Webpack.getByKeys('getLastSelectedChannelId')
const ComponentDispatch = BdApi.Webpack.getAllByKeys('safeDispatch', 'dispatchToLastSubscribed', { searchExports: true })?.slice(-1)?.[0]
const LocaleStore = BdApi.Webpack.getByKeys('locale', 'initialize')
const EPS = {}
const EPSModules = BdApi.Webpack.getModule(m => Object.keys(m).some(key => m[key]?.toString?.().includes('isSearchSuggestion')))
const EPSConstants = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byKeys('FORUM_CHANNEL_GUIDELINES', 'CREATE_FORUM_POST'), { searchExports: true })
const GIFUtils = (() => {
  const modules = BdApi.Webpack.getModules(m => m.toString?.()?.includes('updateAsync("favoriteGifs'), { searchExports: true })
  return {
    favorite: modules[1],
    unfavorite: modules[0],
  }
})()
const ChannelTextArea = BdApi.Webpack.getModule((m) => m?.type?.render?.toString?.()?.includes?.('CHANNEL_TEXT_AREA'))
const Permissions = BdApi.Webpack.getByKeys('computePermissions')
const PermissionsConstants = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byKeys('ADD_REACTIONS'), { searchExports: true })
const MediaPlayerModule = BdApi.Webpack.getModule(m => m.Types?.VIDEO, { searchExports: true })
const ImageModule = BdApi.Webpack.getAllByStrings('readyState', 'zoomable', 'minHeight', { searchExports: true })?.slice(-1)?.[0]
const FileModule = BdApi.Webpack.getByStrings('fileName', 'fileSize', 'renderAdjacentContent', { defaultExport: false })
const FileRenderedModule = BdApi.Webpack.getByStrings('getObscureReason', 'mediaLayoutType', { defaultExport: false })
const FilesUpload = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byKeys('addFiles'))
const MessagesManager = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byKeys('sendMessage'))
const PageControl = BdApi.Webpack.getModule(m => typeof m === 'function' && m.toString()?.includes('totalCount'), { searchExports: true })
const DiscordIntl = BdApi.Webpack.getMangled('defaultLocale:"en-US"', {
  intl: BdApi.Webpack.Filters.byKeys('format'),
  t: x => x.getOwnPropertyDescriptor
})
const RestAPI = BdApi.Webpack.getModule(m => typeof m === 'object' && m.del && m.put, { searchExports: true })

const canClosePicker = { context: '', value: true }
let currentChannelId = ''
let currentTextareaInput = null
let closeExpressionPickerKey = ''

class FMDB {
  static DB_NAME = 'FavoriteMedia'
  static STORE_NAME = 'FMCache'

  async open () {
    const openRequest = window.indexedDB.open(FMDB.DB_NAME, 4)
    return await new Promise((resolve, reject) => {
      openRequest.onerror = () => { reject(new Error(`Error loading database: ${FMDB.DB_NAME}`)) }
      openRequest.onsuccess = () => { resolve(openRequest.result) }
      openRequest.onupgradeneeded = () => {
        openRequest.result.onerror = () => { reject(new Error(`Error loading database: ${FMDB.DB_NAME}`)) }
        const request = openRequest.result.createObjectStore(FMDB.STORE_NAME)
        request.transaction.oncomplete = () => { resolve(openRequest.result) }
      }
    })
  }

  async get (key) {
    const db = await this.open()
    let data
    return await new Promise((resolve) => {
      const transaction = db.transaction(FMDB.STORE_NAME)
      const objectStore = transaction.objectStore(FMDB.STORE_NAME)
      const request = objectStore.get(key)
      request.onerror = () => { throw new Error(request.error?.message) }
      request.onsuccess = () => { data = request.result }
      transaction.onabort = () => { throw new Error(transaction.error?.message) }
      transaction.oncomplete = () => {
        db.close()
        resolve(data)
      }
    })
  }

  async getAll () {
    const db = await this.open()
    let data
    return await new Promise((resolve) => {
      const transaction = db.transaction(FMDB.STORE_NAME)
      const objectStore = transaction.objectStore(FMDB.STORE_NAME)
      const request = objectStore.getAll()
      request.onerror = () => { throw new Error(request.error?.message) }
      request.onsuccess = () => { data = request.result }
      transaction.onabort = () => { throw new Error(transaction.error?.message) }
      transaction.oncomplete = () => {
        db.close()
        resolve(data)
      }
    })
  }

  async getKeys () {
    const db = await this.open()
    let data
    return await new Promise((resolve) => {
      const transaction = db.transaction(FMDB.STORE_NAME)
      const objectStore = transaction.objectStore(FMDB.STORE_NAME)
      const request = objectStore.getAllKeys()
      request.onerror = () => { throw new Error(request.error?.message) }
      request.onsuccess = () => { data = request.result }
      transaction.onabort = () => { throw new Error(transaction.error?.message) }
      transaction.oncomplete = () => {
        db.close()
        resolve(data)
      }
    })
  }

  async set (key, data) {
    if (data == null) throw new Error('Data is null')
    const db = await this.open()
    const transaction = db.transaction(FMDB.STORE_NAME, 'readwrite')
    const objectStore = transaction.objectStore(FMDB.STORE_NAME)
    objectStore.put(data, key)
    transaction.onabort = () => { throw new Error(transaction.error?.message) }
    transaction.oncomplete = () => { db.close() }
  }

  async delete (key) {
    const db = await this.open()
    const transaction = db.transaction(FMDB.STORE_NAME, 'readwrite')
    const objectStore = transaction.objectStore(FMDB.STORE_NAME)
    objectStore.delete(key)
    transaction.onabort = () => { throw new Error(transaction.error?.message) }
    transaction.oncomplete = () => { db.close() }
  }

  async clear () {
    await new Promise((resolve, reject) => {
      const deleteRequest = window.indexedDB.deleteDatabase(FMDB.DB_NAME)
      deleteRequest.onerror = () => { reject(new Error(`Error deleting database: ${FMDB.DB_NAME}`)) }
      deleteRequest.onsuccess = () => { resolve() }
    })
  }

  async cache (url) {
    const data = await this.get(url)
    if (data != null) return

    const buf = await fetchMedia({ url })
    if (buf == null) return

    await this.set(url, buf)
    const blob = new Blob([buf])
    mediasCache[url] = URL.createObjectURL(blob)
  }

  static sizeOf (bytes) {
    if (bytes === 0) return '0.00 B'
    const e = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, e)).toFixed(2) + ' ' + ' KMGTP'.charAt(e) + 'B'
  }
}

const mediasCache = {}
const fmdb = new FMDB()

class MediaMenuItemInput extends BdApi.React.Component {
  componentDidMount () {
    const media = loadData(this.props.type, { medias: [] }).medias[this.props.id]
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
    const typeData = loadData(this.props.type, { medias: [] })
    if (!typeData.medias.length) return
    if (!typeData.medias[this.props.id]) return
    typeData.medias[this.props.id].name = name
    saveData(this.props.type, typeData)
    this.props.loadMedias()
  }

  render () {
    return BdApi.React.createElement('div', {
      className: `${classes.menu.item} ${classes.menu.labelContainer}`,
      role: 'menuitem',
      id: 'media-input',
      tabindex: '-1',
    },
    BdApi.React.createElement('input', {
      className: classes.input.inputDefault,
      name: 'media-name',
      type: 'text',
      placeholder: plugin.instance.strings.media.placeholder[this.props.type],
      maxlength: '40',
      ref: 'inputName',
    })
    )
  }
}

class CategoryMenuItem extends BdApi.React.Component {
  constructor (props) {
    super(props)

    this.state = {
      focused: false,
    }
  }

  render () {
    return BdApi.React.createElement('div', {
      className: `${classes.menu.item} ${classes.menu.labelContainer} ${classes.menu.colorDefault}${this.state.focused ? ` ${classes.menu.focused}` : ''}`,
      role: 'menuitem',
      id: `${this.props.name}-${this.props.key}`,
      tabindex: '-1',
      onMouseOver: () => this.setState({ focused: true }),
      onMouseOut: () => this.setState({ focused: false }),
    },
    BdApi.React.createElement('div', { className: classes.roleCircle + ' fm-colorDot', style: { 'background-color': this.props.color || DEFAULT_BACKGROUND_COLOR } }),
    BdApi.React.createElement('div', { className: classes.menu.label }, this.props.name)
    )
  }
}

class MediaFavButton extends BdApi.React.Component {
  constructor (props) {
    super(props)

    this.state = {
      favorited: this.isFavorited,
      pulse: false,
    }

    this.updateFavorite = this.updateFavorite.bind(this)
    this.changeFavorite = this.changeFavorite.bind(this)
    this.favButton = this.favButton.bind(this)
  }

  componentDidMount () {
    this.tooltipFav = BdApi.UI.createTooltip(this.refs.tooltipFav, this.isFavorited ? getDiscordIntl('GIF_TOOLTIP_REMOVE_FROM_FAVORITES') : getDiscordIntl('GIF_TOOLTIP_ADD_TO_FAVORITES'), { style: 'primary' })
    Dispatcher.subscribe('FM_FAVORITE_MEDIA', this.updateFavorite)
  }

  componentWillUnmount () {
    Dispatcher.unsubscribe('FM_FAVORITE_MEDIA', this.updateFavorite)
  }

  get isFavorited () {
    if (!this.props.url) return false
    return loadData(this.props.type, { medias: [] }).medias.find(e => MediaFavButton.checkSameUrl(e.url, this.props.url)) !== undefined
  }

  static checkSameUrl (url1, url2) {
    return url1 === url2 || url1.split('?')[0] === url2.split('?')[0]
  }

  static getThumbnail (type, media) {
    switch (type) {
      case 'video': return media.poster
      case 'gif': return media.src
      case 'image': return media.url
      default: return null
    }
  }

  static hasPreview (type) {
    return !['audio', 'file'].includes(type)
  }

  static isPlayable (type) {
    return ['video', 'audio'].includes(type)
  }

  updateFavorite (data) {
    if (this.props.fromPicker) return
    if (!MediaFavButton.checkSameUrl(data.url, this.props.url)) return
    const fav = this.isFavorited
    this.setState({ favorited: fav })
    this.tooltipFav.label = fav ? getDiscordIntl('GIF_TOOLTIP_REMOVE_FROM_FAVORITES') : getDiscordIntl('GIF_TOOLTIP_ADD_TO_FAVORITES')
  }

  async changeFavorite () {
    const switchFavorite = this.state.favorited ? MediaFavButton.unfavoriteMedia : MediaFavButton.favoriteMedia
    switchFavorite(this.props).then((props) => {
      if (!props.fromPicker) this.setState({ favorited: this.isFavorited })
      Dispatcher.dispatch({ type: 'FM_FAVORITE_MEDIA', url: props.url })
      if (props.fromPicker) return
      this.tooltipFav.label = this.state.favorited ? getDiscordIntl('GIF_TOOLTIP_ADD_TO_FAVORITES') : getDiscordIntl('GIF_TOOLTIP_REMOVE_FROM_FAVORITES')
      this.tooltipFav.hide()
      this.tooltipFav.show()
      this.setState({ pulse: true })
      setTimeout(() => {
        this.setState({ pulse: false })
      }, 200)
    }).catch((err) => {
      BdApi.Logger.error(plugin.name, err.message ?? err)
    })
  }

  static async getMediaDataFromProps (props) {
    const dimensions = await getMediaDimensions(props)

    if (!['audio', 'file'].includes(props.type) && (dimensions.width === 0 || dimensions.height === 0)) {
      throw new Error('Could not fetch media dimensions')
    }

    switch (props.type) {
      case 'gif':
        return {
          url: props.url,
          src: props.src,
          width: props.width || dimensions.width,
          height: props.height || dimensions.height,
          name: getUrlName(props.url),
          message: props.message,
          source: props.source,
        }

      case 'video':
        return {
          url: props.url,
          poster: props.poster,
          width: dimensions.width,
          height: dimensions.height,
          name: getUrlName(props.url),
          message: props.message,
          source: props.source,
        }

      case 'audio':
        return {
          url: props.url,
          name: getUrlName(props.url),
          ext: getUrlExt(props.url, 'audio'),
          message: props.message,
          source: props.source,
        }

      case 'file':
        return {
          url: props.url,
          name: getUrlName(props.url),
          message: props.message,
          source: props.source,
        }

      default: // image
        return {
          url: props.url,
          width: dimensions.width,
          height: dimensions.height,
          name: getUrlName(props.url),
          message: props.message,
          source: props.source,
        }
    }
  }

  static async favoriteMedia (props) {
    // get message and source links
    const $target = props.target?.current
    if ($target != null) {
      props.message = findMessageLink($target)
      props.source = findSourceLink($target, props.url)
    }
    const typeData = loadData(props.type, { medias: [] })
    if (typeData.medias.find(m => MediaFavButton.checkSameUrl(m.url, props.url))) return
    const data = await MediaFavButton.getMediaDataFromProps(props)
    if (props.type === 'gif') await MediaFavButton.favoriteGIF(data)
    typeData.medias.push(data)
    saveData(props.type, typeData)
    if (plugin.instance.settings.allowCaching) MediaFavButton.cacheMedia(data.url)
    return props
  }

  static async unfavoriteMedia (props) {
    const typeData = loadData(props.type, { medias: [], categories: [] })
    if (!typeData.medias.length) return
    typeData.medias = typeData.medias.filter(e => !MediaFavButton.checkSameUrl(e.url, props.url))
    if (props.type === 'gif') await MediaFavButton.unfavoriteGIF(props)
    typeData.categories.forEach((c) => {
      if (c.thumbnail === MediaFavButton.getThumbnail(props.type, props)) {
        c.thumbnail = undefined
      }
    })
    saveData(props.type, typeData)
    if (props.fromPicker) Dispatcher.dispatch({ type: 'FM_UPDATE_MEDIAS' })
    if (plugin.instance.settings.allowCaching) MediaFavButton.uncacheMedia(props.url)
    return props
  }

  static async favoriteGIF (props) {
    GIFUtils.favorite({
      format: 2,
      url: props.url,
      src: props.src,
      order: props.order,
      width: props.width,
      height: props.height,
    })
  }

  static async unfavoriteGIF (props) {
    GIFUtils.unfavorite(props.url)
  }

  static async cacheMedia (url) {
    await fmdb.cache(url).then(() => {
      BdApi.Logger.info(plugin.name, 'Successfully cached media:', url)
    }).catch((err) => {
      BdApi.Logger.warn(plugin.name, `Failed to cache media (${err.message ?? err}):`, url)
    })
  }

  static async uncacheMedia (url) {
    await fmdb.delete(url).then(() => {
      BdApi.Logger.info(plugin.name, 'Successfully uncached media:', url)
    }).catch((err) => {
      BdApi.Logger.warn(plugin.name, `Failed to uncache media (${err.message ?? err}):`, url)
    })
  }

  favButton () {
    return BdApi.React.createElement('div', {
      className: `${this.props.fromPicker ? classes.result.favButton : classes.gif.gifFavoriteButton1} ${classes.gif.gifFavoriteButton2}${this.state.favorited ? ` ${classes.gif.selected}` : ''}${this.state.pulse ? ` ${classes.gif.showPulse}` : ''}`,
      tabindex: '-1',
      role: 'button',
      ref: 'tooltipFav',
      onClick: this.changeFavorite,
    },
    BdApi.React.createElement(StarSVG, {
      filled: this.state.favorited,
    })
    )
  }

  render () {
    return this.props.fromPicker
      ? this.favButton()
      : BdApi.React.createElement('div', {
        className: `${classes.image.imageAccessory} ${classes.image.clickable} fm-favBtn fm-${this.props.type}${this.props.uploaded ? ' fm-uploaded' : ''}`,
      }, this.favButton())
  }
}

class ColorPicker extends BdApi.React.Component {
  componentDidMount () {
    this.refs.inputColor.value = this.props.color || DEFAULT_BACKGROUND_COLOR
    this.props.setRef(this.refs.inputColor)
    this.refs.inputColor.parentNode.style['background-color'] = this.refs.inputColor.value
  }

  render () {
    return BdApi.React.createElement('div', {
      className: 'category-input-color',
      style: { width: '48px', height: '48px', 'margin-top': '8px', 'border-radius': '100%' },
    },
    BdApi.React.createElement('input', {
      type: 'color',
      id: 'category-input-color',
      name: 'category-input-color',
      ref: 'inputColor',
      onChange: e => { e.target.parentNode.style['background-color'] = e.target.value },
    })
    )
  }
}

class EmptyFavorites extends BdApi.React.Component {
  render () {
    return BdApi.React.createElement('div', {
      className: classes.result.emptyHints,
    },
    BdApi.React.createElement('div', {
      className: classes.result.emptyHint,
    },
    BdApi.React.createElement('div', {
      className: classes.result.emptyHintCard,
    },
    BdApi.React.createElement('svg', {
      className: classes.result.emptyHintFavorite,
      'aria-hidden': 'false',
      viewBox: '0 0 24 24',
      width: '16',
      height: '16',
    },
    BdApi.React.createElement('path', {
      d: 'M0,0H24V24H0Z',
      fill: 'none',
    }),
    BdApi.React.createElement('path', {
      fill: 'currentColor',
      d: 'M12.5,17.6l3.6,2.2a1,1,0,0,0,1.5-1.1l-1-4.1a1,1,0,0,1,.3-1l3.2-2.8A1,1,0,0,0,19.5,9l-4.2-.4a.87.87,0,0,1-.8-.6L12.9,4.1a1.05,1.05,0,0,0-1.9,0l-1.6,4a1,1,0,0,1-.8.6L4.4,9a1.06,1.06,0,0,0-.6,1.8L7,13.6a.91.91,0,0,1,.3,1l-1,4.1a1,1,0,0,0,1.5,1.1l3.6-2.2A1.08,1.08,0,0,1,12.5,17.6Z',
    })
    ),
    BdApi.React.createElement('div', {
      className: classes.result.emptyHintText,
    }, this.props.type === 'gif' ? getDiscordIntl('NO_GIF_FAVORITES_HOW_TO_FAVORITE') : plugin.instance.strings.media.emptyHint[this.props.type])
    )
    ),
    BdApi.React.createElement('div', {
      className: classes.result.emptyHint,
    },
    BdApi.React.createElement('div', {
      className: classes.result.emptyHintCard,
    },
    BdApi.React.createElement('div', {
      className: classes.result.emptyHintText,
    }, plugin.instance.strings.category.emptyHint)
    )
    )
    )
  }
}

class CategoryModal extends BdApi.React.Component {
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
      color: this.inputColor && this.inputColor.value,
    }
  }

  render () {
    return BdApi.React.createElement('div', {
      className: classes.control,
      style: { display: 'grid', 'grid-template-columns': 'auto 70px', 'margin-right': '-16px' },
    },
    BdApi.React.createElement('div', {
      className: classes.input.inputWrapper,
      style: { padding: '1em 0', 'margin-right': '16px' },
    },
    BdApi.React.createElement('input', {
      className: classes.input.inputDefault,
      name: 'category-name',
      type: 'text',
      placeholder: plugin.instance.strings.category.placeholder,
      maxlength: '20',
      ref: 'inputName',
    })
    ),
    BdApi.React.createElement(ColorPicker, {
      color: this.props.color,
      setRef: this.setRef,
    })
    )
  }
}

class ImportPanel extends BdApi.React.Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: true,
      imported: false,
    }

    this.initImport = this.initImport.bind(this)
    this.importMedias = this.importMedias.bind(this)

    this.data = {}
  }

  componentDidMount () {
    this.initImport()
  }

  async initImport () {
    for (const path of this.props.paths) {
      try {
        const conf = JSON.parse(readFileSync(path, { encoding: 'utf-8' }))
        if (conf == null) continue

        for (const mediaType of ALL_TYPES) {
          this.data[mediaType] = { medias: [], categories: [] }
          const typeData = conf[mediaType]
          if (typeData == null) continue

          const currentTypeData = loadData(mediaType, { medias: [], categories: [] })

          if (typeData.categories != null && Array.isArray(typeData.categories) && typeData.categories.length > 0) {
            typeData.categories.forEach((category) => {
              if (this.data[mediaType].categories.findIndex((c) => c.name === category.name) >= 0) return

              const currentCategory = currentTypeData.categories.find((c) => c.name === category.name)
              if (currentCategory != null) {
                typeData.medias.forEach((media) => {
                  if (media.category_id === category.id) media.category_id = 'import_' + currentCategory.id
                })
                return
              }

              this.data[mediaType].categories.push(category)
            })
          }

          if (typeData.medias != null && Array.isArray(typeData.medias) && typeData.medias.length > 0) {
            typeData.medias.forEach((media) => {
              if (this.data[mediaType].medias.findIndex((m) => MediaFavButton.checkSameUrl(m.url, media.url)) >= 0) return
              if (currentTypeData.medias.findIndex((m) => MediaFavButton.checkSameUrl(m.url, media.url)) >= 0) return

              this.data[mediaType].medias.push(media)
            })
          }
        }
      } catch (err) {
        BdApi.Logger.error(plugin.name, `Failed to load config (${err.message ?? err}):`, path)
      }
    }

    this.setState({ loading: false })
  }

  importMedias () {
    for (const mediaType of ALL_TYPES) {
      const importTypeData = structuredClone(this.importData[mediaType])
      if (importTypeData == null) continue

      const currentTypeData = loadData(mediaType, { medias: [], categories: [] })

      importTypeData.categories.forEach((category) => {
        const importCatId = category.id
        category.id = getNewCategoryId(currentTypeData.categories)
        importTypeData.medias.forEach((media) => {
          if (media.category_id === importCatId) media.category_id = category.id
        })

        currentTypeData.categories.push(category)
      })

      importTypeData.medias.forEach((media) => {
        if (/import_\d*/.test(media.category_id)) {
          const oldCatId = Number(media.category_id.replace('import_', ''))
          if (isNaN(oldCatId)) return

          media.category_id = oldCatId
        }

        if (importTypeData.categories.findIndex((c) => c.id === media.category_id) < 0 && currentTypeData.categories.findIndex((c) => c.id === media.category_id) < 0) {
          delete media.category_id
        }
      })

      currentTypeData.medias = currentTypeData.medias.concat(importTypeData.medias)

      saveData(mediaType, currentTypeData)
    }

    this.setState({ imported: true })
    Dispatcher.dispatch({ type: 'FM_UPDATE_MEDIAS' })
    Dispatcher.dispatch({ type: 'FM_UPDATE_CATEGORIES' })
    BdApi.UI.showToast(plugin.instance.strings.import.success, { type: 'success' })
    MediaPicker.fetchMediasIntoDB()
  }

  get importData () {
    const data = structuredClone(this.data)

    for (const mediaType of Object.keys(this.data)) {
      const checkboxMedias = this.refs[`checkboxImport-medias-${mediaType}`]
      if (checkboxMedias != null && !checkboxMedias.checked) {
        data[mediaType].medias = []
      }

      const checkboxCategories = this.refs[`checkboxImport-categories-${mediaType}`]
      if (checkboxCategories != null && !checkboxCategories.checked) {
        data[mediaType].categories = []
      }
    }

    return data
  }

  get isEmpty () {
    return Object.keys(this.data).reduce((t, k) => {
      t += this.data[k].medias?.length ?? 0
      t += this.data[k].categories?.length ?? 0
      return t
    }, 0) <= 0
  }

  get getMediasCountLines () {
    const $types = []
    const $medias = []
    const $categories = []

    $types.push(BdApi.React.createElement('span', {
      className: 'fm-importLabel',
    }, plugin.instance.strings.import.label.types))
    $medias.push(BdApi.React.createElement('span', {
      className: 'fm-importLabel',
    }, plugin.instance.strings.import.label.medias))
    $categories.push(BdApi.React.createElement('span', {
      className: 'fm-importLabel',
    }, plugin.instance.strings.import.label.categories))

    for (const mediaType of Object.keys(this.data)) {
      $types.push(BdApi.React.createElement('span', {
        className: 'fm-importValue',
      },
      plugin.instance.strings.tabName[mediaType]
      ))

      const mediasCount = Object.keys(this.data[mediaType].medias).length
      $medias.push(BdApi.React.createElement('span', {
        className: 'fm-importValue',
      },
      !this.isEmpty && !this.state.imported
        ? BdApi.React.createElement('input', {
          type: 'checkbox',
          defaultChecked: true,
          ref: `checkboxImport-medias-${mediaType}`,
          style: { visibility: mediasCount > 0 ? 'visible' : 'hidden' },
        })
        : null,
      mediasCount
      ))

      const categoriesCount = Object.keys(this.data[mediaType].categories).length
      $categories.push(BdApi.React.createElement('span', {
        className: 'fm-importValue',
      },
      !this.isEmpty && !this.state.imported
        ? BdApi.React.createElement('input', {
          type: 'checkbox',
          defaultChecked: true,
          ref: `checkboxImport-categories-${mediaType}`,
          style: { visibility: categoriesCount > 0 ? 'visible' : 'hidden' },
        })
        : null,
      categoriesCount
      ))
    }

    return [
      BdApi.React.createElement('div', {
        className: `${classes.color.colorStandard} fm-importLines`,
      }, ...$types),
      BdApi.React.createElement('div', {
        className: `${classes.color.colorStandard} fm-importLines`,
      }, ...$medias),
      BdApi.React.createElement('div', {
        className: `${classes.color.colorStandard} fm-importLines`,
      }, ...$categories),
    ]
  }

  render () {
    return !this.state.loading
      ? BdApi.React.createElement('div', {
        className: 'fm-importPanel',
      },
      BdApi.React.createElement('div', {
        className: 'fm-importRecap',
      },
      ...this.getMediasCountLines
      ),
      BdApi.React.createElement('div', {
        className: 'fm-importActions',
      },
      !this.isEmpty && !this.state.imported
        ? BdApi.React.createElement(BdApi.Components.Button, {
          className: 'fm-importMediasButton',
          onClick: this.importMedias,
        }, plugin.instance.strings.import.buttonImport)
        : null
      )
      )
      : BdApi.React.createElement(BdApi.Components.Spinner)
  }
}

class DatabasePanel extends BdApi.React.Component {
  constructor (props) {
    super(props)

    this.state = {
      count: 0,
      size: null,
      loadingStats: true,
      loadingCache: false,
      fetchMediasProgress: '',
    }

    this.loadStats = this.loadStats.bind(this)
    this.getSettingsPanel = this.getSettingsPanel.bind(this)
    this.saveSettings = this.saveSettings.bind(this)
    this.openModalClearDatabase = this.openModalClearDatabase.bind(this)
    this.clearDatabase = this.clearDatabase.bind(this)
    this.openCacheMediasConfirm = this.openCacheMediasConfirm.bind(this)
    this.updateFetchMediasProgress = this.updateFetchMediasProgress.bind(this)
  }

  componentDidMount () {
    this.loadStats()
    Dispatcher.subscribe('FM_FETCH_INTO_DB', this.updateFetchMediasProgress)
  }

  componentDidUpdate () {
    if (this.refs.refreshButton != null) {
      this.tooltipRefresh = BdApi.UI.createTooltip(this.refs.refreshButton, plugin.instance.strings.cache.refreshButton, { style: 'primary' })
    }
  }

  componentWillUnmount () {
    if (!plugin.instance.settings.allowCaching) {
      for (const key of Object.getOwnPropertyNames(mediasCache)) {
        delete mediasCache[key]
      }
    }

    Dispatcher.unsubscribe('FM_FETCH_INTO_DB', this.updateFetchMediasProgress)
  }

  async loadStats () {
    try {
      this.setState({ loadingStats: true })
      const values = await fmdb.getAll()
      const totalSize = values.reduce((t, v) => { t += v.byteLength; return t }, 0)
      this.setState({
        count: values.length,
        size: FMDB.sizeOf(totalSize),
        loadingStats: false,
      })
    } catch (err) {
      BdApi.Logger.error(plugin.name, err.message ?? err)
    }
  }

  getSettingsPanel () {
    return plugin.instance.getSettingsPanel(plugin.instance.defaultSettings.find((s) => s.id === 'allowCaching'))
  }

  saveSettings () {
    saveData('settings', plugin.instance.settings)
  }

  openModalClearDatabase () {
    BdApi.UI.showConfirmationModal(plugin.instance.strings.cache.clear.button, plugin.instance.strings.cache.clear.confirm, {
      danger: true,
      onConfirm: this.clearDatabase,
    })
  }

  updateFetchMediasProgress (data) {
    this.setState({ fetchMediasProgress: `${data.done}/${data.total}` })
  }

  async clearDatabase () {
    await fmdb.clear().then(() => {
      BdApi.UI.showToast(plugin.instance.strings.cache.clear.success, { type: 'success' })
      this.loadStats()
    }).catch((err) => {
      BdApi.Logger.error(plugin.name, err)
      BdApi.UI.showToast(plugin.instance.strings.cache.clear.error, { type: 'error' })
    })
  }

  async openCacheMediasConfirm () {
    BdApi.UI.showConfirmationModal(plugin.instance.strings.cache.cacheAll.button, plugin.instance.strings.cache.cacheAll.confirm, {
      onConfirm: () => {
        this.setState({ loadingCache: true })
        MediaPicker.fetchMediasIntoDB().then((count) => {
          if (count > 0) {
            this.loadStats()
            BdApi.UI.showToast(plugin.instance.strings.cache.cacheAll.success, { type: 'success' })
          } else {
            BdApi.UI.showToast(plugin.instance.strings.cache.cacheAll.noMedia, { type: 'info' })
          }
          this.setState({ loadingCache: false })
        })
      },
    })
  }

  render () {
    return BdApi.React.createElement('div', {
      className: 'fm-databasePanel',
    },
    BdApi.React.createElement('div', {
      className: 'fm-settings',
    },
    this.getSettingsPanel()
    ),
    !this.state.loadingStats && !this.state.loadingCache
      ? BdApi.React.createElement('div', {
        className: 'fm-database',
      },
      BdApi.React.createElement('div', {
        className: 'fm-stats',
      },
      BdApi.React.createElement('div', {
        className: 'fm-statsLines ' + classes.color.colorStandard,
      },
      BdApi.React.createElement('div', {
        className: 'fm-statsLine',
      },
      BdApi.React.createElement('span', {}, plugin.instance.strings.cache.total),
      BdApi.React.createElement('span', {
        className: 'fm-statsCount',
      }, this.state.count)
      ),
      BdApi.React.createElement('div', {
        className: 'fm-statsLine',
      },
      BdApi.React.createElement('span', {}, plugin.instance.strings.cache.size),
      BdApi.React.createElement('span', {
        className: 'fm-statsCount',
      }, this.state.size)
      )
      ),
      BdApi.React.createElement('div', {
        ref: 'refreshButton',
        className: `${classes.buttons.button} fm-refreshStatsButton fm-btn-icon`,
        onClick: this.loadStats,
      }, RefreshSVG())
      ),
      BdApi.React.createElement('div', {
        className: 'fm-databaseActions',
      },
      this.state.count > 0
        ? BdApi.React.createElement(BdApi.Components.Button, {
          color: BdApi.Components.Button.Colors.RED,
          className: 'fm-clearDatabaseButton',
          onClick: this.openModalClearDatabase,
        }, plugin.instance.strings.cache.clear.button)
        : null,
      BdApi.React.createElement(BdApi.Components.Button, {
        className: 'fm-cacheDatabaseButton',
        onClick: this.openCacheMediasConfirm,
      }, plugin.instance.strings.cache.cacheAll.button)
      )
      )
      : BdApi.React.createElement('div', {
        className: `${classes.color.colorStandard} fm-databaseFetchMediasProgress`,
      },
      BdApi.React.createElement(BdApi.Components.Spinner),
      BdApi.React.createElement('span', {}, this.state.fetchMediasProgress)
      )
    )
  }
}

class CategoryCard extends BdApi.React.Component {
  constructor (props) {
    super(props)

    this.state = {
      thumbnailError: false,
      src: getMediaFromCache(this.thumbnail),
    }

    this.onContextMenu = this.onContextMenu.bind(this)
    this.onDragStart = this.onDragStart.bind(this)
    this.onDrop = this.onDrop.bind(this)
    this.onError = this.onError.bind(this)

    this.prev_thumbnail = this.thumbnail
  }

  componentDidUpdate () {
    if (this.prev_thumbnail !== this.thumbnail) {
      this.prev_thumbnail = this.thumbnail
      this.setState({ src: getMediaFromCache(this.thumbnail) })
    }
  }

  get nameColor () {
    const rgb = hexToRgb(this.props.color)
    const brightness = Math.round(((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) + (parseInt(rgb[2]) * 114)) / 1000)
    if (brightness > 125) return 'black'
    return 'white'
  }

  get showColor () {
    return plugin.instance.settings.hideThumbnail || (!(this.thumbnail && !this.state.thumbnailError) && !this.state.src?.startsWith('blob:'))
  }

  get isGIF () {
    return this.props.type === 'gif'
  }

  get thumbnail () {
    return this.props.thumbnail ?? this.props.random_thumbnail
  }

  onContextMenu (e) {
    canClosePicker.context = 'contextmenu'
    canClosePicker.value = false
    const moveItems = []
    if (this.props.index > 0) {
      moveItems.push({
        id: 'category-movePrevious',
        label: plugin.instance.strings.category.movePrevious,
        action: () => moveCategory(this.props.type, this.props.id, -1),
      })
    }
    if (this.props.index < this.props.length - 1) {
      moveItems.push({
        id: 'category-moveNext',
        label: plugin.instance.strings.category.moveNext,
        action: () => moveCategory(this.props.type, this.props.id, 1),
      })
    }
    const items = [
      {
        id: 'category-copyColor',
        label: plugin.instance.strings.category.copyColor,
        action: () => ElectronModule.copy(this.props.color || DEFAULT_BACKGROUND_COLOR),
      },
      {
        id: 'category-download',
        label: plugin.instance.strings.category.download,
        action: () => MediaPicker.downloadCategory({ type: this.props.type, name: this.props.name, categoryId: this.props.id }),
      },
      {
        id: 'category-edit',
        label: plugin.instance.strings.category.edit,
        action: () => MediaPicker.openCategoryModal(this.props.type, 'edit', { name: this.props.name, color: this.props.color, id: this.props.id }),
      },
    ]
    if (this.props.category_id != null) {
      items.push({
        id: 'category-removeFrom',
        label: plugin.instance.strings.media.removeFrom,
        danger: true,
        action: () => MediaPicker.removeCategoryCategory(this.props.type, this.props.id),
      })
    }
    if (this.props.thumbnail != null) {
      items.push({
        id: 'category-unsetThumbnail',
        label: plugin.instance.strings.category.unsetThumbnail,
        danger: true,
        action: () => MediaPicker.unsetCategoryThumbnail(this.props.type, this.props.id),
      })
    }
    items.push({
      id: 'category-delete',
      label: plugin.instance.strings.category.delete,
      danger: true,
      action: () => {
        const deleteCategories = () => {
          deleteCategory(this.props.type, this.props.id)
          this.props.setCategory()
        }
        if (MediaPicker.categoryHasSubcategories(this.props.type, this.props.id)) {
          BdApi.UI.showConfirmationModal(plugin.instance.strings.category.delete, plugin.instance.strings.category.deleteConfirm, {
            danger: true,
            onConfirm: () => deleteCategories(),
            confirmText: plugin.instance.strings.category.delete,
          })
        } else {
          deleteCategories()
        }
      },
    })
    if (moveItems.length > 0) {
      items.unshift({
        id: 'category-move',
        label: plugin.instance.strings.category.move,
        type: 'submenu',
        items: moveItems,
      })
    }
    BdApi.ContextMenu.open(e, BdApi.ContextMenu.buildMenu([{
      type: 'group',
      items,
    }]), {
      onClose: () => {
        canClosePicker.context = 'contextmenu'
        canClosePicker.value = true
      },
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
      BdApi.Logger.error(plugin.name, err.message ?? err)
    }
    if (data == null) return
    if (data.type === 'media') {
      MediaPicker.changeMediaCategory(this.props.type, data.url, this.props.id)
    } else if (data.type === 'category') {
      if (data.id !== this.props.id) MediaPicker.changeCategoryCategory(this.props.type, data.id, this.props.id)
    }
    this.refs.category.classList.remove('category-dragover')
  }

  async onError () {
    BdApi.Logger.warn(plugin.name, 'Could not load media:', this.state.src, this.thumbnail)

    if (!plugin.instance.settings.allowCaching) return

    const key = this.thumbnail
    const media = await fmdb.get(key)
    if (media == null) {
      this.setState({ thumbnailError: true })
      return
    }

    const blob = new Blob([media])
    const url = URL.createObjectURL(blob)
    mediasCache[key] = url
    this.setState({ src: url })
  }

  render () {
    return BdApi.React.createElement('div', {
      className: classes.result.result,
      tabindex: '-1',
      role: 'button',
      style: {
        position: 'absolute',
        top: `${this.props.positions.top}px`,
        left: `${this.props.positions.left}px`,
        width: `${this.props.positions.width}px`,
        height: '110px',
      },
      ref: 'category',
      onClick: () => this.props.setCategory({ name: this.props.name, color: this.props.color, id: this.props.id, category_id: this.props.category_id }),
      onContextMenu: this.onContextMenu,
      onDragEnter: e => { e.preventDefault(); this.refs.category.classList.add('category-dragover') },
      onDragLeave: e => { e.preventDefault(); this.refs.category.classList.remove('category-dragover') },
      onDragOver: e => { e.stopPropagation(); e.preventDefault() },
      onDragStart: this.onDragStart,
      onDrop: this.onDrop,
      draggable: true,
    },
    BdApi.React.createElement('div', {
      className: classes.category.categoryFade,
      style: { 'background-color': `${this.showColor ? (this.props.color || DEFAULT_BACKGROUND_COLOR) : ''}` },
    }),
    BdApi.React.createElement('div', { className: classes.category.categoryText },
      BdApi.React.createElement('span', {
        className: classes.category.categoryName,
        style: this.showColor ? { color: this.nameColor, 'text-shadow': 'none' } : {},
      }, this.props.name)
    ),
    !this.showColor
      ? BdApi.React.createElement(this.isGIF && !this.state.src?.split('?')[0].endsWith('.gif') ? 'video' : 'img', {
        className: classes.result.gif,
        preload: 'auto',
        autoplay: this.isGIF ? '' : undefined,
        loop: this.isGIF ? 'true' : undefined,
        muted: this.isGIF ? 'true' : undefined,
        src: this.state.src,
        height: '110px',
        width: '100%',
        onError: this.onError,
      })
      : null
    )
  }
}

class MediaCard extends BdApi.React.Component {
  constructor (props) {
    super(props)

    this.state = {
      showControls: false,
      src: getMediaFromCache(this.src),
      poster: getMediaFromCache(this.props.poster),
    }

    this.changeControls = this.changeControls.bind(this)
    this.hideControls = this.hideControls.bind(this)
    this.sendMedia = this.sendMedia.bind(this)
    this.onDragStart = this.onDragStart.bind(this)
    this.onError = this.onError.bind(this)
  }

  get isGIF () {
    return this.props.type === 'gif'
  }

  get tag () {
    if (this.props.type === 'file') return null
    if (this.state.showControls) return this.props.type === 'audio' ? 'audio' : 'video'
    if (this.isGIF && !this.props.src?.split('?')[0].endsWith('.gif')) return 'video'
    if (this.props.type === 'audio') return null
    return 'img'
  }

  get src () {
    if (this.props.type === 'video' && !this.state?.showControls) return this.state?.poster ?? this.props.poster
    if (this.isGIF) return this.props.src
    return this.props.url
  }

  get titleIcon () {
    if (this.props.type === 'audio') return MusicNoteSVG({ className: classes.category.categoryIcon, style: { overflow: 'visible' } })
    if (this.props.type === 'file') return MiniFileSVG({ className: classes.category.categoryIcon, style: { overflow: 'visible' } })
    return null
  }

  get fileName () {
    const name = this.props.name.replace(/_/gm, ' ')
    if (this.props.type === 'audio') return name
    return name + getUrlExt(this.src, this.props.type)
  }

  componentDidMount () {
    Dispatcher.subscribe('FM_TOGGLE_CONTROLS', this.hideControls)
    Dispatcher.subscribe('FM_SEND_MEDIA', this.sendMedia)
    this.url = this.props.url
    if (MediaFavButton.isPlayable(this.props.type) && this.refs.tooltipControls) this.tooltipControls = BdApi.UI.createTooltip(this.refs.tooltipControls, this.state.showControls ? plugin.instance.strings.media.controls.hide : plugin.instance.strings.media.controls.show, { style: 'primary' })
  }

  componentWillUnmount () {
    Dispatcher.unsubscribe('FM_TOGGLE_CONTROLS', this.hideControls)
    Dispatcher.unsubscribe('FM_SEND_MEDIA', this.sendMedia)
  }

  componentDidUpdate () {
    if (!MediaFavButton.checkSameUrl(this.url, this.props.url)) {
      if (this.state.showControls) this.changeControls(false)
      this.setState({ src: null, poster: null }, () => {
        this.setState({
          src: getMediaFromCache(this.src),
          poster: getMediaFromCache(this.props.poster),
        })
      })
    }
    if (MediaFavButton.isPlayable(this.props.type) && !this.tooltipControls && this.refs.tooltipControls) this.tooltipControls = BdApi.UI.createTooltip(this.refs.tooltipControls, this.state.showControls ? plugin.instance.strings.media.controls.hide : plugin.instance.strings.media.controls.show, { style: 'primary' })
    if (this.state.showControls && this.refs.media) this.refs.media.volume = this.props.settings.mediaVolume / 100 || 0.1
    this.url = this.props.url
  }

  async changeControls (force) {
    this.setState((previousState) => {
      const newControls = force !== undefined ? force : !previousState.showControls

      if (this.tooltipControls) {
        this.tooltipControls.label = newControls ? plugin.instance.strings.media.controls.hide : plugin.instance.strings.media.controls.show
        this.tooltipControls.hide()
        this.tooltipControls.show()
        if (force !== undefined) this.tooltipControls.hide()
      }

      if (newControls) {
        Dispatcher.dispatch({ type: 'FM_TOGGLE_CONTROLS' })

        MediaPicker.refreshUrls([this.props.url]).then(([refreshedUrl]) => {
          this.setState({ src: refreshedUrl.refreshed ?? refreshedUrl.original })
        })
      }

      let src = this.src
      if (this.props.type === 'video' && !newControls) src = this.state?.poster ?? this.props.poster

      return ({ showControls: newControls, src: getMediaFromCache(src) })
    })
  }

  hideControls () {
    if (this.state.showControls) this.changeControls(false)
  }

  onDragStart (e) {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'media', url: this.props.url }))
    e.dataTransfer.effectAllowed = 'move'
  }

  async sendMedia (e) {
    const sendMedia = e.type === 'FM_SEND_MEDIA'
    if (sendMedia) {
      if (e.mediaId !== this.props.id) return
      e = e.e
    }
    if (['path', 'svg'].includes(e.target.tagName)) return

    e.preventDefault()
    this.hideControls()

    if (!sendMedia && (this.props.type === 'audio' || this.props.settings[this.props.type].alwaysUploadFile)) {
      const [refreshedUrl] = await MediaPicker.refreshUrls([this.props.url])
      const media = {
        url: refreshedUrl.refreshed ?? refreshedUrl.original,
        name: this.props.name,
      }

      const buffer = await fetchMedia(media).catch((err) => BdApi.Logger.error(plugin.name, err.message ?? err))
      if (buffer == null) throw new Error('Failed to upload media:', media)

      uploadFile(this.props.type, buffer, media)
      if (this.props.settings[this.props.type].alwaysSendInstantly) sendInTextarea(true)
      if (!e.shiftKey) EPS.closeExpressionPicker()
    } else {
      if (!e.shiftKey) {
        ComponentDispatch.dispatchToLastSubscribed('INSERT_TEXT', { rawText: this.props.url, plainText: this.props.url })
        if (this.props.settings[this.props.type].alwaysSendInstantly) sendInTextarea().catch((err) => BdApi.Logger.error(plugin.name, err.message ?? err))
        EPS.closeExpressionPicker()
      } else {
        MessagesManager.sendMessage(currentChannelId, { content: this.props.url, validNonShortcutEmojis: [] })
      }
    }
  }

  async onError (e) {
    if (e.target.tagName !== 'IMG' || mediasCache[this.src] != null) return

    BdApi.Logger.warn(plugin.name, 'Could not load media:', this.src)

    if (!plugin.instance.settings.allowCaching) return

    const key = this.src
    const media = await fmdb.get(key)
    if (media == null) return

    const blob = new Blob([media])
    const url = URL.createObjectURL(blob)
    mediasCache[key] = url
    this.setState({ src: url })
  }

  render () {
    return BdApi.React.createElement('div', {
      className: classes.result.result,
      tabindex: '-1',
      role: 'button',
      style: {
        position: 'absolute',
        top: `${this.props.positions.top}px`,
        left: `${this.props.positions.left}px`,
        width: `${this.props.positions.width}px`,
        height: `${this.props.positions.height}px`,
        'background-color': DEFAULT_BACKGROUND_COLOR,
      },
      onContextMenu: e => this.props.onMediaContextMenu(e, this.props.id),
      onClick: this.sendMedia,
      onDragStart: this.onDragStart,
      draggable: true,
    },
    MediaFavButton.isPlayable(this.props.type)
      ? BdApi.React.createElement('div', {
        className: `show-controls ${classes.gif.size}${this.state.showControls ? ` ${classes.gif.selected} active` : ''}`,
        tabindex: '-1',
        role: 'button',
        ref: 'tooltipControls',
        onClick: () => this.changeControls(),
      },
      BdApi.React.createElement('svg', {
        className: classes.gif.icon,
        'aria-hidden': 'false',
        viewBox: '0 0 780 780',
        width: '16',
        height: '16',
      },
      BdApi.React.createElement('path', { fill: 'currentColor', d: 'M490.667,405.333h-56.811C424.619,374.592,396.373,352,362.667,352s-61.931,22.592-71.189,53.333H21.333C9.557,405.333,0,414.891,0,426.667S9.557,448,21.333,448h270.144c9.237,30.741,37.483,53.333,71.189,53.333s61.931-22.592,71.189-53.333h56.811c11.797,0,21.333-9.557,21.333-21.333S502.464,405.333,490.667,405.333zM362.667,458.667c-17.643,0-32-14.357-32-32s14.357-32,32-32s32,14.357,32,32S380.309,458.667,362.667,458.667z' }),
      BdApi.React.createElement('path', { fill: 'currentColor', d: 'M490.667,64h-56.811c-9.259-30.741-37.483-53.333-71.189-53.333S300.736,33.259,291.477,64H21.333C9.557,64,0,73.557,0,85.333s9.557,21.333,21.333,21.333h270.144C300.736,137.408,328.96,160,362.667,160s61.931-22.592,71.189-53.333h56.811c11.797,0,21.333-9.557,21.333-21.333S502.464,64,490.667,64z M362.667,117.333c-17.643,0-32-14.357-32-32c0-17.643,14.357-32,32-32s32,14.357,32,32C394.667,102.976,380.309,117.333,362.667,117.333z' }),
      BdApi.React.createElement('path', { fill: 'currentColor', d: 'M490.667,234.667H220.523c-9.259-30.741-37.483-53.333-71.189-53.333s-61.931,22.592-71.189,53.333H21.333C9.557,234.667,0,244.224,0,256c0,11.776,9.557,21.333,21.333,21.333h56.811c9.259,30.741,37.483,53.333,71.189,53.333s61.931-22.592,71.189-53.333h270.144c11.797,0,21.333-9.557,21.333-21.333C512,244.224,502.464,234.667,490.667,234.667zM149.333,288c-17.643,0-32-14.357-32-32s14.357-32,32-32c17.643,0,32,14.357,32,32S166.976,288,149.333,288z' })
      )
      )
      : null,
    BdApi.React.createElement(MediaFavButton, {
      type: this.props.type,
      url: this.props.url,
      poster: this.props.poster,
      fromPicker: true,
    }),
    this.tag != null
      ? BdApi.React.createElement(this.tag, {
        className: classes.result.gif,
        preload: 'auto',
        autoplay: this.isGIF ? '' : undefined,
        loop: this.isGIF ? 'true' : undefined,
        muted: this.isGIF ? 'true' : undefined,
        src: this.state.src,
        poster: this.state.poster,
        width: this.props.positions.width,
        height: this.props.positions.height,
        ref: 'media',
        controls: this.state.showControls,
        style: !MediaFavButton.hasPreview(this.props.type) ? { position: 'absolute', bottom: '0', left: '0', 'z-index': '2' } : null,
        draggable: false,
        onError: this.onError,
      })
      : null,
    !MediaFavButton.hasPreview(this.props.type)
      ? BdApi.React.createElement('div', {
        className: classes.category.categoryFade,
        style: { 'background-color': DEFAULT_BACKGROUND_COLOR },
      })
      : null,
    !MediaFavButton.hasPreview(this.props.type)
      ? BdApi.React.createElement('div', {
        className: classes.category.categoryText,
        style: { top: this.state.showControls ? '-50%' : null },
      },
      this.titleIcon,
      BdApi.React.createElement('span', { className: classes.category.categoryName },
        BdApi.React.createElement('div', {}, this.fileName))
      )
      : null
    )
  }
}

class RenderList extends BdApi.React.Component {
  render () {
    return BdApi.React.createElement('div', {
      children: this.props.items.map((itemProps, i) => BdApi.React.createElement(this.props.component, {
        ...itemProps,
        ...this.props.componentProps,
        index: i,
      })),
      className: `fm-${this.props.component.name.startsWith('Cat') ? 'categories' : 'medias'}List`,
    })
  }
}

class MediaPicker extends BdApi.React.Component {
  static HEIGHT = 400

  constructor (props) {
    super({ ...props, type: props.type.replace('fm-', '') })

    this.state = {
      textFilter: '',
      categories: loadData(this.props.type, { categories: [] }).categories,
      category: null,
      medias: loadData(this.props.type, { medias: [] }).medias,
      contentWidth: null,
      page: 1,
    }

    this.type = this.props.type
    this.contentHeight = MediaPicker.HEIGHT

    this.createButtonsTooltips = this.createButtonsTooltips.bind(this)
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
    this.resetScroll = this.resetScroll.bind(this)
  }

  componentDidMount () {
    this.refs.input?.focus()
    this.setState({ contentWidth: this.refs.content?.clientWidth })
    Dispatcher.subscribe('FM_UPDATE_MEDIAS', this.loadMedias)
    Dispatcher.subscribe('FM_UPDATE_CATEGORIES', this.loadCategories)
    Dispatcher.dispatch({ type: 'FM_PICKER_BUTTON_ACTIVE' })
    this.createButtonsTooltips()
  }

  componentDidUpdate () {
    if (this.type !== this.props.type) {
      this.type = this.props.type
      this.setState({
        category: null,
        page: 1,
      })
      this.loadCategories()
      this.loadMedias()
      Dispatcher.dispatch({ type: 'FM_PICKER_BUTTON_ACTIVE' })
    }
    if (this.state.contentWidth !== this.refs.content?.clientWidth) this.setState({ contentWidth: this.refs.content?.clientWidth })
    this.createButtonsTooltips()
  }

  componentWillUnmount () {
    Dispatcher.unsubscribe('FM_UPDATE_MEDIAS', this.loadMedias)
    Dispatcher.unsubscribe('FM_UPDATE_CATEGORIES', this.loadCategories)
    Dispatcher.dispatch({ type: 'FM_PICKER_BUTTON_ACTIVE' })
  }

  createButtonsTooltips () {
    if (this.databaseButton == null && this.refs.databaseButton != null) this.databaseButton = BdApi.UI.createTooltip(this.refs.databaseButton, plugin.instance.strings.cache.panel, { style: 'primary' })
    if (this.importButton == null && this.refs.importButton != null) this.importButton = BdApi.UI.createTooltip(this.refs.importButton, plugin.instance.strings.import.panel, { style: 'primary' })
    if (this.settingsButton == null && this.refs.settingsButton != null) this.settingsButton = BdApi.UI.createTooltip(this.refs.settingsButton, plugin.instance.strings.settings.panel, { style: 'primary' })
    if (this.mediasCounter == null && this.refs.mediasCounter != null) this.mediasCounter = BdApi.UI.createTooltip(this.refs.mediasCounter, plugin.instance.strings.mediasCounter, { style: 'primary' })
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
    const categoriesLen = this.currentPageCategories.length
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
    if (!filter) return this.mediasInCategory.reverse()
    return this.listWithId(this.state.medias).filter(m => this.filterCondition(m.name.toLowerCase(), filter.toString().toLowerCase())).reverse()
  }

  get currentPageCategories () {
    if (PageControl == null) return this.filteredCategories

    const start = plugin.instance.settings.maxMediasPerPage * (this.state.page - 1)
    return this.filteredCategories.slice(start, start + plugin.instance.settings.maxMediasPerPage)
  }

  get currentPageMedias () {
    if (PageControl == null) return this.filteredMedias

    let offset = this.currentPageCategories.length
    if (offset >= plugin.instance.settings.maxMediasPerPage) return []

    else if (offset > 0) return this.filteredMedias.slice(0, plugin.instance.settings.maxMediasPerPage - offset)

    offset = (plugin.instance.settings.maxMediasPerPage * Math.floor(this.filteredCategories.length / plugin.instance.settings.maxMediasPerPage) + (plugin.instance.settings.maxMediasPerPage - this.filteredCategories.length % plugin.instance.settings.maxMediasPerPage)) % plugin.instance.settings.maxMediasPerPage
    const start = offset + (this.state.page - 1 - Math.ceil(this.filteredCategories.length / plugin.instance.settings.maxMediasPerPage)) * plugin.instance.settings.maxMediasPerPage
    return this.filteredMedias.slice(start, start + plugin.instance.settings.maxMediasPerPage)
  }

  get positionedCategories () {
    const thumbnails = this.randomThumbnails
    const categories = this.currentPageCategories
    const width = this.state.contentWidth || 200
    const n = Math.floor(width / 200)
    const itemWidth = (width - (12 * (n - 1))) / n
    for (let c = 0; c < categories.length; c++) {
      if (MediaFavButton.hasPreview(this.props.type)) categories[c].random_thumbnail = thumbnails[categories[c].id]
      categories[c].positions = {
        left: (itemWidth + 12) * (c % n),
        top: 122 * Math.floor(c / n),
        width: itemWidth,
      }
    }
    return categories
  }

  get positionedMedias () {
    const heights = this.heights
    const width = this.state.contentWidth || 200
    const n = Math.floor(width / 200)
    const offset = this.currentPageCategories.length
    const placed = new Array(n)
    placed.fill(false)
    placed.fill(true, 0, offset % n)
    const itemWidth = (width - (12 * (n - 1))) / n
    const medias = this.currentPageMedias
    for (let m = 0; m < medias.length; m++) {
      const min = {
        height: Math.min(...heights),
        index: heights.indexOf(Math.min(...heights)),
      }
      const max = Math.max(...heights)
      const itemHeight = Math.round(100 * itemWidth * medias[m].height / medias[m].width) / 100
      let placedIndex = placed.indexOf(false)
      if (placedIndex === -1) { placed.fill(false); placedIndex = 0 }
      if (!MediaFavButton.hasPreview(this.props.type)) {
        medias[m].positions = {
          left: (itemWidth + 12) * ((offset + m) % n),
          top: 122 * Math.floor((offset + m) / n),
          width: itemWidth,
          height: 110,
        }
        heights[min.index] = heights[min.index] + 110 + 12
      } else {
        if ((min.height + itemHeight) < (max + 110) || m === medias.length - 1) {
          medias[m].positions = {
            left: (itemWidth + 12) * (min.index % n),
            top: min.height,
            width: itemWidth,
            height: itemHeight,
          }
          heights[min.index] = heights[min.index] + itemHeight + 12
        } else {
          medias[m].positions = {
            left: (itemWidth + 12) * (placedIndex % n),
            top: Math.round(100 * heights[placedIndex]) / 100,
            width: itemWidth,
            height: itemHeight,
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
      if (!plugin.instance.settings.hideUnsortedMedias) return this.listWithId(this.state.medias)
      else return this.listWithId(this.state.medias).filter(m => m.category_id === undefined)
    }
    return this.listWithId(this.state.medias).filter(m => m.category_id === this.state.category.id)
  }

  static categoryHasSubcategories (type, categoryId) {
    return loadData(type, { categories: [] }).categories.some((c) => c.category_id === categoryId)
  }

  static openCategoryModal (type, op, values, categoryId) {
    let modal
    BdApi.UI.showConfirmationModal(op === 'create' ? plugin.instance.strings.category.create : plugin.instance.strings.category.edit,
      BdApi.React.createElement(CategoryModal, {
        ...values,
        modalRef: ref => { modal = ref },
      }),
      {
        confirmText: op === 'create' ? plugin.instance.strings.create : getDiscordIntl('EDIT'),
        onConfirm: () => {
          let res = false
          if (op === 'create') res = createCategory(type, modal.getValues(), categoryId)
          else res = editCategory(type, modal.getValues(), values.id)
          if (res) Dispatcher.dispatch({ type: 'FM_UPDATE_CATEGORIES' })
        },
      }
    )
  }

  static async downloadCategory (props) {
    const { filePaths } = await BdApi.UI.openDialog({ openDirectory: true, openFile: false })
    if (!filePaths?.[0]) return

    const categoryFolder = path.join(filePaths[0], props.name ?? '')
    await MediaPicker.createFolder(categoryFolder)

    const medias = loadData(props.type, { medias: [] }).medias.filter(m => m.category_id === props.categoryId).map(m => {
      if (!MediaFavButton.hasPreview(props.type)) return m
      return { ...m, ext: props.type === 'gif' ? '.gif' : getUrlExt(m.url, props.type) }
    })

    const refreshedUrls = await MediaPicker.refreshUrls(medias.map((m) => m.url))
    medias.forEach((m) => {
      const refreshedMedia = refreshedUrls.find((r) => r.original === m.url && r.refreshed != null)
      if (refreshedMedia != null) m.url = refreshedMedia.refreshed
    })

    const results = await Promise.allSettled(medias.map((media) => new Promise((resolve, reject) => {
      const mediaFileName = `${media.name.replace(/ /g, '_')}${media.ext}`
      const mediaPath = path.join(categoryFolder, mediaFileName)
      lstat(mediaPath, {}, (err) => {
        // checking if the file already exists -> err is not null if that's the case
        if (!err) return resolve()
        fetchMedia(media).then((buffer) => {
          try {
            writeFileSync(mediaPath, buffer)
            resolve()
          } catch (err) {
            reject(err)
          }
        }).catch((err) => reject(err))
      })
    })))

    results.forEach((res) => {
      if (res.status === 'rejected') BdApi.Logger.error(plugin.name, 'Could not download media:', res.reason)
    })

    BdApi.UI.showToast(plugin.instance.strings.category.success.download, { type: 'success' })
  }

  static async createFolder (folder) {
    return await new Promise((resolve, reject) => {
      mkdir(folder, {}, (err) => {
        if (err) {
          if (err.message.startsWith('EEXIST')) resolve()
          else reject(err)
        } else resolve()
      })
    })
  }

  static async downloadMedia (media, type) {
    media = structuredClone(media)

    const ext = type === 'gif' ? '.gif' : getUrlExt(media.url, type)
    media.name = media.name.replace(/ /g, '_')
    const { filePath } = await BdApi.UI.openDialog({ mode: 'save', defaultPath: media.name + ext })
    if (filePath === '') return

    const [refreshedUrl] = await MediaPicker.refreshUrls([media.url])
    media.url = refreshedUrl.refreshed ?? refreshedUrl.original

    const buffer = await fetchMedia(media).catch((err) => {
      BdApi.Logger.error(plugin.name, err.message ?? err)
      BdApi.UI.showToast(plugin.instance.strings.media.error.download[type], { type: 'error' })
    })

    try {
      writeFileSync(filePath, buffer)
      BdApi.UI.showToast(plugin.instance.strings.media.success.download[type], { type: 'success' })
    } catch (err) {
      BdApi.Logger.error(plugin.name, err.message ?? err)
      BdApi.UI.showToast(plugin.instance.strings.media.error.download[type], { type: 'error' })
    }
  }

  onContextMenu (e) {
    canClosePicker.context = 'contextmenu'
    canClosePicker.value = false

    const items = [
      {
        id: 'category-create',
        label: plugin.instance.strings.category.create,
        action: () => MediaPicker.openCategoryModal(this.props.type, 'create', null, this.state.category?.id),
      }, {
        id: 'category-download',
        label: plugin.instance.strings.category.download,
        action: () => MediaPicker.downloadCategory({ type: this.props.type, name: this.state.category?.name, categoryId: this.state.category?.id }),
      },
    ]

    if (!plugin.instance.settings.allowCaching && this.state.category == null && this.props.type !== 'gif') {
      items.push({
        id: 'media-refresh-urls',
        label: plugin.instance.strings.category.refreshUrls,
        action: () => MediaPicker.refreshMediasUrls(this.props.type, this.state.medias, this.state.categories),
      })
    }

    BdApi.ContextMenu.open(e,
      BdApi.ContextMenu.buildMenu([{
        type: 'group',
        items,
      }]), {
        onClose: () => {
          canClosePicker.context = 'contextmenu'
          canClosePicker.value = true
        },
      })
  }

  resetScroll () {
    this.refs.pickerScroll?.scroll(0, 0)
  }

  static changeCategoryCategory (type, id, categoryId) {
    const typeData = loadData(type, { medias: [] })
    const index = typeData.categories.findIndex(c => c.id === id)
    if (index < 0) return
    typeData.categories[index].category_id = categoryId
    saveData(type, typeData)
    BdApi.UI.showToast(plugin.instance.strings.category.success.move, { type: 'success' })
    Dispatcher.dispatch({ type: 'FM_UPDATE_CATEGORIES' })
  }

  static changeMediaCategory (type, url, categoryId) {
    const typeData = loadData(type, { medias: [], categories: [] })
    const index = typeData.medias.findIndex(m => MediaFavButton.checkSameUrl(m.url, url))
    if (index < 0) return
    typeData.medias[index].category_id = categoryId
    typeData.categories.forEach((c) => {
      if (c.thumbnail === MediaFavButton.getThumbnail(type, typeData.medias[index])) {
        c.thumbnail = undefined
      }
    })
    saveData(type, typeData)
    BdApi.UI.showToast(plugin.instance.strings.media.success.move[type], { type: 'success' })
    Dispatcher.dispatch({ type: 'FM_UPDATE_MEDIAS' })
  }

  static removeCategoryCategory (type, categoryId) {
    const typeData = loadData(type, { categories: [] })
    const index = typeData.categories.findIndex(m => m.id === categoryId)
    if (index < 0) return
    delete typeData.categories[index].category_id
    saveData(type, typeData)
    BdApi.UI.showToast(plugin.instance.strings.category.success.move, { type: 'success' })
    Dispatcher.dispatch({ type: 'FM_UPDATE_CATEGORIES' })
  }

  static removeMediaCategory (type, mediaId) {
    const typeData = loadData(type, { medias: [], categories: [] })
    delete typeData.medias[mediaId].category_id
    typeData.categories.forEach((c) => {
      if (c.thumbnail === MediaFavButton.getThumbnail(type, typeData.medias[mediaId])) {
        c.thumbnail = undefined
      }
    })
    saveData(type, typeData)
    BdApi.UI.showToast(plugin.instance.strings.media.success.remove[type], { type: 'success' })
    Dispatcher.dispatch({ type: 'FM_UPDATE_MEDIAS' })
  }

  static setCategoryThumbnail (type, url, categoryId) {
    const typeData = loadData(type, { categories: [] })
    const index = typeData.categories.findIndex(m => m.id === categoryId)
    if (index < 0) return
    typeData.categories[index].thumbnail = url
    saveData(type, typeData)
    BdApi.UI.showToast(plugin.instance.strings.category.success.setThumbnail, { type: 'success' })
    Dispatcher.dispatch({ type: 'FM_UPDATE_CATEGORIES' })
  }

  static unsetCategoryThumbnail (type, categoryId) {
    const typeData = loadData(type, { categories: [] })
    const index = typeData.categories.findIndex(m => m.id === categoryId)
    if (index < 0) return
    typeData.categories[index].thumbnail = undefined
    saveData(type, typeData)
    BdApi.UI.showToast(plugin.instance.strings.category.success.unsetThumbnail, { type: 'success' })
    Dispatcher.dispatch({ type: 'FM_UPDATE_CATEGORIES' })
  }

  categoriesItems (media) {
    return this.state.categories
      .filter(c => c.id !== (media.category_id) && c.id !== MediaPicker.getMediaCategoryId(this.props.type, media.id))
      .map(c => ({
        id: `category-menu-${c.id}`,
        label: c.name,
        key: c.id,
        action: () => MediaPicker.changeMediaCategory(this.props.type, media.url, c.id),
        render: () => BdApi.React.createElement(CategoryMenuItem, { ...c, key: c.id }),
      }))
  }

  static getMediaCategoryId (type, mediaId) {
    return loadData(type, { medias: [] }).medias[mediaId]?.category_id
  }

  static getCategoryThumbnail (type, categoryId) {
    return loadData(type, { categories: [] }).categories.find(c => c.id === categoryId)?.thumbnail
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
    this.setState({ categories: loadData(this.props.type, { categories: [] }).categories })
  }

  loadMedias () {
    this.setState({ medias: loadData(this.props.type, { medias: [] }).medias })
  }

  backCategory () {
    const prevCategory = this.state.categories.find((c) => c.id === this.state.category.category_id)
    this.setState({
      category: prevCategory,
      page: 1,
    })
    this.resetScroll()
  }

  async uploadMedia (mediaId, spoiler = false) {
    const media = structuredClone(this.state.medias[mediaId])
    if (media == null) return

    const [refreshedUrl] = await MediaPicker.refreshUrls([media.url])
    media.url = refreshedUrl.refreshed ?? refreshedUrl.original

    const buffer = await fetchMedia(media).catch((err) => BdApi.Logger.error(plugin.name, err.message ?? err))
    uploadFile(this.props.type, buffer, media)

    setTimeout(() => {
      if (spoiler) findSpoilerButton()?.click()
    }, 50)
    EPS.closeExpressionPicker()
  }

  sendMedia (e, mediaId) {
    Dispatcher.dispatch({ type: 'FM_SEND_MEDIA', e, mediaId })
  }

  onMediaContextMenu (e, mediaId) {
    const media = loadData(this.props.type, { medias: [] }).medias[mediaId]
    const items = [{
      id: 'media-input',
      label: 'media-input',
      render: () => BdApi.React.createElement(MediaMenuItemInput, { id: mediaId, type: this.props.type, loadMedias: this.loadMedias }),
    }, {
      id: 'media-copy-url',
      label: getDiscordIntl('COPY_MEDIA_LINK'),
      action: () => ElectronModule.copy(media.url),
    }]
    if (media.message != null) {
      items.push({
        id: 'media-copy-message',
        label: getDiscordIntl('COPY_MESSAGE_LINK'),
        action: () => ElectronModule.copy(media.message ?? ''),
      })
    }
    if (media.source != null) {
      items.push({
        id: 'media-copy-source',
        label: plugin.instance.strings.media.copySource,
        action: () => ElectronModule.copy(media.source ?? ''),
      })
    }
    items.push({
      id: 'media-send-title',
      label: getDiscordIntl('USER_POPOUT_MESSAGE'),
      action: (e) => this.sendMedia(e, mediaId),
    }, {
      id: 'media-upload-title',
      label: plugin.instance.strings.media.upload.title,
      type: 'submenu',
      items: [{
        id: 'media-upload-normal',
        label: plugin.instance.strings.media.upload.normal,
        action: () => this.uploadMedia(mediaId),
      }, {
        id: 'media-upload-spoiler',
        label: plugin.instance.strings.media.upload.spoiler,
        action: () => this.uploadMedia(mediaId, true),
      }],
    }, {
      id: 'media-download',
      label: getDiscordIntl('DOWNLOAD'),
      action: () => MediaPicker.downloadMedia(media, this.props.type),
    })
    const itemsCategories = this.categoriesItems(media)
    const mediaCategoryId = MediaPicker.getMediaCategoryId(this.props.type, mediaId)
    if (itemsCategories.length > 0) {
      items.splice(1, 0, {
        id: 'media-moveAddTo',
        label: this.state.category || mediaCategoryId != null ? plugin.instance.strings.media.moveTo : plugin.instance.strings.media.addTo,
        type: 'submenu',
        items: itemsCategories,
      })
    }
    if (mediaCategoryId != null) {
      const mediaThumbnail = MediaFavButton.getThumbnail(this.props.type, media)
      const categoryThumbnail = MediaPicker.getCategoryThumbnail(this.props.type, mediaCategoryId)
      if (mediaThumbnail !== categoryThumbnail) {
        items.push({
          id: 'category-setThumbnail',
          label: plugin.instance.strings.category.setThumbnail,
          action: () => MediaPicker.setCategoryThumbnail(this.props.type, mediaThumbnail, mediaCategoryId),
        })
      }
      items.push({
        id: 'media-removeFrom',
        label: plugin.instance.strings.media.removeFrom,
        danger: true,
        action: () => MediaPicker.removeMediaCategory(this.props.type, mediaId),
      })
    }
    canClosePicker.context = 'contextmenu'
    canClosePicker.value = false
    BdApi.ContextMenu.open(e, BdApi.ContextMenu.buildMenu([
      {
        type: 'group',
        items,
      },
    ]), {
      onClose: () => {
        canClosePicker.context = 'contextmenu'
        canClosePicker.value = true
      },
    })
  }

  static async openImportModal () {
    const { filePaths } = await BdApi.UI.openDialog({
      defaultPath: BdApi.Plugins.folder,
      multiSelections: true,
      filters: [{ name: 'Config', extensions: ['config.json'] }],
    })
    if (!filePaths?.[0]) return

    BdApi.UI.showConfirmationModal(
      plugin.instance.strings.import.panel,
      BdApi.React.createElement(ImportPanel, {
        paths: filePaths,
      }), {
        confirmText: null,
        cancelText: null,
      })
  }

  static async openDatabasePanel () {
    BdApi.UI.showConfirmationModal(plugin.instance.strings.cache.panel, BdApi.React.createElement(DatabasePanel), {
      confirmText: null,
      cancelText: null,
    })
  }

  static async fetchMediasIntoDB () {
    const time = new Date().getTime()
    const mediasUrlToCache = []
    const keys = await fmdb.getKeys()
    const types = ['image', 'video', 'gif']
    for (const type of types) {
      const medias = loadData(type, { medias: [] }).medias
      for (const media of medias) {
        const url = MediaFavButton.getThumbnail(type, media)
        if (url != null && !keys.includes(url)) mediasUrlToCache.push(url)
      }
    }

    if (mediasUrlToCache.length <= 0) {
      BdApi.Logger.info(plugin.name, 'There is no media to cache')
      return 0
    }

    let totalCached = 0
    const cacheMedia = async (r) => {
      const buf = await fetchMedia({ url: r.refreshed ?? r.original })
      await fmdb.set(r.original, buf)
    }

    const refreshedUrls = await MediaPicker.refreshUrls(mediasUrlToCache)
    for (const refreshedUrl of refreshedUrls) {
      await cacheMedia(refreshedUrl).then(() => {
        totalCached++
        Dispatcher.dispatch({ type: 'FM_FETCH_INTO_DB', done: totalCached, total: mediasUrlToCache.length })
      }).catch((err) => {
        BdApi.Logger.warn(plugin.name, 'Failed to cache media:', refreshedUrl.original, err.message ?? err)
      })
    }

    BdApi.Logger.info(plugin.name, `Saved ${totalCached}/${mediasUrlToCache.length} medias in the database in ${((new Date().getTime() - time) / 1000).toFixed(2)}s`)

    return totalCached
  }

  static async refreshUrls (urls) {
    const wait = async (delay = 1000) => { await new Promise((resolve) => { setTimeout(resolve) }, delay) }

    const ret = []

    const CHUNKS_SIZE = 50
    for (let i = 0; i < Math.ceil(urls.length / CHUNKS_SIZE); i++) {
      const chunkUrls = urls.slice(i * CHUNKS_SIZE, (i + 1) * CHUNKS_SIZE)
      const response = await RestAPI.post({
        url: '/attachments/refresh-urls',
        body: { attachment_urls: chunkUrls },
        trackedActionData: {},
      }).catch((res) => {
        let err
        try { err = JSON.parse(res.text) } catch (error) { BdApi.Logger.error(plugin.name, error) }
        BdApi.Logger.warn(plugin.name, 'Could not load medias:', chunkUrls, err)
      })
      if (response != null && response.ok) ret.push(...response.body.refreshed_urls)

      // to prevent rate-limit
      await wait(500)
    }

    return ret
  }

  static async refreshMediasUrls (type, medias, categories) {
    const urls = [
      ...medias.map(m => m.url),
      ...medias.filter(m => m.poster != null).map(m => m.poster),
      ...medias.filter(m => m.src != null).map(m => m.src),
      ...categories.filter(c => c.thumbnail != null).map(c => c.thumbnail),
    ]
    const refreshedUrls = await MediaPicker.refreshUrls(urls)
    const typeData = loadData(type, { categories: [], medias: [] })
    for (const refreshedUrl of refreshedUrls) {
      const newUrl = refreshedUrl.refreshed ?? refreshedUrl.original

      // Medias
      const media = typeData.medias.find((m) => m.url?.includes(refreshedUrl.original))
      if (media != null) media.url = newUrl

      if (type === 'video') {
        const mediaVideo = typeData.medias.find((m) => m.poster?.includes(refreshedUrl.original))
        if (mediaVideo != null) mediaVideo.poster = newUrl
      }

      if (type === 'gif') {
        const mediaGif = typeData.medias.find((m) => m.src?.includes(refreshedUrl.original))
        if (mediaGif != null) mediaGif.src = newUrl
      }

      // Categories
      const category = typeData.medias.find((c) => c.thumbnail?.includes(refreshedUrl.original))
      if (category != null) category.thumbnail = newUrl
    }

    saveData(type, typeData)

    if (refreshedUrls.length > 0) {
      BdApi.UI.showToast(plugin.instance.strings.category.success.refreshUrls, { type: 'success' })
      EPS.closeExpressionPicker()
    }
  }

  render () {
    return BdApi.React.createElement('div', {
      id: `fm-${this.props.type}-picker-tab-panel`,
      role: 'tabpanel',
      'aria-labelledby': `fm-${this.props.type}-picker-tab`,
      className: `${classes.gutter.container} fm-pickerContainer`,
    },
    BdApi.React.createElement('div', {
      className: `${classes.gutter.header} fm-header`,
    },
    BdApi.React.createElement('div', {
      className: `${classes.h5} fm-headerRight`,
    },
    BdApi.React.createElement('span', {
      ref: 'mediasCounter',
      className: 'fm-mediasCounter',
    }, this.filteredMedias.length),
    BdApi.React.createElement('div', {
      ref: 'databaseButton',
      className: `${classes.buttons.button} fm-databaseButton fm-buttonIcon`,
      onClick: MediaPicker.openDatabasePanel,
    }, DatabaseSVG()),
    BdApi.React.createElement('div', {
      ref: 'importButton',
      className: `${classes.buttons.button} fm-importButton fm-buttonIcon`,
      onClick: MediaPicker.openImportModal,
    }, ImportSVG()),
    BdApi.React.createElement('div', {
      ref: 'settingsButton',
      className: `${classes.buttons.button} fm-settingsButton fm-buttonIcon`,
      onClick: () => Dispatcher.dispatch({ type: 'FM_OPEN_SETTINGS' }),
    }, CogSVG())
    ),
    BdApi.React.createElement('div', {
      className: `${classes.flex.flex} ${classes.flex.horizontal} ${classes.flex.justifyStart} ${classes.flex.alignCenter} ${classes.flex.noWrap}`,
      style: { flex: '1 1 auto' },
    },
    this.state.category
      ? BdApi.React.createElement('div', {
        className: classes.gutter.backButton,
        role: 'button',
        tabindex: '0',
        onClick: () => this.backCategory(),
      },
      BdApi.React.createElement('svg', {
        'aria-hidden': false,
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
      },
      BdApi.React.createElement('path', {
        fill: 'currentColor',
        d: 'M20 10.9378H14.2199H8.06628L10.502 8.50202L9 7L4 12L9 17L10.502 15.498L8.06628 13.0622H20V10.9378Z',
      })
      )
      )
      : null,
    this.state.category
      ? BdApi.React.createElement('h5', {
        className: `${classes.h5} ${classes.gutter.searchHeader}`,
      }, this.state.category.name)
      : null,
    this.state.textFilter && !this.state.category
      ? BdApi.React.createElement('div', {
        className: classes.gutter.backButton,
        role: 'button',
        tabindex: '0',
        onClick: this.clearSearch,
      },
      BdApi.React.createElement('svg', {
        'aria-hidden': false,
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
      },
      BdApi.React.createElement('path', {
        fill: 'currentColor',
        d: 'M20 10.9378H14.2199H8.06628L10.502 8.50202L9 7L4 12L9 17L10.502 15.498L8.06628 13.0622H20V10.9378Z',
      })
      )
      )
      : null,
    !this.state.category
      ? BdApi.React.createElement('div', {
        className: `${classes.gutter.searchBar} ${classes.container.container} ${classes.container.medium}`,
      },
      BdApi.React.createElement('div', {
        className: classes.container.inner,
      },
      BdApi.React.createElement('input', {
        className: classes.container.input,
        placeholder: plugin.instance.strings.searchItem[this.props.type],
        autofocus: true,
        ref: 'input',
        onChange: e => {
          this.setState({ textFilter: e.target.value })
          this.resetScroll()
        },
      }),
      BdApi.React.createElement('div', {
        className: `${classes.container.iconLayout} ${classes.container.medium} ${this.state.textFilter ? classes.container.pointer : ''}`,
        tabindex: '-1',
        role: 'button',
        onClick: this.clearSearch,
      },
      BdApi.React.createElement('div', {
        className: classes.container.iconContainer,
      },
      BdApi.React.createElement('svg', {
        className: `${classes.container.clear} ${this.state.textFilter ? '' : ` ${classes.container.visible}`}`,
        'aria-hidden': false,
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
      },
      BdApi.React.createElement('path', {
        fill: 'currentColor',
        d: 'M21.707 20.293L16.314 14.9C17.403 13.504 18 11.799 18 10C18 7.863 17.167 5.854 15.656 4.344C14.146 2.832 12.137 2 10 2C7.863 2 5.854 2.832 4.344 4.344C2.833 5.854 2 7.863 2 10C2 12.137 2.833 14.146 4.344 15.656C5.854 17.168 7.863 18 10 18C11.799 18 13.504 17.404 14.9 16.314L20.293 21.706L21.707 20.293ZM10 16C8.397 16 6.891 15.376 5.758 14.243C4.624 13.11 4 11.603 4 10C4 8.398 4.624 6.891 5.758 5.758C6.891 4.624 8.397 4 10 4C11.603 4 13.109 4.624 14.242 5.758C15.376 6.891 16 8.398 16 10C16 11.603 15.376 13.11 14.242 14.243C13.109 15.376 11.603 16 10 16Z',
      })
      ),
      BdApi.React.createElement('svg', {
        className: `${classes.container.clear} ${this.state.textFilter ? ` ${classes.container.visible}` : ''}`,
        'aria-hidden': false,
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
      },
      BdApi.React.createElement('path', {
        fill: 'currentColor',
        d: 'M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z',
      })
      )
      )
      )
      )
      )
      : null
    )
    ),
    BdApi.React.createElement('div', {
      className: `${classes.gutter.content} fm-pickerContent`,
      style: { height: '100%' },
    },
    BdApi.React.createElement('div', {
      ref: 'pickerScroll',
      className: `${classes.category.container} ${classes.scroller.thin} ${classes.scroller.fade} fm-pickerContentContainer`,
      style: { overflow: 'hidden scroll', 'padding-right': '0' },
      onContextMenu: this.onContextMenu,
    },
    BdApi.React.createElement('div', {
      className: `${classes.scroller.content} fm-pickerContentContainerContent`,
    },
    BdApi.React.createElement('div', {
      style: { position: 'absolute', left: '12px', top: '12px', width: 'calc(100% - 16px)' },
      ref: 'content',
    },
    !this.state.category && (this.state.categories.length + this.state.medias.length === 0)
      ? BdApi.React.createElement(EmptyFavorites, { type: this.props.type })
      : null,
    this.state.categories.length > 0 && this.state.contentWidth
      ? BdApi.React.createElement(RenderList, {
        component: CategoryCard,
        items: this.positionedCategories,
        componentProps: {
          type: this.props.type,
          setCategory: this.setCategory,
          length: this.filteredCategories.length,
        },
      })
      : null,
    this.state.medias.length > 0 && this.state.contentWidth
      ? BdApi.React.createElement(RenderList, {
        component: MediaCard,
        items: this.positionedMedias,
        componentProps: {
          type: this.props.type,
          onMediaContextMenu: this.onMediaContextMenu,
          settings: this.props.settings,
        },
      })
      : null
    ),
    this.state.categories.length > 0 || this.state.medias.length > 0
      ? BdApi.React.createElement('div', {
        style: {
          position: 'absolute',
          left: '12px',
          top: `${this.contentHeight + 12}px`,
          width: 'calc(100% - 16px)',
          height: '220px',
        },
        ref: 'endSticker',
      },
      BdApi.React.createElement('div', {
        className: classes.result.endContainer,
        style: {
          position: 'sticky',
          top: '0px',
          left: '0px',
          width: '100%',
          height: '220px',
        },
      })
      )
      : null
    )
    ),
    PageControl != null
      ? BdApi.React.createElement('div', {
        className: 'fm-pageControl',
      },
      BdApi.React.createElement(PageControl, {
        currentPage: this.state.page,
        maxVisiblePages: 5,
        onPageChange: (page) => {
          this.setState({ page: Number(page) })
          this.resetScroll()
        },
        pageSize: plugin.instance.settings.maxMediasPerPage,
        totalCount: this.filteredCategories.length + this.filteredMedias.length,
      })
      )
      : null
    )
    )
  }
}

class MediaButton extends BdApi.React.Component {
  constructor (props) {
    super(props)

    this.state = {
      active: false,
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
    Dispatcher.subscribe('FM_PICKER_BUTTON_ACTIVE', this.changeActive)
  }

  componentWillUnmount () {
    Dispatcher.unsubscribe('FM_PICKER_BUTTON_ACTIVE', this.changeActive)
  }

  render () {
    return BdApi.React.createElement('div', {
      className: `${classes.textarea.buttonContainer} fm-buttonContainer fm-${this.props.type}`,
      ref: 'button',
    },
    BdApi.React.createElement('button', {
      className: `${classes.look.button} ${classes.look.lookBlank} ${classes.look.colorBrand} ${classes.look.grow}${this.state.active ? ` ${classes.icon.active}` : ''} fm-button`,
      tabindex: '0',
      type: 'button',
      onMouseDown: this.checkPicker,
      onClick: () => {
        const EPSState = EPS.useExpressionPickerStore.getState()
        const typeId = `fm-${this.props.type}`
        if (EPSState.activeView === typeId && EPSState.activeViewType?.analyticsName !== this.props.pickerType?.analyticsName) {
          EPS.toggleExpressionPicker(typeId, this.props.pickerType ?? EPSState.activeViewType)
        }
        EPS.toggleExpressionPicker(typeId, this.props.pickerType ?? EPSConstants.NORMAL)
      },
    },
    BdApi.React.createElement('div', {
      className: `${classes.look.contents} ${classes.textarea.button} ${classes.icon.button} fm-buttonContent`,
    },
    BdApi.React.createElement('div', {
      className: `${classes.icon.buttonWrapper} fm-buttonWrapper`,
      style: { opacity: '1', transform: 'none' },
    },
    this.props.type === 'image' ? ImageSVG() : null,
    this.props.type === 'video' ? VideoSVG() : null,
    this.props.type === 'audio' ? AudioSVG() : null,
    this.props.type === 'file' ? FileSVG() : null
    )
    )
    )
    )
  }
}

function getMediaFromCache (key) {
  if (!plugin.instance.settings.allowCaching) return key
  return mediasCache[key] ?? key
}

function getUrlName (url) {
  // tenor case, otherwise it would always return 'tenor'
  if (url.startsWith('https://tenor.com/view/') || url.startsWith('https://media.tenor.com/view/')) return url.match(/view\/(.*)-gif-/)?.[1]
  return url.replace(/(\.|\/)([^./]*)$/gm, '').split('/').pop()
}

function getUrlExt (url, type) {
  const ext = url.match(/\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi)?.[0]
  if (ext != null) return ext
  return {
    image: '.png',
    video: '.mp4',
    audio: '.mp3',
    gif: '.gif',
  }[type] ?? ''
}

function cleanUrl (url) {
  if (url == null) return
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.delete('width')
    urlObj.searchParams.delete('height')
    urlObj.searchParams.delete('quality')
    urlObj.searchParams.delete('format')
    urlObj.searchParams.delete('')
    // force cdn link because on PC media link videos can't be played
    return urlObj.toString().replace('media.discordapp.net', 'cdn.discordapp.com')
  } catch {
    return url
  }
}

function removeProxyUrl (url) {
  const tmpUrl = url?.split('https/')[1]
  if (tmpUrl == null) return url
  return 'https://' + tmpUrl
}

async function sendInTextarea (clear = false) {
  return await new Promise((resolve, reject) => {
    try {
      const enterEvent = new window.KeyboardEvent('keydown', { charCode: 13, keyCode: 13, bubbles: true })
      setTimeout(() => {
        currentTextareaInput?.dispatchEvent(enterEvent)
        if (clear) ComponentDispatch.dispatchToLastSubscribed('CLEAR_TEXT')
        resolve()
      })
    } catch (error) {
      reject(error)
    }
  })
}

function uploadFile (type, buffer, media) {
  // if the textarea has not been patched, file uploading will fail
  if (currentTextareaInput == null || !document.body.contains(currentTextareaInput)) return BdApi.Logger.error(plugin.name, 'Could not find current textarea, upload file canceled.')

  const isGIF = type === 'gif'
  const ext = getUrlExt(media.url, type)
  const fileName = `${isGIF ? getUrlName(media.url).replace(/ /g, '_') : media.name}${ext}`
  const mime = `${isGIF ? 'image' : type}/${ext.slice(1)}`
  const file = new File([buffer], fileName, { type: mime })
  FilesUpload.addFiles({
    channelId: currentChannelId,
    draftType: 0,
    files: [{ file, platform: 1 }],
    showLargeMessageDialog: false,
  })
}

async function fetchMedia (media) {
  media = structuredClone(media)

  let mediaBuffer = await fmdb.get(media.url)
  if (mediaBuffer != null) return new Uint8Array(mediaBuffer)

  const fetchUrl = (media.url.startsWith('//') ? 'https:' : '') + media.url
  mediaBuffer = await BdApi.Net.fetch(fetchUrl).then((r) => r.arrayBuffer())
  const td = new TextDecoder('utf-8')
  // no longer cached on Discord CDN
  if (td.decode(mediaBuffer.slice(0, 5)) === '<?xml') throw new Error('Media no longer cached on the server')
  // tenor GIF case
  if (media.url.startsWith('https://tenor.com/view/')) {
    if (td.decode(mediaBuffer.slice(0, 15)) === '<!DOCTYPE html>') {
      const url = td.decode(mediaBuffer).match(/src="(https:\/\/media([^.]*)\.tenor\.com\/[^"]*)"/)?.[1]
      if (url == null) throw new Error('GIF no longer exists on tenor')
      media.url = url
      media.name = url.match(/view\/(.*)-gif-/)?.[1]
      mediaBuffer = await BdApi.Net.fetch(media.url).then((r) => r.arrayBuffer())
    }
  }

  // not resolving external link
  if (td.decode(mediaBuffer.slice(0, 15)) === '<!DOCTYPE html>') return null

  return new Uint8Array(mediaBuffer)
}

function findTextareaInput ($button = document.getElementsByClassName(classes.textarea.buttonContainer).item(0)) {
  return $button?.closest(`.${classes.textarea.channelTextArea}`)?.querySelector('[role="textbox"]')
}

function findSpoilerButton () {
  return currentTextareaInput?.closest(`.${classes.textarea.channelTextArea}`)?.querySelector(`.${classes.upload.actionBarContainer} [role="button"]:first-child`)
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
    let guildId = window.location.href.match(/channels\/(\d+)/)?.[1]
    if (window.location.pathname.startsWith('/channels/@me/')) {
      guildId = window.location.href.match(/channels\/@me\/(\d+)/)?.[1]
    }
    return `${window.location.origin}/channels/${guildId}/${channelId}/${messageId}`
  } catch (error) {
    BdApi.Logger.error(plugin.name, error)
  }
}

function findSourceLink ($target, url) {
  if ($target == null) return
  try {
    const [channelId, messageId] = findMessageIds($target)
    const fields = ['image', 'thumbnail', 'video']
    const embed = MessageStore.getMessage(channelId, messageId)?.embeds?.find((e) => {
      if (e.type !== 'link') return false
      return fields.some((f) => e[f]?.url?.startsWith(url) || e[f]?.proxyURL?.startsWith(url))
    })
    if (embed == null) return
    return embed.url
  } catch (error) {
    BdApi.Logger.error(plugin.name, error)
  }
}

async function getMediaDimensions (props) {
  if (props.width > 0 && props.height > 0) return { width: props.width, height: props.height }

  const dimensions = { width: 0, height: 0 }
  const $target = props.target?.current?.parentElement?.querySelector('img, video')
  if ($target == null) return dimensions

  const src = cleanUrl($target.src)
  if (src == null) return dimensions
  return new Promise((resolve) => {
    if ($target.tagName === 'VIDEO') {
      const $vid = document.createElement('video')
      $vid.preload = 'metadata'
      $vid.addEventListener('loadedmetadata', (e) => {
        dimensions.width = e.target.videoWidth
        dimensions.height = e.target.videoHeight
        resolve(dimensions)
      })
      $vid.src = src
    } else if ($target.tagName === 'IMG') {
      const $img = document.createElement('img')
      $img.addEventListener('load', () => {
        dimensions.width = $img.width
        dimensions.height = $img.height
        resolve(dimensions)
      })
      $img.src = src
    }
  })
}

function getDiscordIntl (key) {
  return DiscordIntl?.intl?.format(DiscordIntl.t[INTL_CODE_HASH[key]]) ?? key
}

function loadEPS () {
  if (EPSModules == null) {
    BdApi.Logger.warn(plugin.name, 'Failed to load module ExpressionPickerStore')
    return
  }

  Object.entries(EPSModules).forEach(([key, fn]) => {
    const code = String(fn)
    if (fn.getState && fn.setState) {
      EPS.useExpressionPickerStore = fn
    } else if (code.includes('activeView===')) {
      EPS.toggleExpressionPicker = fn
    } else if (code.includes('activeView:null')) {
      EPS.closeExpressionPicker = fn
      closeExpressionPickerKey = key
    }
  })
}

function categoryValidator (type, name, color, id) {
  if (!name || typeof name !== 'string') return { error: 'error', message: plugin.instance.strings.category.error.needName }
  if (name.length > 20) return { error: 'error', message: plugin.instance.strings.category.error.invalidNameLength }
  if (!color || typeof color !== 'string' || !color.startsWith('#')) return { error: 'error', message: plugin.instance.strings.category.error.wrongColor }
  const typeData = loadData(type, { categories: [], medias: [] })
  if (typeData.categories.find(c => c.name === name && c.id !== id) !== undefined) return { error: 'error', message: plugin.instance.strings.category.error.nameExists }
  return typeData
}

function getNewCategoryId (categories = []) {
  const id = Math.max(...categories.map(c => c.id))
  if (isNaN(id) || id < 1) return 1
  return id + 1
}

function createCategory (type, { name, color }, categoryId) {
  const res = categoryValidator(type, name, color)
  if (res.error) {
    BdApi.Logger.error(plugin.name, res.error)
    BdApi.UI.showToast(res.message, { type: 'error' })
    return false
  }

  res.categories.push({
    id: getNewCategoryId(res.categories),
    name,
    color,
    category_id: categoryId,
  })
  saveData(type, res)

  BdApi.UI.showToast(plugin.instance.strings.category.success.create, { type: 'success' })
  return true
}

function editCategory (type, { name, color }, id) {
  const res = categoryValidator(type, name, color, id)
  if (res.error) {
    BdApi.Logger.error(plugin.name, res.error)
    BdApi.UI.showToast(res.message, { type: 'error' })
    return false
  }

  res.categories[res.categories.findIndex(c => c.id === id)] = { id, name, color }
  saveData(type, res)

  BdApi.UI.showToast(plugin.instance.strings.category.success.edit, { type: 'success' })
  return true
}

function moveCategory (type, id, inc) {
  const typeData = loadData(type, { categories: [], medias: [] })
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
  saveData(type, typeData)

  BdApi.UI.showToast(plugin.instance.strings.category.success.move, { type: 'success' })
  Dispatcher.dispatch({ type: 'FM_UPDATE_CATEGORIES' })
}

function deleteCategory (type, id) {
  const typeData = loadData(type, { categories: [], medias: [] })
  if (typeData.categories.find(c => c.id === id) === undefined) {
    BdApi.UI.showToast(plugin.instance.strings.category.error.invalidCategory, { type: 'error' })
    return false
  }
  const deleteCategoryId = (id) => {
    typeData.categories = typeData.categories.filter(c => c.id !== id)
    typeData.medias = typeData.medias.map(m => { if (m.category_id === id) delete m.category_id; return m })
    const categoriesToDelete = typeData.categories.filter((c) => c.category_id === id)
    categoriesToDelete.forEach((c) => deleteCategoryId(c.id))
  }
  deleteCategoryId(id)
  saveData(type, typeData)

  BdApi.UI.showToast(plugin.instance.strings.category.success.delete, { type: 'success' })
  return true
}

function hexToRgb (hex) {
  const bigint = parseInt(hex.replace('#', ''), 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  return [r, g, b]
}

function observe (selector, callback, options = {}, root = document) {
  if (typeof options.append === 'function') {
    root = options
    options = {}
  }
  const observer = new window.MutationObserver((_, instance) => {
    const el = root.querySelector(selector) || root.matches?.(selector) || root.matchesSelector?.(selector)
    if (el == null) return
    callback?.(el, instance)
    if (!options.keep) instance.disconnect()
  })
  observer.observe(root, { childList: true, subtree: true, ...options })
  return observer
}

// https://github.com/zerebos/BDPluginLibrary/blob/a375c48d7af5e1a000ce0d97a6cbbcf77a9461cc/src/modules/reacttools.js#L46
function getOwnerInstance (node, { include, exclude = ['Popout', 'Tooltip', 'Scroller', 'BackgroundFlash'], filter = _ => _ } = {}) {
  if (node === undefined) return undefined
  const excluding = include === undefined
  const nameFilter = excluding ? exclude : include
  function getDisplayName (owner) {
    const type = owner.type
    if (!type) return null
    return type.displayName || type.name || null
  }
  function classFilter (owner) {
    const name = getDisplayName(owner)
    return (name !== null && !!(nameFilter.includes(name) ^ excluding))
  }

  let curr = BdApi.ReactUtils.getInternalInstance(node)
  for (curr = curr && curr.return; curr != null; curr = curr.return) {
    if (curr == null) continue
    const owner = curr.stateNode
    if (owner != null && !(owner instanceof window.HTMLElement) && classFilter(curr) && filter(owner)) return owner
  }

  return null
}

function loadData (key, defaultData) {
  defaultData = structuredClone(defaultData)

  const data = BdApi.Data.load(plugin.name, key)
  if (data == null) return defaultData

  // Default value
  for (const key in defaultData) {
    if (data[key] == null && defaultData[key] != null) {
      data[key] = defaultData[key]
    }
  }

  return data
}

function saveData (key, data) {
  BdApi.Data.save(plugin.name, key, data)
}

module.exports = class FavoriteMedia {
  constructor (meta) {
    this.meta = meta

    this.strings = this.getLocaleStrings()
    LocaleStore.addChangeListener(() => { this.strings = this.getLocaleStrings() })

    this.settings = this.loadSettings()
  }

  start () {
    loadEPS()

    this.patchExpressionPicker()
    this.patchMessageContextMenu()
    this.patchGIFTab()
    this.patchClosePicker()
    this.patchMedias()
    this.patchChannelTextArea()

    this.openSettings = this.openSettings.bind(this)
    Dispatcher.subscribe('FM_OPEN_SETTINGS', this.openSettings)

    BdApi.DOM.addStyle(this.meta.name, this.css)

    const savedVersion = loadData('version')
    if (savedVersion !== this.meta.version && this.changelogs.length > 0) {
      BdApi.UI.showChangelogModal({
        title: this.meta.name,
        subtitle: this.meta.version,
        changes: this.changelogs,
      })
    }
    saveData('version', this.meta.version)
  }

  stop () {
    this.contextMenu?.()
    BdApi.Patcher.unpatchAll(this.meta.name)
    Dispatcher.dispatch({ type: 'FM_UNPATCH_ALL' })
    Dispatcher.unsubscribe('FM_OPEN_SETTINGS', this.openSettings)
    Object.keys(mediasCache).forEach((url) => URL.revokeObjectURL(url))

    BdApi.DOM.removeStyle(this.meta.name)
  }

  getLocaleStrings () {
    return structuredClone(this.translations[LocaleStore.locale.toLowerCase().split('-')[0]])
  }

  loadSettings () {
    const settingsData = loadData('settings', {})
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

    saveData('settings', settingsData)

    return settingsData
  }

  prepareSettings (settings = [], settingsData = {}, settingsStrings = {}) {
    for (const setting of settings) {
      if (setting.type !== 'category') {
        if (!Object.hasOwn(settingsData, setting.id)) {
          settingsData[setting.id] = setting.value
        } else {
          setting.value = settingsData[setting.id]
        }
      } else {
        this.prepareSettings(setting.settings, settingsData[setting.id] ?? {}, settingsStrings[setting.id])
      }

      const settingStrings = settingsStrings[setting.id]
      if (settingStrings != null) {
        setting.name = settingStrings.name
        if (setting.note != null) {
          setting.note = settingStrings.note
        }
      }
    }
  }

  getSettingsPanel (settings) {
    settings = structuredClone(settings ?? this.defaultSettings)
    settings = Array.isArray(settings) ? settings : [settings]

    this.prepareSettings(settings, this.settings, this.strings.settings)

    return BdApi.UI.buildSettingsPanel({
      settings,
      onChange: (category, id, value) => {
        const settingsData = loadData('settings', {})
        if (category != null) {
          settingsData[category][id] = value
        } else {
          settingsData[id] = value
        }
        saveData('settings', settingsData)
      },
    })
  }

  openSettings () {
    const settingsTitle = this.meta.name + ' Settings'
    BdApi.UI.showConfirmationModal(settingsTitle, this.getSettingsPanel(), {
      confirmText: null,
      cancelText: null,
    })

    // No modal size option available
    setTimeout(() => {
      document.querySelectorAll('.bd-modal-header h1').forEach(($el) => {
        if ($el.textContent !== settingsTitle) return

        const modalRoot = $el.closest('.bd-modal-root')
        modalRoot.classList.remove('bd-modal-small')
        modalRoot.classList.add('bd-modal-medium')
      })
    }, 100)
  }

  MediaTab (mediaType, elementType) {
    const mediaTypeId = `fm-${mediaType}`
    const selected = mediaTypeId === EPS.useExpressionPickerStore.getState().activeView
    return BdApi.React.createElement(elementType, {
      id: `${mediaTypeId}-picker-tab`,
      'aria-controls': `${mediaTypeId}-picker-tab-panel`,
      'aria-selected': selected,
      className: 'fm-pickerTab',
      viewType: mediaTypeId,
      isActive: selected,
    }, plugin.instance.strings.tabName[mediaType])
  }

  async waitExpressionPicker () {
    return new Promise((resolve, reject) => {
      const unpatch = () => { reject(new Error('Plugin stopped')) }
      Dispatcher.subscribe('FM_UNPATCH_ALL', unpatch)
      observe(`.${classes.contentWrapper.contentWrapper}`, ($el) => {
        if ($el == null) return
        Dispatcher.unsubscribe('FM_UNPATCH_ALL', unpatch)
        resolve(getOwnerInstance($el))
      })
    })
  }

  async patchExpressionPicker () {
    let ExpressionPicker = null
    try {
      ExpressionPicker = await this.waitExpressionPicker()
    } catch {
      return
    }

    if (ExpressionPicker == null) {
      BdApi.Logger.error(this.meta.name, 'ExpressionPicker module not found')
      return
    }

    ExpressionPicker.forceUpdate()

    // https://github.com/BetterDiscord/BetterDiscord/blob/3b9ad9b75b6ac64e6740e9c2f1d19fd4615010c7/renderer/src/builtins/emotes/emotemenu.js
    BdApi.Patcher.after(this.meta.name, ExpressionPicker.constructor.prototype, 'render', (_, __, returnValue) => {
      const originalChildren = returnValue.props?.children?.props?.children
      if (originalChildren == null) return

      returnValue.props.children.props.children = (...args) => {
        const childrenReturn = originalChildren(...args)
        const head = BdApi.Utils.findInTree(childrenReturn, (e) => e?.role === 'tablist', { walkable: ['props', 'children', 'return', 'stateNode'] })?.children
        const body = BdApi.Utils.findInTree(childrenReturn, (e) => e?.[0]?.type === 'nav', { walkable: ['props', 'children', 'return', 'stateNode'] })
        if (head == null || body == null) return childrenReturn

        try {
          const elementType = head[0].type.type
          if (this.settings.image.enabled) head.push(this.MediaTab('image', elementType))
          if (this.settings.video.enabled) head.push(this.MediaTab('video', elementType))
          if (this.settings.audio.enabled) head.push(this.MediaTab('audio', elementType))
          if (this.settings.file.enabled) head.push(this.MediaTab('file', elementType))

          const activeMediaPickerType = EPS.useExpressionPickerStore.getState().activeView.replace('fm-', '')
          if (ALL_TYPES.includes(activeMediaPickerType)) {
            body.push(BdApi.React.createElement(MediaPicker, {
              type: activeMediaPickerType,
              settings: this.settings,
            }))
          }
        } catch (err) {
          BdApi.Logger.error(this.meta.name, 'Error in ExpressionPicker patch:', err.message ?? err)
        }

        return childrenReturn
      }
    })
  }

  // https://github.com/Strencher/BetterDiscordStuff/blob/7333c41514bb97fe509e2258abc628a2080b5cf8/InvisibleTyping/InvisibleTyping.plugin.js#L418-L437
  patchChannelTextArea () {
    BdApi.Patcher.after(this.meta.name, ChannelTextArea.type, 'render', (_, [props], returnValue) => {
      const isProfilePopout = BdApi.Utils.findInTree(returnValue, (e) => Array.isArray(e?.value) && e.value.some((v) => v === 'bite size profile popout'), { walkable: ['children', 'props'] })
      if (isProfilePopout) return

      const chatBar = BdApi.Utils.findInTree(returnValue, (e) => Array.isArray(e?.children) && e.children.some((c) => c?.props?.className?.startsWith('attachButton')), { walkable: ['children', 'props'] })
      if (!chatBar) return

      const textAreaState = BdApi.Utils.findInTree(chatBar, (e) => e?.props?.channel, { walkable: ['children'] })
      if (!textAreaState) return

      currentChannelId = SelectedChannelStore.getChannelId()
      const channel = ChannelStore.getChannel(currentChannelId)
      const perms = Permissions.can(PermissionsConstants.SEND_MESSAGES, channel)
      if (!channel.type && !perms) return

      const fmButtons = []
      if (this.settings.image.enabled && this.settings.image.showBtn) fmButtons.push(BdApi.React.createElement(MediaButton, { type: 'image', pickerType: props.type, channelId: props.channel.id }))
      if (this.settings.video.enabled && this.settings.video.showBtn) fmButtons.push(BdApi.React.createElement(MediaButton, { type: 'video', pickerType: props.type, channelId: props.channel.id }))
      if (this.settings.audio.enabled && this.settings.audio.showBtn) fmButtons.push(BdApi.React.createElement(MediaButton, { type: 'audio', pickerType: props.type, channelId: props.channel.id }))
      if (this.settings.file.enabled && this.settings.file.showBtn) fmButtons.push(BdApi.React.createElement(MediaButton, { type: 'file', pickerType: props.type, channelId: props.channel.id }))

      chatBar.children.push(...fmButtons)
      chatBar.children.forEach((b) => { if (ALL_TYPES.includes(b.props?.type)) b.key = b.props.type })

      setTimeout(() => {
        currentTextareaInput = findTextareaInput()
      }, 50)
    })
  }

  patchMedias () {
    // Videos & Audios
    if (MediaPlayerModule == null) {
      BdApi.Logger.error(this.meta.name, 'MediaPlayer module not found')
    } else {
      BdApi.Patcher.after(this.meta.name, MediaPlayerModule.prototype, 'render', ({ props }, __, returnValue) => {
        const type = returnValue.props.children[1].type === 'audio' ? 'audio' : 'video'
        if (!this.settings[type].enabled || !this.settings[type].showStar) return

        returnValue.props.children.push(BdApi.React.createElement(MediaFavButton, {
          type,
          url: cleanUrl(removeProxyUrl(props.src)),
          poster: props.poster,
          uploaded: props.fileSize != null,
          target: returnValue.props.children[1]?.ref,
        }))
      })
    }

    // Images
    if (ImageModule == null) {
      BdApi.Logger.error(this.meta.name, 'Image module not found')
    } else {
      BdApi.Patcher.after(this.meta.name, ImageModule.prototype, 'render', (_this, __, returnValue) => {
        const $image = returnValue.ref.current
        if ($image != null && $image.getElementsByClassName(classes.image.imageAccessory).length <= 0) {
          const $container = document.createElement('div')
          $container.classList.add('fm-imageAccessoryContainer')
          $image.append($container)
          const root = BdApi.ReactDOM.createRoot($container)

          const data = {
            url: returnValue.props.original,
            type: 'image'
          }
          if (data.url == null) return

          if (/\.gif($|\?|#)/i.test(data.url) || /\.webp($|\?|#)/i.test(data.url) || /\.avif($|\?|#)/i.test(data.url)) {
            data.type = 'gif'
            data.src = returnValue.props.src
          }

          if (!this.settings[data.type].enabled || !this.settings[data.type].showStar) return

          root.render(BdApi.React.createElement(MediaFavButton, {
            type: data.type,
            src: data.src,
            url: data.url,
            target: returnValue.ref,
          }))
        }
      })
    }

    // Files
    if (FileModule == null) {
      BdApi.Logger.error(this.meta.name, 'File module not found')
    } else {
      BdApi.Patcher.after(this.meta.name, FileModule, 'Z', (_, [props], returnValue) => {
        returnValue.props.children.push(BdApi.React.createElement(MediaFavButton, {
          type: 'file',
          name: getUrlName(props.fileName),
          url: cleanUrl(removeProxyUrl(props.url)),
          target: { current: document.getElementById(`message-accessories-${props.message.id}`) },
        }))
      })
    }

    // Files rendered
    if (FileRenderedModule == null) {
      BdApi.Logger.error(this.meta.name, 'FileRendered module not found')
    } else {
      BdApi.Patcher.after(this.meta.name, FileRenderedModule, 'ZP', (_, [props], returnValue) => {
        if (props.item.type !== 'PLAINTEXT_PREVIEW') return

        returnValue.props.children.push(BdApi.React.createElement(MediaFavButton, {
          type: 'file',
          name: getUrlName(props.item.originalItem.filename),
          url: cleanUrl(removeProxyUrl(props.item.originalItem.url)),
          target: { current: document.getElementById(`message-accessories-${props.message.id}`) },
        }))
      })
    }
  }

  patchClosePicker () {
    BdApi.Patcher.instead(this.meta.name, EPSModules, closeExpressionPickerKey, (_, __, originalFunction) => {
      if (canClosePicker.value) originalFunction()
      if (canClosePicker.context === 'mediabutton') canClosePicker.value = true
    })
  }

  async waitGIFPicker () {
    return new Promise((resolve, reject) => {
      const unpatch = () => { reject(new Error('Plugin stopped')) }
      Dispatcher.subscribe('FM_UNPATCH_ALL', unpatch)
      observe('#gif-picker-tab-panel', ($el) => {
        if ($el == null) return
        Dispatcher.unsubscribe('FM_UNPATCH_ALL', unpatch)
        resolve(getOwnerInstance($el))
      })
    })
  }

  async patchGIFTab () {
    let GIFPicker = null
    try {
      GIFPicker = await this.waitGIFPicker()
    } catch {
      return
    }

    if (GIFPicker == null) {
      BdApi.Logger.error(this.meta.name, 'GIFPicker module not found')
      return
    }

    BdApi.Patcher.after(this.meta.name, GIFPicker.constructor.prototype, 'renderContent', (_this, _, returnValue) => {
      if (!this.settings.gif.enabled || _this.state.resultType !== 'Favorites') return
      if (!Array.isArray(returnValue.props.data)) return
      const favorites = [...returnValue.props.data].reverse()
      const savedGIFs = loadData('gif', { medias: [] })
      const newGIFs = []
      // keep only favorited GIFs
      Promise.allSettled(favorites.map(async (props) => {
        MediaFavButton.getMediaDataFromProps({ ...props, type: 'gif' }).then((data) => {
          const foundGIF = savedGIFs.medias.find((g) => MediaFavButton.checkSameUrl(g.url, data.url))
          newGIFs.push(foundGIF ?? data)
        }).catch((err) => {
          BdApi.Logger.warn(this.meta.name, err.message)
        })
      })).then(() => {
        savedGIFs.medias = newGIFs
        saveData('gif', savedGIFs)
      })

      returnValue.type = MediaPicker
      returnValue.props = {
        type: 'gif',
        settings: this.settings,
      }
    })
  }

  patchMessageContextMenu () {
    this.contextMenu = BdApi.ContextMenu.patch('message', (returnValue, props) => {
      if (props == null || returnValue.props?.children?.find(e => e?.props?.id === 'favoriteMedia')) return

      const getMediaContextMenuItems = () => {
        if (props.target == null) return []

        let type = null
        if (props.target.tagName === 'IMG' || (props.target.tagName === 'A' && props.target.nextSibling?.firstChild?.firstChild?.tagName === 'IMG')) type = 'image'
        else if (props.target.tagName === 'A' && props.target.nextSibling?.firstChild?.firstChild?.tagName === 'VIDEO') type = 'gif'
        else if (props.target.parentElement.firstElementChild.tagName === 'VIDEO') type = 'video'
        else if (props.target.closest('[class*="wrapperAudio_"]')) {
          type = 'audio'
          props.target = props.target.closest('[class*="wrapperAudio_"]')
        } else if (props.target.closest('[class*="attachment_"]')) {
          type = 'file'
          props.target = props.target.closest('[class*="attachment_"]')
        } else if (props.target.closest('[class*="mosaicItemContent_"]')?.querySelector('a[class*="fileNameLink_"],a[class*="downloadSection_"]')) {
          type = 'file'
          props.target = props.target.closest('[class*="mosaicItemContent_"]')
        }
        if (type == null) return []

        const data = {
          type,
          url: props.target.getAttribute('href') ?? props.target.getAttribute('src'),
          poster: null,
          favorited: undefined,
          target: { current: props.target },
        }

        if (data.url?.split('?')[0].endsWith('.gif')) data.type = 'gif'
        if (data.type === 'image') {
          data.url = data.url ?? props.target.src
        } else if (data.type === 'gif') {
          data.src = props.target.nextSibling.firstChild?.src ?? props.target.nextSibling.firstChild?.firstChild?.src
        } else if (data.type === 'video') {
          data.url = props.target.parentElement.firstElementChild.src
          data.poster = props.target.parentElement.firstElementChild.poster
        } else if (data.type === 'audio') {
          data.url = props.target.querySelector('audio').firstElementChild?.src
        } else if (data.type === 'file') {
          data.url = props.target.querySelector('a[class*="fileNameLink_"],a[class*="downloadSection_"]').href
        }

        data.url = cleanUrl(removeProxyUrl(data.url))
        data.favorited = this.isFavorited(data.type, data.url)
        const menuItems = [{
          id: `media-${data.favorited ? 'un' : ''}favorite`,
          label: data.favorited ? getDiscordIntl('GIF_TOOLTIP_REMOVE_FROM_FAVORITES') : getDiscordIntl('GIF_TOOLTIP_ADD_TO_FAVORITES'),
          icon: () => BdApi.React.createElement(StarSVG, { filled: !data.favorited }),
          action: async () => {
            const switchFavorite = data.favorited ? MediaFavButton.unfavoriteMedia : MediaFavButton.favoriteMedia
            switchFavorite(data).then(() => {
              Dispatcher.dispatch({ type: 'FM_FAVORITE_MEDIA', url: data.url })
            }).catch((err) => {
              BdApi.Logger.error(this.meta.name, err.message ?? err)
            })
          },
        }]
        menuItems.push({
          id: 'media-copy-url',
          label: getDiscordIntl('COPY_MEDIA_LINK'),
          action: () => ElectronModule.copy(data.url),
        })
        if (data.message != null) {
          menuItems.push({
            id: 'media-copy-message',
            label: getDiscordIntl('COPY_MESSAGE_LINK'),
            action: () => ElectronModule.copy(data.message ?? ''),
          })
        }
        if (data.source != null) {
          menuItems.push({
            id: 'media-copy-source',
            label: plugin.instance.strings.media.copySource,
            action: () => ElectronModule.copy(data.source ?? ''),
          })
        }
        menuItems.push({
          id: 'media-download',
          label: getDiscordIntl('DOWNLOAD'),
          action: () => {
            const media = { url: data.url, name: getUrlName(data.url) }
            MediaPicker.downloadMedia(media, data.type)
          },
        })
        if (data.favorited) {
          const medias = loadData(data.type, { medias: [] }).medias
          const mediaId = medias.findIndex(m => MediaFavButton.checkSameUrl(m.url, data.url))
          const categoryId = medias[mediaId]?.category_id
          const categories = loadData(data.type, { categories: [] }).categories
          const category = categories.find((c) => c.id === categoryId)
          const buttonCategories = categories.filter(c => categoryId != null ? c.id !== categoryId : true)
          if (buttonCategories.length) {
            const moveAddToItems = []
            if (MediaPicker.getMediaCategoryId(data.type, mediaId) != null) {
              moveAddToItems.push({
                id: 'media-removeFrom',
                label: `${plugin.instance.strings.media.removeFrom} (${category?.name})`,
                danger: true,
                action: () => MediaPicker.removeMediaCategory(data.type, mediaId),
              })
            }
            moveAddToItems.push(...buttonCategories.map(c => ({
              id: `category-edit-${c.id}`,
              label: c.name,
              key: c.id,
              action: () => {
                MediaPicker.changeMediaCategory(data.type, data.url, c.id)
              },
              render: () => BdApi.React.createElement(CategoryMenuItem, { ...c, key: c.id }),
            })))
            menuItems.push({
              id: 'media-moveAddTo',
              label: categoryId !== undefined ? plugin.instance.strings.media.moveTo : plugin.instance.strings.media.addTo,
              type: 'submenu',
              items: moveAddToItems,
            })
          }
        } else {
          const categories = loadData(data.type, { categories: [] }).categories
          if (categories.length) {
            menuItems.push({
              id: 'media-addTo',
              label: plugin.instance.strings.media.addTo,
              type: 'submenu',
              items: categories.map(c => ({
                id: `category-name-${c.id}`,
                label: c.name,
                key: c.id,
                action: async () => {
                  MediaFavButton.favoriteMedia(data).then(() => {
                    MediaPicker.changeMediaCategory(data.type, data.url, c.id)
                    Dispatcher.dispatch({ type: 'FM_FAVORITE_MEDIA', url: data.url })
                  }).catch((err) => {
                    BdApi.Logger.error(this.meta.name, err.message ?? err)
                  })
                },
                render: () => BdApi.React.createElement(CategoryMenuItem, { ...c, key: c.id }),
              })),
            })
          }
        }
        return menuItems
      }

      const getCategoryContextMenuItems = () => {
        const getCategories = (type) => loadData(type, { categories: [] }).categories
        const mediaTypes = ['gif', 'image', 'video', 'audio']
        return [
          {
            id: 'category-list',
            label: plugin.instance.strings.category.list,
            type: 'submenu',
            items: mediaTypes.map((type) => ({
              id: `category-create-${type}`,
              label: type === 'gif' ? getDiscordIntl('GIF') : plugin.instance.strings.tabName[type],
              type: 'submenu',
              items: (() => {
                const items = [{
                  id: `category-create-${type}`,
                  label: plugin.instance.strings.category.create,
                  action: () => MediaPicker.openCategoryModal(type, 'create'),
                }]
                if (getCategories(type).length > 0) {
                  items.push({
                    id: 'category-edit',
                    label: plugin.instance.strings.category.edit,
                    type: 'submenu',
                    items: getCategories(type).map((c) => ({
                      id: `category-edit-${c.id}`,
                      label: c.name,
                      key: c.id,
                      action: () => MediaPicker.openCategoryModal(type, 'edit', { name: c.name, color: c.color, id: c.id }),
                      render: () => BdApi.React.createElement(CategoryMenuItem, { ...c, key: c.id }),
                    })),
                  }, {
                    id: 'category-delete',
                    label: plugin.instance.strings.category.delete,
                    type: 'submenu',
                    danger: true,
                    items: getCategories(type).map((c) => ({
                      id: `category-delete-${c.id}`,
                      label: c.name,
                      key: c.id,
                      action: () => {
                        const deleteCategories = () => deleteCategory(type, c.id)
                        if (MediaPicker.categoryHasSubcategories(type, c.id)) {
                          BdApi.UI.showConfirmationModal(plugin.instance.strings.category.delete, plugin.instance.strings.category.deleteConfirm, {
                            danger: true,
                            onConfirm: () => deleteCategories(),
                            confirmText: plugin.instance.strings.category.delete,
                          })
                        } else {
                          deleteCategories()
                        }
                      },
                      render: () => BdApi.React.createElement(CategoryMenuItem, { ...c, key: c.id }),
                    })),
                  })
                }
                return items
              })(),
            })),
          },
        ]
      }

      const separator = BdApi.ContextMenu.buildItem({ type: 'separator' })
      const mediaItems = getMediaContextMenuItems()
      const categoryItems = getCategoryContextMenuItems()
      const menuItems = [...mediaItems]
      menuItems.push(...categoryItems)
      const fmContextMenu = BdApi.ContextMenu.buildItem({
        id: 'favoriteMediaMenu',
        label: this.meta.name,
        type: 'submenu',
        items: menuItems,
      })
      const fmIndex = returnValue.props.children.findIndex((i) => i?.props?.children?.find?.((j) => j?.props?.id === 'forward'))
      if (fmIndex > -1) returnValue.props.children.splice(fmIndex, 0, separator, fmContextMenu)
      else returnValue.props.children.push(separator, fmContextMenu)
    })
  }

  isFavorited (type, url) {
    return loadData(type, { medias: [] }).medias.find((e) => MediaFavButton.checkSameUrl(e.url, url)) !== undefined
  }

  get css () {
    return `
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
      .${classes.image.imageAccessory}:not(.fm-favBtn):has(+ .fm-favBtn) {
        display: none;
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
      .show-controls:hover,
      .show-controls.active {
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
      .${classes.image.embedWrapper}:focus-within .${classes.gif.gifFavoriteButton1},
      .${classes.image.embedWrapper}:hover .${classes.gif.gifFavoriteButton1},
      .${classes.visual.nonVisualMediaItemContainer}:hover .${classes.gif.gifFavoriteButton1} {
        opacity: 0;
        -webkit-transform: unset;
        transform: unset;
      }
      .${classes.image.imageWrapper}:focus-within .${classes.gif.gifFavoriteButton1},
      .${classes.image.imageWrapper}:hover .${classes.gif.gifFavoriteButton1},
      .${classes.visual.nonVisualMediaItemContainer}:hover .${classes.gif.gifFavoriteButton1} {
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
      .fm-header .fm-headerRight {
        height: 100%;
        display: flex;
        align-items: center;
        margin-left: 4px;
        float: right;
      }
      .fm-header .fm-mediasCounter {
        padding: 6px 7px;
      }
      .fm-pageControl {
        width: 100%;
        position: absolute;
        display: flex;
        justify-content: center;
        bottom: 0;
        pointer-events: none;
        z-index: 10;
      }
      .fm-pageControl > div {
        width: auto;
        margin-top: 0;
        background-color: var(--background-secondary);
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        pointer-events: all;
      }
      .fm-pageControl > div > nav {
        padding: 8px 0;
        height: 28px;
      }
      .fm-databasePanel {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding-top: 16px;
      }
      .fm-databasePanel > * {
        height: 100%;
        width: 100%;
      }
      .fm-databasePanel > button {
        width: fit-content;
      }
      .fm-database {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .fm-stats {
        display: flex;
        justify-content: space-between;
      }
      .fm-stats .fm-statsLines {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .fm-stats .fm-statsLines .fm-statsLine {
        display: flex;
        gap: 8px;
      }
      .fm-stats .fm-statsLines .fm-statsCount {
        font-weight: bold;
      }
      .fm-databaseActions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .fm-buttonIcon {
        display: flex;
        border-radius: 4px;
        padding: 2px;
      }
      .fm-databaseFetchMediasProgress {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 24px;
      }
      .${classes.category.categoryText} {
        padding: 4px;
      }
      .${classes.category.categoryName} {
        text-align: center;
        min-width: 0;
      }
      .${classes.category.categoryName} > div {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .fm-importPanel {
        display: flex;
        flex-direction: column;
        gap: 32px;
      }
      .fm-importRecap {
        display: flex;
        gap: 48px;
      }
      .fm-importLines {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .fm-importLines > :first-child {
        margin-bottom: 8px;
      }
      .fm-importLabel {
        font-weight: bold;
      }
      .fm-importValue {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .fm-importValue > input[type="checkbox"] {
        width: 20px;
        height: 20px;
        margin: 0;
      }
    `
  }

  get changelogs () {
    return []
  }

  get defaultSettings () {
    return [
      {
        type: 'switch',
        id: 'hideUnsortedMedias',
        name: 'Hide medias',
        note: 'Hide medias in the picker tab which are in a category',
        value: true,
      },
      {
        type: 'switch',
        id: 'hideThumbnail',
        name: 'Hide thumbnail',
        note: 'Show the category color instead of a random media thumbnail',
        value: false,
      },
      {
        type: 'switch',
        id: 'allowCaching',
        name: 'Allow medias preview caching',
        note: 'Uses local offline database to cache medias preview',
        value: true,
      },
      {
        type: 'slider',
        id: 'mediaVolume',
        name: 'Preview media volume',
        note: 'Volume of the previews medias on the picker tab',
        min: 0,
        max: 100,
        markers: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        value: 10,
      },
      {
        type: 'dropdown',
        id: 'maxMediasPerPage',
        name: 'Max medias per page',
        note: 'The maximum amount of displayed medias per page in the picker tab',
        value: 50,
        options: [
          {
            label: '20',
            value: 20,
          },
          {
            label: '50',
            value: 50,
          },
          {
            label: '100',
            value: 100,
          },
        ],
      },
      {
        type: 'category',
        id: 'gif',
        name: 'GIFs settings',
        collapsible: true,
        shown: false,
        settings: [
          {
            type: 'switch',
            id: 'enabled',
            name: 'General',
            note: 'Replace Discord GIFs tab',
            value: true,
          },
          {
            type: 'switch',
            id: 'alwaysSendInstantly',
            name: 'Instant send',
            note: 'Send instantly medias links and/or files',
            value: true,
          },
          {
            type: 'switch',
            id: 'alwaysUploadFile',
            name: 'Always upload as file',
            note: 'Uploads media as file instead of sending a link',
            value: false,
          },
        ],
      },
      {
        type: 'category',
        id: 'image',
        name: 'Images settings',
        collapsible: true,
        shown: false,
        settings: [
          {
            type: 'switch',
            id: 'enabled',
            name: 'General',
            note: 'Enable this type of media',
            value: true,
          },
          {
            type: 'switch',
            id: 'showBtn',
            name: 'Button',
            note: 'Show button on chat',
            value: true,
          },
          {
            type: 'switch',
            id: 'showStar',
            name: 'Star',
            note: 'Show favorite star on medias',
            value: true,
          },
          {
            type: 'switch',
            id: 'alwaysSendInstantly',
            name: 'Instant send',
            note: 'Send instantly medias links and/or files',
            value: true,
          },
          {
            type: 'switch',
            id: 'alwaysUploadFile',
            name: 'Upload',
            note: 'Uploads media as file instead of sending a link',
            value: false,
          },
        ],
      },
      {
        type: 'category',
        id: 'video',
        name: 'Videos settings',
        collapsible: true,
        shown: false,
        settings: [
          {
            type: 'switch',
            id: 'enabled',
            name: 'General',
            note: 'Enable this type of media',
            value: true,
          },
          {
            type: 'switch',
            id: 'showBtn',
            name: 'Button',
            note: 'Show button on chat',
            value: true,
          },
          {
            type: 'switch',
            id: 'showStar',
            name: 'Star',
            note: 'Show favorite star on medias',
            value: true,
          },
          {
            type: 'switch',
            id: 'alwaysSendInstantly',
            name: 'Instant send',
            note: 'Send instantly medias links and/or files',
            value: true,
          },
          {
            type: 'switch',
            id: 'alwaysUploadFile',
            name: 'Upload',
            note: 'Uploads media as file instead of sending a link',
            value: false,
          },
        ],
      },
      {
        type: 'category',
        id: 'audio',
        name: 'Audios settings',
        collapsible: true,
        shown: false,
        settings: [
          {
            type: 'switch',
            id: 'enabled',
            name: 'General',
            note: 'Enable this type of media',
            value: true,
          },
          {
            type: 'switch',
            id: 'showBtn',
            name: 'Button',
            note: 'Show button on chat',
            value: true,
          },
          {
            type: 'switch',
            id: 'showStar',
            name: 'Star',
            note: 'Show favorite star on medias',
            value: true,
          },
        ],
      },
      {
        type: 'category',
        id: 'file',
        name: 'Files settings',
        collapsible: true,
        shown: false,
        settings: [
          {
            type: 'switch',
            id: 'enabled',
            name: 'General',
            note: 'Enable this type of media',
            value: true,
          },
          {
            type: 'switch',
            id: 'showBtn',
            name: 'Button',
            note: 'Show button on chat',
            value: true,
          },
          {
            type: 'switch',
            id: 'showStar',
            name: 'Star',
            note: 'Show favorite star on medias',
            value: true,
          },
          {
            type: 'switch',
            id: 'alwaysSendInstantly',
            name: 'Instant send',
            note: 'Send instantly medias links and/or files',
            value: true,
          },
          {
            type: 'switch',
            id: 'alwaysUploadFile',
            name: 'Upload',
            note: 'Uploads media as file instead of sending a link',
            value: false,
          },
        ],
      },
    ]
  }

  get translations () {
    return {
      bg: { // Bulgarian
        tabName: {
          image: 'Изображения',
          video: 'Видео',
          audio: 'Аудио',
          file: 'Файл',
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
          refreshUrls: 'Опресняване на URL адресите',
          placeholder: 'Име на категория',
          move: 'Ход',
          moveNext: 'След',
          movePrevious: 'Преди',
          color: 'Цвят',
          copyColor: 'Копиране на цвят',
          setThumbnail: 'Задайте като миниатюра',
          unsetThumbnail: 'Премахване на миниатюра',
          error: {
            needName: 'Името не може да бъде празно',
            invalidNameLength: 'Името трябва да съдържа максимум 20 знака',
            wrongColor: 'Цветът е невалиден',
            nameExists: 'това име вече съществува',
            invalidCategory: 'Категорията не съществува',
            download: 'Изтеглянето на мултимедия не бе успешно',
          },
          success: {
            create: 'Категорията е създадена!',
            delete: 'Категорията е изтрита!',
            edit: 'Категорията е променена!',
            move: 'Категорията е преместена!',
            download: 'Медиите са качени!',
            setThumbnail: 'Комплект миниатюри за категория!',
            unsetThumbnail: 'Премахната миниатюра за категорията!',
            refreshUrls: 'URL адресите са обновени!',
          },
          emptyHint: 'Щракнете с десния бутон, за да създадете категория!',
        },
        media: {
          emptyHint: {
            image: 'Кликнете върху звездата в ъгъла на изображението, за да го поставите в любимите си',
            video: 'Кликнете върху звездата в ъгъла на видеоклипа, за да го поставите в любимите си',
            audio: 'Кликнете върху звездата в ъгъла на звука, за да го поставите в любимите си',
            file: "Кликнете върху ' звезда в ъгъла ' файл, за да го поставите в любимите си",
          },
          addTo: 'Добавяне',
          moveTo: 'Ход',
          removeFrom: 'Премахване от категорията',
          copySource: 'Копиране на медийния източник',
          upload: {
            title: 'Качване',
            normal: 'Нормално',
            spoiler: 'Спойлер',
          },
          success: {
            move: {
              gif: 'GIF е преместен!',
              image: 'Изображението е преместено!',
              video: 'Видеото е преместено!',
              audio: 'Аудиото е преместено!',
              file: 'Файлът е преместен!',
            },
            remove: {
              gif: 'GIF-ът е премахнат от категориите!',
              image: 'Изображението е премахнато от категориите!',
              video: 'Видеото е премахнато от категориите!',
              audio: 'Аудиото е премахнато от категориите!',
              file: 'Файлът е премахнат от категориите!',
            },
            download: {
              gif: 'GIF е качен!',
              image: 'Изображението е качено!',
              video: 'Видеото е качено!',
              audio: 'Аудиото е изтеглено!',
              file: 'Файлът е изтеглен!',
            },
          },
          error: {
            download: {
              gif: 'Неуспешно изтегляне на GIF',
              image: 'Качването на изображението не бе успешно',
              video: 'Изтеглянето на видеоклипа не бе успешно',
              audio: 'Изтеглянето на аудио не бе успешно',
              file: 'Неуспешно изтегляне на файла',
            },
          },
          controls: {
            show: 'Показване на поръчки',
            hide: 'Скриване на поръчките',
          },
          placeholder: {
            gif: 'Име на GIF',
            image: 'Име на изображението',
            video: 'Име на видеоклипа',
            audio: 'Име на звука',
            file: 'Име на файл',
          },
        },
        searchItem: {
          gif: 'Търсете GIF файлове или категории',
          image: 'Търсене на изображения или категории',
          video: 'Търсете видеоклипове или категории',
          audio: 'Търсене на аудио или категории',
          file: 'Търсене на файлове или категории',
        },
        import: {
          panel: 'Импортиране на медии',
          label: {
            types: 'Видове',
            medias: 'Медия',
            categories: 'Категории',
          },
          buttonImport: 'Импортиране',
          success: 'Медиите са внесени!',
          error: "Неизправност по време на ' импортиране на медии",
        },
        cache: {
          panel: 'Локална база данни',
          total: 'Обща сума :',
          size: 'размер:',
          clear: {
            confirm: 'Наистина ли искате да изпразните базата данни?',
            button: 'Празна база данни',
            success: 'Базата данни е изпразнена!',
            error: 'Неуспешно изхвърляне на базата данни',
          },
          cacheAll: {
            button: 'Кеширайте всички медии',
            confirm: 'Искате ли да кеширате всички медии?',
            noMedia: "Той ' няма медия за кеширане",
            success: 'Медиите са кеширани!',
            error: 'Грешка при кеширане на медия',
          },
          refreshButton: 'Опресняване',
        },
        mediasCounter: 'Брой медии',
        settings: {
          hideUnsortedMedias: {
            name: 'Скриване на мултимедия',
            note: "Скриване на медиите от ' раздел, които не са категоризирани",
          },
          hideThumbnail: {
            name: 'Скриване на миниатюри',
            note: "Показва цвета на категорията вместо ' произволна миниатюра",
          },
          allowCaching: {
            name: "Разрешаване на кеширане на ' преглед на медиите",
            note: "Използва локален офлайн кеш за кеширане на файлове ' преглед на медиите",
          },
          mediaVolume: {
            name: 'Мултимедия',
            note: "Сила на звука при възпроизвеждане на мултимедия в 'раздел",
          },
          maxMediasPerPage: {
            name: 'Максимален брой медии на страница',
            note: "Максималният брой медии, показвани на страница в ' раздел",
          },
          position: {
            name: 'Позиция на бутона',
          },
          gif: {
            name: 'GIF настройки',
            enabled: {
              name: 'Общ',
              note: "Заменя ' Раздел GIF на Discord",
            },
            alwaysSendInstantly: {
              name: 'Незабавна доставка',
              note: 'Незабавно изпратете медийната връзка или файл',
            },
            alwaysUploadFile: {
              name: 'Винаги качвайте като файл',
              note: "Качете мултимедия като файл, а не ' изпрати линк",
            },
          },
          image: {
            name: 'Настройки на изображението',
            enabled: {
              name: 'Общ',
              note: 'Активирайте този тип медия',
            },
            showBtn: {
              name: 'Бутон',
              note: 'Показване на бутона в лентата за чат',
            },
            showStar: {
              name: 'звезда',
              note: "Показва л ' звездни фаворити в медиите",
            },
            alwaysSendInstantly: {
              name: 'Незабавна доставка',
              note: 'Незабавно изпратете медийната връзка или файл',
            },
            alwaysUploadFile: {
              name: 'Винаги качвайте като файл',
              note: "Качете мултимедия като файл, а не ' изпрати линк",
            },
          },
          video: {
            name: 'Видео настройки',
            enabled: {
              name: 'Общ',
              note: 'Активирайте този тип медия',
            },
            showBtn: {
              name: 'Бутон',
              note: 'Показване на бутона в лентата за чат',
            },
            showStar: {
              name: 'звезда',
              note: "Показва л ' звездни фаворити в медиите",
            },
            alwaysSendInstantly: {
              name: 'Незабавна доставка',
              note: 'Незабавно изпратете медийната връзка или файл',
            },
            alwaysUploadFile: {
              name: 'Винаги качвайте като файл',
              note: "Качете мултимедия като файл, а не ' изпрати линк",
            },
          },
          audio: {
            name: 'Аудио настройки',
            enabled: {
              name: 'Общ',
              note: 'Активирайте този тип медия',
            },
            showBtn: {
              name: 'Бутон',
              note: 'Показване на бутона в лентата за чат',
            },
            showStar: {
              name: 'звезда',
              note: "Показва л ' звездни фаворити в медиите",
            },
          },
          file: {
            name: 'Настройки на файла',
            enabled: {
              name: 'Общ',
              note: 'Активирайте този тип медия',
            },
            showBtn: {
              name: 'Бутон',
              note: 'Показване на бутона в лентата за чат',
            },
            showStar: {
              name: 'звезда',
              note: "Показва л ' звездни фаворити в медиите",
            },
            alwaysSendInstantly: {
              name: 'Незабавна доставка',
              note: 'Незабавно изпратете медийната връзка или файл',
            },
            alwaysUploadFile: {
              name: 'Винаги качвайте като файл',
              note: "Качете мултимедия като файл, а не ' изпрати линк",
            },
          },
          panel: 'Настройки на плъгина',
        },
      },
      cs: { // Czech
        tabName: {
          image: 'Obrázek',
          video: 'Video',
          audio: 'Zvuk',
          file: 'Soubor',
        },
        create: 'Vytvořit',
        category: {
          list: 'Kategorie',
          unsorted: 'Neřazeno',
          create: 'Vytvořte kategorii',
          edit: 'Upravit kategorii',
          delete: 'Smazat kategorii',
          deleteConfirm: 'Tato kategorie obsahuje podkategorie. Všechny budou smazány. Opravdu chcete smazat kategorie?',
          download: 'Stáhněte si média',
          refreshUrls: 'Obnovit adresy URL',
          placeholder: 'Název Kategorie',
          move: 'Hýbat se',
          moveNext: 'Po',
          movePrevious: 'Před',
          color: 'Barva',
          copyColor: 'Kopírovat barvu',
          setThumbnail: 'Nastavit jako miniaturu',
          unsetThumbnail: 'Odebrat miniaturu',
          error: {
            needName: 'Název nemůže být prázdný',
            invalidNameLength: 'Název musí obsahovat maximálně 20 znaků',
            wrongColor: 'Barva je neplatná',
            nameExists: 'tento název již existuje',
            invalidCategory: 'Kategorie neexistuje',
            download: 'Stažení média se nezdařilo',
          },
          success: {
            create: 'Kategorie byla vytvořena!',
            delete: 'Kategorie byla smazána!',
            edit: 'Kategorie byla upravena!',
            move: 'Kategorie byla přesunuta!',
            download: 'Média byla nahrána!',
            setThumbnail: 'Sada náhledů pro kategorii!',
            unsetThumbnail: 'Miniatura kategorie odstraněna!',
            refreshUrls: 'Adresy URL byly aktualizovány!',
          },
          emptyHint: 'Kliknutím pravým tlačítkem vytvoříte kategorii!',
        },
        media: {
          emptyHint: {
            image: 'Kliknutím na hvězdičku v rohu obrázku jej přidáte mezi oblíbené',
            video: 'Kliknutím na hvězdičku v rohu videa je přidáte mezi oblíbené',
            audio: 'Kliknutím na hvězdičku v rohu zvukové nahrávky ji přidáte mezi oblíbené',
            file: 'Kliknutím na hvězdičku v rohu souboru jej přidáte mezi oblíbené',
          },
          addTo: 'Přidat',
          moveTo: 'Hýbat se',
          removeFrom: 'Odebrat z kategorie',
          copySource: 'Kopírovat zdroj médií',
          upload: {
            title: 'nahrát',
            normal: 'Normální',
            spoiler: 'Spoilery',
          },
          success: {
            move: {
              gif: 'GIF byl přesunut!',
              image: 'Obrázek byl přesunut!',
              video: 'Video bylo přesunuto!',
              audio: 'Zvuk byl přesunut!',
              file: 'Soubor byl přesunut!',
            },
            remove: {
              gif: 'GIF byl odstraněn z kategorií!',
              image: 'Obrázek byl odstraněn z kategorií!',
              video: 'Video bylo odstraněno z kategorií!',
              audio: 'Zvuk byl odstraněn z kategorií!',
              file: 'Soubor byl odstraněn z kategorií!',
            },
            download: {
              gif: 'GIF byl nahrán!',
              image: 'Obrázek byl nahrán!',
              video: 'Video bylo nahráno!',
              audio: 'Zvuk byl nahrán!',
              file: 'Soubor byl stažen!',
            },
          },
          error: {
            download: {
              gif: 'Stažení GIF se nezdařilo',
              image: 'Nahrání obrázku se nezdařilo',
              video: 'Stažení videa se nezdařilo',
              audio: 'Stažení zvuku se nezdařilo',
              file: 'Stažení souboru se nezdařilo',
            },
          },
          controls: {
            show: 'Zobrazit objednávky',
            hide: 'Skrýt příkazy',
          },
          placeholder: {
            gif: 'Název GIF',
            image: 'Název obrázku',
            video: 'Název videa',
            audio: 'Název zvuku',
            file: 'Název souboru',
          },
        },
        searchItem: {
          gif: 'Vyhledávejte GIFy nebo kategorie',
          image: 'Vyhledávejte obrázky nebo kategorie',
          video: 'Hledejte videa nebo kategorie',
          audio: 'Vyhledávejte audia nebo kategorie',
          file: 'Vyhledávejte soubory nebo kategorie',
        },
        import: {
          panel: 'Import médií',
          label: {
            types: 'Typy',
            medias: 'Média',
            categories: 'Kategorie',
          },
          buttonImport: 'Import',
          success: 'Média byla importována!',
          error: 'Import média se nezdařil',
        },
        cache: {
          panel: 'Lokální databáze',
          total: 'Celkem:',
          size: 'Velikost:',
          clear: {
            confirm: 'Opravdu chcete vyprázdnit databázi?',
            button: 'Prázdná databáze',
            success: 'Databáze byla vyprázdněna!',
            error: 'Nepodařilo se vypsat databázi',
          },
          cacheAll: {
            button: 'Uložte všechna média do mezipaměti',
            confirm: 'Chcete uložit do mezipaměti všechna média?',
            noMedia: 'Neexistují žádná média pro ukládání do mezipaměti',
            success: 'Média byla uložena do mezipaměti!',
            error: 'Selhání při ukládání médií do mezipaměti',
          },
          refreshButton: 'Obnovit',
        },
        mediasCounter: 'Počet médií',
        settings: {
          hideUnsortedMedias: {
            name: 'Skrýt média',
            note: 'Skrýt média na kartě, která nejsou zařazena do kategorie',
          },
          hideThumbnail: {
            name: 'Skrýt miniatury',
            note: 'Zobrazuje barvu kategorie namísto náhodné miniatury',
          },
          allowCaching: {
            name: 'Povolit ukládání náhledu médií do mezipaměti',
            note: 'vyrovnávací paměti náhledu médií používá místní offline mezipaměť',
          },
          mediaVolume: {
            name: 'Hlasitost médií',
            note: 'Hlasitost přehrávání médií v tab',
          },
          maxMediasPerPage: {
            name: 'Maximální počet médií na stránku',
            note: 'Maximální počet médií zobrazených na stránce na kartě',
          },
          position: {
            name: 'Pozice tlačítka',
          },
          gif: {
            name: 'Nastavení GIF',
            enabled: {
              name: 'Všeobecné',
              note: 'Nahrazuje kartu GIF aplikace Discord',
            },
            alwaysSendInstantly: {
              name: 'Okamžité dodání',
              note: 'Okamžitě odešlete odkaz na médium nebo soubor',
            },
            alwaysUploadFile: {
              name: 'Vždy nahrávat jako soubor',
              note: 'Nahrajte média jako soubor, nikoli posílejte odkaz',
            },
          },
          image: {
            name: 'Nastavení obrazu',
            enabled: {
              name: 'Všeobecné',
              note: 'Povolit tento typ média',
            },
            showBtn: {
              name: 'Knoflík',
              note: 'Zobrazit tlačítko na liště chatu',
            },
            showStar: {
              name: 'Hvězda',
              note: 'Zobrazuje oblíbenou hvězdu v médiích',
            },
            alwaysSendInstantly: {
              name: 'Okamžité dodání',
              note: 'Okamžitě odešlete odkaz na médium nebo soubor',
            },
            alwaysUploadFile: {
              name: 'Vždy nahrávat jako soubor',
              note: 'Nahrajte média jako soubor, nikoli posílejte odkaz',
            },
          },
          video: {
            name: 'Nastavení videa',
            enabled: {
              name: 'Všeobecné',
              note: 'Povolit tento typ média',
            },
            showBtn: {
              name: 'Knoflík',
              note: 'Zobrazit tlačítko na liště chatu',
            },
            showStar: {
              name: 'Hvězda',
              note: 'Zobrazuje oblíbenou hvězdu v médiích',
            },
            alwaysSendInstantly: {
              name: 'Okamžité dodání',
              note: 'Okamžitě odešlete odkaz na médium nebo soubor',
            },
            alwaysUploadFile: {
              name: 'Vždy nahrávat jako soubor',
              note: 'Nahrajte média jako soubor, nikoli posílejte odkaz',
            },
          },
          audio: {
            name: 'Nastavení zvuku',
            enabled: {
              name: 'Všeobecné',
              note: 'Povolit tento typ média',
            },
            showBtn: {
              name: 'Knoflík',
              note: 'Zobrazit tlačítko na liště chatu',
            },
            showStar: {
              name: 'Hvězda',
              note: 'Zobrazuje oblíbenou hvězdu v médiích',
            },
          },
          file: {
            name: 'Nastavení souboru',
            enabled: {
              name: 'Všeobecné',
              note: 'Povolit tento typ média',
            },
            showBtn: {
              name: 'Knoflík',
              note: 'Zobrazit tlačítko na liště chatu',
            },
            showStar: {
              name: 'Hvězda',
              note: 'Zobrazuje oblíbenou hvězdu v médiích',
            },
            alwaysSendInstantly: {
              name: 'Okamžité dodání',
              note: 'Okamžitě odešlete odkaz na médium nebo soubor',
            },
            alwaysUploadFile: {
              name: 'Vždy nahrávat jako soubor',
              note: 'Nahrajte média jako soubor, nikoli posílejte odkaz',
            },
          },
          panel: 'Nastavení pluginu',
        },
      },
      da: { // Danish
        tabName: {
          image: 'Billede',
          video: 'Video',
          audio: 'Lyd',
          file: 'Fil',
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
          refreshUrls: 'Opdater URL\'er',
          placeholder: 'Kategorinavn',
          move: 'Bevæge sig',
          moveNext: 'Efter',
          movePrevious: 'Før',
          color: 'Farve',
          copyColor: 'Kopier farve',
          setThumbnail: 'Indstil som thumbnail',
          unsetThumbnail: 'Fjern thumbnail',
          error: {
            needName: 'Navnet kan ikke være tomt',
            invalidNameLength: 'Navnet skal maksimalt indeholde 20 tegn',
            wrongColor: 'Farven er ugyldig',
            nameExists: 'dette navn findes allerede',
            invalidCategory: 'Kategorien findes ikke',
            download: 'Kunne ikke downloade medier',
          },
          success: {
            create: 'Kategorien er oprettet!',
            delete: 'Kategorien er blevet slettet!',
            edit: 'Kategorien er blevet ændret!',
            move: 'Kategorien er flyttet!',
            download: 'Medierne er blevet uploadet!',
            setThumbnail: 'Miniature sæt for kategori!',
            unsetThumbnail: 'Thumbnail fjernet for kategorien!',
            refreshUrls: 'URL\'er opdateret!',
          },
          emptyHint: 'Højreklik for at oprette en kategori!',
        },
        media: {
          emptyHint: {
            image: 'Klik på stjernen i hjørnet af et billede for at placere det i dine favoritter',
            video: 'Klik på stjernen i hjørnet af en video for at placere den i dine favoritter',
            audio: 'Klik på stjernen i hjørnet af en lyd for at placere den i dine favoritter',
            file: 'Klik på stjernen i hjørnet af en fil for at tilføje den til dine favoritter',
          },
          addTo: 'Tilføje',
          moveTo: 'Bevæge sig',
          removeFrom: 'Fjern fra kategori',
          copySource: 'Kopier mediekilde',
          upload: {
            title: 'Upload',
            normal: 'Normal',
            spoiler: 'Spoiler',
          },
          success: {
            move: {
              gif: 'GIF\'en er blevet flyttet!',
              image: 'Billedet er flyttet!',
              video: 'Videoen er flyttet!',
              audio: 'Lyden er flyttet!',
              file: 'Filen er blevet flyttet!',
            },
            remove: {
              gif: 'GIF\'en er blevet fjernet fra kategorierne!',
              image: 'Billedet er fjernet fra kategorierne!',
              video: 'Videoen er fjernet fra kategorierne!',
              audio: 'Lyd er fjernet fra kategorier!',
              file: 'Filen er blevet fjernet fra kategorierne!',
            },
            download: {
              gif: 'GIF\'en er blevet uploadet!',
              image: 'Billedet er uploadet!',
              video: 'Videoen er blevet uploadet!',
              audio: 'Lyden er downloadet!',
              file: 'Filen er blevet downloadet!',
            },
          },
          error: {
            download: {
              gif: 'Kunne ikke downloade GIF',
              image: 'Billedet kunne ikke uploades',
              video: 'Videoen kunne ikke downloades',
              audio: 'Kunne ikke downloade lyd',
              file: 'Filen kunne ikke downloades',
            },
          },
          controls: {
            show: 'Vis ordrer',
            hide: 'Skjul ordrer',
          },
          placeholder: {
            gif: 'GIF navn',
            image: 'Billednavn',
            video: 'Video navn',
            audio: 'Audio navn',
            file: 'Filnavn',
          },
        },
        searchItem: {
          gif: 'Søg efter GIF\'er eller kategorier',
          image: 'Søger efter billeder eller kategorier',
          video: 'Søg efter videoer eller kategorier',
          audio: 'Søg efter lydbånd eller kategorier',
          file: 'Søger efter filer eller kategorier',
        },
        import: {
          panel: 'Medieimport',
          label: {
            types: 'Typer',
            medias: 'Medier',
            categories: 'Kategorier',
          },
          buttonImport: 'Importere',
          success: 'Mediet er blevet importeret!',
          error: 'Kunne ikke importere medier',
        },
        cache: {
          panel: 'Lokal database',
          total: 'I alt :',
          size: 'Størrelse:',
          clear: {
            confirm: 'Vil du virkelig tømme databasen?',
            button: 'Tom database',
            success: 'Databasen er blevet tømt!',
            error: 'Kunne ikke dumpe databasen',
          },
          cacheAll: {
            button: 'Cache alle medier',
            confirm: 'Vil du cache alle medier?',
            noMedia: 'Der er ingen medier at cache',
            success: 'Medierne er blevet cachelagret!',
            error: 'Fejl under cachelagring af medier',
          },
          refreshButton: 'Opdater',
        },
        mediasCounter: 'Antal medier',
        settings: {
          hideUnsortedMedias: {
            name: 'Skjul medier',
            note: 'Skjul medier fra fanen, der ikke er kategoriseret',
          },
          hideThumbnail: {
            name: 'Skjul thumbnails',
            note: 'Viser kategorifarve i stedet for et tilfældigt miniaturebillede',
          },
          allowCaching: {
            name: 'Tillad cachelagring af medieeksempel',
            note: 'Bruger lokal offline cache til at cache medieforhåndsvisning',
          },
          mediaVolume: {
            name: 'Medievolumen',
            note: 'Medieafspilningslydstyrke i fanen',
          },
          maxMediasPerPage: {
            name: 'Maksimalt antal medier pr. side',
            note: 'Det maksimale antal medier, der vises pr. side på fanen',
          },
          position: {
            name: 'Knap position',
          },
          gif: {
            name: 'GIF-indstillinger',
            enabled: {
              name: 'Generel',
              note: 'Erstatter Discords GIF-fane',
            },
            alwaysSendInstantly: {
              name: 'Omgående levering',
              note: 'Send medielinket eller filen med det samme',
            },
            alwaysUploadFile: {
              name: 'Upload altid som fil',
              note: 'Upload medier som en fil i stedet for at sende et link',
            },
          },
          image: {
            name: 'Billedindstillinger',
            enabled: {
              name: 'Generel',
              note: 'Aktiver denne medietype',
            },
            showBtn: {
              name: 'Knap',
              note: 'Vis knap på chat bar',
            },
            showStar: {
              name: 'Stjerne',
              note: 'Viser favoritstjerne på medier',
            },
            alwaysSendInstantly: {
              name: 'Omgående levering',
              note: 'Send medielinket eller filen med det samme',
            },
            alwaysUploadFile: {
              name: 'Upload altid som fil',
              note: 'Upload medier som en fil i stedet for at sende et link',
            },
          },
          video: {
            name: 'Videoindstillinger',
            enabled: {
              name: 'Generel',
              note: 'Aktiver denne medietype',
            },
            showBtn: {
              name: 'Knap',
              note: 'Vis knap på chat bar',
            },
            showStar: {
              name: 'Stjerne',
              note: 'Viser favoritstjerne på medier',
            },
            alwaysSendInstantly: {
              name: 'Omgående levering',
              note: 'Send medielinket eller filen med det samme',
            },
            alwaysUploadFile: {
              name: 'Upload altid som fil',
              note: 'Upload medier som en fil i stedet for at sende et link',
            },
          },
          audio: {
            name: 'Lydindstillinger',
            enabled: {
              name: 'Generel',
              note: 'Aktiver denne medietype',
            },
            showBtn: {
              name: 'Knap',
              note: 'Vis knap på chat bar',
            },
            showStar: {
              name: 'Stjerne',
              note: 'Viser favoritstjerne på medier',
            },
          },
          file: {
            name: 'Filindstillinger',
            enabled: {
              name: 'Generel',
              note: 'Aktiver denne medietype',
            },
            showBtn: {
              name: 'Knap',
              note: 'Vis knap på chat bar',
            },
            showStar: {
              name: 'Stjerne',
              note: 'Viser favoritstjerne på medier',
            },
            alwaysSendInstantly: {
              name: 'Omgående levering',
              note: 'Send medielinket eller filen med det samme',
            },
            alwaysUploadFile: {
              name: 'Upload altid som fil',
              note: 'Upload medier som en fil i stedet for at sende et link',
            },
          },
          panel: 'Indstillinger for plugin',
        },
      },
      de: { // German
        tabName: {
          image: 'Bild',
          video: 'Video',
          audio: 'Audio',
          file: 'Datei',
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
          refreshUrls: 'URLs aktualisieren',
          placeholder: 'Kategoriename',
          move: 'Bewegung',
          moveNext: 'Nach dem',
          movePrevious: 'Vor',
          color: 'Farbe',
          copyColor: 'Farbe kopieren',
          setThumbnail: 'Als Miniaturansicht festlegen',
          unsetThumbnail: 'Miniaturansicht entfernen',
          error: {
            needName: 'Name darf nicht leer sein',
            invalidNameLength: 'Der Name darf maximal 20 Zeichen lang sein',
            wrongColor: 'Farbe ist ungültig',
            nameExists: 'Dieser Name existiert bereits',
            invalidCategory: 'Die Kategorie existiert nicht',
            download: 'Fehler beim Herunterladen der Medien',
          },
          success: {
            create: 'Die Kategorie wurde erstellt!',
            delete: 'Die Kategorie wurde gelöscht!',
            edit: 'Die Kategorie wurde geändert!',
            move: 'Die Kategorie wurde verschoben!',
            download: 'Die Medien wurden hochgeladen!',
            setThumbnail: 'Miniaturansichten für die Kategorie festgelegt!',
            unsetThumbnail: 'Miniaturansicht für die Kategorie entfernt!',
            refreshUrls: 'URLs aktualisiert!',
          },
          emptyHint: 'Rechtsklick um eine Kategorie zu erstellen!',
        },
        media: {
          emptyHint: {
            image: 'Klicken Sie auf den Stern in der Ecke eines Bildes, um es in Ihre Favoriten aufzunehmen',
            video: 'Klicke auf den Stern in der Ecke eines Videos, um es zu deinen Favoriten hinzuzufügen',
            audio: 'Klicken Sie auf den Stern in der Ecke eines Audios, um es in Ihre Favoriten aufzunehmen',
            file: 'Klicken Sie auf den Stern in der Ecke einer Datei, um sie zu Ihren Favoriten hinzuzufügen',
          },
          addTo: 'Hinzufügen',
          moveTo: 'Bewegung',
          removeFrom: 'Aus Kategorie entfernen',
          copySource: 'Medienquelle kopieren',
          upload: {
            title: 'Hochladen',
            normal: 'Normal',
            spoiler: 'Spoiler',
          },
          success: {
            move: {
              gif: 'Das GIF wurde verschoben!',
              image: 'Das Bild wurde verschoben!',
              video: 'Das Video wurde verschoben!',
              audio: 'Der Ton wurde verschoben!',
              file: 'Die Datei wurde verschoben!',
            },
            remove: {
              gif: 'Das GIF wurde aus den Kategorien entfernt!',
              image: 'Das Bild wurde aus den Kategorien entfernt!',
              video: 'Das Video wurde aus den Kategorien entfernt!',
              audio: 'Audio wurde aus den Kategorien entfernt!',
              file: 'Die Datei wurde aus den Kategorien entfernt!',
            },
            download: {
              gif: 'Das GIF wurde hochgeladen!',
              image: 'Das Bild wurde hochgeladen!',
              video: 'Das Video wurde hochgeladen!',
              audio: 'Die Audiodatei wurde heruntergeladen!',
              file: 'Die Datei wurde heruntergeladen!',
            },
          },
          error: {
            download: {
              gif: 'GIF konnte nicht heruntergeladen werden',
              image: 'Fehler beim Hochladen des Bildes',
              video: 'Video konnte nicht heruntergeladen werden',
              audio: 'Audio konnte nicht heruntergeladen werden',
              file: 'Datei konnte nicht heruntergeladen werden',
            },
          },
          controls: {
            show: 'Bestellungen anzeigen',
            hide: 'Bestellungen ausblenden',
          },
          placeholder: {
            gif: 'GIF-Name',
            image: 'Bildname',
            video: 'Videoname',
            audio: 'Audioname',
            file: 'Dateiname',
          },
        },
        searchItem: {
          gif: 'Nach GIFs oder Kategorien suchen',
          image: 'Nach Bildern oder Kategorien suchen',
          video: 'Nach Videos oder Kategorien suchen',
          audio: 'Nach Audios oder Kategorien suchen',
          file: 'Suchen Sie nach Dateien oder Kategorien',
        },
        import: {
          panel: 'Medienimport',
          label: {
            types: 'Typen',
            medias: 'Medien',
            categories: 'Kategorien',
          },
          buttonImport: 'Importieren',
          success: 'Die Medien wurden importiert!',
          error: 'Medien konnten nicht importiert werden',
        },
        cache: {
          panel: 'Lokale Datenbank',
          total: 'Gesamt:',
          size: 'Größe :',
          clear: {
            confirm: 'Möchten Sie die Datenbank wirklich leeren?',
            button: 'Leere Datenbank',
            success: 'Die Datenbank wurde geleert!',
            error: 'Die Datenbank konnte nicht gesichert werden',
          },
          cacheAll: {
            button: 'Alle Medien zwischenspeichern',
            confirm: 'Möchten Sie alle Medien zwischenspeichern?',
            noMedia: 'Es sind keine Medien zum Zwischenspeichern vorhanden',
            success: 'Die Medien wurden zwischengespeichert!',
            error: 'Fehler beim Zwischenspeichern von Medien',
          },
          refreshButton: 'Aktualisierung',
        },
        mediasCounter: 'Anzahl der Medien',
        settings: {
          hideUnsortedMedias: {
            name: 'Medien ausblenden',
            note: 'Blenden Sie Medien aus der Registerkarte aus, die nicht kategorisiert sind',
          },
          hideThumbnail: {
            name: 'Miniaturansichten ausblenden',
            note: 'Zeigt die Kategoriefarbe anstelle einer zufälligen Miniaturansicht an',
          },
          allowCaching: {
            name: 'Erlauben Sie das Zwischenspeichern der Medienvorschau',
            note: 'Verwendet den lokalen Offline-Cache zum Zwischenspeichern der Medienvorschau',
          },
          mediaVolume: {
            name: 'Medienlautstärke',
            note: 'Lautstärke der Medienwiedergabe im Tab',
          },
          maxMediasPerPage: {
            name: 'Maximale Anzahl an Medien pro Seite',
            note: 'Die maximale Anzahl an Medien, die pro Seite auf der Registerkarte angezeigt werden',
          },
          position: {
            name: 'Knopfposition',
          },
          gif: {
            name: 'GIF-Einstellungen',
            enabled: {
              name: 'Allgemein',
              note: 'Ersetzt den GIF-Tab von Discord',
            },
            alwaysSendInstantly: {
              name: 'Sofortige Lieferung',
              note: 'Senden Sie sofort den Medienlink oder die Mediendatei',
            },
            alwaysUploadFile: {
              name: 'Immer als Datei hochladen',
              note: 'Laden Sie Medien als Datei hoch, anstatt einen Link zu senden',
            },
          },
          image: {
            name: 'Bildeinstellungen',
            enabled: {
              name: 'Allgemein',
              note: 'Aktivieren Sie diesen Medientyp',
            },
            showBtn: {
              name: 'Taste',
              note: 'Schaltfläche in der Chatleiste anzeigen',
            },
            showStar: {
              name: 'Stern',
              note: 'Zeigt den Lieblingsstar in den Medien',
            },
            alwaysSendInstantly: {
              name: 'Sofortige Lieferung',
              note: 'Senden Sie sofort den Medienlink oder die Mediendatei',
            },
            alwaysUploadFile: {
              name: 'Immer als Datei hochladen',
              note: 'Laden Sie Medien als Datei hoch, anstatt einen Link zu senden',
            },
          },
          video: {
            name: 'Video-Einstellungen',
            enabled: {
              name: 'Allgemein',
              note: 'Aktivieren Sie diesen Medientyp',
            },
            showBtn: {
              name: 'Taste',
              note: 'Schaltfläche in der Chatleiste anzeigen',
            },
            showStar: {
              name: 'Stern',
              note: 'Zeigt den Lieblingsstar in den Medien',
            },
            alwaysSendInstantly: {
              name: 'Sofortige Lieferung',
              note: 'Senden Sie sofort den Medienlink oder die Mediendatei',
            },
            alwaysUploadFile: {
              name: 'Immer als Datei hochladen',
              note: 'Laden Sie Medien als Datei hoch, anstatt einen Link zu senden',
            },
          },
          audio: {
            name: 'Audio Einstellungen',
            enabled: {
              name: 'Allgemein',
              note: 'Aktivieren Sie diesen Medientyp',
            },
            showBtn: {
              name: 'Taste',
              note: 'Schaltfläche in der Chatleiste anzeigen',
            },
            showStar: {
              name: 'Stern',
              note: 'Zeigt den Lieblingsstar in den Medien',
            },
          },
          file: {
            name: 'Dateieinstellungen',
            enabled: {
              name: 'Allgemein',
              note: 'Aktivieren Sie diesen Medientyp',
            },
            showBtn: {
              name: 'Taste',
              note: 'Schaltfläche in der Chatleiste anzeigen',
            },
            showStar: {
              name: 'Stern',
              note: 'Zeigt den Lieblingsstar in den Medien',
            },
            alwaysSendInstantly: {
              name: 'Sofortige Lieferung',
              note: 'Senden Sie sofort den Medienlink oder die Mediendatei',
            },
            alwaysUploadFile: {
              name: 'Immer als Datei hochladen',
              note: 'Laden Sie Medien als Datei hoch, anstatt einen Link zu senden',
            },
          },
          panel: 'Plugin-Einstellungen',
        },
      },
      el: { // Greek
        tabName: {
          image: 'Εικόνα',
          video: 'βίντεο',
          audio: 'Ήχος',
          file: 'Αρχείο',
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
          refreshUrls: 'Ανανέωση διευθύνσεων URL',
          placeholder: 'Ονομα κατηγορίας',
          move: 'Κίνηση',
          moveNext: 'Μετά',
          movePrevious: 'Πριν',
          color: 'Χρώμα',
          copyColor: 'Αντιγραφή χρώματος',
          setThumbnail: 'Ορισμός ως μικρογραφία',
          unsetThumbnail: 'Αφαιρέστε τη μικρογραφία',
          error: {
            needName: 'Το όνομα δεν μπορεί να είναι κενό',
            invalidNameLength: 'Το όνομα πρέπει να περιέχει έως και 20 χαρακτήρες',
            wrongColor: 'Το χρώμα δεν είναι έγκυρο',
            nameExists: 'αυτό το όνομα υπάρχει ήδη',
            invalidCategory: 'Η κατηγορία δεν υπάρχει',
            download: 'Αποτυχία λήψης μέσων',
          },
          success: {
            create: 'Η κατηγορία έχει δημιουργηθεί!',
            delete: 'Η κατηγορία διαγράφηκε!',
            edit: 'Η κατηγορία άλλαξε!',
            move: 'Η κατηγορία έχει μετακινηθεί!',
            download: 'Τα μέσα έχουν ανέβει!',
            setThumbnail: 'Σετ μικρογραφιών για την κατηγορία!',
            unsetThumbnail: 'Η μικρογραφία καταργήθηκε για την κατηγορία!',
            refreshUrls: 'Οι διευθύνσεις URL ανανεώθηκαν!',
          },
          emptyHint: 'Κάντε δεξί κλικ για να δημιουργήσετε μια κατηγορία!',
        },
        media: {
          emptyHint: {
            image: 'Κάντε κλικ στο αστέρι στη γωνία μιας εικόνας για να την βάλετε στα αγαπημένα σας',
            video: 'Κάντε κλικ στο αστέρι στη γωνία ενός βίντεο για να το βάλετε στα αγαπημένα σας',
            audio: 'Κάντε κλικ στο αστέρι στη γωνία ενός ήχου για να το βάλετε στα αγαπημένα σας',
            file: 'Κάντε κλικ στο αστέρι στη γωνία ενός αρχείου για να το προσθέσετε στα αγαπημένα σας',
          },
          addTo: 'Προσθήκη',
          moveTo: 'Κίνηση',
          removeFrom: 'Κατάργηση από την κατηγορία',
          copySource: 'Αντιγραφή πηγής πολυμέσων',
          upload: {
            title: 'Μεταφόρτωση',
            normal: 'Κανονικός',
            spoiler: 'Φθείρων',
          },
          success: {
            move: {
              gif: 'Το GIF έχει μετακινηθεί!',
              image: 'Η εικόνα μετακινήθηκε!',
              video: 'Το βίντεο μετακινήθηκε!',
              audio: 'Ο ήχος μετακινήθηκε!',
              file: 'Το αρχείο έχει μετακινηθεί!',
            },
            remove: {
              gif: 'Το GIF έχει αφαιρεθεί από τις κατηγορίες!',
              image: 'Η εικόνα έχει αφαιρεθεί από τις κατηγορίες!',
              video: 'Το βίντεο καταργήθηκε από τις κατηγορίες!',
              audio: 'Ο ήχος καταργήθηκε από κατηγορίες!',
              file: 'Το αρχείο έχει αφαιρεθεί από τις κατηγορίες!',
            },
            download: {
              gif: 'Το GIF έχει ανέβει!',
              image: 'Η εικόνα ανέβηκε!',
              video: 'Το βίντεο ανέβηκε!',
              audio: 'Ο ήχος έχει γίνει λήψη!',
              file: 'Το αρχείο έχει γίνει λήψη!',
            },
          },
          error: {
            download: {
              gif: 'Αποτυχία λήψης GIF',
              image: 'Αποτυχία μεταφόρτωσης εικόνας',
              video: 'Αποτυχία λήψης βίντεο',
              audio: 'Αποτυχία λήψης ήχου',
              file: 'Η λήψη του αρχείου απέτυχε',
            },
          },
          controls: {
            show: 'Εμφάνιση παραγγελιών',
            hide: 'Απόκρυψη παραγγελιών',
          },
          placeholder: {
            gif: 'Όνομα GIF',
            image: 'Όνομα εικόνας',
            video: 'Όνομα βίντεο',
            audio: 'Όνομα ήχου',
            file: 'Ονομα αρχείου',
          },
        },
        searchItem: {
          gif: 'Αναζήτηση για GIF ή κατηγορίες',
          image: 'Αναζήτηση εικόνων ή κατηγοριών',
          video: 'Αναζήτηση βίντεο ή κατηγοριών',
          audio: 'Αναζήτηση ήχων ή κατηγοριών',
          file: 'Αναζήτηση αρχείων ή κατηγοριών',
        },
        import: {
          panel: 'Εισαγωγή μέσων',
          label: {
            types: 'Τύποι',
            medias: 'Μεσο ΜΑΖΙΚΗΣ ΕΝΗΜΕΡΩΣΗΣ',
            categories: 'Κατηγορίες',
          },
          buttonImport: 'Εισαγωγή',
          success: 'Τα μέσα έχουν εισαχθεί!',
          error: 'Αποτυχία εισαγωγής πολυμέσων',
        },
        cache: {
          panel: 'Τοπική βάση δεδομένων',
          total: 'Σύνολο :',
          size: 'Μέγεθος :',
          clear: {
            confirm: 'Θέλετε πραγματικά να αδειάσετε τη βάση δεδομένων;',
            button: 'Κενή βάση δεδομένων',
            success: 'Η βάση δεδομένων έχει αδειάσει!',
            error: 'Απέτυχε η απόρριψη της βάσης δεδομένων',
          },
          cacheAll: {
            button: 'Αποθηκεύστε προσωρινά όλα τα μέσα',
            confirm: 'Θέλετε να αποθηκεύσετε όλα τα μέσα στην προσωρινή μνήμη;',
            noMedia: 'Δεν υπάρχουν μέσα για αποθήκευση στην κρυφή μνήμη',
            success: 'Τα μέσα έχουν αποθηκευτεί προσωρινά!',
            error: 'Αποτυχία κατά την προσωρινή αποθήκευση πολυμέσων',
          },
          refreshButton: 'Φρεσκάρω',
        },
        mediasCounter: 'Αριθμός μέσων',
        settings: {
          hideUnsortedMedias: {
            name: 'Απόκρυψη πολυμέσων',
            note: 'Απόκρυψη πολυμέσων από την καρτέλα που δεν είναι κατηγοριοποιημένα',
          },
          hideThumbnail: {
            name: 'Απόκρυψη μικρογραφιών',
            note: 'Εμφανίζει το χρώμα της κατηγορίας αντί για μια τυχαία μικρογραφία',
          },
          allowCaching: {
            name: 'Να επιτρέπεται η προσωρινή αποθήκευση προεπισκόπησης πολυμέσων',
            note: 'Χρησιμοποιεί τοπική προσωρινή μνήμη εκτός σύνδεσης για την προσωρινή αποθήκευση της προεπισκόπησης πολυμέσων',
          },
          mediaVolume: {
            name: 'Ένταση ήχου πολυμέσων',
            note: 'Ένταση ήχου αναπαραγωγής πολυμέσων στην καρτέλα',
          },
          maxMediasPerPage: {
            name: 'Μέγιστος αριθμός μέσων ανά σελίδα',
            note: 'Ο μέγιστος αριθμός πολυμέσων που εμφανίζονται ανά σελίδα στην καρτέλα',
          },
          position: {
            name: 'Θέση κουμπιού',
          },
          gif: {
            name: 'Ρυθμίσεις GIF',
            enabled: {
              name: 'Γενικός',
              note: 'Αντικαθιστά την καρτέλα GIF του Discord',
            },
            alwaysSendInstantly: {
              name: 'Αμεση ΠΑΡΑΔΟΣΗ',
              note: 'Στείλτε αμέσως τον σύνδεσμο ή το αρχείο πολυμέσων',
            },
            alwaysUploadFile: {
              name: 'Πάντα ανέβασμα ως αρχείο',
              note: 'Ανεβάστε μέσα ως αρχείο αντί να στείλετε έναν σύνδεσμο',
            },
          },
          image: {
            name: 'Ρυθμίσεις εικόνας',
            enabled: {
              name: 'Γενικός',
              note: 'Ενεργοποιήστε αυτόν τον τύπο πολυμέσων',
            },
            showBtn: {
              name: 'Κουμπί',
              note: 'Εμφάνιση κουμπιού στη γραμμή συνομιλίας',
            },
            showStar: {
              name: 'Αστέρι',
              note: 'Εμφανίζει το αγαπημένο αστέρι στα μέσα',
            },
            alwaysSendInstantly: {
              name: 'Αμεση ΠΑΡΑΔΟΣΗ',
              note: 'Στείλτε αμέσως τον σύνδεσμο ή το αρχείο πολυμέσων',
            },
            alwaysUploadFile: {
              name: 'Πάντα ανέβασμα ως αρχείο',
              note: 'Ανεβάστε μέσα ως αρχείο αντί να στείλετε έναν σύνδεσμο',
            },
          },
          video: {
            name: 'Ρυθμίσεις βίντεο',
            enabled: {
              name: 'Γενικός',
              note: 'Ενεργοποιήστε αυτόν τον τύπο πολυμέσων',
            },
            showBtn: {
              name: 'Κουμπί',
              note: 'Εμφάνιση κουμπιού στη γραμμή συνομιλίας',
            },
            showStar: {
              name: 'Αστέρι',
              note: 'Εμφανίζει το αγαπημένο αστέρι στα μέσα',
            },
            alwaysSendInstantly: {
              name: 'Αμεση ΠΑΡΑΔΟΣΗ',
              note: 'Στείλτε αμέσως τον σύνδεσμο ή το αρχείο πολυμέσων',
            },
            alwaysUploadFile: {
              name: 'Πάντα ανέβασμα ως αρχείο',
              note: 'Ανεβάστε μέσα ως αρχείο αντί να στείλετε έναν σύνδεσμο',
            },
          },
          audio: {
            name: 'Ρυθμίσεις ήχου',
            enabled: {
              name: 'Γενικός',
              note: 'Ενεργοποιήστε αυτόν τον τύπο πολυμέσων',
            },
            showBtn: {
              name: 'Κουμπί',
              note: 'Εμφάνιση κουμπιού στη γραμμή συνομιλίας',
            },
            showStar: {
              name: 'Αστέρι',
              note: 'Εμφανίζει το αγαπημένο αστέρι στα μέσα',
            },
          },
          file: {
            name: 'Ρυθμίσεις αρχείου',
            enabled: {
              name: 'Γενικός',
              note: 'Ενεργοποιήστε αυτόν τον τύπο πολυμέσων',
            },
            showBtn: {
              name: 'Κουμπί',
              note: 'Εμφάνιση κουμπιού στη γραμμή συνομιλίας',
            },
            showStar: {
              name: 'Αστέρι',
              note: 'Εμφανίζει το αγαπημένο αστέρι στα μέσα',
            },
            alwaysSendInstantly: {
              name: 'Αμεση ΠΑΡΑΔΟΣΗ',
              note: 'Στείλτε αμέσως τον σύνδεσμο ή το αρχείο πολυμέσων',
            },
            alwaysUploadFile: {
              name: 'Πάντα ανέβασμα ως αρχείο',
              note: 'Ανεβάστε μέσα ως αρχείο αντί να στείλετε έναν σύνδεσμο',
            },
          },
          panel: 'Ρυθμίσεις Plugin',
        },
      },
      en: { // English
        tabName: {
          image: 'Image',
          video: 'Video',
          audio: 'Audio',
          file: 'File',
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
          refreshUrls: 'Refresh urls',
          placeholder: 'Category Name',
          move: 'Move',
          moveNext: 'Next',
          movePrevious: 'Previous',
          color: 'Color',
          copyColor: 'Copy Color',
          setThumbnail: 'Set as thumbnail',
          unsetThumbnail: 'Unset the thumbnail',
          error: {
            needName: 'Name cannot be empty',
            invalidNameLength: 'Name must contain less than 20 characters',
            wrongColor: 'Invalid color',
            nameExists: 'Name already exists',
            invalidCategory: 'Category not found',
            download: 'Error while downloading medias!',
          },
          success: {
            create: 'Category created!',
            delete: 'Category deleted!',
            edit: 'Category edited!',
            move: 'Category moved!',
            download: 'Medias downloaded!',
            setThumbnail: 'Category thumbnail set!',
            unsetThumbnail: 'Category thumbnail unset!',
            refreshUrls: 'Urls refreshed!',
          },
          emptyHint: 'Right-click to create a category!',
        },
        media: {
          emptyHint: {
            image: 'Click on the star in the corner of an image to bookmark it',
            video: 'Click on the star in the corner of a video to bookmark it',
            audio: 'Click on the star in the corner of an audio to bookmark it',
            file: 'Click on the star in the corner of a file to bookmark it',
          },
          addTo: 'Add',
          moveTo: 'Move',
          removeFrom: 'Remove From Category',
          copySource: 'Copy Source Link',
          upload: {
            title: 'Upload',
            normal: 'Normal',
            spoiler: 'Spoiler',
          },
          success: {
            move: {
              gif: 'GIF moved!',
              image: 'Image moved!',
              video: 'Video moved!',
              audio: 'Audio moved!',
              file: 'File moved!',
            },
            remove: {
              gif: 'GIF removed from categories!',
              image: 'Image removed from categories!',
              video: 'Video removed from categories!',
              audio: 'Audio removed from categories!',
              file: 'File removed from categories!',
            },
            download: {
              gif: 'GIF downloaded!',
              image: 'Image downloaded!',
              video: 'Video downloaded!',
              audio: 'Audio downloaded!',
              file: 'File downloaded!',
            },
          },
          error: {
            download: {
              gif: 'Failed to download GIF',
              image: 'Failed to download image',
              video: 'Failed to download video',
              audio: 'Failed to download audio',
              file: 'Failed to download file',
            },
          },
          controls: {
            show: 'Show Controls',
            hide: 'Hide Controls',
          },
          placeholder: {
            gif: 'GIF Name',
            image: 'Image Name',
            video: 'Video Name',
            audio: 'Audio Name',
            file: 'File Name',
          },
        },
        searchItem: {
          gif: 'Search for GIFs or Categories',
          image: 'Search for Images or Categories',
          video: 'Search for Videos or Categories',
          audio: 'Search for Audios or Categories',
          file: 'Search for Files or Categories',
        },
        import: {
          panel: 'Import medias',
          label: {
            types: 'Types',
            medias: 'Medias',
            categories: 'Categories',
          },
          buttonImport: 'Import',
          success: 'Medias imported !',
          error: 'Failed to import medias',
        },
        cache: {
          panel: 'Local database',
          total: 'Total:',
          size: 'Size:',
          clear: {
            confirm: 'Are you sure you want to clear the database?',
            button: 'Clear the database',
            success: 'Database cleared!',
            error: 'Failed to clear the database',
          },
          cacheAll: {
            button: 'Cache all medias',
            confirm: 'Do you want to cache all medias?',
            noMedia: 'There is no media to cache',
            success: 'Medias cached!',
            error: 'Failed to cache medias',
          },
          refreshButton: 'Refresh',
        },
        mediasCounter: 'Medias count',
        settings: {
          allowCaching: {
            name: 'Allow medias preview caching',
            note: 'Uses local offline database to cache medias preview',
          },
          panel: 'Plugin settings',
        },
      },
      es: { // Spanish
        tabName: {
          image: 'Imagen',
          video: 'Video',
          audio: 'Audio',
          file: 'Archivo',
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
          refreshUrls: 'Actualizar URL',
          placeholder: 'Nombre de la categoría',
          move: 'Moverse',
          moveNext: 'Después',
          movePrevious: 'Antes',
          color: 'Color',
          copyColor: 'Copiar color',
          setThumbnail: 'Establecer como miniatura',
          unsetThumbnail: 'Quitar miniatura',
          error: {
            needName: 'El nombre no puede estar vacío',
            invalidNameLength: 'El nombre debe contener un máximo de 20 caracteres.',
            wrongColor: 'El color no es válido',
            nameExists: 'Este nombre ya existe',
            invalidCategory: 'La categoría no existe',
            download: '¡Los medios han sido cargados!',
          },
          success: {
            create: '¡La categoría ha sido creada!',
            delete: '¡La categoría ha sido eliminada!',
            edit: '¡La categoría ha sido cambiada!',
            move: '¡La categoría ha sido movida!',
            download: '¡Los medios han sido cargados!',
            setThumbnail: '¡Miniaturas configuradas para categoría!',
            unsetThumbnail: '¡Miniatura eliminada para la categoría!',
            refreshUrls: '¡URL actualizadas!',
          },
          emptyHint: '¡Haz clic derecho para crear una categoría!',
        },
        media: {
          emptyHint: {
            image: 'Haga clic en la estrella en la esquina de una imagen para ponerla en sus favoritos',
            video: 'Haga clic en la estrella en la esquina de un video para ponerlo en sus favoritos',
            audio: 'Haga clic en la estrella en la esquina de un audio para ponerlo en sus favoritos',
            file: 'Haga clic en la estrella en la esquina de un archivo para agregarlo a sus favoritos',
          },
          addTo: 'Agregar',
          moveTo: 'Moverse',
          removeFrom: 'Quitar de la categoría',
          copySource: 'Copiar fuente multimedia',
          upload: {
            title: 'Subir',
            normal: 'normal',
            spoiler: 'Revelación',
          },
          success: {
            move: {
              gif: '¡El GIF ha sido movido!',
              image: '¡La imagen se ha movido!',
              video: '¡El video se ha movido!',
              audio: '¡El audio se ha movido!',
              file: '¡El archivo ha sido movido!',
            },
            remove: {
              gif: '¡El GIF ha sido eliminado de las categorías!',
              image: '¡La imagen ha sido eliminada de las categorías!',
              video: '¡El video ha sido eliminado de las categorías!',
              audio: '¡El audio ha sido eliminado de las categorías!',
              file: '¡El archivo ha sido eliminado de las categorías!',
            },
            download: {
              gif: '¡El GIF ha sido subido!',
              image: '¡La imagen ha sido cargada!',
              video: '¡El video ha sido subido!',
              audio: '¡El audio se ha descargado!',
              file: '¡El archivo ha sido descargado!',
            },
          },
          error: {
            download: {
              gif: 'No se pudo descargar del GIF',
              image: 'No se pudo cargar la imagen.',
              video: 'No se pudo descargar el video',
              audio: 'No se pudo descargar el audio',
              file: 'No se pudo descargar el archivo',
            },
          },
          controls: {
            show: 'Mostrar pedidos',
            hide: 'Ocultar pedidos',
          },
          placeholder: {
            gif: 'Nombre del GIF',
            image: 'Nombre de la imágen',
            video: 'Nombre del video',
            audio: 'Nombre de audio',
            file: 'Nombre del archivo',
          },
        },
        searchItem: {
          gif: 'Buscar GIFs o categorías',
          image: 'Buscar imágenes o categorías',
          video: 'Buscar videos o categorías',
          audio: 'Busque audios o categorías',
          file: 'Buscar archivos o categorías',
        },
        import: {
          panel: 'Importación de medios',
          label: {
            types: 'Tipos',
            medias: 'Medios de comunicación',
            categories: 'Categorías',
          },
          buttonImport: 'Importar',
          success: '¡Los medios han sido importados!',
          error: 'No se pudieron importar medios',
        },
        cache: {
          panel: 'Base de datos local',
          total: 'Total :',
          size: 'Tamaño :',
          clear: {
            confirm: '¿Realmente quieres vaciar la base de datos?',
            button: 'Base de datos vacía',
            success: '¡La base de datos ha sido vaciada!',
            error: 'No se pudo volcar la base de datos',
          },
          cacheAll: {
            button: 'Caché de todos los medios',
            confirm: '¿Quieres almacenar en caché todos los medios?',
            noMedia: 'No hay medios para almacenar en caché',
            success: '¡Los medios han sido almacenados en caché!',
            error: 'Error al almacenar en caché los medios',
          },
          refreshButton: 'Actualizar',
        },
        mediasCounter: 'Número de medios',
        settings: {
          hideUnsortedMedias: {
            name: 'Ocultar medios',
            note: 'Ocultar medios de la pestaña que no están categorizados',
          },
          hideThumbnail: {
            name: 'Ocultar miniaturas',
            note: 'Muestra el color de la categoría en lugar de una miniatura aleatoria',
          },
          allowCaching: {
            name: 'Permitir el almacenamiento en caché de vista previa de medios',
            note: 'Utiliza caché local sin conexión para almacenar en caché la vista previa de medios',
          },
          mediaVolume: {
            name: 'Volumen de medios',
            note: 'Volumen de reproducción multimedia en la pestaña',
          },
          maxMediasPerPage: {
            name: 'Número máximo de medios por página',
            note: 'El número máximo de medios mostrados por página en la pestaña.',
          },
          position: {
            name: 'Posición del botón',
          },
          gif: {
            name: 'Configuración de GIF',
            enabled: {
              name: 'General',
              note: 'Reemplaza la pestaña GIF de Discord',
            },
            alwaysSendInstantly: {
              name: 'Entrega inmediata',
              note: 'Envíe inmediatamente el enlace o archivo multimedia',
            },
            alwaysUploadFile: {
              name: 'Subir siempre como archivo',
              note: 'Cargue medios como un archivo en lugar de enviar un enlace',
            },
          },
          image: {
            name: 'Configuración de imagen',
            enabled: {
              name: 'General',
              note: 'Habilitar este tipo de medio',
            },
            showBtn: {
              name: 'Botón',
              note: 'Mostrar botón en la barra de chat',
            },
            showStar: {
              name: 'Estrella',
              note: 'Muestra estrella favorita en los medios.',
            },
            alwaysSendInstantly: {
              name: 'Entrega inmediata',
              note: 'Envíe inmediatamente el enlace o archivo multimedia',
            },
            alwaysUploadFile: {
              name: 'Subir siempre como archivo',
              note: 'Cargue medios como un archivo en lugar de enviar un enlace',
            },
          },
          video: {
            name: 'Ajustes de video',
            enabled: {
              name: 'General',
              note: 'Habilitar este tipo de medio',
            },
            showBtn: {
              name: 'Botón',
              note: 'Mostrar botón en la barra de chat',
            },
            showStar: {
              name: 'Estrella',
              note: 'Muestra estrella favorita en los medios.',
            },
            alwaysSendInstantly: {
              name: 'Entrega inmediata',
              note: 'Envíe inmediatamente el enlace o archivo multimedia',
            },
            alwaysUploadFile: {
              name: 'Subir siempre como archivo',
              note: 'Cargue medios como un archivo en lugar de enviar un enlace',
            },
          },
          audio: {
            name: 'Configuraciones de audio',
            enabled: {
              name: 'General',
              note: 'Habilitar este tipo de medio',
            },
            showBtn: {
              name: 'Botón',
              note: 'Mostrar botón en la barra de chat',
            },
            showStar: {
              name: 'Estrella',
              note: 'Muestra estrella favorita en los medios.',
            },
          },
          file: {
            name: 'Configuración de archivos',
            enabled: {
              name: 'General',
              note: 'Habilitar este tipo de medio',
            },
            showBtn: {
              name: 'Botón',
              note: 'Mostrar botón en la barra de chat',
            },
            showStar: {
              name: 'Estrella',
              note: 'Muestra estrella favorita en los medios.',
            },
            alwaysSendInstantly: {
              name: 'Entrega inmediata',
              note: 'Envíe inmediatamente el enlace o archivo multimedia',
            },
            alwaysUploadFile: {
              name: 'Subir siempre como archivo',
              note: 'Cargue medios como un archivo en lugar de enviar un enlace',
            },
          },
          panel: 'Configuración del complemento',
        },
      },
      fi: { // Finnish
        tabName: {
          image: 'Kuva',
          video: 'Video',
          audio: 'Audio',
          file: 'Tiedosto',
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
          refreshUrls: 'Päivitä URL-osoitteet',
          placeholder: 'Kategorian nimi',
          move: 'Liikkua',
          moveNext: 'Jälkeen',
          movePrevious: 'Ennen',
          color: 'Väri',
          copyColor: 'Kopioi väri',
          setThumbnail: 'Aseta pikkukuvaksi',
          unsetThumbnail: 'Poista pikkukuva',
          error: {
            needName: 'Nimi ei voi olla tyhjä',
            invalidNameLength: 'Nimi saa sisältää enintään 20 merkkiä',
            wrongColor: 'Väri on virheellinen',
            nameExists: 'tämä nimi on jo olemassa',
            invalidCategory: 'Luokkaa ei ole olemassa',
            download: 'Median lataaminen epäonnistui',
          },
          success: {
            create: 'Luokka on luotu!',
            delete: 'Luokka on poistettu!',
            edit: 'Luokkaa on muutettu!',
            move: 'Luokka on siirretty!',
            download: 'Media on ladattu!',
            setThumbnail: 'Pikkukuva asetettu kategoriaan!',
            unsetThumbnail: 'Luokan pikkukuva poistettu!',
            refreshUrls: 'URL-osoitteet päivitetty!',
          },
          emptyHint: 'Napsauta hiiren kakkospainikkeella luodaksesi luokan!',
        },
        media: {
          emptyHint: {
            image: 'Napsauta kuvan kulmassa olevaa tähteä lisätäksesi sen suosikkeihisi',
            video: 'Napsauta videon kulmassa olevaa tähteä lisätäksesi sen suosikkeihisi',
            audio: 'Napsauta äänen kulmassa olevaa tähteä lisätäksesi sen suosikkeihisi',
            file: 'Napsauta tähteä tiedoston kulmassa lisätäksesi sen suosikkeihisi',
          },
          addTo: 'Lisätä',
          moveTo: 'Liikkua',
          removeFrom: 'Poista luokasta',
          copySource: 'Kopioi medialähde',
          upload: {
            title: 'Lähetä',
            normal: 'Normaali',
            spoiler: 'Spoileri',
          },
          success: {
            move: {
              gif: 'GIF on siirretty!',
              image: 'Kuva on siirretty!',
              video: 'Video on siirretty!',
              audio: 'Ääni on siirretty!',
              file: 'Tiedosto on siirretty!',
            },
            remove: {
              gif: 'GIF on poistettu luokista!',
              image: 'Kuva on poistettu luokista!',
              video: 'Video on poistettu luokista!',
              audio: 'Ääni on poistettu luokista!',
              file: 'Tiedosto on poistettu luokista!',
            },
            download: {
              gif: 'GIF on ladattu!',
              image: 'Kuva on ladattu!',
              video: 'Video on ladattu!',
              audio: 'Ääni on ladattu!',
              file: 'Tiedosto on ladattu!',
            },
          },
          error: {
            download: {
              gif: 'GIF:n lataaminen epäonnistui',
              image: 'Kuvan lataaminen epäonnistui',
              video: 'Videon lataaminen epäonnistui',
              audio: 'Äänen lataaminen epäonnistui',
              file: 'Tiedoston lataaminen epäonnistui',
            },
          },
          controls: {
            show: 'Näytä tilaukset',
            hide: 'Piilota tilaukset',
          },
          placeholder: {
            gif: 'GIF-nimi',
            image: 'Kuvan nimi',
            video: 'Videon nimi',
            audio: 'Äänen nimi',
            file: 'Tiedoston nimi',
          },
        },
        searchItem: {
          gif: 'Hae GIF-tiedostoja tai luokkia',
          image: 'Hae kuvia tai luokkia',
          video: 'Hae videoita tai luokkia',
          audio: 'Hae ääniä tai luokkia',
          file: 'Etsi tiedostoja tai luokkia',
        },
        import: {
          panel: 'Median tuonti',
          label: {
            types: 'Tyypit',
            medias: 'Media',
            categories: 'Luokat',
          },
          buttonImport: 'Tuonti',
          success: 'Media on tuotu!',
          error: 'Median tuonti epäonnistui',
        },
        cache: {
          panel: 'Paikallinen tietokanta',
          total: 'Kaikki yhteensä :',
          size: 'Koko :',
          clear: {
            confirm: 'Haluatko todella tyhjentää tietokannan?',
            button: 'Tyhjä tietokanta',
            success: 'Tietokanta on tyhjennetty!',
            error: 'Tietokannan tyhjentäminen epäonnistui',
          },
          cacheAll: {
            button: 'Tallenna kaikki mediat välimuistiin',
            confirm: 'Haluatko tallentaa kaiken median välimuistiin?',
            noMedia: 'Välimuistiin ei ole mediaa',
            success: 'Media on tallennettu välimuistiin!',
            error: 'Virhe tallennettaessa mediaa välimuistiin',
          },
          refreshButton: 'virkistää',
        },
        mediasCounter: 'Median määrä',
        settings: {
          hideUnsortedMedias: {
            name: 'Piilota media',
            note: 'Piilota mediat välilehdeltä, jota ei ole luokiteltu',
          },
          hideThumbnail: {
            name: 'Piilota pikkukuvat',
            note: 'Näyttää kategorian värin satunnaisen pikkukuvan sijaan',
          },
          allowCaching: {
            name: 'Salli median esikatselun välimuisti',
            note: 'Käyttää paikallista offline-välimuistia median esikatselun tallentamiseen välimuistiin',
          },
          mediaVolume: {
            name: 'Median äänenvoimakkuus',
            note: 'Median toiston äänenvoimakkuus välilehdellä',
          },
          maxMediasPerPage: {
            name: 'Median enimmäismäärä sivulla',
            note: 'Välilehden sivua kohden näytettävän median enimmäismäärä',
          },
          position: {
            name: 'Painikkeen asento',
          },
          gif: {
            name: 'GIF-asetukset',
            enabled: {
              name: 'Kenraali',
              note: 'Korvaa Discordin GIF-välilehden',
            },
            alwaysSendInstantly: {
              name: 'Välitön toimitus',
              note: 'Lähetä medialinkki tai tiedosto välittömästi',
            },
            alwaysUploadFile: {
              name: 'Lataa aina tiedostona',
              note: 'Lataa media tiedostona linkin lähettämisen sijaan',
            },
          },
          image: {
            name: 'Kuva-asetukset',
            enabled: {
              name: 'Kenraali',
              note: 'Ota tämä mediatyyppi käyttöön',
            },
            showBtn: {
              name: 'Painike',
              note: 'Näytä painike chat-palkissa',
            },
            showStar: {
              name: 'Tähti',
              note: 'Näyttää suosikkitähden mediassa',
            },
            alwaysSendInstantly: {
              name: 'Välitön toimitus',
              note: 'Lähetä medialinkki tai tiedosto välittömästi',
            },
            alwaysUploadFile: {
              name: 'Lataa aina tiedostona',
              note: 'Lataa media tiedostona linkin lähettämisen sijaan',
            },
          },
          video: {
            name: 'Videoasetukset',
            enabled: {
              name: 'Kenraali',
              note: 'Ota tämä mediatyyppi käyttöön',
            },
            showBtn: {
              name: 'Painike',
              note: 'Näytä painike chat-palkissa',
            },
            showStar: {
              name: 'Tähti',
              note: 'Näyttää suosikkitähden mediassa',
            },
            alwaysSendInstantly: {
              name: 'Välitön toimitus',
              note: 'Lähetä medialinkki tai tiedosto välittömästi',
            },
            alwaysUploadFile: {
              name: 'Lataa aina tiedostona',
              note: 'Lataa media tiedostona linkin lähettämisen sijaan',
            },
          },
          audio: {
            name: 'Ääniasetukset',
            enabled: {
              name: 'Kenraali',
              note: 'Ota tämä mediatyyppi käyttöön',
            },
            showBtn: {
              name: 'Painike',
              note: 'Näytä painike chat-palkissa',
            },
            showStar: {
              name: 'Tähti',
              note: 'Näyttää suosikkitähden mediassa',
            },
          },
          file: {
            name: 'Tiedostoasetukset',
            enabled: {
              name: 'Kenraali',
              note: 'Ota tämä mediatyyppi käyttöön',
            },
            showBtn: {
              name: 'Painike',
              note: 'Näytä painike chat-palkissa',
            },
            showStar: {
              name: 'Tähti',
              note: 'Näyttää suosikkitähden mediassa',
            },
            alwaysSendInstantly: {
              name: 'Välitön toimitus',
              note: 'Lähetä medialinkki tai tiedosto välittömästi',
            },
            alwaysUploadFile: {
              name: 'Lataa aina tiedostona',
              note: 'Lataa media tiedostona linkin lähettämisen sijaan',
            },
          },
          panel: 'Plugin-asetukset',
        },
      },
      fr: { // French
        tabName: {
          image: 'Image',
          video: 'Vidéo',
          audio: 'Audio',
          file: 'Fichier',
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
          refreshUrls: 'Rafraîchir les liens',
          placeholder: 'Nom de la catégorie',
          move: 'Déplacer',
          moveNext: 'Après',
          movePrevious: 'Avant',
          color: 'Couleur',
          copyColor: 'Copier la couleur',
          setThumbnail: 'Définir comme miniature',
          unsetThumbnail: 'Retirer la miniature',
          error: {
            needName: 'Le nom ne peut être vide',
            invalidNameLength: 'Le nom doit contenir au maximum 20 caractères',
            wrongColor: 'La couleur est invalide',
            nameExists: 'Ce nom existe déjà',
            invalidCategory: 'La catégorie n\'existe pas',
            download: 'Échec lors du téléchargement des médias',
          },
          success: {
            create: 'La catégorie a été créée !',
            delete: 'La catégorie a été supprimée !',
            edit: 'La catégorie a été modifiée !',
            move: 'La catégorie a été déplacée !',
            download: 'Les médias ont été téléchargés !',
            setThumbnail: 'Miniature définie pour la catégorie !',
            unsetThumbnail: 'Miniature retirée pour la catégorie !',
            refreshUrls: 'Les liens ont été rafraîchis !',
          },
          emptyHint: 'Fais un clique-droit pour créer une catégorie !',
        },
        media: {
          emptyHint: {
            image: 'Clique sur l\'étoile dans le coin d\'une image pour la mettre dans tes favoris',
            video: 'Clique sur l\'étoile dans le coin d\'une vidéo pour la mettre dans tes favoris',
            audio: 'Clique sur l\'étoile dans le coin d\'un audio pour le mettre dans tes favoris',
            file: 'Clique sur l\'étoile dans le coin d\'un fichier pour le mettre dans tes favoris',
          },
          addTo: 'Ajouter',
          moveTo: 'Déplacer',
          removeFrom: 'Retirer de la catégorie',
          copySource: 'Copier la source du média',
          upload: {
            title: 'Uploader',
            normal: 'Normal',
            spoiler: 'Spoiler',
          },
          success: {
            move: {
              gif: 'Le GIF a été déplacé !',
              image: 'L\'image a été déplacée !',
              video: 'La vidéo a été déplacée !',
              audio: 'L\'audio a été déplacé !',
              file: 'Le fichier a été déplacé !',
            },
            remove: {
              gif: 'Le GIF a été enlevé des catégories !',
              image: 'L\'image a été enlevée des catégories !',
              video: 'La vidéo a été enlevée des catégories !',
              audio: 'L\'audio a été enlevé des catégories !',
              file: 'Le fichier a été enlevé des catégories !',
            },
            download: {
              gif: 'Le GIF a été téléchargé !',
              image: 'L\'image a été téléchargée !',
              video: 'La vidéo a été téléchargée !',
              audio: 'L\'audio a été téléchargé !',
              file: 'Le fichier a été téléchargé !',
            },
          },
          error: {
            download: {
              gif: 'Échec lors du téléchargement du GIF',
              image: 'Échec lors du téléchargement de l\'image',
              video: 'Échec lors du téléchargement de la vidéo',
              audio: 'Échec lors du téléchargement de l\'audio',
              file: 'Échec lors du téléchargement du fichier',
            },
          },
          controls: {
            show: 'Afficher les commandes',
            hide: 'Cacher les commandes',
          },
          placeholder: {
            gif: 'Nom du GIF',
            image: 'Nom de l\'image',
            video: 'Nom de la vidéo',
            audio: 'Nom de l\'audio',
            file: 'Nom du fichier',
          },
        },
        searchItem: {
          gif: 'Rechercher des GIFs ou des catégories',
          image: 'Rechercher des images ou des catégories',
          video: 'Rechercher des vidéos ou des catégories',
          audio: 'Rechercher des audios ou des catégories',
          file: 'Rechercher des fichiers ou des catégories',
        },
        import: {
          panel: 'Importation de médias',
          label: {
            types: 'Types',
            medias: 'Médias',
            categories: 'Catégories',
          },
          buttonImport: 'Importer',
          success: 'Les médias ont été importés !',
          error: 'Échec lors de l\'importation des médias',
        },
        cache: {
          panel: 'Base de données locale',
          total: 'Total :',
          size: 'Taille :',
          clear: {
            confirm: 'Voulez-vous vraiment vider la base de donnée ?',
            button: 'Vider la base de données',
            success: 'La base de donnée a été vidée !',
            error: 'Échec lors du vidage de la base de donnée',
          },
          cacheAll: {
            button: 'Mettre en cache tous les médias',
            confirm: 'Voulez-vous mettre en cache tous les médias ?',
            noMedia: 'Il n\'y a aucun média à mettre en cache',
            success: 'Les médias on été mis en cache !',
            error: 'Échec lors de la mise en cache des médias',
          },
          refreshButton: 'Actualiser',
        },
        mediasCounter: 'Nombre de médias',
        settings: {
          hideUnsortedMedias: {
            name: 'Cacher les médias',
            note: 'Cache les médias de l\'onglet qui sont sans catégorie',
          },
          hideThumbnail: {
            name: 'Cacher les miniatures',
            note: 'Affiche la couleur de la catégorie à la place d\'une miniature aléatoire',
          },
          allowCaching: {
            name: 'Autoriser la mise en cache de l\'aperçu des médias',
            note: 'Utilise le cache hors-ligne local pour mettre en cache l\'aperçu des médias',
          },
          mediaVolume: {
            name: 'Volume des médias',
            note: 'Volume de lecture des médias dans l\'onglet',
          },
          maxMediasPerPage: {
            name: 'Nombre de médias maximum par page',
            note: 'Le nombre maximum de médias affichés par page dans l\'onglet',
          },
          position: {
            name: 'Position des boutons',
          },
          gif: {
            name: 'Paramètres des GIFs',
            enabled: {
              name: 'Général',
              note: 'Remplace l\'onglet GIF de Discord',
            },
            alwaysSendInstantly: {
              name: 'Envoie immédiat',
              note: 'Envoie immédiatement le lien ou fichier des médias',
            },
            alwaysUploadFile: {
              name: 'Toujours upload comme fichier',
              note: 'Upload les médias comme fichier plutôt qu\'envoyer un lien',
            },
          },
          image: {
            name: 'Paramètres des images',
            enabled: {
              name: 'Général',
              note: 'Active ce type de média',
            },
            showBtn: {
              name: 'Bouton',
              note: 'Affiche le bouton sur la barre de discussion',
            },
            showStar: {
              name: 'Étoile',
              note: 'Affiche l\'étoile de favoris sur les médias',
            },
            alwaysSendInstantly: {
              name: 'Envoie immédiat',
              note: 'Envoie immédiatement le lien ou fichier des médias',
            },
            alwaysUploadFile: {
              name: 'Toujours upload comme fichier',
              note: 'Upload les médias comme fichier plutôt qu\'envoyer un lien',
            },
          },
          video: {
            name: 'Paramètres des vidéos',
            enabled: {
              name: 'Général',
              note: 'Active ce type de média',
            },
            showBtn: {
              name: 'Bouton',
              note: 'Affiche le bouton sur la barre de discussion',
            },
            showStar: {
              name: 'Étoile',
              note: 'Affiche l\'étoile de favoris sur les médias',
            },
            alwaysSendInstantly: {
              name: 'Envoie immédiat',
              note: 'Envoie immédiatement le lien ou fichier des médias',
            },
            alwaysUploadFile: {
              name: 'Toujours upload comme fichier',
              note: 'Upload les médias comme fichier plutôt qu\'envoyer un lien',
            },
          },
          audio: {
            name: 'Paramètres des audios',
            enabled: {
              name: 'Général',
              note: 'Active ce type de média',
            },
            showBtn: {
              name: 'Bouton',
              note: 'Affiche le bouton sur la barre de discussion',
            },
            showStar: {
              name: 'Étoile',
              note: 'Affiche l\'étoile de favoris sur les médias',
            },
          },
          file: {
            name: 'Paramètres des fichiers',
            enabled: {
              name: 'Général',
              note: 'Active ce type de média',
            },
            showBtn: {
              name: 'Bouton',
              note: 'Affiche le bouton sur la barre de discussion',
            },
            showStar: {
              name: 'Étoile',
              note: 'Affiche l\'étoile de favoris sur les médias',
            },
            alwaysSendInstantly: {
              name: 'Envoie immédiat',
              note: 'Envoie immédiatement le lien ou fichier des médias',
            },
            alwaysUploadFile: {
              name: 'Toujours upload comme fichier',
              note: 'Upload les médias comme fichier plutôt qu\'envoyer un lien',
            },
          },
          panel: 'Paramètres du plugin',
        },
      },
      hi: { // Hindi
        tabName: {
          image: 'चित्र',
          video: 'वीडियो',
          audio: 'ऑडियो',
          file: 'फ़ाइल',
        },
        create: 'बनाएं',
        category: {
          list: 'श्रेणियाँ',
          unsorted: 'अवर्गीकृत',
          create: 'एक श्रेणी बनाएं',
          edit: 'श्रेणी संपादित करें',
          delete: 'श्रेणी हटाएँ',
          deleteConfirm: 'इस श्रेणी में उपश्रेणियाँ शामिल हैं। वे सभी हटा दिए जाएंगे. क्या आप वाकई श्रेणियां हटाना चाहते हैं?',
          download: 'मीडिया डाउनलोड करें',
          refreshUrls: 'यूआरएल ताज़ा करें',
          placeholder: 'श्रेणी नाम',
          move: 'कदम',
          moveNext: 'बाद',
          movePrevious: 'पहले',
          color: 'रंग',
          copyColor: 'रंग कॉपी करें',
          setThumbnail: 'थंबनेल के रूप में सेट करें',
          unsetThumbnail: 'थंबनेल हटाएँ',
          error: {
            needName: 'नाम खाली नहीं हो सकता',
            invalidNameLength: 'नाम में अधिकतम 20 अक्षर होने चाहिए',
            wrongColor: 'रंग अमान्य है',
            nameExists: 'यह नाम पहले से ही मौजूद है',
            invalidCategory: 'श्रेणी मौजूद नहीं है',
            download: 'मीडिया डाउनलोड करने में विफल',
          },
          success: {
            create: 'श्रेणी बनाई गई है!',
            delete: 'श्रेणी हटा दी गई है!',
            edit: 'श्रेणी संशोधित कर दी गई है!',
            move: 'श्रेणी स्थानांतरित कर दी गई है!',
            download: 'मीडिया अपलोड कर दिया गया है!',
            setThumbnail: 'श्रेणी के लिए थंबनेल सेट!',
            unsetThumbnail: 'श्रेणी के लिए थंबनेल हटा दिया गया!',
            refreshUrls: 'यूआरएल ताज़ा!',
          },
          emptyHint: 'श्रेणी बनाने के लिए राइट-क्लिक करें!',
        },
        media: {
          emptyHint: {
            image: 'किसी छवि को अपने पसंदीदा में जोड़ने के लिए उसके कोने में स्थित तारे पर क्लिक करें',
            video: 'किसी वीडियो को अपने पसंदीदा में जोड़ने के लिए उसके कोने में स्थित तारे पर क्लिक करें',
            audio: 'किसी ऑडियो को अपने पसंदीदा में जोड़ने के लिए उसके कोने में स्थित तारे पर क्लिक करें',
            file: 'किसी फ़ाइल को अपने पसंदीदा में जोड़ने के लिए उसके कोने में स्थित तारे पर क्लिक करें',
          },
          addTo: 'जोड़ना',
          moveTo: 'कदम',
          removeFrom: 'श्रेणी से हटाएँ',
          copySource: 'मीडिया स्रोत की प्रतिलिपि बनाएँ',
          upload: {
            title: 'डालना',
            normal: 'सामान्य',
            spoiler: 'विफल',
          },
          success: {
            move: {
              gif: 'GIF को स्थानांतरित कर दिया गया है!',
              image: 'छवि को स्थानांतरित कर दिया गया है!',
              video: 'वीडियो स्थानांतरित कर दिया गया है!',
              audio: 'ऑडियो स्थानांतरित कर दिया गया है!',
              file: 'फ़ाइल स्थानांतरित कर दी गई है!',
            },
            remove: {
              gif: 'GIF को श्रेणियों से हटा दिया गया है!',
              image: 'छवि को श्रेणियों से हटा दिया गया है!',
              video: 'वीडियो को श्रेणियों से हटा दिया गया है!',
              audio: 'ऑडियो को श्रेणियों से हटा दिया गया है!',
              file: 'फ़ाइल को श्रेणियों से हटा दिया गया है!',
            },
            download: {
              gif: 'GIF अपलोड कर दिया गया है!',
              image: 'छवि अपलोड कर दी गई है!',
              video: 'वीडियो अपलोड कर दिया गया है!',
              audio: 'ऑडियो अपलोड कर दिया गया है!',
              file: 'फ़ाइल डाउनलोड हो गई है!',
            },
          },
          error: {
            download: {
              gif: 'GIF डाउनलोड करने में विफल',
              image: 'छवि अपलोड करने में विफल',
              video: 'वीडियो डाउनलोड करने में विफल',
              audio: 'ऑडियो डाउनलोड करने में विफल',
              file: 'फ़ाइल डाउनलोड करने में विफल',
            },
          },
          controls: {
            show: 'आदेश दिखाएँ',
            hide: 'आदेश छिपाएँ',
          },
          placeholder: {
            gif: 'GIF नाम',
            image: 'छवि का नाम',
            video: 'वीडियो का नाम',
            audio: 'ऑडियो नाम',
            file: 'फ़ाइल का नाम',
          },
        },
        searchItem: {
          gif: 'GIF या श्रेणियां खोजें',
          image: 'छवियाँ या श्रेणियाँ खोजें',
          video: 'वीडियो या श्रेणियां खोजें',
          audio: 'ऑडियो या श्रेणियां खोजें',
          file: 'फ़ाइलें या श्रेणियां खोजें',
        },
        import: {
          panel: 'मीडिया आयात',
          label: {
            types: 'प्रकार',
            medias: 'मिडिया',
            categories: 'श्रेणियाँ',
          },
          buttonImport: 'आयात',
          success: 'मीडिया आयातित किया गया है!',
          error: 'मीडिया आयात करने में विफल',
        },
        cache: {
          panel: 'स्थानीय डेटाबेस',
          total: 'कुल :',
          size: 'आकार :',
          clear: {
            confirm: 'क्या आप सचमुच डेटाबेस खाली करना चाहते हैं?',
            button: 'खाली डेटाबेस',
            success: 'डेटाबेस खाली कर दिया गया है!',
            error: 'डेटाबेस डंप करने में विफल',
          },
          cacheAll: {
            button: 'सभी मीडिया को कैश करें',
            confirm: 'क्या आप सभी मीडिया को कैश करना चाहते हैं?',
            noMedia: 'कैश करने के लिए कोई मीडिया नहीं है',
            success: 'मीडिया को कैश कर दिया गया है!',
            error: 'मीडिया को कैशिंग करते समय विफलता',
          },
          refreshButton: 'ताज़ा करना',
        },
        mediasCounter: 'मीडिया की संख्या',
        settings: {
          hideUnsortedMedias: {
            name: 'मीडिया छिपाओ',
            note: 'मीडिया को उस टैब से छिपाएँ जो अवर्गीकृत है',
          },
          hideThumbnail: {
            name: 'थंबनेल छिपाएँ',
            note: 'यादृच्छिक थंबनेल के बजाय श्रेणी का रंग दिखाता है',
          },
          allowCaching: {
            name: 'मीडिया पूर्वावलोकन कैशिंग की अनुमति दें',
            note: 'मीडिया पूर्वावलोकन को कैश करने के लिए स्थानीय ऑफ़लाइन कैश का उपयोग करता है',
          },
          mediaVolume: {
            name: 'मीडिया वॉल्यूम',
            note: 'टैब में मीडिया प्लेबैक वॉल्यूम',
          },
          maxMediasPerPage: {
            name: 'प्रति पृष्ठ मीडिया की अधिकतम संख्या',
            note: 'टैब में प्रति पृष्ठ प्रदर्शित मीडिया की अधिकतम संख्या',
          },
          position: {
            name: 'बटन की स्थिति',
          },
          gif: {
            name: 'जीआईएफ सेटिंग्स',
            enabled: {
              name: 'सामान्य',
              note: 'डिस्कॉर्ड के GIF टैब को प्रतिस्थापित करता है',
            },
            alwaysSendInstantly: {
              name: 'तत्काल वितरण',
              note: 'तुरंत मीडिया लिंक या फ़ाइल भेजें',
            },
            alwaysUploadFile: {
              name: 'हमेशा फ़ाइल के रूप में अपलोड करें',
              note: 'लिंक भेजने के बजाय मीडिया को फ़ाइल के रूप में अपलोड करें',
            },
          },
          image: {
            name: 'छवि सेटिंग्स',
            enabled: {
              name: 'सामान्य',
              note: 'इस मीडिया प्रकार को सक्षम करें',
            },
            showBtn: {
              name: 'बटन',
              note: 'चैट बार पर शो बटन',
            },
            showStar: {
              name: 'तारा',
              note: 'मीडिया पर पसंदीदा स्टार दिखाता है',
            },
            alwaysSendInstantly: {
              name: 'तत्काल वितरण',
              note: 'तुरंत मीडिया लिंक या फ़ाइल भेजें',
            },
            alwaysUploadFile: {
              name: 'हमेशा फ़ाइल के रूप में अपलोड करें',
              note: 'लिंक भेजने के बजाय मीडिया को फ़ाइल के रूप में अपलोड करें',
            },
          },
          video: {
            name: 'वीडियो सेटिंग्स',
            enabled: {
              name: 'सामान्य',
              note: 'इस मीडिया प्रकार को सक्षम करें',
            },
            showBtn: {
              name: 'बटन',
              note: 'चैट बार पर शो बटन',
            },
            showStar: {
              name: 'तारा',
              note: 'मीडिया पर पसंदीदा स्टार दिखाता है',
            },
            alwaysSendInstantly: {
              name: 'तत्काल वितरण',
              note: 'तुरंत मीडिया लिंक या फ़ाइल भेजें',
            },
            alwaysUploadFile: {
              name: 'हमेशा फ़ाइल के रूप में अपलोड करें',
              note: 'लिंक भेजने के बजाय मीडिया को फ़ाइल के रूप में अपलोड करें',
            },
          },
          audio: {
            name: 'श्रव्य विन्यास',
            enabled: {
              name: 'सामान्य',
              note: 'इस मीडिया प्रकार को सक्षम करें',
            },
            showBtn: {
              name: 'बटन',
              note: 'चैट बार पर शो बटन',
            },
            showStar: {
              name: 'तारा',
              note: 'मीडिया पर पसंदीदा स्टार दिखाता है',
            },
          },
          file: {
            name: 'फ़ाइल सेटिंग्स',
            enabled: {
              name: 'सामान्य',
              note: 'इस मीडिया प्रकार को सक्षम करें',
            },
            showBtn: {
              name: 'बटन',
              note: 'चैट बार पर शो बटन',
            },
            showStar: {
              name: 'तारा',
              note: 'मीडिया पर पसंदीदा स्टार दिखाता है',
            },
            alwaysSendInstantly: {
              name: 'तत्काल वितरण',
              note: 'तुरंत मीडिया लिंक या फ़ाइल भेजें',
            },
            alwaysUploadFile: {
              name: 'हमेशा फ़ाइल के रूप में अपलोड करें',
              note: 'लिंक भेजने के बजाय मीडिया को फ़ाइल के रूप में अपलोड करें',
            },
          },
          panel: 'प्लगइन सेटिंग्स',
        },
      },
      hr: { // Croatian
        tabName: {
          image: 'Slika',
          video: 'Video',
          audio: 'Audio',
          file: 'Datoteka',
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
          refreshUrls: 'Osvježi URL-ove',
          placeholder: 'Ime kategorije',
          move: 'Potez',
          moveNext: 'Nakon',
          movePrevious: 'Prije',
          color: 'Boja',
          copyColor: 'Kopiraj u boji',
          setThumbnail: 'Postavi kao sličicu',
          unsetThumbnail: 'Ukloni sličicu',
          error: {
            needName: 'Ime ne može biti prazno',
            invalidNameLength: 'Ime mora sadržavati najviše 20 znakova',
            wrongColor: 'Boja je nevaljana',
            nameExists: 'ovo ime već postoji',
            invalidCategory: 'Kategorija ne postoji',
            download: 'Preuzimanje medija nije uspjelo',
          },
          success: {
            create: 'Kategorija je stvorena!',
            delete: 'Kategorija je izbrisana!',
            edit: 'Izmijenjena je kategorija!',
            move: 'Kategorija je premještena!',
            download: 'Mediji su učitani!',
            setThumbnail: 'Postavljena sličica za kategoriju!',
            unsetThumbnail: 'Sličica uklonjena za kategoriju!',
            refreshUrls: 'URL-ovi osvježeni!',
          },
          emptyHint: 'Desni klik za stvaranje kategorije!',
        },
        media: {
          emptyHint: {
            image: 'Kliknite zvjezdicu u kutu slike da biste je stavili među svoje favorite',
            video: 'Kliknite zvjezdicu u kutu videozapisa da biste je stavili među svoje favorite',
            audio: 'Kliknite zvjezdicu u kutu zvuka da biste je stavili među svoje favorite',
            file: 'Pritisnite zvjezdicu u kutu datoteke kako biste je dodali u svoje favorite',
          },
          addTo: 'Dodati',
          moveTo: 'Potez',
          removeFrom: 'Ukloni iz kategorije',
          copySource: 'Kopiraj izvor medija',
          upload: {
            title: 'Učitaj',
            normal: 'Normalan',
            spoiler: 'Spoiler',
          },
          success: {
            move: {
              gif: 'GIF je premješten!',
              image: 'Slika je premještena!',
              video: 'Video je premješten!',
              audio: 'Zvuk je premješten!',
              file: 'Datoteka je premještena!',
            },
            remove: {
              gif: 'GIF je uklonjen iz kategorija!',
              image: 'Slika je uklonjena iz kategorija!',
              video: 'Videozapis je uklonjen iz kategorija!',
              audio: 'Audio je uklonjen iz kategorija!',
              file: 'Datoteka je uklonjena iz kategorija!',
            },
            download: {
              gif: 'GIF je učitan!',
              image: 'Slika je učitana!',
              video: 'Video je postavljen!',
              audio: 'Zvuk je preuzet!',
              file: 'Datoteka je preuzeta!',
            },
          },
          error: {
            download: {
              gif: 'Preuzimanje GIF-a nije uspjelo',
              image: 'Učitavanje slike nije uspjelo',
              video: 'Preuzimanje videozapisa nije uspjelo',
              audio: 'Preuzimanje zvuka nije uspjelo',
              file: 'Preuzimanje datoteke nije uspjelo',
            },
          },
          controls: {
            show: 'Prikaži narudžbe',
            hide: 'Sakrij narudžbe',
          },
          placeholder: {
            gif: 'Naziv GIF-a',
            image: 'Naziv slike',
            video: 'Naziv videozapisa',
            audio: 'Naziv zvuka',
            file: 'Naziv datoteke',
          },
        },
        searchItem: {
          gif: 'Potražite GIF-ove ili kategorije',
          image: 'Potražite slike ili kategorije',
          video: 'Potražite videozapise ili kategorije',
          audio: 'Potražite audio ili kategorije',
          file: 'Traženje datoteka ili kategorija',
        },
        import: {
          panel: 'Uvoz medija',
          label: {
            types: 'Vrste',
            medias: 'Mediji',
            categories: 'Kategorije',
          },
          buttonImport: 'Uvoz',
          success: 'Mediji su uvezeni!',
          error: 'Uvoz medija nije uspio',
        },
        cache: {
          panel: 'Lokalna baza podataka',
          total: 'Ukupno:',
          size: 'Veličina:',
          clear: {
            confirm: 'Želite li stvarno isprazniti bazu podataka?',
            button: 'Prazna baza podataka',
            success: 'Baza podataka je ispražnjena!',
            error: 'Ispis baze podataka nije uspio',
          },
          cacheAll: {
            button: 'Predmemorija svih medija',
            confirm: 'Želite li predmemorirati sve medije?',
            noMedia: 'Nema medija za predmemoriju',
            success: 'Mediji su spremljeni u predmemoriju!',
            error: 'Pogreška tijekom predmemoriranja medija',
          },
          refreshButton: 'Osvježiti',
        },
        mediasCounter: 'Broj medija',
        settings: {
          hideUnsortedMedias: {
            name: 'Sakrij medije',
            note: 'Sakrij medije s kartice koji nisu kategorizirani',
          },
          hideThumbnail: {
            name: 'Sakrij sličice',
            note: 'Prikazuje boju kategorije umjesto nasumične minijature',
          },
          allowCaching: {
            name: 'Dopusti predmemoriranje pregleda medija',
            note: 'Koristi lokalnu izvanmrežnu predmemoriju za predmemoriju pregleda medija',
          },
          mediaVolume: {
            name: 'Glasnoća medija',
            note: 'Glasnoća reprodukcije medija u tab',
          },
          maxMediasPerPage: {
            name: 'Maksimalan broj medija po stranici',
            note: 'Maksimalan broj medija prikazanih po stranici na kartici',
          },
          position: {
            name: 'Položaj gumba',
          },
          gif: {
            name: 'GIF postavke',
            enabled: {
              name: 'Općenito',
              note: 'Zamjenjuje Discordovu GIF karticu',
            },
            alwaysSendInstantly: {
              name: 'Isporuka odmah',
              note: 'Odmah pošaljite medijsku vezu ili datoteku',
            },
            alwaysUploadFile: {
              name: 'Uvijek učitaj kao datoteku',
              note: 'Prijenos medija kao datoteke umjesto slanja veze',
            },
          },
          image: {
            name: 'Postavke slike',
            enabled: {
              name: 'Općenito',
              note: 'Omogućite ovu vrstu medija',
            },
            showBtn: {
              name: 'Dugme',
              note: 'Prikaži gumb na traci za chat',
            },
            showStar: {
              name: 'Zvijezda',
              note: 'Prikazuje omiljenu zvijezdu u medijima',
            },
            alwaysSendInstantly: {
              name: 'Isporuka odmah',
              note: 'Odmah pošaljite medijsku vezu ili datoteku',
            },
            alwaysUploadFile: {
              name: 'Uvijek učitaj kao datoteku',
              note: 'Prijenos medija kao datoteke umjesto slanja veze',
            },
          },
          video: {
            name: 'Video postavke',
            enabled: {
              name: 'Općenito',
              note: 'Omogućite ovu vrstu medija',
            },
            showBtn: {
              name: 'Dugme',
              note: 'Prikaži gumb na traci za chat',
            },
            showStar: {
              name: 'Zvijezda',
              note: 'Prikazuje omiljenu zvijezdu u medijima',
            },
            alwaysSendInstantly: {
              name: 'Isporuka odmah',
              note: 'Odmah pošaljite medijsku vezu ili datoteku',
            },
            alwaysUploadFile: {
              name: 'Uvijek učitaj kao datoteku',
              note: 'Prijenos medija kao datoteke umjesto slanja veze',
            },
          },
          audio: {
            name: 'Audio postavke',
            enabled: {
              name: 'Općenito',
              note: 'Omogućite ovu vrstu medija',
            },
            showBtn: {
              name: 'Dugme',
              note: 'Prikaži gumb na traci za chat',
            },
            showStar: {
              name: 'Zvijezda',
              note: 'Prikazuje omiljenu zvijezdu u medijima',
            },
          },
          file: {
            name: 'Postavke datoteke',
            enabled: {
              name: 'Općenito',
              note: 'Omogućite ovu vrstu medija',
            },
            showBtn: {
              name: 'Dugme',
              note: 'Prikaži gumb na traci za chat',
            },
            showStar: {
              name: 'Zvijezda',
              note: 'Prikazuje omiljenu zvijezdu u medijima',
            },
            alwaysSendInstantly: {
              name: 'Isporuka odmah',
              note: 'Odmah pošaljite medijsku vezu ili datoteku',
            },
            alwaysUploadFile: {
              name: 'Uvijek učitaj kao datoteku',
              note: 'Prijenos medija kao datoteke umjesto slanja veze',
            },
          },
          panel: 'Postavke dodatka',
        },
      },
      hu: { // Hungarian
        tabName: {
          image: 'Kép',
          video: 'Videó',
          audio: 'Hang',
          file: 'Fájl',
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
          refreshUrls: 'URL-ek frissítése',
          placeholder: 'Kategória név',
          move: 'Mozog',
          moveNext: 'Utána',
          movePrevious: 'Előtt',
          color: 'Szín',
          copyColor: 'Szín másolása',
          setThumbnail: 'Beállítás indexképként',
          unsetThumbnail: 'Indexkép eltávolítása',
          error: {
            needName: 'A név nem lehet üres',
            invalidNameLength: 'A név legfeljebb 20 karakterből állhat',
            wrongColor: 'A szín érvénytelen',
            nameExists: 'Ez a név már létezik',
            invalidCategory: 'A kategória nem létezik',
            download: 'Nem sikerült letölteni a médiát',
          },
          success: {
            create: 'A kategória elkészült!',
            delete: 'A kategória törölve lett!',
            edit: 'A kategória megváltozott!',
            move: 'A kategória áthelyezve!',
            download: 'A média feltöltve!',
            setThumbnail: 'Miniatűr készlet a kategóriához!',
            unsetThumbnail: 'A kategória miniatűrje eltávolítva!',
            refreshUrls: 'Az URL-ek frissítve!',
          },
          emptyHint: 'Kattintson jobb gombbal a kategória létrehozásához!',
        },
        media: {
          emptyHint: {
            image: 'Kattintson a kép sarkában lévő csillagra, hogy a kedvencek közé helyezze',
            video: 'Kattintson a videó sarkában lévő csillagra, hogy a kedvencek közé tegye',
            audio: 'Kattintson a csillagra egy hang sarkában, hogy a kedvencek közé helyezze',
            file: 'Kattintson a csillagra a fájl sarkában, hogy hozzáadja a kedvenceihez',
          },
          addTo: 'Hozzáadás',
          moveTo: 'Mozog',
          removeFrom: 'Törlés a kategóriából',
          copySource: 'Médiaforrás másolása',
          upload: {
            title: 'Feltöltés',
            normal: 'Normál',
            spoiler: 'Spoiler',
          },
          success: {
            move: {
              gif: 'A GIF át lett helyezve!',
              image: 'A kép áthelyezve!',
              video: 'A videó áthelyezve!',
              audio: 'A hang áthelyezve!',
              file: 'A fájl át lett helyezve!',
            },
            remove: {
              gif: 'A GIF eltávolítva a kategóriákból!',
              image: 'A képet eltávolítottuk a kategóriákból!',
              video: 'A videót eltávolítottuk a kategóriákból!',
              audio: 'A hangot eltávolítottuk a kategóriákból!',
              file: 'A fájl eltávolítva a kategóriákból!',
            },
            download: {
              gif: 'A GIF feltöltve!',
              image: 'A kép feltöltve!',
              video: 'A videó feltöltve!',
              audio: 'A hanganyag letöltve!',
              file: 'A fájl letöltése megtörtént!',
            },
          },
          error: {
            download: {
              gif: 'A GIF letöltése sikertelen',
              image: 'Nem sikerült feltölteni a képet',
              video: 'Nem sikerült letölteni a videót',
              audio: 'Nem sikerült letölteni a hangot',
              file: 'Nem sikerült letölteni a fájlt',
            },
          },
          controls: {
            show: 'Mutasson megrendeléseket',
            hide: 'Parancsok elrejtése',
          },
          placeholder: {
            gif: 'GIF név',
            image: 'Kép neve',
            video: 'Videó neve',
            audio: 'Hang neve',
            file: 'Fájl név',
          },
        },
        searchItem: {
          gif: 'Keressen GIF-eket vagy kategóriákat',
          image: 'Képek vagy kategóriák keresése',
          video: 'Videók vagy kategóriák keresése',
          audio: 'Audió vagy kategória keresése',
          file: 'Fájlok vagy kategóriák keresése',
        },
        import: {
          panel: 'Média importálása',
          label: {
            types: 'Típusok',
            medias: 'Média',
            categories: 'Kategóriák',
          },
          buttonImport: 'Importálás',
          success: 'A médiát importálták!',
          error: 'Nem sikerült importálni a médiát',
        },
        cache: {
          panel: 'Helyi adatbázis',
          total: 'Teljes :',
          size: 'Méret:',
          clear: {
            confirm: 'Valóban ki akarja üríteni az adatbázist?',
            button: 'Üres adatbázis',
            success: 'Az adatbázis kiürült!',
            error: 'Nem sikerült kiírni az adatbázist',
          },
          cacheAll: {
            button: 'Az összes média gyorsítótárazása',
            confirm: 'Gyorsítótárba szeretné helyezni az összes médiát?',
            noMedia: 'Nincs adathordozó a gyorsítótárban',
            success: 'A média gyorsítótárba került!',
            error: 'Hiba a média gyorsítótárazásakor',
          },
          refreshButton: 'Frissítés',
        },
        mediasCounter: 'A média száma',
        settings: {
          hideUnsortedMedias: {
            name: 'Média elrejtése',
            note: 'A kategorizálatlan média elrejtése a lapról',
          },
          hideThumbnail: {
            name: 'Bélyegképek elrejtése',
            note: 'A kategória színét jeleníti meg véletlenszerű bélyegkép helyett',
          },
          allowCaching: {
            name: 'Média előnézeti gyorsítótárazásának engedélyezése',
            note: 'Helyi offline gyorsítótárat használ a média előnézetének gyorsítótárazásához',
          },
          mediaVolume: {
            name: 'Média hangereje',
            note: 'Médialejátszás hangereje a lapon',
          },
          maxMediasPerPage: {
            name: 'Az oldalankénti média maximális száma',
            note: 'A lapon oldalanként megjelenített média maximális száma',
          },
          position: {
            name: 'A gomb pozíciója',
          },
          gif: {
            name: 'GIF beállítások',
            enabled: {
              name: 'Tábornok',
              note: 'A Discord GIF lapját helyettesíti',
            },
            alwaysSendInstantly: {
              name: 'Azonnali kiszállítás',
              note: 'Azonnal küldje el a média hivatkozást vagy fájlt',
            },
            alwaysUploadFile: {
              name: 'Mindig fájlként töltsd fel',
              note: 'A médiát fájlként töltse fel a hivatkozás küldése helyett',
            },
          },
          image: {
            name: 'Képbeállítások',
            enabled: {
              name: 'Tábornok',
              note: 'Engedélyezze ezt a médiatípust',
            },
            showBtn: {
              name: 'Gomb',
              note: 'A gomb megjelenítése a csevegősávon',
            },
            showStar: {
              name: 'Csillag',
              note: 'Kedvenc sztárját mutatja a médiában',
            },
            alwaysSendInstantly: {
              name: 'Azonnali kiszállítás',
              note: 'Azonnal küldje el a média hivatkozást vagy fájlt',
            },
            alwaysUploadFile: {
              name: 'Mindig fájlként töltsd fel',
              note: 'A médiát fájlként töltse fel a hivatkozás küldése helyett',
            },
          },
          video: {
            name: 'Videó beállítások',
            enabled: {
              name: 'Tábornok',
              note: 'Engedélyezze ezt a médiatípust',
            },
            showBtn: {
              name: 'Gomb',
              note: 'A gomb megjelenítése a csevegősávon',
            },
            showStar: {
              name: 'Csillag',
              note: 'Kedvenc sztárját mutatja a médiában',
            },
            alwaysSendInstantly: {
              name: 'Azonnali kiszállítás',
              note: 'Azonnal küldje el a média hivatkozást vagy fájlt',
            },
            alwaysUploadFile: {
              name: 'Mindig fájlként töltsd fel',
              note: 'A médiát fájlként töltse fel a hivatkozás küldése helyett',
            },
          },
          audio: {
            name: 'Hangbeállítások',
            enabled: {
              name: 'Tábornok',
              note: 'Engedélyezze ezt a médiatípust',
            },
            showBtn: {
              name: 'Gomb',
              note: 'A gomb megjelenítése a csevegősávon',
            },
            showStar: {
              name: 'Csillag',
              note: 'Kedvenc sztárját mutatja a médiában',
            },
          },
          file: {
            name: 'Fájlbeállítások',
            enabled: {
              name: 'Tábornok',
              note: 'Engedélyezze ezt a médiatípust',
            },
            showBtn: {
              name: 'Gomb',
              note: 'A gomb megjelenítése a csevegősávon',
            },
            showStar: {
              name: 'Csillag',
              note: 'Kedvenc sztárját mutatja a médiában',
            },
            alwaysSendInstantly: {
              name: 'Azonnali kiszállítás',
              note: 'Azonnal küldje el a média hivatkozást vagy fájlt',
            },
            alwaysUploadFile: {
              name: 'Mindig fájlként töltsd fel',
              note: 'A médiát fájlként töltse fel a hivatkozás küldése helyett',
            },
          },
          panel: 'Beépülő modul beállításai',
        },
      },
      it: { // Italian
        tabName: {
          image: 'Immagine',
          video: 'video',
          audio: 'Audio',
          file: 'File',
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
          refreshUrls: 'Aggiorna URL',
          placeholder: 'Nome della categoria',
          move: 'Spostare',
          moveNext: 'Dopo',
          movePrevious: 'Prima',
          color: 'Colore',
          copyColor: 'Copia colore',
          setThumbnail: 'Imposta come miniatura',
          unsetThumbnail: 'Rimuovi la miniatura',
          error: {
            needName: 'Il nome non può essere vuoto',
            invalidNameLength: 'Il nome deve contenere un massimo di 20 caratteri',
            wrongColor: 'Il colore non è valido',
            nameExists: 'Questo nome esiste già',
            invalidCategory: 'La categoria non esiste',
            download: 'Impossibile scaricare i media',
          },
          success: {
            create: 'La categoria è stata creata!',
            delete: 'La categoria è stata eliminata!',
            edit: 'La categoria è stata cambiata!',
            move: 'La categoria è stata spostata!',
            download: 'Il supporto è stato caricato!',
            setThumbnail: 'Set di miniature per categoria!',
            unsetThumbnail: 'Miniatura rimossa per la categoria!',
            refreshUrls: 'URL aggiornati!',
          },
          emptyHint: 'Fare clic con il tasto destro per creare una categoria!',
        },
        media: {
          emptyHint: {
            image: 'Fai clic sulla stella nell\'angolo di un\'immagine per inserirla nei preferiti',
            video: 'Fai clic sulla stella nell\'angolo di un video per inserirlo nei preferiti',
            audio: 'Fai clic sulla stella nell\'angolo di un audio per inserirlo nei preferiti',
            file: "Fai clic sulla stella nell'angolo di un file per aggiungerlo ai tuoi preferiti",
          },
          addTo: 'Inserisci',
          moveTo: 'Spostare',
          removeFrom: 'Rimuovi dalla categoria',
          copySource: 'Copia la fonte multimediale',
          upload: {
            title: 'Caricare',
            normal: 'Normale',
            spoiler: 'spoiler',
          },
          success: {
            move: {
              gif: 'La GIF è stata spostata!',
              image: 'L\'immagine è stata spostata!',
              video: 'Il video è stato spostato!',
              audio: 'L\'audio è stato spostato!',
              file: 'Il file è stato spostato!',
            },
            remove: {
              gif: 'La GIF è stata rimossa dalle categorie!',
              image: 'L\'immagine è stata rimossa dalle categorie!',
              video: 'Il video è stato rimosso dalle categorie!',
              audio: 'L\'audio è stato rimosso dalle categorie!',
              file: 'Il file è stato rimosso dalle categorie!',
            },
            download: {
              gif: 'La GIF è stata caricata!',
              image: 'L\'immagine è stata caricata!',
              video: 'Il video è stato caricato!',
              audio: 'L\'audio è stato scaricato!',
              file: 'Il file è stato scaricato!',
            },
          },
          error: {
            download: {
              gif: 'Impossibile scaricare la GIF',
              image: 'Impossibile caricare l\'immagine',
              video: 'Impossibile scaricare il video',
              audio: 'Impossibile scaricare l\'audio',
              file: 'Impossibile scaricare il file',
            },
          },
          controls: {
            show: 'Mostra ordini',
            hide: 'Nascondi ordini',
          },
          placeholder: {
            gif: 'Nome GIF',
            image: 'Nome immagine',
            video: 'Nome del video',
            audio: 'Nome dell\'audio',
            file: 'Nome del file',
          },
        },
        searchItem: {
          gif: 'Cerca GIF o categorie',
          image: 'Cerca immagini o categorie',
          video: 'Cerca video o categorie',
          audio: 'Cerca audio o categorie',
          file: 'Ricerca di file o categorie',
        },
        import: {
          panel: 'Importazione multimediale',
          label: {
            types: 'Tipi',
            medias: 'Media',
            categories: 'Categorie',
          },
          buttonImport: 'Importare',
          success: 'Il supporto è stato importato!',
          error: 'Impossibile importare i contenuti multimediali',
        },
        cache: {
          panel: 'Banca dati locale',
          total: 'Totale :',
          size: 'Formato :',
          clear: {
            confirm: 'Vuoi davvero svuotare il database?',
            button: 'Banca dati vuota',
            success: 'Il database è stato svuotato!',
            error: 'Impossibile eseguire il dump del database',
          },
          cacheAll: {
            button: 'Memorizza nella cache tutti i media',
            confirm: 'Vuoi memorizzare nella cache tutti i media?',
            noMedia: 'Non ci sono supporti da memorizzare nella cache',
            success: 'Il supporto è stato memorizzato nella cache!',
            error: 'Errore durante la memorizzazione nella cache dei media',
          },
          refreshButton: 'ricaricare',
        },
        mediasCounter: 'Numero di supporti',
        settings: {
          hideUnsortedMedias: {
            name: 'Nascondi contenuti multimediali',
            note: 'Nascondi i media dalla scheda che non sono categorizzati',
          },
          hideThumbnail: {
            name: 'Nascondi miniature',
            note: 'Mostra il colore della categoria anziché una miniatura casuale',
          },
          allowCaching: {
            name: "Consenti la memorizzazione nella cache dell'anteprima multimediale",
            note: "Utilizza la cache offline locale per memorizzare nella cache l'anteprima multimediale",
          },
          mediaVolume: {
            name: 'Volume multimediale',
            note: 'Volume di riproduzione multimediale nella scheda',
          },
          maxMediasPerPage: {
            name: 'Numero massimo di supporti per pagina',
            note: 'Il numero massimo di contenuti multimediali visualizzati per pagina nella scheda',
          },
          position: {
            name: 'Posizione del pulsante',
          },
          gif: {
            name: 'Impostazioni GIF',
            enabled: {
              name: 'Generale',
              note: 'Sostituisce la scheda GIF di Discord',
            },
            alwaysSendInstantly: {
              name: 'Consegna immediata',
              note: 'Invia immediatamente il collegamento multimediale o il file',
            },
            alwaysUploadFile: {
              name: 'Carica sempre come file',
              note: 'Carica i contenuti multimediali come file anziché inviare un collegamento',
            },
          },
          image: {
            name: "Impostazioni dell'immagine",
            enabled: {
              name: 'Generale',
              note: 'Abilita questo tipo di supporto',
            },
            showBtn: {
              name: 'Pulsante',
              note: 'Mostra il pulsante sulla barra della chat',
            },
            showStar: {
              name: 'Stella',
              note: 'Mostra la star preferita sui media',
            },
            alwaysSendInstantly: {
              name: 'Consegna immediata',
              note: 'Invia immediatamente il collegamento multimediale o il file',
            },
            alwaysUploadFile: {
              name: 'Carica sempre come file',
              note: 'Carica i contenuti multimediali come file anziché inviare un collegamento',
            },
          },
          video: {
            name: 'Impostazioni video',
            enabled: {
              name: 'Generale',
              note: 'Abilita questo tipo di supporto',
            },
            showBtn: {
              name: 'Pulsante',
              note: 'Mostra il pulsante sulla barra della chat',
            },
            showStar: {
              name: 'Stella',
              note: 'Mostra la star preferita sui media',
            },
            alwaysSendInstantly: {
              name: 'Consegna immediata',
              note: 'Invia immediatamente il collegamento multimediale o il file',
            },
            alwaysUploadFile: {
              name: 'Carica sempre come file',
              note: 'Carica i contenuti multimediali come file anziché inviare un collegamento',
            },
          },
          audio: {
            name: 'Impostazioni audio',
            enabled: {
              name: 'Generale',
              note: 'Abilita questo tipo di supporto',
            },
            showBtn: {
              name: 'Pulsante',
              note: 'Mostra il pulsante sulla barra della chat',
            },
            showStar: {
              name: 'Stella',
              note: 'Mostra la star preferita sui media',
            },
          },
          file: {
            name: 'Impostazioni del file',
            enabled: {
              name: 'Generale',
              note: 'Abilita questo tipo di supporto',
            },
            showBtn: {
              name: 'Pulsante',
              note: 'Mostra il pulsante sulla barra della chat',
            },
            showStar: {
              name: 'Stella',
              note: 'Mostra la star preferita sui media',
            },
            alwaysSendInstantly: {
              name: 'Consegna immediata',
              note: 'Invia immediatamente il collegamento multimediale o il file',
            },
            alwaysUploadFile: {
              name: 'Carica sempre come file',
              note: 'Carica i contenuti multimediali come file anziché inviare un collegamento',
            },
          },
          panel: 'Impostazioni del plugin',
        },
      },
      ja: { // Japanese
        tabName: {
          image: '画像',
          video: 'ビデオ',
          audio: 'オーディオ',
          file: 'ファイル',
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
          refreshUrls: 'URLを更新する',
          placeholder: '種別名',
          move: '移動',
          moveNext: '後',
          movePrevious: '前',
          color: '色',
          copyColor: 'コピーカラー',
          setThumbnail: 'サムネイルとして設定',
          unsetThumbnail: 'サムネイルを削除する',
          error: {
            needName: '名前を空にすることはできません',
            invalidNameLength: '名前には最大20文字を含める必要があります',
            wrongColor: '色が無効です',
            nameExists: 'この名前はすでに存在します',
            invalidCategory: 'カテゴリが存在しません',
            download: 'メディアのダウンロードに失敗しました',
          },
          success: {
            create: 'カテゴリが作成されました！',
            delete: 'カテゴリが削除されました！',
            edit: 'カテゴリが変更されました！',
            move: 'カテゴリが移動しました！',
            download: 'メディアがアップしました！',
            setThumbnail: 'カテゴリにサムネイルを設定しました！',
            unsetThumbnail: 'カテゴリのサムネイルが削除されました。',
            refreshUrls: 'URLが更新されました！',
          },
          emptyHint: '右クリックしてカテゴリを作成してください！',
        },
        media: {
          emptyHint: {
            image: '画像の隅にある星をクリックして、お気に入りに追加します',
            video: '動画の隅にある星をクリックして、お気に入りに追加します',
            audio: 'オーディオの隅にある星をクリックして、お気に入りに入れます',
            file: 'ファイルの隅にある星をクリックしてお気に入りに追加します',
          },
          addTo: '追加',
          moveTo: '移動',
          removeFrom: 'カテゴリから削除',
          copySource: 'メディア ソースのコピー',
          upload: {
            title: 'アップロード',
            normal: '正常',
            spoiler: 'ネタバレ',
          },
          success: {
            move: {
              gif: 'GIFを移動しました！',
              image: '画像が移動しました！',
              video: 'ビデオが移動しました！',
              audio: '音声が移動しました！',
              file: 'ファイルは移動されました!',
            },
            remove: {
              gif: 'GIF はカテゴリから削除されました。',
              image: '画像はカテゴリから削除されました！',
              video: '動画はカテゴリから削除されました！',
              audio: 'オーディオはカテゴリから削除されました！',
              file: 'ファイルはカテゴリから削除されました。',
            },
            download: {
              gif: 'GIFをアップしました！',
              image: '画像をアップしました！',
              video: '動画がアップしました！',
              audio: '音声がダウンロードされました！',
              file: 'ファイルがダウンロードされました！',
            },
          },
          error: {
            download: {
              gif: 'GIF のダウンロードに失敗しました',
              image: '画像のアップロードに失敗しました',
              video: 'ビデオのダウンロードに失敗しました',
              audio: 'オーディオのダウンロードに失敗しました',
              file: 'ファイルのダウンロードに失敗しました',
            },
          },
          controls: {
            show: '注文を表示',
            hide: '注文を非表示',
          },
          placeholder: {
            gif: 'GIF名',
            image: '画像名',
            video: 'ビデオ名',
            audio: '音声名',
            file: 'ファイル名',
          },
        },
        searchItem: {
          gif: 'GIF またはカテゴリを検索する',
          image: '画像やカテゴリを検索する',
          video: 'ビデオまたはカテゴリを検索する',
          audio: 'オーディオまたはカテゴリを検索する',
          file: 'ファイルまたはカテゴリの検索',
        },
        import: {
          panel: 'メディアのインポート',
          label: {
            types: '種類',
            medias: 'メディア',
            categories: 'カテゴリー',
          },
          buttonImport: '輸入',
          success: 'メディアがインポートされました。',
          error: 'メディアのインポートに失敗しました',
        },
        cache: {
          panel: 'ローカルデータベース',
          total: '合計 ：',
          size: 'サイズ ：',
          clear: {
            confirm: '本当にデータベースを空にしますか?',
            button: '空のデータベース',
            success: 'データベースが空になりました!',
            error: 'データベースのダンプに失敗しました',
          },
          cacheAll: {
            button: 'すべてのメディアをキャッシュする',
            confirm: 'すべてのメディアをキャッシュしますか?',
            noMedia: 'キャッシュするメディアがありません',
            success: 'メディアがキャッシュされました。',
            error: 'メディアのキャッシュ中にエラーが発生しました',
          },
          refreshButton: 'リフレッシュ',
        },
        mediasCounter: 'メディア数',
        settings: {
          hideUnsortedMedias: {
            name: 'メディアを隠す',
            note: '未分類のメディアをタブから非表示にする',
          },
          hideThumbnail: {
            name: 'サムネイルを非表示にする',
            note: 'ランダムなサムネイルの代わりにカテゴリの色を表示します',
          },
          allowCaching: {
            name: 'メディア プレビューのキャッシュを許可する',
            note: 'ローカルのオフライン キャッシュを使用してメディア プレビューをキャッシュします',
          },
          mediaVolume: {
            name: 'メディアのボリューム',
            note: 'タブのメディア再生音量',
          },
          maxMediasPerPage: {
            name: 'ページあたりの最大メディア数',
            note: 'タブ内のページごとに表示されるメディアの最大数',
          },
          position: {
            name: 'ボタンの位置',
          },
          gif: {
            name: 'GIF設定',
            enabled: {
              name: '一般的な',
              note: 'DiscordのGIFタブを置き換えます',
            },
            alwaysSendInstantly: {
              name: '即日配送',
              note: 'メディアリンクまたはファイルをすぐに送信してください',
            },
            alwaysUploadFile: {
              name: '常にファイルとしてアップロード',
              note: 'リンクを送信するのではなく、メディアをファイルとしてアップロードする',
            },
          },
          image: {
            name: '画像設定',
            enabled: {
              name: '一般的な',
              note: 'このメディア タイプを有効にする',
            },
            showBtn: {
              name: 'ボタン',
              note: 'チャットバーにボタンを表示',
            },
            showStar: {
              name: '星',
              note: 'お気に入りのスターをメディアに出演させる',
            },
            alwaysSendInstantly: {
              name: '即日配送',
              note: 'メディアリンクまたはファイルをすぐに送信してください',
            },
            alwaysUploadFile: {
              name: '常にファイルとしてアップロード',
              note: 'リンクを送信するのではなく、メディアをファイルとしてアップロードする',
            },
          },
          video: {
            name: 'ビデオ設定',
            enabled: {
              name: '一般的な',
              note: 'このメディア タイプを有効にする',
            },
            showBtn: {
              name: 'ボタン',
              note: 'チャットバーにボタンを表示',
            },
            showStar: {
              name: '星',
              note: 'お気に入りのスターをメディアに出演させる',
            },
            alwaysSendInstantly: {
              name: '即日配送',
              note: 'メディアリンクまたはファイルをすぐに送信してください',
            },
            alwaysUploadFile: {
              name: '常にファイルとしてアップロード',
              note: 'リンクを送信するのではなく、メディアをファイルとしてアップロードする',
            },
          },
          audio: {
            name: 'オーディオ設定',
            enabled: {
              name: '一般的な',
              note: 'このメディア タイプを有効にする',
            },
            showBtn: {
              name: 'ボタン',
              note: 'チャットバーにボタンを表示',
            },
            showStar: {
              name: '星',
              note: 'お気に入りのスターをメディアに出演させる',
            },
          },
          file: {
            name: 'ファイル設定',
            enabled: {
              name: '一般的な',
              note: 'このメディア タイプを有効にする',
            },
            showBtn: {
              name: 'ボタン',
              note: 'チャットバーにボタンを表示',
            },
            showStar: {
              name: '星',
              note: 'お気に入りのスターをメディアに出演させる',
            },
            alwaysSendInstantly: {
              name: '即日配送',
              note: 'メディアリンクまたはファイルをすぐに送信してください',
            },
            alwaysUploadFile: {
              name: '常にファイルとしてアップロード',
              note: 'リンクを送信するのではなく、メディアをファイルとしてアップロードする',
            },
          },
          panel: 'プラグイン設定',
        },
      },
      ko: { // Korean
        tabName: {
          image: '그림',
          video: '비디오',
          audio: '오디오',
          file: '파일',
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
          refreshUrls: 'URL 새로 고침',
          placeholder: '카테고리 이름',
          move: '움직임',
          moveNext: '후',
          movePrevious: '전에',
          color: '색깔',
          copyColor: '색상 복사',
          setThumbnail: '썸네일로 설정',
          unsetThumbnail: '미리보기 이미지 삭제',
          error: {
            needName: '이름은 비워 둘 수 없습니다.',
            invalidNameLength: '이름은 최대 20 자 여야합니다.',
            wrongColor: '색상이 잘못되었습니다.',
            nameExists: '이 이름은 이미 존재합니다',
            invalidCategory: '카테고리가 없습니다.',
            download: '미디어 다운로드 실패',
          },
          success: {
            create: '카테고리가 생성되었습니다!',
            delete: '카테고리가 삭제되었습니다!',
            edit: '카테고리가 변경되었습니다!',
            move: '카테고리가 이동되었습니다!',
            download: '미디어가 업로드되었습니다!',
            setThumbnail: '카테고리별 썸네일이 설정되었습니다!',
            unsetThumbnail: '카테고리의 미리보기 이미지가 삭제되었습니다.',
            refreshUrls: 'URL이 새로 고쳐졌습니다.',
          },
          emptyHint: '카테고리를 만들려면 마우스 오른쪽 버튼을 클릭하십시오!',
        },
        media: {
          emptyHint: {
            image: '이미지 모서리에있는 별을 클릭하여 즐겨 찾기에 추가하세요.',
            video: '동영상 모서리에있는 별표를 클릭하여 즐겨 찾기에 추가하세요.',
            audio: '오디오 모서리에있는 별표를 클릭하여 즐겨 찾기에 넣습니다.',
            file: '즐겨찾기에 추가하려면 파일 모서리에 있는 별표를 클릭하세요.',
          },
          addTo: '더하다',
          moveTo: '움직임',
          removeFrom: '카테고리에서 제거',
          copySource: '미디어 소스 복사',
          upload: {
            title: '업로드',
            normal: '표준',
            spoiler: '스포일러',
          },
          success: {
            move: {
              gif: 'GIF가 이동되었습니다!',
              image: '이미지가 이동되었습니다!',
              video: '동영상이 이동되었습니다!',
              audio: '오디오가 이동되었습니다!',
              file: '파일이 이동되었습니다!',
            },
            remove: {
              gif: 'GIF가 카테고리에서 제거되었습니다!',
              image: '카테고리에서 이미지가 제거되었습니다!',
              video: '비디오가 카테고리에서 제거되었습니다!',
              audio: '카테고리에서 오디오가 제거되었습니다!',
              file: '파일이 카테고리에서 제거되었습니다!',
            },
            download: {
              gif: 'GIF가 업로드되었습니다!',
              image: '이미지가 업로드되었습니다!',
              video: '영상이 업로드 되었습니다!',
              audio: '오디오가 다운로드되었습니다!',
              file: '파일이 다운로드되었습니다!',
            },
          },
          error: {
            download: {
              gif: 'GIF 다운로드 실패',
              image: '이미지를 업로드하지 못했습니다.',
              video: '동영상 다운로드 실패',
              audio: '오디오 다운로드 실패',
              file: '파일을 다운로드하지 못했습니다.',
            },
          },
          controls: {
            show: '주문보기',
            hide: '주문 숨기기',
          },
          placeholder: {
            gif: 'GIF 이름',
            image: '이미지 이름',
            video: '비디오 이름',
            audio: '오디오 이름',
            file: '파일 이름',
          },
        },
        searchItem: {
          gif: 'GIF 또는 카테고리 검색',
          image: '이미지 또는 카테고리 검색',
          video: '비디오 또는 카테고리 검색',
          audio: '오디오 또는 카테고리 검색',
          file: '파일 또는 카테고리 검색',
        },
        import: {
          panel: '미디어 가져오기',
          label: {
            types: '유형',
            medias: '미디어',
            categories: '카테고리',
          },
          buttonImport: '수입',
          success: '미디어를 가져왔습니다!',
          error: '미디어를 가져오지 못했습니다.',
        },
        cache: {
          panel: '로컬 데이터베이스',
          total: '총 :',
          size: '크기:',
          clear: {
            confirm: '정말로 데이터베이스를 비우시겠습니까?',
            button: '빈 데이터베이스',
            success: '데이터베이스가 비워졌습니다!',
            error: '데이터베이스를 덤프하지 못했습니다.',
          },
          cacheAll: {
            button: '모든 미디어 캐시',
            confirm: '모든 미디어를 캐시하시겠습니까?',
            noMedia: '캐시할 미디어가 없습니다.',
            success: '미디어가 캐시되었습니다!',
            error: '미디어를 캐싱하는 중 오류가 발생했습니다.',
          },
          refreshButton: '새로 고치다',
        },
        mediasCounter: '미디어 수',
        settings: {
          hideUnsortedMedias: {
            name: '미디어 숨기기',
            note: '분류되지 않은 탭에서 미디어 숨기기',
          },
          hideThumbnail: {
            name: '썸네일 숨기기',
            note: '임의의 썸네일 대신 카테고리 색상을 표시합니다.',
          },
          allowCaching: {
            name: '미디어 미리보기 캐싱 허용',
            note: '로컬 오프라인 캐시를 사용하여 미디어 미리보기를 캐시합니다.',
          },
          mediaVolume: {
            name: '미디어 볼륨',
            note: '탭의 미디어 재생 볼륨',
          },
          maxMediasPerPage: {
            name: '페이지당 최대 미디어 수',
            note: '탭의 페이지당 표시되는 최대 미디어 수',
          },
          position: {
            name: '버튼 위치',
          },
          gif: {
            name: 'GIF 설정',
            enabled: {
              name: '일반적인',
              note: 'Discord의 GIF 탭을 대체합니다.',
            },
            alwaysSendInstantly: {
              name: '즉시배송',
              note: '즉시 미디어 링크나 파일을 보내주세요',
            },
            alwaysUploadFile: {
              name: '항상 파일로 업로드',
              note: '링크를 보내는 대신 미디어를 파일로 업로드',
            },
          },
          image: {
            name: '이미지 설정',
            enabled: {
              name: '일반적인',
              note: '이 미디어 유형을 활성화합니다.',
            },
            showBtn: {
              name: '단추',
              note: '채팅바에 버튼 표시',
            },
            showStar: {
              name: '별',
              note: '미디어에서 좋아하는 스타를 보여줍니다.',
            },
            alwaysSendInstantly: {
              name: '즉시배송',
              note: '즉시 미디어 링크나 파일을 보내주세요',
            },
            alwaysUploadFile: {
              name: '항상 파일로 업로드',
              note: '링크를 보내는 대신 미디어를 파일로 업로드',
            },
          },
          video: {
            name: '비디오 설정',
            enabled: {
              name: '일반적인',
              note: '이 미디어 유형을 활성화합니다.',
            },
            showBtn: {
              name: '단추',
              note: '채팅바에 버튼 표시',
            },
            showStar: {
              name: '별',
              note: '미디어에서 좋아하는 스타를 보여줍니다.',
            },
            alwaysSendInstantly: {
              name: '즉시배송',
              note: '즉시 미디어 링크나 파일을 보내주세요',
            },
            alwaysUploadFile: {
              name: '항상 파일로 업로드',
              note: '링크를 보내는 대신 미디어를 파일로 업로드',
            },
          },
          audio: {
            name: '오디오 설정',
            enabled: {
              name: '일반적인',
              note: '이 미디어 유형을 활성화합니다.',
            },
            showBtn: {
              name: '단추',
              note: '채팅바에 버튼 표시',
            },
            showStar: {
              name: '별',
              note: '미디어에서 좋아하는 스타를 보여줍니다.',
            },
          },
          file: {
            name: '파일 설정',
            enabled: {
              name: '일반적인',
              note: '이 미디어 유형을 활성화합니다.',
            },
            showBtn: {
              name: '단추',
              note: '채팅바에 버튼 표시',
            },
            showStar: {
              name: '별',
              note: '미디어에서 좋아하는 스타를 보여줍니다.',
            },
            alwaysSendInstantly: {
              name: '즉시배송',
              note: '즉시 미디어 링크나 파일을 보내주세요',
            },
            alwaysUploadFile: {
              name: '항상 파일로 업로드',
              note: '링크를 보내는 대신 미디어를 파일로 업로드',
            },
          },
          panel: '플러그인 설정',
        },
      },
      lt: { // Lithuanian
        tabName: {
          image: 'Paveikslėlis',
          video: 'Vaizdo įrašas',
          audio: 'Garso įrašas',
          file: 'Failas',
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
          refreshUrls: 'Atnaujinkite URL',
          placeholder: 'Kategorijos pavadinimas',
          move: 'Perkelti',
          moveNext: 'Po',
          movePrevious: 'Anksčiau',
          color: 'Spalva',
          copyColor: 'Kopijuoti spalvą',
          setThumbnail: 'Nustatyti kaip miniatiūrą',
          unsetThumbnail: 'Pašalinti miniatiūrą',
          error: {
            needName: 'Pavadinimas negali būti tuščias',
            invalidNameLength: 'Pavadinime gali būti ne daugiau kaip 20 simbolių',
            wrongColor: 'Spalva neteisinga',
            nameExists: 'šis vardas jau egzistuoja',
            invalidCategory: 'Kategorija neegzistuoja',
            download: 'Nepavyko atsisiųsti medijos',
          },
          success: {
            create: 'Kategorija sukurta!',
            delete: 'Kategorija ištrinta!',
            edit: 'Kategorija pakeista!',
            move: 'Kategorija perkelta!',
            download: 'Žiniasklaida įkelta!',
            setThumbnail: 'Miniatiūros nustatyta kategorijai!',
            unsetThumbnail: 'Kategorijos miniatiūra pašalinta!',
            refreshUrls: 'URL atnaujinti!',
          },
          emptyHint: 'Dešiniuoju pelės mygtuku spustelėkite norėdami sukurti kategoriją!',
        },
        media: {
          emptyHint: {
            image: 'Spustelėkite žvaigždutę atvaizdo kampe, kad ją įtrauktumėte į mėgstamiausius',
            video: 'Spustelėkite žvaigždutę vaizdo įrašo kampe, kad įtrauktumėte ją į mėgstamiausius',
            audio: 'Spustelėkite žvaigždutę garso kampe, kad įtrauktumėte ją į mėgstamiausius',
            file: 'Spustelėkite žvaigždutę failo kampe, kad pridėtumėte jį prie mėgstamiausių',
          },
          addTo: 'Papildyti',
          moveTo: 'Perkelti',
          removeFrom: 'Pašalinti iš kategorijos',
          copySource: 'Nukopijuokite medijos šaltinį',
          upload: {
            title: 'Įkelti',
            normal: 'Normalus',
            spoiler: 'Spoileris',
          },
          success: {
            move: {
              gif: 'GIF buvo perkeltas!',
              image: 'Vaizdas perkeltas!',
              video: 'Vaizdo įrašas perkeltas!',
              audio: 'Garso įrašas perkeltas!',
              file: 'Failas perkeltas!',
            },
            remove: {
              gif: 'GIF buvo pašalintas iš kategorijų!',
              image: 'Vaizdas pašalintas iš kategorijų!',
              video: 'Vaizdo įrašas pašalintas iš kategorijų!',
              audio: 'Garso įrašas pašalintas iš kategorijų!',
              file: 'Failas pašalintas iš kategorijų!',
            },
            download: {
              gif: 'GIF failas įkeltas!',
              image: 'Vaizdas įkeltas!',
              video: 'Vaizdo įrašas įkeltas!',
              audio: 'Garso įrašas atsisiųstas!',
              file: 'Failas atsisiųstas!',
            },
          },
          error: {
            download: {
              gif: 'Nepavyko atsisiųsti GIF',
              image: 'Nepavyko įkelti vaizdo',
              video: 'Nepavyko atsisiųsti vaizdo įrašo',
              audio: 'Nepavyko atsisiųsti garso įrašo',
              file: 'Nepavyko atsisiųsti failo',
            },
          },
          controls: {
            show: 'Rodyti užsakymus',
            hide: 'Slėpti užsakymus',
          },
          placeholder: {
            gif: 'GIF pavadinimas',
            image: 'Paveikslėlio pavadinimas',
            video: 'Vaizdo įrašo pavadinimas',
            audio: 'Garso įrašo pavadinimas',
            file: 'Failo pavadinimas',
          },
        },
        searchItem: {
          gif: 'Ieškokite GIF arba kategorijų',
          image: 'Ieškokite vaizdų ar kategorijų',
          video: 'Ieškokite vaizdo įrašų ar kategorijų',
          audio: 'Ieškokite garso įrašų ar kategorijų',
          file: 'Failų ar kategorijų paieška',
        },
        import: {
          panel: 'Medijos importas',
          label: {
            types: 'Tipai',
            medias: 'Žiniasklaida',
            categories: 'Kategorijos',
          },
          buttonImport: 'Importuoti',
          success: 'Žiniasklaida buvo importuota!',
          error: 'Nepavyko importuoti laikmenos',
        },
        cache: {
          panel: 'Vietinė duomenų bazė',
          total: 'Iš viso:',
          size: 'Dydis:',
          clear: {
            confirm: 'Ar tikrai norite ištuštinti duomenų bazę?',
            button: 'Tuščia duomenų bazė',
            success: 'Duomenų bazė ištuštinta!',
            error: 'Nepavyko iškelti duomenų bazės',
          },
          cacheAll: {
            button: 'Išsaugokite visą laikmeną talpykloje',
            confirm: 'Ar norite talpykloje išsaugoti visą mediją?',
            noMedia: 'Nėra medijos, kurią būtų galima išsaugoti talpykloje',
            success: 'Žiniasklaida buvo išsaugota talpykloje!',
            error: 'Klaida kaupiant laikmeną talpykloje',
          },
          refreshButton: 'Atnaujinti',
        },
        mediasCounter: 'Žiniasklaidos skaičius',
        settings: {
          hideUnsortedMedias: {
            name: 'Slėpti mediją',
            note: 'Slėpti laikmenas iš skirtuko, kuri nėra suskirstyta į kategorijas',
          },
          hideThumbnail: {
            name: 'Slėpti miniatiūras',
            note: 'Rodo kategorijos spalvą, o ne atsitiktinę miniatiūrą',
          },
          allowCaching: {
            name: 'Leisti medijos peržiūros kaupimą talpykloje',
            note: 'Naudoja vietinę talpyklą neprisijungus, kad išsaugotų medijos peržiūrą',
          },
          mediaVolume: {
            name: 'Medijos garsumas',
            note: 'Medijos atkūrimo garsumas skirtuke',
          },
          maxMediasPerPage: {
            name: 'Didžiausias medijos skaičius puslapyje',
            note: 'Didžiausias medijos skaičius, rodomas viename skirtuko lape',
          },
          position: {
            name: 'Mygtuko padėtis',
          },
          gif: {
            name: 'GIF nustatymai',
            enabled: {
              name: 'Generolas',
              note: 'Pakeičia „Discord“ GIF skirtuką',
            },
            alwaysSendInstantly: {
              name: 'Greitas pristatymas',
              note: 'Nedelsdami išsiųskite medijos nuorodą arba failą',
            },
            alwaysUploadFile: {
              name: 'Visada įkelti kaip failą',
              note: 'Įkelkite mediją kaip failą, o ne siųskite nuorodą',
            },
          },
          image: {
            name: 'Vaizdo nustatymai',
            enabled: {
              name: 'Generolas',
              note: 'Įgalinti šį laikmenos tipą',
            },
            showBtn: {
              name: 'Mygtukas',
              note: 'Rodyti mygtuką pokalbių juostoje',
            },
            showStar: {
              name: 'Žvaigždė',
              note: 'Žiniasklaidoje rodo mėgstamą žvaigždę',
            },
            alwaysSendInstantly: {
              name: 'Greitas pristatymas',
              note: 'Nedelsdami išsiųskite medijos nuorodą arba failą',
            },
            alwaysUploadFile: {
              name: 'Visada įkelti kaip failą',
              note: 'Įkelkite mediją kaip failą, o ne siųskite nuorodą',
            },
          },
          video: {
            name: 'Vaizdo įrašo nustatymai',
            enabled: {
              name: 'Generolas',
              note: 'Įgalinti šį laikmenos tipą',
            },
            showBtn: {
              name: 'Mygtukas',
              note: 'Rodyti mygtuką pokalbių juostoje',
            },
            showStar: {
              name: 'Žvaigždė',
              note: 'Žiniasklaidoje rodo mėgstamą žvaigždę',
            },
            alwaysSendInstantly: {
              name: 'Greitas pristatymas',
              note: 'Nedelsdami išsiųskite medijos nuorodą arba failą',
            },
            alwaysUploadFile: {
              name: 'Visada įkelti kaip failą',
              note: 'Įkelkite mediją kaip failą, o ne siųskite nuorodą',
            },
          },
          audio: {
            name: 'Garso nustatymai',
            enabled: {
              name: 'Generolas',
              note: 'Įgalinti šį laikmenos tipą',
            },
            showBtn: {
              name: 'Mygtukas',
              note: 'Rodyti mygtuką pokalbių juostoje',
            },
            showStar: {
              name: 'Žvaigždė',
              note: 'Žiniasklaidoje rodo mėgstamą žvaigždę',
            },
          },
          file: {
            name: 'Failų nustatymai',
            enabled: {
              name: 'Generolas',
              note: 'Įgalinti šį laikmenos tipą',
            },
            showBtn: {
              name: 'Mygtukas',
              note: 'Rodyti mygtuką pokalbių juostoje',
            },
            showStar: {
              name: 'Žvaigždė',
              note: 'Žiniasklaidoje rodo mėgstamą žvaigždę',
            },
            alwaysSendInstantly: {
              name: 'Greitas pristatymas',
              note: 'Nedelsdami išsiųskite medijos nuorodą arba failą',
            },
            alwaysUploadFile: {
              name: 'Visada įkelti kaip failą',
              note: 'Įkelkite mediją kaip failą, o ne siųskite nuorodą',
            },
          },
          panel: 'Papildinio nustatymai',
        },
      },
      nl: { // Dutch
        tabName: {
          image: 'Afbeelding',
          video: 'Video',
          audio: 'Audio',
          file: 'Bestand',
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
          refreshUrls: 'Vernieuw URL\'s',
          placeholder: 'Categorie naam',
          move: 'Verplaatsen, verschuiven',
          moveNext: 'Na',
          movePrevious: 'Voordat',
          color: 'Kleur',
          copyColor: 'Kopieer kleur',
          setThumbnail: 'Instellen als miniatuur',
          unsetThumbnail: 'Miniatuur verwijderen',
          error: {
            needName: 'Naam mag niet leeg zijn',
            invalidNameLength: 'De naam mag maximaal 20 tekens bevatten',
            wrongColor: 'Kleur is ongeldig',
            nameExists: 'Deze naam bestaat al',
            invalidCategory: 'De categorie bestaat niet',
            download: 'Kan media niet downloaden',
          },
          success: {
            create: 'De categorie is aangemaakt!',
            delete: 'De categorie is verwijderd!',
            edit: 'De categorie is gewijzigd!',
            move: 'De categorie is verplaatst!',
            download: 'De media is geüpload!',
            setThumbnail: 'Miniatuurset voor categorie!',
            unsetThumbnail: 'Miniatuur verwijderd voor de categorie!',
            refreshUrls: 'URL\'s vernieuwd!',
          },
          emptyHint: 'Klik met de rechtermuisknop om een categorie aan te maken!',
        },
        media: {
          emptyHint: {
            image: 'Klik op de ster in de hoek van een afbeelding om deze in je favorieten te plaatsen',
            video: 'Klik op de ster in de hoek van een video om deze in je favorieten te plaatsen',
            audio: 'Klik op de ster in de hoek van een audio om deze in je favorieten te plaatsen',
            file: 'Klik op de ster in de hoek van een bestand om het aan uw favorieten toe te voegen',
          },
          addTo: 'Toevoegen',
          moveTo: 'Verplaatsen, verschuiven',
          removeFrom: 'Verwijderen uit categorie',
          copySource: 'Mediabron kopiëren',
          upload: {
            title: 'Uploaden',
            normal: 'normaal',
            spoiler: 'Spoiler',
          },
          success: {
            move: {
              gif: 'GIF\'en er blevet flyttet!',
              image: 'De afbeelding is verplaatst!',
              video: 'De video is verplaatst!',
              audio: 'Het geluid is verplaatst!',
              file: 'Het bestand is verplaatst!',
            },
            remove: {
              gif: 'GIF\'en er blevet fjernet fra kategorierne!',
              image: 'De afbeelding is verwijderd uit de categorieën!',
              video: 'De video is verwijderd uit de categorieën!',
              audio: 'Audio is verwijderd uit categorieën!',
              file: 'Het bestand is verwijderd uit de categorieën!',
            },
            download: {
              gif: 'GIF\'en er blevet uploadet!',
              image: 'De afbeelding is geüpload!',
              video: 'De video is geüpload!',
              audio: 'De audio is gedownload!',
              file: 'Het bestand is gedownload!',
            },
          },
          error: {
            download: {
              gif: 'Kunne ikke downloade GIF',
              image: 'Kan afbeelding niet uploaden',
              video: 'Kan video niet downloaden',
              audio: 'Kan audio niet downloaden',
              file: 'Kan bestand niet downloaden',
            },
          },
          controls: {
            show: 'Toon bestellingen',
            hide: 'Verberg bestellingen',
          },
          placeholder: {
            gif: 'GIF navn',
            image: 'Naam afbeelding',
            video: 'Videonaam',
            audio: 'Audionaam',
            file: 'Bestandsnaam',
          },
        },
        searchItem: {
          gif: 'Søg efter GIF\'er eller kategorier',
          image: 'Zoeken naar afbeeldingen of categorieën',
          video: 'Zoeken naar video\'s of categorieën',
          audio: 'Zoeken naar audio of categorieën',
          file: 'Zoeken naar bestanden of categorieën',
        },
        import: {
          panel: 'Media-import',
          label: {
            types: 'Soorten',
            medias: 'Media',
            categories: 'Categorieën',
          },
          buttonImport: 'Importeren',
          success: 'De media zijn geïmporteerd!',
          error: 'Kan media niet importeren',
        },
        cache: {
          panel: 'Lokale database',
          total: 'Totaal :',
          size: 'Maat :',
          clear: {
            confirm: 'Wilt u de database echt leegmaken?',
            button: 'Lege database',
            success: 'De database is geleegd!',
            error: 'Kan de database niet dumpen',
          },
          cacheAll: {
            button: 'Cache alle media',
            confirm: 'Wilt u alle media in de cache opslaan?',
            noMedia: 'Er zijn geen media om in de cache te plaatsen',
            success: 'De media zijn in de cache opgeslagen!',
            error: 'Fout bij het cachen van media',
          },
          refreshButton: 'Vernieuwen',
        },
        mediasCounter: 'Aantal media',
        settings: {
          hideUnsortedMedias: {
            name: 'Media verbergen',
            note: 'Verberg media op het tabblad die niet zijn gecategoriseerd',
          },
          hideThumbnail: {
            name: 'Miniaturen verbergen',
            note: 'Toont categoriekleur in plaats van een willekeurige miniatuur',
          },
          allowCaching: {
            name: 'Caching van mediavoorbeelden toestaan',
            note: 'Gebruikt lokale offline cache om mediavoorbeelden in de cache op te slaan',
          },
          mediaVolume: {
            name: 'Mediavolume',
            note: 'Mediaafspeelvolume op tabblad',
          },
          maxMediasPerPage: {
            name: 'Maximaal aantal media per pagina',
            note: 'Het maximale aantal media dat per pagina op het tabblad wordt weergegeven',
          },
          position: {
            name: 'Knop positie',
          },
          gif: {
            name: 'GIF-instellingen',
            enabled: {
              name: 'Algemeen',
              note: 'Vervangt het GIF-tabblad van Discord',
            },
            alwaysSendInstantly: {
              name: 'Onmiddelijke levering',
              note: 'Stuur de medialink of het bestand onmiddellijk',
            },
            alwaysUploadFile: {
              name: 'Upload altijd als bestand',
              note: 'Upload media als een bestand in plaats van een link te verzenden',
            },
          },
          image: {
            name: 'Beeldinstellingen',
            enabled: {
              name: 'Algemeen',
              note: 'Schakel dit mediatype in',
            },
            showBtn: {
              name: 'Knop',
              note: 'Knop weergeven op chatbalk',
            },
            showStar: {
              name: 'Ster',
              note: 'Toont favoriete ster op media',
            },
            alwaysSendInstantly: {
              name: 'Onmiddelijke levering',
              note: 'Stuur de medialink of het bestand onmiddellijk',
            },
            alwaysUploadFile: {
              name: 'Upload altijd als bestand',
              note: 'Upload media als een bestand in plaats van een link te verzenden',
            },
          },
          video: {
            name: 'Beeldinstellingen',
            enabled: {
              name: 'Algemeen',
              note: 'Schakel dit mediatype in',
            },
            showBtn: {
              name: 'Knop',
              note: 'Knop weergeven op chatbalk',
            },
            showStar: {
              name: 'Ster',
              note: 'Toont favoriete ster op media',
            },
            alwaysSendInstantly: {
              name: 'Onmiddelijke levering',
              note: 'Stuur de medialink of het bestand onmiddellijk',
            },
            alwaysUploadFile: {
              name: 'Upload altijd als bestand',
              note: 'Upload media als een bestand in plaats van een link te verzenden',
            },
          },
          audio: {
            name: 'Geluidsinstellingen',
            enabled: {
              name: 'Algemeen',
              note: 'Schakel dit mediatype in',
            },
            showBtn: {
              name: 'Knop',
              note: 'Knop weergeven op chatbalk',
            },
            showStar: {
              name: 'Ster',
              note: 'Toont favoriete ster op media',
            },
          },
          file: {
            name: 'Bestandsinstellingen',
            enabled: {
              name: 'Algemeen',
              note: 'Schakel dit mediatype in',
            },
            showBtn: {
              name: 'Knop',
              note: 'Knop weergeven op chatbalk',
            },
            showStar: {
              name: 'Ster',
              note: 'Toont favoriete ster op media',
            },
            alwaysSendInstantly: {
              name: 'Onmiddelijke levering',
              note: 'Stuur de medialink of het bestand onmiddellijk',
            },
            alwaysUploadFile: {
              name: 'Upload altijd als bestand',
              note: 'Upload media als een bestand in plaats van een link te verzenden',
            },
          },
          panel: 'Plugin-instellingen',
        },
      },
      no: { // Norwegian
        tabName: {
          image: 'Bilde',
          video: 'Video',
          audio: 'Lyd',
          file: 'Fil',
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
          refreshUrls: 'Oppdater nettadresser',
          placeholder: 'Kategori navn',
          move: 'Bevege seg',
          moveNext: 'Etter',
          movePrevious: 'Før',
          color: 'Farge',
          copyColor: 'Kopier farge',
          setThumbnail: 'Angi som miniatyrbilde',
          unsetThumbnail: 'Fjern miniatyrbilde',
          error: {
            needName: 'Navnet kan ikke være tomt',
            invalidNameLength: 'Navnet må inneholde maksimalt 20 tegn',
            wrongColor: 'Fargen er ugyldig',
            nameExists: 'dette navnet eksisterer allerede',
            invalidCategory: 'Kategorien eksisterer ikke',
            download: 'Kunne ikke laste ned medier',
          },
          success: {
            create: 'Kategorien er opprettet!',
            delete: 'Kategorien er slettet!',
            edit: 'Kategorien er endret!',
            move: 'Kategorien er flyttet!',
            download: 'Mediene er lastet opp!',
            setThumbnail: 'Miniatyrbildesett for kategori!',
            unsetThumbnail: 'Miniatyrbilde fjernet for kategorien!',
            refreshUrls: 'URL-er oppdatert!',
          },
          emptyHint: 'Høyreklikk for å opprette en kategori!',
        },
        media: {
          emptyHint: {
            image: 'Klikk på stjernen i hjørnet av et bilde for å sette det i favorittene dine',
            video: 'Klikk på stjernen i hjørnet av en video for å sette den i favorittene dine',
            audio: 'Klikk på stjernen i hjørnet av en lyd for å sette den i favorittene dine',
            file: 'Klikk på stjernen i hjørnet av en fil for å legge den til i favorittene dine',
          },
          addTo: 'Legge til',
          moveTo: 'Bevege seg',
          removeFrom: 'Fjern fra kategori',
          copySource: 'Kopier mediekilde',
          upload: {
            title: 'Laste opp',
            normal: 'Vanlig',
            spoiler: 'Spoiler',
          },
          success: {
            move: {
              gif: 'GIF-en er flyttet!',
              image: 'Bildet er flyttet!',
              video: 'Videoen er flyttet!',
              audio: 'Lyden er flyttet!',
              file: 'Filen er flyttet!',
            },
            remove: {
              gif: 'GIF-en er fjernet fra kategoriene!',
              image: 'Bildet er fjernet fra kategoriene!',
              video: 'Videoen er fjernet fra kategoriene!',
              audio: 'Lyd er fjernet fra kategorier!',
              file: 'Filen er fjernet fra kategoriene!',
            },
            download: {
              gif: 'GIF-en er lastet opp!',
              image: 'Bildet er lastet opp!',
              video: 'Videoen er lastet opp!',
              audio: 'Lyden er lastet ned!',
              file: 'Filen er lastet ned!',
            },
          },
          error: {
            download: {
              gif: 'Kunne ikke laste ned GIF',
              image: 'Kunne ikke laste opp bildet',
              video: 'Kunne ikke laste ned video',
              audio: 'Kunne ikke laste ned lyd',
              file: 'Kunne ikke laste ned filen',
            },
          },
          controls: {
            show: 'Vis ordrer',
            hide: 'Skjul ordrer',
          },
          placeholder: {
            gif: 'GIF-navn',
            image: 'Bilde navn',
            video: 'Video navn',
            audio: 'Lydnavn',
            file: 'Filnavn',
          },
        },
        searchItem: {
          gif: 'Søk etter GIF-er eller kategorier',
          image: 'Søk etter bilder eller kategorier',
          video: 'Søk etter videoer eller kategorier',
          audio: 'Søk etter lyd eller kategorier',
          file: 'Søker etter filer eller kategorier',
        },
        import: {
          panel: 'Medieimport',
          label: {
            types: 'Typer',
            medias: 'Media',
            categories: 'Kategorier',
          },
          buttonImport: 'Import',
          success: 'Media er importert!',
          error: 'Kunne ikke importere media',
        },
        cache: {
          panel: 'Lokal database',
          total: 'Total :',
          size: 'Størrelse:',
          clear: {
            confirm: 'Vil du virkelig tømme databasen?',
            button: 'Tom database',
            success: 'Databasen er tømt!',
            error: 'Kunne ikke dumpe databasen',
          },
          cacheAll: {
            button: 'Buffer alle medier',
            confirm: 'Vil du bufre alle medier?',
            noMedia: 'Det er ingen media å bufre',
            success: 'Media har blitt cache!',
            error: 'Feil under bufring av media',
          },
          refreshButton: 'Forfriske',
        },
        mediasCounter: 'Antall medier',
        settings: {
          hideUnsortedMedias: {
            name: 'Skjul media',
            note: 'Skjul medier fra fanen som ikke er kategorisert',
          },
          hideThumbnail: {
            name: 'Skjul miniatyrbilder',
            note: 'Viser kategorifarge i stedet for et tilfeldig miniatyrbilde',
          },
          allowCaching: {
            name: 'Tillat bufring av medieforhåndsvisning',
            note: 'Bruker lokal frakoblet hurtigbuffer for å bufre medieforhåndsvisning',
          },
          mediaVolume: {
            name: 'Medievolum',
            note: 'Medieavspillingsvolum i fanen',
          },
          maxMediasPerPage: {
            name: 'Maksimalt antall medier per side',
            note: 'Maksimalt antall medier som vises per side i fanen',
          },
          position: {
            name: 'Knappposisjon',
          },
          gif: {
            name: 'GIF-innstillinger',
            enabled: {
              name: 'Generell',
              note: 'Erstatter Discords GIF-fane',
            },
            alwaysSendInstantly: {
              name: 'Umiddelbar levering',
              note: 'Send mediekoblingen eller filen umiddelbart',
            },
            alwaysUploadFile: {
              name: 'Last alltid opp som fil',
              note: 'Last opp media som en fil i stedet for å sende en lenke',
            },
          },
          image: {
            name: 'Bildeinnstillinger',
            enabled: {
              name: 'Generell',
              note: 'Aktiver denne medietypen',
            },
            showBtn: {
              name: 'Knapp',
              note: 'Vis knapp på chattelinjen',
            },
            showStar: {
              name: 'Stjerne',
              note: 'Viser favorittstjerne på media',
            },
            alwaysSendInstantly: {
              name: 'Umiddelbar levering',
              note: 'Send mediekoblingen eller filen umiddelbart',
            },
            alwaysUploadFile: {
              name: 'Last alltid opp som fil',
              note: 'Last opp media som en fil i stedet for å sende en lenke',
            },
          },
          video: {
            name: 'Videoinnstillinger',
            enabled: {
              name: 'Generell',
              note: 'Aktiver denne medietypen',
            },
            showBtn: {
              name: 'Knapp',
              note: 'Vis knapp på chattelinjen',
            },
            showStar: {
              name: 'Stjerne',
              note: 'Viser favorittstjerne på media',
            },
            alwaysSendInstantly: {
              name: 'Umiddelbar levering',
              note: 'Send mediekoblingen eller filen umiddelbart',
            },
            alwaysUploadFile: {
              name: 'Last alltid opp som fil',
              note: 'Last opp media som en fil i stedet for å sende en lenke',
            },
          },
          audio: {
            name: 'Lydinnstillinger',
            enabled: {
              name: 'Generell',
              note: 'Aktiver denne medietypen',
            },
            showBtn: {
              name: 'Knapp',
              note: 'Vis knapp på chattelinjen',
            },
            showStar: {
              name: 'Stjerne',
              note: 'Viser favorittstjerne på media',
            },
          },
          file: {
            name: 'Filinnstillinger',
            enabled: {
              name: 'Generell',
              note: 'Aktiver denne medietypen',
            },
            showBtn: {
              name: 'Knapp',
              note: 'Vis knapp på chattelinjen',
            },
            showStar: {
              name: 'Stjerne',
              note: 'Viser favorittstjerne på media',
            },
            alwaysSendInstantly: {
              name: 'Umiddelbar levering',
              note: 'Send mediekoblingen eller filen umiddelbart',
            },
            alwaysUploadFile: {
              name: 'Last alltid opp som fil',
              note: 'Last opp media som en fil i stedet for å sende en lenke',
            },
          },
          panel: 'Plugin-innstillinger',
        },
      },
      pl: { // Polish
        tabName: {
          image: 'Obrazek',
          video: 'Wideo',
          audio: 'Audio',
          file: 'Plik',
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
          refreshUrls: 'Odśwież adresy URL',
          placeholder: 'Nazwa Kategorii',
          move: 'Ruszaj się',
          moveNext: 'Po',
          movePrevious: 'Przed',
          color: 'Kolor',
          copyColor: 'Kopiuj kolor',
          setThumbnail: 'Ustaw jako miniaturę',
          unsetThumbnail: 'Usuń miniaturę',
          error: {
            needName: 'Nazwa nie może być pusta',
            invalidNameLength: 'Nazwa musi zawierać maksymalnie 20 znaków',
            wrongColor: 'Kolor jest nieprawidłowy',
            nameExists: 'ta nazwa już istnieje',
            invalidCategory: 'Kategoria nie istnieje',
            download: 'Nie udało się pobrać multimediów',
          },
          success: {
            create: 'Kategoria została stworzona!',
            delete: 'Kategoria została usunięta!',
            edit: 'Kategoria została zmieniona!',
            move: 'Kategoria została przeniesiona!',
            download: 'Media zostały przesłane!',
            setThumbnail: 'Miniatura ustawiona dla kategorii!',
            unsetThumbnail: 'Miniatura została usunięta dla kategorii!',
            refreshUrls: 'Adresy URL zostały odświeżone!',
          },
          emptyHint: 'Kliknij prawym przyciskiem myszy, aby utworzyć kategorię!',
        },
        media: {
          emptyHint: {
            image: 'Kliknij gwiazdkę w rogu obrazu, aby umieścić go w ulubionych',
            video: 'Kliknij gwiazdkę w rogu filmu, aby umieścić go w ulubionych',
            audio: 'Kliknij gwiazdkę w rogu nagrania, aby umieścić go w ulubionych your',
            file: 'Kliknij gwiazdkę w rogu pliku, aby dodać go do ulubionych',
          },
          addTo: 'Dodaj',
          moveTo: 'Ruszaj się',
          removeFrom: 'Usuń z kategorii',
          copySource: 'Kopiuj źródło multimediów',
          upload: {
            title: 'Przekazać plik',
            normal: 'Normalna',
            spoiler: 'Spojler',
          },
          success: {
            move: {
              gif: 'GIF został przeniesiony!',
              image: 'Obraz został przeniesiony!',
              video: 'Film został przeniesiony!',
              audio: 'Dźwięk został przeniesiony!',
              file: 'Plik został przeniesiony!',
            },
            remove: {
              gif: 'GIF został usunięty z kategorii!',
              image: 'Obraz został usunięty z kategorii!',
              video: 'Film został usunięty z kategorii!',
              audio: 'Dźwięk został usunięty z kategorii!',
              file: 'Plik został usunięty z kategorii!',
            },
            download: {
              gif: 'GIF został przesłany!',
              image: 'Obraz został przesłany!',
              video: 'Film został przesłany!',
              audio: 'Dźwięk został pobrany!',
              file: 'Plik został pobrany!',
            },
          },
          error: {
            download: {
              gif: 'Nie udało się pobrać GIF-a',
              image: 'Nie udało się przesłać obrazu',
              video: 'Nie udało się pobrać wideo',
              audio: 'Nie udało się pobrać dźwięku',
              file: 'Nie udało się pobrać pliku',
            },
          },
          controls: {
            show: 'Pokaż zamówienia',
            hide: 'Ukryj zamówienia',
          },
          placeholder: {
            gif: 'Nazwa GIF-a',
            image: 'Nazwa obrazu',
            video: 'Nazwa wideo',
            audio: 'Nazwa dźwięku',
            file: 'Nazwa pliku',
          },
        },
        searchItem: {
          gif: 'Wyszukaj GIF-y lub kategorie',
          image: 'Wyszukaj obrazy lub kategorie',
          video: 'Wyszukaj filmy lub kategorie',
          audio: 'Wyszukaj audio lub kategorie',
          file: 'Wyszukiwanie plików lub kategorii',
        },
        import: {
          panel: 'Import multimediów',
          label: {
            types: 'Typy',
            medias: 'Głoska bezdźwięczna',
            categories: 'Kategorie',
          },
          buttonImport: 'Import',
          success: 'Media zostały zaimportowane!',
          error: 'Nie udało się zaimportować multimediów',
        },
        cache: {
          panel: 'Lokalna baza danych',
          total: 'Całkowity :',
          size: 'Rozmiar:',
          clear: {
            confirm: 'Czy na pewno chcesz opróżnić bazę danych?',
            button: 'Pusta baza danych',
            success: 'Baza danych została opróżniona!',
            error: 'Nie udało się zrzucić bazy danych',
          },
          cacheAll: {
            button: 'Buforuj wszystkie multimedia',
            confirm: 'Czy chcesz buforować wszystkie multimedia?',
            noMedia: 'Brak multimediów do buforowania',
            success: 'Media zostały zapisane w pamięci podręcznej!',
            error: 'Błąd podczas buforowania multimediów',
          },
          refreshButton: 'Odświeżać',
        },
        mediasCounter: 'Liczba mediów',
        settings: {
          hideUnsortedMedias: {
            name: 'Ukryj multimedia',
            note: 'Ukryj multimedia na karcie, które nie są skategoryzowane',
          },
          hideThumbnail: {
            name: 'Ukryj miniatury',
            note: 'Pokazuje kolor kategorii zamiast losowej miniatury',
          },
          allowCaching: {
            name: 'Zezwalaj na buforowanie podglądu multimediów',
            note: 'Używa lokalnej pamięci podręcznej offline do buforowania podglądu multimediów',
          },
          mediaVolume: {
            name: 'Głośność multimediów',
            note: 'Głośność odtwarzania multimediów w zakładce',
          },
          maxMediasPerPage: {
            name: 'Maksymalna liczba multimediów na stronę',
            note: 'Maksymalna liczba multimediów wyświetlanych na stronie w zakładce',
          },
          position: {
            name: 'Pozycja przycisku',
          },
          gif: {
            name: 'Ustawienia GIF',
            enabled: {
              name: 'Ogólny',
              note: 'Zastępuje kartę GIF Discorda',
            },
            alwaysSendInstantly: {
              name: 'Natychmiastowa dostawa',
              note: 'Natychmiast wyślij link lub plik do multimediów',
            },
            alwaysUploadFile: {
              name: 'Zawsze przesyłaj jako plik',
              note: 'Zamiast wysyłać link, prześlij multimedia jako plik',
            },
          },
          image: {
            name: 'Ustawienia obrazu',
            enabled: {
              name: 'Ogólny',
              note: 'Włącz ten typ multimediów',
            },
            showBtn: {
              name: 'Przycisk',
              note: 'Pokaż przycisk na pasku czatu',
            },
            showStar: {
              name: 'Gwiazda',
              note: 'Pokazuje ulubioną gwiazdę w mediach',
            },
            alwaysSendInstantly: {
              name: 'Natychmiastowa dostawa',
              note: 'Natychmiast wyślij link lub plik do multimediów',
            },
            alwaysUploadFile: {
              name: 'Zawsze przesyłaj jako plik',
              note: 'Zamiast wysyłać link, prześlij multimedia jako plik',
            },
          },
          video: {
            name: 'Ustawienia wideo',
            enabled: {
              name: 'Ogólny',
              note: 'Włącz ten typ multimediów',
            },
            showBtn: {
              name: 'Przycisk',
              note: 'Pokaż przycisk na pasku czatu',
            },
            showStar: {
              name: 'Gwiazda',
              note: 'Pokazuje ulubioną gwiazdę w mediach',
            },
            alwaysSendInstantly: {
              name: 'Natychmiastowa dostawa',
              note: 'Natychmiast wyślij link lub plik do multimediów',
            },
            alwaysUploadFile: {
              name: 'Zawsze przesyłaj jako plik',
              note: 'Zamiast wysyłać link, prześlij multimedia jako plik',
            },
          },
          audio: {
            name: 'Ustawienia dźwięku',
            enabled: {
              name: 'Ogólny',
              note: 'Włącz ten typ multimediów',
            },
            showBtn: {
              name: 'Przycisk',
              note: 'Pokaż przycisk na pasku czatu',
            },
            showStar: {
              name: 'Gwiazda',
              note: 'Pokazuje ulubioną gwiazdę w mediach',
            },
          },
          file: {
            name: 'Ustawienia pliku',
            enabled: {
              name: 'Ogólny',
              note: 'Włącz ten typ multimediów',
            },
            showBtn: {
              name: 'Przycisk',
              note: 'Pokaż przycisk na pasku czatu',
            },
            showStar: {
              name: 'Gwiazda',
              note: 'Pokazuje ulubioną gwiazdę w mediach',
            },
            alwaysSendInstantly: {
              name: 'Natychmiastowa dostawa',
              note: 'Natychmiast wyślij link lub plik do multimediów',
            },
            alwaysUploadFile: {
              name: 'Zawsze przesyłaj jako plik',
              note: 'Zamiast wysyłać link, prześlij multimedia jako plik',
            },
          },
          panel: 'Ustawienia wtyczki',
        },
      },
      pt: { // Portuguese (Brazil)
        tabName: {
          image: 'Foto',
          video: 'Vídeo',
          audio: 'Áudio',
          file: 'Arquivo',
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
          refreshUrls: 'Atualizar URLs',
          placeholder: 'Nome da Categoria',
          move: 'Mover',
          moveNext: 'Após',
          movePrevious: 'Antes',
          color: 'Cor',
          copyColor: 'Cor da cópia',
          setThumbnail: 'Definir como miniatura',
          unsetThumbnail: 'Remover miniatura',
          error: {
            needName: 'O nome não pode estar vazio',
            invalidNameLength: 'O nome deve conter no máximo 20 caracteres',
            wrongColor: 'Cor é inválida',
            nameExists: 'Este nome já existe',
            invalidCategory: 'A categoria não existe',
            download: 'Falha ao baixar mídia',
          },
          success: {
            create: 'A categoria foi criada!',
            delete: 'A categoria foi excluída!',
            edit: 'A categoria foi alterada!',
            move: 'A categoria foi movida!',
            download: 'A mídia foi carregada!',
            setThumbnail: 'Conjunto de miniaturas para categoria!',
            unsetThumbnail: 'Miniatura removida da categoria!',
            refreshUrls: 'URLs atualizados!',
          },
          emptyHint: 'Clique com o botão direito para criar uma categoria!',
        },
        media: {
          emptyHint: {
            image: 'Clique na estrela no canto de uma imagem para colocá-la em seus favoritos',
            video: 'Clique na estrela no canto de um vídeo para colocá-lo em seus favoritos',
            audio: 'Clique na estrela no canto de um áudio para colocá-lo em seus favoritos',
            file: 'Clique na estrela no canto de um arquivo para adicioná-lo aos seus favoritos',
          },
          addTo: 'Adicionar',
          moveTo: 'Mover',
          removeFrom: 'Remover da categoria',
          copySource: 'Copiar fonte de mídia',
          upload: {
            title: 'Envio',
            normal: 'Normal',
            spoiler: 'Spoiler',
          },
          success: {
            move: {
              gif: 'O GIF foi movido!',
              image: 'A imagem foi movida!',
              video: 'O vídeo foi movido!',
              audio: 'O áudio foi movido!',
              file: 'O arquivo foi movido!',
            },
            remove: {
              gif: 'O GIF foi removido das categorias!',
              image: 'A imagem foi removida das categorias!',
              video: 'O vídeo foi removido das categorias!',
              audio: 'O áudio foi removido das categorias!',
              file: 'O arquivo foi removido das categorias!',
            },
            download: {
              gif: 'O GIF foi carregado!',
              image: 'A imagem foi carregada!',
              video: 'O vídeo foi carregado!',
              audio: 'O áudio foi baixado!',
              file: 'O arquivo foi baixado!',
            },
          },
          error: {
            download: {
              gif: 'Falha ao baixar o GIF',
              image: 'Falha ao carregar imagem',
              video: 'Falha ao baixar o vídeo',
              audio: 'Falha ao baixar áudio',
              file: 'Falha ao baixar o arquivo',
            },
          },
          controls: {
            show: 'Mostrar pedidos',
            hide: 'Ocultar pedidos',
          },
          placeholder: {
            gif: 'Nome do GIF',
            image: 'Nome da imagem',
            video: 'Nome do vídeo',
            audio: 'Nome de áudio',
            file: 'Nome do arquivo',
          },
        },
        searchItem: {
          gif: 'Pesquise GIFs ou categorias',
          image: 'Pesquise imagens ou categorias',
          video: 'Pesquise vídeos ou categorias',
          audio: 'Pesquise áudios ou categorias',
          file: 'Procurando por arquivos ou categorias',
        },
        import: {
          panel: 'Importação de mídia',
          label: {
            types: 'Tipos',
            medias: 'meios de comunicação',
            categories: 'Categorias',
          },
          buttonImport: 'Importar',
          success: 'A mídia foi importada!',
          error: 'Falha ao importar mídia',
        },
        cache: {
          panel: 'Banco de dados local',
          total: 'Total:',
          size: 'Tamanho :',
          clear: {
            confirm: 'Você realmente deseja esvaziar o banco de dados?',
            button: 'Banco de dados vazio',
            success: 'O banco de dados foi esvaziado!',
            error: 'Falha ao despejar o banco de dados',
          },
          cacheAll: {
            button: 'Armazenar em cache todas as mídias',
            confirm: 'Você deseja armazenar em cache todas as mídias?',
            noMedia: 'Não há mídia para armazenar em cache',
            success: 'A mídia foi armazenada em cache!',
            error: 'Falha ao armazenar mídia em cache',
          },
          refreshButton: 'Atualizar',
        },
        mediasCounter: 'Número de mídias',
        settings: {
          hideUnsortedMedias: {
            name: 'Ocultar mídia',
            note: 'Ocultar mídia da guia que não está categorizada',
          },
          hideThumbnail: {
            name: 'Ocultar miniaturas',
            note: 'Mostra a cor da categoria em vez de uma miniatura aleatória',
          },
          allowCaching: {
            name: 'Permitir cache de visualização de mídia',
            note: 'Usa cache offline local para armazenar em cache a visualização de mídia',
          },
          mediaVolume: {
            name: 'Volume de mídia',
            note: 'Volume de reprodução de mídia na guia',
          },
          maxMediasPerPage: {
            name: 'Número máximo de mídia por página',
            note: 'O número máximo de mídias exibidas por página na guia',
          },
          position: {
            name: 'Posição do botão',
          },
          gif: {
            name: 'Configurações de GIF',
            enabled: {
              name: 'Em geral',
              note: 'Substitui a guia GIF do Discord',
            },
            alwaysSendInstantly: {
              name: 'Entrega imediata',
              note: 'Envie imediatamente o link ou arquivo de mídia',
            },
            alwaysUploadFile: {
              name: 'Sempre carregue como arquivo',
              note: 'Faça upload de mídia como um arquivo em vez de enviar um link',
            },
          },
          image: {
            name: 'Configurações de imagem',
            enabled: {
              name: 'Em geral',
              note: 'Habilite este tipo de mídia',
            },
            showBtn: {
              name: 'Botão',
              note: 'Mostrar botão na barra de chat',
            },
            showStar: {
              name: 'Estrela',
              note: 'Mostra estrela favorita na mídia',
            },
            alwaysSendInstantly: {
              name: 'Entrega imediata',
              note: 'Envie imediatamente o link ou arquivo de mídia',
            },
            alwaysUploadFile: {
              name: 'Sempre carregue como arquivo',
              note: 'Faça upload de mídia como um arquivo em vez de enviar um link',
            },
          },
          video: {
            name: 'Configurações de vídeo',
            enabled: {
              name: 'Em geral',
              note: 'Habilite este tipo de mídia',
            },
            showBtn: {
              name: 'Botão',
              note: 'Mostrar botão na barra de chat',
            },
            showStar: {
              name: 'Estrela',
              note: 'Mostra estrela favorita na mídia',
            },
            alwaysSendInstantly: {
              name: 'Entrega imediata',
              note: 'Envie imediatamente o link ou arquivo de mídia',
            },
            alwaysUploadFile: {
              name: 'Sempre carregue como arquivo',
              note: 'Faça upload de mídia como um arquivo em vez de enviar um link',
            },
          },
          audio: {
            name: 'Configurações de áudio',
            enabled: {
              name: 'Em geral',
              note: 'Habilite este tipo de mídia',
            },
            showBtn: {
              name: 'Botão',
              note: 'Mostrar botão na barra de chat',
            },
            showStar: {
              name: 'Estrela',
              note: 'Mostra estrela favorita na mídia',
            },
          },
          file: {
            name: 'Configurações de arquivo',
            enabled: {
              name: 'Em geral',
              note: 'Habilite este tipo de mídia',
            },
            showBtn: {
              name: 'Botão',
              note: 'Mostrar botão na barra de chat',
            },
            showStar: {
              name: 'Estrela',
              note: 'Mostra estrela favorita na mídia',
            },
            alwaysSendInstantly: {
              name: 'Entrega imediata',
              note: 'Envie imediatamente o link ou arquivo de mídia',
            },
            alwaysUploadFile: {
              name: 'Sempre carregue como arquivo',
              note: 'Faça upload de mídia como um arquivo em vez de enviar um link',
            },
          },
          panel: 'Configurações de plug-in',
        },
      },
      ro: { // Romanian
        tabName: {
          image: 'Imagine',
          video: 'Video',
          audio: 'Audio',
          file: 'Fişier',
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
          refreshUrls: 'Reîmprospătați adresele URL',
          placeholder: 'Numele categoriei',
          move: 'Mișcare',
          moveNext: 'După',
          movePrevious: 'Inainte de',
          color: 'Culoare',
          copyColor: 'Copiați culoarea',
          setThumbnail: 'Setați ca miniatură',
          unsetThumbnail: 'Eliminați miniatura',
          error: {
            needName: 'Numele nu poate fi gol',
            invalidNameLength: 'Numele trebuie să conțină maximum 20 de caractere',
            wrongColor: 'Culoarea nu este validă',
            nameExists: 'Acest nume există deja',
            invalidCategory: 'Categoria nu există',
            download: 'Descărcarea conținutului media nu a reușit',
          },
          success: {
            create: 'Categoria a fost creată!',
            delete: 'Categoria a fost ștearsă!',
            edit: 'Categoria a fost schimbată!',
            move: 'Categoria a fost mutată!',
            download: 'Media a fost încărcată!',
            setThumbnail: 'Set de miniaturi pentru categorie!',
            unsetThumbnail: 'Miniatura eliminată pentru categorie!',
            refreshUrls: 'Adresele URL au fost reîmprospătate!',
          },
          emptyHint: 'Faceți clic dreapta pentru a crea o categorie!',
        },
        media: {
          emptyHint: {
            image: 'Faceți clic pe steaua din colțul unei imagini pentru ao pune în preferatele dvs.',
            video: 'Faceți clic pe steaua din colțul unui videoclip pentru a-l introduce în preferatele dvs.',
            audio: 'Faceți clic pe steaua din colțul unui sunet pentru ao pune în preferatele dvs.',
            file: 'Faceți clic pe steaua din colțul unui fișier pentru a-l adăuga la favorite',
          },
          addTo: 'Adăuga',
          moveTo: 'Mișcare',
          removeFrom: 'Eliminați din categorie',
          copySource: 'Copiați sursa media',
          upload: {
            title: 'Încărcare',
            normal: 'Normal',
            spoiler: 'Spoiler',
          },
          success: {
            move: {
              gif: 'GIF-ul a fost mutat!',
              image: 'Imaginea a fost mutată!',
              video: 'Videoclipul a fost mutat!',
              audio: 'Sunetul a fost mutat!',
              file: 'Fișierul a fost mutat!',
            },
            remove: {
              gif: 'GIF-ul a fost eliminat din categorii!',
              image: 'Imaginea a fost eliminată din categorii!',
              video: 'Videoclipul a fost eliminat din categorii!',
              audio: 'Sunetul a fost eliminat din categorii!',
              file: 'Fișierul a fost eliminat din categorii!',
            },
            download: {
              gif: 'GIF-ul a fost încărcat!',
              image: 'Imaginea a fost încărcată!',
              video: 'Videoclipul a fost încărcat!',
              audio: 'Sunetul a fost descărcat!',
              file: 'Fișierul a fost descărcat!',
            },
          },
          error: {
            download: {
              gif: 'Nu s-a putut descărca GIF',
              image: 'Nu s-a încărcat imaginea',
              video: 'Descărcarea videoclipului nu a reușit',
              audio: 'Descărcarea audio nu a reușit',
              file: 'Nu s-a putut descărca fișierul',
            },
          },
          controls: {
            show: 'Afișați comenzile',
            hide: 'Ascundeți comenzile',
          },
          placeholder: {
            gif: 'Nume GIF',
            image: 'Numele imaginii',
            video: 'Numele videoclipului',
            audio: 'Numele audio',
            file: 'Nume de fișier',
          },
        },
        searchItem: {
          gif: 'Căutați GIF-uri sau categorii',
          image: 'Căutați imagini sau categorii',
          video: 'Căutați videoclipuri sau categorii',
          audio: 'Căutați audio sau categorii',
          file: 'Căutarea fișierelor sau categoriilor',
        },
        import: {
          panel: 'Import media',
          label: {
            types: 'Tipuri',
            medias: 'Mass-media',
            categories: 'Categorii',
          },
          buttonImport: 'Import',
          success: 'Media a fost importată!',
          error: 'Nu s-a putut importa conținut media',
        },
        cache: {
          panel: 'Baza de date locală',
          total: 'Total:',
          size: 'Mărimea :',
          clear: {
            confirm: 'Chiar doriți să goliți baza de date?',
            button: 'Baza de date goală',
            success: 'Baza de date a fost golită!',
            error: 'Nu s-a putut descărca baza de date',
          },
          cacheAll: {
            button: 'Memorați în cache toate conținuturile media',
            confirm: 'Doriți să puneți în cache toate conținuturile media?',
            noMedia: 'Nu există suport de stocare în cache',
            success: 'Media a fost stocată în cache!',
            error: 'Eroare la stocarea în cache a media',
          },
          refreshButton: 'Reîmprospăta',
        },
        mediasCounter: 'Numărul de medii',
        settings: {
          hideUnsortedMedias: {
            name: 'Ascunde conținut media',
            note: 'Ascundeți media din fila care nu sunt clasificate',
          },
          hideThumbnail: {
            name: 'Ascunde miniaturile',
            note: 'Afișează culoarea categoriei în loc de o miniatură aleatorie',
          },
          allowCaching: {
            name: 'Permite stocarea în cache a previzualizării media',
            note: 'Utilizează memoria cache offline locală pentru a stoca în cache previzualizarea media',
          },
          mediaVolume: {
            name: 'Volumul media',
            note: 'Volumul redării media în filă',
          },
          maxMediasPerPage: {
            name: 'Număr maxim de conținut media pe pagină',
            note: 'Numărul maxim de conținut media afișat pe pagină în filă',
          },
          position: {
            name: 'Poziția butonului',
          },
          gif: {
            name: 'setări GIF',
            enabled: {
              name: 'General',
              note: 'Înlocuiește fila GIF a Discord',
            },
            alwaysSendInstantly: {
              name: 'Livrare imediata',
              note: 'Trimiteți imediat linkul media sau fișierul',
            },
            alwaysUploadFile: {
              name: 'Încărcați întotdeauna ca fișier',
              note: 'Încărcați media ca fișier, în loc să trimiteți un link',
            },
          },
          image: {
            name: 'Setări imagine',
            enabled: {
              name: 'General',
              note: 'Activați acest tip de media',
            },
            showBtn: {
              name: 'Buton',
              note: 'Afișați butonul de pe bara de chat',
            },
            showStar: {
              name: 'Stea',
              note: 'Afișează vedeta preferată pe media',
            },
            alwaysSendInstantly: {
              name: 'Livrare imediata',
              note: 'Trimiteți imediat linkul media sau fișierul',
            },
            alwaysUploadFile: {
              name: 'Încărcați întotdeauna ca fișier',
              note: 'Încărcați media ca fișier, în loc să trimiteți un link',
            },
          },
          video: {
            name: 'Setari video',
            enabled: {
              name: 'General',
              note: 'Activați acest tip de media',
            },
            showBtn: {
              name: 'Buton',
              note: 'Afișați butonul de pe bara de chat',
            },
            showStar: {
              name: 'Stea',
              note: 'Afișează vedeta preferată pe media',
            },
            alwaysSendInstantly: {
              name: 'Livrare imediata',
              note: 'Trimiteți imediat linkul media sau fișierul',
            },
            alwaysUploadFile: {
              name: 'Încărcați întotdeauna ca fișier',
              note: 'Încărcați media ca fișier, în loc să trimiteți un link',
            },
          },
          audio: {
            name: 'Setari audio',
            enabled: {
              name: 'General',
              note: 'Activați acest tip de media',
            },
            showBtn: {
              name: 'Buton',
              note: 'Afișați butonul de pe bara de chat',
            },
            showStar: {
              name: 'Stea',
              note: 'Afișează vedeta preferată pe media',
            },
          },
          file: {
            name: 'Setări fișiere',
            enabled: {
              name: 'General',
              note: 'Activați acest tip de media',
            },
            showBtn: {
              name: 'Buton',
              note: 'Afișați butonul de pe bara de chat',
            },
            showStar: {
              name: 'Stea',
              note: 'Afișează vedeta preferată pe media',
            },
            alwaysSendInstantly: {
              name: 'Livrare imediata',
              note: 'Trimiteți imediat linkul media sau fișierul',
            },
            alwaysUploadFile: {
              name: 'Încărcați întotdeauna ca fișier',
              note: 'Încărcați media ca fișier, în loc să trimiteți un link',
            },
          },
          panel: 'Setări plugin',
        },
      },
      ru: { // Russian
        tabName: {
          image: 'Картина',
          video: 'Видео',
          audio: 'Аудио',
          file: 'Файл',
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
          refreshUrls: 'Обновить URL-адреса',
          placeholder: 'Название категории',
          move: 'Двигаться',
          moveNext: 'После',
          movePrevious: 'Перед',
          color: 'Цвет',
          copyColor: 'Цвет копии',
          setThumbnail: 'Установить как миниатюру',
          unsetThumbnail: 'Удалить миниатюру',
          error: {
            needName: 'Имя не может быть пустым',
            invalidNameLength: 'Имя должно содержать не более 20 символов.',
            wrongColor: 'Цвет недействителен',
            nameExists: 'Это имя уже существует',
            invalidCategory: 'Категория не существует',
            download: 'Не удалось скачать медиа',
          },
          success: {
            create: 'Категория создана!',
            delete: 'Категория удалена!',
            edit: 'Категория изменена!',
            move: 'Категория перемещена!',
            download: 'Медиа загружена!',
            setThumbnail: 'Набор миниатюр для категории!',
            unsetThumbnail: 'Миниатюра удалена из категории!',
            refreshUrls: 'URL-адреса обновлены!',
          },
          emptyHint: 'Щелкните правой кнопкой мыши, чтобы создать категорию!',
        },
        media: {
          emptyHint: {
            image: 'Нажмите на звезду в углу изображения, чтобы добавить его в избранное.',
            video: 'Нажмите на звездочку в углу видео, чтобы добавить его в избранное.',
            audio: 'Нажмите на звездочку в углу аудио, чтобы добавить его в избранное.',
            file: 'Нажмите на звездочку в углу файла, чтобы добавить его в избранное.',
          },
          addTo: 'Добавлять',
          moveTo: 'Двигаться',
          removeFrom: 'Удалить из категории',
          copySource: 'Копировать медиа-источник',
          upload: {
            title: 'Загрузить',
            normal: 'Обычный',
            spoiler: 'Спойлер',
          },
          success: {
            move: {
              gif: 'Гифку перенесли!',
              image: 'Изображение было перемещено!',
              video: 'Видео перемещено!',
              audio: 'Звук был перемещен!',
              file: 'Файл перемещен!',
            },
            remove: {
              gif: 'Гифка удалена из категорий!',
              image: 'Изображение удалено из категорий!',
              video: 'Видео удалено из категорий!',
              audio: 'Аудио удалено из категорий!',
              file: 'Файл удален из категорий!',
            },
            download: {
              gif: 'Гифка загружена!',
              image: 'Изображение загружено!',
              video: 'Видео загружено!',
              audio: 'Аудио скачано!',
              file: 'Файл скачан!',
            },
          },
          error: {
            download: {
              gif: 'Не удалось скачать GIF',
              image: 'Не удалось загрузить изображение',
              video: 'Не удалось скачать видео',
              audio: 'Не удалось скачать аудио',
              file: 'Не удалось загрузить файл',
            },
          },
          controls: {
            show: 'Показать заказы',
            hide: 'Скрыть заказы',
          },
          placeholder: {
            gif: 'Имя GIF',
            image: 'Имя изображения',
            video: 'Название видео',
            audio: 'Название аудио',
            file: 'Имя файла',
          },
        },
        searchItem: {
          gif: 'Поиск GIF-файлов или категорий',
          image: 'Поиск изображений или категорий',
          video: 'Поиск видео или категорий',
          audio: 'Поиск аудио или категорий',
          file: 'Поиск файлов или категорий',
        },
        import: {
          panel: 'Импорт медиа',
          label: {
            types: 'Типы',
            medias: 'СМИ',
            categories: 'Категории',
          },
          buttonImport: 'Импортировать',
          success: 'Носитель был импортирован!',
          error: 'Не удалось импортировать медиафайлы.',
        },
        cache: {
          panel: 'Локальная база данных',
          total: 'Общий :',
          size: 'Размер :',
          clear: {
            confirm: 'Вы действительно хотите очистить базу данных?',
            button: 'Пустая база данных',
            success: 'База данных очищена!',
            error: 'Не удалось сбросить базу данных',
          },
          cacheAll: {
            button: 'Кэшировать все медиа',
            confirm: 'Вы хотите кэшировать все медиафайлы?',
            noMedia: 'Нет носителя для кэширования',
            success: 'Медиафайл был кэширован!',
            error: 'Сбой при кэшировании мультимедиа',
          },
          refreshButton: 'Обновить',
        },
        mediasCounter: 'Количество носителей',
        settings: {
          hideUnsortedMedias: {
            name: 'Скрыть медиа',
            note: 'Скрыть на вкладке медиафайлы, не относящиеся к категориям',
          },
          hideThumbnail: {
            name: 'Скрыть миниатюры',
            note: 'Показывает цвет категории вместо случайного эскиза.',
          },
          allowCaching: {
            name: 'Разрешить кэширование предварительного просмотра мультимедиа',
            note: 'Использует локальный автономный кеш для кэширования предварительного просмотра мультимедиа.',
          },
          mediaVolume: {
            name: 'Объем мультимедиа',
            note: 'Громкость воспроизведения мультимедиа на вкладке',
          },
          maxMediasPerPage: {
            name: 'Максимальное количество носителей на странице',
            note: 'Максимальное количество медиафайлов, отображаемых на странице во вкладке',
          },
          position: {
            name: 'Положение кнопки',
          },
          gif: {
            name: 'Настройки GIF',
            enabled: {
              name: 'Общий',
              note: 'Заменяет вкладку GIF в Discord.',
            },
            alwaysSendInstantly: {
              name: 'Немедленная доставка',
              note: 'Немедленно отправьте медиа-ссылку или файл',
            },
            alwaysUploadFile: {
              name: 'Всегда загружать как файл',
              note: 'Загрузите медиафайл в виде файла, а не отправляйте ссылку.',
            },
          },
          image: {
            name: 'Настройки изображения',
            enabled: {
              name: 'Общий',
              note: 'Включить этот тип мультимедиа',
            },
            showBtn: {
              name: 'Кнопка',
              note: 'Показать кнопку на панели чата',
            },
            showStar: {
              name: 'Звезда',
              note: 'Показывает любимую звезду в СМИ',
            },
            alwaysSendInstantly: {
              name: 'Немедленная доставка',
              note: 'Немедленно отправьте медиа-ссылку или файл',
            },
            alwaysUploadFile: {
              name: 'Всегда загружать как файл',
              note: 'Загрузите медиафайл в виде файла, а не отправляйте ссылку.',
            },
          },
          video: {
            name: 'Настройки видео',
            enabled: {
              name: 'Общий',
              note: 'Включить этот тип мультимедиа',
            },
            showBtn: {
              name: 'Кнопка',
              note: 'Показать кнопку на панели чата',
            },
            showStar: {
              name: 'Звезда',
              note: 'Показывает любимую звезду в СМИ',
            },
            alwaysSendInstantly: {
              name: 'Немедленная доставка',
              note: 'Немедленно отправьте медиа-ссылку или файл',
            },
            alwaysUploadFile: {
              name: 'Всегда загружать как файл',
              note: 'Загрузите медиафайл в виде файла, а не отправляйте ссылку.',
            },
          },
          audio: {
            name: 'Настройки звука',
            enabled: {
              name: 'Общий',
              note: 'Включить этот тип мультимедиа',
            },
            showBtn: {
              name: 'Кнопка',
              note: 'Показать кнопку на панели чата',
            },
            showStar: {
              name: 'Звезда',
              note: 'Показывает любимую звезду в СМИ',
            },
          },
          file: {
            name: 'Настройки файла',
            enabled: {
              name: 'Общий',
              note: 'Включить этот тип мультимедиа',
            },
            showBtn: {
              name: 'Кнопка',
              note: 'Показать кнопку на панели чата',
            },
            showStar: {
              name: 'Звезда',
              note: 'Показывает любимую звезду в СМИ',
            },
            alwaysSendInstantly: {
              name: 'Немедленная доставка',
              note: 'Немедленно отправьте медиа-ссылку или файл',
            },
            alwaysUploadFile: {
              name: 'Всегда загружать как файл',
              note: 'Загрузите медиафайл в виде файла, а не отправляйте ссылку.',
            },
          },
          panel: 'Настройки плагина',
        },
      },
      sk: { // Slovak
        tabName: {
          image: 'Slika',
          video: 'Video',
          audio: 'Avdio',
          file: 'mapa',
        },
        create: 'Ustvari',
        category: {
          list: 'kategorije',
          unsorted: 'Nerazvrščeno',
          create: 'Ustvarite kategorijo',
          edit: 'Uredi kategorijo',
          delete: 'Izbriši kategorijo',
          deleteConfirm: 'Ta kategorija vsebuje podkategorije. Vsi bodo izbrisani. Ali ste prepričani, da želite izbrisati kategorije?',
          download: 'Prenesite medije',
          refreshUrls: 'Obnoviť adresy URL',
          placeholder: 'Ime kategorije',
          move: 'Premakni se',
          moveNext: 'Po',
          movePrevious: 'prej',
          color: 'barva',
          copyColor: 'Kopiraj barvo',
          setThumbnail: 'Nastavi kot sličico',
          unsetThumbnail: 'Odstrani sličico',
          error: {
            needName: 'Ime ne sme biti prazno',
            invalidNameLength: 'Ime mora vsebovati največ 20 znakov',
            wrongColor: 'Barva je neveljavna',
            nameExists: 'to ime že obstaja',
            invalidCategory: 'Kategorija ne obstaja',
            download: 'Prenos predstavnosti ni uspel',
          },
          success: {
            create: 'Kategorija je ustvarjena!',
            delete: 'Kategorija je bila izbrisana!',
            edit: 'Kategorija je spremenjena!',
            move: 'Kategorija je bila premaknjena!',
            download: 'Predstavnost je bila naložena!',
            setThumbnail: 'Sličica za kategorijo!',
            unsetThumbnail: 'Odstranjena sličica za kategorijo!',
            refreshUrls: 'Webové adresy boli obnovené!',
          },
          emptyHint: 'Z desnim klikom ustvarite kategorijo!',
        },
        media: {
          emptyHint: {
            image: 'Kliknite zvezdico v kotu slike, da jo dodate med priljubljene',
            video: 'Kliknite zvezdico v kotu videoposnetka, da ga dodate med priljubljene',
            audio: 'Kliknite zvezdico v kotu zvoka, da ga dodate med priljubljene',
            file: 'Kliknite zvezdico v kotu datoteke, da jo dodate med priljubljene',
          },
          addTo: 'Dodaj',
          moveTo: 'Premakni se',
          removeFrom: 'Odstrani iz kategorije',
          copySource: 'Kopiraj vir predstavnosti',
          upload: {
            title: 'Naloži',
            normal: 'normalno',
            spoiler: 'Spojlerji',
          },
          success: {
            move: {
              gif: 'GIF je bil premaknjen!',
              image: 'Slika je bila premaknjena!',
              video: 'Video je bil premaknjen!',
              audio: 'Zvok je bil premaknjen!',
              file: 'Datoteka je bila premaknjena!',
            },
            remove: {
              gif: 'GIF je bil odstranjen iz kategorij!',
              image: 'Slika je bila odstranjena iz kategorij!',
              video: 'Video je bil odstranjen iz kategorij!',
              audio: 'Avdio je bil odstranjen iz kategorij!',
              file: 'Datoteka je bila odstranjena iz kategorij!',
            },
            download: {
              gif: 'GIF je bil naložen!',
              image: 'Slika je bila naložena!',
              video: 'Video je bil naložen!',
              audio: 'Zvok je bil naložen!',
              file: 'Datoteka je bila prenesena!',
            },
          },
          error: {
            download: {
              gif: 'Prenos GIF-a ni uspel',
              image: 'Nalaganje slike ni uspelo',
              video: 'Prenos videa ni uspel',
              audio: 'Prenos zvoka ni uspel',
              file: 'Prenos datoteke ni uspel',
            },
          },
          controls: {
            show: 'Prikaži naročila',
            hide: 'Skrij ukaze',
          },
          placeholder: {
            gif: 'Ime GIF',
            image: 'Ime slike',
            video: 'Ime videa',
            audio: 'Ime zvoka',
            file: 'Ime datoteke',
          },
        },
        searchItem: {
          gif: 'Iščite po GIF-ih ali kategorijah',
          image: 'Iščite po slikah ali kategorijah',
          video: 'Poiščite videoposnetke ali kategorije',
          audio: 'Iskanje zvokov ali kategorij',
          file: 'Poiščite datoteke ali kategorije',
        },
        import: {
          panel: 'Uvoz medijev',
          label: {
            types: 'Vrste',
            medias: 'Mediji',
            categories: 'kategorije',
          },
          buttonImport: 'Uvozi',
          success: 'Mediji so bili uvoženi!',
          error: 'Uvoz predstavnosti ni uspel',
        },
        cache: {
          panel: 'Lokalna zbirka podatkov',
          total: 'Skupaj:',
          size: 'Velikost:',
          clear: {
            confirm: 'Ali res želite izprazniti bazo podatkov?',
            button: 'Prazna zbirka podatkov',
            success: 'Baza podatkov je izpraznjena!',
            error: 'Izpis baze podatkov ni uspel',
          },
          cacheAll: {
            button: 'Predpomni vse medije',
            confirm: 'Ali želite predpomniti vse medije?',
            noMedia: 'Ni medija za predpomnilnik',
            success: 'Mediji so bili predpomnjeni!',
            error: 'Napaka med predpomnjenjem medija',
          },
          refreshButton: 'Osveži',
        },
        mediasCounter: 'Število medijev',
        settings: {
          hideUnsortedMedias: {
            name: 'Skrij medije',
            note: 'Na zavihku skrij medije, ki niso kategorizirani',
          },
          hideThumbnail: {
            name: 'Skrij sličice',
            note: 'Prikaže barvo kategorije namesto naključne sličice',
          },
          allowCaching: {
            name: 'Dovoli predpomnjenje predogleda medijev',
            note: 'Uporablja lokalni predpomnilnik brez povezave za predpomnilnik predstavnosti',
          },
          mediaVolume: {
            name: 'Glasnost predstavnosti',
            note: 'Glasnost predvajanja medijev v zavihku',
          },
          maxMediasPerPage: {
            name: 'Največje število medijev na stran',
            note: 'Največje število medijev, prikazanih na stran v zavihku',
          },
          position: {
            name: 'Položaj gumba',
          },
          gif: {
            name: 'nastavitve GIF',
            enabled: {
              name: 'Splošno',
              note: 'Zamenja Discordov zavihek GIF',
            },
            alwaysSendInstantly: {
              name: 'Takojšnja dostava',
              note: 'Takoj pošljite medijsko povezavo ali datoteko',
            },
            alwaysUploadFile: {
              name: 'Vedno naloži kot datoteko',
              note: 'Predstavnost naložite kot datoteko namesto pošiljanja povezave',
            },
          },
          image: {
            name: 'Nastavitve slike',
            enabled: {
              name: 'Splošno',
              note: 'Omogoči to vrsto medija',
            },
            showBtn: {
              name: 'Gumb',
              note: 'Prikaži gumb v vrstici za klepet',
            },
            showStar: {
              name: 'zvezda',
              note: 'Prikazuje najljubšo zvezdo v medijih',
            },
            alwaysSendInstantly: {
              name: 'Takojšnja dostava',
              note: 'Takoj pošljite medijsko povezavo ali datoteko',
            },
            alwaysUploadFile: {
              name: 'Vedno naloži kot datoteko',
              note: 'Predstavnost naložite kot datoteko namesto pošiljanja povezave',
            },
          },
          video: {
            name: 'Nastavitve videa',
            enabled: {
              name: 'Splošno',
              note: 'Omogoči to vrsto medija',
            },
            showBtn: {
              name: 'Gumb',
              note: 'Prikaži gumb v vrstici za klepet',
            },
            showStar: {
              name: 'zvezda',
              note: 'Prikazuje najljubšo zvezdo v medijih',
            },
            alwaysSendInstantly: {
              name: 'Takojšnja dostava',
              note: 'Takoj pošljite medijsko povezavo ali datoteko',
            },
            alwaysUploadFile: {
              name: 'Vedno naloži kot datoteko',
              note: 'Predstavnost naložite kot datoteko namesto pošiljanja povezave',
            },
          },
          audio: {
            name: 'Nastavitve zvoka',
            enabled: {
              name: 'Splošno',
              note: 'Omogoči to vrsto medija',
            },
            showBtn: {
              name: 'Gumb',
              note: 'Prikaži gumb v vrstici za klepet',
            },
            showStar: {
              name: 'zvezda',
              note: 'Prikazuje najljubšo zvezdo v medijih',
            },
          },
          file: {
            name: 'Nastavitve datoteke',
            enabled: {
              name: 'Splošno',
              note: 'Omogoči to vrsto medija',
            },
            showBtn: {
              name: 'Gumb',
              note: 'Prikaži gumb v vrstici za klepet',
            },
            showStar: {
              name: 'zvezda',
              note: 'Prikazuje najljubšo zvezdo v medijih',
            },
            alwaysSendInstantly: {
              name: 'Takojšnja dostava',
              note: 'Takoj pošljite medijsko povezavo ali datoteko',
            },
            alwaysUploadFile: {
              name: 'Vedno naloži kot datoteko',
              note: 'Predstavnost naložite kot datoteko namesto pošiljanja povezave',
            },
          },
          panel: 'Nastavitve vtičnika',
        },
      },
      sv: { // Swedish
        tabName: {
          image: 'Bild',
          video: 'Video',
          audio: 'Audio',
          file: 'Fil',
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
          refreshUrls: 'Uppdatera webbadresser',
          placeholder: 'Kategori namn',
          move: 'Flytta',
          moveNext: 'Efter',
          movePrevious: 'Innan',
          color: 'Färg',
          copyColor: 'Kopiera färg',
          setThumbnail: 'Ställ in som miniatyrbild',
          unsetThumbnail: 'Ta bort miniatyrbild',
          error: {
            needName: 'Namnet kan inte vara tomt',
            invalidNameLength: 'Namnet måste innehålla högst 20 tecken',
            wrongColor: 'Färgen är ogiltig',
            nameExists: 'detta namn finns redan',
            invalidCategory: 'Kategorin finns inte',
            download: 'Det gick inte att ladda ner media',
          },
          success: {
            create: 'Kategorin har skapats!',
            delete: 'Kategorin har tagits bort!',
            edit: 'Kategorin har ändrats!',
            move: 'Kategorin har flyttats!',
            download: 'Media har laddats upp!',
            setThumbnail: 'Miniatyruppsättning för kategori!',
            unsetThumbnail: 'Miniatyren har tagits bort för kategorin!',
            refreshUrls: 'Webbadresser uppdaterade!',
          },
          emptyHint: 'Högerklicka för att skapa en kategori!',
        },
        media: {
          emptyHint: {
            image: 'Klicka på stjärnan i hörnet av en bild för att lägga den till dina favoriter',
            video: 'Klicka på stjärnan i hörnet av en video för att lägga den till dina favoriter',
            audio: 'Klicka på stjärnan i hörnet av ett ljud för att placera den i dina favoriter',
            file: 'Klicka på stjärnan i hörnet av en fil för att lägga till den i dina favoriter',
          },
          addTo: 'Lägg till',
          moveTo: 'Flytta',
          removeFrom: 'Ta bort från kategori',
          copySource: 'Kopiera mediakälla',
          upload: {
            title: 'Ladda upp',
            normal: 'Vanligt',
            spoiler: 'Spoiler',
          },
          success: {
            move: {
              gif: 'GIF:en har flyttats!',
              image: 'Bilden har flyttats!',
              video: 'Videon har flyttats!',
              audio: 'Ljudet har flyttats!',
              file: 'Filen har flyttats!',
            },
            remove: {
              gif: 'GIF har tagits bort från kategorierna!',
              image: 'Bilden har tagits bort från kategorierna!',
              video: 'Videon har tagits bort från kategorierna!',
              audio: 'Ljud har tagits bort från kategorier!',
              file: 'Filen har tagits bort från kategorierna!',
            },
            download: {
              gif: 'GIF-filen har laddats upp!',
              image: 'Bilden har laddats upp!',
              video: 'Videon har laddats upp!',
              audio: 'Ljudet har laddats ner!',
              file: 'Filen har laddats ner!',
            },
          },
          error: {
            download: {
              gif: 'Det gick inte att ladda ner GIF',
              image: 'Det gick inte att ladda upp bilden',
              video: 'Det gick inte att ladda ner videon',
              audio: 'Det gick inte att ladda ner ljudet',
              file: 'Det gick inte att ladda ned filen',
            },
          },
          controls: {
            show: 'Visa order',
            hide: 'Dölj beställningar',
          },
          placeholder: {
            gif: 'GIF-namn',
            image: 'Bildnamn',
            video: 'Videonamn',
            audio: 'Ljudnamn',
            file: 'Filnamn',
          },
        },
        searchItem: {
          gif: 'Sök efter GIF-filer eller kategorier',
          image: 'Sök efter bilder eller kategorier',
          video: 'Sök efter videor eller kategorier',
          audio: 'Sök efter ljud eller kategorier',
          file: 'Söker efter filer eller kategorier',
        },
        import: {
          panel: 'Mediaimport',
          label: {
            types: 'Typer',
            medias: 'Media',
            categories: 'Kategorier',
          },
          buttonImport: 'Importera',
          success: 'Media har importerats!',
          error: 'Det gick inte att importera media',
        },
        cache: {
          panel: 'Lokal databas',
          total: 'Totalt:',
          size: 'Storlek:',
          clear: {
            confirm: 'Vill du verkligen tömma databasen?',
            button: 'Tom databas',
            success: 'Databasen har tömts!',
            error: 'Det gick inte att dumpa databasen',
          },
          cacheAll: {
            button: 'Cachelagra alla media',
            confirm: 'Vill du cachelagra alla media?',
            noMedia: 'Det finns ingen media att cache',
            success: 'Media har cachats!',
            error: 'Fel vid cachelagring av media',
          },
          refreshButton: 'Uppdatera',
        },
        mediasCounter: 'Antal media',
        settings: {
          hideUnsortedMedias: {
            name: 'Dölj media',
            note: 'Dölj media från fliken som är okategoriserade',
          },
          hideThumbnail: {
            name: 'Dölj miniatyrer',
            note: 'Visar kategorifärg istället för en slumpmässig miniatyrbild',
          },
          allowCaching: {
            name: 'Tillåt cachelagring av mediaförhandsgranskningar',
            note: 'Använder lokal offlinecache för att cache mediaförhandsgranskning',
          },
          mediaVolume: {
            name: 'Medievolym',
            note: 'Mediauppspelningsvolym i fliken',
          },
          maxMediasPerPage: {
            name: 'Maximalt antal media per sida',
            note: 'Det maximala antalet media som visas per sida på fliken',
          },
          position: {
            name: 'Knappens läge',
          },
          gif: {
            name: 'GIF-inställningar',
            enabled: {
              name: 'Allmän',
              note: 'Ersätter Discords GIF-flik',
            },
            alwaysSendInstantly: {
              name: 'Omedelbar leverans',
              note: 'Skicka medialänken eller filen omedelbart',
            },
            alwaysUploadFile: {
              name: 'Ladda alltid upp som fil',
              note: 'Ladda upp media som en fil istället för att skicka en länk',
            },
          },
          image: {
            name: 'Bildinställningar',
            enabled: {
              name: 'Allmän',
              note: 'Aktivera den här mediatypen',
            },
            showBtn: {
              name: 'Knapp',
              note: 'Visa knapp på chattfältet',
            },
            showStar: {
              name: 'Stjärna',
              note: 'Visar favoritstjärna på media',
            },
            alwaysSendInstantly: {
              name: 'Omedelbar leverans',
              note: 'Skicka medialänken eller filen omedelbart',
            },
            alwaysUploadFile: {
              name: 'Ladda alltid upp som fil',
              note: 'Ladda upp media som en fil istället för att skicka en länk',
            },
          },
          video: {
            name: 'Videoinställningar',
            enabled: {
              name: 'Allmän',
              note: 'Aktivera den här mediatypen',
            },
            showBtn: {
              name: 'Knapp',
              note: 'Visa knapp på chattfältet',
            },
            showStar: {
              name: 'Stjärna',
              note: 'Visar favoritstjärna på media',
            },
            alwaysSendInstantly: {
              name: 'Omedelbar leverans',
              note: 'Skicka medialänken eller filen omedelbart',
            },
            alwaysUploadFile: {
              name: 'Ladda alltid upp som fil',
              note: 'Ladda upp media som en fil istället för att skicka en länk',
            },
          },
          audio: {
            name: 'Ljudinställningar',
            enabled: {
              name: 'Allmän',
              note: 'Aktivera den här mediatypen',
            },
            showBtn: {
              name: 'Knapp',
              note: 'Visa knapp på chattfältet',
            },
            showStar: {
              name: 'Stjärna',
              note: 'Visar favoritstjärna på media',
            },
          },
          file: {
            name: 'Filinställningar',
            enabled: {
              name: 'Allmän',
              note: 'Aktivera den här mediatypen',
            },
            showBtn: {
              name: 'Knapp',
              note: 'Visa knapp på chattfältet',
            },
            showStar: {
              name: 'Stjärna',
              note: 'Visar favoritstjärna på media',
            },
            alwaysSendInstantly: {
              name: 'Omedelbar leverans',
              note: 'Skicka medialänken eller filen omedelbart',
            },
            alwaysUploadFile: {
              name: 'Ladda alltid upp som fil',
              note: 'Ladda upp media som en fil istället för att skicka en länk',
            },
          },
          panel: 'Plugin-inställningar',
        },
      },
      th: { // Thai
        tabName: {
          image: 'ภาพ',
          video: 'วีดีโอ',
          audio: 'เครื่องเสียง',
          file: 'ไฟล์',
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
          refreshUrls: 'รีเฟรช URL',
          placeholder: 'ชื่อหมวดหมู่',
          move: 'ย้าย',
          moveNext: 'หลังจาก',
          movePrevious: 'ก่อน',
          color: 'สี',
          copyColor: 'คัดลอกสี',
          setThumbnail: 'ตั้งเป็นรูปขนาดย่อ',
          unsetThumbnail: 'ลบภาพขนาดย่อ',
          error: {
            needName: 'ชื่อไม่สามารถเว้นว่างได้',
            invalidNameLength: 'ชื่อต้องมีอักขระไม่เกิน 20 ตัว',
            wrongColor: 'สีไม่ถูกต้อง',
            nameExists: 'มีชื่อนี้แล้ว',
            invalidCategory: 'ไม่มีหมวดหมู่',
            download: 'ไม่สามารถดาวน์โหลดสื่อ',
          },
          success: {
            create: 'หมวดหมู่ถูกสร้างขึ้น!',
            delete: 'หมวดหมู่ถูกลบ!',
            edit: 'หมวดหมู่มีการเปลี่ยนแปลง!',
            move: 'หมวดหมู่ถูกย้าย!',
            download: 'สื่อได้รับการอัปโหลด!',
            setThumbnail: 'รูปย่อที่ตั้งไว้สำหรับหมวดหมู่!',
            unsetThumbnail: 'ลบภาพขนาดย่อสำหรับหมวดหมู่แล้ว!',
            refreshUrls: 'รีเฟรช URL แล้ว!',
          },
          emptyHint: 'คลิกขวาเพื่อสร้างหมวดหมู่!',
        },
        media: {
          emptyHint: {
            image: 'คลิกที่ดาวที่มุมของภาพเพื่อใส่ในรายการโปรดของคุณ',
            video: 'คลิกที่ดาวที่มุมของวิดีโอเพื่อใส่ในรายการโปรดของคุณ',
            audio: 'คลิกที่ดาวตรงมุมของเสียงเพื่อใส่ในรายการโปรดของคุณ',
            file: 'คลิกที่ดาวตรงมุมของไฟล์เพื่อเพิ่มลงในรายการโปรดของคุณ',
          },
          addTo: 'เพิ่ม',
          moveTo: 'ย้าย',
          removeFrom: 'ลบออกจากหมวดหมู่',
          copySource: 'คัดลอกแหล่งที่มาของสื่อ',
          upload: {
            title: 'ที่อัพโหลด',
            normal: 'ปกติ',
            spoiler: 'สปอยเลอร์',
          },
          success: {
            move: {
              gif: 'ย้าย GIF แล้ว!',
              image: 'ย้ายภาพแล้ว!',
              video: 'วีดีโอถูกย้าย!',
              audio: 'ย้ายเสียงแล้ว!',
              file: 'ย้ายไฟล์แล้ว!',
            },
            remove: {
              gif: 'GIF ถูกลบออกจากหมวดหมู่แล้ว!',
              image: 'รูปภาพถูกลบออกจากหมวดหมู่!',
              video: 'วิดีโอถูกลบออกจากหมวดหมู่แล้ว!',
              audio: 'เสียงถูกลบออกจากหมวดหมู่!',
              file: 'ไฟล์ถูกลบออกจากหมวดหมู่แล้ว!',
            },
            download: {
              gif: 'อัปโหลด GIF แล้ว!',
              image: 'อัปโหลดรูปภาพแล้ว!',
              video: 'อัปโหลดวิดีโอแล้ว!',
              audio: 'ดาวน์โหลดไฟล์เสียงแล้ว!',
              file: 'ดาวน์โหลดไฟล์แล้ว!',
            },
          },
          error: {
            download: {
              gif: 'ดาวน์โหลด GIF ไม่สำเร็จ',
              image: 'ไม่สามารถอัปโหลดภาพ',
              video: 'ไม่สามารถดาวน์โหลดวิดีโอ',
              audio: 'ไม่สามารถดาวน์โหลดเสียง',
              file: 'ดาวน์โหลดไฟล์ไม่สำเร็จ',
            },
          },
          controls: {
            show: 'แสดงคำสั่งซื้อ',
            hide: 'ซ่อนคำสั่งซื้อ',
          },
          placeholder: {
            gif: 'ชื่อ GIF',
            image: 'ชื่อภาพ',
            video: 'ชื่อวิดีโอ',
            audio: 'ชื่อเสียง',
            file: 'ชื่อไฟล์',
          },
        },
        searchItem: {
          gif: 'ค้นหา GIF หรือหมวดหมู่',
          image: 'ค้นหารูปภาพหรือหมวดหมู่',
          video: 'ค้นหาวิดีโอหรือหมวดหมู่',
          audio: 'ค้นหาไฟล์เสียงหรือหมวดหมู่',
          file: 'การค้นหาไฟล์หรือหมวดหมู่',
        },
        import: {
          panel: 'การนำเข้าสื่อ',
          label: {
            types: 'ประเภท',
            medias: 'สื่อ',
            categories: 'หมวดหมู่',
          },
          buttonImport: 'นำเข้า',
          success: 'สื่อนำเข้าแล้ว!',
          error: 'ไม่สามารถนำเข้าสื่อ',
        },
        cache: {
          panel: 'ฐานข้อมูลท้องถิ่น',
          total: 'ทั้งหมด :',
          size: 'ขนาด :',
          clear: {
            confirm: 'คุณต้องการล้างฐานข้อมูลจริง ๆ หรือไม่?',
            button: 'ฐานข้อมูลว่างเปล่า',
            success: 'ฐานข้อมูลว่างเปล่า!',
            error: 'ไม่สามารถดัมพ์ฐานข้อมูล',
          },
          cacheAll: {
            button: 'แคชสื่อทั้งหมด',
            confirm: 'คุณต้องการแคชสื่อทั้งหมดหรือไม่?',
            noMedia: 'ไม่มีสื่อที่จะแคช',
            success: 'สื่อถูกแคช!',
            error: 'ล้มเหลวขณะแคชสื่อ',
          },
          refreshButton: 'รีเฟรช',
        },
        mediasCounter: 'จำนวนสื่อ',
        settings: {
          hideUnsortedMedias: {
            name: 'ซ่อนสื่อ',
            note: 'ซ่อนสื่อจากแท็บที่ไม่มีหมวดหมู่',
          },
          hideThumbnail: {
            name: 'ซ่อนภาพขนาดย่อ',
            note: 'แสดงสีหมวดหมู่แทนภาพขนาดย่อแบบสุ่ม',
          },
          allowCaching: {
            name: 'อนุญาตแคชแสดงตัวอย่างสื่อ',
            note: 'ใช้แคชออฟไลน์ในเครื่องเพื่อแคชตัวอย่างสื่อ',
          },
          mediaVolume: {
            name: 'ปริมาณสื่อ',
            note: 'ระดับเสียงการเล่นสื่อในแท็บ',
          },
          maxMediasPerPage: {
            name: 'จำนวนสื่อสูงสุดต่อหน้า',
            note: 'จำนวนสื่อสูงสุดที่แสดงต่อหน้าในแท็บ',
          },
          position: {
            name: 'ตำแหน่งปุ่ม',
          },
          gif: {
            name: 'การตั้งค่า GIF',
            enabled: {
              name: 'ทั่วไป',
              note: 'แทนที่แท็บ GIF ของ Discord',
            },
            alwaysSendInstantly: {
              name: 'จัดส่งทันที',
              note: 'ส่งลิงค์หรือไฟล์สื่อทันที',
            },
            alwaysUploadFile: {
              name: 'อัปโหลดเป็นไฟล์เสมอ',
              note: 'อัปโหลดสื่อเป็นไฟล์แทนที่จะส่งลิงก์',
            },
          },
          image: {
            name: 'การตั้งค่ารูปภาพ',
            enabled: {
              name: 'ทั่วไป',
              note: 'เปิดใช้งานสื่อประเภทนี้',
            },
            showBtn: {
              name: 'ปุ่ม',
              note: 'แสดงปุ่มบนแถบแชท',
            },
            showStar: {
              name: 'ดาว',
              note: 'โชว์ดาราคนโปรดออกสื่อ',
            },
            alwaysSendInstantly: {
              name: 'จัดส่งทันที',
              note: 'ส่งลิงค์หรือไฟล์สื่อทันที',
            },
            alwaysUploadFile: {
              name: 'อัปโหลดเป็นไฟล์เสมอ',
              note: 'อัปโหลดสื่อเป็นไฟล์แทนที่จะส่งลิงก์',
            },
          },
          video: {
            name: 'การตั้งค่าวิดีโอ',
            enabled: {
              name: 'ทั่วไป',
              note: 'เปิดใช้งานสื่อประเภทนี้',
            },
            showBtn: {
              name: 'ปุ่ม',
              note: 'แสดงปุ่มบนแถบแชท',
            },
            showStar: {
              name: 'ดาว',
              note: 'โชว์ดาราคนโปรดออกสื่อ',
            },
            alwaysSendInstantly: {
              name: 'จัดส่งทันที',
              note: 'ส่งลิงค์หรือไฟล์สื่อทันที',
            },
            alwaysUploadFile: {
              name: 'อัปโหลดเป็นไฟล์เสมอ',
              note: 'อัปโหลดสื่อเป็นไฟล์แทนที่จะส่งลิงก์',
            },
          },
          audio: {
            name: 'การตั้งค่าเสียง',
            enabled: {
              name: 'ทั่วไป',
              note: 'เปิดใช้งานสื่อประเภทนี้',
            },
            showBtn: {
              name: 'ปุ่ม',
              note: 'แสดงปุ่มบนแถบแชท',
            },
            showStar: {
              name: 'ดาว',
              note: 'โชว์ดาราคนโปรดออกสื่อ',
            },
          },
          file: {
            name: 'การตั้งค่าไฟล์',
            enabled: {
              name: 'ทั่วไป',
              note: 'เปิดใช้งานสื่อประเภทนี้',
            },
            showBtn: {
              name: 'ปุ่ม',
              note: 'แสดงปุ่มบนแถบแชท',
            },
            showStar: {
              name: 'ดาว',
              note: 'โชว์ดาราคนโปรดออกสื่อ',
            },
            alwaysSendInstantly: {
              name: 'จัดส่งทันที',
              note: 'ส่งลิงค์หรือไฟล์สื่อทันที',
            },
            alwaysUploadFile: {
              name: 'อัปโหลดเป็นไฟล์เสมอ',
              note: 'อัปโหลดสื่อเป็นไฟล์แทนที่จะส่งลิงก์',
            },
          },
          panel: 'การตั้งค่าปลั๊กอิน',
        },
      },
      tr: { // Turkish
        tabName: {
          image: 'Resim',
          video: 'Video',
          audio: 'Ses',
          file: 'Dosya',
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
          refreshUrls: 'URL\'leri yenile',
          placeholder: 'Kategori adı',
          move: 'Hareket',
          moveNext: 'Sonra',
          movePrevious: 'Önce',
          color: 'Renk',
          copyColor: 'rengi kopyala',
          setThumbnail: '',
          unsetThumbnail: '',
          error: {
            needName: 'Ad boş olamaz',
            invalidNameLength: 'Ad en fazla 20 karakter içermelidir',
            wrongColor: 'Renk geçersiz',
            nameExists: 'bu isim zaten var',
            invalidCategory: 'Kategori mevcut değil',
            download: 'Medya indirilemedi',
          },
          success: {
            create: 'Kategori oluşturuldu!',
            delete: 'Kategori silindi!',
            edit: 'Kategori değiştirildi!',
            move: 'Kategori taşındı!',
            download: 'Medya yüklendi!',
            setThumbnail: '',
            unsetThumbnail: '',
            refreshUrls: 'URL\'ler yenilendi!',
          },
          emptyHint: 'Kategori oluşturmak için sağ tıklayın!',
        },
        media: {
          emptyHint: {
            image: 'Favorilerinize eklemek için bir resmin köşesindeki yıldıza tıklayın',
            video: 'Favorilerinize eklemek için bir videonun köşesindeki yıldıza tıklayın',
            audio: 'Favorilerinize eklemek için bir sesin köşesindeki yıldıza tıklayın',
            file: 'Favorilerinize eklemek için bir dosyanın köşesindeki yıldıza tıklayın',
          },
          addTo: 'Ekle',
          moveTo: 'Hareket',
          removeFrom: 'Kategoriden kaldır',
          copySource: 'Medya kaynağını kopyala',
          upload: {
            title: 'Yükle',
            normal: 'Normal',
            spoiler: 'Bir şeyin önceden reklamı',
          },
          success: {
            move: {
              gif: 'GIF taşındı!',
              image: 'Resim taşındı!',
              video: 'Video taşındı!',
              audio: 'Ses taşındı!',
              file: 'Dosya taşındı!',
            },
            remove: {
              gif: 'GIF kategorilerden kaldırıldı!',
              image: 'Resim kategorilerden kaldırıldı!',
              video: 'Video kategorilerden kaldırıldı!',
              audio: 'Ses kategorilerden kaldırıldı!',
              file: 'Dosya kategorilerden kaldırıldı!',
            },
            download: {
              gif: 'GIF yüklendi!',
              image: 'Resim yüklendi!',
              video: 'Video yüklendi!',
              audio: 'Ses indirildi!',
              file: 'Dosya indirildi!',
            },
          },
          error: {
            download: {
              gif: 'GIF indirilemedi',
              image: 'Resim yüklenemedi',
              video: 'Video indirilemedi',
              audio: 'Ses indirilemedi',
              file: 'Dosya indirilemedi',
            },
          },
          controls: {
            show: 'Siparişleri göster',
            hide: 'Siparişleri gizle',
          },
          placeholder: {
            gif: 'GIF Adı',
            image: 'Resim adı',
            video: 'video adı',
            audio: 'Ses adı',
            file: 'Dosya adı',
          },
        },
        searchItem: {
          gif: 'GIF\'leri veya kategorileri arayın',
          image: 'Resim veya kategori arayın',
          video: 'Videoları veya kategorileri arayın',
          audio: 'Sesleri veya kategorileri arayın',
          file: 'Dosya veya kategori arama',
        },
        import: {
          panel: 'Medyayı İçe Aktarma',
          label: {
            types: 'Türler',
            medias: 'Medya',
            categories: 'Kategoriler',
          },
          buttonImport: 'İçe aktarmak',
          success: 'Medya ithal edildi!',
          error: 'Medya içe aktarılamadı',
        },
        cache: {
          panel: 'Yerel veritabanı',
          total: 'Toplam :',
          size: 'Boyut :',
          clear: {
            confirm: 'Veritabanını gerçekten boşaltmak istiyor musunuz?',
            button: 'Veritabanını boşalt',
            success: 'Veritabanı boşaltıldı!',
            error: 'Veritabanının dökümü başarısız oldu',
          },
          cacheAll: {
            button: 'Tüm medyayı önbelleğe al',
            confirm: 'Tüm medyayı önbelleğe almak istiyor musunuz?',
            noMedia: 'Önbelleğe alınacak medya yok',
            success: 'Medya önbelleğe alındı!',
            error: 'Medyayı önbelleğe alırken hata oluştu',
          },
          refreshButton: 'Yenile',
        },
        mediasCounter: 'Ortam sayısı',
        settings: {
          hideUnsortedMedias: {
            name: 'Medyayı gizle',
            note: 'Kategorize edilmemiş sekmedeki medyayı gizle',
          },
          hideThumbnail: {
            name: 'Küçük resimleri gizle',
            note: 'Rastgele küçük resim yerine kategori rengini gösterir',
          },
          allowCaching: {
            name: 'Medya önizlemesinin önbelleğe alınmasına izin ver',
            note: 'Medya önizlemesini önbelleğe almak için yerel çevrimdışı önbelleği kullanır',
          },
          mediaVolume: {
            name: 'Medya hacmi',
            note: 'Sekmede medya oynatma ses düzeyi',
          },
          maxMediasPerPage: {
            name: 'Sayfa başına maksimum ortam sayısı',
            note: 'Sekmede sayfa başına görüntülenen maksimum ortam sayısı',
          },
          position: {
            name: 'Düğme konumu',
          },
          gif: {
            name: 'GIF ayarları',
            enabled: {
              name: 'Genel',
              note: "Discord'un GIF sekmesinin yerini alır",
            },
            alwaysSendInstantly: {
              name: 'Hemen teslim',
              note: 'Medya bağlantısını veya dosyasını hemen gönderin',
            },
            alwaysUploadFile: {
              name: 'Her zaman dosya olarak yükle',
              note: 'Bağlantı göndermek yerine medyayı dosya olarak yükleyin',
            },
          },
          image: {
            name: 'Görüntü ayarları',
            enabled: {
              name: 'Genel',
              note: 'Bu medya türünü etkinleştirin',
            },
            showBtn: {
              name: 'Düğme',
              note: 'Sohbet çubuğunda düğmeyi göster',
            },
            showStar: {
              name: 'Yıldız',
              note: 'Favori yıldızı medyada gösterir',
            },
            alwaysSendInstantly: {
              name: 'Hemen teslim',
              note: 'Medya bağlantısını veya dosyasını hemen gönderin',
            },
            alwaysUploadFile: {
              name: 'Her zaman dosya olarak yükle',
              note: 'Bağlantı göndermek yerine medyayı dosya olarak yükleyin',
            },
          },
          video: {
            name: 'Video ayarları',
            enabled: {
              name: 'Genel',
              note: 'Bu medya türünü etkinleştirin',
            },
            showBtn: {
              name: 'Düğme',
              note: 'Sohbet çubuğunda düğmeyi göster',
            },
            showStar: {
              name: 'Yıldız',
              note: 'Favori yıldızı medyada gösterir',
            },
            alwaysSendInstantly: {
              name: 'Hemen teslim',
              note: 'Medya bağlantısını veya dosyasını hemen gönderin',
            },
            alwaysUploadFile: {
              name: 'Her zaman dosya olarak yükle',
              note: 'Bağlantı göndermek yerine medyayı dosya olarak yükleyin',
            },
          },
          audio: {
            name: 'Ses ayarları',
            enabled: {
              name: 'Genel',
              note: 'Bu medya türünü etkinleştirin',
            },
            showBtn: {
              name: 'Düğme',
              note: 'Sohbet çubuğunda düğmeyi göster',
            },
            showStar: {
              name: 'Yıldız',
              note: 'Favori yıldızı medyada gösterir',
            },
          },
          file: {
            name: 'Dosya Ayarları',
            enabled: {
              name: 'Genel',
              note: 'Bu medya türünü etkinleştirin',
            },
            showBtn: {
              name: 'Düğme',
              note: 'Sohbet çubuğunda düğmeyi göster',
            },
            showStar: {
              name: 'Yıldız',
              note: 'Favori yıldızı medyada gösterir',
            },
            alwaysSendInstantly: {
              name: 'Hemen teslim',
              note: 'Medya bağlantısını veya dosyasını hemen gönderin',
            },
            alwaysUploadFile: {
              name: 'Her zaman dosya olarak yükle',
              note: 'Bağlantı göndermek yerine medyayı dosya olarak yükleyin',
            },
          },
          panel: 'Eklenti Ayarları',
        },
      },
      uk: { // Ukrainian
        tabName: {
          image: 'Картина',
          video: 'Відео',
          audio: 'Аудіо',
          file: 'Файл',
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
          refreshUrls: 'Оновити URL-адреси',
          placeholder: 'Назва категорії',
          move: 'Рухайся',
          moveNext: 'Після',
          movePrevious: 'Раніше',
          color: 'Колір',
          copyColor: 'Копіювати кольорові',
          setThumbnail: 'Küçük resim olarak ayarla',
          unsetThumbnail: 'Küçük resmi kaldır',
          error: {
            needName: 'Ім\'я не може бути порожнім',
            invalidNameLength: 'Назва повинна містити максимум 20 символів',
            wrongColor: 'Колір недійсний',
            nameExists: 'ця назва вже існує',
            invalidCategory: 'Категорія не існує',
            download: 'Не вдалося завантажити медіафайл',
          },
          success: {
            create: 'Категорію створено!',
            delete: 'Категорію видалено!',
            edit: 'Категорію змінено!',
            move: 'Категорію переміщено!',
            download: 'ЗМІ завантажено!',
            setThumbnail: 'Kategori için küçük resim ayarlandı!',
            unsetThumbnail: 'Kategorinin küçük resmi kaldırıldı!',
            refreshUrls: 'URL-адреси оновлено!',
          },
          emptyHint: 'Клацніть правою кнопкою миші, щоб створити категорію!',
        },
        media: {
          emptyHint: {
            image: 'Клацніть на зірочку в кутку зображення, щоб помістити його у вибране',
            video: 'Клацніть на зірочку в кутку відео, щоб поставити його у вибране',
            audio: 'Клацніть на зірочку в кутку звукового супроводу, щоб помістити його у вибране',
            file: 'Натисніть зірочку в кутку файлу, щоб додати його до вибраного',
          },
          addTo: 'Додати',
          moveTo: 'Рухайся',
          removeFrom: 'Вилучити з категорії',
          copySource: 'Копіювати медіа-джерело',
          upload: {
            title: 'Завантажити',
            normal: 'Звичайний',
            spoiler: 'Спойлер',
          },
          success: {
            move: {
              gif: 'GIF переміщено!',
              image: 'Зображення переміщено!',
              video: 'Відео переміщено!',
              audio: 'Аудіо переміщено!',
              file: 'Файл переміщено!',
            },
            remove: {
              gif: 'GIF видалено з категорій!',
              image: 'Зображення видалено з категорій!',
              video: 'Відео видалено з категорій!',
              audio: 'Аудіо вилучено з категорій!',
              file: 'Файл видалено з категорій!',
            },
            download: {
              gif: 'GIF завантажено!',
              image: 'Зображення завантажено!',
              video: 'Відео завантажено!',
              audio: 'Аудіо завантажено!',
              file: 'Файл завантажено!',
            },
          },
          error: {
            download: {
              gif: 'Не вдалося завантажити GIF',
              image: 'Не вдалося завантажити зображення',
              video: 'Не вдалося завантажити відео',
              audio: 'Не вдалося завантажити аудіо',
              file: 'Не вдалося завантажити файл',
            },
          },
          controls: {
            show: 'Показати замовлення',
            hide: 'Сховати замовлення',
          },
          placeholder: {
            gif: 'Назва GIF',
            image: 'Назва зображення',
            video: 'Назва відео',
            audio: 'Назва аудіо',
            file: "Ім'я файлу",
          },
        },
        searchItem: {
          gif: 'Шукайте GIF-файли або категорії',
          image: 'Шукайте зображення або категорії',
          video: 'Шукайте відео або категорії',
          audio: 'Шукайте аудіо чи категорії',
          file: 'Пошук файлів або категорій',
        },
        import: {
          panel: 'Імпорт медіа',
          label: {
            types: 'Типи',
            medias: 'ЗМІ',
            categories: 'Категорії',
          },
          buttonImport: 'Імпорт',
          success: 'Носій інформації імпортовано!',
          error: 'Не вдалося імпортувати медіа',
        },
        cache: {
          panel: 'Локальна база даних',
          total: 'Всього:',
          size: 'Розмір:',
          clear: {
            confirm: 'Ви дійсно хочете очистити базу даних?',
            button: 'Порожня база даних',
            success: 'Базу даних спустошено!',
            error: 'Не вдалося створити дамп бази даних',
          },
          cacheAll: {
            button: 'Кешувати всі медіафайли',
            confirm: 'Ви хочете кешувати всі медіафайли?',
            noMedia: 'Немає медіа для кешу',
            success: 'Медіа збережено в кеші!',
            error: 'Помилка під час кешування медіа',
          },
          refreshButton: 'Оновити',
        },
        mediasCounter: 'Кількість медіа',
        settings: {
          hideUnsortedMedias: {
            name: 'Приховати медіа',
            note: 'Приховати медіафайли на вкладці без категорії',
          },
          hideThumbnail: {
            name: 'Приховати мініатюри',
            note: 'Показує колір категорії замість випадкової мініатюри',
          },
          allowCaching: {
            name: 'Дозволити кешування попереднього перегляду медіа',
            note: 'Використовує локальний офлайн-кеш для кешування попереднього перегляду медіа',
          },
          mediaVolume: {
            name: 'Гучність медіа',
            note: 'Гучність відтворення медіа на вкладці',
          },
          maxMediasPerPage: {
            name: 'Максимальна кількість медіа на сторінці',
            note: 'Максимальна кількість медіафайлів, які відображаються на сторінці вкладки',
          },
          position: {
            name: 'Розташування кнопки',
          },
          gif: {
            name: 'Налаштування GIF',
            enabled: {
              name: 'Загальний',
              note: 'Замінює вкладку GIF Discord',
            },
            alwaysSendInstantly: {
              name: 'Негайна доставка',
              note: 'Негайно надішліть медіа-посилання або файл',
            },
            alwaysUploadFile: {
              name: 'Завжди завантажувати як файл',
              note: 'Завантажте медіа як файл, а не надсилайте посилання',
            },
          },
          image: {
            name: 'Налаштування зображення',
            enabled: {
              name: 'Загальний',
              note: 'Увімкнути цей тип носія',
            },
            showBtn: {
              name: 'Кнопка',
              note: 'Показати кнопку на панелі чату',
            },
            showStar: {
              name: 'зірка',
              note: 'Показує улюблену зірку в ЗМІ',
            },
            alwaysSendInstantly: {
              name: 'Негайна доставка',
              note: 'Негайно надішліть медіа-посилання або файл',
            },
            alwaysUploadFile: {
              name: 'Завжди завантажувати як файл',
              note: 'Завантажте медіа як файл, а не надсилайте посилання',
            },
          },
          video: {
            name: 'Налаштування відео',
            enabled: {
              name: 'Загальний',
              note: 'Увімкнути цей тип носія',
            },
            showBtn: {
              name: 'Кнопка',
              note: 'Показати кнопку на панелі чату',
            },
            showStar: {
              name: 'зірка',
              note: 'Показує улюблену зірку в ЗМІ',
            },
            alwaysSendInstantly: {
              name: 'Негайна доставка',
              note: 'Негайно надішліть медіа-посилання або файл',
            },
            alwaysUploadFile: {
              name: 'Завжди завантажувати як файл',
              note: 'Завантажте медіа як файл, а не надсилайте посилання',
            },
          },
          audio: {
            name: 'Налаштування звуку',
            enabled: {
              name: 'Загальний',
              note: 'Увімкнути цей тип носія',
            },
            showBtn: {
              name: 'Кнопка',
              note: 'Показати кнопку на панелі чату',
            },
            showStar: {
              name: 'зірка',
              note: 'Показує улюблену зірку в ЗМІ',
            },
          },
          file: {
            name: 'Параметри файлу',
            enabled: {
              name: 'Загальний',
              note: 'Увімкнути цей тип носія',
            },
            showBtn: {
              name: 'Кнопка',
              note: 'Показати кнопку на панелі чату',
            },
            showStar: {
              name: 'зірка',
              note: 'Показує улюблену зірку в ЗМІ',
            },
            alwaysSendInstantly: {
              name: 'Негайна доставка',
              note: 'Негайно надішліть медіа-посилання або файл',
            },
            alwaysUploadFile: {
              name: 'Завжди завантажувати як файл',
              note: 'Завантажте медіа як файл, а не надсилайте посилання',
            },
          },
          panel: 'Налаштування плагіна',
        },
      },
      vi: { // Vietnamese
        tabName: {
          image: 'Hình ảnh',
          video: 'Video',
          audio: 'Âm thanh',
          file: 'Tài liệu',
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
          refreshUrls: 'Làm mới URL',
          placeholder: 'Tên danh mục',
          move: 'Di chuyển',
          moveNext: 'Sau',
          movePrevious: 'Trước',
          color: 'Màu sắc',
          copyColor: 'Sao chép màu',
          setThumbnail: 'Đặt làm hình thu nhỏ',
          unsetThumbnail: 'Xóa hình thu nhỏ',
          error: {
            needName: 'Tên không được để trống',
            invalidNameLength: 'Tên phải chứa tối đa 20 ký tự',
            wrongColor: 'Màu không hợp lệ',
            nameExists: 'tên này đã tồn tại',
            invalidCategory: 'Danh mục không tồn tại',
            download: 'Не вдалося завантажити медіафайл',
          },
          success: {
            create: 'Chuyên mục đã được tạo!',
            delete: 'Danh mục đã bị xóa!',
            edit: 'Danh mục đã được thay đổi!',
            move: 'Danh mục đã được di chuyển!',
            download: 'ЗМІ завантажено!',
            setThumbnail: 'Đặt hình thu nhỏ cho danh mục!',
            unsetThumbnail: 'Đã xóa hình thu nhỏ cho danh mục!',
            refreshUrls: 'Đã làm mới URL!',
          },
          emptyHint: 'Nhấp chuột phải để tạo một danh mục!',
        },
        media: {
          emptyHint: {
            image: 'Nhấp vào ngôi sao ở góc của hình ảnh để đưa nó vào mục yêu thích của bạn',
            video: 'Nhấp vào ngôi sao ở góc video để đưa video đó vào mục yêu thích của bạn',
            audio: 'Nhấp vào ngôi sao ở góc của âm thanh để đưa nó vào mục yêu thích của bạn',
            file: 'Nhấp vào ngôi sao ở góc của tệp để thêm nó vào mục yêu thích của bạn',
          },
          addTo: 'Thêm vào',
          moveTo: 'Di chuyển',
          removeFrom: 'Xóa khỏi danh mục',
          copySource: 'Sao chép nguồn phương tiện',
          upload: {
            title: 'Tải lên',
            normal: 'Bình thường',
            spoiler: 'Spoiler',
          },
          success: {
            move: {
              gif: 'GIF đã được di chuyển!',
              image: 'Hình ảnh đã được di chuyển!',
              video: 'Video đã được chuyển đi!',
              audio: 'Âm thanh đã được di chuyển!',
              file: 'Tệp đã được di chuyển!',
            },
            remove: {
              gif: 'GIF đã bị xóa khỏi danh mục!',
              image: 'Hình ảnh đã bị xóa khỏi danh mục!',
              video: 'Video đã bị xóa khỏi danh mục!',
              audio: 'Âm thanh đã bị xóa khỏi danh mục!',
              file: 'Tệp đã bị xóa khỏi danh mục!',
            },
            download: {
              gif: 'GIF đã được tải lên!',
              image: 'Зображення завантажено!',
              video: 'Відео завантажено!',
              audio: 'Аудіо завантажено!',
              file: 'Tệp đã được tải xuống!',
            },
          },
          error: {
            download: {
              gif: 'Không thể tải xuống GIF',
              image: 'Не вдалося завантажити зображення',
              video: 'Не вдалося завантажити відео',
              audio: 'Не вдалося завантажити аудіо',
              file: 'Không thể tải tập tin xuống',
            },
          },
          controls: {
            show: 'Hiển thị đơn đặt hàng',
            hide: 'Ẩn đơn đặt hàng',
          },
          placeholder: {
            gif: 'Tên GIF',
            image: 'Tên Hình ảnh',
            video: 'Tên video',
            audio: 'Tên âm thanh',
            file: 'Tên tập tin',
          },
        },
        searchItem: {
          gif: 'Tìm kiếm GIF hoặc danh mục',
          image: 'Tìm kiếm hình ảnh hoặc danh mục',
          video: 'Tìm kiếm video hoặc danh mục',
          audio: 'Tìm kiếm âm thanh hoặc danh mục',
          file: 'Tìm kiếm tập tin hoặc danh mục',
        },
        import: {
          panel: 'Nhập phương tiện',
          label: {
            types: 'Các loại',
            medias: 'Phương tiện truyền thông',
            categories: 'Thể loại',
          },
          buttonImport: 'Nhập khẩu',
          success: 'Các phương tiện truyền thông đã được nhập khẩu!',
          error: 'Không thể nhập phương tiện',
        },
        cache: {
          panel: 'Cơ sở dữ liệu cục bộ',
          total: 'Tổng cộng :',
          size: 'Kích cỡ :',
          clear: {
            confirm: 'Bạn có thực sự muốn làm trống cơ sở dữ liệu?',
            button: 'Cơ sở dữ liệu trống',
            success: 'Cơ sở dữ liệu đã bị xóa!',
            error: 'Không thể kết xuất cơ sở dữ liệu',
          },
          cacheAll: {
            button: 'Lưu trữ tất cả phương tiện',
            confirm: 'Bạn có muốn lưu trữ tất cả các phương tiện truyền thông?',
            noMedia: 'Không có phương tiện nào để lưu vào bộ nhớ đệm',
            success: 'Phương tiện đã được lưu vào bộ nhớ đệm!',
            error: 'Lỗi khi lưu vào bộ nhớ đệm phương tiện',
          },
          refreshButton: 'Làm cho khỏe lại',
        },
        mediasCounter: 'Số lượng phương tiện truyền thông',
        settings: {
          hideUnsortedMedias: {
            name: 'Ẩn phương tiện',
            note: 'Ẩn phương tiện khỏi tab chưa được phân loại',
          },
          hideThumbnail: {
            name: 'Ẩn hình thu nhỏ',
            note: 'Hiển thị màu danh mục thay vì hình thu nhỏ ngẫu nhiên',
          },
          allowCaching: {
            name: 'Cho phép lưu vào bộ nhớ đệm xem trước phương tiện',
            note: 'Sử dụng bộ nhớ đệm ngoại tuyến cục bộ để lưu vào bộ nhớ đệm xem trước phương tiện',
          },
          mediaVolume: {
            name: 'Âm lượng phương tiện',
            note: 'Âm lượng phát lại phương tiện trong tab',
          },
          maxMediasPerPage: {
            name: 'Số lượng phương tiện tối đa trên mỗi trang',
            note: 'Số lượng phương tiện tối đa được hiển thị trên mỗi trang trong tab',
          },
          position: {
            name: 'Vị trí nút',
          },
          gif: {
            name: 'cài đặt GIF',
            enabled: {
              name: 'Tổng quan',
              note: 'Thay thế tab GIF của Discord',
            },
            alwaysSendInstantly: {
              name: 'Giao ngay',
              note: 'Gửi ngay liên kết hoặc tệp phương tiện',
            },
            alwaysUploadFile: {
              name: 'Luôn tải lên dưới dạng tệp',
              note: 'Tải phương tiện lên dưới dạng tệp thay vì gửi liên kết',
            },
          },
          image: {
            name: 'Cài đặt hình ảnh',
            enabled: {
              name: 'Tổng quan',
              note: 'Bật loại phương tiện này',
            },
            showBtn: {
              name: 'Cái nút',
              note: 'Nút hiển thị trên thanh trò chuyện',
            },
            showStar: {
              name: 'Ngôi sao',
              note: 'Hiển thị ngôi sao yêu thích trên phương tiện truyền thông',
            },
            alwaysSendInstantly: {
              name: 'Giao ngay',
              note: 'Gửi ngay liên kết hoặc tệp phương tiện',
            },
            alwaysUploadFile: {
              name: 'Luôn tải lên dưới dạng tệp',
              note: 'Tải phương tiện lên dưới dạng tệp thay vì gửi liên kết',
            },
          },
          video: {
            name: 'Cài đặt video',
            enabled: {
              name: 'Tổng quan',
              note: 'Bật loại phương tiện này',
            },
            showBtn: {
              name: 'Cái nút',
              note: 'Nút hiển thị trên thanh trò chuyện',
            },
            showStar: {
              name: 'Ngôi sao',
              note: 'Hiển thị ngôi sao yêu thích trên phương tiện truyền thông',
            },
            alwaysSendInstantly: {
              name: 'Giao ngay',
              note: 'Gửi ngay liên kết hoặc tệp phương tiện',
            },
            alwaysUploadFile: {
              name: 'Luôn tải lên dưới dạng tệp',
              note: 'Tải phương tiện lên dưới dạng tệp thay vì gửi liên kết',
            },
          },
          audio: {
            name: 'Cài đặt âm thanh',
            enabled: {
              name: 'Tổng quan',
              note: 'Bật loại phương tiện này',
            },
            showBtn: {
              name: 'Cái nút',
              note: 'Nút hiển thị trên thanh trò chuyện',
            },
            showStar: {
              name: 'Ngôi sao',
              note: 'Hiển thị ngôi sao yêu thích trên phương tiện truyền thông',
            },
          },
          file: {
            name: 'Cài đặt tệp',
            enabled: {
              name: 'Tổng quan',
              note: 'Bật loại phương tiện này',
            },
            showBtn: {
              name: 'Cái nút',
              note: 'Nút hiển thị trên thanh trò chuyện',
            },
            showStar: {
              name: 'Ngôi sao',
              note: 'Hiển thị ngôi sao yêu thích trên phương tiện truyền thông',
            },
            alwaysSendInstantly: {
              name: 'Giao ngay',
              note: 'Gửi ngay liên kết hoặc tệp phương tiện',
            },
            alwaysUploadFile: {
              name: 'Luôn tải lên dưới dạng tệp',
              note: 'Tải phương tiện lên dưới dạng tệp thay vì gửi liên kết',
            },
          },
          panel: 'Cài đặt plugin',
        },
      },
      zh: { // Chinese (China)
        tabName: {
          image: '图片',
          video: '视频',
          audio: '声音的',
          file: '文件',
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
          refreshUrls: '刷新网址',
          placeholder: '分类名称',
          move: '移动',
          moveNext: '后',
          movePrevious: '前',
          color: '颜色',
          copyColor: '复印颜色',
          setThumbnail: '设置为缩略图',
          unsetThumbnail: '删除缩略图',
          error: {
            needName: '名称不能为空',
            invalidNameLength: '名称必须最多包含 20 个字符',
            wrongColor: '颜色无效',
            nameExists: '这个名字已经存在',
            invalidCategory: '该类别不存在',
            download: '无法下载媒体',
          },
          success: {
            create: '该类别已创建！',
            delete: '该分类已被删除！',
            edit: '类别已更改！',
            move: '类别已移动！',
            download: '媒体已上传！',
            setThumbnail: '类别缩略图设置！',
            unsetThumbnail: '该类别的缩略图已删除！',
            refreshUrls: '网址已刷新！',
          },
          emptyHint: '右键创建一个类别！',
        },
        media: {
          emptyHint: {
            image: '单击图像角落的星星将其放入您的收藏夹',
            video: '点击视频角落的星星，将其放入您的收藏夹',
            audio: '单击音频一角的星星将其放入您的收藏夹',
            file: '单击文件一角的星号将其添加到您的收藏夹',
          },
          addTo: '添加',
          moveTo: '移动',
          removeFrom: '从类别中删除',
          copySource: '复制媒体源',
          upload: {
            title: '上传',
            normal: '普通的',
            spoiler: '剧透',
          },
          success: {
            move: {
              gif: 'GIF已被移动！',
              image: '图片已移动！',
              video: '视频已移！',
              audio: '音频已移动！',
              file: '文件已被移动！',
            },
            remove: {
              gif: 'GIF 已从类别中删除！',
              image: '该图片已从类别中删除！',
              video: '该视频已从类别中删除！',
              audio: '音频已从类别中删除！',
              file: '该文件已从类别中删除！',
            },
            download: {
              gif: 'GIF已上传！',
              image: '图片已上传！',
              video: '视频已上传！',
              audio: '音频已下载！',
              file: '文件已下载！',
            },
          },
          error: {
            download: {
              gif: '无法下载 GIF',
              image: '上传图片失败',
              video: '下载视频失败',
              audio: '无法下载音频',
              file: '下载文件失败',
            },
          },
          controls: {
            show: '显示订单',
            hide: '隐藏订单',
          },
          placeholder: {
            gif: '动图名称',
            image: '图片名称',
            video: '视频名称',
            audio: '音频名称',
            file: '文件名',
          },
        },
        searchItem: {
          gif: '搜索 GIF 或类别',
          image: '搜索图像或类别',
          video: '搜索视频或类别',
          audio: '搜索音频或类别',
          file: '搜索文件或类别',
        },
        import: {
          panel: '媒体导入',
          label: {
            types: '类型',
            medias: '媒体',
            categories: '类别',
          },
          buttonImport: '进口',
          success: '媒体已导入！',
          error: '导入媒体失败',
        },
        cache: {
          panel: '本地数据库',
          total: '全部的 ：',
          size: '尺寸 ：',
          clear: {
            confirm: '您真的要清空数据库吗？',
            button: '空数据库',
            success: '数据库已被清空！',
            error: '转储数据库失败',
          },
          cacheAll: {
            button: '缓存所有媒体',
            confirm: '您想缓存所有媒体吗？',
            noMedia: '没有可缓存的媒体',
            success: '媒体已被缓存！',
            error: '缓存媒体时失败',
          },
          refreshButton: '刷新',
        },
        mediasCounter: '媒体数量',
        settings: {
          hideUnsortedMedias: {
            name: '隐藏媒体',
            note: '隐藏选项卡中未分类的媒体',
          },
          hideThumbnail: {
            name: '隐藏缩略图',
            note: '显示类别颜色而不是随机缩略图',
          },
          allowCaching: {
            name: '允许媒体预览缓存',
            note: '使用本地离线缓存来缓存媒体预览',
          },
          mediaVolume: {
            name: '媒体音量',
            note: '选项卡中的媒体播放音量',
          },
          maxMediasPerPage: {
            name: '每页最大媒体数',
            note: '选项卡中每页显示的最大媒体数',
          },
          position: {
            name: '按钮位置',
          },
          gif: {
            name: 'GIF 设置',
            enabled: {
              name: '一般的',
              note: '取代 Discord 的 GIF 选项卡',
            },
            alwaysSendInstantly: {
              name: '立即发货',
              note: '立即发送媒体链接或文件',
            },
            alwaysUploadFile: {
              name: '始终以文件形式上传',
              note: '将媒体作为文件上传而不是发送链接',
            },
          },
          image: {
            name: '图像设置',
            enabled: {
              name: '一般的',
              note: '启用此媒体类型',
            },
            showBtn: {
              name: '按钮',
              note: '在聊天栏上显示按钮',
            },
            showStar: {
              name: '星星',
              note: '在媒体上显示最喜欢的明星',
            },
            alwaysSendInstantly: {
              name: '立即发货',
              note: '立即发送媒体链接或文件',
            },
            alwaysUploadFile: {
              name: '始终以文件形式上传',
              note: '将媒体作为文件上传而不是发送链接',
            },
          },
          video: {
            name: '视频设置',
            enabled: {
              name: '一般的',
              note: '启用此媒体类型',
            },
            showBtn: {
              name: '按钮',
              note: '在聊天栏上显示按钮',
            },
            showStar: {
              name: '星星',
              note: '在媒体上显示最喜欢的明星',
            },
            alwaysSendInstantly: {
              name: '立即发货',
              note: '立即发送媒体链接或文件',
            },
            alwaysUploadFile: {
              name: '始终以文件形式上传',
              note: '将媒体作为文件上传而不是发送链接',
            },
          },
          audio: {
            name: '音频设置',
            enabled: {
              name: '一般的',
              note: '启用此媒体类型',
            },
            showBtn: {
              name: '按钮',
              note: '在聊天栏上显示按钮',
            },
            showStar: {
              name: '星星',
              note: '在媒体上显示最喜欢的明星',
            },
          },
          file: {
            name: '文件设置',
            enabled: {
              name: '一般的',
              note: '启用此媒体类型',
            },
            showBtn: {
              name: '按钮',
              note: '在聊天栏上显示按钮',
            },
            showStar: {
              name: '星星',
              note: '在媒体上显示最喜欢的明星',
            },
            alwaysSendInstantly: {
              name: '立即发货',
              note: '立即发送媒体链接或文件',
            },
            alwaysUploadFile: {
              name: '始终以文件形式上传',
              note: '将媒体作为文件上传而不是发送链接',
            },
          },
          panel: '插件设置',
        },
      },
    }
  }
}
