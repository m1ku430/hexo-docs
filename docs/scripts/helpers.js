/* global hexo */

'use strict'

var pathFn = require('path')
var _ = require('lodash')
var cheerio = require('cheerio')
var lunr = require('lunr')
const { format } = require('path')

var localizedPath = ['docs', 'community', 'contribute']

function startsWith(str, start) {
  return str.substring(0, start.length) === start
}

hexo.extend.helper.register('page_nav', function () {
  var type = this.page.canonical_path.split('/')[0]
  var sidebar = this.site.data.sidebar[type]
  var path = pathFn.basename(this.path)
  var list = {}
  var prefix = 'sidebar.' + type + '.'

  for (var i in sidebar) {
    for (var j in sidebar[i]) {
      list[sidebar[i][j]] = j
    }
  }

  var keys = Object.keys(list)
  var index = keys.indexOf(path)
  var result = ''

  if (index > 0) {
    result +=
        '<a href="' +
        keys[index - 1] +
        '" class="article-footer-prev" title="' +
        this.__(prefix + list[keys[index - 1]]) +
        '">' +
        '<i class="fa fa-chevron-left"></i><span>' +
        this.__('page.prev') +
        '</span></a>'
  }

  if (index < keys.length - 1) {
    result +=
        '<a href="' +
        keys[index + 1] +
        '" class="article-footer-next" title="' +
        this.__(prefix + list[keys[index + 1]]) +
        '">' +
        '<span>' +
        this.__('page.next') +
        '</span><i class="fa fa-chevron-right"></i></a>'
  }

  return result
})

hexo.extend.helper.register('doc_sidebar', function (className) {
  var type = this.page.canonical_path.split('/')[0]
  var sidebar = this.site.data.sidebar[type]
  var path = pathFn.basename(this.path)
  var result = ''
  var self = this
  var prefix = 'sidebar.' + type + '.'

  _.each(sidebar, function (menu, title) {
    result +=
        '<strong class="' +
        className +
        '-title">' +
        self.__(prefix + title) +
        '</strong>'

    _.each(menu, function (link, text) {
      var itemClass = className + '-link'
      if (link === path) itemClass += ' current'

      result +=
          '<a href="' +
          link +
          '" class="' +
          itemClass +
          '">' +
          self.__(prefix + text) +
          '</a>'
    })
  })

  return result
})

hexo.extend.helper.register('header_menu', function (className) {
  var menu = this.site.data.menu
  var result = ''
  var self = this
  var lang = this.page.lang
  var isChinese = lang === 'zh_CN'

  _.each(menu, function (path, title) {
    if (!isChinese && ~localizedPath.indexOf(title)) path = lang + path
    const obj = {
      lang,
      path,
      isChinese,
      include: ~localizedPath.indexOf(title),
      localizedPath,
      title,
    }
    console.log(
        '此处以前是判断语言是否为english，如果是就将lang对应的语言，拼接到请求中',
        obj
    )
    if (path.startsWith('http://') || path.startsWith('https://')) {
      result +=
          '<a href="' +
          self.url_for(path) +
          '" class="' +
          className +
          '-link" target="_blank">' +
          self.__('menu.' + title) +
          '</a>'
    } else {
      result +=
          '<a href="' +
          self.url_for(path) +
          '" class="' +
          className +
          '-link">' +
          self.__('menu.' + title) +
          '</a>'
    }
  })

  return result
})

hexo.extend.helper.register('canonical_url', function (lang) {
  var path = this.page.canonical_path
  console.log(
      '333此处原来是判断当前语言是不是en，如果是en就将当前的语言进行拼接'
  )
  if (lang && lang !== 'zh_CN') path = lang + '/' + path
  return this.config.url + '/' + path
})

hexo.extend.helper.register('url_for_lang', function (path) {
  var lang = this.page.lang
  var url = this.url_for(path)
  if (lang !== 'zh_CN' && url[0] === '/') url = '/' + lang + url
  console.log(
      '444此处原来是判断当前语言是不是en，如果是en就将当前的语言进行拼接',
      url
  )

  return url
})

hexo.extend.helper.register('raw_link', function (path) {
  return 'https://github.com/jinzhu/gorm.io/edit/master/pages/' + path
})

hexo.extend.helper.register('page_anchor', function (str) {
  var $ = cheerio.load(str, { decodeEntities: false })
  var headings = $('h1, h2, h3, h4, h5, h6')

  if (!headings.length) return str

  headings.each(function () {
    var id = $(this).attr('id')

    $(this)
        .addClass('article-heading')
        .append(
            '<a class="article-anchor" href="#' + id + '" aria-hidden="true"></a>'
        )
  })

  return $.html()
})

hexo.extend.helper.register('lunr_index', function (data) {
  var index = lunr(function () {
    this.field('name', { boost: 10 })
    this.field('tags', { boost: 50 })
    this.field('description')
    this.ref('id')

    _.sortBy(data, 'name').forEach((item, i) => {
      this.add(_.assign({ id: i }, item))
    })
  })

  return JSON.stringify(index)
})

hexo.extend.helper.register('canonical_path_for_nav', function () {
  var path = this.page.canonical_path

  if (startsWith(path, 'docs/') || startsWith(path, 'api/')) {
    return path
  }
  return ''
})

hexo.extend.helper.register('lang_name', function (lang) {
  console.log(
      '111此处是传入语言英文名字，然后获取对应的中文名对应的对象',
      this.site.data.languages[lang]
  )
  var data = this.site.data.languages[lang]

  if (data == null) {
    return lang
  }
  console.log('111此处返回对象的中文名，或整个对象')
  return data.name || data
})

hexo.extend.helper.register('disqus_lang', function () {
  console.log(
      '222此处是传入语言英文名字，然后获取对应的中文名对应的对象',
      this.site.data.languages[lang]
  )
  var lang = this.page.lang
  console.log(lang)
  var data = this.site.data.languages[lang]

  if (data == null) {
    return lang
  }
  console.log(
      '222此处返回对象的disqus_lang，或当前page对应的语言lang',
      data.disqus_lang
  )
  return data.disqus_lang || lang
})

hexo.extend.helper.register('hexo_version', function () {
  return this.env.version
})
