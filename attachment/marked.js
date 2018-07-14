/**
 * marked - a markdown parser
 * Copyright (c) 2011-2013, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment|closed|closing) *(?:\n{2,}|\s*$)/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', /\n+(?=(?: *[-*_]){3,} *(?:\n+|$))/)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\s]+?<\ \1="">/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' +="" block._tag)="" ('def',="" block.def)="" ();="" **="" *="" normal="" block="" grammar="" block.normal="merge({}," block);="" gfm="" block.gfm="merge({}," block.normal,="" {="" fences:="" ^="" *(`{3,}|~{3,})="" *(\s+)?="" *\n([\s\s]+?)\s*\1="" *(?:\n+|$)="" ,="" paragraph:="" });="" block.gfm.paragraph="replace(block.paragraph)" ('(?!',="" '(?!'="" block.gfm.fences.source.replace('\\1',="" '\\2')="" '|'="" block.list.source.replace('\\1',="" '\\3')="" '|')="" tables="" block.tables="merge({}," block.gfm,="" nptable:="" *(\s.*\|.*)\n="" *([-:]+="" *\|[-|="" :]*)\n((?:.*\|.*(?:\n|$))*)\n*="" table:="" *\|(.+)\n="" *\|(="" *[-:]+[-|="" :]*)\n((?:="" *\|.*(?:\n|$))*)\n*="" lexer="" function="" lexer(options)="" this.tokens="[];" this.tokens.links="{};" this.options="options" ||="" marked.defaults;="" this.rules="block.normal;" if="" (this.options.gfm)="" (this.options.tables)="" }="" else="" expose="" rules="" lexer.rules="block;" static="" lex="" method="" lexer.lex="function(src," options)="" var="" lexer(options);="" return="" lexer.lex(src);="" };="" preprocessing="" lexer.prototype.lex="function(src)" src="src" .replace(="" \r\n|\r="" g,="" '\n')="" \t="" '="" ')="" \u00a0="" \u2424="" '\n');="" this.token(src,="" true);="" lexing="" lexer.prototype.token="function(src," top)="" +$="" gm,="" '')="" next="" loose="" cap="" bull="" b="" item="" space="" i="" l;="" while="" (src)="" newline="" (cap="this.rules.newline.exec(src))" (cap[0].length=""> 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3]
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style',
        text: cap[0]
      });
      continue;
    }

    // def
    if (top && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([`*\[\]()#+\-.!_>])/,
  autolink: /^<([^>]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\ ?\w+(?:"[^"]*"|'[^']*'|[^'"="">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s]) ,="" del:="" ^~~(?="\S)([\s\S]*?\S)~~/," text:="" replace(inline.text)="" (']|',="" '~]|')="" ('|',="" '|https?:="" |')="" ()="" });="" **="" *="" gfm="" +="" line="" breaks="" inline="" grammar="" inline.breaks="merge({}," inline.gfm,="" {="" br:="" replace(inline.br)('{2,}',="" '*')(),="" replace(inline.gfm.text)('{2,}',="" '*')()="" lexer="" &="" compiler="" function="" inlinelexer(links,="" options)="" this.options="options" ||="" marked.defaults;="" this.links="links;" this.rules="inline.normal;" this.renderer="this.options.renderer" new="" renderer;="" if="" (!this.links)="" throw="" error('tokens="" array="" requires="" a="" `links`="" property.');="" }="" (this.options.gfm)="" (this.options.breaks)="" else="" (this.options.pedantic)="" expose="" rules="" inlinelexer.rules="inline;" static="" lexing="" compiling="" method="" inlinelexer.output="function(src," links,="" var="" options);="" return="" inline.output(src);="" };="" inlinelexer.prototype.output="function(src)" out="" link="" text="" href="" cap;="" while="" (src)="" escape="" (cap="this.rules.escape.exec(src))" src="src.substring(cap[0].length);" continue;="" autolink="" (cap[2]="==" '@')="" =="=" ':'="" ?="" this.mangle(cap[1].substring(7))="" :="" this.mangle(cap[1]);="" text;="" null,="" text);="" url="" (gfm)="" tag="" escape(cap[0])="" cap[0];="" href:="" cap[2],="" title:="" cap[3]="" reflink,="" nolink="" ((cap="this.rules.reflink.exec(src))" cap[1]).replace(="" \s+="" g,="" '="" ');="" (!link="" !link.href)="" src;="" link);="" strong="" cap[1]));="" em="" code="" true));="" br="" del="" error('infinite="" loop on="" byte:="" src.charcodeat(0));="" out;="" compile="" inlinelexer.prototype.outputlink="function(cap," link)="" title="link.title" escape(link.title)="" null;="" cap[0].charat(0)="" !="=" '!'="" this.renderer.link(href,="" title,="" this.output(cap[1]))="" this.renderer.image(href,="" escape(cap[1]));="" smartypants="" transformations="" inlinelexer.prototype.smartypants="function(text)" (!this.options.smartypants)="" em-dashes="" .replace(="" --="" '\u2014')="" opening="" singles="" (^|[-\u2014="" (\[{"\s])'="" '$1\u2018')="" closing="" apostrophes="" '\u2019')="" doubles="" (\[{\u2018\s])"="" '$1\u201c')="" "="" '\u201d')="" ellipses="" \.{3}="" '\u2026');="" mangle="" links="" inlinelexer.prototype.mangle="function(text)" l="text.length" i="0" ch;="" for="" (;="" <="" l;="" i++)="" ch="text.charCodeAt(i);" (math.random()=""> 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer() {}

Renderer.prototype.code = function(code, lang, escaped, options) {
  options = options || {};

  if (options.highlight) {
    var out = options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + options.langPrefix
    + lang
    + '">'
    + (escaped ? code : escape(code))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw, options) {
  return '<h' +="" level="" '="" id="'
    + options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'>\n';
};

Renderer.prototype.hr = function() {
  return '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' +="" type="" '="">\n' + body + '</'>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' +="" type="" '="" style="text-align:' + flags.align + '">'
    : '<' +="" type="" '="">';
  return tag + content + '</'>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '_' + text + '_';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  var out = '<a href="' + href + '" ';="" if="" (title)="" {="" out="" +=" title="" title="" '"';="" }="" text="" '<="" a="">';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '" ';="" if="" (title)="" {="" out="" +=" title="" title="" '"';="" }="" ;="" return="" out;="" };="" **="" *="" parsing="" &="" compiling="" function="" parser(options)="" this.tokens="[];" this.token="null;" this.options="options" ||="" marked.defaults;="" this.options.renderer="this.options.renderer" new="" renderer;="" this.renderer="this.options.renderer;" static="" parse="" method="" parser.parse="function(src," options,="" renderer)="" var="" parser="new" parser(options,="" renderer);="" parser.parse(src);="" loop parser.prototype.parse="function(src)" this.inline="new" inlinelexer(src.links,="" this.options,="" this.renderer);="" while="" (this.next())="" next="" token="" parser.prototype.next="function()" preview="" parser.prototype.peek="function()" this.tokens[this.tokens.length="" -="" 1]="" 0;="" text="" tokens="" parser.prototype.parsetext="function()" body="this.token.text;" (this.peek().type="==" 'text')="" this.next().text;="" this.inline.output(body);="" current="" parser.prototype.tok="function()" switch="" (this.token.type)="" case="" 'space':="" '';="" 'hr':="" this.renderer.hr();="" 'heading':="" this.renderer.heading(="" this.inline.output(this.token.text),="" this.token.depth,="" this.token.text,="" );="" 'code':="" this.renderer.code(this.token.text,="" this.token.lang,="" this.token.escaped,="" this.options);="" 'table':="" header="" ,="" i="" row="" cell="" flags="" j;="" for="" (i="0;" <="" this.token.header.length;="" i++)="" header:="" true,="" align:="" this.token.align[i]="" this.inline.output(this.token.header[i]),="" this.token.cells.length;="" (j="0;" j="" row.length;="" j++)="" this.inline.output(row[j]),="" false,="" this.token.align[j]="" this.renderer.table(header,="" body);="" 'blockquote_start':="" (this.next().type="" !="=" 'blockquote_end')="" this.renderer.blockquote(body);="" 'list_start':="" ordered="this.token.ordered;" 'list_end')="" this.renderer.list(body,="" ordered);="" 'list_item_start':="" 'list_item_end')="" =="=" 'text'="" ?="" this.parsetext()="" :="" this.tok();="" this.renderer.listitem(body);="" 'loose_item_start':="" 'html':="" html="!this.token.pre" &&="" !this.options.pedantic="" this.inline.output(this.token.text)="" this.token.text;="" this.renderer.html(html);="" 'paragraph':="" this.renderer.paragraph(this.inline.output(this.token.text));="" 'text':="" this.renderer.paragraph(this.parsetext());="" helpers="" escape(html,="" encode)="" .replace(!encode="" &(?!#?\w+;)="" g="" g,="" '&amp;')="" .replace(="" '&lt;')="">/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function() {
      var out, err;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());
</a></'></]+[^<.,:;"')\]\s])></\></([^></'></tag(?:"[^"]*"|'[^']*'|[^'"></(tag)[\s\s]+?<\>