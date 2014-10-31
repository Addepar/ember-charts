(function() {

/*!
 * Bootstrap v3.2.0 (http://getbootstrap.com)
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

if (typeof jQuery === 'undefined') { throw new Error('Bootstrap\'s JavaScript requires jQuery') }

/* ========================================================================
 * Bootstrap: transition.js v3.2.0
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.2.0
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.VERSION = '3.2.0'

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.hasClass('alert') ? $this : $this.parent()
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(150) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.alert

  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.2.0
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.VERSION  = '3.2.0'

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state = state + 'Text'

    if (data.resetText == null) $el.data('resetText', $el[val]())

    $el[val](data[state] == null ? this.options[state] : data[state])

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked') && this.$element.hasClass('active')) changed = false
        else $parent.find('.active').removeClass('active')
      }
      if (changed) $input.prop('checked', !this.$element.hasClass('active')).trigger('change')
    }

    if (changed) this.$element.toggleClass('active')
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  var old = $.fn.button

  $.fn.button             = Plugin
  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document).on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    Plugin.call($btn, 'toggle')
    e.preventDefault()
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.2.0
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element).on('keydown.bs.carousel', $.proxy(this.keydown, this))
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      =
    this.sliding     =
    this.interval    =
    this.$active     =
    this.$items      = null

    this.options.pause == 'hover' && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }

  Carousel.VERSION  = '3.2.0'

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true
  }

  Carousel.prototype.keydown = function (e) {
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }

    e.preventDefault()
  }

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || $active[type]()
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var fallback  = type == 'next' ? 'first' : 'last'
    var that      = this

    if (!$next.length) {
      if (!this.options.wrap) return
      $next = this.$element.find('.item')[fallback]()
    }

    if ($next.hasClass('active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.carousel

  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  $(document).on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var href
    var $this   = $(this)
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
    if (!$target.hasClass('carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    Plugin.call($target, options)

    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  })

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.2.0
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.transitioning = null

    if (this.options.parent) this.$parent = $(this.options.parent)
    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.2.0'

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var actives = this.$parent && this.$parent.find('> .panel > .in')

    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse')
      if (hasData && hasData.transitioning) return
      Plugin.call(actives, 'hide')
      hasData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(350)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse')
      .removeClass('in')

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .trigger('hidden.bs.collapse')
        .removeClass('collapsing')
        .addClass('collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(350)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && option == 'show') option = !option
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var href
    var $this   = $(this)
    var target  = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7
    var $target = $(target)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()
    var parent  = $this.attr('data-parent')
    var $parent = parent && $(parent)

    if (!data || !data.transitioning) {
      if ($parent) $parent.find('[data-toggle="collapse"][data-parent="' + parent + '"]').not($this).addClass('collapsed')
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    }

    Plugin.call($target, option)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.2.0
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.2.0'

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.trigger('focus')

      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown', relatedTarget)
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27)/.test(e.keyCode)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive || (isActive && e.keyCode == 27)) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.divider):visible a'
    var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc)

    if (!$items.length) return

    var index = $items.index($items.filter(':focus'))

    if (e.keyCode == 38 && index > 0)                 index--                        // up
    if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
    if (!~index)                                      index = 0

    $items.eq(index).trigger('focus')
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $parent = getParent($(this))
      var relatedTarget = { relatedTarget: this }
      if (!$parent.hasClass('open')) return
      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))
      if (e.isDefaultPrevented()) return
      $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle + ', [role="menu"], [role="listbox"]', Dropdown.prototype.keydown)

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.2.0
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options        = options
    this.$body          = $(document.body)
    this.$element       = $(element)
    this.$backdrop      =
    this.isShown        = null
    this.scrollbarWidth = 0

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.2.0'

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.$body.addClass('modal-open')

    this.setScrollbar()
    this.escape()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$element.find('.modal-dialog') // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(300) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.$body.removeClass('modal-open')

    this.resetScrollbar()
    this.escape()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(300) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keyup.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keyup.dismiss.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus.call(this.$element[0])
          : this.hide.call(this)
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(150) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  Modal.prototype.checkScrollbar = function () {
    if (document.body.clientWidth >= window.innerWidth) return
    this.scrollbarWidth = this.scrollbarWidth || this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    if (this.scrollbarWidth) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', '')
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.2.0
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.$element   = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.2.0'

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $(this.options.viewport.selector || this.options.viewport)

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(document.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var $parent      = this.$element.parent()
        var parentDim    = this.getPosition($parent)

        placement = placement == 'bottom' && pos.top   + pos.height       + actualHeight - parentDim.scroll > parentDim.height ? 'top'    :
                    placement == 'top'    && pos.top   - parentDim.scroll - actualHeight < 0                                   ? 'bottom' :
                    placement == 'right'  && pos.right + actualWidth      > parentDim.width                                    ? 'left'   :
                    placement == 'left'   && pos.left  - actualWidth      < parentDim.left                                     ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(150) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var arrowDelta          = delta.left ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowPosition       = delta.left ? 'left'        : 'top'
    var arrowOffsetPosition = delta.left ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], arrowPosition)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
    this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function () {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.bs.' + this.type)

    this.$element.removeAttr('aria-describedby')

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element.trigger('hidden.bs.' + that.type)
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(150) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof ($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element
    var el     = $element[0]
    var isBody = el.tagName == 'BODY'
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : null, {
      scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop(),
      width:  isBody ? $(window).width()  : $element.outerWidth(),
      height: isBody ? $(window).height() : $element.outerHeight()
    }, isBody ? { top: 0, left: 0 } : $element.offset())
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.width) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    return (this.$tip = this.$tip || $(this.options.template))
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }

  Tooltip.prototype.destroy = function () {
    clearTimeout(this.timeout)
    this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.2.0
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.2.0'

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content').empty()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }

  Popover.prototype.tip = function () {
    if (!this.$tip) this.$tip = $(this.options.template)
    return this.$tip
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.popover

  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: scrollspy.js v3.2.0
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    var process  = $.proxy(this.process, this)

    this.$body          = $('body')
    this.$scrollElement = $(element).is('body') ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', process)
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.2.0'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var offsetMethod = 'offset'
    var offsetBase   = 0

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.offsets = []
    this.targets = []
    this.scrollHeight = this.getScrollHeight()

    var self     = this

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        self.offsets.push(this[0])
        self.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop <= offsets[0]) {
      return activeTarget != (i = targets[0]) && this.activate(i)
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')

    var selector = this.selector +
        '[data-target="' + target + '"],' +
        this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.2.0
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.VERSION = '3.2.0'

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var previous = $ul.find('.active:last a')[0]
    var e        = $.Event('show.bs.tab', {
      relatedTarget: previous
    })

    $this.trigger(e)

    if (e.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: previous
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && $active.hasClass('fade')

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')

      element.addClass('active')

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu')) {
        element.closest('li.dropdown').addClass('active')
      }

      callback && callback()
    }

    transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(150) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: affix.js v3.2.0
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)

    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      =
    this.unpin        =
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.VERSION  = '3.2.0'

  Affix.RESET    = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var scrollHeight = $(document).height()
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.unpin   != null && (scrollTop + this.unpin <= position.top) ? false :
                offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ? 'bottom' :
                offsetTop    != null && (scrollTop <= offsetTop) ? 'top' : false

    if (this.affixed === affix) return
    if (this.unpin != null) this.$element.css('top', '')

    var affixType = 'affix' + (affix ? '-' + affix : '')
    var e         = $.Event(affixType + '.bs.affix')

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    this.affixed = affix
    this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

    this.$element
      .removeClass(Affix.RESET)
      .addClass(affixType)
      .trigger($.Event(affixType.replace('affix', 'affixed')))

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - this.$element.height() - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom) data.offset.bottom = data.offsetBottom
      if (data.offsetTop)    data.offset.top    = data.offsetTop

      Plugin.call($spy, data)
    })
  })

}(jQuery);


})();

(function() {

(function() {

var _ref;


})();

(function() {

Ember.TEMPLATES["chart"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<svg ");
  hashContexts = {'width': depth0,'height': depth0};
  hashTypes = {'width': "STRING",'height': "STRING"};
  options = {hash:{
    'width': ("outerWidth"),
    'height': ("outerHeight")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push(">\n  <g class=\"chart-viewport\" ");
  hashContexts = {'transform': depth0};
  hashTypes = {'transform': "STRING"};
  options = {hash:{
    'transform': ("transformViewport")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bind-attr'] || depth0['bind-attr']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bind-attr", options))));
  data.buffer.push("></g>\n</svg>\n");
  return buffer;
  
});

})();

(function() {

Ember.AddeparMixins = Ember.AddeparMixins || Ember.Namespace.create();

Ember.AddeparMixins.ResizeHandlerMixin = Ember.Mixin.create({
  resizeEndDelay: 200,
  resizing: false,
  onResizeStart: Ember.K,
  onResizeEnd: Ember.K,
  onResize: Ember.K,
  endResize: Ember.computed(function() {
    return function(event) {
      if (this.isDestroyed) {
        return;
      }
      this.set('resizing', false);
      return typeof this.onResizeEnd === "function" ? this.onResizeEnd(event) : void 0;
    };
  }),
  handleWindowResize: function(event) {
    if (!this.get('resizing')) {
      this.set('resizing', true);
      if (typeof this.onResizeStart === "function") {
        this.onResizeStart(event);
      }
    }
    if (typeof this.onResize === "function") {
      this.onResize(event);
    }
    return Ember.run.debounce(this, this.get('endResize'), event, this.get('resizeEndDelay'));
  },
  didInsertElement: function() {
    this._super();
    return this._setupDocumentHandlers();
  },
  willDestroyElement: function() {
    this._removeDocumentHandlers();
    return this._super();
  },
  _setupDocumentHandlers: function() {
    if (this._resizeHandler) {
      return;
    }
    this._resizeHandler = jQuery.proxy(this.get('handleWindowResize'), this);
    return jQuery(window).on("resize." + this.elementId, this._resizeHandler);
  },
  _removeDocumentHandlers: function() {
    jQuery(window).off("resize." + this.elementId, this._resizeHandler);
    return this._resizeHandler = null;
  }
});


})();

(function() {

Ember.AddeparMixins = Ember.AddeparMixins || Ember.Namespace.create();

Ember.AddeparMixins.StyleBindingsMixin = Ember.Mixin.create({
  concatenatedProperties: ['styleBindings'],
  attributeBindings: ['style'],
  unitType: 'px',
  createStyleString: function(styleName, property) {
    var value;
    value = this.get(property);
    if (value === void 0) {
      return;
    }
    if (Ember.typeOf(value) === 'number') {
      value = value + this.get('unitType');
    }
    return "" + styleName + ":" + value + ";";
  },
  applyStyleBindings: function() {
    var lookup, properties, styleBindings, styleComputed, styles,
      _this = this;
    styleBindings = this.styleBindings;
    if (!styleBindings) {
      return;
    }
    lookup = {};
    styleBindings.forEach(function(binding) {
      var property, style, tmp;
      tmp = binding.split(':');
      property = tmp[0];
      style = tmp[1];
      lookup[style || property] = property;
    });
    styles = Ember.keys(lookup);
    properties = styles.map(function(style) {
      return lookup[style];
    });
    styleComputed = Ember.computed(function() {
      var styleString, styleTokens;
      styleTokens = styles.map(function(style) {
        return _this.createStyleString(style, lookup[style]);
      });
      styleString = styleTokens.join('');
      if (styleString.length !== 0) {
        return styleString;
      }
    });
    styleComputed.property.apply(styleComputed, properties);
    return Ember.defineProperty(this, 'style', styleComputed);
  },
  init: function() {
    this.applyStyleBindings();
    return this._super();
  }
});


})();

(function() {

Ember.Charts = Ember.Namespace.create();

Ember.Charts.VERSION = '0.3.0';

if ((_ref = Ember.libraries) != null) {
  _ref.register('Ember Charts', Ember.Charts.VERSION);
}


})();

(function() {


Ember.Charts.Helpers = Ember.Namespace.create({
  groupBy: function(obj, getter) {
    var group, index, key, result, value, _i, _ref;
    result = {};
    for (index = _i = 0, _ref = obj.length; 0 <= _ref ? _i < _ref : _i > _ref; index = 0 <= _ref ? ++_i : --_i) {
      value = obj[index];
      key = getter(value, index);
      group = result[key] || (result[key] = []);
      group.push(value);
    }
    return result;
  },
  LabelTrimmer: Ember.Object.extend({
    getLabelSize: function(d, selection) {
      return 100;
    },
    getLabelText: function(d, selection) {
      return d.label;
    },
    trim: Ember.computed(function() {
      var getLabelSize, getLabelText;
      getLabelSize = this.get('getLabelSize');
      getLabelText = this.get('getLabelText');
      return function(selection) {
        return selection.text(function(d) {
          var bbW, charWidth, label, numChars, textLabelWidth;
          bbW = this.getBBox().width;
          label = getLabelText(d, selection);
          if (!label) {
            return '';
          }
          charWidth = bbW / label.length;
          textLabelWidth = getLabelSize(d, selection) - 4 * charWidth;
          numChars = Math.floor(textLabelWidth / charWidth);
          if (numChars - 3 <= 0) {
            return '...';
          } else if (bbW > textLabelWidth) {
            return label.slice(0, numChars - 3) + '...';
          } else {
            return label;
          }
        });
      };
    }).property('getLabelSize', 'getLabelText')
  })
});


})();

(function() {


Ember.Charts.Colorable = Ember.Mixin.create({
  selectedSeedColor: 'rgb(65, 65, 65)',
  tint: 0.8,
  minimumTint: 0,
  maximumTint: 0.66,
  colorScaleType: d3.scale.linear,
  renderVars: ['colorScale'],
  colorRange: Ember.computed(function() {
    var seedColor;
    seedColor = this.get('selectedSeedColor');
    return this.get('getColorRange')(seedColor);
  }).property('selectedSeedColor', 'getColorRange'),
  getColorRange: Ember.computed(function() {
    var _this = this;
    return function(seedColor) {
      var interpolate, maxTintRGB, minTintRGB;
      interpolate = d3.interpolateRgb(seedColor, 'rgb(255,255,255)');
      minTintRGB = interpolate(_this.get('minimumTint'));
      maxTintRGB = interpolate(_this.get('maximumTint'));
      return [d3.rgb(minTintRGB), d3.rgb(maxTintRGB)];
    };
  }).property('minimumTint', 'maximumTint'),
  colorScale: Ember.computed(function() {
    var seedColor;
    seedColor = this.get('selectedSeedColor');
    return this.get('getColorScale')(seedColor);
  }).property('selectedSeedColor', 'getColorScale'),
  getColorScale: Ember.computed(function() {
    var _this = this;
    return function(seedColor) {
      var colorRange;
      colorRange = _this.get('getColorRange')(seedColor);
      return _this.get('colorScaleType')().range(colorRange);
    };
  }).property('getColorRange', 'colorScaleType'),
  secondaryMinimumTint: 0.4,
  secondaryMaximumTint: 0.85,
  secondaryColorScaleType: d3.scale.linear,
  secondaryColorRange: Ember.computed(function() {
    var interpolate, maxTintRGB, minTintRGB, seedColor;
    seedColor = this.get('selectedSeedColor');
    interpolate = d3.interpolateRgb(seedColor, 'rgb(255,255,255)');
    minTintRGB = interpolate(this.get('secondaryMinimumTint'));
    maxTintRGB = interpolate(this.get('secondaryMaximumTint'));
    return [d3.rgb(minTintRGB), d3.rgb(maxTintRGB)];
  }).property('selectedSeedColor', 'secondaryMinimumTint', 'secondaryMaximumTint'),
  secondaryColorScale: Ember.computed(function() {
    return this.get('secondaryColorScaleType')().range(this.get('secondaryColorRange'));
  }).property('secondaryColorRange', 'secondaryColorScaleType'),
  leastTintedColor: Ember.computed(function() {
    return this.get('colorRange')[0];
  }).property('colorRange.@each'),
  mostTintedColor: Ember.computed(function() {
    return this.get('colorRange')[1];
  }).property('colorRange.@each'),
  numColorSeries: 1,
  getSeriesColor: Ember.computed(function() {
    var numColorSeries, selectedSeedColor,
      _this = this;
    numColorSeries = this.get('numColorSeries');
    selectedSeedColor = this.get('selectedSeedColor');
    return function(d, i) {
      var colorRange, colorScale, seedColor;
      seedColor = d.color || selectedSeedColor;
      colorRange = _this.get('getColorRange')(seedColor);
      colorScale = _this.get('getColorScale')(seedColor);
      if (numColorSeries === 1) {
        return colorRange[0];
      } else {
        return colorScale(i / (numColorSeries - 1));
      }
    };
  }).property('numColorSeries', 'getColorRange', 'getColorScale')
}, 'selectedSeedColor', {
  numSecondaryColorSeries: 1,
  getSecondarySeriesColor: Ember.computed(function() {
    var numSecondaryColorSeries,
      _this = this;
    numSecondaryColorSeries = this.get('numSecondaryColorSeries');
    return function(d, i) {
      if (numSecondaryColorSeries === 1) {
        return _this.get('secondaryColorRange')[0];
      } else {
        return _this.get('secondaryColorScale')(i / (numSecondaryColorSeries - 1));
      }
    };
  }).property('numSecondaryColorSeries', 'secondaryColorRange', 'secondaryColorScale')
});


})();

(function() {


Ember.Charts.AxesMixin = Ember.Mixin.create({
  graphicWidth: null,
  graphicHeight: null,
  minXTicks: 3,
  minYTicks: 3,
  tickSpacing: 50,
  minAxisValue: 0,
  maxAxisValue: 0,
  numXTicks: Ember.computed(function() {
    var calculatedTicks;
    calculatedTicks = Math.floor(this.get('graphicWidth') / this.get('tickSpacing'));
    return Math.max(calculatedTicks, this.get('minXTicks'));
  }).property('graphicWidth', 'tickSpacing', 'minXTicks'),
  numYTicks: Ember.computed(function() {
    var calculatedTicks;
    calculatedTicks = Math.floor(this.get('graphicHeight') / this.get('tickSpacing'));
    return Math.max(calculatedTicks, this.get('minYTicks'));
  }).property('graphicHeight', 'tickSpacing', 'minYTicks'),
  formatValueAxis: Ember.computed(function() {
    var formatter, magnitude, prefix;
    magnitude = Math.max(Math.abs(this.get('minAxisValue')), Math.abs(this.get('maxAxisValue')));
    prefix = d3.formatPrefix(magnitude);
    return formatter = function(value) {
      return "" + (prefix.scale(value)) + prefix.symbol;
    };
  }).property('minAxisValue', 'maxAxisValue')
});


})();

(function() {


Ember.Charts.FloatingTooltipMixin = Ember.Mixin.create({
  elementId: null,
  tooltipWidth: 40,
  tooltipValueDisplayName: 'Value',
  showTooltip: function(content, event) {
    var $ttid;
    $ttid = this._getTooltip();
    $ttid.html(content);
    $ttid.show();
    return this._updateTooltipPosition(event);
  },
  hideTooltip: function() {
    return this._getTooltip().hide();
  },
  _tooltipId: Ember.computed(function() {
    return this.get('elementId') + '_tooltip';
  }),
  _getTooltip: function() {
    return $("#" + (this.get('_tooltipId')));
  },
  _updateTooltipPosition: function(event) {
    var $tooltip, curX, curY, height, minTooltipLeft, minTooltipTop, tooltipLeft, tooltipLeftOffset, tooltipTop, tooltipTopOffset, width, windowScrollLeft, windowScrollTop, xOffset, yOffset;
    $tooltip = this._getTooltip();
    xOffset = 10;
    yOffset = 10;
    width = $tooltip.width();
    height = $tooltip.height();
    windowScrollTop = $(window).scrollTop();
    windowScrollLeft = $(window).scrollLeft();
    curX = event.clientX + windowScrollLeft;
    curY = event.clientY + windowScrollTop;
    tooltipLeftOffset = (curX - windowScrollLeft + xOffset * 2 + width) > $(window).width() ? -(width + xOffset * 2) : xOffset;
    tooltipLeft = curX + tooltipLeftOffset;
    tooltipTopOffset = (curY - windowScrollTop + yOffset * 2 + height) > $(window).height() ? -(height + yOffset * 2) : yOffset;
    tooltipTop = curY + tooltipTopOffset;
    minTooltipLeft = windowScrollLeft + xOffset;
    minTooltipTop = windowScrollTop + yOffset;
    if (tooltipLeft < minTooltipLeft) {
      tooltipLeft = minTooltipLeft;
    }
    if (tooltipTop < windowScrollTop + yOffset) {
      tooltipTop = minTooltipTop;
    }
    return $tooltip.css('top', tooltipTop + 'px').css('left', tooltipLeft + 'px');
  },
  didInsertElement: function() {
    this._super();
    $("body").append("<div class='chart-float-tooltip' id='" + (this.get('_tooltipId')) + "'></div>");
    return this.hideTooltip();
  },
  willDestroyElement: function() {
    this._super();
    return this._getTooltip().remove();
  }
});


})();

(function() {


Ember.Charts.HasTimeSeriesRule = Ember.Mixin.create({
  xRange: null,
  yRange: null,
  xTimeScale: null,
  showDetails: null,
  hideDetails: null,
  lineColorFn: null,
  graphicHeight: null,
  updateLineMarkers: function() {
    var hideDetails, lineMarkers, showDetails;
    lineMarkers = this._getLineMarkers();
    showDetails = this.get('showDetails');
    hideDetails = this.get('hideDetails');
    lineMarkers.enter().append('path').on("mouseover", function(d, i) {
      return showDetails(d, i, this);
    }).on("mouseout", function(d, i) {
      return hideDetails(d, i, this);
    }).attr({
      "class": 'line-marker',
      fill: this.get('lineColorFn'),
      d: d3.svg.symbol().size(50).type('circle')
    });
    lineMarkers.exit().remove();
    lineMarkers.attr({
      transform: function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      }
    });
    return lineMarkers.style({
      'stroke-width': function(d) {
        return d3.select(d.path).attr('stroke-width');
      }
    });
  },
  _getLineMarkers: function() {
    return this.get('viewport').selectAll('.line-marker').data(this._lineMarkerData());
  },
  didInsertElement: function() {
    var _this = this;
    this._super();
    return d3.select(this.$('svg')[0]).on('mousemove', function() {
      if (!_this.get('isInteractive')) {
        return;
      }
      if (_this._isEventWithinValidRange()) {
        return Ember.run(_this, _this.get('updateLineMarkers'));
      }
    });
  },
  _lineMarkerTolerance: 60 * 1000,
  _mousePosition: function() {
    if (!d3.event) {
      return null;
    }
    return d3.mouse(this.get('$viewport'));
  },
  _isEventWithinValidRange: function() {
    var inX, inY, x, xRange, y, yRange, _ref;
    xRange = this.get('xRange');
    yRange = this.get('yRange');
    _ref = this._mousePosition(), x = _ref[0], y = _ref[1];
    inX = (d3.min(xRange) < x && x < d3.max(xRange));
    inY = (d3.min(yRange) < y && y < d3.max(yRange));
    return inX && inY;
  },
  _lineMarkerData: function() {
    var invXScale, invYScale, lineMarkerTolerance, markerData, mousePosition, timeX;
    mousePosition = this._mousePosition();
    if (Ember.isEmpty(mousePosition)) {
      return [];
    }
    invXScale = this.get('xTimeScale').invert;
    invYScale = this.get('yScale').invert;
    lineMarkerTolerance = this.get('_lineMarkerTolerance');
    timeX = invXScale(mousePosition[0]);
    markerData = [];
    this.get('viewport').selectAll('path.line').each(function(d, i) {
      var iterations, maxIterations, point, searchEnd, searchLen, searchStart;
      iterations = 0;
      maxIterations = 25;
      searchStart = 0;
      searchEnd = this.getTotalLength();
      searchLen = searchEnd / 2;
      point = this.getPointAtLength(searchLen);
      while (Math.abs(timeX - invXScale(point.x)) > lineMarkerTolerance && maxIterations > ++iterations) {
        if (timeX < invXScale(point.x)) {
          searchEnd = searchLen;
        } else {
          searchStart = searchLen;
        }
        searchLen = (searchStart + searchEnd) / 2;
        point = this.getPointAtLength(searchLen);
      }
      return markerData.push({
        x: point.x,
        y: point.y,
        group: d.group,
        value: invYScale(point.y),
        time: invXScale(point.x),
        path: this
      });
    });
    return markerData;
  }
});


})();

(function() {


Ember.Charts.TimeSeriesLabeler = Ember.Mixin.create({
  centerAxisLabels: false,
  selectedInterval: 'M',
  maxNumberOfLabels: 10,
  numberOfMinorTicks: Ember.computed(function() {
    var allTicks, findTick, firstIndex, labelledTicks, secondIndex, start, stop, _ref;
    labelledTicks = this.get('labelledTicks');
    _ref = this.get('xDomain'), start = _ref[0], stop = _ref[1];
    allTicks = (function() {
      switch (this.get('selectedInterval')) {
        case 'years':
        case 'Y':
          return d3.time.years(start, stop);
        case 'quarters':
        case 'Q':
          return d3.time.months(start, stop, 3);
        case 'months':
        case 'M':
          return this.monthsBetween(start, stop);
        case 'weeks':
        case 'W':
          return this.weeksBetween(start, stop);
        case 'seconds':
        case 'S':
          return this.secondsBetween(start, stop);
      }
    }).call(this);
    if (labelledTicks.length < 2) {
      return 0;
    }
    findTick = function(tick) {
      return function(x) {
        return +x === +tick;
      };
    };
    secondIndex = _.findIndex(allTicks, findTick(labelledTicks[1]));
    firstIndex = _.findIndex(allTicks, findTick(labelledTicks[0]));
    return secondIndex - firstIndex - 1;
  }).property('xDomain', 'selectedInterval'),
  labelledTicks: Ember.computed(function() {
    var count, domain, interval, tick, ticks, _i, _len, _results;
    domain = this.get('xDomain');
    ticks = this.get('tickLabelerFn')(domain[0], domain[1]);
    if (!this.get('centerAxisLabels')) {
      return ticks;
    } else {
      count = 1;
      interval = (function() {
        switch (this.get('selectedInterval')) {
          case 'years':
          case 'Y':
            return 'year';
          case 'quarters':
          case 'Q':
            return 'quarter';
          case 'months':
          case 'M':
            return 'month';
          case 'weeks':
          case 'W':
            return 'week';
          case 'seconds':
          case 'S':
            return 'second';
        }
      }).call(this);
      if (interval === 'quarter') {
        count = 3;
        interval = 'month';
      }
      _results = [];
      for (_i = 0, _len = ticks.length; _i < _len; _i++) {
        tick = ticks[_i];
        _results.push(this._advanceMiddle(tick, interval, count));
      }
      return _results;
    }
  }).property('xDomain'),
  _advanceMiddle: function(time, interval, count) {
    return new Date((time = time.getTime() / 2 + d3.time[interval].offset(time, count) / 2));
  },
  labelledYears: function(start, stop) {
    var skipVal, years;
    years = d3.time.years(start, stop);
    if (years.length > this.get('maxNumberOfLabels')) {
      skipVal = Math.ceil(years.length / this.get('maxNumberOfLabels'));
      return d3.time.years(start, stop, skipVal);
    } else {
      return years;
    }
  },
  labelledQuarters: function(start, stop) {
    var quarters;
    quarters = d3.time.months(start, stop, 3);
    if (quarters.length > this.get('maxNumberOfLabels')) {
      return this.labelledYears(start, stop);
    } else {
      return quarters;
    }
  },
  monthsBetween: function(start, stop, skip) {
    if (skip == null) {
      skip = 1;
    }
    return d3.time.months(start, stop).filter(function(d, i) {
      return !(i % skip);
    });
  },
  labelledMonths: function(start, stop) {
    var months, skipVal;
    months = this.monthsBetween(start, stop);
    if (months.length > this.get('maxNumberOfLabels')) {
      skipVal = Math.ceil(months.length / this.get('maxNumberOfLabels'));
      return this.monthsBetween(start, stop, skipVal);
    } else {
      return months;
    }
  },
  weeksBetween: function(start, stop, skip) {
    if (skip == null) {
      skip = 1;
    }
    return d3.time.weeks(start, stop).filter(function(d, i) {
      return !(i % skip);
    });
  },
  secondsBetween: function(start, stop, skip) {
    if (skip == null) {
      skip = 1;
    }
    return d3.time.seconds(start, stop).filter(function(d, i) {
      return !(i % skip);
    });
  },
  labelledWeeks: function(start, stop) {
    var skipVal, weeks;
    weeks = this.weeksBetween(start, stop);
    if (weeks.length > this.get('maxNumberOfLabels')) {
      skipVal = Math.ceil(weeks.length / this.get('maxNumberOfLabels'));
      return this.weeksBetween(start, stop, skipVal);
    } else {
      return weeks;
    }
  },
  tickLabelerFn: Ember.computed(function() {
    var _this = this;
    switch (this.get('selectedInterval')) {
      case 'years':
      case 'Y':
        return function(start, stop) {
          return _this.labelledYears(start, stop);
        };
      case 'quarters':
      case 'Q':
        return function(start, stop) {
          return _this.labelledQuarters(start, stop);
        };
      case 'months':
      case 'M':
        return function(start, stop) {
          return _this.labelledMonths(start, stop);
        };
      case 'weeks':
      case 'W':
        return function(start, stop) {
          return _this.labelledWeeks(start, stop);
        };
      case 'days':
      case 'D':
        return d3.time.days;
      case 'seconds':
      case 'S':
        return function(start, stop) {
          return _this.labelledSeconds(start, stop);
        };
      default:
        return d3.time.years;
    }
  }).property('maxNumberOfLabels', 'selectedInterval'),
  quarterFormat: function(d) {
    var month, prefix, suffix;
    month = d.getMonth() % 12;
    prefix = "";
    if (month < 3) {
      prefix = 'Q1';
    } else if (month < 6) {
      prefix = 'Q2';
    } else if (month < 9) {
      prefix = 'Q3';
    } else {
      prefix = 'Q4';
    }
    suffix = d3.time.format('%Y')(d);
    return prefix + ' ' + suffix;
  },
  formattedTime: Ember.computed(function() {
    switch (this.get('selectedInterval')) {
      case 'years':
      case 'Y':
        return d3.time.format('%Y');
      case 'quarters':
      case 'Q':
        return this.quarterFormat;
      case 'months':
      case 'M':
        return d3.time.format("%b '%y");
      case 'weeks':
      case 'W':
        return d3.time.format('%-m/%-d/%y');
      case 'days':
      case 'D':
        return d3.time.format('%a');
      case 'seconds':
      case 'S':
        return d3.time.format('%M : %S');
      default:
        return d3.time.format('%Y');
    }
  }).property('selectedInterval')
});


})();

(function() {


Ember.Charts.Legend = Ember.Mixin.create({
  legendTopPadding: 10,
  legendItemHeight: 18,
  minLegendItemWidth: 120,
  maxLegendItemWidth: 160,
  legendIconRadius: 9,
  legendLabelPadding: 10,
  legendWidth: Ember.computed.alias('width'),
  legendHeight: Ember.computed(function() {
    return this.get('numLegendRows') * this.get('legendItemHeight');
  }).property('numLegendRows', 'legendItemHeight'),
  legendItemWidth: Ember.computed(function() {
    var itemWidth;
    itemWidth = this.get('legendWidth') / this.get('legendItems.length');
    if (itemWidth < this.get('minLegendItemWidth')) {
      return this.get('minLegendItemWidth');
    }
    if (itemWidth > this.get('maxLegendItemWidth')) {
      return this.get('maxLegendItemWidth');
    }
    return itemWidth;
  }).property('legendWidth', 'minLegendItemWidth', 'maxLegendItemWidth', 'legendItems.length'),
  numLegendItemsPerRow: Ember.computed(function() {
    return Math.floor(this.get('legendWidth') / this.get('legendItemWidth'));
  }).property('legendWidth', 'legendItemWidth'),
  numLegendRows: Ember.computed(function() {
    return Math.ceil(this.get('legendItems.length') / this.get('numLegendItemsPerRow'));
  }).property('legendItems.length', 'numLegendItemsPerRow'),
  legendLabelWidth: Ember.computed(function() {
    return this.get('legendItemWidth') - this.get('legendIconRadius') - this.get('legendLabelPadding') * 2;
  }).property('legendItemWidth', 'legendIconRadius', 'legendLabelPadding'),
  legendChartPadding: 0,
  legendAttrs: Ember.computed(function() {
    var dx, dy, offsetToLegend;
    dx = this.get('outerWidth') / 2;
    offsetToLegend = this.get('legendChartPadding') + this.get('legendTopPadding');
    dy = this.get('graphicBottom') + offsetToLegend;
    return {
      transform: "translate(" + dx + ", " + dy + ")"
    };
  }).property('outerWidth', 'graphicBottom', 'legendTopPadding', 'legendChartPadding'),
  legendItemAttrs: Ember.computed(function() {
    var isSingleRow, legendItemHeight, legendItemWidth, numAllItems, numItemsPerRow,
      _this = this;
    legendItemWidth = this.get('legendItemWidth');
    legendItemHeight = this.get('legendItemHeight');
    numItemsPerRow = this.get('numLegendItemsPerRow');
    numAllItems = this.get('legendItems.length');
    isSingleRow = this.get('numLegendRows') === 1;
    return {
      "class": 'legend-item',
      width: legendItemWidth,
      'stroke-width': 0,
      transform: function(d, i) {
        var col, dx, dy, items, row;
        col = i % numItemsPerRow;
        row = Math.floor(i / numItemsPerRow);
        items = isSingleRow ? numAllItems : numItemsPerRow;
        dx = col * legendItemWidth - items / 2 * legendItemWidth + 1 / 2;
        dy = row * legendItemHeight + legendItemHeight / 2;
        return "translate(" + dx + ", " + dy + ")";
      }
    };
  }).property('legendItemWidth', 'legendItemHeight', 'numLegendItemsPerRow', 'legendItems.length', 'numLegendRows'),
  legendIconAttrs: Ember.computed(function() {
    var iconRadius, legendItemHeight;
    iconRadius = this.get('legendIconRadius');
    legendItemHeight = this.get('legendItemHeight');
    return {
      d: function(d, i) {
        if (d.icon(d) === 'line') {
          return "M " + (-iconRadius) + " 0 L " + iconRadius + " 0";
        } else {
          return d3.svg.symbol().type(d.icon(d, i)).size(Math.pow(iconRadius, 2))(d, i);
        }
      },
      fill: function(d, i) {
        if (_.isFunction(d.fill)) {
          return d.fill(d, i);
        } else {
          return d.fill;
        }
      },
      stroke: function(d, i) {
        if (_.isFunction(d.stroke)) {
          return d.stroke(d, i);
        } else {
          return d.stroke;
        }
      },
      'stroke-width': function(d) {
        if (!d.width) {
          return 1.5;
        }
        if (_.isFunction(d.width)) {
          return d.width(d, i);
        } else {
          return d.width;
        }
      },
      'stroke-dasharray': function(d) {
        if (d.dotted) {
          return '2,2';
        }
      }
    };
  }).property('legendIconRadius', 'legendItemHeight'),
  legendLabelAttrs: Ember.computed(function() {
    return {
      x: this.get('legendIconRadius') / 2 + this.get('legendLabelPadding'),
      y: '.35em'
    };
  }).property('legendIconRadius', 'legendLabelPadding', 'legendItemHeight'),
  showLegendDetails: Ember.computed(function() {
    var _this = this;
    if (!this.get('isInteractive')) {
      return Ember.K;
    }
    return function(data, i, element) {
      var content, formatXValue, formatYValue;
      d3.select(element).classed('hovered', true);
      if (data.selector) {
        _this.get('viewport').selectAll(data.selector).classed('hovered', true);
      }
      content = "<span class=\"tip-label\">" + data.label + "</span>";
      if (data.xValue != null) {
        formatXValue = _this.get('formatXValue');
        formatYValue = _this.get('formatYValue');
        content += "<span class=\"name\">" + (_this.get('tooltipXValueDisplayName')) + ": </span>";
        content += "<span class=\"value\">" + (formatXValue(data.xValue)) + "</span><br/>";
        content += "<span class=\"name\">" + (_this.get('tooltipYValueDisplayName')) + ": </span>";
        content += "<span class=\"value\">" + (formatYValue(data.yValue)) + "</span>";
      }
      return _this.showTooltip(content, d3.event);
    };
  }).property('isInteractive'),
  hideLegendDetails: Ember.computed(function() {
    var _this = this;
    if (!this.get('isInteractive')) {
      return Ember.K;
    }
    return function(data, i, element) {
      d3.select(element).classed('hovered', false);
      if (data.selector) {
        _this.get('viewport').selectAll(data.selector).classed('hovered', false);
      }
      return _this.hideTooltip();
    };
  }).property('isInteractive'),
  clearLegend: function() {
    return this.get('viewport').select('.legend-container').remove();
  },
  legend: Ember.computed(function() {
    var legend;
    legend = this.get('viewport').select('.legend-container');
    if (legend.empty()) {
      return this.get('viewport').append('g').attr('class', 'legend-container');
    } else {
      return legend;
    }
  }).volatile(),
  drawLegend: function() {
    var hideLegendDetails, isShowingTotal, labelTrimmer, labels, legend, legendIconAttrs, legendItems, legendLabelWidth, showLegendDetails, totalPointShape;
    this.clearLegend();
    legend = this.get('legend');
    legend.attr(this.get('legendAttrs'));
    showLegendDetails = this.get('showLegendDetails');
    hideLegendDetails = this.get('hideLegendDetails');
    legendItems = legend.selectAll('.legend-item').data(this.get('legendItems')).enter().append('g').attr(this.get('legendItemAttrs')).on("mouseover", function(d, i) {
      return showLegendDetails(d, i, this);
    }).on("mouseout", function(d, i) {
      return hideLegendDetails(d, i, this);
    });
    legendIconAttrs = this.get('legendIconAttrs');
    isShowingTotal = this.get('isShowingTotal');
    totalPointShape = this.get('totalPointShape');
    legendItems.each(function(d, i) {
      var sel;
      sel = d3.select(this);
      if ((i === 0) && isShowingTotal) {
        return sel.append('g').attr('class', 'icon').call(totalPointShape);
      } else {
        return d3.select(this).append('path').attr('class', 'icon').attr(legendIconAttrs);
      }
    });
    legendLabelWidth = this.get('legendLabelWidth');
    labelTrimmer = Ember.Charts.Helpers.LabelTrimmer.create({
      getLabelSize: function(d) {
        return legendLabelWidth;
      },
      getLabelText: function(d) {
        return d.label;
      }
    });
    return labels = legendItems.append('text').style('text-anchor', 'start').text(function(d) {
      return d.label;
    }).attr(this.get('legendLabelAttrs')).call(labelTrimmer.get('trim'));
  }
});


})();

(function() {


Ember.Charts.PieLegend = Ember.Mixin.create({
  legendVerticalPadding: 30,
  legendHorizontalPadding: Ember.computed(function() {
    return 0.2 * this.get('outerWidth');
  }).property('outerWidth'),
  maxLabelHeight: Ember.computed(function() {
    return 0.05 * this.get('outerHeight');
  }).property('outerWidth', 'outerHeight'),
  legendWidth: Ember.computed(function() {
    return this.get('outerWidth') - this.get('legendHorizontalPadding');
  }).property('outerWidth', 'legendHorizontalPadding'),
  legendHeight: Ember.computed(function() {
    return this.get('maxLabelHeight') + this.get('legendVerticalPadding') * 2;
  }).property('maxLabelHeight', 'legendVerticalPadding'),
  legendAttrs: Ember.computed(function() {
    var dx, dy, offsetToLegend;
    dx = 0;
    offsetToLegend = 0.15 * (this.get('marginBottom')) - (this.get('marginTop')) / 2;
    dy = this.get('outerHeight') / 2 + offsetToLegend;
    return {
      transform: "translate(" + dx + ", " + dy + ")"
    };
  }).property('outerHeight', 'marginTop', 'marginBottom'),
  legendLabelAttrs: Ember.computed(function() {
    return {
      style: "text-anchor:middle;",
      y: '-.35em'
    };
  }),
  legend: Ember.computed(function() {
    var legend;
    legend = this.get('viewport').select('.legend');
    if (legend.empty()) {
      return this.get('viewport').append('g').attr('class', 'legend');
    } else {
      return legend;
    }
  }).volatile(),
  clearLegend: function() {
    return this.get('viewport').select('.legend .labels').remove();
  },
  drawLegend: function() {
    var currentText, labelStrings, labelTop, labels, legend, nextLabel, otherSlice, row, rowNode, _i, _len, _ref;
    this.clearLegend();
    legend = this.get('legend').attr(this.get('legendAttrs'));
    otherSlice = this.get('viewport').select('.other-slice');
    if (this.get('isInteractive') && !otherSlice.empty()) {
      legend.on('mouseover', function() {
        otherSlice.classed('hovered', true);
        return legend.classed('hovered', true);
      }).on('mouseout', function() {
        otherSlice.classed('hovered', false);
        return legend.classed('hovered', false);
      });
    }
    labels = legend.append('g').attr('class', 'labels');
    labelStrings = this.get('legendItems').map(function(d) {
      if (d.percent != null) {
        return "" + d.label + " (" + d.percent + "%)";
      } else {
        return d.label;
      }
    });
    row = labels.append('text').text("Other: " + labelStrings[0]).attr(this.get('legendLabelAttrs'));
    labelTop = 0;
    _ref = labelStrings.slice(1);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      nextLabel = _ref[_i];
      currentText = row.text();
      row.text("" + currentText + ", " + nextLabel);
      rowNode = row.node();
      if (rowNode.getBBox().width > this.get('legendWidth')) {
        if (labelTop + rowNode.getBBox().height > this.get('maxLabelHeight')) {
          row.text("" + currentText + ", ...");
          break;
        } else {
          row.text("" + currentText + ",");
          labelTop += rowNode.getBBox().height;
          row = labels.append('text').text(nextLabel).attr(this.get('legendLabelAttrs')).attr('dy', labelTop);
        }
      }
    }
    return labels.attr('transform', "translate(0, " + (-labelTop) + ")");
  }
});


})();

(function() {


Ember.Charts.ChartComponent = Ember.Component.extend(Ember.Charts.Colorable, Ember.AddeparMixins.ResizeHandlerMixin, {
  layoutName: 'chart',
  classNames: ['chart-frame', 'scroll-y'],
  isInteractive: true,
  horizontalMargin: 30,
  verticalMargin: 30,
  marginRight: Ember.computed.alias('horizontalMargin'),
  marginLeft: Ember.computed.alias('horizontalMargin'),
  marginTop: Ember.computed.alias('verticalMargin'),
  marginBottom: Ember.computed.alias('verticalMargin'),
  defaultOuterHeight: 500,
  defaultOuterWidth: 700,
  outerHeight: Ember.computed.alias('defaultOuterHeight'),
  outerWidth: Ember.computed.alias('defaultOuterWidth'),
  width: Ember.computed(function() {
    return this.get('outerWidth') - this.get('marginLeft') - this.get('marginRight');
  }).property('outerWidth', 'marginLeft', 'marginRight'),
  height: Ember.computed(function() {
    return Math.max(1, this.get('outerHeight') - this.get('marginBottom') - this.get('marginTop'));
  }).property('outerHeight', 'marginBottom', 'marginTop'),
  $viewport: Ember.computed(function() {
    return this.$('.chart-viewport')[0];
  }),
  viewport: Ember.computed(function() {
    return d3.select(this.get('$viewport'));
  }),
  transformViewport: Ember.computed(function() {
    return "translate(" + (this.get('marginLeft')) + "," + (this.get('marginTop')) + ")";
  }).property('marginLeft', 'marginTop'),
  labelPadding: 10,
  labelWidth: 30,
  labelHeight: 15,
  labelWidthOffset: Ember.computed(function() {
    return this.get('labelWidth') + this.get('labelPadding');
  }).property('labelWidth', 'labelPadding'),
  labelHeightOffset: Ember.computed(function() {
    return this.get('labelHeight') + this.get('labelPadding');
  }).property('labelHeight', 'labelPadding'),
  graphicTop: 0,
  graphicLeft: 0,
  graphicWidth: Ember.computed.alias('width'),
  graphicHeight: Ember.computed.alias('height'),
  graphicBottom: Ember.computed(function() {
    return this.get('graphicTop') + this.get('graphicHeight');
  }).property('graphicTop', 'graphicHeight'),
  graphicRight: Ember.computed(function() {
    return this.get('graphicLeft') + this.get('graphicWidth');
  }).property('graphicLeft', 'graphicWidth'),
  hasNoData: Ember.computed(function() {
    return Ember.isEmpty(this.get('finishedData'));
  }).property('finishedData'),
  concatenatedProperties: ['renderVars'],
  renderVars: ['finishedData', 'width', 'height', 'margin', 'isInteractive'],
  init: function() {
    var renderVar, _i, _len, _ref, _results,
      _this = this;
    this._super();
    _ref = this.get('renderVars').uniq();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      renderVar = _ref[_i];
      _results.push(this.addObserver(renderVar, function() {
        return Ember.run.once(_this, _this.get('draw'));
      }));
    }
    return _results;
  },
  didInsertElement: function() {
    this._super();
    this._updateDimensions();
    return Ember.run.once(this, this.get('draw'));
  },
  onResizeEnd: function() {
    return this._updateDimensions();
  },
  _updateDimensions: function() {
    this.set('defaultOuterHeight', this.$().height());
    return this.set('defaultOuterWidth', this.$().width());
  },
  clearChart: function() {
    return this.$('.chart-viewport').children().remove();
  },
  draw: function() {
    if ((this._state || this.state) !== "inDOM") {
      return;
    }
    if (this.get('hasNoData')) {
      return this.clearChart();
    } else {
      return this.drawChart();
    }
  }
});


})();

(function() {


Ember.Charts.HorizontalBarComponent = Ember.Charts.ChartComponent.extend(Ember.Charts.FloatingTooltipMixin, {
  classNames: ['chart-horizontal-bar'],
  formatLabel: d3.format(',.2f'),
  selectedSortType: 'value',
  defaultOuterHeight: 500,
  labelWidth: Ember.computed(function() {
    return 0.25 * this.get('outerWidth');
  }).property('outerWidth'),
  labelPadding: 20,
  barPadding: 0.2,
  maxBarThickness: 60,
  minBarThickness: 20,
  sortedData: Ember.computed(function() {
    var comparator, data, sortFunc, sortType;
    data = this.get('data');
    if (Ember.isEmpty(data)) {
      return [];
    }
    sortType = this.get('selectedSortType');
    sortFunc = (function() {
      var _this = this;
      switch (sortType) {
        case 'value':
          return function(d) {
            return -d.value;
          };
        case 'label':
          return function(d) {
            return d.label;
          };
      }
    }).call(this);
    comparator = function(a, b) {
      if (sortFunc(a) < sortFunc(b)) {
        return -1;
      } else if (sortFunc(a) > sortFunc(b)) {
        return 1;
      } else {
        return 0;
      }
    };
    return data.sort(comparator);
  }).property('data.@each', 'selectedSortType'),
  finishedData: Ember.computed.alias('sortedData'),
  minOuterHeight: Ember.computed(function() {
    var minBarSpace;
    minBarSpace = this.get('numBars') * this.get('minBarThickness');
    return minBarSpace + this.get('marginTop') + this.get('marginBottom');
  }).property('numBars', 'minBarThickness', 'marginTop', 'marginBottom'),
  maxOuterHeight: Ember.computed(function() {
    var maxBarSpace;
    maxBarSpace = this.get('numBars') * this.get('maxBarThickness');
    return maxBarSpace + this.get('marginTop') + this.get('marginBottom');
  }).property('numBars', 'maxBarThickness', 'marginTop', 'marginBottom'),
  outerHeight: Ember.computed(function() {
    var maxMinDefault;
    maxMinDefault = d3.max([this.get('defaultOuterHeight'), this.get('minOuterHeight')]);
    return d3.min([maxMinDefault, this.get('maxOuterHeight')]);
  }).property('minOuterHeight', 'maxOuterHeight', 'defaultOuterHeight'),
  marginTop: Ember.computed.alias('labelPadding'),
  marginBottom: Ember.computed.alias('labelPadding'),
  horizontalMargin: Ember.computed(function() {
    return this.get('labelWidth') + this.get('labelPadding') * 2;
  }).property('labelWidth', 'labelPadding'),
  numBars: Ember.computed.alias('finishedData.length'),
  xDomain: Ember.computed(function() {
    var absMax, maxValue, minValue, values,
      _this = this;
    values = this.get('finishedData').map(function(d) {
      return d.value;
    });
    minValue = d3.min(values);
    maxValue = d3.max(values);
    if (minValue < 0) {
      absMax = Math.max(-minValue, maxValue);
      return [-absMax, absMax];
    } else {
      return [0, maxValue];
    }
  }).property('finishedData', 'xDomainPadding'),
  xScale: Ember.computed(function() {
    return d3.scale.linear().domain(this.get('xDomain')).range([0, this.get('width')]).nice();
  }).property('width', 'xDomain'),
  yScale: Ember.computed(function() {
    return d3.scale.ordinal().domain(d3.range(this.get('numBars'))).rangeRoundBands([0, this.get('height')], this.get('barPadding'));
  }).property('height', 'barPadding'),
  barThickness: Ember.computed(function() {
    return this.get('yScale').rangeBand();
  }).property('yScale'),
  showDetails: Ember.computed(function() {
    var _this = this;
    if (!this.get('isInteractive')) {
      return Ember.K;
    }
    return function(data, i, element) {
      var content, formatLabel;
      d3.select(element).classed('hovered', true);
      formatLabel = _this.get('formatLabel');
      content = "<span class=\"tip-label\">" + data.label + "</span>";
      content += "<span class=\"name\">" + (_this.get('tooltipValueDisplayName')) + ": </span>";
      content += "<span class=\"value\">" + (formatLabel(data.value)) + "</span>";
      return _this.showTooltip(content, d3.event);
    };
  }).property('isInteractive'),
  hideDetails: Ember.computed(function() {
    var _this = this;
    if (!this.get('isInteractive')) {
      return Ember.K;
    }
    return function(data, i, element) {
      d3.select(element).classed('hovered', false);
      return _this.hideTooltip();
    };
  }).property('isInteractive'),
  groupAttrs: Ember.computed(function() {
    var xScale, yScale,
      _this = this;
    xScale = this.get('xScale');
    yScale = this.get('yScale');
    return {
      transform: function(d, i) {
        var value;
        value = Math.min(0, d.value);
        return "translate(" + (xScale(value)) + ", " + (yScale(i)) + ")";
      }
    };
  }).property('xScale', 'yScale'),
  barAttrs: Ember.computed(function() {
    var xScale,
      _this = this;
    xScale = this.get('xScale');
    return {
      width: function(d) {
        return Math.abs(xScale(d.value) - xScale(0));
      },
      height: this.get('barThickness'),
      'stroke-width': 0,
      style: function(d) {
        var color;
        if (d.color) {
          return "fill:" + d.color;
        }
        if (d.value < 0) {
          color = _this.get('mostTintedColor');
        } else {
          color = _this.get('leastTintedColor');
        }
        return "fill:" + color;
      }
    };
  }).property('xScale', 'mostTintedColor', 'leastTintedColor', 'barThickness'),
  valueLabelAttrs: Ember.computed(function() {
    var xScale,
      _this = this;
    xScale = this.get('xScale');
    return {
      x: function(d) {
        if (d.value < 0) {
          return -_this.get('labelPadding');
        } else {
          return xScale(d.value) - xScale(0) + _this.get('labelPadding');
        }
      },
      y: this.get('barThickness') / 2,
      dy: '.35em',
      'text-anchor': function(d) {
        if (d.value < 0) {
          return 'end';
        } else {
          return 'start';
        }
      },
      'stroke-width': 0
    };
  }).property('xScale', 'barThickness', 'labelPadding'),
  groupLabelAttrs: Ember.computed(function() {
    var xScale,
      _this = this;
    xScale = this.get('xScale');
    return {
      x: function(d) {
        if (d.value < 0) {
          return xScale(0) - xScale(d.value) + _this.get('labelPadding');
        } else {
          return -_this.get('labelPadding');
        }
      },
      y: this.get('barThickness') / 2,
      dy: '.35em',
      'text-anchor': function(d) {
        if (d.value < 0) {
          return 'start';
        } else {
          return 'end';
        }
      },
      'stroke-width': 0
    };
  }).property('xScale', 'barThickness', 'labelPadding'),
  axisAttrs: Ember.computed(function() {
    var xScale;
    xScale = this.get('xScale');
    return {
      x1: xScale(0),
      x2: xScale(0),
      y1: 0,
      y2: this.get('height')
    };
  }).property('xScale', 'height'),
  groups: Ember.computed(function() {
    return this.get('viewport').selectAll('.bar').data(this.get('finishedData'));
  }).volatile(),
  yAxis: Ember.computed(function() {
    var yAxis;
    yAxis = this.get('viewport').select('.y.axis line');
    if (yAxis.empty()) {
      return this.get('viewport').insert('g', ':first-child').attr('class', 'y axis').append('line');
    } else {
      return yAxis;
    }
  }).volatile(),
  renderVars: ['barThickness', 'yScale', 'finishedData', 'colorRange'],
  drawChart: function() {
    this.updateData();
    this.updateAxes();
    return this.updateGraphic();
  },
  updateData: function() {
    var entering, exiting, groups, hideDetails, showDetails;
    groups = this.get('groups');
    showDetails = this.get('showDetails');
    hideDetails = this.get('hideDetails');
    entering = groups.enter().append('g').attr('class', 'bar').on("mouseover", function(d, i) {
      return showDetails(d, i, this);
    }).on("mouseout", function(d, i) {
      return hideDetails(d, i, this);
    });
    entering.append('rect');
    entering.append('text').attr('class', 'value');
    entering.append('text').attr('class', 'group');
    return exiting = groups.exit().remove();
  },
  updateAxes: function() {
    return this.get('yAxis').attr(this.get('axisAttrs'));
  },
  updateGraphic: function() {
    var groupLabels, groups, labelTrimmer, labelWidth, valueLabels,
      _this = this;
    groups = this.get('groups').attr(this.get('groupAttrs'));
    groups.select('rect').attr(this.get('barAttrs'));
    valueLabels = groups.select('text.value').text(function(d) {
      return _this.get('formatLabel')(d.value);
    }).attr(this.get('valueLabelAttrs'));
    labelWidth = this.get('labelWidth');
    labelTrimmer = Ember.Charts.Helpers.LabelTrimmer.create({
      getLabelSize: function(d) {
        return labelWidth;
      },
      getLabelText: function(d) {
        return d.label;
      }
    });
    return groupLabels = groups.select('text.group').text(function(d) {
      return d.label;
    }).attr(this.get('groupLabelAttrs')).call(labelTrimmer.get('trim'));
  }
});

Ember.Handlebars.helper('horizontal-bar-chart', Ember.Charts.HorizontalBarComponent);


})();

(function() {


Ember.Charts.PieComponent = Ember.Charts.ChartComponent.extend(Ember.Charts.PieLegend, Ember.Charts.FloatingTooltipMixin, {
  classNames: ['chart-pie'],
  formatLabel: d3.format(',.2f'),
  minSlicePercent: 5,
  maxNumberOfSlices: 8,
  labelWidth: Ember.computed(function() {
    return 0.25 * this.get('outerWidth');
  }).property('outerWidth'),
  maxRadius: 2000,
  sortFunction: Ember.computed(function() {
    switch (this.get('selectedSortType')) {
      case 'value':
        return function(d) {
          return d.percent;
        };
      case 'label':
        return function(d) {
          return d.label;
        };
      default:
        return function(d) {
          return d.percent;
        };
    }
  }).property('selectedSortType'),
  filteredData: Ember.computed(function() {
    var data;
    data = this.get('data');
    if (Ember.isEmpty(data)) {
      return [];
    }
    return data.filter(function(child) {
      return child.value >= 0;
    });
  }).property('data.@each'),
  rejectedData: Ember.computed(function() {
    var data;
    data = this.get('data');
    if (Ember.isEmpty(data)) {
      return [];
    }
    return data.filter(function(child) {
      return child.value < 0;
    });
  }).property('data.@each'),
  sortedData: Ember.computed(function() {
    var data, total;
    data = this.get('filteredData');
    total = data.reduce(function(p, child) {
      return child.value + p;
    }, 0);
    if (total === 0) {
      return [];
    }
    data = data.map(function(d) {
      return {
        color: d.color,
        label: d.label,
        value: d.value,
        percent: d3.round(100 * d.value / total)
      };
    });
    return _.sortBy(data, this.get('sortFunction'));
  }).property('filteredData', 'sortFunc'),
  sortedDataWithOther: Ember.computed(function() {
    var data, lastItem, lowPercentIndex, maxNumberOfSlices, minNumberOfSlices, minSlicePercent, otherItems, otherSlice, overflowSlices, slicesLeft,
      _this = this;
    data = _.cloneDeep(this.get('sortedData')).reverse();
    maxNumberOfSlices = this.get('maxNumberOfSlices');
    minNumberOfSlices = this.get('minNumberOfSlices');
    minSlicePercent = this.get('minSlicePercent');
    otherItems = [];
    otherSlice = {
      label: 'Other',
      percent: 0,
      _otherItems: otherItems
    };
    lowPercentIndex = _.indexOf(data, _.find(data, function(d) {
      return d.percent < minSlicePercent;
    }));
    if (lowPercentIndex < 0) {
      lowPercentIndex = data.length;
    } else {
      _.rest(data, lowPercentIndex).forEach(function(d) {
        otherItems.push(d);
        return otherSlice.percent += d.percent;
      });
      if (otherSlice.percent < minSlicePercent) {
        lastItem = data[lowPercentIndex - 1];
        if (lastItem.percent < minSlicePercent) {
          lowPercentIndex -= 1;
          otherItems.push(lastItem);
          otherSlice.percent += lastItem.percent;
        }
      }
    }
    if (otherSlice.percent > 0) {
      maxNumberOfSlices -= 1;
    }
    slicesLeft = _.first(data, lowPercentIndex);
    overflowSlices = _.rest(slicesLeft, maxNumberOfSlices);
    if (overflowSlices.length > 0) {
      overflowSlices.forEach(function(d) {
        otherItems.push(d);
        return otherSlice.percent += d.percent;
      });
      slicesLeft = _.first(slicesLeft, maxNumberOfSlices);
    }
    if (otherItems.length === 1) {
      slicesLeft.push(otherItems[0]);
    } else if (otherSlice.percent > 0) {
      slicesLeft.push(otherSlice);
    }
    return slicesLeft.reverse();
  }).property('sortedData', 'maxNumberOfSlices', 'minSlicePercent'),
  otherData: Ember.computed(function() {
    var otherItems, otherSlice, _ref;
    otherSlice = _.find(this.get('sortedDataWithOther'), function(d) {
      return d._otherItems;
    });
    otherItems = (_ref = otherSlice != null ? otherSlice._otherItems : void 0) != null ? _ref : [];
    return _.sortBy(otherItems, this.get('sortFunction')).reverse();
  }).property('sortedDataWithOther', 'sortFunction'),
  finishedData: Ember.computed.alias('sortedDataWithOther'),
  horizontalMargin: Ember.computed(function() {
    return this.get('labelPadding') + this.get('labelWidth');
  }).property('labelPadding', 'labelWidth'),
  marginBottom: Ember.computed(function() {
    return this.get('legendHeight');
  }).property('legendHeight'),
  marginTop: Ember.computed(function() {
    var dataLength, finishedData;
    finishedData = this.get('finishedData');
    dataLength = finishedData.length;
    if (finishedData.length > 2 && finishedData[dataLength - 3].percent + finishedData[dataLength - 2].percent < 15) {
      return this.get('marginBottom');
    } else {
      return 0.3 * this.get('marginBottom');
    }
  }).property('marginBottom', 'finishedData'),
  numSlices: Ember.computed.alias('finishedData.length'),
  startOffset: Ember.computed(function() {
    var data, sum;
    data = this.get('finishedData');
    sum = data.reduce(function(p, d) {
      return d.percent + p;
    }, 0);
    return _.last(data).percent / sum * 2 * Math.PI;
  }).property('finishedData'),
  radius: Ember.computed(function() {
    return d3.min([this.get('maxRadius'), this.get('width') / 2, this.get('height') / 2]);
  }).property('maxRadius', 'width', 'height'),
  labelRadius: Ember.computed(function() {
    return this.get('radius') + this.get('labelPadding');
  }).property('radius', 'labelPadding'),
  getSliceColor: Ember.computed(function() {
    var _this = this;
    return function(d, i) {
      var index, numSlices, _ref;
      if ((_ref = d.data) != null ? _ref.color : void 0) {
        return d.data.color;
      }
      numSlices = _this.get('numSlices');
      index = numSlices - i - 1;
      if (numSlices !== 1) {
        index = index / (numSlices - 1);
      }
      return _this.get('colorScale')(index);
    };
  }).property('numSlices', 'colorScale'),
  legendItems: Ember.computed(function() {
    return this.get('otherData').concat(this.get('rejectedData'));
  }).property('otherData', 'rejectedData'),
  hasLegend: Ember.computed(function() {
    return this.get('legendItems.length') > 0;
  }).property('legendItems.length'),
  showDetails: Ember.computed(function() {
    var _this = this;
    if (!this.get('isInteractive')) {
      return Ember.K;
    }
    return function(d, i, element) {
      var content, data, formatLabel;
      d3.select(element).classed('hovered', true);
      data = d.data;
      if (data._otherItems) {
        return _this.get('viewport').select('.legend').classed('hovered', true);
      } else {
        formatLabel = _this.get('formatLabel');
        content = "<span class=\"tip-label\">" + data.label + "</span>";
        content += "<span class=\"name\">" + (_this.get('tooltipValueDisplayName')) + ": </span>";
        content += "<span class=\"value\">" + (formatLabel(data.value)) + "</span>";
        return _this.showTooltip(content, d3.event);
      }
    };
  }).property('isInteractive'),
  hideDetails: Ember.computed(function() {
    var _this = this;
    if (!this.get('isInteractive')) {
      return Ember.K;
    }
    return function(d, i, element) {
      var data;
      d3.select(element).classed('hovered', false);
      data = d.data;
      if (data._otherItems) {
        return _this.get('viewport').select('.legend').classed('hovered', false);
      } else {
        return _this.hideTooltip();
      }
    };
  }).property('isInteractive'),
  transformViewport: Ember.computed(function() {
    var cx, cy;
    cx = this.get('marginLeft') + this.get('width') / 2;
    cy = this.get('marginTop') + this.get('height') / 2;
    return "translate(" + cx + "," + cy + ")";
  }).property('marginLeft', 'marginTop', 'width', 'height'),
  arc: Ember.computed(function() {
    var arc;
    return arc = d3.svg.arc().outerRadius(this.get('radius')).innerRadius(0);
  }).property('radius'),
  pie: Ember.computed(function() {
    return d3.layout.pie().startAngle(this.get('startOffset')).endAngle(this.get('startOffset') + Math.PI * 2).sort(null).value(function(d) {
      return d.percent;
    });
  }).property('startOffset'),
  groupAttrs: Ember.computed(function() {
    return {
      "class": function(d) {
        if (d.data._otherItems) {
          return 'arc other-slice';
        } else {
          return 'arc';
        }
      }
    };
  }),
  sliceAttrs: Ember.computed(function() {
    return {
      d: this.get('arc'),
      fill: this.get('getSliceColor'),
      stroke: this.get('getSliceColor')
    };
  }).property('arc', 'getSliceColor'),
  labelAttrs: Ember.computed(function() {
    var arc, labelRadius, lastXPos, lastYPos, mostTintedColor;
    arc = this.get('arc');
    labelRadius = this.get('labelRadius');
    lastXPos = 0;
    lastYPos = 0;
    if (this.get('numSlices') > 1) {
      return {
        dy: '.35em',
        style: null,
        'stroke-width': 0,
        'text-anchor': function(d) {
          var angle;
          angle = (d.endAngle - d.startAngle) * 0.5 + d.startAngle;
          if ((Math.PI < angle && angle < 2 * Math.PI)) {
            return 'end';
          } else {
            return 'start';
          }
        },
        transform: function(d) {
          var f, isSwitchingSides, labelHeight, labelXPos, labelYPos, labelsTooClose, x, y, _ref;
          _ref = arc.centroid(d), x = _ref[0], y = _ref[1];
          f = function(d) {
            return d / Math.sqrt(x * x + y * y) * labelRadius;
          };
          labelXPos = f(x);
          labelYPos = f(y);
          labelHeight = this.getBBox().height;
          isSwitchingSides = (lastXPos > 0 && 0 > labelXPos) || (lastXPos < 0 && 0 < labelXPos);
          labelsTooClose = Math.abs(labelYPos - lastYPos) < labelHeight;
          if (labelsTooClose && !isSwitchingSides) {
            if (labelYPos < lastYPos) {
              labelYPos = lastYPos - labelHeight;
            } else {
              labelYPos = lastYPos + labelHeight;
            }
          }
          lastXPos = labelXPos;
          lastYPos = labelYPos;
          return "translate(" + labelXPos + "," + labelYPos + ")";
        }
      };
    } else {
      mostTintedColor = this.get('mostTintedColor');
      return {
        dy: '.71em',
        'stroke-width': 0,
        'text-anchor': 'middle',
        transform: null,
        style: "fill:" + mostTintedColor + ";"
      };
    }
  }).property('arc', 'labelRadius', 'numSlices', 'mostTintedColor'),
  groups: Ember.computed(function() {
    var data;
    data = this.get('pie')(this.get('finishedData'));
    return this.get('viewport').selectAll('.arc').data(data);
  }).volatile(),
  renderVars: ['radius', 'labelWidth', 'finishedData'],
  drawChart: function() {
    this.updateData();
    this.updateGraphic();
    if (this.get('hasLegend')) {
      return this.drawLegend();
    } else {
      return this.clearLegend();
    }
  },
  updateData: function() {
    var entering, groups, hideDetails, showDetails;
    groups = this.get('groups');
    showDetails = this.get('showDetails');
    hideDetails = this.get('hideDetails');
    entering = groups.enter().append('g').attr({
      "class": 'arc'
    }).on("mouseover", function(d, i) {
      return showDetails(d, i, this);
    }).on("mouseout", function(d, i) {
      return hideDetails(d, i, this);
    });
    entering.append('path').attr('class', 'slice');
    entering.append('text').attr('class', 'data');
    return groups.exit().remove();
  },
  updateGraphic: function() {
    var groups, labelTrimmer, labelWidth;
    groups = this.get('groups').attr(this.get('groupAttrs'));
    groups.select('path').attr(this.get('sliceAttrs'));
    labelWidth = this.get('labelWidth');
    labelTrimmer = Ember.Charts.Helpers.LabelTrimmer.create({
      getLabelSize: function(d) {
        return labelWidth;
      },
      getLabelText: function(d) {
        return d.data.label;
      }
    });
    return groups.select('text.data').text(function(d) {
      return d.data.label;
    }).attr(this.get('labelAttrs')).call(labelTrimmer.get('trim')).text(function(d) {
      return "" + this.textContent + ", " + d.data.percent + "%";
    });
  }
});

Ember.Handlebars.helper('pie-chart', Ember.Charts.PieComponent);


})();

(function() {


Ember.Charts.VerticalBarComponent = Ember.Charts.ChartComponent.extend(Ember.Charts.Legend, Ember.Charts.FloatingTooltipMixin, Ember.Charts.AxesMixin, {
  classNames: ['chart-vertical-bar'],
  formatLabel: d3.format(',.2f'),
  selectedSortType: 'none',
  ungroupedSeriesName: 'Other',
  stackBars: false,
  withinGroupPadding: 0,
  betweenGroupPadding: Ember.computed(function() {
    var scale;
    scale = d3.scale.linear().domain([1, 8]).range([1.25, 0.25]).clamp(true);
    return scale(this.get('numBars'));
  }).property('numBars'),
  numBars: Ember.computed(function() {
    return this.get('xBetweenGroupDomain.length') * this.get('xWithinGroupDomain.length') || 0;
  }).property('xBetweenGroupDomain', 'xWithinGroupDomain'),
  maxLabelHeight: 50,
  groupedData: Ember.computed(function() {
    var data,
      _this = this;
    data = this.get('sortedData');
    if (Ember.isEmpty(data)) {
      return [];
    }
    return Ember.Charts.Helpers.groupBy(data, function(d) {
      var _ref;
      return (_ref = d.group) != null ? _ref : _this.get('ungroupedSeriesName');
    });
  }).property('sortedData', 'ungroupedSeriesName'),
  sortedData: Ember.computed(function() {
    var data, type;
    type = this.get('selectedSortType');
    data = this.get('data');
    if (type === 'value') {
      data = data.sort(function(a, b) {
        if (a.value < b.value) {
          return 1;
        } else if (a.value > b.value) {
          return -1;
        } else {
          return 0;
        }
      });
    }
    return data;
  }).property('selectedSortType', 'data.@each'),
  groupNames: Ember.computed(function() {
    var groupName, values, _ref, _results;
    _ref = this.get('groupedData');
    _results = [];
    for (groupName in _ref) {
      values = _ref[groupName];
      _results.push(groupName);
    }
    return _results;
  }).property('groupedData'),
  isGrouped: Ember.computed(function() {
    return this.get('groupNames.length') > 1;
  }).property('groupNames.length'),
  finishedData: Ember.computed(function() {
    var d, groupName, stackedValues, values, y0, _i, _len, _ref, _ref1, _results, _results1;
    if (this.get('isGrouped')) {
      if (Ember.isEmpty(this.get('groupedData'))) {
        return [];
      }
      _ref = this.get('groupedData');
      _results = [];
      for (groupName in _ref) {
        values = _ref[groupName];
        y0 = 0;
        stackedValues = (function() {
          var _i, _len, _results1;
          _results1 = [];
          for (_i = 0, _len = values.length; _i < _len; _i++) {
            d = values[_i];
            _results1.push({
              y0: y0,
              y1: y0 += Math.max(d.value, 0),
              value: d.value,
              group: d.group,
              label: d.label,
              color: d.color
            });
          }
          return _results1;
        })();
        _results.push({
          group: groupName,
          values: values,
          stackedValues: stackedValues,
          totalValue: y0
        });
      }
      return _results;
    } else if (this.get('stackBars')) {
      if (Ember.isEmpty(this.get('data'))) {
        return [];
      }
      y0 = 0;
      stackedValues = (function() {
        var _i, _len, _ref1, _results1;
        _ref1 = this.get('data');
        _results1 = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          d = _ref1[_i];
          _results1.push({
            y0: y0,
            y1: y0 += Math.max(d.value, 0)
          });
        }
        return _results1;
      }).call(this);
      return [
        {
          group: this.get('data.firstObject.group'),
          values: this.get('data'),
          stackedValues: stackedValues,
          totalValue: y0
        }
      ];
    } else {
      if (Ember.isEmpty(this.get('data'))) {
        return [];
      }
      _ref1 = this.get('sortedData');
      _results1 = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        d = _ref1[_i];
        _results1.push({
          group: d.label,
          values: [d]
        });
      }
      return _results1;
    }
  }).property('groupedData', 'isGrouped', 'stackBars', 'sortedData'),
  labelHeightOffset: Ember.computed(function() {
    var labelSize;
    labelSize = this.get('_shouldRotateLabels') ? this.get('maxLabelHeight') : this.get('labelHeight');
    return labelSize + this.get('labelPadding');
  }).property('_shouldRotateLabels', 'maxLabelHeight', 'labelHeight', 'labelPadding'),
  legendChartPadding: Ember.computed.alias('labelHeightOffset'),
  graphicLeft: Ember.computed.alias('labelWidthOffset'),
  graphicWidth: Ember.computed(function() {
    return this.get('width') - this.get('labelWidthOffset');
  }).property('width', 'labelWidthOffset'),
  graphicHeight: Ember.computed(function() {
    return this.get('height') - this.get('legendHeight') - this.get('legendChartPadding');
  }).property('height', 'legendHeight', 'legendChartPadding'),
  yDomain: Ember.computed(function() {
    var finishedData, max, maxOfGroups, maxOfStacks, min, minOfGroups, minOfStacks;
    finishedData = this.get('finishedData');
    minOfGroups = d3.min(finishedData, function(d) {
      return _.min(d.values.map(function(dd) {
        return dd.value;
      }));
    });
    maxOfGroups = d3.max(finishedData, function(d) {
      return _.max(d.values.map(function(dd) {
        return dd.value;
      }));
    });
    maxOfStacks = d3.max(finishedData, function(d) {
      return d.totalValue;
    });
    minOfStacks = d3.min(finishedData, function(d) {
      return 0;
    });
    if (this.get('stackBars')) {
      min = minOfStacks;
      max = maxOfStacks;
    } else {
      min = minOfGroups;
      max = maxOfGroups;
    }
    if (min > 0) {
      return [0, max];
    }
    if (max < 0) {
      return [min, 0];
    }
    if ((min === max && max === 0)) {
      return [0, 1];
    } else {
      return [min, max];
    }
  }).property('finishedData', 'stackBars'),
  yScale: Ember.computed(function() {
    return d3.scale.linear().domain(this.get('yDomain')).range([this.get('graphicTop') + this.get('graphicHeight'), this.get('graphicTop')]).nice(this.get('numYTicks'));
  }).property('graphicTop', 'graphicHeight', 'yDomain', 'numYTicks'),
  individualBarLabels: Ember.computed(function() {
    var groups;
    groups = _.values(this.get('groupedData')).map(function(g) {
      return _.pluck(g, 'label');
    });
    return _.uniq(_.flatten(groups));
  }).property('groupedData.@each'),
  xBetweenGroupDomain: Ember.computed.alias('groupNames'),
  xWithinGroupDomain: Ember.computed.alias('individualBarLabels'),
  groupWidth: Ember.computed(function() {
    return this.get('xBetweenGroupScale').rangeBand();
  }).property('xBetweenGroupScale'),
  barWidth: Ember.computed(function() {
    return this.get('xWithinGroupScale').rangeBand();
  }).property('xWithinGroupScale'),
  xWithinGroupScale: Ember.computed(function() {
    if (this.get('isGrouped') || this.get('stackBars')) {
      return d3.scale.ordinal().domain(this.get('xWithinGroupDomain')).rangeRoundBands([0, this.get('groupWidth')], this.get('withinGroupPadding') / 2, 0);
    } else {
      return d3.scale.ordinal().domain(this.get('xWithinGroupDomain')).rangeRoundBands([0, this.get('groupWidth')], this.get('betweenGroupPadding') / 2, this.get('betweenGroupPadding') / 2);
    }
  }).property('isGrouped', 'stackBars', 'xWithinGroupDomain', 'groupWidth', 'withinGroupPadding', 'betweenGroupPadding'),
  xBetweenGroupScale: Ember.computed(function() {
    var betweenGroupPadding, labelWidth;
    labelWidth = this.get('labelWidth');
    if (this.get('isGrouped') || this.get('stackBars')) {
      betweenGroupPadding = this.get('betweenGroupPadding');
    } else {
      betweenGroupPadding = 0;
    }
    return d3.scale.ordinal().domain(this.get('xBetweenGroupDomain')).rangeRoundBands([0, this.get('graphicWidth')], betweenGroupPadding / 2, betweenGroupPadding / 2);
  }).property('isGrouped', 'stackBars', 'graphicWidth', 'labelWidth', 'xBetweenGroupDomain', 'betweenGroupPadding'),
  minAxisValue: Ember.computed(function() {
    var yScale;
    yScale = this.get('yScale');
    return yScale.domain()[0];
  }).property('yScale'),
  maxAxisValue: Ember.computed(function() {
    var yScale;
    yScale = this.get('yScale');
    return yScale.domain()[1];
  }).property('yScale'),
  numColorSeries: Ember.computed.alias('individualBarLabels.length'),
  hasLegend: Ember.computed(function() {
    return this.get('stackBars') || this.get('isGrouped') && this.get('legendItems.length') > 1;
  }).property('stackBars', 'isGrouped', 'legendItems.length'),
  legendItems: Ember.computed(function() {
    var getSeriesColor;
    getSeriesColor = this.get('getSeriesColor');
    return this.get('individualBarLabels').map(function(d, i) {
      var color;
      color = getSeriesColor(d, i);
      return {
        label: d,
        fill: color,
        stroke: color,
        icon: function() {
          return 'square';
        },
        selector: ".grouping-" + i
      };
    });
  }).property('individualBarLabels', 'getSeriesColor'),
  showDetails: Ember.computed(function() {
    var _this = this;
    if (!this.get('isInteractive')) {
      return Ember.K;
    }
    return function(data, i, element) {
      var addValueLine, content, formatLabel, isGroup;
      isGroup = Ember.isArray(data.values);
      element = isGroup ? element.parentNode.parentNode : element;
      d3.select(element).classed('hovered', true);
      if (data.group) {
        content = "<span class=\"tip-label\">" + data.group + "</span>";
      } else {
        content = '';
      }
      formatLabel = _this.get('formatLabel');
      addValueLine = function(d) {
        content += "<span class=\"name\">" + d.label + ": </span>";
        return content += "<span class=\"value\">" + (formatLabel(d.value)) + "</span><br/>";
      };
      if (isGroup) {
        data.values.forEach(addValueLine);
      } else {
        addValueLine(data);
      }
      return _this.showTooltip(content, d3.event);
    };
  }).property('isInteractive'),
  hideDetails: Ember.computed(function() {
    var _this = this;
    if (!this.get('isInteractive')) {
      return Ember.K;
    }
    return function(data, i, element) {
      if (Ember.isArray(data.values)) {
        element = element.parentNode.parentNode;
      }
      d3.select(element).classed('hovered', false);
      return _this.hideTooltip();
    };
  }).property('isInteractive'),
  groupAttrs: Ember.computed(function() {
    var xBetweenGroupScale,
      _this = this;
    xBetweenGroupScale = this.get('xBetweenGroupScale');
    return {
      transform: function(d) {
        var dx, dy;
        dx = _this.get('graphicLeft') + xBetweenGroupScale(d.group);
        dy = _this.get('graphicTop');
        return "translate(" + dx + ", " + dy + ")";
      }
    };
  }).property('graphicLeft', 'graphicTop', 'xBetweenGroupScale'),
  stackedBarAttrs: Ember.computed(function() {
    var yScale, zeroDisplacement,
      _this = this;
    zeroDisplacement = 1;
    yScale = this.get('yScale');
    return {
      "class": function(d, i) {
        return "grouping-" + i;
      },
      'stroke-width': 0,
      width: function(d) {
        return _this.get('groupWidth');
      },
      x: null,
      y: function(d) {
        return yScale(d.y1) + zeroDisplacement;
      },
      height: function(d) {
        return yScale(d.y0) - yScale(d.y1);
      }
    };
  }).property('yScale', 'groupWidth'),
  groupedBarAttrs: Ember.computed(function() {
    var yScale, zeroDisplacement,
      _this = this;
    zeroDisplacement = 1;
    yScale = this.get('yScale');
    return {
      "class": function(d, i) {
        return "grouping-" + i;
      },
      'stroke-width': 0,
      width: function(d) {
        return _this.get('barWidth');
      },
      x: function(d) {
        return _this.get('xWithinGroupScale')(d.label);
      },
      height: function(d) {
        return Math.max(0, Math.abs(yScale(d.value) - yScale(0)) - zeroDisplacement);
      },
      y: function(d) {
        if (d.value > 0) {
          return yScale(d.value);
        } else {
          return yScale(0) + zeroDisplacement;
        }
      }
    };
  }).property('yScale', 'getSeriesColor', 'barWidth', 'xWithinGroupScale'),
  labelAttrs: Ember.computed(function() {
    var _this = this;
    return {
      'stroke-width': 0,
      transform: function(d) {
        var dx, dy;
        dx = _this.get('barWidth') / 2;
        if (_this.get('isGrouped') || _this.get('stackBars')) {
          dx += _this.get('groupWidth') / 2 - _this.get('barWidth') / 2;
        } else {
          dx += _this.get('xWithinGroupScale')(d.group);
        }
        dy = _this.get('graphicTop') + _this.get('graphicHeight') + _this.get('labelPadding');
        return "translate(" + dx + ", " + dy + ")";
      }
    };
  }).property('barWidth', 'isGrouped', 'stackBars', 'groupWidth', 'xWithinGroupScale', 'graphicTop', 'graphicHeight', 'labelPadding'),
  groups: Ember.computed(function() {
    return this.get('viewport').selectAll('.bars').data(this.get('finishedData'));
  }).volatile(),
  yAxis: Ember.computed(function() {
    var yAxis;
    yAxis = this.get('viewport').select('.y.axis');
    if (yAxis.empty()) {
      return this.get('viewport').insert('g', ':first-child').attr('class', 'y axis');
    } else {
      return yAxis;
    }
  }).volatile(),
  maxLabelWidth: Ember.computed(function() {
    var maxLabelWidth;
    if (this.get('isGrouped') || this.get('stackBars')) {
      return maxLabelWidth = this.get('groupWidth');
    } else {
      return maxLabelWidth = this.get('barWidth');
    }
  }).property('isGrouped', 'stackBars', 'groupWidth', 'barWidth'),
  _shouldRotateLabels: false,
  setRotateLabels: function() {
    var labels, maxLabelWidth, rotateLabels;
    labels = this.get('groups').select('.groupLabel text');
    maxLabelWidth = this.get('maxLabelWidth');
    rotateLabels = false;
    if (this.get('rotatedLabelLength') > maxLabelWidth) {
      labels.each(function(d) {
        if (this.getBBox().width > maxLabelWidth) {
          return rotateLabels = true;
        }
      });
    }
    return this.set('_shouldRotateLabels', rotateLabels);
  },
  rotateLabelDegrees: Ember.computed(function() {
    var degrees, radians;
    radians = Math.atan(this.get('labelHeight') / this.get('maxLabelWidth'));
    degrees = radians * 180 / Math.PI;
    return Math.max(degrees, 20);
  }).property('labelHeight', 'maxLabelWidth'),
  rotatedLabelLength: Ember.computed(function() {
    var rotateLabelRadians;
    rotateLabelRadians = Math.PI / 180 * this.get('rotateLabelDegrees');
    return Math.abs(this.get('maxLabelHeight') / Math.sin(rotateLabelRadians));
  }).property('maxLabelHeight', 'rotateLabelDegrees'),
  renderVars: ['xWithinGroupScale', 'xBetweenGroupScale', 'yScale', 'finishedData', 'getSeriesColor'],
  drawChart: function() {
    this.updateData();
    this.updateLayout();
    this.updateAxes();
    this.updateGraphic();
    if (this.get('hasLegend')) {
      return this.drawLegend();
    } else {
      return this.clearLegend();
    }
  },
  updateData: function() {
    var bars, entering, exiting, groups, hideDetails, showDetails, subdata;
    groups = this.get('groups');
    showDetails = this.get('showDetails');
    hideDetails = this.get('hideDetails');
    entering = groups.enter().append('g').attr('class', 'bars');
    entering.append('g').attr('class', 'groupLabel').append('text').on("mouseover", function(d, i) {
      return showDetails(d, i, this);
    }).on("mouseout", function(d, i) {
      return hideDetails(d, i, this);
    });
    exiting = groups.exit().remove();
    if (this.get('stackBars')) {
      subdata = function(d) {
        return d.stackedValues;
      };
    } else {
      subdata = function(d) {
        return d.values;
      };
    }
    bars = groups.selectAll('rect').data(subdata);
    bars.enter().append('rect').on("mouseover", function(d, i) {
      return showDetails(d, i, this);
    }).on("mouseout", function(d, i) {
      return hideDetails(d, i, this);
    });
    return bars.exit().remove();
  },
  updateLayout: function() {
    var groups, labelTrimmer, labels, maxLabelWidth, rotateLabelDegrees,
      _this = this;
    groups = this.get('groups');
    labels = groups.select('.groupLabel text').attr('transform', null).text(function(d) {
      return d.group;
    });
    this.setRotateLabels();
    if (this.get('_shouldRotateLabels')) {
      rotateLabelDegrees = this.get('rotateLabelDegrees');
      labelTrimmer = Ember.Charts.Helpers.LabelTrimmer.create({
        getLabelSize: function(d) {
          return _this.get('rotatedLabelLength');
        },
        getLabelText: function(d) {
          return d.group;
        }
      });
      return labels.call(labelTrimmer.get('trim')).attr({
        'text-anchor': 'end',
        transform: "rotate(" + (-rotateLabelDegrees) + ")",
        dy: function(d) {
          return this.getBBox().height;
        }
      });
    } else {
      maxLabelWidth = this.get('maxLabelWidth');
      labelTrimmer = Ember.Charts.Helpers.LabelTrimmer.create({
        getLabelSize: function(d) {
          return maxLabelWidth;
        },
        getLabelText: function(d) {
          var _ref;
          return (_ref = d.group) != null ? _ref : '';
        }
      });
      return labels.call(labelTrimmer.get('trim')).attr({
        'text-anchor': 'middle',
        dy: this.get('labelPadding')
      });
    }
  },
  updateAxes: function() {
    var gYAxis, graphicLeft, graphicTop, yAxis;
    yAxis = d3.svg.axis().scale(this.get('yScale')).orient('right').ticks(this.get('numYTicks')).tickSize(this.get('graphicWidth')).tickFormat(this.get('formatValueAxis'));
    graphicTop = this.get('graphicTop');
    graphicLeft = this.get('graphicLeft');
    gYAxis = this.get('yAxis').attr({
      transform: "translate(" + graphicLeft + "," + graphicTop + ")"
    }).call(yAxis);
    gYAxis.selectAll('g').filter(function(d) {
      return d !== 0;
    }).classed('major', false).classed('minor', true);
    return gYAxis.selectAll('text').style('text-anchor', 'end').attr({
      x: -this.get('labelPadding')
    });
  },
  updateGraphic: function() {
    var barAttrs, groups, labels;
    groups = this.get('groups');
    if (this.get('stackBars')) {
      barAttrs = this.get('stackedBarAttrs');
    } else {
      barAttrs = this.get('groupedBarAttrs');
    }
    groups.attr(this.get('groupAttrs'));
    groups.selectAll('rect').style('fill', this.get('getSeriesColor')).attr(barAttrs);
    return labels = groups.select('g.groupLabel').attr(this.get('labelAttrs'));
  }
});

Ember.Handlebars.helper('vertical-bar-chart', Ember.Charts.VerticalBarComponent);


})();

(function() {


Ember.Charts.ScatterComponent = Ember.Charts.ChartComponent.extend(Ember.Charts.Legend, Ember.Charts.FloatingTooltipMixin, Ember.Charts.AxesMixin, {
  classNames: ['chart-scatter'],
  formatXValue: d3.format(',.2f'),
  formatYValue: d3.format(',.2f'),
  dotRadius: 7,
  dotShapeArea: Ember.computed(function() {
    return Math.pow(this.get('dotRadius'), 2);
  }).property('dotRadius'),
  graphPadding: 0.05,
  tickSpacing: 80,
  isShowingTotal: false,
  totalPointData: null,
  filteredData: Ember.computed(function() {
    var data;
    data = this.get('data');
    if (Ember.isEmpty(data)) {
      return [];
    }
    return data.filter(function(d) {
      return (d.xValue != null) && (d.yValue != null) && isFinite(d.xValue) && isFinite(d.yValue);
    });
  }).property('data.@each'),
  groupedData: Ember.computed(function() {
    var data, groupedData, k, v, _results,
      _this = this;
    data = this.get('filteredData');
    if (Ember.isEmpty(data)) {
      return [];
    }
    groupedData = Ember.Charts.Helpers.groupBy(data, function(d) {
      var _ref;
      return (_ref = d.group) != null ? _ref : _this.get('ungroupedSeriesName');
    });
    _results = [];
    for (k in groupedData) {
      v = groupedData[k];
      _results.push(v);
    }
    return _results;
  }).property('filteredData.@each'),
  groupNames: Ember.computed(function() {
    var d, _i, _len, _ref, _results;
    _ref = this.get('groupedData');
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      d = _ref[_i];
      _results.push(d.get(0).group);
    }
    return _results;
  }).property('groupedData'),
  numGroups: Ember.computed.alias('groupedData.length'),
  isGrouped: Ember.computed(function() {
    return this.get('numGroups') > 1;
  }).property('numGroups'),
  finishedData: Ember.computed.alias('groupedData'),
  axisTitleHeightOffset: Ember.computed(function() {
    return this.get('axisTitleHeight') + this.get('labelPadding');
  }).property('axisTitleHeight', 'labelPadding'),
  legendChartPadding: Ember.computed(function() {
    return this.get('axisTitleHeightOffset') + this.get('labelHeightOffset');
  }).property('labelHeightOffset', 'axisTitleHeightOffset'),
  graphicTop: Ember.computed.alias('axisTitleHeight'),
  graphicLeft: Ember.computed.alias('labelWidthOffset'),
  graphicHeight: Ember.computed(function() {
    return this.get('height') - this.get('legendHeight') - this.get('legendChartPadding');
  }).property('height', 'legendHeight', 'legendChartPadding'),
  graphicWidth: Ember.computed(function() {
    return this.get('width') - this.get('labelWidthOffset');
  }).property('width', 'labelWidthOffset'),
  axisTitleHeight: 18,
  xDomain: Ember.computed(function() {
    var totalData, xMax, xMin, _ref;
    totalData = this.get('isShowingTotal') ? [this.get('totalPointData')] : [];
    _ref = d3.extent(totalData.concat(this.get('filteredData')), function(d) {
      return d.xValue;
    }), xMin = _ref[0], xMax = _ref[1];
    if ((xMin === xMax && xMax === 0)) {
      return [-1, 1];
    } else if (xMin === xMax) {
      return [xMin * (1 - this.get('graphPadding')), xMin * (1 + this.get('graphPadding'))];
    } else {
      return [xMin, xMax];
    }
  }).property('filteredData.@each', 'isShowingTotal', 'totalPointData'),
  yDomain: Ember.computed(function() {
    var totalData, yMax, yMin, _ref;
    totalData = this.get('isShowingTotal') ? [this.get('totalPointData')] : [];
    _ref = d3.extent(totalData.concat(this.get('filteredData')), function(d) {
      return d.yValue;
    }), yMin = _ref[0], yMax = _ref[1];
    if ((yMin === yMax && yMax === 0)) {
      return [-1, 1];
    } else if (yMin === yMax) {
      return [yMin * (1 - this.get('graphPadding')), yMin * (1 + this.get('graphPadding'))];
    } else {
      return [yMin, yMax];
    }
  }).property('filteredData.@each', 'isShowingTotal', 'totalPointData', 'graphPadding'),
  xScale: Ember.computed(function() {
    var graphicLeft, graphicWidth, padding, xDomain;
    xDomain = this.get('xDomain');
    graphicLeft = this.get('graphicLeft');
    graphicWidth = this.get('graphicWidth');
    padding = (xDomain[1] - xDomain[0]) * this.get('graphPadding');
    return d3.scale.linear().domain([xDomain[0] - padding, xDomain[1] + padding]).range([graphicLeft, graphicLeft + graphicWidth]).nice(this.get('numXTicks'));
  }).property('xDomain', 'graphPadding', 'graphicLeft', 'graphicWidth', 'numXTicks'),
  yScale: Ember.computed(function() {
    var graphicHeight, graphicTop, padding, yDomain;
    yDomain = this.get('yDomain');
    graphicTop = this.get('graphicTop');
    graphicHeight = this.get('graphicHeight');
    padding = (yDomain[1] - yDomain[0]) * this.get('graphPadding');
    return d3.scale.linear().domain([yDomain[0] - padding, yDomain[1] + padding]).range([graphicTop + graphicHeight, graphicTop]).nice(this.get('numYTicks'));
  }).property('yDomain', 'graphPadding', 'graphicTop', 'graphicHeight', 'numYTicks'),
  groupShapes: Ember.computed(function() {
    return ['circle', 'square', 'triangle-up', 'cross', 'diamond'];
  }),
  numGroupShapes: Ember.computed.alias('groupShapes.length'),
  numGroupColors: 2,
  maxNumGroups: Ember.computed(function() {
    return this.get('numGroupColors') * this.get('numGroupShapes');
  }).property('numGroupColors', 'numGroupShapes'),
  displayGroups: Ember.computed(function() {
    return this.get('isGrouped') && this.get('numGroups') <= this.get('maxNumGroups');
  }).property('isGrouped', 'numGroups', 'numGroupShapes'),
  getGroupShape: Ember.computed(function() {
    var _this = this;
    return function(d, i) {
      i = _this.get('groupNames').indexOf(d.group);
      if (!_this.get('displayGroups')) {
        return 'circle';
      }
      return _this.get('groupShapes')[i % _this.get('numGroupShapes')];
    };
  }),
  getGroupColor: Ember.computed(function() {
    var _this = this;
    return function(d, i) {
      var colorIndex;
      colorIndex = 0;
      if (_this.get('displayGroups')) {
        i = _this.get('groupNames').indexOf(d.group);
        colorIndex = Math.floor(i / _this.get('numGroupShapes'));
      }
      return _this.get('colorScale')(colorIndex / _this.get('numGroupColors'));
    };
  }),
  hasLegend: Ember.computed.alias('isGrouped'),
  legendIconRadius: Ember.computed.alias('dotRadius'),
  legendItems: Ember.computed(function() {
    var displayGroups, getGroupColor, getGroupShape, legendData, point;
    if (this.get('hasNoData')) {
      return [];
    }
    getGroupShape = this.get('getGroupShape');
    getGroupColor = this.get('getGroupColor');
    displayGroups = this.get('displayGroups');
    legendData = this.get('groupedData').map(function(d, i) {
      var name, value;
      name = d.get(0).group;
      value = d.get('length') === 1 ? d.get(0) : null;
      return {
        label: name,
        group: name,
        stroke: getGroupColor,
        fill: displayGroups ? getGroupColor : 'transparent',
        icon: getGroupShape,
        selector: ".group-" + i,
        xValue: value != null ? value.xValue : void 0,
        yValue: value != null ? value.yValue : void 0
      };
    });
    if (this.get('isShowingTotal')) {
      point = this.get('totalPointData');
      legendData.unshift({
        label: point.group,
        group: point.group,
        stroke: getGroupColor,
        selector: '.totalgroup',
        xValue: point.xValue,
        yValue: point.yValue
      });
    }
    return legendData;
  }).property('hasNoData', 'groupedData', 'getGroupShape', 'getGroupColor', 'displayGroups', 'isShowingTotal', 'totalPointData'),
  xValueDisplayName: 'X Factor',
  yValueDisplayName: 'Y Factor',
  showDetails: Ember.computed(function() {
    var _this = this;
    if (!this.get('isInteractive')) {
      return Ember.K;
    }
    return function(data, i, element) {
      var content, formatXValue, formatYValue;
      d3.select(element).classed('hovered', true);
      formatXValue = _this.get('formatXValue');
      formatYValue = _this.get('formatYValue');
      content = "<span class=\"tip-label\">" + data.group + "</span>";
      content += "<span class=\"name\">" + (_this.get('xValueDisplayName')) + ": </span>";
      content += "<span class=\"value\">" + (formatXValue(data.xValue)) + "</span><br/>";
      content += "<span class=\"name\">" + (_this.get('yValueDisplayName')) + ": </span>";
      content += "<span class=\"value\">" + (formatYValue(data.yValue)) + "</span>";
      return _this.showTooltip(content, d3.event);
    };
  }).property('isInteractive'),
  hideDetails: Ember.computed(function() {
    var _this = this;
    if (!this.get('isInteractive')) {
      return Ember.K;
    }
    return function(data, i, element) {
      d3.select(element).classed('hovered', false);
      return _this.hideTooltip();
    };
  }).property('isInteractive'),
  groupAttrs: Ember.computed(function() {
    return {
      "class": function(d, i) {
        return "group group-" + i;
      }
    };
  }),
  pointAttrs: Ember.computed(function() {
    var _this = this;
    return {
      d: d3.svg.symbol().size(this.get('dotShapeArea')).type(this.get('getGroupShape')),
      fill: this.get('displayGroups') ? this.get('getGroupColor') : 'transparent',
      stroke: this.get('getGroupColor'),
      'stroke-width': 1.5,
      transform: function(d) {
        var dx, dy;
        dx = _this.get('xScale')(d.xValue);
        dy = _this.get('yScale')(d.yValue);
        return "translate(" + dx + ", " + dy + ")";
      }
    };
  }).property('dotShapeArea', 'getGroupShape', 'xScale', 'yScale', 'displayGroups', 'getGroupColor'),
  groups: Ember.computed(function() {
    return this.get('viewport').selectAll('.group').data(this.get('finishedData'));
  }).volatile(),
  selectOrCreateAxis: function(selector) {
    var axis;
    axis = this.get('viewport').select(selector);
    if (axis.empty()) {
      return this.get('viewport').insert('g', ':first-child');
    } else {
      return axis;
    }
  },
  selectOrCreateAxisTitle: function(selector) {
    var title;
    title = this.get('viewport').select(selector);
    if (title.empty()) {
      return this.get('viewport').append('text');
    } else {
      return title;
    }
  },
  xAxis: Ember.computed(function() {
    return this.selectOrCreateAxis('.x.axis').attr('class', 'x axis');
  }).volatile(),
  yAxis: Ember.computed(function() {
    return this.selectOrCreateAxis('.y.axis').attr('class', 'y axis');
  }).volatile(),
  xAxisTitle: Ember.computed(function() {
    return this.selectOrCreateAxisTitle('.x.axis-title').attr('class', 'x axis-title');
  }).volatile(),
  yAxisTitle: Ember.computed(function() {
    return this.selectOrCreateAxisTitle('.y.axis-title').attr('class', 'y axis-title');
  }).volatile(),
  renderVars: ['xScale', 'yScale', 'dotShapeArea', 'finishedData', 'xValueDisplayName', 'yValueDisplayName'],
  drawChart: function() {
    this.updateTotalPointData();
    this.updateData();
    this.updateAxes();
    this.updateGraphic();
    if (this.get('hasLegend')) {
      return this.drawLegend();
    } else {
      return this.clearLegend();
    }
  },
  totalPointShape: Ember.computed(function() {
    var dotShapeArea,
      _this = this;
    dotShapeArea = this.get('dotShapeArea');
    return function(selection) {
      selection.append('path').attr({
        "class": 'totaldot',
        d: d3.svg.symbol().size(dotShapeArea).type('circle'),
        fill: _this.get('getGroupColor')
      });
      return selection.append('path').attr({
        "class": 'totaloutline',
        d: d3.svg.symbol().size(dotShapeArea * 3).type('circle'),
        fill: 'transparent',
        stroke: _this.get('getGroupColor'),
        'stroke-width': 2
      });
    };
  }),
  updateTotalPointData: function() {
    var totalData, totalPoint;
    totalData = this.get('isShowingTotal') ? [this.get('totalPointData')] : [];
    totalPoint = this.get('viewport').selectAll('.totalgroup').data(totalData);
    totalPoint.exit().remove();
    return totalPoint.enter().append('g').attr('class', 'totalgroup').call(this.get('totalPointShape'));
  },
  updateData: function() {
    var groups, points;
    groups = this.get('groups');
    groups.enter().append('g').attr('class', 'group').attr(this.get('groupAttrs'));
    groups.exit().remove();
    points = groups.selectAll('.dot').data(function(d) {
      return d;
    });
    points.enter().append('path').attr('class', 'dot');
    return points.exit().remove();
  },
  updateAxes: function() {
    var gXAxis, gYAxis, graphicHeight, graphicLeft, graphicTop, labelPadding, xAxis, xAxisPadding, yAxis;
    xAxis = d3.svg.axis().scale(this.get('xScale')).orient('top').ticks(this.get('numXTicks')).tickSize(this.get('graphicHeight')).tickFormat(this.get('formatXValue'));
    yAxis = d3.svg.axis().scale(this.get('yScale')).orient('right').ticks(this.get('numYTicks')).tickSize(this.get('graphicWidth')).tickFormat(this.get('formatYValue'));
    graphicTop = this.get('graphicTop');
    graphicHeight = this.get('graphicHeight');
    gXAxis = this.get('xAxis').attr('transform', "translate(0," + (graphicTop + graphicHeight) + ")").call(xAxis);
    gXAxis.selectAll('g').filter(function(d) {
      return d !== 0;
    }).classed('major', false).classed('minor', true);
    labelPadding = this.get('labelPadding');
    gXAxis.selectAll('text').style('text-anchor', 'middle').attr({
      y: function(d) {
        return this.getBBox().height + labelPadding / 2;
      }
    });
    graphicLeft = this.get('graphicLeft');
    gYAxis = this.get('yAxis').attr('transform', "translate(" + graphicLeft + ",0)").call(yAxis);
    gYAxis.selectAll('g').filter(function(d) {
      return d !== 0;
    }).classed('major', false).classed('minor', true);
    gYAxis.selectAll('text').style('text-anchor', 'end').attr({
      x: -this.get('labelPadding')
    });
    xAxisPadding = this.get('labelHeightOffset') + this.get('labelPadding');
    this.get('xAxisTitle').text(this.get('xValueDisplayName')).style('text-anchor', 'middle').attr({
      x: this.get('graphicWidth') / 2 + this.get('labelWidthOffset'),
      y: this.get('graphicBottom') + xAxisPadding
    });
    return this.get('yAxisTitle').text(this.get('yValueDisplayName')).style('text-anchor', 'start').attr({
      y: 0,
      x: -this.get('labelPadding')
    });
  },
  updateGraphic: function() {
    var hideDetails, showDetails,
      _this = this;
    showDetails = this.get('showDetails');
    hideDetails = this.get('hideDetails');
    this.get('groups').selectAll('.dot').attr(this.get('pointAttrs')).on("mouseover", function(d, i) {
      return showDetails(d, i, this);
    }).on("mouseout", function(d, i) {
      return hideDetails(d, i, this);
    });
    return this.get('viewport').select('.totalgroup').on("mouseover", function(d, i) {
      return showDetails(d, i, this);
    }).on("mouseout", function(d, i) {
      return hideDetails(d, i, this);
    }).attr({
      transform: function(d) {
        var dx, dy;
        dx = _this.get('xScale')(d.xValue);
        dy = _this.get('yScale')(d.yValue);
        return "translate(" + dx + ", " + dy + ")";
      }
    });
  }
});

Ember.Handlebars.helper('scatter-chart', Ember.Charts.ScatterComponent);


})();

(function() {


Ember.Charts.TimeSeriesComponent = Ember.Charts.ChartComponent.extend(Ember.Charts.Legend, Ember.Charts.TimeSeriesLabeler, Ember.Charts.FloatingTooltipMixin, Ember.Charts.HasTimeSeriesRule, Ember.Charts.AxesMixin, {
  classNames: ['chart-time-series'],
  lineData: null,
  barData: null,
  formatTime: d3.time.format('%Y-%m-%d'),
  formatTimeLong: d3.time.format('%a %b %-d, %Y'),
  formatLabel: d3.format(',.2f'),
  ungroupedSeriesName: 'Other',
  interpolate: false,
  yAxisFromZero: false,
  barPadding: 0,
  barGroupPadding: 0.25,
  barLeftOffset: 0.0,
  finishedData: Ember.computed(function() {
    return {
      lineData: this.get('_groupedLineData'),
      groupedBarData: this.get('_groupedBarData')
    };
  }).property('_groupedLineData.@each.values', '_groupedBarData.@each'),
  hasNoData: Ember.computed(function() {
    return !this.get('_hasBarData') && !this.get('_hasLineData');
  }).property('_hasBarData', '_hasLineData'),
  legendChartPadding: Ember.computed.alias('labelHeightOffset'),
  _getLabelOrDefault: function(datum) {
    var _ref;
    return ((_ref = datum.label) != null ? _ref.toString() : void 0) || this.get('ungroupedSeriesName');
  },
  _groupedLineData: Ember.computed(function() {
    var groupName, groups, lineData, values, _results,
      _this = this;
    lineData = this.get('lineData');
    if (Ember.isEmpty(lineData)) {
      return [];
    }
    groups = Ember.Charts.Helpers.groupBy(lineData, function(datum) {
      return _this._getLabelOrDefault(datum);
    });
    _results = [];
    for (groupName in groups) {
      values = groups[groupName];
      _results.push({
        group: groupName,
        values: values
      });
    }
    return _results;
  }).property('lineData.@each', 'ungroupedSeriesName'),
  _groupedBarData: Ember.computed(function() {
    var barData, barGroupsByTime, barTimes, drawTime, g, groups, label, labelTime, timePoint;
    barData = this.get('barData');
    if (Ember.isEmpty(barData)) {
      return [];
    }
    barTimes = Ember.Charts.Helpers.groupBy(barData, function(d) {
      return d.time.getTime();
    });
    return barGroupsByTime = (function() {
      var _results;
      _results = [];
      for (timePoint in barTimes) {
        groups = barTimes[timePoint];
        _results.push((function() {
          var _i, _len, _results1;
          _results1 = [];
          for (_i = 0, _len = groups.length; _i < _len; _i++) {
            g = groups[_i];
            label = this._getLabelOrDefault(g);
            labelTime = g.time;
            drawTime = this._transformCenter(g.time);
            _results1.push({
              group: label,
              time: drawTime,
              value: g.value,
              label: label,
              labelTime: labelTime
            });
          }
          return _results1;
        }).call(this));
      }
      return _results;
    }).call(this);
  }).property('barData.@each', 'ungroupedSeriesName', 'barLeftOffset'),
  _transformCenter: function(time) {
    var delta, offset;
    delta = this._getTimeDeltaFromSelectedInterval();
    offset = this.get('barLeftOffset');
    if (offset !== 0) {
      time = this._padTimeWithIntervalMultiplier(time, delta, offset);
    }
    return time;
  },
  _getTimeDeltaFromSelectedInterval: function() {
    switch (this.get('selectedInterval')) {
      case 'years':
      case 'Y':
        return 'year';
      case 'quarters':
      case 'Q':
        return 'quarter';
      case 'months':
      case 'M':
        return 'month';
      case 'weeks':
      case 'W':
        return 'week';
      case 'seconds':
      case 'S':
        return 'second';
    }
  },
  _padTimeForward: function(time, delta) {
    return this._padTimeWithIntervalMultiplier(time, delta, 0.5);
  },
  _padTimeBackward: function(time, delta) {
    return this._padTimeWithIntervalMultiplier(time, delta, -0.5);
  },
  _padTimeWithIntervalMultiplier: function(time, delta, multiplier) {
    var intervalType, offsetDelta, period;
    if (time != null) {
      intervalType = delta === 'quarter' ? 'month' : delta;
      period = delta === 'quarter' ? 3 : 1;
      offsetDelta = d3.time[intervalType].offset(time, period) - time.getTime();
      time = offsetDelta * multiplier + time.getTime();
    }
    return new Date(time);
  },
  _barGroups: Ember.computed(function() {
    var barData, barGroups,
      _this = this;
    barData = this.get('barData');
    if (Ember.isEmpty(barData)) {
      return [];
    }
    barGroups = Ember.Charts.Helpers.groupBy(barData, function(datum) {
      return _this._getLabelOrDefault(datum);
    });
    return _.keys(barGroups);
  }).property('barData.@each', 'ungroupedSeriesName'),
  _hasLineData: Ember.computed.notEmpty('lineData'),
  _hasBarData: Ember.computed.notEmpty('barData'),
  graphicLeft: Ember.computed.alias('labelWidthOffset'),
  graphicWidth: Ember.computed(function() {
    return this.get('width') - this.get('labelWidthOffset');
  }).property('width', 'labelWidthOffset'),
  graphicHeight: Ember.computed(function() {
    return this.get('height') - this.get('legendHeight') - this.get('legendChartPadding');
  }).property('height', 'legendHeight', 'legendChartPadding'),
  timeDelta: Ember.computed(function() {
    var diffTimeDays, firstBarTime, groupedBarData, oneDayInSeconds, secondBarTime;
    groupedBarData = this.get('_groupedBarData');
    if (Ember.isEmpty(groupedBarData) || groupedBarData.get('length') < 2) {
      return 'month';
    }
    firstBarTime = groupedBarData[0][0].time;
    secondBarTime = groupedBarData[1][0].time;
    oneDayInSeconds = 24 * 60 * 60 * 1000;
    diffTimeDays = (secondBarTime - firstBarTime) / oneDayInSeconds;
    if (diffTimeDays > 351) {
      return 'year';
    } else if (diffTimeDays > 33) {
      return 'quarter';
    } else if (diffTimeDays > 9) {
      return 'month';
    } else if (diffTimeDays > 3) {
      return 'week';
    } else {
      return 'day';
    }
  }).property('_groupedBarData'),
  barDataExtent: Ember.computed(function() {
    var endTime, first, groupedBarData, last, paddedEnd, paddedStart, startTime, timeDelta;
    timeDelta = this.get('timeDelta');
    groupedBarData = this.get('_groupedBarData');
    if (Ember.isEmpty(groupedBarData)) {
      return [new Date(), new Date()];
    }
    first = _.first(groupedBarData);
    last = _.last(groupedBarData);
    startTime = new Date(first[0].time);
    endTime = new Date(last[0].time);
    paddedStart = this._padTimeBackward(startTime, timeDelta);
    paddedEnd = this._padTimeForward(endTime, timeDelta);
    return [new Date(paddedStart), new Date(paddedEnd)];
  }).property('timeDelta', '_groupedBarData.@each'),
  xBetweenGroupDomain: Ember.computed.alias('barDataExtent'),
  xWithinGroupDomain: Ember.computed.alias('_barGroups'),
  barWidth: Ember.computed(function() {
    return this.get('xGroupScale').rangeBand();
  }).property('xGroupScale'),
  paddedGroupWidth: Ember.computed(function() {
    var scale, t1, t2, timeDelta;
    timeDelta = this.get('timeDelta');
    scale = this.get('xTimeScale');
    t1 = this.get('xBetweenGroupDomain')[0];
    t2 = timeDelta === 'quarter' ? d3.time['month'].offset(t1, 3) : d3.time[timeDelta].offset(t1, 1);
    return scale(t2) - scale(t1);
  }).property('timeDelta', 'xTimeScale', 'xBetweenGroupDomain'),
  lineSeriesNames: Ember.computed(function() {
    var data;
    data = this.get('_groupedLineData');
    if (Ember.isEmpty(data)) {
      return [];
    }
    return data.map(function(d) {
      return d.group;
    });
  }).property('_groupedLineData'),
  lineDataExtent: Ember.computed(function() {
    var data, extents;
    data = this.get('_groupedLineData');
    if (Ember.isEmpty(data)) {
      return [new Date(), new Date()];
    }
    extents = data.getEach('values').map(function(series) {
      return d3.extent(series.map(function(d) {
        return d.time;
      }));
    });
    return [
      d3.min(extents, function(e) {
        return e[0];
      }), d3.max(extents, function(e) {
        return e[1];
      })
    ];
  }).property('_groupedLineData.@each.values'),
  xBetweenSeriesDomain: Ember.computed.alias('lineSeriesNames'),
  xWithinSeriesDomain: Ember.computed.alias('lineDataExtent'),
  maxNumberOfLabels: Ember.computed.alias('numXTicks'),
  xDomain: Ember.computed(function() {
    var maxOfGroups, maxOfSeries, minOfGroups, minOfSeries, _ref, _ref1;
    if (!this.get('_hasBarData')) {
      return this.get('xWithinSeriesDomain');
    }
    if (!this.get('_hasLineData')) {
      return this.get('xBetweenGroupDomain');
    }
    _ref = this.get('xBetweenGroupDomain'), minOfGroups = _ref[0], maxOfGroups = _ref[1];
    _ref1 = this.get('xWithinSeriesDomain'), minOfSeries = _ref1[0], maxOfSeries = _ref1[1];
    return [Math.min(minOfGroups, minOfSeries), Math.max(maxOfGroups, maxOfSeries)];
  }).property('xBetweenGroupDomain', 'xWithinSeriesDomain', '_hasBarData', '_hasLineData'),
  yDomain: Ember.computed(function() {
    var groupData, hasBarData, hasLineData, lineData, max, maxOfGroups, maxOfSeries, min, minOfGroups, minOfSeries;
    lineData = this.get('_groupedLineData');
    groupData = this.get('_groupedBarData');
    maxOfSeries = d3.max(lineData, function(d) {
      return d3.max(d.values, function(dd) {
        return dd.value;
      });
    });
    minOfSeries = d3.min(lineData, function(d) {
      return d3.min(d.values, function(dd) {
        return dd.value;
      });
    });
    maxOfGroups = d3.max(groupData, function(d) {
      return d3.max(d, function(dd) {
        return dd.value;
      });
    });
    minOfGroups = d3.min(groupData, function(d) {
      return d3.min(d, function(dd) {
        return dd.value;
      });
    });
    hasBarData = this.get('_hasBarData');
    hasLineData = this.get('_hasLineData');
    if (!hasBarData) {
      min = minOfSeries;
      max = maxOfSeries;
    } else if (!hasLineData) {
      min = minOfGroups;
      max = maxOfGroups;
    } else {
      min = Math.min(minOfGroups, minOfSeries);
      max = Math.max(maxOfGroups, maxOfSeries);
    }
    if (this.get('yAxisFromZero') || min === max) {
      if (max < 0) {
        return [min, 0];
      }
      if (min > 0) {
        return [0, max];
      }
      if ((min === max && max === 0)) {
        return [-1, 1];
      }
    }
    return [min, max];
  }).property('_groupedLineData', '_groupedBarData', '_hasBarData', '_hasLineData', 'yAxisFromZero'),
  yRange: Ember.computed(function() {
    return [this.get('graphicTop') + this.get('graphicHeight'), this.get('graphicTop')];
  }).property('graphicTop', 'graphicHeight'),
  yScale: Ember.computed(function() {
    return d3.scale.linear().domain(this.get('yDomain')).range(this.get('yRange')).nice(this.get('numYTicks'));
  }).property('yDomain', 'yRange', 'numYTicks'),
  xRange: Ember.computed(function() {
    return [this.get('graphicLeft'), this.get('graphicLeft') + this.get('graphicWidth')];
  }).property('graphicLeft', 'graphicWidth'),
  xTimeScale: Ember.computed(function() {
    var xDomain;
    xDomain = this.get('xDomain');
    return d3.time.scale().domain(this.get('xDomain')).range(this.get('xRange'));
  }).property('xDomain', 'xRange'),
  xGroupScale: Ember.computed(function() {
    return d3.scale.ordinal().domain(this.get('xWithinGroupDomain')).rangeRoundBands([0, this.get('paddedGroupWidth')], this.get('barPadding') / 2, this.get('barGroupPadding') / 2);
  }).property('xWithinGroupDomain', 'paddedGroupWidth', 'barPadding', 'barGroupPadding'),
  minAxisValue: Ember.computed(function() {
    var yScale;
    yScale = this.get('yScale');
    return yScale.domain()[0];
  }).property('yScale'),
  maxAxisValue: Ember.computed(function() {
    var yScale;
    yScale = this.get('yScale');
    return yScale.domain()[1];
  }).property('yScale'),
  showDetails: Ember.computed(function() {
    var _this = this;
    if (!this.get('isInteractive')) {
      return Ember.K;
    }
    return function(data, i, element) {
      var addValueLine, content, formatLabel, time;
      d3.select(element).classed('hovered', true);
      time = data.labelTime != null ? data.labelTime : data.time;
      content = "<span class=\"tip-label\">" + (_this.get('formatTime')(time)) + "</span>";
      formatLabel = _this.get('formatLabel');
      addValueLine = function(d) {
        content += "<span class=\"name\">" + d.group + ": </span>";
        return content += "<span class=\"value\">" + (formatLabel(d.value)) + "</span><br/>";
      };
      if (Ember.isArray(data.values)) {
        data.values.forEach(addValueLine);
      } else {
        addValueLine(data);
      }
      return _this.showTooltip(content, d3.event);
    };
  }).property('isInteractive'),
  hideDetails: Ember.computed(function() {
    var _this = this;
    if (!this.get('isInteractive')) {
      return Ember.K;
    }
    return function(data, i, element) {
      d3.select(element).classed('hovered', false);
      return _this.hideTooltip();
    };
  }).property('isInteractive'),
  zeroDisplacement: 1,
  groupAttrs: Ember.computed(function() {
    var _this = this;
    return {
      transform: function(d) {
        return "translate(" + (-_this.get('paddedGroupWidth') / 2) + ",0)";
      }
    };
  }).property('paddedGroupWidth'),
  groupedBarAttrs: Ember.computed(function() {
    var xGroupScale, xTimeScale, yScale, zeroDisplacement,
      _this = this;
    xTimeScale = this.get('xTimeScale');
    xGroupScale = this.get('xGroupScale');
    yScale = this.get('yScale');
    zeroDisplacement = this.get('zeroDisplacement');
    return {
      "class": function(d, i) {
        return "grouping-" + i;
      },
      'stroke-width': 0,
      width: this.get('barWidth'),
      x: function(d) {
        return xGroupScale(d.label) + xTimeScale(d.time);
      },
      y: function(d) {
        if (d.value > 0) {
          return yScale(d.value);
        } else {
          return yScale(0) + zeroDisplacement;
        }
      },
      height: function(d) {
        var zeroLine;
        zeroLine = Math.max(0, yScale.domain()[0]);
        return Math.max(0, d.value > zeroLine ? Math.abs(yScale(zeroLine) - yScale(d.value)) - zeroDisplacement : Math.abs(yScale(d.value) - yScale(zeroLine)) - zeroDisplacement);
      }
    };
  }).property('xTimeScale', 'xGroupScale', 'barWidth', 'yScale', 'zeroDisplacement', 'barLeftOffset'),
  line: Ember.computed(function() {
    var _this = this;
    return d3.svg.line().x(function(d) {
      return _this.get('xTimeScale')(d.time);
    }).y(function(d) {
      return _this.get('yScale')(d.value);
    }).interpolate(this.get('interpolate') ? 'basis' : 'linear');
  }).property('xTimeScale', 'yScale', 'interpolate'),
  lineColorFn: Ember.computed(function() {
    var _this = this;
    return function(d, i) {
      var getSeriesColor;
      getSeriesColor = _this.get('getSeriesColor');
      switch (i) {
        case 0:
          return getSeriesColor(d, 0);
        case 1:
          return getSeriesColor(d, 2);
        case 2:
          return getSeriesColor(d, 0);
        case 3:
          return getSeriesColor(d, 2);
        case 4:
          return getSeriesColor(d, 0);
        case 5:
          return getSeriesColor(d, 1);
        default:
          return getSeriesColor(d, i);
      }
    };
  }),
  lineAttrs: Ember.computed(function() {
    var getSeriesColor, line,
      _this = this;
    getSeriesColor = this.get('getSeriesColor');
    line = this.get('line');
    return {
      "class": function(d, i) {
        return "line series-" + i;
      },
      d: function(d) {
        return line(d.values);
      },
      stroke: this.get('lineColorFn'),
      'stroke-width': function(d, i) {
        switch (i) {
          case 0:
            return 2;
          case 1:
            return 1.5;
          case 2:
            return 2;
          case 3:
            return 1.5;
          case 4:
            return 2.5;
          case 5:
            return 2.5;
          default:
            return 2;
        }
      },
      'stroke-dasharray': function(d, i) {
        switch (i) {
          case 2:
          case 3:
          case 5:
            return '2,2';
          default:
            return '';
        }
      }
    };
  }).property('line', 'getSeriesColor'),
  numLines: Ember.computed.alias('xBetweenSeriesDomain.length'),
  numBarsPerGroup: Ember.computed.alias('xWithinGroupDomain.length'),
  numColorSeries: 6,
  numSecondaryColorSeries: Ember.computed.alias('numBarsPerGroup'),
  secondaryMinimumTint: Ember.computed(function() {
    if (this.get('numLines') === 0) {
      return 0;
    } else {
      return 0.4;
    }
  }).property('numLines'),
  secondaryMaximumTint: Ember.computed(function() {
    if (this.get('numLines') === 0) {
      return 0.8;
    } else {
      return 0.85;
    }
  }).property('numLines'),
  hasLegend: Ember.computed(function() {
    return this.get('legendItems.length') > 1;
  }).property('legendItems.length'),
  legendItems: Ember.computed(function() {
    var getSeriesColor, lineAttrs,
      _this = this;
    getSeriesColor = this.get('getSeriesColor');
    lineAttrs = this.get('lineAttrs');
    return this.get('xBetweenSeriesDomain').map(function(d, i) {
      return {
        label: d,
        stroke: lineAttrs['stroke'](d, i),
        width: lineAttrs['stroke-width'](d, i),
        dotted: lineAttrs['stroke-dasharray'](d, i),
        icon: function() {
          return 'line';
        },
        selector: ".series-" + i
      };
    }).concat(this.get('xWithinGroupDomain').map(function(d, i) {
      var color;
      color = _this.get('getSecondarySeriesColor')(d, i);
      return {
        stroke: color,
        fill: color,
        label: d,
        icon: function() {
          return 'square';
        },
        selector: ".grouping-" + i
      };
    }));
  }).property('xBetweenSeriesDomain', 'xWithinGroupDomain', 'getSeriesColor', 'getSecondarySeriesColor'),
  removeAllGroups: function() {
    return this.get('viewport').selectAll('.bars').remove();
  },
  groups: Ember.computed(function() {
    return this.get('viewport').selectAll('.bars').data(this.get('_groupedBarData'));
  }).volatile(),
  removeAllSeries: function() {
    return this.get('viewport').selectAll('.series').remove();
  },
  series: Ember.computed(function() {
    return this.get('viewport').selectAll('.series').data(this.get('_groupedLineData'));
  }).volatile(),
  xAxis: Ember.computed(function() {
    var xAxis;
    xAxis = this.get('viewport').select('.x.axis');
    if (xAxis.empty()) {
      return this.get('viewport').insert('g', ':first-child').attr('class', 'x axis');
    } else {
      return xAxis;
    }
  }).volatile(),
  yAxis: Ember.computed(function() {
    var yAxis;
    yAxis = this.get('viewport').select('.y.axis');
    if (yAxis.empty()) {
      return this.get('viewport').insert('g', ':first-child').attr('class', 'y axis');
    } else {
      return yAxis;
    }
  }).volatile(),
  renderVars: ['barLeftOffset', 'labelledTicks', 'xGroupScale', 'xTimeScale', 'yScale'],
  drawChart: function() {
    this.updateBarData();
    this.updateLineData();
    this.updateLineMarkers();
    this.updateAxes();
    this.updateBarGraphic();
    this.updateLineGraphic();
    if (this.get('hasLegend')) {
      return this.drawLegend();
    } else {
      return this.clearLegend();
    }
  },
  updateAxes: function() {
    var gXAxis, gYAxis, graphicHeight, graphicLeft, graphicTop, xAxis, yAxis;
    xAxis = d3.svg.axis().scale(this.get('xTimeScale')).orient('bottom').tickValues(this.get('labelledTicks')).tickSubdivide(this.get('numberOfMinorTicks')).tickFormat(this.get('formattedTime')).tickSize(6, 3);
    yAxis = d3.svg.axis().scale(this.get('yScale')).orient('right').ticks(this.get('numYTicks')).tickSize(this.get('graphicWidth')).tickFormat(this.get('formatValueAxis'));
    graphicTop = this.get('graphicTop');
    graphicHeight = this.get('graphicHeight');
    gXAxis = this.get('xAxis').attr({
      transform: "translate(0," + (graphicTop + graphicHeight) + ")"
    }).call(xAxis);
    graphicLeft = this.get('graphicLeft');
    gYAxis = this.get('yAxis').attr('transform', "translate(" + graphicLeft + ",0)").call(yAxis);
    gYAxis.selectAll('g').filter(function(d) {
      return d;
    }).classed('major', false).classed('minor', true);
    return gYAxis.selectAll('text').style('text-anchor', 'end').attr({
      x: -this.get('labelPadding')
    });
  },
  updateBarData: function() {
    var bars, groups, hideDetails, showDetails;
    this.removeAllGroups();
    groups = this.get('groups');
    showDetails = this.get('showDetails');
    hideDetails = this.get('hideDetails');
    groups.enter().insert('g', '.series').attr('class', 'bars');
    groups.exit().remove();
    bars = groups.selectAll('rect').data(function(d) {
      return d;
    });
    bars.enter().append('rect').on("mouseover", function(d, i) {
      return showDetails(d, i, this);
    }).on("mouseout", function(d, i) {
      return hideDetails(d, i, this);
    });
    return bars.exit().remove();
  },
  updateBarGraphic: function() {
    var groups;
    groups = this.get('groups');
    groups.attr(this.get('groupAttrs'));
    return groups.selectAll('rect').style('fill', this.get('getSecondarySeriesColor')).attr(this.get('groupedBarAttrs'));
  },
  updateLineData: function() {
    var series;
    this.removeAllSeries();
    series = this.get('series');
    series.enter().append('g').attr('class', 'series').append('path').attr('class', 'line');
    return series.exit().remove();
  },
  updateLineGraphic: function() {
    var graphicTop, series;
    series = this.get('series');
    graphicTop = this.get('graphicTop');
    series.attr('transform', "translate(0, " + graphicTop + ")");
    return series.select('path.line').attr(this.get('lineAttrs'));
  }
});

Ember.Handlebars.helper('time-series-chart', Ember.Charts.TimeSeriesComponent);


})();

(function() {


Ember.Charts.BubbleComponent = Ember.Charts.ChartComponent.extend(Ember.Charts.FloatingTooltipMixin, {
  classNames: ['chart-bubble'],
  layoutGravity: -0.01,
  damper: 0.1,
  charge: Ember.computed(function() {
    return function(d) {
      return -Math.pow(d.radius, 2.0) / 8;
    };
  }),
  formatLabel: d3.format(',.2f'),
  showDetails: Ember.computed(function() {
    var _this = this;
    if (!this.get('isInteractive')) {
      return Ember.K;
    }
    return function(data, i, element) {
      var content, formatLabel;
      d3.select(element).classed('hovered', true);
      formatLabel = _this.get('formatLabel');
      content = "<span class=\"tip-label\">" + data.label + "</span>";
      content += "<span class=\"name\">" + (_this.get('tooltipValueDisplayName')) + ": </span>";
      content += "<span class=\"value\">" + (formatLabel(data.value)) + "</span>";
      return _this.showTooltip(content, d3.event);
    };
  }).property('isInteractive'),
  hideDetails: Ember.computed(function() {
    var _this = this;
    if (!this.get('isInteractive')) {
      return Ember.K;
    }
    return function(data, i, element) {
      d3.select(element).classed('hovered', false);
      return _this.hideTooltip();
    };
  }).property('isInteractive'),
  renderVars: ['selectedSeedColor'],
  radiusScale: Ember.computed(function() {
    var maxAmount, maxRadius;
    maxAmount = d3.max(this.data, function(d) {
      return d.value;
    });
    maxRadius = d3.min([this.get('width'), this.get('height')]) / 7;
    return d3.scale.pow().exponent(0.5).domain([0, maxAmount]).range([2, maxRadius]);
  }).property('data', 'width', 'height'),
  nodeData: Ember.computed(function() {
    var data, nodes, radiusScale,
      _this = this;
    data = this.get('data');
    if (Ember.isEmpty(data)) {
      return [];
    }
    radiusScale = this.get('radiusScale');
    nodes = data.map(function(d) {
      return {
        radius: radiusScale(d.value),
        value: d.value,
        label: d.label,
        id: d.label,
        x: Math.random() * _this.get('width') / 2,
        y: Math.random() * _this.get('height') / 2
      };
    });
    nodes.sort(function(a, b) {
      return b.value - a.value;
    });
    return nodes;
  }).property('radiusScale'),
  finishedData: Ember.computed.alias('nodeData'),
  numColorSeries: Ember.computed.alias('finishedData.length'),
  drawChart: function() {
    return this.updateVis();
  },
  updateVis: function() {
    var circles, fill_color, force, hideDetails, move_towards_center, nodes, showDetails, vis,
      _this = this;
    vis = this.get('viewport');
    nodes = this.get('nodeData');
    showDetails = this.get('showDetails');
    hideDetails = this.get('hideDetails');
    fill_color = this.get('getSeriesColor');
    circles = vis.selectAll("circle").data(nodes, function(d) {
      return d.id;
    });
    circles.enter().append("circle").attr("r", 0).attr("id", function(d) {
      return "bubble_" + d.id;
    }).on("mouseover", function(d, i) {
      return showDetails(d, i, this);
    }).on("mouseout", function(d, i) {
      return hideDetails(d, i, this);
    });
    circles.transition().duration(2000).attr("r", function(d) {
      return d.radius;
    });
    circles.attr("fill", fill_color).attr("stroke-width", 2).attr("stroke", function(d, i) {
      return d3.rgb(fill_color(d, i)).darker();
    });
    circles.exit().remove();
    move_towards_center = function(alpha) {
      var center;
      center = {
        x: _this.get('width') / 2,
        y: _this.get('height') / 2
      };
      return function(d) {
        d.x = d.x + (center.x - d.x) * (_this.get('damper') + 0.02) * alpha;
        return d.y = d.y + (center.y - d.y) * (_this.get('damper') + 0.02) * alpha;
      };
    };
    force = d3.layout.force().nodes(nodes).size([this.get('width'), this.get('height')]);
    force.gravity(this.get('layoutGravity')).charge(this.get('charge')).friction(0.9).on("tick", function(e) {
      return circles.each(move_towards_center(e.alpha)).attr("cx", function(d) {
        return d.x;
      }).attr("cy", function(d) {
        return d.y;
      });
    });
    force.start();
    return vis.selectAll(".years").remove();
  }
});

Ember.Handlebars.helper('bubble-chart', Ember.Charts.BubbleComponent);


})();

})();

(function() {

window.App = Ember.Application.create({
  LOG_TRANSITIONS: true
});


})();

(function() {


App.data = {};

App.data["null"] = null;

App.data.empty = [];


})();

(function() {


App.data.asset_values = [
  {
    label: "Cash & Cash Equivalent",
    value: 5403418.115000006,
    type: "money"
  }, {
    label: "Fixed Income",
    value: 8231078.16438347,
    type: "money"
  }, {
    label: "Equity",
    value: 12935781.176999997,
    type: "money"
  }, {
    label: "Hedge Fund",
    value: 1621341.246006786,
    type: "money"
  }, {
    label: "Private Equity",
    value: 1574677.59,
    type: "money"
  }, {
    label: "Real Assets",
    value: 10475849.276172025,
    type: "money"
  }
];


})();

(function() {


App.data.many_values = [
  {
    label: "Label 1",
    value: 20
  }, {
    label: "Label 2",
    value: 22
  }, {
    label: "Label 3",
    value: 18
  }, {
    label: "Label 4",
    value: 2
  }, {
    label: "Label 5",
    value: 6
  }, {
    label: "Label 6",
    value: 26
  }, {
    label: "Label 7",
    value: 18
  }, {
    label: "Label 8",
    value: 150
  }, {
    label: "Label 9",
    value: 160
  }, {
    label: "Label 10",
    value: 200
  }, {
    label: "Label 11",
    value: 14
  }, {
    label: "Label 12",
    value: 31
  }, {
    label: "Label 13",
    value: 44
  }, {
    label: "Label 14",
    value: 30
  }, {
    label: "Label 15",
    value: 62
  }, {
    label: "Label 16",
    value: 75
  }, {
    label: "Label 17",
    value: 114
  }, {
    label: "Label 18",
    value: 19
  }, {
    label: "Label 19",
    value: 129
  }, {
    label: "Label 20",
    value: 52
  }, {
    label: "Label 21",
    value: 200
  }, {
    label: "Label 22",
    value: 14
  }, {
    label: "Label 23",
    value: 31
  }, {
    label: "Label 24",
    value: 44
  }, {
    label: "Label 25",
    value: 30
  }, {
    label: "Label 26",
    value: 62
  }
];


})();

(function() {


App.data.high_net_worth_duration = [
  {
    label: "Not Applicable (Modified Duration)",
    value: 369353.20417884,
    type: "money"
  }, {
    label: "2.0 to 4.0",
    value: 39913.94838165567,
    type: "money"
  }, {
    label: "4.0 to 6.0",
    value: 747144.6821651033,
    type: "money"
  }, {
    label: "6.0 to 8.0",
    value: 1107289.153444018,
    type: "money"
  }, {
    label: "8.0 to 10.0",
    value: 784442.9734556648,
    type: "money"
  }, {
    label: "10.0 to 12.0",
    value: 314798.6861845985,
    type: "money"
  }, {
    label: "12.0 to 14.0",
    value: 132820.13222065035,
    type: "money"
  }, {
    label: "14.0 to 16.0",
    value: 180545.78853177986,
    type: "money"
  }
];


})();

(function() {


App.data.single_sector_return = [
  {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Aeronautic & astronautic industry",
    group: "Aeronautic & astronautic industry",
    value: 9956.953507739403,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Banks & other credit institutions",
    group: "Banks & other credit institutions",
    value: 18978.05581062734,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Chemicals",
    group: "Chemicals",
    value: 77669.117850293,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Computer hardware & networking",
    group: "Computer hardware & networking",
    value: 6960.703363481491,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Electronics",
    group: "Electronics",
    value: 12529.900459007,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Electronics & semiconductors",
    group: "Electronics & semiconductors",
    value: 2905.426879575807,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Financial, investment & other diversified comp.",
    group: "Financial, investment & other diversified comp.",
    value: 18401.63651741106,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Food & soft drinks",
    group: "Food & soft drinks",
    value: 13733.845828757425,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Health Care",
    group: "Health Care",
    value: 150909.153209184,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Health care & social services",
    group: "Health care & social services",
    value: 8248.064314638228,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Insurance companies",
    group: "Insurance companies",
    value: 7013.878172742705,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Internet, software & IT services",
    group: "Internet, software & IT services",
    value: 59271.18598570356,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Investment Fund",
    group: "Investment Fund",
    value: 15401.9456583827,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Investment trusts/funds + pension funds",
    group: "Investment trusts/funds + pension funds",
    value: 14197.05830132496,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Leisure",
    group: "Leisure",
    value: 1050.24013310,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Lodging & catering ind., leisure facilities",
    group: "Lodging & catering ind., leisure facilities",
    value: 13202.78000233154,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Long Term",
    group: "Long Term",
    value: 4019.481379089517,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Mechanical engineering & industrial equip.",
    group: "Mechanical engineering & industrial equip.",
    value: 4647.603703145614,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Miscellaneous consumer goods",
    group: "Miscellaneous consumer goods",
    value: 3189.180308185896,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Petroleum",
    group: "Petroleum",
    value: 63937.970281974645,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Pharmaceuticals cosmetics & med. products",
    group: "Pharmaceuticals cosmetics & med. products",
    value: 10874.807224610915,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Retail",
    group: "Retail",
    value: 27447.831733878324,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Retail trade & department stores",
    group: "Retail trade & department stores",
    value: 31035.627782905445,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Short Term",
    group: "Short Term",
    value: 8707.749774914644,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Software & Programming",
    group: "Software & Programming",
    value: 73266.4348387686,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Telecommunication",
    group: "Telecommunication",
    value: 9515.74704319803,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Financial analytics software",
    group: "Financial analytics software",
    value: 99310.60662117682,
    type: "money"
  }
];


})();

(function() {


App.data.one_value = [
  {
    label: "Label 1",
    value: 20
  }
];


})();

(function() {


App.data.two_values = [
  {
    label: "Label 1",
    value: 20
  }, {
    label: "Label 2",
    value: -1
  }
];


})();

(function() {


App.data.zero = [
  {
    label: "Label 1",
    value: 0,
    type: "percent"
  }
];


})();

(function() {


App.data.zeroes = [
  {
    label: "Label 1",
    value: 0,
    type: "percent"
  }, {
    label: "Label 2",
    value: 0,
    type: "percent"
  }, {
    label: "Label 3",
    value: 0,
    type: "percent"
  }, {
    label: "Label 4",
    value: 0,
    type: "percent"
  }, {
    label: "Label 5",
    value: 0,
    type: "percent"
  }, {
    label: "Label 6",
    value: 0,
    type: "percent"
  }
];


})();

(function() {


App.data.sum_to_zero = [
  {
    label: "Label 1",
    value: 0,
    type: "percent"
  }, {
    label: "Label 2",
    value: 2,
    type: "percent"
  }, {
    label: "Label 3",
    value: 3,
    type: "percent"
  }, {
    label: "Label 4",
    value: -5,
    type: "percent"
  }, {
    label: "Label 5",
    value: 0,
    type: "percent"
  }, {
    label: "Label 6",
    value: 0,
    type: "percent"
  }
];


})();

(function() {


App.data.bad_range = [
  {
    label: "Label 1",
    value: 200
  }, {
    label: "Label 2",
    value: 220
  }, {
    label: "Label 3",
    value: 0.1
  }, {
    label: "Label 4",
    value: 1
  }, {
    label: "Label 5",
    value: 1
  }, {
    label: "Label 6",
    value: -18
  }, {
    label: "Label 7",
    value: -18
  }, {
    label: "Label 8",
    value: 18
  }
];


})();

(function() {


App.data.two_ranges = [
  {
    label: "Cash & Cash Equivalent",
    group: "Bank of America Merrill Lynch Global High Yield Index",
    value: 5403418.115000006,
    type: "money"
  }, {
    label: "Fixed Income",
    group: "Bank of America Merrill Lynch Global High Yield Index",
    value: 8231078.16438347,
    type: "money"
  }, {
    label: "Equity",
    group: "Bank of America Merrill Lynch Global High Yield Index",
    value: 12935781.176999997,
    type: "money"
  }, {
    label: "Hedge Fund",
    group: "Bank of America Merrill Lynch Global High Yield Index",
    value: 1621341.246006786,
    type: "money"
  }, {
    label: "Private Equity",
    group: "Bank of America Merrill Lynch Global High Yield Index",
    value: 1574677.59,
    type: "money"
  }, {
    label: "Real Assets",
    group: "Bank of America Merrill Lynch Global High Yield Index",
    value: 10475849.276172025,
    type: "money"
  }, {
    label: "Other",
    group: "Bank of America Merrill Lynch Global High Yield Index",
    value: 10475849.276172025,
    type: "money"
  }, {
    label: "Cash & Cash Equivalent",
    group: "S&P Goldman Sachs Commodity Total Return Index",
    value: 1933418.115000006,
    type: "money"
  }, {
    label: "Fixed Income",
    group: "S&P Goldman Sachs Commodity Total Return Index",
    value: 1031078.16438347,
    type: "money"
  }, {
    label: "Equity",
    group: "S&P Goldman Sachs Commodity Total Return Index",
    value: 14235781.176999997,
    type: "money"
  }, {
    label: "Hedge Fund",
    group: "S&P Goldman Sachs Commodity Total Return Index",
    value: 3981341.246006786,
    type: "money"
  }, {
    label: "Private Equity",
    group: "S&P Goldman Sachs Commodity Total Return Index",
    value: 6644677.59,
    type: "money"
  }, {
    label: "Real Assets",
    group: "S&P Goldman Sachs Commodity Total Return Index",
    value: 17513849.276172025,
    type: "money"
  }, {
    label: "Other",
    group: "S&P Goldman Sachs Commodity Total Return Index",
    value: 4758493.276172025,
    type: "money"
  }
];


})();

(function() {


App.data.three_ranges = [
  {
    label: "Label 1",
    group: "Group One",
    value: 20
  }, {
    label: "Label 1",
    group: "Group Two",
    value: 32
  }, {
    label: "Label 1",
    group: "Group Three",
    value: 4
  }, {
    label: "Label 2",
    group: "Group One",
    value: 16
  }, {
    label: "Label 2",
    group: "Group Two",
    value: 17
  }, {
    label: "Label 2",
    group: "Group Three",
    value: -18
  }, {
    label: "Label 3",
    group: "Group One",
    value: -18
  }, {
    label: "Label 3",
    group: "Group Two",
    value: 18
  }, {
    label: "Label 3",
    group: "Group Three",
    value: -19
  }
];


})();

(function() {


App.data.five_ranges = [
  {
    label: "Label 1",
    group: "Group One",
    value: 20
  }, {
    label: "Label 2",
    group: "Group One",
    value: 22
  }, {
    label: "Label 3",
    group: "Group One",
    value: 18
  }, {
    label: "Label 4",
    group: "Group One",
    value: 2
  }, {
    label: "Label 5",
    group: "Group One",
    value: 6
  }, {
    label: "Label 1",
    group: "Group Two",
    value: 26
  }, {
    label: "Label 2",
    group: "Group Two",
    value: 18
  }, {
    label: "Label 3",
    group: "Group Two",
    value: 150
  }, {
    label: "Label 4",
    group: "Group Two",
    value: 160
  }, {
    label: "Label 5",
    group: "Group Two",
    value: 200
  }, {
    label: "Label 1",
    group: "Group Three",
    value: 14
  }, {
    label: "Label 2",
    group: "Group Three",
    value: 31
  }, {
    label: "Label 3",
    group: "Group Three",
    value: 44
  }, {
    label: "Label 4",
    group: "Group Three",
    value: 30
  }, {
    label: "Label 5",
    group: "Group Three",
    value: 62
  }, {
    label: "Label 1",
    group: "Group Four",
    value: 75
  }, {
    label: "Label 2",
    group: "Group Four",
    value: 114
  }, {
    label: "Label 3",
    group: "Group Four",
    value: 19
  }, {
    label: "Label 4",
    group: "Group Four",
    value: 129
  }, {
    label: "Label 5",
    group: "Group Four",
    value: 52
  }, {
    label: "Label 1",
    group: "Group Five",
    value: 200
  }, {
    label: "Label 2",
    group: "Group Five",
    value: 14
  }, {
    label: "Label 3",
    group: "Group Five",
    value: 31
  }, {
    label: "Label 4",
    group: "Group Five",
    value: 44
  }, {
    label: "Label 5",
    group: "Group Five",
    value: 30
  }
];


})();

(function() {


App.data.sector_compare_return = [
  {
    group: "Merrill Lynch",
    label: "Mechanical engineering & industrial equip.",
    value: 4647.603703145614,
    type: "money"
  }, {
    group: "Merrill Lynch",
    label: "Miscellaneous consumer goods",
    value: 3189.180308185896,
    type: "money"
  }, {
    group: "Merrill Lynch",
    label: "Petroleum",
    value: 3937.970281974645,
    type: "money"
  }, {
    group: "Merrill Lynch",
    label: "Pharmaceuticals cosmetics & med. products",
    value: 10874.807224610915,
    type: "money"
  }, {
    group: "Merrill Lynch",
    label: "Retail",
    value: 27447.831733878324,
    type: "money"
  }, {
    group: "Merrill Lynch",
    label: "Retail trade & department stores",
    value: 31035.627782905445,
    type: "money"
  }, {
    group: "Merrill Lynch",
    label: "Short Term",
    value: 8707.749774914644,
    type: "money"
  }, {
    group: "Merrill Lynch",
    label: "Software & Programming",
    value: 117326.4348387686,
    type: "money"
  }, {
    group: "Merrill Lynch",
    label: "Telecommunication",
    value: 9515.74704319803,
    type: "money"
  }, {
    group: "Merrill Lynch",
    label: "Financial analytics software",
    value: 99310.60662117682,
    type: "money"
  }, {
    group: "Barclays",
    label: "Mechanical engineering & industrial equip.",
    value: 6476.03703145614,
    type: "money"
  }, {
    group: "Barclays",
    label: "Miscellaneous consumer goods",
    value: 1891.80308185896,
    type: "money"
  }, {
    group: "Barclays",
    label: "Petroleum",
    value: 39379.70281974645,
    type: "money"
  }, {
    group: "Barclays",
    label: "Pharmaceuticals cosmetics & med. products",
    value: 8748.07224610915,
    type: "money"
  }, {
    group: "Barclays",
    label: "Retail",
    value: 74478.31733878324,
    type: "money"
  }, {
    group: "Barclays",
    label: "Retail trade & department stores",
    value: 10356.27782905445,
    type: "money"
  }, {
    group: "Barclays",
    label: "Short Term",
    value: 7077.49774914644,
    type: "money"
  }, {
    group: "Barclays",
    label: "Software & Programming",
    value: 173264.348387686,
    type: "money"
  }, {
    group: "Barclays",
    label: "Telecommunication",
    value: 5157.4704319803,
    type: "money"
  }, {
    group: "Barclays",
    label: "Financial analytics software",
    value: 93106.0662117682,
    type: "money"
  }, {
    group: "BlackRock",
    label: "Mechanical engineering & industrial equip.",
    value: 4760.3703145614,
    type: "money"
  }, {
    group: "BlackRock",
    label: "Miscellaneous consumer goods",
    value: 8918.0308185896,
    type: "money"
  }, {
    group: "BlackRock",
    label: "Petroleum",
    value: 93797.0281974645,
    type: "money"
  }, {
    group: "BlackRock",
    label: "Pharmaceuticals cosmetics & med. products",
    value: 87480.7224610915,
    type: "money"
  }, {
    group: "BlackRock",
    label: "Retail",
    value: 44783.1733878324,
    type: "money"
  }, {
    group: "BlackRock",
    label: "Retail trade & department stores",
    value: 3562.7782905445,
    type: "money"
  }, {
    group: "BlackRock",
    label: "Short Term",
    value: 774.9774914644,
    type: "money"
  }, {
    group: "BlackRock",
    label: "Software & Programming",
    value: 73264.48387686,
    type: "money"
  }, {
    group: "BlackRock",
    label: "Telecommunication",
    value: 1574.704319803,
    type: "money"
  }, {
    group: "BlackRock",
    label: "Financial analytics software",
    value: 31060.662117682,
    type: "money"
  }, {
    group: "Vanguard",
    label: "Mechanical engineering & industrial equip.",
    value: 7603.703145614,
    type: "money"
  }, {
    group: "Vanguard",
    label: "Miscellaneous consumer goods",
    value: 9180.308185896,
    type: "money"
  }, {
    group: "Vanguard",
    label: "Petroleum",
    value: 37970.281974645,
    type: "money"
  }, {
    group: "Vanguard",
    label: "Pharmaceuticals cosmetics & med. products",
    value: 74807.224610915,
    type: "money"
  }, {
    group: "Vanguard",
    label: "Retail",
    value: 47831.733878324,
    type: "money"
  }, {
    group: "Vanguard",
    label: "Retail trade & department stores",
    value: 35627.782905445,
    type: "money"
  }, {
    group: "Vanguard",
    label: "Short Term",
    value: 7749.774914644,
    type: "money"
  }, {
    group: "Vanguard",
    label: "Software & Programming",
    value: 326434.8387686,
    type: "money"
  }, {
    group: "Vanguard",
    label: "Telecommunication",
    value: 5747.04319803,
    type: "money"
  }, {
    group: "Vanguard",
    label: "Financial analytics software",
    value: 10606.62117682,
    type: "money"
  }, {
    group: "Benchmark",
    label: "Mechanical engineering & industrial equip.",
    value: 6037.03145614,
    type: "money"
  }, {
    group: "Benchmark",
    label: "Miscellaneous consumer goods",
    value: 1803.08185896,
    type: "money"
  }, {
    group: "Benchmark",
    label: "Petroleum",
    value: 79702.81974645,
    type: "money"
  }, {
    group: "Benchmark",
    label: "Pharmaceuticals cosmetics & med. products",
    value: 48072.24610915,
    type: "money"
  }, {
    group: "Benchmark",
    label: "Retail",
    value: 78317.33878324,
    type: "money"
  }, {
    group: "Benchmark",
    label: "Retail trade & department stores",
    value: 56277.82905445,
    type: "money"
  }, {
    group: "Benchmark",
    label: "Short Term",
    value: 7497.74914644,
    type: "money"
  }, {
    group: "Benchmark",
    label: "Software & Programming",
    value: 264348.387686,
    type: "money"
  }, {
    group: "Benchmark",
    label: "Telecommunication",
    value: 7470.4319803,
    type: "money"
  }, {
    group: "Benchmark",
    label: "Financial analytics software",
    value: 6066.2117682,
    type: "money"
  }
];


})();

(function() {


App.data.sepals = [
  {
    sepalLength: 5.1,
    sepalWidth: 3.5,
    petalLength: 1.4,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 4.9,
    sepalWidth: 3.0,
    petalLength: 1.4,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 4.7,
    sepalWidth: 3.2,
    petalLength: 1.3,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 4.6,
    sepalWidth: 3.1,
    petalLength: 1.5,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 5.0,
    sepalWidth: 3.6,
    petalLength: 1.4,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 5.4,
    sepalWidth: 3.9,
    petalLength: 1.7,
    petalWidth: 0.4,
    group: 'setosa'
  }, {
    sepalLength: 4.6,
    sepalWidth: 3.4,
    petalLength: 1.4,
    petalWidth: 0.3,
    group: 'setosa'
  }, {
    sepalLength: 5.0,
    sepalWidth: 3.4,
    petalLength: 1.5,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 4.4,
    sepalWidth: 2.9,
    petalLength: 1.4,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 4.9,
    sepalWidth: 3.1,
    petalLength: 1.5,
    petalWidth: 0.1,
    group: 'setosa'
  }, {
    sepalLength: 5.4,
    sepalWidth: 3.7,
    petalLength: 1.5,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 4.8,
    sepalWidth: 3.4,
    petalLength: 1.6,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 4.8,
    sepalWidth: 3.0,
    petalLength: 1.4,
    petalWidth: 0.1,
    group: 'setosa'
  }, {
    sepalLength: 4.3,
    sepalWidth: 3.0,
    petalLength: 1.1,
    petalWidth: 0.1,
    group: 'setosa'
  }, {
    sepalLength: 5.8,
    sepalWidth: 4.0,
    petalLength: 1.2,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 5.7,
    sepalWidth: 4.4,
    petalLength: 1.5,
    petalWidth: 0.4,
    group: 'setosa'
  }, {
    sepalLength: 5.4,
    sepalWidth: 3.9,
    petalLength: 1.3,
    petalWidth: 0.4,
    group: 'setosa'
  }, {
    sepalLength: 5.1,
    sepalWidth: 3.5,
    petalLength: 1.4,
    petalWidth: 0.3,
    group: 'setosa'
  }, {
    sepalLength: 5.7,
    sepalWidth: 3.8,
    petalLength: 1.7,
    petalWidth: 0.3,
    group: 'setosa'
  }, {
    sepalLength: 5.1,
    sepalWidth: 3.8,
    petalLength: 1.5,
    petalWidth: 0.3,
    group: 'setosa'
  }, {
    sepalLength: 5.4,
    sepalWidth: 3.4,
    petalLength: 1.7,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 5.1,
    sepalWidth: 3.7,
    petalLength: 1.5,
    petalWidth: 0.4,
    group: 'setosa'
  }, {
    sepalLength: 4.6,
    sepalWidth: 3.6,
    petalLength: 1.0,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 5.1,
    sepalWidth: 3.3,
    petalLength: 1.7,
    petalWidth: 0.5,
    group: 'setosa'
  }, {
    sepalLength: 4.8,
    sepalWidth: 3.4,
    petalLength: 1.9,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 5.0,
    sepalWidth: 3.0,
    petalLength: 1.6,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 5.0,
    sepalWidth: 3.4,
    petalLength: 1.6,
    petalWidth: 0.4,
    group: 'setosa'
  }, {
    sepalLength: 5.2,
    sepalWidth: 3.5,
    petalLength: 1.5,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 5.2,
    sepalWidth: 3.4,
    petalLength: 1.4,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 4.7,
    sepalWidth: 3.2,
    petalLength: 1.6,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 4.8,
    sepalWidth: 3.1,
    petalLength: 1.6,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 5.4,
    sepalWidth: 3.4,
    petalLength: 1.5,
    petalWidth: 0.4,
    group: 'setosa'
  }, {
    sepalLength: 5.2,
    sepalWidth: 4.1,
    petalLength: 1.5,
    petalWidth: 0.1,
    group: 'setosa'
  }, {
    sepalLength: 5.5,
    sepalWidth: 4.2,
    petalLength: 1.4,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 4.9,
    sepalWidth: 3.1,
    petalLength: 1.5,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 5.0,
    sepalWidth: 3.2,
    petalLength: 1.2,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 5.5,
    sepalWidth: 3.5,
    petalLength: 1.3,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 4.9,
    sepalWidth: 3.6,
    petalLength: 1.4,
    petalWidth: 0.1,
    group: 'setosa'
  }, {
    sepalLength: 4.4,
    sepalWidth: 3.0,
    petalLength: 1.3,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 5.1,
    sepalWidth: 3.4,
    petalLength: 1.5,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 5.0,
    sepalWidth: 3.5,
    petalLength: 1.3,
    petalWidth: 0.3,
    group: 'setosa'
  }, {
    sepalLength: 4.5,
    sepalWidth: 2.3,
    petalLength: 1.3,
    petalWidth: 0.3,
    group: 'setosa'
  }, {
    sepalLength: 4.4,
    sepalWidth: 3.2,
    petalLength: 1.3,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 5.0,
    sepalWidth: 3.5,
    petalLength: 1.6,
    petalWidth: 0.6,
    group: 'setosa'
  }, {
    sepalLength: 5.1,
    sepalWidth: 3.8,
    petalLength: 1.9,
    petalWidth: 0.4,
    group: 'setosa'
  }, {
    sepalLength: 4.8,
    sepalWidth: 3.0,
    petalLength: 1.4,
    petalWidth: 0.3,
    group: 'setosa'
  }, {
    sepalLength: 5.1,
    sepalWidth: 3.8,
    petalLength: 1.6,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 4.6,
    sepalWidth: 3.2,
    petalLength: 1.4,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 5.3,
    sepalWidth: 3.7,
    petalLength: 1.5,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 5.0,
    sepalWidth: 3.3,
    petalLength: 1.4,
    petalWidth: 0.2,
    group: 'setosa'
  }, {
    sepalLength: 7.0,
    sepalWidth: 3.2,
    petalLength: 4.7,
    petalWidth: 1.4,
    group: 'versicolor'
  }, {
    sepalLength: 6.4,
    sepalWidth: 3.2,
    petalLength: 4.5,
    petalWidth: 1.5,
    group: 'versicolor'
  }, {
    sepalLength: 6.9,
    sepalWidth: 3.1,
    petalLength: 4.9,
    petalWidth: 1.5,
    group: 'versicolor'
  }, {
    sepalLength: 5.5,
    sepalWidth: 2.3,
    petalLength: 4.0,
    petalWidth: 1.3,
    group: 'versicolor'
  }, {
    sepalLength: 6.5,
    sepalWidth: 2.8,
    petalLength: 4.6,
    petalWidth: 1.5,
    group: 'versicolor'
  }, {
    sepalLength: 5.7,
    sepalWidth: 2.8,
    petalLength: 4.5,
    petalWidth: 1.3,
    group: 'versicolor'
  }, {
    sepalLength: 6.3,
    sepalWidth: 3.3,
    petalLength: 4.7,
    petalWidth: 1.6,
    group: 'versicolor'
  }, {
    sepalLength: 4.9,
    sepalWidth: 2.4,
    petalLength: 3.3,
    petalWidth: 1.0,
    group: 'versicolor'
  }, {
    sepalLength: 6.6,
    sepalWidth: 2.9,
    petalLength: 4.6,
    petalWidth: 1.3,
    group: 'versicolor'
  }, {
    sepalLength: 5.2,
    sepalWidth: 2.7,
    petalLength: 3.9,
    petalWidth: 1.4,
    group: 'versicolor'
  }, {
    sepalLength: 5.0,
    sepalWidth: 2.0,
    petalLength: 3.5,
    petalWidth: 1.0,
    group: 'versicolor'
  }, {
    sepalLength: 5.9,
    sepalWidth: 3.0,
    petalLength: 4.2,
    petalWidth: 1.5,
    group: 'versicolor'
  }, {
    sepalLength: 6.0,
    sepalWidth: 2.2,
    petalLength: 4.0,
    petalWidth: 1.0,
    group: 'versicolor'
  }, {
    sepalLength: 6.1,
    sepalWidth: 2.9,
    petalLength: 4.7,
    petalWidth: 1.4,
    group: 'versicolor'
  }, {
    sepalLength: 5.6,
    sepalWidth: 2.9,
    petalLength: 3.6,
    petalWidth: 1.3,
    group: 'versicolor'
  }, {
    sepalLength: 6.7,
    sepalWidth: 3.1,
    petalLength: 4.4,
    petalWidth: 1.4,
    group: 'versicolor'
  }, {
    sepalLength: 5.6,
    sepalWidth: 3.0,
    petalLength: 4.5,
    petalWidth: 1.5,
    group: 'versicolor'
  }, {
    sepalLength: 5.8,
    sepalWidth: 2.7,
    petalLength: 4.1,
    petalWidth: 1.0,
    group: 'versicolor'
  }, {
    sepalLength: 6.2,
    sepalWidth: 2.2,
    petalLength: 4.5,
    petalWidth: 1.5,
    group: 'versicolor'
  }, {
    sepalLength: 5.6,
    sepalWidth: 2.5,
    petalLength: 3.9,
    petalWidth: 1.1,
    group: 'versicolor'
  }, {
    sepalLength: 5.9,
    sepalWidth: 3.2,
    petalLength: 4.8,
    petalWidth: 1.8,
    group: 'versicolor'
  }, {
    sepalLength: 6.1,
    sepalWidth: 2.8,
    petalLength: 4.0,
    petalWidth: 1.3,
    group: 'versicolor'
  }, {
    sepalLength: 6.3,
    sepalWidth: 2.5,
    petalLength: 4.9,
    petalWidth: 1.5,
    group: 'versicolor'
  }, {
    sepalLength: 6.1,
    sepalWidth: 2.8,
    petalLength: 4.7,
    petalWidth: 1.2,
    group: 'versicolor'
  }, {
    sepalLength: 6.4,
    sepalWidth: 2.9,
    petalLength: 4.3,
    petalWidth: 1.3,
    group: 'versicolor'
  }, {
    sepalLength: 6.6,
    sepalWidth: 3.0,
    petalLength: 4.4,
    petalWidth: 1.4,
    group: 'versicolor'
  }, {
    sepalLength: 6.8,
    sepalWidth: 2.8,
    petalLength: 4.8,
    petalWidth: 1.4,
    group: 'versicolor'
  }, {
    sepalLength: 6.7,
    sepalWidth: 3.0,
    petalLength: 5.0,
    petalWidth: 1.7,
    group: 'versicolor'
  }, {
    sepalLength: 6.0,
    sepalWidth: 2.9,
    petalLength: 4.5,
    petalWidth: 1.5,
    group: 'versicolor'
  }, {
    sepalLength: 5.7,
    sepalWidth: 2.6,
    petalLength: 3.5,
    petalWidth: 1.0,
    group: 'versicolor'
  }, {
    sepalLength: 5.5,
    sepalWidth: 2.4,
    petalLength: 3.8,
    petalWidth: 1.1,
    group: 'versicolor'
  }, {
    sepalLength: 5.5,
    sepalWidth: 2.4,
    petalLength: 3.7,
    petalWidth: 1.0,
    group: 'versicolor'
  }, {
    sepalLength: 5.8,
    sepalWidth: 2.7,
    petalLength: 3.9,
    petalWidth: 1.2,
    group: 'versicolor'
  }, {
    sepalLength: 6.0,
    sepalWidth: 2.7,
    petalLength: 5.1,
    petalWidth: 1.6,
    group: 'versicolor'
  }, {
    sepalLength: 5.4,
    sepalWidth: 3.0,
    petalLength: 4.5,
    petalWidth: 1.5,
    group: 'versicolor'
  }, {
    sepalLength: 6.0,
    sepalWidth: 3.4,
    petalLength: 4.5,
    petalWidth: 1.6,
    group: 'versicolor'
  }, {
    sepalLength: 6.7,
    sepalWidth: 3.1,
    petalLength: 4.7,
    petalWidth: 1.5,
    group: 'versicolor'
  }, {
    sepalLength: 6.3,
    sepalWidth: 2.3,
    petalLength: 4.4,
    petalWidth: 1.3,
    group: 'versicolor'
  }, {
    sepalLength: 5.6,
    sepalWidth: 3.0,
    petalLength: 4.1,
    petalWidth: 1.3,
    group: 'versicolor'
  }, {
    sepalLength: 5.5,
    sepalWidth: 2.5,
    petalLength: 4.0,
    petalWidth: 1.3,
    group: 'versicolor'
  }, {
    sepalLength: 5.5,
    sepalWidth: 2.6,
    petalLength: 4.4,
    petalWidth: 1.2,
    group: 'versicolor'
  }, {
    sepalLength: 6.1,
    sepalWidth: 3.0,
    petalLength: 4.6,
    petalWidth: 1.4,
    group: 'versicolor'
  }, {
    sepalLength: 5.8,
    sepalWidth: 2.6,
    petalLength: 4.0,
    petalWidth: 1.2,
    group: 'versicolor'
  }, {
    sepalLength: 5.0,
    sepalWidth: 2.3,
    petalLength: 3.3,
    petalWidth: 1.0,
    group: 'versicolor'
  }, {
    sepalLength: 5.6,
    sepalWidth: 2.7,
    petalLength: 4.2,
    petalWidth: 1.3,
    group: 'versicolor'
  }, {
    sepalLength: 5.7,
    sepalWidth: 3.0,
    petalLength: 4.2,
    petalWidth: 1.2,
    group: 'versicolor'
  }, {
    sepalLength: 5.7,
    sepalWidth: 2.9,
    petalLength: 4.2,
    petalWidth: 1.3,
    group: 'versicolor'
  }, {
    sepalLength: 6.2,
    sepalWidth: 2.9,
    petalLength: 4.3,
    petalWidth: 1.3,
    group: 'versicolor'
  }, {
    sepalLength: 5.1,
    sepalWidth: 2.5,
    petalLength: 3.0,
    petalWidth: 1.1,
    group: 'versicolor'
  }, {
    sepalLength: 5.7,
    sepalWidth: 2.8,
    petalLength: 4.1,
    petalWidth: 1.3,
    group: 'versicolor'
  }, {
    sepalLength: 6.3,
    sepalWidth: 3.3,
    petalLength: 6.0,
    petalWidth: 2.5,
    group: 'virginica'
  }, {
    sepalLength: 5.8,
    sepalWidth: 2.7,
    petalLength: 5.1,
    petalWidth: 1.9,
    group: 'virginica'
  }, {
    sepalLength: 7.1,
    sepalWidth: 3.0,
    petalLength: 5.9,
    petalWidth: 2.1,
    group: 'virginica'
  }, {
    sepalLength: 6.3,
    sepalWidth: 2.9,
    petalLength: 5.6,
    petalWidth: 1.8,
    group: 'virginica'
  }, {
    sepalLength: 6.5,
    sepalWidth: 3.0,
    petalLength: 5.8,
    petalWidth: 2.2,
    group: 'virginica'
  }, {
    sepalLength: 7.6,
    sepalWidth: 3.0,
    petalLength: 6.6,
    petalWidth: 2.1,
    group: 'virginica'
  }, {
    sepalLength: 4.9,
    sepalWidth: 2.5,
    petalLength: 4.5,
    petalWidth: 1.7,
    group: 'virginica'
  }, {
    sepalLength: 7.3,
    sepalWidth: 2.9,
    petalLength: 6.3,
    petalWidth: 1.8,
    group: 'virginica'
  }, {
    sepalLength: 6.7,
    sepalWidth: 2.5,
    petalLength: 5.8,
    petalWidth: 1.8,
    group: 'virginica'
  }, {
    sepalLength: 7.2,
    sepalWidth: 3.6,
    petalLength: 6.1,
    petalWidth: 2.5,
    group: 'virginica'
  }, {
    sepalLength: 6.5,
    sepalWidth: 3.2,
    petalLength: 5.1,
    petalWidth: 2.0,
    group: 'virginica'
  }, {
    sepalLength: 6.4,
    sepalWidth: 2.7,
    petalLength: 5.3,
    petalWidth: 1.9,
    group: 'virginica'
  }, {
    sepalLength: 6.8,
    sepalWidth: 3.0,
    petalLength: 5.5,
    petalWidth: 2.1,
    group: 'virginica'
  }, {
    sepalLength: 5.7,
    sepalWidth: 2.5,
    petalLength: 5.0,
    petalWidth: 2.0,
    group: 'virginica'
  }, {
    sepalLength: 5.8,
    sepalWidth: 2.8,
    petalLength: 5.1,
    petalWidth: 2.4,
    group: 'virginica'
  }, {
    sepalLength: 6.4,
    sepalWidth: 3.2,
    petalLength: 5.3,
    petalWidth: 2.3,
    group: 'virginica'
  }, {
    sepalLength: 6.5,
    sepalWidth: 3.0,
    petalLength: 5.5,
    petalWidth: 1.8,
    group: 'virginica'
  }, {
    sepalLength: 7.7,
    sepalWidth: 3.8,
    petalLength: 6.7,
    petalWidth: 2.2,
    group: 'virginica'
  }, {
    sepalLength: 7.7,
    sepalWidth: 2.6,
    petalLength: 6.9,
    petalWidth: 2.3,
    group: 'virginica'
  }, {
    sepalLength: 6.0,
    sepalWidth: 2.2,
    petalLength: 5.0,
    petalWidth: 1.5,
    group: 'virginica'
  }, {
    sepalLength: 6.9,
    sepalWidth: 3.2,
    petalLength: 5.7,
    petalWidth: 2.3,
    group: 'virginica'
  }, {
    sepalLength: 5.6,
    sepalWidth: 2.8,
    petalLength: 4.9,
    petalWidth: 2.0,
    group: 'virginica'
  }, {
    sepalLength: 7.7,
    sepalWidth: 2.8,
    petalLength: 6.7,
    petalWidth: 2.0,
    group: 'virginica'
  }, {
    sepalLength: 6.3,
    sepalWidth: 2.7,
    petalLength: 4.9,
    petalWidth: 1.8,
    group: 'virginica'
  }, {
    sepalLength: 6.7,
    sepalWidth: 3.3,
    petalLength: 5.7,
    petalWidth: 2.1,
    group: 'virginica'
  }, {
    sepalLength: 7.2,
    sepalWidth: 3.2,
    petalLength: 6.0,
    petalWidth: 1.8,
    group: 'virginica'
  }, {
    sepalLength: 6.2,
    sepalWidth: 2.8,
    petalLength: 4.8,
    petalWidth: 1.8,
    group: 'virginica'
  }, {
    sepalLength: 6.1,
    sepalWidth: 3.0,
    petalLength: 4.9,
    petalWidth: 1.8,
    group: 'virginica'
  }, {
    sepalLength: 6.4,
    sepalWidth: 2.8,
    petalLength: 5.6,
    petalWidth: 2.1,
    group: 'virginica'
  }, {
    sepalLength: 7.2,
    sepalWidth: 3.0,
    petalLength: 5.8,
    petalWidth: 1.6,
    group: 'virginica'
  }, {
    sepalLength: 7.4,
    sepalWidth: 2.8,
    petalLength: 6.1,
    petalWidth: 1.9,
    group: 'virginica'
  }, {
    sepalLength: 7.9,
    sepalWidth: 3.8,
    petalLength: 6.4,
    petalWidth: 2.0,
    group: 'virginica'
  }, {
    sepalLength: 6.4,
    sepalWidth: 2.8,
    petalLength: 5.6,
    petalWidth: 2.2,
    group: 'virginica'
  }, {
    sepalLength: 6.3,
    sepalWidth: 2.8,
    petalLength: 5.1,
    petalWidth: 1.5,
    group: 'virginica'
  }, {
    sepalLength: 6.1,
    sepalWidth: 2.6,
    petalLength: 5.6,
    petalWidth: 1.4,
    group: 'virginica'
  }, {
    sepalLength: 7.7,
    sepalWidth: 3.0,
    petalLength: 6.1,
    petalWidth: 2.3,
    group: 'virginica'
  }, {
    sepalLength: 6.3,
    sepalWidth: 3.4,
    petalLength: 5.6,
    petalWidth: 2.4,
    group: 'virginica'
  }, {
    sepalLength: 6.4,
    sepalWidth: 3.1,
    petalLength: 5.5,
    petalWidth: 1.8,
    group: 'virginica'
  }, {
    sepalLength: 6.0,
    sepalWidth: 3.0,
    petalLength: 4.8,
    petalWidth: 1.8,
    group: 'virginica'
  }, {
    sepalLength: 6.9,
    sepalWidth: 3.1,
    petalLength: 5.4,
    petalWidth: 2.1,
    group: 'virginica'
  }, {
    sepalLength: 6.7,
    sepalWidth: 3.1,
    petalLength: 5.6,
    petalWidth: 2.4,
    group: 'virginica'
  }, {
    sepalLength: 6.9,
    sepalWidth: 3.1,
    petalLength: 5.1,
    petalWidth: 2.3,
    group: 'virginica'
  }, {
    sepalLength: 5.8,
    sepalWidth: 2.7,
    petalLength: 5.1,
    petalWidth: 1.9,
    group: 'virginica'
  }, {
    sepalLength: 6.8,
    sepalWidth: 3.2,
    petalLength: 5.9,
    petalWidth: 2.3,
    group: 'virginica'
  }, {
    sepalLength: 6.7,
    sepalWidth: 3.3,
    petalLength: 5.7,
    petalWidth: 2.5,
    group: 'virginica'
  }, {
    sepalLength: 6.7,
    sepalWidth: 3.0,
    petalLength: 5.2,
    petalWidth: 2.3,
    group: 'virginica'
  }, {
    sepalLength: 6.3,
    sepalWidth: 2.5,
    petalLength: 5.0,
    petalWidth: 1.9,
    group: 'virginica'
  }, {
    sepalLength: 6.5,
    sepalWidth: 3.0,
    petalLength: 5.2,
    petalWidth: 2.0,
    group: 'virginica'
  }, {
    sepalLength: 6.2,
    sepalWidth: 3.4,
    petalLength: 5.4,
    petalWidth: 2.3,
    group: 'virginica'
  }, {
    sepalLength: 5.9,
    sepalWidth: 3.0,
    petalLength: 5.1,
    petalWidth: 1.8,
    group: 'virginica'
  }
];


})();

(function() {


App.data.groupedMoney = [
  {
    group: "Cash",
    xValue: 0.0915981001931350,
    yValue: 0.0804410390131541
  }, {
    group: "Investment Grade",
    xValue: -0.012867651474625,
    yValue: 0.0512250395861894
  }, {
    group: "High Yield",
    xValue: 0.1146312318222022,
    yValue: 0.2163129187250687
  }, {
    group: "Value",
    xValue: 0.6374091269925063,
    yValue: 0.10074171943564902
  }, {
    group: "Growth",
    xValue: -0.2947777704540345,
    yValue: 0.24950077509252144
  }, {
    group: "Directional",
    xValue: 0.02987519458727168,
    yValue: 0.029635401795167875
  }, {
    group: "Relative Value",
    xValue: -0.09569219640756767,
    yValue: 0.009220157989642461
  }, {
    group: "Tactical",
    xValue: 0.10008114769529128,
    yValue: 0.05765241751521731
  }, {
    group: "Agriculture",
    xValue: -0.37607356395333114,
    yValue: 0.034742737850069066
  }, {
    group: "Art",
    xValue: 3.3197211825930815,
    yValue: 0.13789386518401808
  }, {
    group: "Buyout",
    xValue: 0.019197687785704524,
    yValue: 0.29156199641011393
  }, {
    group: "Energy",
    xValue: 0.026160853602207837,
    yValue: 0.04422240117969545
  }, {
    group: "Industrial Metals",
    xValue: -0.4336241324616037,
    yValue: -0.1212570493221228
  }, {
    group: "Municipal Bonds",
    xValue: 0.21108601344106037,
    yValue: 0.060125232218492954
  }, {
    group: "Precious Metals",
    xValue: -0.40681455559410074,
    yValue: -0.1684063268162467
  }, {
    group: "Real Estate",
    xValue: -0.25926052510725767,
    yValue: -0.07375676387763123
  }, {
    group: "Venture",
    xValue: -0.09699806589049279,
    yValue: -0.049638457268871825
  }
];


})();

(function() {


App.data.groupedPercent = [
  {
    group: "Energy",
    xValue: 0.017,
    yValue: 0.03
  }, {
    group: "Energy",
    xValue: 0.044,
    yValue: 0.048
  }, {
    group: "Energy",
    xValue: 0.005,
    yValue: 0.01,
    group: "Industrial Metals",
    xValue: -0.28,
    yValue: -0.08
  }, {
    group: "Industrial Metals",
    xValue: -0.90,
    yValue: -0.08
  }, {
    group: "Industrial Metals",
    xValue: -0.44,
    yValue: -0.16
  }, {
    group: "Municipal Bonds",
    xValue: 0.14,
    yValue: 0.04
  }, {
    group: "Municipal Bonds",
    xValue: 0.24,
    yValue: 0.83
  }, {
    group: "Municipal Bonds",
    xValue: 0.39,
    yValue: 0.48
  }, {
    group: "Precious Metals",
    xValue: -0.12,
    yValue: -0.22
  }, {
    group: "Precious Metals",
    xValue: -0.09,
    yValue: -0.70
  }, {
    group: "Precious Metals",
    xValue: -0.70,
    yValue: -0.88
  }, {
    group: "Real Estate",
    xValue: -0.28,
    yValue: -0.91
  }, {
    group: "Real Estate",
    xValue: -0.40,
    yValue: -0.71
  }, {
    group: "Real Estate",
    xValue: -0.35,
    yValue: -0.17
  }, {
    group: "Venture",
    xValue: -0.46,
    yValue: -0.30
  }, {
    group: "Venture",
    xValue: -0.65,
    yValue: -0.92
  }, {
    group: "Venture",
    xValue: -0.37,
    yValue: -0.30
  }
];


})();

(function() {


App.data.ungroupedMoney = [
  {
    xValue: 0.0915981001931350,
    yValue: 0.0804410390131541
  }, {
    xValue: -0.012867651474625,
    yValue: 0.0512250395861894
  }, {
    xValue: 0.1146312318222022,
    yValue: 0.2163129187250687
  }, {
    xValue: 0.6374091269925063,
    yValue: 0.10074171943564902
  }, {
    xValue: -0.2947777704540345,
    yValue: 0.24950077509252144
  }, {
    xValue: 0.02987519458727168,
    yValue: 0.029635401795167875
  }, {
    xValue: -0.09569219640756767,
    yValue: 0.009220157989642461
  }, {
    xValue: 0.10008114769529128,
    yValue: 0.05765241751521731
  }, {
    xValue: -0.37607356395333114,
    yValue: 0.034742737850069066
  }, {
    xValue: 3.3197211825930815,
    yValue: 0.13789386518401808
  }, {
    xValue: 0.019197687785704524,
    yValue: 0.29156199641011393
  }, {
    xValue: 0.026160853602207837,
    yValue: 0.04422240117969545
  }, {
    xValue: -0.4336241324616037,
    yValue: -0.1212570493221228
  }, {
    xValue: 0.21108601344106037,
    yValue: 0.060125232218492954
  }, {
    xValue: -0.40681455559410074,
    yValue: -0.1684063268162467
  }, {
    xValue: -0.25926052510725767,
    yValue: -0.07375676387763123
  }, {
    xValue: -0.09699806589049279,
    yValue: -0.049638457268871825
  }
];


})();

(function() {


App.data.ungroupedPercent = [
  {
    xValue: 0.017440569068138557,
    yValue: 0.029481600786463634
  }, {
    xValue: -0.28908275497440244,
    yValue: -0.08083803288141521
  }, {
    xValue: 0.14072400896070691,
    yValue: 0.04008348814566197
  }, {
    xValue: -0.2712097037294005,
    yValue: -0.11227088454416446
  }, {
    xValue: -0.1728403500715051,
    yValue: -0.04917117591842082
  }, {
    xValue: -0.06466537726032852,
    yValue: -0.03309230484591455
  }
];


})();

(function() {


App.data.groupedZero = [
  {
    group: "Cash",
    xValue: 0,
    yValue: 0
  }
];


})();

(function() {


App.data.groupedZeroes = [
  {
    group: "Energy",
    xValue: 0,
    yValue: 0
  }, {
    group: "Industrial Metals",
    xValue: 0,
    yValue: 0
  }, {
    group: "Municipal Bonds",
    xValue: 0,
    yValue: 0
  }, {
    group: "Precious Metals",
    xValue: 0,
    yValue: 0
  }, {
    group: "Real Estate",
    xValue: 0,
    yValue: 0
  }, {
    group: "Venture",
    xValue: 0,
    yValue: 0
  }
];


})();

(function() {


App.data.ungroupedZero = [
  {
    xValue: 0,
    yValue: 0
  }
];


})();

(function() {


App.data.ungroupedZeroes = [
  {
    xValue: 0,
    yValue: 0
  }, {
    xValue: 0,
    yValue: 0
  }, {
    xValue: 0,
    yValue: 0
  }, {
    xValue: 0,
    yValue: 0
  }, {
    xValue: 0,
    yValue: 0
  }, {
    xValue: 0,
    yValue: 0
  }
];


})();

(function() {


App.data.daily_curr_value = [
  {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 43642.83058384
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 43682.88915361
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 44073.26541992
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 43960.89079724
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 43830.11730889
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 43836.09425964
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 43836.98702062
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 43810.160309985
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 43845.01459874
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 43834.58089744
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 43946.88897166
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 44008.05339702
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 44002.03240921
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 44002.92517018
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 43883.751494944
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 43787.478592515
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 43800.91393495
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 43847.45659791
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 43806.06566759
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 43761.361287594
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 43760.77428893
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 43753.75257796
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 43797.0534512
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 43903.166108675
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 43528.911187135
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 43528.5087995
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 43536.43765646
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 43535.151219256
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 43593.26305722
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 43605.73629416
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 43467.68957965
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 42771.6341555
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 42952.52450345
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 42949.3252776
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 42965.12680685
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 42788.365361154
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 42999.018564746
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 42984.25380657
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 43092.03838536
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 43239.54054056
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 43251.102895156
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 43266.851351626
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 43198.25866338
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 43127.899708465
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 43092.78262602
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 43059.753658235
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 43031.82903179
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 43039.052389316
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 43028.129793495
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 42949.12505133
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 42969.85994651
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 41166.50141647
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 40973.68578022
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 41144.59044995
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 41103.62357324
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 41089.28626931
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 40810.757803045
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 40960.365781054
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 40990.341687664
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 41038.33765783
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 41123.78119157
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 41122.26395758
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 41111.862666905
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 41105.36785514
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 41338.68798077
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 41318.38568769
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 41288.000519715
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 41394.8935722
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 41327.87259761
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 41389.726178005
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 41304.35617159
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 41339.87327992
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 41494.74761456
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 41560.61293533
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 41503.2480122
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 41530.226376854
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 41497.11765335
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 41446.59964011
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 41502.52936411
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 41524.3780276
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 41671.35545982
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 41669.92976583
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 41720.179477125
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 41628.44929372
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 41587.2875385
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 41523.13958358
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 41581.906624086
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 41559.74815625
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 41587.646175556
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 41603.58765722
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 41396.90719793
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 41383.563815154
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 41192.78391157
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 41253.35731214
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 41317.76603217
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 41323.089508615
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 41243.78152139
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 41291.290488206
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 41339.92400218
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 41546.78601642
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 41603.411002316
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 41559.51486835
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 41482.91847159
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 41480.73691452
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 41139.44190527
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 41322.227731675
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 41058.799596176
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 39228.076058425
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 39323.23871247
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 39268.47259191
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 39253.67428885
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 39350.86202348
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 39497.54428209
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 39529.82300201
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 39695.87041424
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 39856.110916235
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 39904.348645695
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 39911.55678164
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 40117.15288461
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 40302.42957168
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 40154.01754071
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 40334.40355735
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 40417.538894475
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 40378.92107112
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 40323.981287375
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 40406.30461705
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 40468.537492536
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 40571.28189174
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 40486.976005994
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 40497.55562255
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 40470.31212439
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 40452.748340756
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 40407.250740774
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 40384.5789883
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 40339.10700085
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 40344.09590606
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 40393.32096114
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 40398.06808723
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 40375.67488961
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 40511.88696648
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 40458.99458108
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 40252.87627769
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 40265.55702015
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 40224.564452775
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 40257.45817048
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 40232.16724148
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 40212.897360876
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 40206.02274663
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 40134.19722524
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 40249.289020866
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 40165.45544968
  }
];


})();

(function() {


App.data.daily_diff_value = [
  {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 18906.16756396448
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: -81.88174493145198
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 7668.285394726423
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 15691.573969392295
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: -1243.3329588975612
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 150.9883430309419
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 150.98834303101467
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 3689.3975359826
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 10854.617944980855
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 4221.853159514663
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: -1382.8924349151202
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 5151.497854198984
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 150.98834303101467
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 150.9883430309419
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 5120.705077310005
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 80.42882321364596
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: -6983.5249100778165
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 5546.2193753881875
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 688.5232226108928
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 150.9883430310001
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 150.98834303098556
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 150.98834303101467
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 4771.750015606653
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 2638.7290240126313
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: -252.40349297580542
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: -5975.353242993122
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 150.98834303098556
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 150.98834303101467
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: -224.51826106346562
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: -3561.299739448281
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: -39114.1846980103
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: -3004.8070567730756
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 28985.222029993594
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 36067.782601640836
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 7155.540864258626
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 3057.082481897334
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 9664.343976292163
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 11024.042183886828
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: -797.6062488996395
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 4467.015623335843
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: -8102.584347467637
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 6475.629164514845
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: -21996.487195635695
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 13746.431262874983
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: -11544.579075738497
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 674.0534342490428
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 8459.229323447551
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 385.55776789825177
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: -5088.592449003729
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: -23980.954232565433
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 1372.8150626712304
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 6108.621223123395
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 16456.03568351795
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 8366.808915380025
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 10756.771081393024
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: -5709.3196025346115
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 10562.990618457698
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 24530.336438635946
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: -27543.33353726998
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: -1099.3193060211197
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 17097.428197102134
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 18351.182142015394
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: -5438.5816175941145
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: -9558.039562293416
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 15512.563818356211
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 8103.972861559683
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: -8492.926687262589
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 16032.787471600474
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: -8636.367249113493
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: -3923.3282271965727
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 27558.901286512417
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: -8705.786753859968
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 32941.58219245359
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: -22106.61887991907
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: -26592.962443980345
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 22832.930084342064
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: -9824.212130601038
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 957.148549634454
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: -9332.370146249305
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 23931.53615016558
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: -15369.811860782225
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: -9955.107717556384
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 22876.97326221357
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: -8532.068986779967
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: -26959.255535770062
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: -1244.3926144636644
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 10428.230410374264
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: -22909.64924169406
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 12361.617305379717
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 104.8117882328952
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: -12502.644985674444
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: -930.2052741374646
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 5911.677521090285
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 20545.486079551818
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 15608.459637649365
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: -17964.441301195344
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: -35712.85293745024
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: -8607.209423272929
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 18938.579405832585
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: -5055.500731702035
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 18373.76768190589
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: -6790.677214091236
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: -25256.280052292146
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: -677.7283875108551
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 13545.795997831388
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: -12843.324625216599
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 16790.31713535499
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: -7952.210730611085
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 16784.313202745332
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: -7085.6005088222155
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: -6789.8251549821725
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 2867.3024208504503
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 2803.8109605529608
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: -2940.638707620252
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 5737.473281129394
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 18063.757233058226
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 17440.711890732295
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 3338.13229386523
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 3595.0493101803877
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 25645.52165084405
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: -9263.596851021866
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 20140.807651176103
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: -19444.1026413145
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: -25864.47356295507
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: -27130.587600514264
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 2290.1152453525283
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 11163.488250262504
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 14024.090751272808
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: -2739.41582625256
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 22899.75389957903
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 1056.0803715038783
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: -8035.210168191756
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: -6662.088046967197
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: -7823.643528741202
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 24079.296314467385
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: -5079.715034555891
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: -1003.3710055832489
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 19244.788471372587
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: -10607.682577451182
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 14625.514709651085
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: -8085.676308046008
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: -20605.36478831657
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 24204.288403731953
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: -21038.928193213796
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 9453.792172169735
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: -11270.94202436485
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: -7654.1761879601545
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: -8174.0433713275415
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: -9504.156427265232
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: -9769.160472144315
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 11718.60614444795
  }
];


})();

(function() {


App.data.daily_two_series = [
  {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 63642.83058384
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 63682.88915361
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 64073.26541992
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 63960.89079724
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 63830.11730889
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 63836.09425964
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 63836.98702062
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 63810.160309985
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 63845.01459874
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 63834.58089744
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 63946.88897166
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 64008.05339702
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 64002.03240921
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 64002.92517018
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 63883.751494944
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 63787.478592515
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 63800.91393495
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 63847.45659791
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 63806.06566759
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 63761.361287594
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 63760.77428893
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 63753.75257796
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 63797.0534512
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 63903.166108675
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 63528.911187135
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 63528.5087995
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 63536.43765646
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 63535.151219256
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 63593.26305722
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 63605.73629416
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 63467.68957965
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 62771.6341555
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 62952.52450345
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 62949.3252776
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 62965.12680685
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 62788.365361154
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 62999.018564746
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 62984.25380657
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 63092.03838536
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 63239.54054056
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 63251.102895156
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 63266.851351626
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 63198.25866338
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 63127.899708465
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 63092.78262602
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 63059.753658235
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 63031.82903179
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 63039.052389316
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 63028.129793495
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 62949.12505133
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 62969.85994651
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 61166.50141647
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 60973.68578022
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 61144.59044995
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 61103.62357324
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 61089.28626931
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 60810.757803045
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 60960.365781054
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 60990.341687664
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 61038.33765783
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 61123.78119157
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 61122.26395758
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 61111.862666905
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 61105.36785514
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 61338.68798077
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 61318.38568769
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 61288.000519715
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 61394.8935722
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 61327.87259761
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 61389.726178005
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 61304.35617159
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 61339.87327992
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 61494.74761456
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 61560.61293533
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 61503.2480122
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 61530.226376854
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 61497.11765335
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 61446.59964011
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 61502.52936411
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 61524.3780276
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 61671.35545982
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 61669.92976583
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 61720.179477125
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 61628.44929372
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 61587.2875385
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 61523.13958358
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 61581.906624086
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 61559.74815625
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 61587.646175556
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 61603.58765722
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 61396.90719793
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 61383.563815154
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 61192.78391157
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 61253.35731214
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 61317.76603217
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 61323.089508615
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 61243.78152139
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 61291.290488206
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 61339.92400218
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 61546.78601642
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 61603.411002316
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 61559.51486835
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 61482.91847159
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 61480.73691452
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 61139.44190527
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 61322.227731675
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 61058.799596176
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 59228.076058425
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 59323.23871247
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 59268.47259191
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 59253.67428885
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 59350.86202348
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 59497.54428209
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 59529.82300201
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 59695.87041424
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 59856.110916235
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 59904.348645695
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 59911.55678164
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 60117.15288461
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 60302.42957168
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 60154.01754071
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 60334.40355735
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 60417.538894475
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 60378.92107112
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 60323.981287375
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 60406.30461705
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 60468.537492536
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 60571.28189174
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 60486.976005994
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 60497.55562255
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 60470.31212439
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 60452.748340756
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 60407.250740774
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 60384.5789883
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 60339.10700085
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 60344.09590606
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 60393.32096114
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 60398.06808723
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 60375.67488961
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 60511.88696648
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 60458.99458108
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 60252.87627769
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 60265.55702015
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 60224.564452775
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 60257.45817048
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 60232.16724148
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 60212.897360876
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 60206.02274663
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 60134.19722524
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 60249.289020866
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 60165.45544968
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 73642.83058384
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 73682.88915361
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 74073.26541992
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 73960.89079724
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 73830.11730889
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 73836.09425964
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 73836.98702062
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 73810.160309985
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 73845.01459874
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 73834.58089744
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 73946.88897166
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 74008.05339702
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 74002.03240921
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 74002.92517018
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 73883.751494944
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 73787.478592515
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 73800.91393495
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 73847.45659791
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 73806.06566759
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 73761.361287594
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 73760.77428893
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 73753.75257796
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 73797.0534512
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 73903.166108675
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 73528.911187135
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 73528.5087995
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 73536.43765646
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 73535.151219256
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 73593.26305722
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 73605.73629416
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 73467.68957965
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 72771.6341555
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 72952.52450345
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 72949.3252776
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 72965.12680685
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 72788.365361154
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 72999.018564746
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 72984.25380657
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 73092.03838536
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 73239.54054056
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 73251.102895156
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 73266.851351626
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 73198.25866338
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 73127.899708465
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 73092.78262602
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 73059.753658235
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 73031.82903179
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 73039.052389316
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 73028.129793495
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 72949.12505133
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 72969.85994651
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 71166.50141647
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 70973.68578022
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 71144.59044995
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 71103.62357324
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 71089.28626931
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 70810.757803045
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 70960.365781054
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 70990.341687664
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 71038.33765783
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 71123.78119157
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 71122.26395758
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 71111.862666905
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 71105.36785514
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 71338.68798077
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 71318.38568769
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 71288.000519715
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 71394.8935722
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 71327.87259761
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 71389.726178005
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 71304.35617159
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 71339.87327992
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 71494.74761456
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 71560.61293533
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 71503.2480122
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 71530.226376854
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 71497.11765335
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 71446.59964011
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 71502.52936411
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 71524.3780276
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 71671.35545982
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 71669.92976583
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 71720.179477125
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 71628.44929372
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 71587.2875385
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 71523.13958358
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 71581.906624086
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 71559.74815625
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 71587.646175556
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 71603.58765722
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 71396.90719793
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 71383.563815154
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 71192.78391157
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 71253.35731214
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 71317.76603217
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 71323.089508615
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 71243.78152139
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 71291.290488206
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 71339.92400218
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 71546.78601642
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 71603.411002316
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 71559.51486835
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 71482.91847159
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 71480.73691452
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 71139.44190527
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 71322.227731675
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 71058.799596176
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 69228.076058425
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 69323.23871247
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 69268.47259191
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 69253.67428885
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 69350.86202348
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 69497.54428209
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 69529.82300201
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 69695.87041424
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 69856.110916235
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 69904.348645695
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 69911.55678164
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 70117.15288461
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 70302.42957168
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 70154.01754071
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 70334.40355735
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 70417.538894475
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 70378.92107112
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 70323.981287375
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 70406.30461705
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 70468.537492536
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 70571.28189174
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 70486.976005994
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 70497.55562255
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 70470.31212439
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 70452.748340756
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 70407.250740774
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 70384.5789883
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 70339.10700085
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 70344.09590606
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 70393.32096114
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 70398.06808723
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 70375.67488961
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 70511.88696648
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 70458.99458108
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 70252.87627769
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 70265.55702015
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 70224.564452775
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 70257.45817048
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 70232.16724148
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 70212.897360876
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 70206.02274663
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 70134.19722524
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 70249.289020866
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 70165.45544968
  }
];


})();

(function() {


App.data.daily_three_series = [
  {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 43642.83058384
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 43682.88915361
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 44073.26541992
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 43960.89079724
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 43830.11730889
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 43836.09425964
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 43836.98702062
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 43810.160309985
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 43845.01459874
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 43834.58089744
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 43946.88897166
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 44008.05339702
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 44002.03240921
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 44002.92517018
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 43883.751494944
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 43787.478592515
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 43800.91393495
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 43847.45659791
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 43806.06566759
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 43761.361287594
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 43760.77428893
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 43753.75257796
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 43797.0534512
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 43903.166108675
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 43528.911187135
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 43528.5087995
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 43536.43765646
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 43535.151219256
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 43593.26305722
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 43605.73629416
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 43467.68957965
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 42771.6341555
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 42952.52450345
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 42949.3252776
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 42965.12680685
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 42788.365361154
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 42999.018564746
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 42984.25380657
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 43092.03838536
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 43239.54054056
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 43251.102895156
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 43266.851351626
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 43198.25866338
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 43127.899708465
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 43092.78262602
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 43059.753658235
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 43031.82903179
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 43039.052389316
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 43028.129793495
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 42949.12505133
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 42969.85994651
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 41166.50141647
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 40973.68578022
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 41144.59044995
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 41103.62357324
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 41089.28626931
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 40810.757803045
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 40960.365781054
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 40990.341687664
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 41038.33765783
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 41123.78119157
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 41122.26395758
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 41111.862666905
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 41105.36785514
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 41338.68798077
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 41318.38568769
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 41288.000519715
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 41394.8935722
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 41327.87259761
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 41389.726178005
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 41304.35617159
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 41339.87327992
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 41494.74761456
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 41560.61293533
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 41503.2480122
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 41530.226376854
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 41497.11765335
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 41446.59964011
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 41502.52936411
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 41524.3780276
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 41671.35545982
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 41669.92976583
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 41720.179477125
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 41628.44929372
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 41587.2875385
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 41523.13958358
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 41581.906624086
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 41559.74815625
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 41587.646175556
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 41603.58765722
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 41396.90719793
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 41383.563815154
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 41192.78391157
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 41253.35731214
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 41317.76603217
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 41323.089508615
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 41243.78152139
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 41291.290488206
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 41339.92400218
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 41546.78601642
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 41603.411002316
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 41559.51486835
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 41482.91847159
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 41480.73691452
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 41139.44190527
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 41322.227731675
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 41058.799596176
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 39228.076058425
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 39323.23871247
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 39268.47259191
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 39253.67428885
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 39350.86202348
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 39497.54428209
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 39529.82300201
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 39695.87041424
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 39856.110916235
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 39904.348645695
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 39911.55678164
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 40117.15288461
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 40302.42957168
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 40154.01754071
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 40334.40355735
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 40417.538894475
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 40378.92107112
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 40323.981287375
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 40406.30461705
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 40468.537492536
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 40571.28189174
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 40486.976005994
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 40497.55562255
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 40470.31212439
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 40452.748340756
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 40407.250740774
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 40384.5789883
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 40339.10700085
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 40344.09590606
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 40393.32096114
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 40398.06808723
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 40375.67488961
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 40511.88696648
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 40458.99458108
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 40252.87627769
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 40265.55702015
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 40224.564452775
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 40257.45817048
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 40232.16724148
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 40212.897360876
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 40206.02274663
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 40134.19722524
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 40249.289020866
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 40165.45544968
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 53642.83058384
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 53682.88915361
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 54073.26541992
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 53960.89079724
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 53830.11730889
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 53836.09425964
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 53836.98702062
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 53810.160309985
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 53845.01459874
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 53834.58089744
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 53946.88897166
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 54008.05339702
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 54002.03240921
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 54002.92517018
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 53883.751494944
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 53787.478592515
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 53800.91393495
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 53847.45659791
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 53806.06566759
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 53761.361287594
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 53760.77428893
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 53753.75257796
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 53797.0534512
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 53903.166108675
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 53528.911187135
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 53528.5087995
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 53536.43765646
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 53535.151219256
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 53593.26305722
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 53605.73629416
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 53467.68957965
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 52771.6341555
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 52952.52450345
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 52949.3252776
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 52965.12680685
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 52788.365361154
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 52999.018564746
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 52984.25380657
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 53092.03838536
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 53239.54054056
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 53251.102895156
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 53266.851351626
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 53198.25866338
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 53127.899708465
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 53092.78262602
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 53059.753658235
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 53031.82903179
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 53039.052389316
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 53028.129793495
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 52949.12505133
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 52969.85994651
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 51166.50141647
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 50973.68578022
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 51144.59044995
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 51103.62357324
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 51089.28626931
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 50810.757803045
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 50960.365781054
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 50990.341687664
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 51038.33765783
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 51123.78119157
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 51122.26395758
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 51111.862666905
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 51105.36785514
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 51338.68798077
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 51318.38568769
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 51288.000519715
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 51394.8935722
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 51327.87259761
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 51389.726178005
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 51304.35617159
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 51339.87327992
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 51494.74761456
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 51560.61293533
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 51503.2480122
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 51530.226376854
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 51497.11765335
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 51446.59964011
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 51502.52936411
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 51524.3780276
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 51671.35545982
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 51669.92976583
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 51720.179477125
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 51628.44929372
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 51587.2875385
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 51523.13958358
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 51581.906624086
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 51559.74815625
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 51587.646175556
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 51603.58765722
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 51396.90719793
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 51383.563815154
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 51192.78391157
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 51253.35731214
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 51317.76603217
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 51323.089508615
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 51243.78152139
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 51291.290488206
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 51339.92400218
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 51546.78601642
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 51603.411002316
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 51559.51486835
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 51482.91847159
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 51480.73691452
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 51139.44190527
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 51322.227731675
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 51058.799596176
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 49228.076058425
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 49323.23871247
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 49268.47259191
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 49253.67428885
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 49350.86202348
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 49497.54428209
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 49529.82300201
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 49695.87041424
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 49856.110916235
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 49904.348645695
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 49911.55678164
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 50117.15288461
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 50302.42957168
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 50154.01754071
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 50334.40355735
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 50417.538894475
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 50378.92107112
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 50323.981287375
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 50406.30461705
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 50468.537492536
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 50571.28189174
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 50486.976005994
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 50497.55562255
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 50470.31212439
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 50452.748340756
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 50407.250740774
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 50384.5789883
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 50339.10700085
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 50344.09590606
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 50393.32096114
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 50398.06808723
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 50375.67488961
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 50511.88696648
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 50458.99458108
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 50252.87627769
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 50265.55702015
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 50224.564452775
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 50257.45817048
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 50232.16724148
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 50212.897360876
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 50206.02274663
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 50134.19722524
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 50249.289020866
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 50165.45544968
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 63642.83058384
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 63682.88915361
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 64073.26541992
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 63960.89079724
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 63830.11730889
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 63836.09425964
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 63836.98702062
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 63810.160309985
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 63845.01459874
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 63834.58089744
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 63946.88897166
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 64008.05339702
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 64002.03240921
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 64002.92517018
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 63883.751494944
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 63787.478592515
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 63800.91393495
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 63847.45659791
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 63806.06566759
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 63761.361287594
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 63760.77428893
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 63753.75257796
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 63797.0534512
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 63903.166108675
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 63528.911187135
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 63528.5087995
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 63536.43765646
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 63535.151219256
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 63593.26305722
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 63605.73629416
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 63467.68957965
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 62771.6341555
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 62952.52450345
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 62949.3252776
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 62965.12680685
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 62788.365361154
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 62999.018564746
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 62984.25380657
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 63092.03838536
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 63239.54054056
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 63251.102895156
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 63266.851351626
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 63198.25866338
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 63127.899708465
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 63092.78262602
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 63059.753658235
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 63031.82903179
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 63039.052389316
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 63028.129793495
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 62949.12505133
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 62969.85994651
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 61166.50141647
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 60973.68578022
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 61144.59044995
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 61103.62357324
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 61089.28626931
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 60810.757803045
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 60960.365781054
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 60990.341687664
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 61038.33765783
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 61123.78119157
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 61122.26395758
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 61111.862666905
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 61105.36785514
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 61338.68798077
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 61318.38568769
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 61288.000519715
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 61394.8935722
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 61327.87259761
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 61389.726178005
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 61304.35617159
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 61339.87327992
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 61494.74761456
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 61560.61293533
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 61503.2480122
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 61530.226376854
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 61497.11765335
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 61446.59964011
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 61502.52936411
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 61524.3780276
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 61671.35545982
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 61669.92976583
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 61720.179477125
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 61628.44929372
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 61587.2875385
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 61523.13958358
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 61581.906624086
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 61559.74815625
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 61587.646175556
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 61603.58765722
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 61396.90719793
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 61383.563815154
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 61192.78391157
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 61253.35731214
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 61317.76603217
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 61323.089508615
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 61243.78152139
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 61291.290488206
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 61339.92400218
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 61546.78601642
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 61603.411002316
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 61559.51486835
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 61482.91847159
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 61480.73691452
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 61139.44190527
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 61322.227731675
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 61058.799596176
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 59228.076058425
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 59323.23871247
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 59268.47259191
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 59253.67428885
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 59350.86202348
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 59497.54428209
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 59529.82300201
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 59695.87041424
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 59856.110916235
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 59904.348645695
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 59911.55678164
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 60117.15288461
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 60302.42957168
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 60154.01754071
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 60334.40355735
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 60417.538894475
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 60378.92107112
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 60323.981287375
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 60406.30461705
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 60468.537492536
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 60571.28189174
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 60486.976005994
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 60497.55562255
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 60470.31212439
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 60452.748340756
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 60407.250740774
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 60384.5789883
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 60339.10700085
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 60344.09590606
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 60393.32096114
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 60398.06808723
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 60375.67488961
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 60511.88696648
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 60458.99458108
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 60252.87627769
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 60265.55702015
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 60224.564452775
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 60257.45817048
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 60232.16724148
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 60212.897360876
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 60206.02274663
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 60134.19722524
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 60249.289020866
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 60165.45544968
  }
];


})();

(function() {


App.data.daily_four_series = [
  {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 43642.83058384
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 43682.88915361
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 44073.26541992
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 43960.89079724
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 43830.11730889
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 43836.09425964
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 43836.98702062
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 43810.160309985
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 43845.01459874
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 43834.58089744
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 43946.88897166
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 44008.05339702
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 44002.03240921
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 44002.92517018
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 43883.751494944
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 43787.478592515
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 43800.91393495
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 43847.45659791
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 43806.06566759
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 43761.361287594
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 43760.77428893
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 43753.75257796
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 43797.0534512
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 43903.166108675
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 43528.911187135
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 43528.5087995
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 43536.43765646
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 43535.151219256
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 43593.26305722
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 43605.73629416
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 43467.68957965
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 42771.6341555
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 42952.52450345
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 42949.3252776
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 42965.12680685
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 42788.365361154
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 42999.018564746
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 42984.25380657
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 43092.03838536
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 43239.54054056
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 43251.102895156
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 43266.851351626
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 43198.25866338
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 43127.899708465
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 43092.78262602
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 43059.753658235
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 43031.82903179
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 43039.052389316
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 43028.129793495
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 42949.12505133
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 42969.85994651
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 41166.50141647
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 40973.68578022
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 41144.59044995
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 41103.62357324
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 41089.28626931
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 40810.757803045
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 40960.365781054
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 40990.341687664
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 41038.33765783
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 41123.78119157
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 41122.26395758
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 41111.862666905
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 41105.36785514
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 41338.68798077
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 41318.38568769
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 41288.000519715
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 41394.8935722
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 41327.87259761
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 41389.726178005
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 41304.35617159
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 41339.87327992
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 41494.74761456
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 41560.61293533
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 41503.2480122
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 41530.226376854
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 41497.11765335
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 41446.59964011
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 41502.52936411
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 41524.3780276
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 41671.35545982
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 41669.92976583
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 41720.179477125
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 41628.44929372
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 41587.2875385
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 41523.13958358
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 41581.906624086
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 41559.74815625
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 41587.646175556
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 41603.58765722
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 41396.90719793
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 41383.563815154
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 41192.78391157
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 41253.35731214
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 41317.76603217
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 41323.089508615
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 41243.78152139
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 41291.290488206
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 41339.92400218
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 41546.78601642
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 41603.411002316
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 41559.51486835
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 41482.91847159
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 41480.73691452
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 41139.44190527
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 41322.227731675
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 41058.799596176
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 39228.076058425
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 39323.23871247
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 39268.47259191
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 39253.67428885
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 39350.86202348
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 39497.54428209
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 39529.82300201
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 39695.87041424
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 39856.110916235
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 39904.348645695
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 39911.55678164
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 40117.15288461
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 40302.42957168
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 40154.01754071
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 40334.40355735
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 40417.538894475
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 40378.92107112
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 40323.981287375
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 40406.30461705
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 40468.537492536
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 40571.28189174
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 40486.976005994
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 40497.55562255
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 40470.31212439
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 40452.748340756
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 40407.250740774
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 40384.5789883
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 40339.10700085
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 40344.09590606
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 40393.32096114
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 40398.06808723
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 40375.67488961
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 40511.88696648
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 40458.99458108
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 40252.87627769
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 40265.55702015
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 40224.564452775
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 40257.45817048
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 40232.16724148
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 40212.897360876
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 40206.02274663
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 40134.19722524
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 40249.289020866
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 40165.45544968
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 53642.83058384
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 53682.88915361
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 54073.26541992
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 53960.89079724
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 53830.11730889
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 53836.09425964
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 53836.98702062
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 53810.160309985
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 53845.01459874
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 53834.58089744
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 53946.88897166
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 54008.05339702
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 54002.03240921
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 54002.92517018
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 53883.751494944
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 53787.478592515
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 53800.91393495
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 53847.45659791
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 53806.06566759
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 53761.361287594
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 53760.77428893
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 53753.75257796
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 53797.0534512
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 53903.166108675
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 53528.911187135
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 53528.5087995
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 53536.43765646
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 53535.151219256
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 53593.26305722
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 53605.73629416
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 53467.68957965
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 52771.6341555
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 52952.52450345
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 52949.3252776
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 52965.12680685
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 52788.365361154
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 52999.018564746
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 52984.25380657
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 53092.03838536
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 53239.54054056
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 53251.102895156
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 53266.851351626
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 53198.25866338
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 53127.899708465
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 53092.78262602
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 53059.753658235
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 53031.82903179
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 53039.052389316
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 53028.129793495
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 52949.12505133
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 52969.85994651
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 51166.50141647
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 50973.68578022
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 51144.59044995
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 51103.62357324
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 51089.28626931
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 50810.757803045
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 50960.365781054
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 50990.341687664
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 51038.33765783
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 51123.78119157
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 51122.26395758
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 51111.862666905
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 51105.36785514
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 51338.68798077
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 51318.38568769
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 51288.000519715
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 51394.8935722
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 51327.87259761
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 51389.726178005
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 51304.35617159
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 51339.87327992
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 51494.74761456
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 51560.61293533
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 51503.2480122
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 51530.226376854
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 51497.11765335
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 51446.59964011
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 51502.52936411
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 51524.3780276
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 51671.35545982
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 51669.92976583
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 51720.179477125
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 51628.44929372
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 51587.2875385
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 51523.13958358
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 51581.906624086
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 51559.74815625
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 51587.646175556
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 51603.58765722
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 51396.90719793
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 51383.563815154
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 51192.78391157
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 51253.35731214
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 51317.76603217
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 51323.089508615
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 51243.78152139
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 51291.290488206
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 51339.92400218
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 51546.78601642
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 51603.411002316
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 51559.51486835
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 51482.91847159
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 51480.73691452
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 51139.44190527
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 51322.227731675
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 51058.799596176
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 49228.076058425
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 49323.23871247
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 49268.47259191
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 49253.67428885
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 49350.86202348
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 49497.54428209
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 49529.82300201
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 49695.87041424
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 49856.110916235
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 49904.348645695
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 49911.55678164
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 50117.15288461
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 50302.42957168
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 50154.01754071
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 50334.40355735
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 50417.538894475
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 50378.92107112
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 50323.981287375
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 50406.30461705
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 50468.537492536
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 50571.28189174
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 50486.976005994
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 50497.55562255
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 50470.31212439
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 50452.748340756
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 50407.250740774
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 50384.5789883
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 50339.10700085
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 50344.09590606
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 50393.32096114
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 50398.06808723
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 50375.67488961
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 50511.88696648
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 50458.99458108
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 50252.87627769
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 50265.55702015
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 50224.564452775
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 50257.45817048
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 50232.16724148
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 50212.897360876
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 50206.02274663
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 50134.19722524
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 50249.289020866
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 50165.45544968
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 63642.83058384
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 63682.88915361
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 64073.26541992
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 63960.89079724
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 63830.11730889
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 63836.09425964
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 63836.98702062
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 63810.160309985
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 63845.01459874
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 63834.58089744
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 63946.88897166
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 64008.05339702
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 64002.03240921
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 64002.92517018
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 63883.751494944
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 63787.478592515
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 63800.91393495
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 63847.45659791
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 63806.06566759
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 63761.361287594
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 63760.77428893
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 63753.75257796
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 63797.0534512
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 63903.166108675
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 63528.911187135
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 63528.5087995
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 63536.43765646
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 63535.151219256
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 63593.26305722
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 63605.73629416
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 63467.68957965
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 62771.6341555
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 62952.52450345
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 62949.3252776
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 62965.12680685
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 62788.365361154
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 62999.018564746
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 62984.25380657
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 63092.03838536
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 63239.54054056
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 63251.102895156
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 63266.851351626
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 63198.25866338
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 63127.899708465
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 63092.78262602
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 63059.753658235
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 63031.82903179
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 63039.052389316
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 63028.129793495
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 62949.12505133
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 62969.85994651
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 61166.50141647
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 60973.68578022
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 61144.59044995
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 61103.62357324
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 61089.28626931
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 60810.757803045
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 60960.365781054
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 60990.341687664
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 61038.33765783
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 61123.78119157
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 61122.26395758
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 61111.862666905
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 61105.36785514
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 61338.68798077
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 61318.38568769
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 61288.000519715
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 61394.8935722
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 61327.87259761
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 61389.726178005
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 61304.35617159
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 61339.87327992
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 61494.74761456
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 61560.61293533
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 61503.2480122
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 61530.226376854
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 61497.11765335
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 61446.59964011
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 61502.52936411
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 61524.3780276
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 61671.35545982
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 61669.92976583
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 61720.179477125
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 61628.44929372
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 61587.2875385
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 61523.13958358
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 61581.906624086
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 61559.74815625
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 61587.646175556
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 61603.58765722
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 61396.90719793
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 61383.563815154
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 61192.78391157
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 61253.35731214
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 61317.76603217
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 61323.089508615
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 61243.78152139
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 61291.290488206
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 61339.92400218
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 61546.78601642
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 61603.411002316
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 61559.51486835
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 61482.91847159
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 61480.73691452
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 61139.44190527
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 61322.227731675
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 61058.799596176
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 59228.076058425
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 59323.23871247
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 59268.47259191
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 59253.67428885
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 59350.86202348
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 59497.54428209
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 59529.82300201
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 59695.87041424
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 59856.110916235
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 59904.348645695
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 59911.55678164
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 60117.15288461
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 60302.42957168
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 60154.01754071
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 60334.40355735
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 60417.538894475
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 60378.92107112
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 60323.981287375
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 60406.30461705
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 60468.537492536
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 60571.28189174
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 60486.976005994
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 60497.55562255
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 60470.31212439
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 60452.748340756
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 60407.250740774
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 60384.5789883
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 60339.10700085
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 60344.09590606
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 60393.32096114
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 60398.06808723
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 60375.67488961
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 60511.88696648
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 60458.99458108
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 60252.87627769
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 60265.55702015
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 60224.564452775
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 60257.45817048
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 60232.16724148
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 60212.897360876
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 60206.02274663
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 60134.19722524
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 60249.289020866
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 60165.45544968
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 73642.83058384
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 73682.88915361
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 74073.26541992
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 73960.89079724
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 73830.11730889
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 73836.09425964
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 73836.98702062
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 73810.160309985
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 73845.01459874
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 73834.58089744
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 73946.88897166
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 74008.05339702
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 74002.03240921
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 74002.92517018
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 73883.751494944
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 73787.478592515
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 73800.91393495
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 73847.45659791
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 73806.06566759
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 73761.361287594
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 73760.77428893
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 73753.75257796
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 73797.0534512
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 73903.166108675
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 73528.911187135
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 73528.5087995
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 73536.43765646
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 73535.151219256
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 73593.26305722
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 73605.73629416
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 73467.68957965
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 72771.6341555
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 72952.52450345
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 72949.3252776
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 72965.12680685
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 72788.365361154
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 72999.018564746
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 72984.25380657
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 73092.03838536
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 73239.54054056
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 73251.102895156
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 73266.851351626
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 73198.25866338
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 73127.899708465
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 73092.78262602
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 73059.753658235
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 73031.82903179
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 73039.052389316
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 73028.129793495
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 72949.12505133
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 72969.85994651
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 71166.50141647
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 70973.68578022
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 71144.59044995
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 71103.62357324
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 71089.28626931
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 70810.757803045
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 70960.365781054
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 70990.341687664
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 71038.33765783
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 71123.78119157
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 71122.26395758
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 71111.862666905
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 71105.36785514
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 71338.68798077
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 71318.38568769
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 71288.000519715
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 71394.8935722
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 71327.87259761
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 71389.726178005
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 71304.35617159
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 71339.87327992
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 71494.74761456
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 71560.61293533
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 71503.2480122
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 71530.226376854
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 71497.11765335
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 71446.59964011
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 71502.52936411
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 71524.3780276
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 71671.35545982
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 71669.92976583
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 71720.179477125
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 71628.44929372
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 71587.2875385
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 71523.13958358
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 71581.906624086
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 71559.74815625
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 71587.646175556
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 71603.58765722
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 71396.90719793
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 71383.563815154
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 71192.78391157
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 71253.35731214
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 71317.76603217
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 71323.089508615
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 71243.78152139
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 71291.290488206
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 71339.92400218
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 71546.78601642
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 71603.411002316
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 71559.51486835
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 71482.91847159
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 71480.73691452
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 71139.44190527
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 71322.227731675
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 71058.799596176
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 69228.076058425
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 69323.23871247
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 69268.47259191
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 69253.67428885
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 69350.86202348
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 69497.54428209
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 69529.82300201
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 69695.87041424
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 69856.110916235
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 69904.348645695
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 69911.55678164
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 70117.15288461
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 70302.42957168
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 70154.01754071
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 70334.40355735
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 70417.538894475
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 70378.92107112
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 70323.981287375
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 70406.30461705
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 70468.537492536
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 70571.28189174
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 70486.976005994
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 70497.55562255
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 70470.31212439
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 70452.748340756
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 70407.250740774
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 70384.5789883
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 70339.10700085
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 70344.09590606
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 70393.32096114
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 70398.06808723
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 70375.67488961
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 70511.88696648
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 70458.99458108
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 70252.87627769
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 70265.55702015
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 70224.564452775
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 70257.45817048
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 70232.16724148
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 70212.897360876
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 70206.02274663
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 70134.19722524
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 70249.289020866
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 70165.45544968
  }
];


})();

(function() {


App.data.daily_five_series = [
  {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 43642.83058384
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 43682.88915361
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 44073.26541992
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 43960.89079724
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 43830.11730889
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 43836.09425964
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 43836.98702062
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 43810.160309985
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 43845.01459874
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 43834.58089744
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 43946.88897166
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 44008.05339702
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 44002.03240921
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 44002.92517018
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 43883.751494944
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 43787.478592515
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 43800.91393495
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 43847.45659791
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 43806.06566759
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 43761.361287594
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 43760.77428893
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 43753.75257796
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 43797.0534512
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 43903.166108675
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 43528.911187135
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 43528.5087995
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 43536.43765646
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 43535.151219256
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 43593.26305722
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 43605.73629416
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 43467.68957965
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 42771.6341555
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 42952.52450345
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 42949.3252776
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 42965.12680685
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 42788.365361154
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 42999.018564746
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 42984.25380657
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 43092.03838536
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 43239.54054056
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 43251.102895156
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 43266.851351626
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 43198.25866338
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 43127.899708465
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 43092.78262602
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 43059.753658235
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 43031.82903179
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 43039.052389316
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 43028.129793495
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 42949.12505133
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 42969.85994651
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 41166.50141647
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 40973.68578022
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 41144.59044995
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 41103.62357324
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 41089.28626931
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 40810.757803045
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 40960.365781054
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 40990.341687664
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 41038.33765783
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 41123.78119157
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 41122.26395758
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 41111.862666905
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 41105.36785514
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 41338.68798077
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 41318.38568769
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 41288.000519715
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 41394.8935722
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 41327.87259761
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 41389.726178005
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 41304.35617159
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 41339.87327992
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 41494.74761456
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 41560.61293533
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 41503.2480122
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 41530.226376854
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 41497.11765335
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 41446.59964011
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 41502.52936411
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 41524.3780276
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 41671.35545982
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 41669.92976583
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 41720.179477125
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 41628.44929372
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 41587.2875385
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 41523.13958358
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 41581.906624086
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 41559.74815625
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 41587.646175556
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 41603.58765722
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 41396.90719793
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 41383.563815154
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 41192.78391157
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 41253.35731214
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 41317.76603217
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 41323.089508615
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 41243.78152139
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 41291.290488206
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 41339.92400218
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 41546.78601642
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 41603.411002316
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 41559.51486835
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 41482.91847159
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 41480.73691452
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 41139.44190527
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 41322.227731675
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 41058.799596176
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 39228.076058425
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 39323.23871247
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 39268.47259191
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 39253.67428885
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 39350.86202348
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 39497.54428209
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 39529.82300201
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 39695.87041424
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 39856.110916235
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 39904.348645695
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 39911.55678164
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 40117.15288461
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 40302.42957168
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 40154.01754071
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 40334.40355735
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 40417.538894475
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 40378.92107112
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 40323.981287375
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 40406.30461705
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 40468.537492536
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 40571.28189174
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 40486.976005994
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 40497.55562255
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 40470.31212439
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 40452.748340756
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 40407.250740774
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 40384.5789883
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 40339.10700085
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 40344.09590606
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 40393.32096114
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 40398.06808723
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 40375.67488961
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 40511.88696648
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 40458.99458108
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 40252.87627769
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 40265.55702015
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 40224.564452775
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 40257.45817048
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 40232.16724148
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 40212.897360876
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 40206.02274663
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 40134.19722524
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 40249.289020866
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 40165.45544968
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 53642.83058384
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 53682.88915361
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 54073.26541992
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 53960.89079724
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 53830.11730889
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 53836.09425964
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 53836.98702062
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 53810.160309985
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 53845.01459874
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 53834.58089744
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 53946.88897166
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 54008.05339702
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 54002.03240921
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 54002.92517018
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 53883.751494944
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 53787.478592515
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 53800.91393495
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 53847.45659791
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 53806.06566759
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 53761.361287594
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 53760.77428893
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 53753.75257796
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 53797.0534512
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 53903.166108675
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 53528.911187135
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 53528.5087995
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 53536.43765646
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 53535.151219256
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 53593.26305722
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 53605.73629416
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 53467.68957965
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 52771.6341555
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 52952.52450345
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 52949.3252776
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 52965.12680685
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 52788.365361154
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 52999.018564746
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 52984.25380657
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 53092.03838536
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 53239.54054056
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 53251.102895156
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 53266.851351626
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 53198.25866338
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 53127.899708465
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 53092.78262602
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 53059.753658235
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 53031.82903179
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 53039.052389316
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 53028.129793495
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 52949.12505133
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 52969.85994651
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 51166.50141647
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 50973.68578022
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 51144.59044995
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 51103.62357324
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 51089.28626931
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 50810.757803045
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 50960.365781054
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 50990.341687664
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 51038.33765783
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 51123.78119157
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 51122.26395758
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 51111.862666905
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 51105.36785514
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 51338.68798077
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 51318.38568769
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 51288.000519715
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 51394.8935722
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 51327.87259761
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 51389.726178005
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 51304.35617159
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 51339.87327992
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 51494.74761456
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 51560.61293533
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 51503.2480122
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 51530.226376854
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 51497.11765335
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 51446.59964011
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 51502.52936411
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 51524.3780276
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 51671.35545982
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 51669.92976583
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 51720.179477125
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 51628.44929372
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 51587.2875385
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 51523.13958358
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 51581.906624086
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 51559.74815625
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 51587.646175556
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 51603.58765722
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 51396.90719793
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 51383.563815154
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 51192.78391157
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 51253.35731214
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 51317.76603217
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 51323.089508615
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 51243.78152139
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 51291.290488206
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 51339.92400218
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 51546.78601642
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 51603.411002316
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 51559.51486835
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 51482.91847159
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 51480.73691452
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 51139.44190527
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 51322.227731675
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 51058.799596176
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 49228.076058425
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 49323.23871247
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 49268.47259191
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 49253.67428885
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 49350.86202348
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 49497.54428209
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 49529.82300201
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 49695.87041424
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 49856.110916235
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 49904.348645695
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 49911.55678164
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 50117.15288461
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 50302.42957168
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 50154.01754071
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 50334.40355735
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 50417.538894475
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 50378.92107112
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 50323.981287375
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 50406.30461705
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 50468.537492536
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 50571.28189174
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 50486.976005994
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 50497.55562255
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 50470.31212439
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 50452.748340756
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 50407.250740774
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 50384.5789883
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 50339.10700085
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 50344.09590606
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 50393.32096114
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 50398.06808723
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 50375.67488961
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 50511.88696648
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 50458.99458108
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 50252.87627769
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 50265.55702015
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 50224.564452775
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 50257.45817048
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 50232.16724148
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 50212.897360876
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 50206.02274663
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 50134.19722524
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 50249.289020866
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 50165.45544968
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 63642.83058384
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 63682.88915361
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 64073.26541992
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 63960.89079724
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 63830.11730889
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 63836.09425964
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 63836.98702062
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 63810.160309985
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 63845.01459874
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 63834.58089744
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 63946.88897166
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 64008.05339702
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 64002.03240921
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 64002.92517018
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 63883.751494944
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 63787.478592515
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 63800.91393495
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 63847.45659791
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 63806.06566759
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 63761.361287594
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 63760.77428893
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 63753.75257796
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 63797.0534512
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 63903.166108675
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 63528.911187135
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 63528.5087995
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 63536.43765646
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 63535.151219256
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 63593.26305722
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 63605.73629416
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 63467.68957965
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 62771.6341555
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 62952.52450345
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 62949.3252776
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 62965.12680685
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 62788.365361154
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 62999.018564746
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 62984.25380657
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 63092.03838536
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 63239.54054056
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 63251.102895156
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 63266.851351626
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 63198.25866338
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 63127.899708465
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 63092.78262602
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 63059.753658235
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 63031.82903179
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 63039.052389316
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 63028.129793495
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 62949.12505133
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 62969.85994651
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 61166.50141647
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 60973.68578022
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 61144.59044995
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 61103.62357324
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 61089.28626931
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 60810.757803045
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 60960.365781054
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 60990.341687664
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 61038.33765783
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 61123.78119157
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 61122.26395758
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 61111.862666905
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 61105.36785514
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 61338.68798077
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 61318.38568769
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 61288.000519715
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 61394.8935722
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 61327.87259761
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 61389.726178005
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 61304.35617159
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 61339.87327992
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 61494.74761456
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 61560.61293533
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 61503.2480122
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 61530.226376854
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 61497.11765335
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 61446.59964011
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 61502.52936411
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 61524.3780276
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 61671.35545982
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 61669.92976583
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 61720.179477125
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 61628.44929372
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 61587.2875385
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 61523.13958358
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 61581.906624086
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 61559.74815625
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 61587.646175556
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 61603.58765722
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 61396.90719793
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 61383.563815154
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 61192.78391157
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 61253.35731214
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 61317.76603217
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 61323.089508615
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 61243.78152139
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 61291.290488206
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 61339.92400218
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 61546.78601642
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 61603.411002316
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 61559.51486835
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 61482.91847159
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 61480.73691452
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 61139.44190527
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 61322.227731675
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 61058.799596176
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 59228.076058425
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 59323.23871247
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 59268.47259191
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 59253.67428885
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 59350.86202348
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 59497.54428209
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 59529.82300201
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 59695.87041424
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 59856.110916235
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 59904.348645695
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 59911.55678164
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 60117.15288461
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 60302.42957168
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 60154.01754071
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 60334.40355735
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 60417.538894475
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 60378.92107112
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 60323.981287375
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 60406.30461705
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 60468.537492536
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 60571.28189174
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 60486.976005994
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 60497.55562255
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 60470.31212439
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 60452.748340756
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 60407.250740774
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 60384.5789883
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 60339.10700085
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 60344.09590606
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 60393.32096114
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 60398.06808723
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 60375.67488961
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 60511.88696648
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 60458.99458108
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 60252.87627769
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 60265.55702015
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 60224.564452775
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 60257.45817048
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 60232.16724148
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 60212.897360876
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 60206.02274663
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 60134.19722524
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 60249.289020866
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 60165.45544968
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 73642.83058384
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 73682.88915361
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 74073.26541992
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 73960.89079724
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 73830.11730889
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 73836.09425964
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 73836.98702062
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 73810.160309985
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 73845.01459874
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 73834.58089744
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 73946.88897166
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 74008.05339702
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 74002.03240921
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 74002.92517018
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 73883.751494944
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 73787.478592515
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 73800.91393495
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 73847.45659791
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 73806.06566759
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 73761.361287594
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 73760.77428893
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 73753.75257796
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 73797.0534512
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 73903.166108675
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 73528.911187135
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 73528.5087995
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 73536.43765646
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 73535.151219256
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 73593.26305722
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 73605.73629416
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 73467.68957965
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 72771.6341555
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 72952.52450345
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 72949.3252776
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 72965.12680685
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 72788.365361154
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 72999.018564746
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 72984.25380657
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 73092.03838536
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 73239.54054056
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 73251.102895156
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 73266.851351626
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 73198.25866338
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 73127.899708465
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 73092.78262602
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 73059.753658235
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 73031.82903179
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 73039.052389316
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 73028.129793495
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 72949.12505133
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 72969.85994651
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 71166.50141647
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 70973.68578022
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 71144.59044995
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 71103.62357324
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 71089.28626931
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 70810.757803045
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 70960.365781054
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 70990.341687664
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 71038.33765783
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 71123.78119157
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 71122.26395758
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 71111.862666905
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 71105.36785514
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 71338.68798077
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 71318.38568769
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 71288.000519715
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 71394.8935722
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 71327.87259761
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 71389.726178005
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 71304.35617159
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 71339.87327992
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 71494.74761456
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 71560.61293533
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 71503.2480122
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 71530.226376854
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 71497.11765335
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 71446.59964011
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 71502.52936411
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 71524.3780276
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 71671.35545982
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 71669.92976583
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 71720.179477125
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 71628.44929372
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 71587.2875385
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 71523.13958358
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 71581.906624086
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 71559.74815625
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 71587.646175556
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 71603.58765722
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 71396.90719793
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 71383.563815154
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 71192.78391157
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 71253.35731214
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 71317.76603217
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 71323.089508615
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 71243.78152139
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 71291.290488206
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 71339.92400218
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 71546.78601642
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 71603.411002316
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 71559.51486835
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 71482.91847159
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 71480.73691452
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 71139.44190527
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 71322.227731675
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 71058.799596176
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 69228.076058425
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 69323.23871247
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 69268.47259191
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 69253.67428885
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 69350.86202348
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 69497.54428209
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 69529.82300201
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 69695.87041424
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 69856.110916235
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 69904.348645695
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 69911.55678164
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 70117.15288461
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 70302.42957168
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 70154.01754071
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 70334.40355735
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 70417.538894475
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 70378.92107112
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 70323.981287375
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 70406.30461705
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 70468.537492536
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 70571.28189174
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 70486.976005994
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 70497.55562255
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 70470.31212439
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 70452.748340756
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 70407.250740774
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 70384.5789883
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 70339.10700085
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 70344.09590606
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 70393.32096114
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 70398.06808723
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 70375.67488961
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 70511.88696648
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 70458.99458108
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 70252.87627769
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 70265.55702015
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 70224.564452775
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 70257.45817048
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 70232.16724148
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 70212.897360876
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 70206.02274663
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 70134.19722524
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 70249.289020866
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 70165.45544968
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 83642.83058384
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 83682.88915361
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 84073.26541992
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 83960.89079724
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 83830.11730889
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 83836.09425964
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 83836.98702062
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 83810.160309985
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 83845.01459874
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 83834.58089744
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 83946.88897166
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 84008.05339702
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 84002.03240921
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 84002.92517018
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 83883.751494944
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 83787.478592515
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 83800.91393495
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 83847.45659791
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 83806.06566759
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 83761.361287594
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 83760.77428893
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 83753.75257796
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 83797.0534512
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 83903.166108675
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 83528.911187135
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 83528.5087995
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 83536.43765646
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 83535.151219256
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 83593.26305722
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 83605.73629416
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 83467.68957965
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 82771.6341555
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 82952.52450345
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 82949.3252776
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 82965.12680685
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 82788.365361154
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 82999.018564746
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 82984.25380657
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 83092.03838536
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 83239.54054056
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 83251.102895156
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 83266.851351626
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 83198.25866338
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 83127.899708465
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 83092.78262602
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 83059.753658235
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 83031.82903179
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 83039.052389316
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 83028.129793495
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 82949.12505133
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 82969.85994651
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 81166.50141647
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 80973.68578022
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 81144.59044995
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 81103.62357324
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 81089.28626931
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 80810.757803045
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 80960.365781054
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 80990.341687664
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 81038.33765783
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 81123.78119157
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 81122.26395758
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 81111.862666905
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 81105.36785514
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 81338.68798077
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 81318.38568769
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 81288.000519715
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 81394.8935722
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 81327.87259761
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 81389.726178005
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 81304.35617159
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 81339.87327992
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 81494.74761456
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 81560.61293533
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 81503.2480122
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 81530.226376854
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 81497.11765335
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 81446.59964011
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 81502.52936411
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 81524.3780276
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 81671.35545982
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 81669.92976583
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 81720.179477125
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 81628.44929372
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 81587.2875385
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 81523.13958358
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 81581.906624086
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 81559.74815625
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 81587.646175556
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 81603.58765722
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 81396.90719793
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 81383.563815154
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 81192.78391157
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 81253.35731214
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 81317.76603217
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 81323.089508615
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 81243.78152139
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 81291.290488206
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 81339.92400218
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 81546.78601642
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 81603.411002316
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 81559.51486835
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 81482.91847159
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 81480.73691452
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 81139.44190527
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 81322.227731675
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 81058.799596176
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 79228.076058425
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 79323.23871247
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 79268.47259191
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 79253.67428885
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 79350.86202348
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 79497.54428209
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 79529.82300201
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 79695.87041424
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 79856.110916235
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 79904.348645695
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 79911.55678164
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 80117.15288461
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 80302.42957168
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 80154.01754071
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 80334.40355735
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 80417.538894475
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 80378.92107112
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 80323.981287375
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 80406.30461705
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 80468.537492536
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 80571.28189174
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 80486.976005994
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 80497.55562255
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 80470.31212439
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 80452.748340756
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 80407.250740774
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 80384.5789883
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 80339.10700085
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 80344.09590606
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 80393.32096114
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 80398.06808723
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 80375.67488961
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 80511.88696648
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 80458.99458108
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 80252.87627769
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 80265.55702015
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 80224.564452775
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 80257.45817048
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 80232.16724148
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 80212.897360876
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 80206.02274663
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 80134.19722524
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 80249.289020866
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 80165.45544968
  }
];


})();

(function() {


App.data.daily_six_series = [
  {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 43642.83058384
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 43682.88915361
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 44073.26541992
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 43960.89079724
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 43830.11730889
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 43836.09425964
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 43836.98702062
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 43810.160309985
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 43845.01459874
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 43834.58089744
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 43946.88897166
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 44008.05339702
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 44002.03240921
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 44002.92517018
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 43883.751494944
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 43787.478592515
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 43800.91393495
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 43847.45659791
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 43806.06566759
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 43761.361287594
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 43760.77428893
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 43753.75257796
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 43797.0534512
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 43903.166108675
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 43528.911187135
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 43528.5087995
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 43536.43765646
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 43535.151219256
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 43593.26305722
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 43605.73629416
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 43467.68957965
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 42771.6341555
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 42952.52450345
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 42949.3252776
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 42965.12680685
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 42788.365361154
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 42999.018564746
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 42984.25380657
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 43092.03838536
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 43239.54054056
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 43251.102895156
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 43266.851351626
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 43198.25866338
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 43127.899708465
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 43092.78262602
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 43059.753658235
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 43031.82903179
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 43039.052389316
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 43028.129793495
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 42949.12505133
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 42969.85994651
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 41166.50141647
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 40973.68578022
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 41144.59044995
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 41103.62357324
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 41089.28626931
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 40810.757803045
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 40960.365781054
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 40990.341687664
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 41038.33765783
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 41123.78119157
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 41122.26395758
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 41111.862666905
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 41105.36785514
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 41338.68798077
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 41318.38568769
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 41288.000519715
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 41394.8935722
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 41327.87259761
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 41389.726178005
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 41304.35617159
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 41339.87327992
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 41494.74761456
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 41560.61293533
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 41503.2480122
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 41530.226376854
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 41497.11765335
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 41446.59964011
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 41502.52936411
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 41524.3780276
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 41671.35545982
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 41669.92976583
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 41720.179477125
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 41628.44929372
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 41587.2875385
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 41523.13958358
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 41581.906624086
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 41559.74815625
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 41587.646175556
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 41603.58765722
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 41396.90719793
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 41383.563815154
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 41192.78391157
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 41253.35731214
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 41317.76603217
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 41323.089508615
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 41243.78152139
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 41291.290488206
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 41339.92400218
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 41546.78601642
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 41603.411002316
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 41559.51486835
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 41482.91847159
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 41480.73691452
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 41139.44190527
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 41322.227731675
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 41058.799596176
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 39228.076058425
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 39323.23871247
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 39268.47259191
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 39253.67428885
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 39350.86202348
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 39497.54428209
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 39529.82300201
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 39695.87041424
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 39856.110916235
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 39904.348645695
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 39911.55678164
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 40117.15288461
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 40302.42957168
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 40154.01754071
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 40334.40355735
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 40417.538894475
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 40378.92107112
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 40323.981287375
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 40406.30461705
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 40468.537492536
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 40571.28189174
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 40486.976005994
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 40497.55562255
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 40470.31212439
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 40452.748340756
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 40407.250740774
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 40384.5789883
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 40339.10700085
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 40344.09590606
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 40393.32096114
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 40398.06808723
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 40375.67488961
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 40511.88696648
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 40458.99458108
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 40252.87627769
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 40265.55702015
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 40224.564452775
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 40257.45817048
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 40232.16724148
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 40212.897360876
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 40206.02274663
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 40134.19722524
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 40249.289020866
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 40165.45544968
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 53642.83058384
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 53682.88915361
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 54073.26541992
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 53960.89079724
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 53830.11730889
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 53836.09425964
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 53836.98702062
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 53810.160309985
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 53845.01459874
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 53834.58089744
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 53946.88897166
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 54008.05339702
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 54002.03240921
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 54002.92517018
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 53883.751494944
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 53787.478592515
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 53800.91393495
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 53847.45659791
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 53806.06566759
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 53761.361287594
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 53760.77428893
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 53753.75257796
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 53797.0534512
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 53903.166108675
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 53528.911187135
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 53528.5087995
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 53536.43765646
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 53535.151219256
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 53593.26305722
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 53605.73629416
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 53467.68957965
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 52771.6341555
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 52952.52450345
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 52949.3252776
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 52965.12680685
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 52788.365361154
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 52999.018564746
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 52984.25380657
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 53092.03838536
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 53239.54054056
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 53251.102895156
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 53266.851351626
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 53198.25866338
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 53127.899708465
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 53092.78262602
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 53059.753658235
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 53031.82903179
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 53039.052389316
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 53028.129793495
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 52949.12505133
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 52969.85994651
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 51166.50141647
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 50973.68578022
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 51144.59044995
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 51103.62357324
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 51089.28626931
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 50810.757803045
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 50960.365781054
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 50990.341687664
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 51038.33765783
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 51123.78119157
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 51122.26395758
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 51111.862666905
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 51105.36785514
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 51338.68798077
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 51318.38568769
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 51288.000519715
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 51394.8935722
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 51327.87259761
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 51389.726178005
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 51304.35617159
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 51339.87327992
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 51494.74761456
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 51560.61293533
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 51503.2480122
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 51530.226376854
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 51497.11765335
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 51446.59964011
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 51502.52936411
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 51524.3780276
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 51671.35545982
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 51669.92976583
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 51720.179477125
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 51628.44929372
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 51587.2875385
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 51523.13958358
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 51581.906624086
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 51559.74815625
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 51587.646175556
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 51603.58765722
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 51396.90719793
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 51383.563815154
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 51192.78391157
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 51253.35731214
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 51317.76603217
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 51323.089508615
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 51243.78152139
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 51291.290488206
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 51339.92400218
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 51546.78601642
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 51603.411002316
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 51559.51486835
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 51482.91847159
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 51480.73691452
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 51139.44190527
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 51322.227731675
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 51058.799596176
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 49228.076058425
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 49323.23871247
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 49268.47259191
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 49253.67428885
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 49350.86202348
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 49497.54428209
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 49529.82300201
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 49695.87041424
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 49856.110916235
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 49904.348645695
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 49911.55678164
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 50117.15288461
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 50302.42957168
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 50154.01754071
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 50334.40355735
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 50417.538894475
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 50378.92107112
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 50323.981287375
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 50406.30461705
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 50468.537492536
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 50571.28189174
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 50486.976005994
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 50497.55562255
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 50470.31212439
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 50452.748340756
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 50407.250740774
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 50384.5789883
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 50339.10700085
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 50344.09590606
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 50393.32096114
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 50398.06808723
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 50375.67488961
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 50511.88696648
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 50458.99458108
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 50252.87627769
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 50265.55702015
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 50224.564452775
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 50257.45817048
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 50232.16724148
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 50212.897360876
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 50206.02274663
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 50134.19722524
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 50249.289020866
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 50165.45544968
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 63642.83058384
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 63682.88915361
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 64073.26541992
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 63960.89079724
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 63830.11730889
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 63836.09425964
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 63836.98702062
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 63810.160309985
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 63845.01459874
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 63834.58089744
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 63946.88897166
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 64008.05339702
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 64002.03240921
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 64002.92517018
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 63883.751494944
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 63787.478592515
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 63800.91393495
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 63847.45659791
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 63806.06566759
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 63761.361287594
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 63760.77428893
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 63753.75257796
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 63797.0534512
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 63903.166108675
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 63528.911187135
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 63528.5087995
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 63536.43765646
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 63535.151219256
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 63593.26305722
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 63605.73629416
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 63467.68957965
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 62771.6341555
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 62952.52450345
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 62949.3252776
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 62965.12680685
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 62788.365361154
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 62999.018564746
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 62984.25380657
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 63092.03838536
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 63239.54054056
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 63251.102895156
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 63266.851351626
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 63198.25866338
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 63127.899708465
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 63092.78262602
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 63059.753658235
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 63031.82903179
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 63039.052389316
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 63028.129793495
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 62949.12505133
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 62969.85994651
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 61166.50141647
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 60973.68578022
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 61144.59044995
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 61103.62357324
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 61089.28626931
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 60810.757803045
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 60960.365781054
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 60990.341687664
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 61038.33765783
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 61123.78119157
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 61122.26395758
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 61111.862666905
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 61105.36785514
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 61338.68798077
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 61318.38568769
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 61288.000519715
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 61394.8935722
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 61327.87259761
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 61389.726178005
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 61304.35617159
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 61339.87327992
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 61494.74761456
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 61560.61293533
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 61503.2480122
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 61530.226376854
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 61497.11765335
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 61446.59964011
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 61502.52936411
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 61524.3780276
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 61671.35545982
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 61669.92976583
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 61720.179477125
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 61628.44929372
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 61587.2875385
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 61523.13958358
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 61581.906624086
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 61559.74815625
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 61587.646175556
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 61603.58765722
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 61396.90719793
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 61383.563815154
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 61192.78391157
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 61253.35731214
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 61317.76603217
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 61323.089508615
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 61243.78152139
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 61291.290488206
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 61339.92400218
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 61546.78601642
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 61603.411002316
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 61559.51486835
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 61482.91847159
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 61480.73691452
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 61139.44190527
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 61322.227731675
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 61058.799596176
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 59228.076058425
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 59323.23871247
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 59268.47259191
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 59253.67428885
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 59350.86202348
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 59497.54428209
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 59529.82300201
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 59695.87041424
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 59856.110916235
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 59904.348645695
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 59911.55678164
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 60117.15288461
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 60302.42957168
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 60154.01754071
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 60334.40355735
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 60417.538894475
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 60378.92107112
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 60323.981287375
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 60406.30461705
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 60468.537492536
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 60571.28189174
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 60486.976005994
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 60497.55562255
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 60470.31212439
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 60452.748340756
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 60407.250740774
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 60384.5789883
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 60339.10700085
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 60344.09590606
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 60393.32096114
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 60398.06808723
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 60375.67488961
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 60511.88696648
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 60458.99458108
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 60252.87627769
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 60265.55702015
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 60224.564452775
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 60257.45817048
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 60232.16724148
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 60212.897360876
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 60206.02274663
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 60134.19722524
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 60249.289020866
  }, {
    label: 'Group Three',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 60165.45544968
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 73642.83058384
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 73682.88915361
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 74073.26541992
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 73960.89079724
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 73830.11730889
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 73836.09425964
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 73836.98702062
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 73810.160309985
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 73845.01459874
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 73834.58089744
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 73946.88897166
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 74008.05339702
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 74002.03240921
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 74002.92517018
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 73883.751494944
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 73787.478592515
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 73800.91393495
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 73847.45659791
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 73806.06566759
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 73761.361287594
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 73760.77428893
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 73753.75257796
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 73797.0534512
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 73903.166108675
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 73528.911187135
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 73528.5087995
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 73536.43765646
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 73535.151219256
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 73593.26305722
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 73605.73629416
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 73467.68957965
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 72771.6341555
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 72952.52450345
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 72949.3252776
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 72965.12680685
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 72788.365361154
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 72999.018564746
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 72984.25380657
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 73092.03838536
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 73239.54054056
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 73251.102895156
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 73266.851351626
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 73198.25866338
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 73127.899708465
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 73092.78262602
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 73059.753658235
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 73031.82903179
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 73039.052389316
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 73028.129793495
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 72949.12505133
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 72969.85994651
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 71166.50141647
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 70973.68578022
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 71144.59044995
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 71103.62357324
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 71089.28626931
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 70810.757803045
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 70960.365781054
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 70990.341687664
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 71038.33765783
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 71123.78119157
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 71122.26395758
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 71111.862666905
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 71105.36785514
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 71338.68798077
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 71318.38568769
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 71288.000519715
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 71394.8935722
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 71327.87259761
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 71389.726178005
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 71304.35617159
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 71339.87327992
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 71494.74761456
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 71560.61293533
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 71503.2480122
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 71530.226376854
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 71497.11765335
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 71446.59964011
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 71502.52936411
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 71524.3780276
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 71671.35545982
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 71669.92976583
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 71720.179477125
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 71628.44929372
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 71587.2875385
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 71523.13958358
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 71581.906624086
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 71559.74815625
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 71587.646175556
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 71603.58765722
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 71396.90719793
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 71383.563815154
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 71192.78391157
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 71253.35731214
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 71317.76603217
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 71323.089508615
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 71243.78152139
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 71291.290488206
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 71339.92400218
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 71546.78601642
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 71603.411002316
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 71559.51486835
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 71482.91847159
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 71480.73691452
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 71139.44190527
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 71322.227731675
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 71058.799596176
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 69228.076058425
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 69323.23871247
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 69268.47259191
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 69253.67428885
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 69350.86202348
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 69497.54428209
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 69529.82300201
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 69695.87041424
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 69856.110916235
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 69904.348645695
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 69911.55678164
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 70117.15288461
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 70302.42957168
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 70154.01754071
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 70334.40355735
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 70417.538894475
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 70378.92107112
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 70323.981287375
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 70406.30461705
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 70468.537492536
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 70571.28189174
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 70486.976005994
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 70497.55562255
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 70470.31212439
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 70452.748340756
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 70407.250740774
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 70384.5789883
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 70339.10700085
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 70344.09590606
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 70393.32096114
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 70398.06808723
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 70375.67488961
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 70511.88696648
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 70458.99458108
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 70252.87627769
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 70265.55702015
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 70224.564452775
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 70257.45817048
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 70232.16724148
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 70212.897360876
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 70206.02274663
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 70134.19722524
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 70249.289020866
  }, {
    label: 'Group Four',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 70165.45544968
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 83642.83058384
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 83682.88915361
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 84073.26541992
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 83960.89079724
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 83830.11730889
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 83836.09425964
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 83836.98702062
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 83810.160309985
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 83845.01459874
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 83834.58089744
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 83946.88897166
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 84008.05339702
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 84002.03240921
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 84002.92517018
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 83883.751494944
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 83787.478592515
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 83800.91393495
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 83847.45659791
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 83806.06566759
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 83761.361287594
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 83760.77428893
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 83753.75257796
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 83797.0534512
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 83903.166108675
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 83528.911187135
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 83528.5087995
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 83536.43765646
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 83535.151219256
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 83593.26305722
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 83605.73629416
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 83467.68957965
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 82771.6341555
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 82952.52450345
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 82949.3252776
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 82965.12680685
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 82788.365361154
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 82999.018564746
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 82984.25380657
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 83092.03838536
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 83239.54054056
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 83251.102895156
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 83266.851351626
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 83198.25866338
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 83127.899708465
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 83092.78262602
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 83059.753658235
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 83031.82903179
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 83039.052389316
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 83028.129793495
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 82949.12505133
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 82969.85994651
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 81166.50141647
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 80973.68578022
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 81144.59044995
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 81103.62357324
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 81089.28626931
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 80810.757803045
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 80960.365781054
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 80990.341687664
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 81038.33765783
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 81123.78119157
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 81122.26395758
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 81111.862666905
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 81105.36785514
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 81338.68798077
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 81318.38568769
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 81288.000519715
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 81394.8935722
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 81327.87259761
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 81389.726178005
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 81304.35617159
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 81339.87327992
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 81494.74761456
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 81560.61293533
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 81503.2480122
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 81530.226376854
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 81497.11765335
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 81446.59964011
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 81502.52936411
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 81524.3780276
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 81671.35545982
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 81669.92976583
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 81720.179477125
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 81628.44929372
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 81587.2875385
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 81523.13958358
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 81581.906624086
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 81559.74815625
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 81587.646175556
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 81603.58765722
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 81396.90719793
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 81383.563815154
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 81192.78391157
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 81253.35731214
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 81317.76603217
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 81323.089508615
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 81243.78152139
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 81291.290488206
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 81339.92400218
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 81546.78601642
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 81603.411002316
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 81559.51486835
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 81482.91847159
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 81480.73691452
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 81139.44190527
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 81322.227731675
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 81058.799596176
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 79228.076058425
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 79323.23871247
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 79268.47259191
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 79253.67428885
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 79350.86202348
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 79497.54428209
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 79529.82300201
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 79695.87041424
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 79856.110916235
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 79904.348645695
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 79911.55678164
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 80117.15288461
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 80302.42957168
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 80154.01754071
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 80334.40355735
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 80417.538894475
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 80378.92107112
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 80323.981287375
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 80406.30461705
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 80468.537492536
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 80571.28189174
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 80486.976005994
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 80497.55562255
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 80470.31212439
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 80452.748340756
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 80407.250740774
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 80384.5789883
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 80339.10700085
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 80344.09590606
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 80393.32096114
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 80398.06808723
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 80375.67488961
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 80511.88696648
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 80458.99458108
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 80252.87627769
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 80265.55702015
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 80224.564452775
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 80257.45817048
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 80232.16724148
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 80212.897360876
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 80206.02274663
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 80134.19722524
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 80249.289020866
  }, {
    label: 'Group Five',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 80165.45544968
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 93642.83058384
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 93682.88915361
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 94073.26541992
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 93960.89079724
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 93830.11730889
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 93836.09425964
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 93836.98702062
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 93810.160309985
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 93845.01459874
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 93834.58089744
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 93946.88897166
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 94008.05339702
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 94002.03240921
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 94002.92517018
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 93883.751494944
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 93787.478592515
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 93800.91393495
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 93847.45659791
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 93806.06566759
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 93761.361287594
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 93760.77428893
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 93753.75257796
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 93797.0534512
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 93903.166108675
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 93528.911187135
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 93528.5087995
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 93536.43765646
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 93535.151219256
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 93593.26305722
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 93605.73629416
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 93467.68957965
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 92771.6341555
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 92952.52450345
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 92949.3252776
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 92965.12680685
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 92788.365361154
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 92999.018564746
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 92984.25380657
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 93092.03838536
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 93239.54054056
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 93251.102895156
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 93266.851351626
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 93198.25866338
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 93127.899708465
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 93092.78262602
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 93059.753658235
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 93031.82903179
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 93039.052389316
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 93028.129793495
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 92949.12505133
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 92969.85994651
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 91166.50141647
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 90973.68578022
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 91144.59044995
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 91103.62357324
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 91089.28626931
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 90810.757803045
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 90960.365781054
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 90990.341687664
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 91038.33765783
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 91123.78119157
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 91122.26395758
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 91111.862666905
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 91105.36785514
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 91338.68798077
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 91318.38568769
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 91288.000519715
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 91394.8935722
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 91327.87259761
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 91389.726178005
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 91304.35617159
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 91339.87327992
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 91494.74761456
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 91560.61293533
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 91503.2480122
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 91530.226376854
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 91497.11765335
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 91446.59964011
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 91502.52936411
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 91524.3780276
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 91671.35545982
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 91669.92976583
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 91720.179477125
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 91628.44929372
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 91587.2875385
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 91523.13958358
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 91581.906624086
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 91559.74815625
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 91587.646175556
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 91603.58765722
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 91396.90719793
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 91383.563815154
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 91192.78391157
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 91253.35731214
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 91317.76603217
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 91323.089508615
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 91243.78152139
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 91291.290488206
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 91339.92400218
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 91546.78601642
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 91603.411002316
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 91559.51486835
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 91482.91847159
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 91480.73691452
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 91139.44190527
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 91322.227731675
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 91058.799596176
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 89228.076058425
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 89323.23871247
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 89268.47259191
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 89253.67428885
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 89350.86202348
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 89497.54428209
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 89529.82300201
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 89695.87041424
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 89856.110916235
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 89904.348645695
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 89911.55678164
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 90117.15288461
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 90302.42957168
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 90154.01754071
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 90334.40355735
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 90417.538894475
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 90378.92107112
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 90323.981287375
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 90406.30461705
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 90468.537492536
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 90571.28189174
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 90486.976005994
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 90497.55562255
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 90470.31212439
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 90452.748340756
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 90407.250740774
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 90384.5789883
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 90339.10700085
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 90344.09590606
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 90393.32096114
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 90398.06808723
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 90375.67488961
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 90511.88696648
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 90458.99458108
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 90252.87627769
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 90265.55702015
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 90224.564452775
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 90257.45817048
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 90232.16724148
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 90212.897360876
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 90206.02274663
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 90134.19722524
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 90249.289020866
  }, {
    label: 'Group Six',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 90165.45544968
  }
];


})();

(function() {


App.data.value_p1d_p1y = [
  {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-27"),
    value: 142096015.71742177
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-28"),
    value: 142101731.98060158
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-29"),
    value: 142107448.24378154
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-30"),
    value: 141934424.30498388
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-01"),
    value: 142164128.00176576
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-02"),
    value: 142399545.51807317
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-03"),
    value: 142333243.372453
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-04"),
    value: 142242949.3474151
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-05"),
    value: 142248710.38820672
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-06"),
    value: 142254471.4289986
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-07"),
    value: 142369470.69650733
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-08"),
    value: 142796257.17154828
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-09"),
    value: 143041069.35484105
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-10"),
    value: 142265066.3796099
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-11"),
    value: 142879047.3289037
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-12"),
    value: 142884808.3696955
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-13"),
    value: 142890569.4104874
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-14"),
    value: 143330251.62908864
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-15"),
    value: 142849806.14452362
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-16"),
    value: 142584441.0700523
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-17"),
    value: 142201848.4194405
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-18"),
    value: 141562047.31745562
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-19"),
    value: 141567808.35824758
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-20"),
    value: 141573569.39903933
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-21"),
    value: 141575141.9863657
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-22"),
    value: 141307984.36341855
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-23"),
    value: 141574769.70322043
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-24"),
    value: 141778773.78889713
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-25"),
    value: 141650388.39602995
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-26"),
    value: 141656149.4368218
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-27"),
    value: 141661910.47761345
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-28"),
    value: 141667671.51840538
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-29"),
    value: 141460688.28122446
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-30"),
    value: 141386030.68732467
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-31"),
    value: 141334150.16491863
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-01"),
    value: 141726021.2603996
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-02"),
    value: 141700013.41747674
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-03"),
    value: 141705729.6806564
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-04"),
    value: 141639947.46346816
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-05"),
    value: 141387636.60343754
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-06"),
    value: 141319592.2971479
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-07"),
    value: 141451563.31990656
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-08"),
    value: 141777621.6139829
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-09"),
    value: 141783337.8771628
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-10"),
    value: 141789054.14034262
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-11"),
    value: 141744003.26667234
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-12"),
    value: 141412418.4106732
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-13"),
    value: 141680142.21963316
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-14"),
    value: 141643658.33469334
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-15"),
    value: 141541110.47410873
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-16"),
    value: 141546826.7372886
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-17"),
    value: 141552543.00046855
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-18"),
    value: 141197389.52984217
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-19"),
    value: 141479530.46594027
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-20"),
    value: 141735098.09225327
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-21"),
    value: 141861498.47284174
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-22"),
    value: 142048227.09659773
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-23"),
    value: 142053943.3597776
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-24"),
    value: 142059659.62295732
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-25"),
    value: 142230864.74222308
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-26"),
    value: 142278544.18234038
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-27"),
    value: 142587026.35406846
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-28"),
    value: 142785729.80885726
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-29"),
    value: 142689919.52744088
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-30"),
    value: 142390818.84883082
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-01"),
    value: 142382896.00285745
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-02"),
    value: 142935612.90941834
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-03"),
    value: 143313570.37249357
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-04"),
    value: 143319331.41328546
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-05"),
    value: 143521698.18444896
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-06"),
    value: 143614882.80853003
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-07"),
    value: 143620643.84932184
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-08"),
    value: 143626404.8901137
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-09"),
    value: 143674349.59120998
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-10"),
    value: 143766459.13994867
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-11"),
    value: 143953510.59397495
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-12"),
    value: 144164682.80921182
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-13"),
    value: 144178940.09335265
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-14"),
    value: 144184701.13414466
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-15"),
    value: 144190462.17493647
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-16"),
    value: 144379485.6176544
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-17"),
    value: 144251611.78305557
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-18"),
    value: 144082658.34621763
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-19"),
    value: 144204925.86291742
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-20"),
    value: 144314375.18902957
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-21"),
    value: 144320136.22982156
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-22"),
    value: 144325897.27061337
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-23"),
    value: 144412847.37787747
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-24"),
    value: 144228749.68287605
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-25"),
    value: 144352595.72472787
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-26"),
    value: 144324122.76267883
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-27"),
    value: 144467260.77330536
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-28"),
    value: 144473021.81409726
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-29"),
    value: 144478782.8548891
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-30"),
    value: 144527709.78000897
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-31"),
    value: 144258124.4700519
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-01"),
    value: 144290324.65936056
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-02"),
    value: 144470659.68672088
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-03"),
    value: 144142982.636332
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-04"),
    value: 144148698.89951187
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-05"),
    value: 144154415.16269165
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-06"),
    value: 144684282.98438033
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-07"),
    value: 144480208.6649626
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-08"),
    value: 144613253.22264302
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-09"),
    value: 144443558.86821103
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-10"),
    value: 144888183.15118462
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-11"),
    value: 144893899.4143645
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-12"),
    value: 144899615.67754415
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-13"),
    value: 145075464.87055805
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-14"),
    value: 145009550.97259128
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-15"),
    value: 144978450.52537724
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-16"),
    value: 144949508.23146257
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-17"),
    value: 145256197.3551461
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-18"),
    value: 145261913.61832595
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-19"),
    value: 145267629.8815059
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-20"),
    value: 145378961.40536928
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-21"),
    value: 145401351.31701243
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-22"),
    value: 145150668.82252297
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-23"),
    value: 144775345.6848413
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-24"),
    value: 145059555.52564475
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-25"),
    value: 145065271.7888244
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-26"),
    value: 145070988.05200437
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-27"),
    value: 145354292.44655746
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-28"),
    value: 145247133.03485537
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-29"),
    value: 145274807.8624902
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-30"),
    value: 145099940.62294272
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-31"),
    value: 145158308.1597919
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-01"),
    value: 145148826.93644437
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-02"),
    value: 145122819.09352133
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-03"),
    value: 145128535.3567012
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-04"),
    value: 145249306.35682496
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-05"),
    value: 145168418.2192961
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-06"),
    value: 145462213.15430757
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-07"),
    value: 145245154.5392507
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-08"),
    value: 145250870.80243057
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-09"),
    value: 145256587.0656103
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-10"),
    value: 145131856.28455886
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-11"),
    value: 145170599.01215407
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-12"),
    value: 145541353.8448038
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-13"),
    value: 145421138.2443991
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-14"),
    value: 145578217.4800052
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-15"),
    value: 145583933.74318525
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-16"),
    value: 145589650.00636506
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-17"),
    value: 145725589.20584416
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-18"),
    value: 146000028.3930375
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-19"),
    value: 146295167.11541703
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-20"),
    value: 146307055.27565256
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-21"),
    value: 146358657.2430451
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-22"),
    value: 146364373.506225
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-23"),
    value: 146370089.76940486
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-24"),
    value: 146240899.33731923
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-25"),
    value: 146393946.58684662
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-26"),
    value: 146161165.55283794
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-27"),
    value: 146273773.9806129
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-28"),
    value: 146549688.0470901
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-29"),
    value: 146555404.31027007
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-30"),
    value: 146371507.69002426
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-01"),
    value: 146655587.87257335
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-02"),
    value: 146587774.99325505
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-03"),
    value: 146397897.56676126
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-04"),
    value: 146332123.36160114
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-05"),
    value: 146317589.64947435
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-06"),
    value: 146323350.6902661
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-07"),
    value: 146329111.73105785
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-08"),
    value: 146318860.97546452
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-09"),
    value: 146435625.9166368
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-10"),
    value: 146366811.948874
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-11"),
    value: 146619731.8553632
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-12"),
    value: 146794713.78165394
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-13"),
    value: 146800474.82244584
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-14"),
    value: 146806235.86323762
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-15"),
    value: 146799615.96494347
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-16"),
    value: 146082988.8970866
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-17"),
    value: 146197633.19972345
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-18"),
    value: 146048027.71414778
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-19"),
    value: 145711301.96381962
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-20"),
    value: 145717063.00461143
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-21"),
    value: 145722824.04540324
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-22"),
    value: 145302318.62889832
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-23"),
    value: 145178253.0672455
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-24"),
    value: 145162321.61266172
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-25"),
    value: 145091855.65093735
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-26"),
    value: 144545594.89433584
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-27"),
    value: 144551355.93512776
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-28"),
    value: 144557116.9759197
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-29"),
    value: 144562878.01671144
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-30"),
    value: 144568639.05750325
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-31"),
    value: 144247780.62687343
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-01"),
    value: 144650983.4746692
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-02"),
    value: 144763166.47246882
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-03"),
    value: 144768882.73564863
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-04"),
    value: 144768882.73564863
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-05"),
    value: 144774598.99882853
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-06"),
    value: 145218772.3566291
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-07"),
    value: 144927454.09482896
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-08"),
    value: 144990801.1805222
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-09"),
    value: 145397273.7258744
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-10"),
    value: 145536951.68848625
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-11"),
    value: 145542667.9516662
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-12"),
    value: 145548384.21484601
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-13"),
    value: 145528459.85097384
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-14"),
    value: 145636201.8171889
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-15"),
    value: 144803265.64124915
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-16"),
    value: 143496041.2412383
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-17"),
    value: 143142154.40766943
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-18"),
    value: 143147870.67084917
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-19"),
    value: 143153586.9340291
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-20"),
    value: 144341718.38912696
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-21"),
    value: 144813541.4563326
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-22"),
    value: 144941767.59848338
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-23"),
    value: 144947483.86166334
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-24"),
    value: 145065770.37556776
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-25"),
    value: 145071486.63874763
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-26"),
    value: 145077202.9019276
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-27"),
    value: 145170536.11095315
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-28"),
    value: 145245161.8864964
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-29"),
    value: 145065620.6309899
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-30"),
    value: 145375245.05366015
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-01"),
    value: 145357736.65051827
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-02"),
    value: 145349813.80454504
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-03"),
    value: 145323850.739234
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-04"),
    value: 144855706.94809622
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-05"),
    value: 144995661.76745
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-06"),
    value: 145556842.08239365
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-07"),
    value: 145314777.00337687
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-08"),
    value: 144916548.86553055
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-09"),
    value: 144922309.9063224
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-10"),
    value: 144928070.94711417
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-11"),
    value: 144638458.5482586
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-12"),
    value: 144662972.24540296
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-13"),
    value: 144564726.14892486
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-14"),
    value: 144364021.59871978
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-15"),
    value: 144419626.66023448
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-16"),
    value: 144425387.7010263
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-17"),
    value: 144431148.74181813
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-18"),
    value: 143846645.25269663
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-19"),
    value: 143109904.21081686
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-20"),
    value: 143225592.03841266
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-21"),
    value: 143507885.00080588
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-22"),
    value: 143406407.25186712
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-23"),
    value: 143412168.29265913
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-24"),
    value: 143417929.333451
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-25"),
    value: 143751637.49805647
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-26"),
    value: 143757398.53884834
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-27"),
    value: 143341749.72067398
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-28"),
    value: 143212134.40898585
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-29"),
    value: 143181267.094594
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-30"),
    value: 143187028.1353858
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-31"),
    value: 143192789.17617756
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-01"),
    value: 142848511.7203191
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-02"),
    value: 142844382.34188128
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-03"),
    value: 143163765.9665751
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-04"),
    value: 143674599.81268877
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-05"),
    value: 143585185.00277412
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-06"),
    value: 143590901.265954
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-07"),
    value: 143596617.52913383
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-08"),
    value: 143760848.85183105
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-09"),
    value: 144216242.0872758
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-10"),
    value: 144356614.17128718
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-11"),
    value: 144298736.0857794
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-12"),
    value: 144486012.32494497
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-13"),
    value: 144491728.58812493
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-14"),
    value: 144497444.85130477
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-15"),
    value: 144662644.55798736
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-16"),
    value: 144740122.45877156
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-17"),
    value: 144474802.5515387
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-18"),
    value: 144680522.05457175
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-19"),
    value: 144710122.4604526
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-20"),
    value: 144715838.72363234
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-21"),
    value: 144721554.98681223
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-22"),
    value: 144727271.2499922
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-23"),
    value: 144907710.31820783
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-24"),
    value: 145040292.09856614
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-25"),
    value: 145018171.12013006
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-26"),
    value: 144727118.05241415
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-27"),
    value: 144732834.31559402
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-28"),
    value: 144738550.57877392
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-29"),
    value: 144782032.50082573
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-30"),
    value: 144685531.29331335
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-31"),
    value: 143453709.46490288
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-01"),
    value: 143346691.24930963
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-02"),
    value: 144478860.30366674
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-03"),
    value: 145774581.3162137
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-04"),
    value: 146048029.2132698
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-05"),
    value: 146135787.35759842
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-06"),
    value: 146500787.46945703
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-07"),
    value: 146909670.96847022
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-08"),
    value: 146855773.12444082
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-09"),
    value: 147025155.09693822
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-10"),
    value: 146689484.31881845
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-11"),
    value: 146867807.31375703
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-12"),
    value: 146054634.67071912
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-13"),
    value: 146542411.26989183
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-14"),
    value: 146173696.02017698
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-15"),
    value: 146212942.8741943
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-16"),
    value: 146508649.98134857
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-17"),
    value: 146509578.46083483
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-18"),
    value: 146308366.6524725
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-19"),
    value: 145359513.73498684
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-20"),
    value: 145432087.81133142
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-21"),
    value: 145641460.90323827
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-22"),
    value: 146256322.35111865
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-23"),
    value: 146533551.6286887
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-24"),
    value: 146904585.61921552
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-25"),
    value: 146696134.3664204
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-26"),
    value: 147060436.93349323
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-27"),
    value: 147988751.24782673
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-28"),
    value: 146962540.42196655
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-01"),
    value: 146944855.44129556
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-02"),
    value: 147526684.61012366
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-03"),
    value: 148209332.43828136
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-04"),
    value: 148041884.67249596
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-05"),
    value: 147611724.99014184
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-06"),
    value: 148182441.35844976
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-07"),
    value: 148511067.28565904
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-08"),
    value: 148195989.3563945
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-09"),
    value: 148730649.0797347
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-10"),
    value: 148427032.40095812
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-11"),
    value: 148311525.48608804
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-12"),
    value: 149238694.22886828
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-13"),
    value: 148899393.14549184
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-14"),
    value: 150078401.265228
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-15"),
    value: 149250145.30683494
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-16"),
    value: 148291038.56586236
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-17"),
    value: 149088492.20989147
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-18"),
    value: 148822078.763821
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-19"),
    value: 148864809.02329272
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-20"),
    value: 148537750.89909476
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-21"),
    value: 149437074.94077173
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-22"),
    value: 148904572.89707902
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-23"),
    value: 148504965.18426135
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-24"),
    value: 149360223.16222665
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-25"),
    value: 149037859.25414282
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-26"),
    value: 148083168.65110293
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-27"),
    value: 148002430.4473727
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-28"),
    value: 148341741.85250112
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-29"),
    value: 147478306.48313504
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-30"),
    value: 147922639.62026376
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-31"),
    value: 147916537.88936695
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-01"),
    value: 147494841.87075722
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-02"),
    value: 147474295.90045506
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-03"),
    value: 147713451.59621766
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-04"),
    value: 148453980.09985596
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-05"),
    value: 149049155.63437647
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-06"),
    value: 148376210.95018998
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-07"),
    value: 147063353.09115225
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-08"),
    value: 146730570.15469867
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-09"),
    value: 147417597.51534927
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-10"),
    value: 147278396.33282617
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-11"),
    value: 147964631.3955386
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-12"),
    value: 147762429.32750416
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-13"),
    value: 146838390.3578969
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-14"),
    value: 146813102.16000575
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-15"),
    value: 147347466.96970087
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-16"),
    value: 146849521.86814964
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-17"),
    value: 147477726.14491424
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-18"),
    value: 147180304.26644248
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-19"),
    value: 147736913.16995412
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-20"),
    value: 147510138.89495215
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-21"),
    value: 147273886.66620904
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-22"),
    value: 147355357.99112844
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-23"),
    value: 147498246.0319939
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-24"),
    value: 147378122.73411158
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-25"),
    value: 147600608.71973702
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-26"),
    value: 148227955.17983976
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-27"),
    value: 148943078.73780593
  }
];


})();

(function() {


App.data.value_p1m_p1y = [
  {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-16"),
    value: 142096015.71742177
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-16"),
    value: 141661910.47761345
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-16"),
    value: 142587026.35406846
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-16"),
    value: 144467260.77330536
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-16"),
    value: 145354292.44655746
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-16"),
    value: 146273773.9806129
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-16"),
    value: 144551355.93512776
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-16"),
    value: 145245161.8864964
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-16"),
    value: 143212134.40898585
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-16"),
    value: 144738550.57877392
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-16"),
    value: 146962540.42196655
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-16"),
    value: 148002430.4473727
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-16"),
    value: 148943078.73780593
  }
];


})();

(function() {


App.data.value_p1m_p2y = [
  {
    time: d3.time.format('%Y-%m-%d').parse("2011-04-16"),
    value: 3190223.5507746544
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-05-16"),
    value: 3245301.9554325156
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-06-16"),
    value: 3230163.670210492
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-07-16"),
    value: 3325536.918547862
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-08-16"),
    value: 3251300.4703723807
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-09-16"),
    value: 3284028.560462011
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-16"),
    value: 3264438.0366201736
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-16"),
    value: 3266342.571401255
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-16"),
    value: 3284136.8877116633
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-16"),
    value: 3337992.495441494
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-16"),
    value: 3375928.5946786683
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-16"),
    value: 3356169.374819465
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-16"),
    value: 3360868.9981094506
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-16"),
    value: 3350601.4981023436
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-16"),
    value: 3372482.4301829385
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-16"),
    value: 3416953.9203713667
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-16"),
    value: 3437934.081116352
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-16"),
    value: 3459681.7491740314
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-16"),
    value: 3418942.947444594
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-16"),
    value: 3435352.914331321
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-16"),
    value: 3387267.547637732
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-16"),
    value: 3423370.4936447185
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-16"),
    value: 3475972.5210721497
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-16"),
    value: 3500568.1026596064
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-16"),
    value: 3522816.408929701
  }
];


})();

(function() {


App.data.value_p1m_p5y = [
  {
    time: d3.time.format('%Y-%m-%d').parse("2008-04-16"),
    value: 3311114.0604923926
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2008-05-16"),
    value: 3331592.4548048945
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2008-06-16"),
    value: 3246793.985437408
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2008-07-16"),
    value: 3216418.5391796334
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2008-08-16"),
    value: 3213553.9005523846
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2008-09-16"),
    value: 3092714.786551858
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2008-10-16"),
    value: 2930946.512741252
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2008-11-16"),
    value: 2854250.2167194113
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2008-12-16"),
    value: 2913485.840780823
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2009-01-16"),
    value: 3016610.6814747374
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2009-02-16"),
    value: 2948083.104997659
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2009-03-16"),
    value: 2961709.574275372
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2009-04-16"),
    value: 3041706.6486371714
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2009-05-16"),
    value: 3062544.7850477956
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2009-06-16"),
    value: 3058043.930939135
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2009-07-16"),
    value: 3113738.301647409
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2009-08-16"),
    value: 3172425.4556713286
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2009-09-16"),
    value: 3258151.4626948545
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2009-10-16"),
    value: 3248688.4725350183
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2009-11-16"),
    value: 3253399.2784757484
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2009-12-16"),
    value: 3240427.727753935
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2010-01-16"),
    value: 3238904.6738555077
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2010-02-16"),
    value: 3243852.49958457
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2010-03-16"),
    value: 3251888.552827119
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2010-04-16"),
    value: 3254300.6870692233
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2010-05-16"),
    value: 3242083.2777588125
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2010-06-16"),
    value: 3266685.7461965503
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2010-07-16"),
    value: 3306758.4041393576
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2010-08-16"),
    value: 3356775.4674698
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2010-09-16"),
    value: 3343915.557226786
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2010-10-16"),
    value: 3308509.302515077
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2010-11-16"),
    value: 3288896.0677231885
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2010-12-16"),
    value: 3144436.3479517754
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-01-16"),
    value: 3142095.1739693554
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-02-16"),
    value: 3141382.689501446
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-03-16"),
    value: 3163166.111736495
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-04-16"),
    value: 3190223.5507746544
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-05-16"),
    value: 3245301.9554325156
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-06-16"),
    value: 3230163.670210492
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-07-16"),
    value: 3325536.918547862
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-08-16"),
    value: 3251300.4703723807
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-09-16"),
    value: 3284028.560462011
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-16"),
    value: 3264438.0366201736
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-16"),
    value: 3266342.571401255
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-16"),
    value: 3284136.8877116633
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-16"),
    value: 3337992.495441494
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-16"),
    value: 3375928.5946786683
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-16"),
    value: 3356169.374819465
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-16"),
    value: 3360868.9981094506
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-16"),
    value: 3350601.4981023436
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-16"),
    value: 3372482.4301829385
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-16"),
    value: 3416953.9203713667
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-16"),
    value: 3437934.081116352
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-16"),
    value: 3459681.7491740314
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-16"),
    value: 3418942.947444594
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-16"),
    value: 3435352.914331321
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-16"),
    value: 3387267.547637732
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-16"),
    value: 3423370.4936447185
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-16"),
    value: 3475972.5210721497
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-16"),
    value: 3500568.1026596064
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-16"),
    value: 3522816.408929701
  }
];


})();

(function() {


App.data.value_p1w_p1y = [
  {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-27"),
    value: 142096015.71742177
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-04"),
    value: 142242949.3474151
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-11"),
    value: 142879047.3289037
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-18"),
    value: 141562047.31745562
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-05-25"),
    value: 141650388.39602995
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-01"),
    value: 141726021.2603996
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-08"),
    value: 141777621.6139829
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-15"),
    value: 141541110.47410873
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-22"),
    value: 142048227.09659773
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-06-29"),
    value: 142689919.52744088
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-06"),
    value: 143614882.80853003
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-13"),
    value: 144178940.09335265
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-20"),
    value: 144314375.18902957
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-07-27"),
    value: 144467260.77330536
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-03"),
    value: 144142982.636332
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-10"),
    value: 144888183.15118462
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-17"),
    value: 145256197.3551461
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-24"),
    value: 145059555.52564475
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-08-31"),
    value: 145158308.1597919
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-07"),
    value: 145245154.5392507
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-14"),
    value: 145578217.4800052
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-21"),
    value: 146358657.2430451
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-09-28"),
    value: 146549688.0470901
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-05"),
    value: 146317589.64947435
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-12"),
    value: 146794713.78165394
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-19"),
    value: 145711301.96381962
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-10-26"),
    value: 144545594.89433584
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-02"),
    value: 144763166.47246882
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-10"),
    value: 145536951.68848625
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-17"),
    value: 143142154.40766943
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-11-24"),
    value: 145065770.37556776
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-01"),
    value: 145357736.65051827
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-08"),
    value: 144916548.86553055
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-15"),
    value: 144419626.66023448
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-22"),
    value: 143406407.25186712
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-12-29"),
    value: 143181267.094594
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-05"),
    value: 143585185.00277412
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-12"),
    value: 144486012.32494497
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-19"),
    value: 144710122.4604526
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-01-26"),
    value: 144727118.05241415
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-02"),
    value: 144478860.30366674
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-09"),
    value: 147025155.09693822
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-16"),
    value: 146508649.98134857
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-02-23"),
    value: 146533551.6286887
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-02"),
    value: 147526684.61012366
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-09"),
    value: 148730649.0797347
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-15"),
    value: 149250145.30683494
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-22"),
    value: 148904572.89707902
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-03-29"),
    value: 147478306.48313504
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-05"),
    value: 149049155.63437647
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-12"),
    value: 147762429.32750416
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-19"),
    value: 147736913.16995412
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-26"),
    value: 148227955.17983976
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-04-27"),
    value: 148943078.73780593
  }
];


})();

(function() {


App.data.zeroes_ungrouped = [
  {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 0
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 0
  }
];


})();

(function() {


App.data.same_value_ungrouped = [
  {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: -100
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: -100
  }
];


})();

(function() {


App.data.monthly_return_single_series = [
  {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Financial analytics software",
    value: 49668,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Financial analytics software",
    value: 68344,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Financial analytics software",
    value: 60654,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    label: "Financial analytics software",
    value: 48240,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    label: "Financial analytics software",
    value: 62074,
    type: "money"
  }
];


})();

(function() {


App.data.monthly_return_double_series = [
  {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Software & Programming",
    value: 17326,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Telecommunication",
    value: 4515,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Software & Programming",
    value: 15326,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Telecommunication",
    value: 1515,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Software & Programming",
    value: 14326,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Telecommunication",
    value: 8518,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    label: "Software & Programming",
    value: 42301,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    label: "Telecommunication",
    value: 90191,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    label: "Software & Programming",
    value: 57326,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    label: "Telecommunication",
    value: 39544,
    type: "money"
  }
];


})();

(function() {


App.data.monthly_return_triple_series = [
  {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Software & Programming",
    value: 63540,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Telecommunication",
    value: 31005,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Financial analytics software",
    value: 69669,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Software & Programming",
    value: 74860,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Telecommunication",
    value: 14513,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Financial analytics software",
    value: 68344,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Software & Programming",
    value: 65435,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Telecommunication",
    value: 40913,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Financial analytics software",
    value: 60659,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    label: "Software & Programming",
    value: 50241,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    label: "Telecommunication",
    value: 30441,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    label: "Financial analytics software",
    value: 48244,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    label: "Software & Programming",
    value: 67326,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    label: "Telecommunication",
    value: 17778,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    label: "Financial analytics software",
    value: 62079,
    type: "money"
  }
];


})();

(function() {


App.data.monthly_return_single_period = [
  {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Insurance companies",
    value: 3.50,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Internet, software & IT services",
    value: 2.20,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Investment Fund",
    value: 1.50,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Investment trusts/funds + pension funds",
    value: 1.90,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Software & Programming",
    value: 5.00,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Telecommunication",
    value: 2.50,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Financial analytics software",
    value: 4.40,
    type: "money"
  }
];


})();

(function() {


App.data.monthly_return_double_period = [
  {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Insurance companies",
    value: 4.50,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Internet, software & IT services",
    value: 6.10,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Investment Fund",
    value: 4.80,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Investment trusts/funds + pension funds",
    value: 5.50,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Software & Programming",
    value: 4.30,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Telecommunication",
    value: 6.90,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Financial analytics software",
    value: 2.80,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Insurance companies",
    value: 1.70,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Internet, software & IT services",
    value: 2.40,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Investment Fund",
    value: 4.00,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Investment trusts/funds + pension funds",
    value: 2.50,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Software & Programming",
    value: 1.40,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Telecommunication",
    value: 2.10,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Financial analytics software",
    value: 1.30,
    type: "money"
  }
];


})();

(function() {


App.data.monthly_return_negative_period = [
  {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Insurance companies",
    value: -1.50,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Internet, software & IT services",
    value: -3.10,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Investment Fund",
    value: -1.80,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Investment trusts/funds + pension funds",
    value: -2.50,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Software & Programming",
    value: -1.30,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Telecommunication",
    value: -3.90,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    label: "Financial analytics software",
    value: -1.80,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Insurance companies",
    value: -2.70,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Internet, software & IT services",
    value: -1.40,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Investment Fund",
    value: -0.30,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Investment trusts/funds + pension funds",
    value: -1.50,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Software & Programming",
    value: -2.40,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Telecommunication",
    value: -1.10,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    label: "Financial analytics software",
    value: -2.30,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Insurance companies",
    value: 0.50,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Internet, software & IT services",
    value: -1.20,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Investment Fund",
    value: -2.50,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Investment trusts/funds + pension funds",
    value: -2.90,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Software & Programming",
    value: 2.00,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Telecommunication",
    value: -1.50,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    label: "Financial analytics software",
    value: 1.40,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    label: "Insurance companies",
    value: 1.40,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    label: "Internet, software & IT services",
    value: -0.10,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    label: "Investment Fund",
    value: -0.40,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    label: "Investment trusts/funds + pension funds",
    value: -0.80,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    label: "Software & Programming",
    value: 1.20,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    label: "Telecommunication",
    value: -0.80,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    label: "Financial analytics software",
    value: 2.20,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    label: "Insurance companies",
    value: 0.60,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    label: "Internet, software & IT services",
    value: 0.30,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    label: "Investment Fund",
    value: 1.40,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    label: "Investment trusts/funds + pension funds",
    value: 1.60,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    label: "Software & Programming",
    value: 2.30,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    label: "Telecommunication",
    value: 1.40,
    type: "money"
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    label: "Financial analytics software",
    value: 3.50,
    type: "money"
  }
];


})();

(function() {


App.data.population = [
  {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-01"),
    label: "San Francisco",
    value: 63.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-01"),
    label: "New York",
    value: 62.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-01"),
    label: "Boston",
    value: 72.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-02"),
    label: "San Francisco",
    value: 58
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-02"),
    label: "New York",
    value: 59.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-02"),
    label: "Boston",
    value: 67.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-03"),
    label: "San Francisco",
    value: 53.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-03"),
    label: "New York",
    value: 59.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-03"),
    label: "Boston",
    value: 69.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-04"),
    label: "San Francisco",
    value: 55.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-04"),
    label: "New York",
    value: 58.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-04"),
    label: "Boston",
    value: 68
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-05"),
    label: "San Francisco",
    value: 64.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-05"),
    label: "New York",
    value: 58.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-05"),
    label: "Boston",
    value: 72.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-06"),
    label: "San Francisco",
    value: 58.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-06"),
    label: "New York",
    value: 57
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-06"),
    label: "Boston",
    value: 77
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-07"),
    label: "San Francisco",
    value: 57.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-07"),
    label: "New York",
    value: 56.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-07"),
    label: "Boston",
    value: 82.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-08"),
    label: "San Francisco",
    value: 61.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-08"),
    label: "New York",
    value: 56.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-08"),
    label: "Boston",
    value: 78.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-09"),
    label: "San Francisco",
    value: 69.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-09"),
    label: "New York",
    value: 56.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-09"),
    label: "Boston",
    value: 68.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-10"),
    label: "San Francisco",
    value: 71.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-10"),
    label: "New York",
    value: 60.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-10"),
    label: "Boston",
    value: 68.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-11"),
    label: "San Francisco",
    value: 68.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-11"),
    label: "New York",
    value: 61.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-11"),
    label: "Boston",
    value: 70.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-12"),
    label: "San Francisco",
    value: 61.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-12"),
    label: "New York",
    value: 61.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-12"),
    label: "Boston",
    value: 75.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-13"),
    label: "San Francisco",
    value: 63
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-13"),
    label: "New York",
    value: 64.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-13"),
    label: "Boston",
    value: 76.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-14"),
    label: "San Francisco",
    value: 66.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-14"),
    label: "New York",
    value: 67.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-14"),
    label: "Boston",
    value: 66.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-15"),
    label: "San Francisco",
    value: 61.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-15"),
    label: "New York",
    value: 64.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-15"),
    label: "Boston",
    value: 68
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-16"),
    label: "San Francisco",
    value: 61.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-16"),
    label: "New York",
    value: 61.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-16"),
    label: "Boston",
    value: 70.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-17"),
    label: "San Francisco",
    value: 62.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-17"),
    label: "New York",
    value: 61.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-17"),
    label: "Boston",
    value: 71.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-18"),
    label: "San Francisco",
    value: 60.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-18"),
    label: "New York",
    value: 59.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-18"),
    label: "Boston",
    value: 70
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-19"),
    label: "San Francisco",
    value: 62.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-19"),
    label: "New York",
    value: 58.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-19"),
    label: "Boston",
    value: 61.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-20"),
    label: "San Francisco",
    value: 65.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-20"),
    label: "New York",
    value: 57.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-20"),
    label: "Boston",
    value: 57.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-21"),
    label: "San Francisco",
    value: 55.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-21"),
    label: "New York",
    value: 56.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-21"),
    label: "Boston",
    value: 64.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-22"),
    label: "San Francisco",
    value: 54.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-22"),
    label: "New York",
    value: 60.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-22"),
    label: "Boston",
    value: 72.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-23"),
    label: "San Francisco",
    value: 54.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-23"),
    label: "New York",
    value: 65.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-23"),
    label: "Boston",
    value: 72.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-24"),
    label: "San Francisco",
    value: 54.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-24"),
    label: "New York",
    value: 60.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-24"),
    label: "Boston",
    value: 72.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-25"),
    label: "San Francisco",
    value: 57.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-25"),
    label: "New York",
    value: 56.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-25"),
    label: "Boston",
    value: 72.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-26"),
    label: "San Francisco",
    value: 54.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-26"),
    label: "New York",
    value: 54.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-26"),
    label: "Boston",
    value: 73.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-27"),
    label: "San Francisco",
    value: 54.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-27"),
    label: "New York",
    value: 56.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-27"),
    label: "Boston",
    value: 70.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-28"),
    label: "San Francisco",
    value: 42.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-28"),
    label: "New York",
    value: 58.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-28"),
    label: "Boston",
    value: 56.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-29"),
    label: "San Francisco",
    value: 40.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-29"),
    label: "New York",
    value: 57.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-29"),
    label: "Boston",
    value: 51
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-30"),
    label: "San Francisco",
    value: 38.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-30"),
    label: "New York",
    value: 57.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-30"),
    label: "Boston",
    value: 54.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-31"),
    label: "San Francisco",
    value: 44.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-31"),
    label: "New York",
    value: 55.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-10-31"),
    label: "Boston",
    value: 58.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-01"),
    label: "San Francisco",
    value: 49.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-01"),
    label: "New York",
    value: 57.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-01"),
    label: "Boston",
    value: 62.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-02"),
    label: "San Francisco",
    value: 47.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-02"),
    label: "New York",
    value: 64.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-02"),
    label: "Boston",
    value: 71
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-03"),
    label: "San Francisco",
    value: 50.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-03"),
    label: "New York",
    value: 56.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-03"),
    label: "Boston",
    value: 58.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-04"),
    label: "San Francisco",
    value: 50.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-04"),
    label: "New York",
    value: 50.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-04"),
    label: "Boston",
    value: 45.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-05"),
    label: "San Francisco",
    value: 43.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-05"),
    label: "New York",
    value: 51.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-05"),
    label: "Boston",
    value: 52.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-06"),
    label: "San Francisco",
    value: 43.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-06"),
    label: "New York",
    value: 52.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-06"),
    label: "Boston",
    value: 73
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-07"),
    label: "San Francisco",
    value: 48.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-07"),
    label: "New York",
    value: 51.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-07"),
    label: "Boston",
    value: 75.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-08"),
    label: "San Francisco",
    value: 55.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-08"),
    label: "New York",
    value: 50.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-08"),
    label: "Boston",
    value: 72.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-09"),
    label: "San Francisco",
    value: 53.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-09"),
    label: "New York",
    value: 54.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-09"),
    label: "Boston",
    value: 56.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-10"),
    label: "San Francisco",
    value: 57.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-10"),
    label: "New York",
    value: 55.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-10"),
    label: "Boston",
    value: 55.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-11"),
    label: "San Francisco",
    value: 48.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-11"),
    label: "New York",
    value: 53.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-11"),
    label: "Boston",
    value: 46.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-12"),
    label: "San Francisco",
    value: 46.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-12"),
    label: "New York",
    value: 54
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-12"),
    label: "Boston",
    value: 62
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-13"),
    label: "San Francisco",
    value: 51.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-13"),
    label: "New York",
    value: 53.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-13"),
    label: "Boston",
    value: 71.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-14"),
    label: "San Francisco",
    value: 56.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-14"),
    label: "New York",
    value: 53.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-14"),
    label: "Boston",
    value: 75.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-15"),
    label: "San Francisco",
    value: 59.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-15"),
    label: "New York",
    value: 53.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-15"),
    label: "Boston",
    value: 72.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-16"),
    label: "San Francisco",
    value: 56.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-16"),
    label: "New York",
    value: 52.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-16"),
    label: "Boston",
    value: 65.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-17"),
    label: "San Francisco",
    value: 49.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-17"),
    label: "New York",
    value: 52.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-17"),
    label: "Boston",
    value: 56.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-18"),
    label: "San Francisco",
    value: 41.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-18"),
    label: "New York",
    value: 53.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-18"),
    label: "Boston",
    value: 49.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-19"),
    label: "San Francisco",
    value: 44.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-19"),
    label: "New York",
    value: 49
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-19"),
    label: "Boston",
    value: 71.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-20"),
    label: "San Francisco",
    value: 54
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-20"),
    label: "New York",
    value: 50.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-20"),
    label: "Boston",
    value: 77.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-21"),
    label: "San Francisco",
    value: 54.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-21"),
    label: "New York",
    value: 51.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-21"),
    label: "Boston",
    value: 76.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-22"),
    label: "San Francisco",
    value: 49.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-22"),
    label: "New York",
    value: 52.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-22"),
    label: "Boston",
    value: 68.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-23"),
    label: "San Francisco",
    value: 50
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-23"),
    label: "New York",
    value: 54.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-23"),
    label: "Boston",
    value: 57
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-24"),
    label: "San Francisco",
    value: 44
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-24"),
    label: "New York",
    value: 55.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-24"),
    label: "Boston",
    value: 55.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-25"),
    label: "San Francisco",
    value: 50.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-25"),
    label: "New York",
    value: 51.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-25"),
    label: "Boston",
    value: 61.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-26"),
    label: "San Francisco",
    value: 52.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-26"),
    label: "New York",
    value: 53.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-26"),
    label: "Boston",
    value: 64.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-27"),
    label: "San Francisco",
    value: 49.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-27"),
    label: "New York",
    value: 52.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-27"),
    label: "Boston",
    value: 51.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-28"),
    label: "San Francisco",
    value: 57.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-28"),
    label: "New York",
    value: 51
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-28"),
    label: "Boston",
    value: 43
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-29"),
    label: "San Francisco",
    value: 59.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-29"),
    label: "New York",
    value: 49.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-29"),
    label: "Boston",
    value: 46.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-30"),
    label: "San Francisco",
    value: 50.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-30"),
    label: "New York",
    value: 49.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-11-30"),
    label: "Boston",
    value: 48
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-01"),
    label: "San Francisco",
    value: 44.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-01"),
    label: "New York",
    value: 60.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-01"),
    label: "Boston",
    value: 48.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-02"),
    label: "San Francisco",
    value: 43.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-02"),
    label: "New York",
    value: 62.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-02"),
    label: "Boston",
    value: 60.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-03"),
    label: "San Francisco",
    value: 42.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-03"),
    label: "New York",
    value: 58.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-03"),
    label: "Boston",
    value: 62.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-04"),
    label: "San Francisco",
    value: 43.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-04"),
    label: "New York",
    value: 52.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-04"),
    label: "Boston",
    value: 57.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-05"),
    label: "San Francisco",
    value: 50.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-05"),
    label: "New York",
    value: 51.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-05"),
    label: "Boston",
    value: 44.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-06"),
    label: "San Francisco",
    value: 54.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-06"),
    label: "New York",
    value: 49.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-06"),
    label: "Boston",
    value: 37.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-07"),
    label: "San Francisco",
    value: 54.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-07"),
    label: "New York",
    value: 48.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-07"),
    label: "Boston",
    value: 35
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-08"),
    label: "San Francisco",
    value: 43.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-08"),
    label: "New York",
    value: 46.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-08"),
    label: "Boston",
    value: 37
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-09"),
    label: "San Francisco",
    value: 42.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-09"),
    label: "New York",
    value: 49.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-09"),
    label: "Boston",
    value: 45.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-10"),
    label: "San Francisco",
    value: 45
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-10"),
    label: "New York",
    value: 52.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-10"),
    label: "Boston",
    value: 50.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-11"),
    label: "San Francisco",
    value: 33.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-11"),
    label: "New York",
    value: 48.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-11"),
    label: "Boston",
    value: 48.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-12"),
    label: "San Francisco",
    value: 36.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-12"),
    label: "New York",
    value: 47.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-12"),
    label: "Boston",
    value: 52.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-13"),
    label: "San Francisco",
    value: 38.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-13"),
    label: "New York",
    value: 47.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-13"),
    label: "Boston",
    value: 60.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-14"),
    label: "San Francisco",
    value: 41.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-14"),
    label: "New York",
    value: 46.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-14"),
    label: "Boston",
    value: 70
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-15"),
    label: "San Francisco",
    value: 49.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-15"),
    label: "New York",
    value: 48.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-15"),
    label: "Boston",
    value: 64.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-16"),
    label: "San Francisco",
    value: 50.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-16"),
    label: "New York",
    value: 47.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-16"),
    label: "Boston",
    value: 50.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-17"),
    label: "San Francisco",
    value: 40.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-17"),
    label: "New York",
    value: 49.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-17"),
    label: "Boston",
    value: 51.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-18"),
    label: "San Francisco",
    value: 29.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-18"),
    label: "New York",
    value: 49.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-18"),
    label: "Boston",
    value: 55.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-19"),
    label: "San Francisco",
    value: 33.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-19"),
    label: "New York",
    value: 48.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-19"),
    label: "Boston",
    value: 62.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-20"),
    label: "San Francisco",
    value: 45.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-20"),
    label: "New York",
    value: 49.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-20"),
    label: "Boston",
    value: 56.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-21"),
    label: "San Francisco",
    value: 47.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-21"),
    label: "New York",
    value: 48.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-21"),
    label: "Boston",
    value: 47.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-22"),
    label: "San Francisco",
    value: 54.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-22"),
    label: "New York",
    value: 53.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-22"),
    label: "Boston",
    value: 52.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-23"),
    label: "San Francisco",
    value: 47.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-23"),
    label: "New York",
    value: 47.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-23"),
    label: "Boston",
    value: 45.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-24"),
    label: "San Francisco",
    value: 34.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-24"),
    label: "New York",
    value: 47.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-24"),
    label: "Boston",
    value: 43.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-25"),
    label: "San Francisco",
    value: 35.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-25"),
    label: "New York",
    value: 48.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-25"),
    label: "Boston",
    value: 42.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-26"),
    label: "San Francisco",
    value: 43.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-26"),
    label: "New York",
    value: 45.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-26"),
    label: "Boston",
    value: 48.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-27"),
    label: "San Francisco",
    value: 42.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-27"),
    label: "New York",
    value: 47.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-27"),
    label: "Boston",
    value: 45.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-28"),
    label: "San Francisco",
    value: 46.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-28"),
    label: "New York",
    value: 48.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-28"),
    label: "Boston",
    value: 44.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-29"),
    label: "San Francisco",
    value: 30.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-29"),
    label: "New York",
    value: 50.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-29"),
    label: "Boston",
    value: 50.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-30"),
    label: "San Francisco",
    value: 40.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-30"),
    label: "New York",
    value: 52.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-30"),
    label: "Boston",
    value: 52.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-31"),
    label: "San Francisco",
    value: 49.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-31"),
    label: "New York",
    value: 50.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2011-12-31"),
    label: "Boston",
    value: 53.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-01"),
    label: "San Francisco",
    value: 46.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-01"),
    label: "New York",
    value: 53.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-01"),
    label: "Boston",
    value: 55.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-02"),
    label: "San Francisco",
    value: 43.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-02"),
    label: "New York",
    value: 53.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-02"),
    label: "Boston",
    value: 48.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-03"),
    label: "San Francisco",
    value: 30.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-03"),
    label: "New York",
    value: 49.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-03"),
    label: "Boston",
    value: 41
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-04"),
    label: "San Francisco",
    value: 19.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-04"),
    label: "New York",
    value: 52.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-04"),
    label: "Boston",
    value: 48.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-05"),
    label: "San Francisco",
    value: 32.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-05"),
    label: "New York",
    value: 52.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-05"),
    label: "Boston",
    value: 54.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-06"),
    label: "San Francisco",
    value: 41.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-06"),
    label: "New York",
    value: 49
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-06"),
    label: "Boston",
    value: 61.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-07"),
    label: "San Francisco",
    value: 47
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-07"),
    label: "New York",
    value: 51
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-07"),
    label: "Boston",
    value: 59.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-08"),
    label: "San Francisco",
    value: 46
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-08"),
    label: "New York",
    value: 56.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-08"),
    label: "Boston",
    value: 52.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-09"),
    label: "San Francisco",
    value: 34.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-09"),
    label: "New York",
    value: 52.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-09"),
    label: "Boston",
    value: 54
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-10"),
    label: "San Francisco",
    value: 39.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-10"),
    label: "New York",
    value: 51.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-10"),
    label: "Boston",
    value: 47.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-11"),
    label: "San Francisco",
    value: 40.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-11"),
    label: "New York",
    value: 49.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-11"),
    label: "Boston",
    value: 49.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-12"),
    label: "San Francisco",
    value: 45.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-12"),
    label: "New York",
    value: 51.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-12"),
    label: "Boston",
    value: 48.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-13"),
    label: "San Francisco",
    value: 40.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-13"),
    label: "New York",
    value: 53.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-13"),
    label: "Boston",
    value: 40.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-14"),
    label: "San Francisco",
    value: 30.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-14"),
    label: "New York",
    value: 52.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-14"),
    label: "Boston",
    value: 43.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-15"),
    label: "San Francisco",
    value: 23.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-15"),
    label: "New York",
    value: 49.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-15"),
    label: "Boston",
    value: 45.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-16"),
    label: "San Francisco",
    value: 22.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-16"),
    label: "New York",
    value: 45.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-16"),
    label: "Boston",
    value: 65
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-17"),
    label: "San Francisco",
    value: 39.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-17"),
    label: "New York",
    value: 43.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-17"),
    label: "Boston",
    value: 68.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-18"),
    label: "San Francisco",
    value: 43.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-18"),
    label: "New York",
    value: 45
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-18"),
    label: "Boston",
    value: 47.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-19"),
    label: "San Francisco",
    value: 26.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-19"),
    label: "New York",
    value: 47.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-19"),
    label: "Boston",
    value: 57.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-20"),
    label: "San Francisco",
    value: 32.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-20"),
    label: "New York",
    value: 51.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-20"),
    label: "Boston",
    value: 61.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-21"),
    label: "San Francisco",
    value: 27.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-21"),
    label: "New York",
    value: 53.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-21"),
    label: "Boston",
    value: 54.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-22"),
    label: "San Francisco",
    value: 25
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-22"),
    label: "New York",
    value: 48.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-22"),
    label: "Boston",
    value: 56.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-23"),
    label: "San Francisco",
    value: 39.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-23"),
    label: "New York",
    value: 52.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-23"),
    label: "Boston",
    value: 54.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-24"),
    label: "San Francisco",
    value: 48.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-24"),
    label: "New York",
    value: 49.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-24"),
    label: "Boston",
    value: 52.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-25"),
    label: "San Francisco",
    value: 43
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-25"),
    label: "New York",
    value: 52.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-25"),
    label: "Boston",
    value: 61.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-26"),
    label: "San Francisco",
    value: 37.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-26"),
    label: "New York",
    value: 53.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-26"),
    label: "Boston",
    value: 55
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-27"),
    label: "San Francisco",
    value: 48.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-27"),
    label: "New York",
    value: 50.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-27"),
    label: "Boston",
    value: 50.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-28"),
    label: "San Francisco",
    value: 43.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-28"),
    label: "New York",
    value: 50.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-28"),
    label: "Boston",
    value: 52.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-29"),
    label: "San Francisco",
    value: 40.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-29"),
    label: "New York",
    value: 53.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-29"),
    label: "Boston",
    value: 44.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-30"),
    label: "San Francisco",
    value: 38
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-30"),
    label: "New York",
    value: 51.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-30"),
    label: "Boston",
    value: 49.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-31"),
    label: "San Francisco",
    value: 43.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-31"),
    label: "New York",
    value: 50
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-01-31"),
    label: "Boston",
    value: 62.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-01"),
    label: "San Francisco",
    value: 50.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-01"),
    label: "New York",
    value: 50
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-01"),
    label: "Boston",
    value: 64.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-02"),
    label: "San Francisco",
    value: 45.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-02"),
    label: "New York",
    value: 51.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-02"),
    label: "Boston",
    value: 61.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-03"),
    label: "San Francisco",
    value: 37.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-03"),
    label: "New York",
    value: 51.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-03"),
    label: "Boston",
    value: 70
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-04"),
    label: "San Francisco",
    value: 40.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-04"),
    label: "New York",
    value: 52
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-04"),
    label: "Boston",
    value: 61.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-05"),
    label: "San Francisco",
    value: 36.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-05"),
    label: "New York",
    value: 53.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-05"),
    label: "Boston",
    value: 48.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-06"),
    label: "San Francisco",
    value: 39.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-06"),
    label: "New York",
    value: 54.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-06"),
    label: "Boston",
    value: 44.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-07"),
    label: "San Francisco",
    value: 43.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-07"),
    label: "New York",
    value: 54.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-07"),
    label: "Boston",
    value: 51.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-08"),
    label: "San Francisco",
    value: 36.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-08"),
    label: "New York",
    value: 51.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-08"),
    label: "Boston",
    value: 49.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-09"),
    label: "San Francisco",
    value: 36.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-09"),
    label: "New York",
    value: 53.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-09"),
    label: "Boston",
    value: 45.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-10"),
    label: "San Francisco",
    value: 38.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-10"),
    label: "New York",
    value: 53.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-10"),
    label: "Boston",
    value: 54.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-11"),
    label: "San Francisco",
    value: 36.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-11"),
    label: "New York",
    value: 52.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-11"),
    label: "Boston",
    value: 44.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-12"),
    label: "San Francisco",
    value: 29.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-12"),
    label: "New York",
    value: 50.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-12"),
    label: "Boston",
    value: 36.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-13"),
    label: "San Francisco",
    value: 33.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-13"),
    label: "New York",
    value: 49.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-13"),
    label: "Boston",
    value: 44.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-14"),
    label: "San Francisco",
    value: 39.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-14"),
    label: "New York",
    value: 48.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-14"),
    label: "Boston",
    value: 52.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-15"),
    label: "San Francisco",
    value: 42.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-15"),
    label: "New York",
    value: 49.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-15"),
    label: "Boston",
    value: 68
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-16"),
    label: "San Francisco",
    value: 39.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-16"),
    label: "New York",
    value: 52.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-16"),
    label: "Boston",
    value: 54.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-17"),
    label: "San Francisco",
    value: 46
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-17"),
    label: "New York",
    value: 49.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-17"),
    label: "Boston",
    value: 53.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-18"),
    label: "San Francisco",
    value: 41.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-18"),
    label: "New York",
    value: 51.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-18"),
    label: "Boston",
    value: 56.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-19"),
    label: "San Francisco",
    value: 39.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-19"),
    label: "New York",
    value: 47.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-19"),
    label: "Boston",
    value: 50.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-20"),
    label: "San Francisco",
    value: 38.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-20"),
    label: "New York",
    value: 48.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-20"),
    label: "Boston",
    value: 53
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-21"),
    label: "San Francisco",
    value: 37.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-21"),
    label: "New York",
    value: 49.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-21"),
    label: "Boston",
    value: 61
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-22"),
    label: "San Francisco",
    value: 45.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-22"),
    label: "New York",
    value: 53.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-22"),
    label: "Boston",
    value: 68.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-23"),
    label: "San Francisco",
    value: 50.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-23"),
    label: "New York",
    value: 54.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-23"),
    label: "Boston",
    value: 69.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-24"),
    label: "San Francisco",
    value: 42.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-24"),
    label: "New York",
    value: 55.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-24"),
    label: "Boston",
    value: 59.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-25"),
    label: "San Francisco",
    value: 42.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-25"),
    label: "New York",
    value: 51.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-25"),
    label: "Boston",
    value: 47.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-26"),
    label: "San Francisco",
    value: 36.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-26"),
    label: "New York",
    value: 47.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-26"),
    label: "Boston",
    value: 47.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-27"),
    label: "San Francisco",
    value: 40.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-27"),
    label: "New York",
    value: 45.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-27"),
    label: "Boston",
    value: 61.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-28"),
    label: "San Francisco",
    value: 45.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-28"),
    label: "New York",
    value: 47
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-28"),
    label: "Boston",
    value: 67.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-29"),
    label: "San Francisco",
    value: 40.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-29"),
    label: "New York",
    value: 49.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-02-29"),
    label: "Boston",
    value: 70.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-01"),
    label: "San Francisco",
    value: 41.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-01"),
    label: "New York",
    value: 48.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-01"),
    label: "Boston",
    value: 62.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-02"),
    label: "San Francisco",
    value: 36.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-02"),
    label: "New York",
    value: 48.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-02"),
    label: "Boston",
    value: 72.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-03"),
    label: "San Francisco",
    value: 47.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-03"),
    label: "New York",
    value: 50.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-03"),
    label: "Boston",
    value: 59
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-04"),
    label: "San Francisco",
    value: 44.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-04"),
    label: "New York",
    value: 55
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-04"),
    label: "Boston",
    value: 51.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-05"),
    label: "San Francisco",
    value: 38.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-05"),
    label: "New York",
    value: 48.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-05"),
    label: "Boston",
    value: 55
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-06"),
    label: "San Francisco",
    value: 32.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-06"),
    label: "New York",
    value: 48.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-06"),
    label: "Boston",
    value: 61.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-07"),
    label: "San Francisco",
    value: 43.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-07"),
    label: "New York",
    value: 49.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-07"),
    label: "Boston",
    value: 67.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-08"),
    label: "San Francisco",
    value: 51.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-08"),
    label: "New York",
    value: 49.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-08"),
    label: "Boston",
    value: 72
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-09"),
    label: "San Francisco",
    value: 47.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-09"),
    label: "New York",
    value: 51.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-09"),
    label: "Boston",
    value: 46.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-10"),
    label: "San Francisco",
    value: 37.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-10"),
    label: "New York",
    value: 49.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-10"),
    label: "Boston",
    value: 46.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-11"),
    label: "San Francisco",
    value: 42.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-11"),
    label: "New York",
    value: 50
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-11"),
    label: "Boston",
    value: 56.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-12"),
    label: "San Francisco",
    value: 48.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-12"),
    label: "New York",
    value: 48.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-12"),
    label: "Boston",
    value: 61.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-13"),
    label: "San Francisco",
    value: 52.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-13"),
    label: "New York",
    value: 53.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-13"),
    label: "Boston",
    value: 68.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-14"),
    label: "San Francisco",
    value: 60.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-14"),
    label: "New York",
    value: 55.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-14"),
    label: "Boston",
    value: 71.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-15"),
    label: "San Francisco",
    value: 47.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-15"),
    label: "New York",
    value: 55.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-15"),
    label: "Boston",
    value: 72
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-16"),
    label: "San Francisco",
    value: 44.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-16"),
    label: "New York",
    value: 54.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-16"),
    label: "Boston",
    value: 72.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-17"),
    label: "San Francisco",
    value: 48.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-17"),
    label: "New York",
    value: 48.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-17"),
    label: "Boston",
    value: 71.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-18"),
    label: "San Francisco",
    value: 48.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-18"),
    label: "New York",
    value: 47.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-18"),
    label: "Boston",
    value: 71.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-19"),
    label: "San Francisco",
    value: 53.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-19"),
    label: "New York",
    value: 45.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-19"),
    label: "Boston",
    value: 73
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-20"),
    label: "San Francisco",
    value: 57.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-20"),
    label: "New York",
    value: 49.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-20"),
    label: "Boston",
    value: 63.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-21"),
    label: "San Francisco",
    value: 57.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-21"),
    label: "New York",
    value: 51.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-21"),
    label: "Boston",
    value: 60
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-22"),
    label: "San Francisco",
    value: 57.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-22"),
    label: "New York",
    value: 51.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-22"),
    label: "Boston",
    value: 62.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-23"),
    label: "San Francisco",
    value: 61.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-23"),
    label: "New York",
    value: 48.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-23"),
    label: "Boston",
    value: 61.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-24"),
    label: "San Francisco",
    value: 55.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-24"),
    label: "New York",
    value: 49
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-24"),
    label: "Boston",
    value: 62
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-25"),
    label: "San Francisco",
    value: 48.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-25"),
    label: "New York",
    value: 46.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-25"),
    label: "Boston",
    value: 64.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-26"),
    label: "San Francisco",
    value: 49.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-26"),
    label: "New York",
    value: 49.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-26"),
    label: "Boston",
    value: 66
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-27"),
    label: "San Francisco",
    value: 39.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-27"),
    label: "New York",
    value: 54.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-27"),
    label: "Boston",
    value: 65.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-28"),
    label: "San Francisco",
    value: 49.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-28"),
    label: "New York",
    value: 54.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-28"),
    label: "Boston",
    value: 69.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-29"),
    label: "San Francisco",
    value: 56.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-29"),
    label: "New York",
    value: 52.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-29"),
    label: "Boston",
    value: 69.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-30"),
    label: "San Francisco",
    value: 46.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-30"),
    label: "New York",
    value: 54.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-30"),
    label: "Boston",
    value: 73.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-31"),
    label: "San Francisco",
    value: 42.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-31"),
    label: "New York",
    value: 56.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-03-31"),
    label: "Boston",
    value: 73.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-01"),
    label: "San Francisco",
    value: 45.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-01"),
    label: "New York",
    value: 51.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-01"),
    label: "Boston",
    value: 75.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-02"),
    label: "San Francisco",
    value: 48.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-02"),
    label: "New York",
    value: 50.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-02"),
    label: "Boston",
    value: 75.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-03"),
    label: "San Francisco",
    value: 51.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-03"),
    label: "New York",
    value: 52.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-03"),
    label: "Boston",
    value: 77.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-04"),
    label: "San Francisco",
    value: 61
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-04"),
    label: "New York",
    value: 50.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-04"),
    label: "Boston",
    value: 67
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-05"),
    label: "San Francisco",
    value: 50.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-05"),
    label: "New York",
    value: 47.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-05"),
    label: "Boston",
    value: 71.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-06"),
    label: "San Francisco",
    value: 48
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-06"),
    label: "New York",
    value: 47.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-06"),
    label: "Boston",
    value: 70.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-07"),
    label: "San Francisco",
    value: 51.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-07"),
    label: "New York",
    value: 49.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-07"),
    label: "Boston",
    value: 73.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-08"),
    label: "San Francisco",
    value: 55.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-08"),
    label: "New York",
    value: 50
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-08"),
    label: "Boston",
    value: 71.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-09"),
    label: "San Francisco",
    value: 58.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-09"),
    label: "New York",
    value: 51.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-09"),
    label: "Boston",
    value: 70
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-10"),
    label: "San Francisco",
    value: 55
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-10"),
    label: "New York",
    value: 53.8
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-10"),
    label: "Boston",
    value: 69
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-11"),
    label: "San Francisco",
    value: 49
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-11"),
    label: "New York",
    value: 52.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-11"),
    label: "Boston",
    value: 69.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-12"),
    label: "San Francisco",
    value: 51.7
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-12"),
    label: "New York",
    value: 53.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-12"),
    label: "Boston",
    value: 74.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-13"),
    label: "San Francisco",
    value: 53.1
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-13"),
    label: "New York",
    value: 50.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-13"),
    label: "Boston",
    value: 73.4
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-14"),
    label: "San Francisco",
    value: 55.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-14"),
    label: "New York",
    value: 50.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-14"),
    label: "Boston",
    value: 76
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-15"),
    label: "San Francisco",
    value: 62.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-15"),
    label: "New York",
    value: 51.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-15"),
    label: "Boston",
    value: 74.5
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-16"),
    label: "San Francisco",
    value: 62.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-16"),
    label: "New York",
    value: 51.9
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-16"),
    label: "Boston",
    value: 63.6
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-17"),
    label: "San Francisco",
    value: 69.3
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-17"),
    label: "New York",
    value: 53.2
  }, {
    time: d3.time.format('%Y-%m-%d').parse("2012-04-17"),
    label: "Boston",
    value: 67.3
  }
];


})();

(function() {


App.data.zeroes_grouped = [
  {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 0
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 0
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 0
  }
];


})();

(function() {


App.data.same_value_grouped = [
  {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 0.1
  }, {
    label: 'Group One',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-01"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-02"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-03"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-04"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-05"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-06"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-07"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-08"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-09"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-10"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-11"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-12"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-13"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-14"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-15"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-16"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-17"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-18"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-19"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-20"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-21"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-22"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-23"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-24"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-25"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-26"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-27"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-28"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-29"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-30"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-05-31"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-01"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-02"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-03"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-04"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-05"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-06"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-07"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-08"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-09"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-10"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-11"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-12"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-13"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-14"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-15"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-16"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-17"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-18"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-19"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-20"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-21"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-22"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-23"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-24"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-25"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-26"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-27"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-06-28"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-01"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-02"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-03"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-04"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-05"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-06"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-07"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-08"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-09"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-10"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-11"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-12"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-13"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-14"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-15"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-16"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-17"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-18"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-19"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-20"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-21"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-22"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-23"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-24"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-25"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-26"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-27"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-28"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-29"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-30"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-07-31"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-01"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-02"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-03"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-04"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-05"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-06"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-07"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-08"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-09"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-10"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-11"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-12"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-13"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-14"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-15"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-16"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-17"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-18"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-19"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-20"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-21"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-22"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-23"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-24"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-25"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-26"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-27"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-28"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-29"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-08-30"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-01"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-02"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-03"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-04"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-05"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-06"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-07"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-08"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-09"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-10"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-11"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-12"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-13"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-14"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-15"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-16"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-17"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-18"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-19"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-20"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-21"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-22"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-23"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-24"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-25"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-26"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-27"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-28"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-29"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-30"),
    value: 0.1
  }, {
    label: 'Group Two',
    time: d3.time.format('%Y-%m-%d').parse("2013-09-31"),
    value: 0.1
  }
];


})();

(function() {


App.data.bubble_default = [
  {
    "grant_title": "New Mexico Business Roundtable",
    "id": "1",
    "organization": "New Mexico Business Roundtable for Educational Excellence",
    "total_amount": "5000",
    "group": "low",
    "Grant start date": "2/4/2010",
    "start_month": "2",
    "start_day": "4",
    "start_year": "2010"
  }, {
    "grant_title": "LA NSC Match",
    "id": "2",
    "organization": "Trustees of Dartmouth College",
    "total_amount": "27727",
    "group": "low",
    "Grant start date": "8/3/2009",
    "start_month": "8",
    "start_day": "3",
    "start_year": "2009"
  }, {
    "grant_title": "Mathematics Assessment for Learning Phase One RFP",
    "id": "3",
    "organization": "Denver School of Science and Technology Inc.",
    "total_amount": "36018",
    "group": "low",
    "Grant start date": "11/12/2009",
    "start_month": "11",
    "start_day": "12",
    "start_year": "2009"
  }, {
    "grant_title": "Convening of Stakeholder Planning Committee for the Institute for Local Innovation in Teaching and Learning",
    "id": "4",
    "organization": "The NEA Foundation for the Improvement of Education",
    "total_amount": "38420",
    "group": "low",
    "Grant start date": "3/11/2010",
    "start_month": "3",
    "start_day": "11",
    "start_year": "2010"
  }, {
    "grant_title": "Conference Support",
    "id": "5",
    "organization": "New Schools for New Orleans",
    "total_amount": "50000",
    "group": "low",
    "Grant start date": "10/12/2009",
    "start_month": "10",
    "start_day": "12",
    "start_year": "2009"
  }, {
    "grant_title": "Conference Support Grant on differentiated compensation symposium",
    "id": "6",
    "organization": "Battelle For Kids",
    "total_amount": "50000",
    "group": "low",
    "Grant start date": "6/30/2009",
    "start_month": "6",
    "start_day": "30",
    "start_year": "2009"
  }, {
    "grant_title": "Conference Support On School Turnaround Issues",
    "id": "7",
    "organization": "FSG Social Impact Advisors",
    "total_amount": "50000",
    "group": "low",
    "Grant start date": "9/24/2009",
    "start_month": "9",
    "start_day": "24",
    "start_year": "2009"
  }, {
    "grant_title": "City Based Proposal for What Works Fund - Aspire Public Schools",
    "id": "8",
    "organization": "Aspire Public Schools",
    "total_amount": "51500",
    "group": "low",
    "Grant start date": "10/29/2009",
    "start_month": "10",
    "start_day": "29",
    "start_year": "2009"
  }, {
    "grant_title": "Formative Assessment Task Development and Validation (Supplemental to OPP53449)",
    "id": "9",
    "organization": "Educational Policy Improvement Center",
    "total_amount": "55752",
    "group": "low",
    "Grant start date": "11/16/2009",
    "start_month": "11",
    "start_day": "16",
    "start_year": "2009"
  }, {
    "grant_title": "City Based Proposal for What Works Fund - E3 Alliance",
    "id": "10",
    "organization": "E3 Alliance",
    "total_amount": "56245",
    "group": "low",
    "Grant start date": "10/28/2009",
    "start_month": "10",
    "start_day": "28",
    "start_year": "2009"
  }, {
    "grant_title": "Light touch communications grant for EET district partner (Hillsborough)",
    "id": "11",
    "organization": "Hillsborough Education Foundation, Inc.",
    "total_amount": "60000",
    "group": "low",
    "Grant start date": "11/2/2009",
    "start_month": "11",
    "start_day": "2",
    "start_year": "2009"
  }, {
    "grant_title": "Light touch communications grant for EET district partner (LA CMOs)",
    "id": "12",
    "organization": "The College-Ready Promise",
    "total_amount": "60000",
    "group": "low",
    "Grant start date": "11/2/2009",
    "start_month": "11",
    "start_day": "2",
    "start_year": "2009"
  }, {
    "grant_title": "Light touch communications grant for EET district partner (Memphis)",
    "id": "13",
    "organization": "Memphis City Schools Foundation",
    "total_amount": "60000",
    "group": "low",
    "Grant start date": "11/2/2009",
    "start_month": "11",
    "start_day": "2",
    "start_year": "2009"
  }, {
    "grant_title": "Light touch communications grant for EET district partners (Pittsburgh)",
    "id": "14",
    "organization": "Pittsburgh Public Schools",
    "total_amount": "60000",
    "group": "low",
    "Grant start date": "11/2/2009",
    "start_month": "11",
    "start_day": "2",
    "start_year": "2009"
  }, {
    "grant_title": "City Based Proposal for What Works Fund - GHCF",
    "id": "15",
    "organization": "Greater Houston Community Foundation",
    "total_amount": "68500",
    "group": "low",
    "Grant start date": "10/28/2009",
    "start_month": "10",
    "start_day": "28",
    "start_year": "2009"
  }, {
    "grant_title": "City Based Proposal for What Works Fund - New Visions for Public Schools",
    "id": "16",
    "organization": "New Visions for Public Schools, Inc",
    "total_amount": "70116",
    "group": "low",
    "Grant start date": "11/10/2009",
    "start_month": "11",
    "start_day": "10",
    "start_year": "2009"
  }, {
    "grant_title": "City Based Proposal for What Works Fund - Philadelphia Public Schools",
    "id": "17",
    "organization": "School District of Philadelphia",
    "total_amount": "74219",
    "group": "low",
    "Grant start date": "11/13/2009",
    "start_month": "11",
    "start_day": "13",
    "start_year": "2009"
  }, {
    "grant_title": "Mathematics Assessment for Learning Phase One RFP",
    "id": "18",
    "organization": "Hamilton County Department of Education",
    "total_amount": "74800",
    "group": "low",
    "Grant start date": "11/1/2009",
    "start_month": "11",
    "start_day": "1",
    "start_year": "2009"
  }, {
    "grant_title": "City Based Proposal for What Works Fund ‚Äì Internationals Network (with NCLR)",
    "id": "19",
    "organization": "Internationals Network For Public Schools Inc",
    "total_amount": "74900",
    "group": "low",
    "Grant start date": "3/24/2010",
    "start_month": "3",
    "start_day": "24",
    "start_year": "2010"
  }, {
    "grant_title": "City Based Proposal for What Works Fund - Minneapolis Public Schools",
    "id": "20",
    "organization": "Achieve Minneapolis",
    "total_amount": "74963",
    "group": "low",
    "Grant start date": "10/29/2009",
    "start_month": "10",
    "start_day": "29",
    "start_year": "2009"
  }, {
    "grant_title": "City Based Proposal for What Works Fund - PTE",
    "id": "21",
    "organization": "The College-Ready Promise",
    "total_amount": "75000",
    "group": "low",
    "Grant start date": "11/4/2009",
    "start_month": "11",
    "start_day": "4",
    "start_year": "2009"
  }, {
    "grant_title": "TPERF Statewide Education Summit and Legislative Briefing",
    "id": "22",
    "organization": "Texas Public Education Reform Foundation",
    "total_amount": "75000",
    "group": "low",
    "Grant start date": "10/1/2008",
    "start_month": "10",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "City Based Proposal for What Works Fund - NYC Charter Center",
    "id": "23",
    "organization": "New York City Center for Charter School Excellence",
    "total_amount": "75300",
    "group": "low",
    "Grant start date": "10/30/2009",
    "start_month": "10",
    "start_day": "30",
    "start_year": "2009"
  }, {
    "grant_title": "Supporting the development of a cross-sector plan that represent new levels of collaboration between one or more districts and the SEED School, a leading CMO in Washington, DC and Baltimore",
    "id": "24",
    "organization": "SEED Foundation, Inc.",
    "total_amount": "75970",
    "group": "low",
    "Grant start date": "1/28/2010",
    "start_month": "1",
    "start_day": "28",
    "start_year": "2010"
  }, {
    "grant_title": "City based proposal for What Works Fund - City of New Haven",
    "id": "25",
    "organization": "City of New Haven",
    "total_amount": "82500",
    "group": "low",
    "Grant start date": "11/17/2009",
    "start_month": "11",
    "start_day": "17",
    "start_year": "2009"
  }, {
    "grant_title": "Achievement Gap Institute: Annual Research-to-Practice Conference, How Teachers Improve",
    "id": "26",
    "organization": "President and Fellows of Harvard College",
    "total_amount": "91300",
    "group": "low",
    "Grant start date": "5/13/2009",
    "start_month": "5",
    "start_day": "13",
    "start_year": "2009"
  }, {
    "grant_title": "National Education Forum",
    "id": "27",
    "organization": "The Library of Congress",
    "total_amount": "91350",
    "group": "low",
    "Grant start date": "3/1/2008",
    "start_month": "3",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Community Engagement Supporting College and Career Readiness",
    "id": "28",
    "organization": "Austin Voices for Education and Youth",
    "total_amount": "93000",
    "group": "low",
    "Grant start date": "10/1/2009",
    "start_month": "10",
    "start_day": "1",
    "start_year": "2009"
  }, {
    "grant_title": "Building & Sustaining Support for Good Schools: A Public Information Campaign",
    "id": "29",
    "organization": "Prichard Committee for Academic Excellence",
    "total_amount": "100000",
    "group": "medium",
    "Grant start date": "4/30/2010",
    "start_month": "4",
    "start_day": "30",
    "start_year": "2010"
  }, {
    "grant_title": "City Based Proposal for What Works Fund ‚Äì Council of Great City Schools",
    "id": "30",
    "organization": "Council Of The Great City Schools",
    "total_amount": "100000",
    "group": "medium",
    "Grant start date": "3/18/2010",
    "start_month": "3",
    "start_day": "18",
    "start_year": "2010"
  }, {
    "grant_title": "City based proposal for What Works Fund - New Schools for New Orleans",
    "id": "31",
    "organization": "New Schools for New Orleans",
    "total_amount": "100000",
    "group": "medium",
    "Grant start date": "11/4/2009",
    "start_month": "11",
    "start_day": "4",
    "start_year": "2009"
  }, {
    "grant_title": "EEP Equality Day Rally Support",
    "id": "32",
    "organization": "Education Equality Project",
    "total_amount": "100000",
    "group": "medium",
    "Grant start date": "6/19/2009",
    "start_month": "6",
    "start_day": "19",
    "start_year": "2009"
  }, {
    "grant_title": "Stimulus Tracker",
    "id": "33",
    "organization": "Education Writers Association",
    "total_amount": "100000",
    "group": "medium",
    "Grant start date": "7/22/2009",
    "start_month": "7",
    "start_day": "22",
    "start_year": "2009"
  }, {
    "grant_title": "Repurpose of Alliance for Education Funds to a Variety of Essential Organizational Functions and Programs",
    "id": "34",
    "organization": "Alliance for Education",
    "total_amount": "110610",
    "group": "medium",
    "Grant start date": "2/26/2010",
    "start_month": "2",
    "start_day": "26",
    "start_year": "2010"
  }, {
    "grant_title": "Secondary STEM Data and Standards Analysis",
    "id": "35",
    "organization": "Texas Public Education Reform Foundation",
    "total_amount": "140000",
    "group": "medium",
    "Grant start date": "7/28/2009",
    "start_month": "7",
    "start_day": "28",
    "start_year": "2009"
  }, {
    "grant_title": "Mathematics Assessment for Learning Phase One RFP",
    "id": "36",
    "organization": "Charlotte-Mecklenburg Schools",
    "total_amount": "143973",
    "group": "medium",
    "Grant start date": "11/9/2009",
    "start_month": "11",
    "start_day": "9",
    "start_year": "2009"
  }, {
    "grant_title": "Ethnic Commission Education Reform Project",
    "id": "37",
    "organization": "Washington State Commission on African American Affairs",
    "total_amount": "146025",
    "group": "medium",
    "Grant start date": "11/20/2009",
    "start_month": "11",
    "start_day": "20",
    "start_year": "2009"
  }, {
    "grant_title": "Mathematics Assessment for Learning Phase One RFP",
    "id": "38",
    "organization": "Cristo Rey Network",
    "total_amount": "149733",
    "group": "medium",
    "Grant start date": "11/6/2009",
    "start_month": "11",
    "start_day": "6",
    "start_year": "2009"
  }, {
    "grant_title": "California Collaborative on District Reform Phase 2",
    "id": "39",
    "organization": "American Institutes for Research",
    "total_amount": "150000",
    "group": "medium",
    "Grant start date": "3/1/2008",
    "start_month": "3",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Professional Educator Standards Board",
    "id": "40",
    "organization": "Professional Educator Standards Board",
    "total_amount": "150000",
    "group": "medium",
    "Grant start date": "10/9/2009",
    "start_month": "10",
    "start_day": "9",
    "start_year": "2009"
  }, {
    "grant_title": "Evaluate the Leaky College Pipeline in New York City",
    "id": "41",
    "organization": "Fund for Public Schools Inc.",
    "total_amount": "170023",
    "group": "medium",
    "Grant start date": "10/27/2009",
    "start_month": "10",
    "start_day": "27",
    "start_year": "2009"
  }, {
    "grant_title": "Advocacy for Sustained School Reform in the Nation's Capital",
    "id": "42",
    "organization": "DC VOICE",
    "total_amount": "200000",
    "group": "medium",
    "Grant start date": "7/1/2008",
    "start_month": "7",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "DC Expansion and CA STEM partnership",
    "id": "43",
    "organization": "Tiger Woods Foundation Inc.",
    "total_amount": "200000",
    "group": "medium",
    "Grant start date": "8/29/2009",
    "start_month": "8",
    "start_day": "29",
    "start_year": "2009"
  }, {
    "grant_title": "Retaining Teacher Talent: What Matters for Gen-Y Teachers",
    "id": "44",
    "organization": "Public Agenda Foundation, Inc.",
    "total_amount": "215000",
    "group": "medium",
    "Grant start date": "3/2/2009",
    "start_month": "3",
    "start_day": "2",
    "start_year": "2009"
  }, {
    "grant_title": "Supplemental Support for the New York STEM Progressive Dialogues (original grant on OPP52284)",
    "id": "45",
    "organization": "Rensselaer Polytechnic Institute",
    "total_amount": "220654",
    "group": "medium",
    "Grant start date": "9/29/2009",
    "start_month": "9",
    "start_day": "29",
    "start_year": "2009"
  }, {
    "grant_title": "Teacher Demographics and Pension Policies",
    "id": "46",
    "organization": "National Commission on Teachings & America's Future",
    "total_amount": "221755",
    "group": "medium",
    "Grant start date": "1/1/2009",
    "start_month": "1",
    "start_day": "1",
    "start_year": "2009"
  }, {
    "grant_title": "Charter School Initiative",
    "id": "47",
    "organization": "President and Fellows of Harvard College",
    "total_amount": "224030",
    "group": "medium",
    "Grant start date": "2/25/2010",
    "start_month": "2",
    "start_day": "25",
    "start_year": "2010"
  }, {
    "grant_title": "High School Standards Review project",
    "id": "48",
    "organization": "Illinois State Board of Education",
    "total_amount": "225000",
    "group": "medium",
    "Grant start date": "10/1/2008",
    "start_month": "10",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Progressive Dialogues (Supplemental grant on OPP1008819)",
    "id": "49",
    "organization": "Rensselaer Polytechnic Institute",
    "total_amount": "231382",
    "group": "medium",
    "Grant start date": "12/1/2008",
    "start_month": "12",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Support access to ARRA funds for strong CMOs",
    "id": "50",
    "organization": "New Schools Fund dba NewSchools Venture Fund",
    "total_amount": "246070",
    "group": "medium",
    "Grant start date": "9/10/2009",
    "start_month": "9",
    "start_day": "10",
    "start_year": "2009"
  }, {
    "grant_title": "Aspen-NewSchools Fellows",
    "id": "51",
    "organization": "New Schools Fund dba NewSchools Venture Fund",
    "total_amount": "250000",
    "group": "medium",
    "Grant start date": "3/26/2009",
    "start_month": "3",
    "start_day": "26",
    "start_year": "2009"
  }, {
    "grant_title": "Texas Charter Schools Association",
    "id": "52",
    "organization": "Texas Charter Schools Association",
    "total_amount": "250000",
    "group": "medium",
    "Grant start date": "5/18/2009",
    "start_month": "5",
    "start_day": "18",
    "start_year": "2009"
  }, {
    "grant_title": "to support the work of a teacher evaluation task force",
    "id": "53",
    "organization": "American Federation Of Teachers Educational Foundation",
    "total_amount": "250000",
    "group": "medium",
    "Grant start date": "6/23/2009",
    "start_month": "6",
    "start_day": "23",
    "start_year": "2009"
  }, {
    "grant_title": "Ensuring a Valid and Useable Teacher Student Link",
    "id": "54",
    "organization": "National Center For Educational Achievement",
    "total_amount": "260760",
    "group": "medium",
    "Grant start date": "11/21/2009",
    "start_month": "11",
    "start_day": "21",
    "start_year": "2009"
  }, {
    "grant_title": "Consistent College-Ready Standards",
    "id": "55",
    "organization": "Military Child Education Coalition",
    "total_amount": "269998",
    "group": "medium",
    "Grant start date": "10/1/2008",
    "start_month": "10",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "DCPS Measures of Teacher Effectiveness Study",
    "id": "56",
    "organization": "DC Public Education Fund",
    "total_amount": "299985",
    "group": "medium",
    "Grant start date": "11/10/2009",
    "start_month": "11",
    "start_day": "10",
    "start_year": "2009"
  }, {
    "grant_title": "Creating a Stronger Philanthropic Sector in Education",
    "id": "57",
    "organization": "Grantmakers for Education",
    "total_amount": "300000",
    "group": "medium",
    "Grant start date": "11/6/2009",
    "start_month": "11",
    "start_day": "6",
    "start_year": "2009"
  }, {
    "grant_title": "Envision Schools Post-Secondary Tracking",
    "id": "58",
    "organization": "Envision Schools",
    "total_amount": "300000",
    "group": "medium",
    "Grant start date": "6/1/2008",
    "start_month": "6",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Global Education Leaders' Program (GELP)",
    "id": "59",
    "organization": "Silicon Valley Community Foundation",
    "total_amount": "300000",
    "group": "medium",
    "Grant start date": "11/10/2009",
    "start_month": "11",
    "start_day": "10",
    "start_year": "2009"
  }, {
    "grant_title": "Investigation of the Relationship between Teacher Quality and Student Learning Outcomes",
    "id": "60",
    "organization": "ACT, Inc.",
    "total_amount": "300000",
    "group": "medium",
    "Grant start date": "10/1/2008",
    "start_month": "10",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Teacher-Student Data Link Project - Arkansas",
    "id": "61",
    "organization": "Arkansas Department of Education",
    "total_amount": "300000",
    "group": "medium",
    "Grant start date": "11/19/2009",
    "start_month": "11",
    "start_day": "19",
    "start_year": "2009"
  }, {
    "grant_title": "Teacher-Student Data Link Project - Florida",
    "id": "62",
    "organization": "Florida Department of Education",
    "total_amount": "300000",
    "group": "medium",
    "Grant start date": "11/19/2009",
    "start_month": "11",
    "start_day": "19",
    "start_year": "2009"
  }, {
    "grant_title": "Teacher-Student Data Link Project - Georgia",
    "id": "63",
    "organization": "Georgia Department of Education",
    "total_amount": "300000",
    "group": "medium",
    "Grant start date": "11/19/2009",
    "start_month": "11",
    "start_day": "19",
    "start_year": "2009"
  }, {
    "grant_title": "Teacher-Student Data Link Project - Louisiana",
    "id": "64",
    "organization": "Louisiana Department of Education",
    "total_amount": "300000",
    "group": "medium",
    "Grant start date": "11/19/2009",
    "start_month": "11",
    "start_day": "19",
    "start_year": "2009"
  }, {
    "grant_title": "Teacher-Student Data Link Project - Ohio",
    "id": "65",
    "organization": "Ohio Department of Education",
    "total_amount": "300000",
    "group": "medium",
    "Grant start date": "11/19/2009",
    "start_month": "11",
    "start_day": "19",
    "start_year": "2009"
  }, {
    "grant_title": "The California STEM Innovation Network",
    "id": "66",
    "organization": "California Polytechnic State University Foundation",
    "total_amount": "300000",
    "group": "medium",
    "Grant start date": "1/8/2009",
    "start_month": "1",
    "start_day": "8",
    "start_year": "2009"
  }, {
    "grant_title": "TN SCORE state advocacy coalition",
    "id": "67",
    "organization": "Tennessee State Collaborative on Reforming Education",
    "total_amount": "300250",
    "group": "medium",
    "Grant start date": "2/19/2010",
    "start_month": "2",
    "start_day": "19",
    "start_year": "2010"
  }, {
    "grant_title": "Bring Your 'A' Game",
    "id": "68",
    "organization": "Twenty First Century Foundation",
    "total_amount": "302425",
    "group": "medium",
    "Grant start date": "5/1/2008",
    "start_month": "5",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Instructional Support at Cleveland and Rainier Beach",
    "id": "69",
    "organization": "Alliance for Education",
    "total_amount": "309554",
    "group": "medium",
    "Grant start date": "9/17/2008",
    "start_month": "9",
    "start_day": "17",
    "start_year": "2008"
  }, {
    "grant_title": "Mathematics Assessment for Learning Phase One RFP",
    "id": "70",
    "organization": "National Council of La Raza",
    "total_amount": "322103",
    "group": "medium",
    "Grant start date": "11/10/2009",
    "start_month": "11",
    "start_day": "10",
    "start_year": "2009"
  }, {
    "grant_title": "NYC Public Schools: A Retrospective 2002-2009",
    "id": "71",
    "organization": "American Institutes for Research",
    "total_amount": "325000",
    "group": "medium",
    "Grant start date": "12/1/2008",
    "start_month": "12",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "NSC Student Data for High Schools Pilot: Georgia",
    "id": "72",
    "organization": "University System of Georgia Foundation, Inc.",
    "total_amount": "331678",
    "group": "medium",
    "Grant start date": "11/11/2009",
    "start_month": "11",
    "start_day": "11",
    "start_year": "2009"
  }, {
    "grant_title": "Common Core Companion Curriculum Project",
    "id": "73",
    "organization": "Common Core Inc.",
    "total_amount": "331890",
    "group": "medium",
    "Grant start date": "12/17/2009",
    "start_month": "12",
    "start_day": "17",
    "start_year": "2009"
  }, {
    "grant_title": "Civic Mission of Schools",
    "id": "74",
    "organization": "National Council for the Social Studies",
    "total_amount": "351704",
    "group": "medium",
    "Grant start date": "6/1/2008",
    "start_month": "6",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Intensive Partnership Site - Participation in MET Research Study",
    "id": "75",
    "organization": "Pittsburgh Public Schools",
    "total_amount": "353977",
    "group": "medium",
    "Grant start date": "11/13/2009",
    "start_month": "11",
    "start_day": "13",
    "start_year": "2009"
  }, {
    "grant_title": "Institute for Local Innovation in Teaching and Learning",
    "id": "76",
    "organization": "The NEA Foundation for the Improvement of Education",
    "total_amount": "358915",
    "group": "medium",
    "Grant start date": "10/22/2009",
    "start_month": "10",
    "start_day": "22",
    "start_year": "2009"
  }, {
    "grant_title": "Campaign for High School Equity",
    "id": "77",
    "organization": "L.U.L.A.C. Institute, Inc.",
    "total_amount": "370005",
    "group": "medium",
    "Grant start date": "3/1/2008",
    "start_month": "3",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Preparing Secondary English Learners for Graduation and College",
    "id": "78",
    "organization": "University of California, Los Angeles",
    "total_amount": "375000",
    "group": "medium",
    "Grant start date": "3/1/2008",
    "start_month": "3",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Education Equity Agenda: Federal and Regional Advocacy Policy Support for College Ready Work, Transparent Education Data System Alignment, Effective & Empowered Teachers and Innovation.",
    "id": "79",
    "organization": "Leadership Conference on Civil Rights Education Fund, Inc.",
    "total_amount": "375030",
    "group": "medium",
    "Grant start date": "10/26/2009",
    "start_month": "10",
    "start_day": "26",
    "start_year": "2009"
  }, {
    "grant_title": "NSC Student Data for High Schools Pilot: Florida",
    "id": "80",
    "organization": "Florida Department of Education",
    "total_amount": "383465",
    "group": "medium",
    "Grant start date": "10/30/2009",
    "start_month": "10",
    "start_day": "30",
    "start_year": "2009"
  }, {
    "grant_title": "The Policy Innovation in Education Network",
    "id": "81",
    "organization": "Thomas B. Fordham Institute",
    "total_amount": "398534",
    "group": "medium",
    "Grant start date": "6/15/2009",
    "start_month": "6",
    "start_day": "15",
    "start_year": "2009"
  }, {
    "grant_title": "Common Core Strategies for State Policymakers",
    "id": "82",
    "organization": "Council of State Governments",
    "total_amount": "399953",
    "group": "medium",
    "Grant start date": "3/18/2010",
    "start_month": "3",
    "start_day": "18",
    "start_year": "2010"
  }, {
    "grant_title": "Education Equity Agenda: Federal and Regional Advocacy Policy Support for College Ready Work, Transparent Education Data System Alignment, Effective & Empowered Teachers and Innovation.",
    "id": "83",
    "organization": "Mexican American Legal Defense and Educational Fund",
    "total_amount": "400000",
    "group": "medium",
    "Grant start date": "8/28/2009",
    "start_month": "8",
    "start_day": "28",
    "start_year": "2009"
  }, {
    "grant_title": "Education Equity Agenda: LULAC Parent Involvement Initiative for Campaign for High School Equity",
    "id": "84",
    "organization": "L.U.L.A.C. Institute, Inc.",
    "total_amount": "400017",
    "group": "medium",
    "Grant start date": "9/21/2009",
    "start_month": "9",
    "start_day": "21",
    "start_year": "2009"
  }, {
    "grant_title": "8th to 9th Grade Transition and Acceleration Project",
    "id": "85",
    "organization": "National Summer Learning Association",
    "total_amount": "400366",
    "group": "medium",
    "Grant start date": "11/1/2009",
    "start_month": "11",
    "start_day": "1",
    "start_year": "2009"
  }, {
    "grant_title": "Support of professional development and an education workshop for education beat reporters",
    "id": "86",
    "organization": "Teachers College, Columbia University",
    "total_amount": "402493",
    "group": "medium",
    "Grant start date": "9/29/2009",
    "start_month": "9",
    "start_day": "29",
    "start_year": "2009"
  }, {
    "grant_title": "NSC Student Data for High Schools Pilot: Texas",
    "id": "87",
    "organization": "Communities Foundation of Texas",
    "total_amount": "406610",
    "group": "medium",
    "Grant start date": "10/15/2009",
    "start_month": "10",
    "start_day": "15",
    "start_year": "2009"
  }, {
    "grant_title": "Supplemental Support Review and Build-out of the Raytheon STEM Model",
    "id": "88",
    "organization": "Business Higher Education Forum",
    "total_amount": "417517",
    "group": "medium",
    "Grant start date": "11/4/2009",
    "start_month": "11",
    "start_day": "4",
    "start_year": "2009"
  }, {
    "grant_title": "The State of Professional Learning: A National Study",
    "id": "89",
    "organization": "National Staff Development Council",
    "total_amount": "421603",
    "group": "medium",
    "Grant start date": "11/1/2008",
    "start_month": "11",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Education Equity Agenda: Southeast Asian American Action and Visibility in Education (SAVE) Project",
    "id": "90",
    "organization": "Southeast Asia Resource Action Center",
    "total_amount": "425000",
    "group": "medium",
    "Grant start date": "8/28/2009",
    "start_month": "8",
    "start_day": "28",
    "start_year": "2009"
  }, {
    "grant_title": "Roads to Success Curriculum Completion and Distribution",
    "id": "91",
    "organization": "Roads to Success Inc.",
    "total_amount": "430000",
    "group": "medium",
    "Grant start date": "10/26/2009",
    "start_month": "10",
    "start_day": "26",
    "start_year": "2009"
  }, {
    "grant_title": "STEM Community Collaborative Phase 2",
    "id": "92",
    "organization": "MCNC",
    "total_amount": "432898",
    "group": "medium",
    "Grant start date": "3/6/2009",
    "start_month": "3",
    "start_day": "6",
    "start_year": "2009"
  }, {
    "grant_title": "California ADP Support",
    "id": "93",
    "organization": "Regents of the University of California at Berkeley",
    "total_amount": "437807",
    "group": "medium",
    "Grant start date": "10/22/2008",
    "start_month": "10",
    "start_day": "22",
    "start_year": "2008"
  }, {
    "grant_title": "Regional convenings for policymakers and leaders to develop commitment to standards and assessments",
    "id": "94",
    "organization": "National Association of State Boards of Education",
    "total_amount": "450675",
    "group": "medium",
    "Grant start date": "10/26/2009",
    "start_month": "10",
    "start_day": "26",
    "start_year": "2009"
  }, {
    "grant_title": "Business Planning to Create Hybrid Learning Environments in Existing and New Schools",
    "id": "95",
    "organization": "Pollinate Ventures",
    "total_amount": "451125",
    "group": "medium",
    "Grant start date": "11/8/2009",
    "start_month": "11",
    "start_day": "8",
    "start_year": "2009"
  }, {
    "grant_title": "Mathematics Assessment for Learning Phase One RFP",
    "id": "96",
    "organization": "Fund for Public Schools Inc.",
    "total_amount": "455394",
    "group": "medium",
    "Grant start date": "11/13/2009",
    "start_month": "11",
    "start_day": "13",
    "start_year": "2009"
  }, {
    "grant_title": "KIPPShare National Data Platform",
    "id": "97",
    "organization": "KIPP Foundation",
    "total_amount": "468500",
    "group": "medium",
    "Grant start date": "11/5/2009",
    "start_month": "11",
    "start_day": "5",
    "start_year": "2009"
  }, {
    "grant_title": "The Equity Project (TEP) Charter School Evaluation",
    "id": "98",
    "organization": "Mathematica Policy Research",
    "total_amount": "470507",
    "group": "medium",
    "Grant start date": "7/16/2009",
    "start_month": "7",
    "start_day": "16",
    "start_year": "2009"
  }, {
    "grant_title": "North Carolina STEM Development",
    "id": "99",
    "organization": "MCNC",
    "total_amount": "475000",
    "group": "medium",
    "Grant start date": "5/1/2008",
    "start_month": "5",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Using web-based videos to teach math to high school students",
    "id": "100",
    "organization": "Guaranteach",
    "total_amount": "475077",
    "group": "medium",
    "Grant start date": "3/18/2010",
    "start_month": "3",
    "start_day": "18",
    "start_year": "2010"
  }, {
    "grant_title": "CPS Community Ownership Proposal",
    "id": "101",
    "organization": "Strive: Cincinnati/Northern Kentucky, LLC",
    "total_amount": "490021",
    "group": "medium",
    "Grant start date": "7/1/2008",
    "start_month": "7",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Teacher Working Conditions Survey",
    "id": "102",
    "organization": "New Teacher Center",
    "total_amount": "494933",
    "group": "medium",
    "Grant start date": "10/13/2009",
    "start_month": "10",
    "start_day": "13",
    "start_year": "2009"
  }, {
    "grant_title": "North Carolina New Technology High School Network Sustainability",
    "id": "103",
    "organization": "New Technology Foundation",
    "total_amount": "496776",
    "group": "medium",
    "Grant start date": "9/1/2008",
    "start_month": "9",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Planning Grant for Evaluation of Green Dot's Locke Transformation Project",
    "id": "104",
    "organization": "University of California, Los Angeles",
    "total_amount": "498724",
    "group": "medium",
    "Grant start date": "12/1/2008",
    "start_month": "12",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Preparing All Students for College, Work and Citizenship",
    "id": "105",
    "organization": "National Conference of State Legislatures",
    "total_amount": "499225",
    "group": "medium",
    "Grant start date": "5/1/2008",
    "start_month": "5",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Gateway to College Capacity-Building",
    "id": "106",
    "organization": "Gateway to College National Network",
    "total_amount": "499398",
    "group": "medium",
    "Grant start date": "9/1/2008",
    "start_month": "9",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Doubling the Numbers in STEM",
    "id": "107",
    "organization": "Ohio Business Alliance for Higher Education and the Economy",
    "total_amount": "500000",
    "group": "medium",
    "Grant start date": "11/1/2008",
    "start_month": "11",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "IMPLEMENTATION: StartL: A Digital Media and Learning Accelerator",
    "id": "108",
    "organization": "Social Science Research Council",
    "total_amount": "500000",
    "group": "medium",
    "Grant start date": "11/5/2009",
    "start_month": "11",
    "start_day": "5",
    "start_year": "2009"
  }, {
    "grant_title": "NAPCS General Operating Support",
    "id": "109",
    "organization": "National Alliance For Public Charter Schools",
    "total_amount": "500000",
    "group": "medium",
    "Grant start date": "10/30/2009",
    "start_month": "10",
    "start_day": "30",
    "start_year": "2009"
  }, {
    "grant_title": "New England Consortium",
    "id": "110",
    "organization": "Nellie Mae Education Foundation",
    "total_amount": "500000",
    "group": "medium",
    "Grant start date": "1/1/2009",
    "start_month": "1",
    "start_day": "1",
    "start_year": "2009"
  }, {
    "grant_title": "WGHA Ambassadors",
    "id": "111",
    "organization": "Seattle Biomedical Research Institute",
    "total_amount": "500000",
    "group": "medium",
    "Grant start date": "9/1/2008",
    "start_month": "9",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Stay for America (retaining effective Teach for America teachers beyond year 2)",
    "id": "112",
    "organization": "Teach for America, Inc.",
    "total_amount": "500422",
    "group": "medium",
    "Grant start date": "10/1/2009",
    "start_month": "10",
    "start_day": "1",
    "start_year": "2009"
  }, {
    "grant_title": "Grassroots Media Project",
    "id": "113",
    "organization": "Fund for the City of New York, Inc.",
    "total_amount": "513219",
    "group": "medium",
    "Grant start date": "5/1/2008",
    "start_month": "5",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Education Equity Agenda: Improving Native Student Graduation Rates: Policy Recommendations on High School Reform",
    "id": "114",
    "organization": "National Indian Education Association",
    "total_amount": "520446",
    "group": "medium",
    "Grant start date": "8/31/2009",
    "start_month": "8",
    "start_day": "31",
    "start_year": "2009"
  }, {
    "grant_title": "The State Role In Improving Low-performing Schools",
    "id": "115",
    "organization": "Center on Education Policy",
    "total_amount": "544700",
    "group": "medium",
    "Grant start date": "7/1/2008",
    "start_month": "7",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Engaging Communities for College Readiness (ENCORE)",
    "id": "116",
    "organization": "Texas Valley Communities Foundation",
    "total_amount": "546865",
    "group": "medium",
    "Grant start date": "5/1/2008",
    "start_month": "5",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "New Degree Program for Education Leaders",
    "id": "117",
    "organization": "President and Fellows of Harvard College",
    "total_amount": "550000",
    "group": "medium",
    "Grant start date": "8/1/2008",
    "start_month": "8",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "National Advocacy Support for the Common Core Initiative",
    "id": "118",
    "organization": "Alliance for Excellent Education, Inc.",
    "total_amount": "551336",
    "group": "medium",
    "Grant start date": "11/4/2009",
    "start_month": "11",
    "start_day": "4",
    "start_year": "2009"
  }, {
    "grant_title": "Conceptual and Organizing Platform for Secondary Mathematics Formative Assessments",
    "id": "119",
    "organization": "Regents University Of California Los Angeles",
    "total_amount": "576191",
    "group": "medium",
    "Grant start date": "5/11/2009",
    "start_month": "5",
    "start_day": "11",
    "start_year": "2009"
  }, {
    "grant_title": "Education Practice Launch",
    "id": "120",
    "organization": "Innosight Institute Inc",
    "total_amount": "588559",
    "group": "medium",
    "Grant start date": "7/1/2008",
    "start_month": "7",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Building Business Leadership for New Approaches to Teacher Compensation",
    "id": "121",
    "organization": "Committee for Economic Development",
    "total_amount": "597077",
    "group": "medium",
    "Grant start date": "5/5/2009",
    "start_month": "5",
    "start_day": "5",
    "start_year": "2009"
  }, {
    "grant_title": "Mathematics Assessment for Learning Phase One RFP",
    "id": "122",
    "organization": "Prichard Committee for Academic Excellence",
    "total_amount": "599016",
    "group": "medium",
    "Grant start date": "11/16/2009",
    "start_month": "11",
    "start_day": "16",
    "start_year": "2009"
  }, {
    "grant_title": "THE HIGH SCHOOL REDESIGN INITIATIVE -- PHASE TWO",
    "id": "123",
    "organization": "National Association of State Boards of Education",
    "total_amount": "599725",
    "group": "medium",
    "Grant start date": "5/1/2008",
    "start_month": "5",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Aligning P-12 and Postsecondary Data Systems",
    "id": "124",
    "organization": "National Center For Educational Achievement",
    "total_amount": "600000",
    "group": "medium",
    "Grant start date": "9/1/2008",
    "start_month": "9",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "The Next Generation of NCLR Schools",
    "id": "125",
    "organization": "National Council of La Raza",
    "total_amount": "600000",
    "group": "medium",
    "Grant start date": "3/1/2008",
    "start_month": "3",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Washington STEM Innovation Initiative",
    "id": "126",
    "organization": "Partnership for Learning",
    "total_amount": "643881",
    "group": "medium",
    "Grant start date": "3/11/2009",
    "start_month": "3",
    "start_day": "11",
    "start_year": "2009"
  }, {
    "grant_title": "Teacher Effectiveness work",
    "id": "127",
    "organization": "Hope Street Group",
    "total_amount": "650108",
    "group": "medium",
    "Grant start date": "11/7/2009",
    "start_month": "11",
    "start_day": "7",
    "start_year": "2009"
  }, {
    "grant_title": "Stimulus related work and CSA support",
    "id": "128",
    "organization": "Institute for a Competitive Workforce",
    "total_amount": "653077",
    "group": "medium",
    "Grant start date": "11/11/2009",
    "start_month": "11",
    "start_day": "11",
    "start_year": "2009"
  }, {
    "grant_title": "Validating a Common Core of Fewer, Clearer, Higher Standards",
    "id": "129",
    "organization": "Educational Policy Improvement Center",
    "total_amount": "721687",
    "group": "medium",
    "Grant start date": "5/5/2009",
    "start_month": "5",
    "start_day": "5",
    "start_year": "2009"
  }, {
    "grant_title": "Preparing parents and students to be advocates for quality school reform in Illinois",
    "id": "130",
    "organization": "Target Area Development Corporation",
    "total_amount": "725000",
    "group": "medium",
    "Grant start date": "7/1/2008",
    "start_month": "7",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Building Capacity for College Success: Implementing Data Collection Systems and Best Practices",
    "id": "131",
    "organization": "National Association of Street Schools",
    "total_amount": "742223",
    "group": "medium",
    "Grant start date": "5/1/2008",
    "start_month": "5",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Support for National Lab Day",
    "id": "132",
    "organization": "Tides Center",
    "total_amount": "750000",
    "group": "medium",
    "Grant start date": "11/10/2009",
    "start_month": "11",
    "start_day": "10",
    "start_year": "2009"
  }, {
    "grant_title": "Winning Strategies Black Male Donor Collaborative",
    "id": "133",
    "organization": "The Schott Foundation For Public Education",
    "total_amount": "750000",
    "group": "medium",
    "Grant start date": "7/1/2008",
    "start_month": "7",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "The Role of School Board Governance in Preaparing Students for College and Workplace Readiness",
    "id": "134",
    "organization": "National School Boards Foundation",
    "total_amount": "755603",
    "group": "medium",
    "Grant start date": "4/25/2009",
    "start_month": "4",
    "start_day": "25",
    "start_year": "2009"
  }, {
    "grant_title": "Tracking Students from Secondary to Post Secondary Institutions",
    "id": "135",
    "organization": "National Student Clearinghouse",
    "total_amount": "792216",
    "group": "medium",
    "Grant start date": "11/1/2008",
    "start_month": "11",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Education Equity Agenda: Federal and Regional Advocacy Policy Support for College Ready Work, Transparent Education Data System Alignment, Effective & Empowered Teachers and Innovation.",
    "id": "136",
    "organization": "National Urban League Inc.",
    "total_amount": "800000",
    "group": "medium",
    "Grant start date": "10/26/2009",
    "start_month": "10",
    "start_day": "26",
    "start_year": "2009"
  }, {
    "grant_title": "WA State Board of Education Phase II: A Meaningful High School Diploma and A State Accountability Education System",
    "id": "137",
    "organization": "The Washington State Board of Education",
    "total_amount": "850000",
    "group": "medium",
    "Grant start date": "3/1/2008",
    "start_month": "3",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Measures of Effective Teaching Research Site",
    "id": "138",
    "organization": "Denver Public Schools",
    "total_amount": "878493",
    "group": "medium",
    "Grant start date": "11/13/2009",
    "start_month": "11",
    "start_day": "13",
    "start_year": "2009"
  }, {
    "grant_title": "STEM Capacity Building",
    "id": "139",
    "organization": "Business Higher Education Forum",
    "total_amount": "910000",
    "group": "medium",
    "Grant start date": "7/1/2008",
    "start_month": "7",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Education Equity Agenda: Federal and Regional Advocacy Policy Support for College Ready Work, Transparent Education Data System Alignment, Effective & Empowered Teachers and Innovation.",
    "id": "140",
    "organization": "National Council of La Raza",
    "total_amount": "930223",
    "group": "medium",
    "Grant start date": "11/10/2009",
    "start_month": "11",
    "start_day": "10",
    "start_year": "2009"
  }, {
    "grant_title": "DC Achiever Restructuring Partner",
    "id": "141",
    "organization": "Friendship Public Charter School",
    "total_amount": "937088",
    "group": "medium",
    "Grant start date": "11/3/2009",
    "start_month": "11",
    "start_day": "3",
    "start_year": "2009"
  }, {
    "grant_title": "PRI Guaranty To Unlock Facilities Financing for High Quality Charter Schools",
    "id": "142",
    "organization": "Local Initiatives Support Corporation",
    "total_amount": "950000",
    "group": "medium",
    "Grant start date": "8/27/2009",
    "start_month": "8",
    "start_day": "27",
    "start_year": "2009"
  }, {
    "grant_title": "Common Standards Review and Task Development",
    "id": "143",
    "organization": "Thomas B. Fordham Institute",
    "total_amount": "959116",
    "group": "medium",
    "Grant start date": "10/10/2009",
    "start_month": "10",
    "start_day": "10",
    "start_year": "2009"
  }, {
    "grant_title": "Intermediary management of PRI/Credit Enhancement Program - Los Angeles (Aspire)",
    "id": "144",
    "organization": "NCB Capital Impact",
    "total_amount": "959373",
    "group": "medium",
    "Grant start date": "4/8/2010",
    "start_month": "4",
    "start_day": "8",
    "start_year": "2010"
  }, {
    "grant_title": "Sustainability for Recovery School District",
    "id": "145",
    "organization": "Baton Rouge Area Foundation",
    "total_amount": "993219",
    "group": "medium",
    "Grant start date": "11/3/2009",
    "start_month": "11",
    "start_day": "3",
    "start_year": "2009"
  }, {
    "grant_title": "Research Design for Project-Based Advanced Placement Courses",
    "id": "146",
    "organization": "University of Washington",
    "total_amount": "996185",
    "group": "medium",
    "Grant start date": "11/18/2009",
    "start_month": "11",
    "start_day": "18",
    "start_year": "2009"
  }, {
    "grant_title": "Accelerate and Enhance Teacher Effectiveness Methods In Districts/Networks",
    "id": "147",
    "organization": "Achievement First Inc.",
    "total_amount": "998221",
    "group": "medium",
    "Grant start date": "10/9/2009",
    "start_month": "10",
    "start_day": "9",
    "start_year": "2009"
  }, {
    "grant_title": "AFT Innovation Fund",
    "id": "148",
    "organization": "American Federation Of Teachers Educational Foundation",
    "total_amount": "1000000",
    "group": "medium",
    "Grant start date": "1/1/2009",
    "start_month": "1",
    "start_day": "1",
    "start_year": "2009"
  }, {
    "grant_title": "Applying an R&D model to education to unearth root causes of performance gaps, to effectively vet options for reform.",
    "id": "149",
    "organization": "President and Fellows of Harvard College",
    "total_amount": "1000000",
    "group": "medium",
    "Grant start date": "11/12/2009",
    "start_month": "11",
    "start_day": "12",
    "start_year": "2009"
  }, {
    "grant_title": "For the Future",
    "id": "150",
    "organization": "Team Pennsylvania Foundation",
    "total_amount": "1000000",
    "group": "medium",
    "Grant start date": "11/1/2008",
    "start_month": "11",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "General Support Supplemental",
    "id": "151",
    "organization": "The Education Trust",
    "total_amount": "1000000",
    "group": "medium",
    "Grant start date": "1/21/2010",
    "start_month": "1",
    "start_day": "21",
    "start_year": "2010"
  }, {
    "grant_title": "Ohio College and Career Ready Consortium",
    "id": "152",
    "organization": "Ohio Grantmakers Forum",
    "total_amount": "1000000",
    "group": "medium",
    "Grant start date": "7/18/2009",
    "start_month": "7",
    "start_day": "18",
    "start_year": "2009"
  }, {
    "grant_title": "Strategic Management of Human Capital in Public Ed",
    "id": "153",
    "organization": "University of Wisconsin",
    "total_amount": "1000000",
    "group": "medium",
    "Grant start date": "3/1/2008",
    "start_month": "3",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "to support Teach for America (TFA) with the goal of bringing low income and minority students in TFA classrooms to proficiency",
    "id": "154",
    "organization": "Teach for America, Inc.",
    "total_amount": "1000000",
    "group": "medium",
    "Grant start date": "6/26/2009",
    "start_month": "6",
    "start_day": "26",
    "start_year": "2009"
  }, {
    "grant_title": "Los Angeles Collaborative to Improve College and Career Readiness in LAUSD Schools",
    "id": "155",
    "organization": "United Way Inc.",
    "total_amount": "1000330",
    "group": "high",
    "Grant start date": "1/15/2009",
    "start_month": "1",
    "start_day": "15",
    "start_year": "2009"
  }, {
    "grant_title": "PEN business planning",
    "id": "156",
    "organization": "Public Education Network",
    "total_amount": "1001363",
    "group": "high",
    "Grant start date": "7/10/2009",
    "start_month": "7",
    "start_day": "10",
    "start_year": "2009"
  }, {
    "grant_title": "Accelerate and Enhance Teacher Effectiveness Methods In Districts/Networks",
    "id": "157",
    "organization": "Recovery School District",
    "total_amount": "1004719",
    "group": "high",
    "Grant start date": "10/22/2009",
    "start_month": "10",
    "start_day": "22",
    "start_year": "2009"
  }, {
    "grant_title": "CEP standards and assessment work",
    "id": "158",
    "organization": "Center on Education Policy",
    "total_amount": "1047928",
    "group": "high",
    "Grant start date": "9/8/2009",
    "start_month": "9",
    "start_day": "8",
    "start_year": "2009"
  }, {
    "grant_title": "College Bound",
    "id": "159",
    "organization": "College Success Foundation",
    "total_amount": "1053150",
    "group": "high",
    "Grant start date": "11/1/2008",
    "start_month": "11",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Accelerator Enhance Teacher Effectiveness Methods - RE: ASPIRE Model in HISD",
    "id": "160",
    "organization": "Houston Independent School District",
    "total_amount": "1100000",
    "group": "high",
    "Grant start date": "11/5/2009",
    "start_month": "11",
    "start_day": "5",
    "start_year": "2009"
  }, {
    "grant_title": "Ohio Follow-Through on Achieve Policy Study Recommendations",
    "id": "161",
    "organization": "Ohio Department of Education",
    "total_amount": "1175000",
    "group": "high",
    "Grant start date": "1/1/2008",
    "start_month": "1",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Philanthropic Partnership for Public Education",
    "id": "162",
    "organization": "Seattle Foundation",
    "total_amount": "1181375",
    "group": "high",
    "Grant start date": "3/1/2008",
    "start_month": "3",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "A Progressive Agenda for Human Capital Policy Reform",
    "id": "163",
    "organization": "Center for American Progress",
    "total_amount": "1198248",
    "group": "high",
    "Grant start date": "7/1/2008",
    "start_month": "7",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Gates-EdVisions Moving Forward",
    "id": "164",
    "organization": "EdVisions Inc",
    "total_amount": "1200552",
    "group": "high",
    "Grant start date": "12/1/2008",
    "start_month": "12",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Texas Education Research Support",
    "id": "165",
    "organization": "College for All Texans Foundation: Closing the Gaps",
    "total_amount": "1221800",
    "group": "high",
    "Grant start date": "11/1/2008",
    "start_month": "11",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Portable Word Play - Discovering What Handheld Games Can Do for Adolescent Reading Comprehension",
    "id": "166",
    "organization": "Education Development Center, Inc.",
    "total_amount": "1224953",
    "group": "high",
    "Grant start date": "11/18/2009",
    "start_month": "11",
    "start_day": "18",
    "start_year": "2009"
  }, {
    "grant_title": "Baltimore Sustainability Plan",
    "id": "167",
    "organization": "Fund for Educational Excellence",
    "total_amount": "1229730",
    "group": "high",
    "Grant start date": "5/1/2008",
    "start_month": "5",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Academic Youth Development",
    "id": "168",
    "organization": "University of Texas at Austin",
    "total_amount": "1235787",
    "group": "high",
    "Grant start date": "11/18/2009",
    "start_month": "11",
    "start_day": "18",
    "start_year": "2009"
  }, {
    "grant_title": "Campaign for High School Equity",
    "id": "169",
    "organization": "Rockefeller Philanthropy Advisors, Inc.",
    "total_amount": "1279229",
    "group": "high",
    "Grant start date": "9/1/2008",
    "start_month": "9",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "support the K-12 backmapping of the standards",
    "id": "170",
    "organization": "Council of Chief State School Officers",
    "total_amount": "1291738",
    "group": "high",
    "Grant start date": "10/12/2009",
    "start_month": "10",
    "start_day": "12",
    "start_year": "2009"
  }, {
    "grant_title": "Building College-Ready Culture in Our High Schools",
    "id": "171",
    "organization": "College Summit Inc.",
    "total_amount": "1300000",
    "group": "high",
    "Grant start date": "5/1/2008",
    "start_month": "5",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Measures of Effective Teaching Research Site",
    "id": "172",
    "organization": "Dallas Independent School District",
    "total_amount": "1332279",
    "group": "high",
    "Grant start date": "1/4/2010",
    "start_month": "1",
    "start_day": "4",
    "start_year": "2010"
  }, {
    "grant_title": "Technical Assistance for Standards/Assessment Partners",
    "id": "173",
    "organization": "National Center for the Improvement of Educational Assessment Inc.",
    "total_amount": "1362773",
    "group": "high",
    "Grant start date": "11/19/2009",
    "start_month": "11",
    "start_day": "19",
    "start_year": "2009"
  }, {
    "grant_title": "Making NSC Data Actionable for School Leaders",
    "id": "174",
    "organization": "College Summit Inc",
    "total_amount": "1383137",
    "group": "high",
    "Grant start date": "5/22/2009",
    "start_month": "5",
    "start_day": "22",
    "start_year": "2009"
  }, {
    "grant_title": "Charlotte-Mecklenburg Measures of Teacher Effectiveness Research",
    "id": "175",
    "organization": "Charlotte-Mecklenburg Schools",
    "total_amount": "1431534",
    "group": "high",
    "Grant start date": "9/3/2009",
    "start_month": "9",
    "start_day": "3",
    "start_year": "2009"
  }, {
    "grant_title": "College Ready Course Sequence Implementation",
    "id": "176",
    "organization": "ACT, Inc.",
    "total_amount": "1445269",
    "group": "high",
    "Grant start date": "9/14/2009",
    "start_month": "9",
    "start_day": "14",
    "start_year": "2009"
  }, {
    "grant_title": "Partnership for Learning Statewide Advocacy + Stimulus RTT TA",
    "id": "177",
    "organization": "Partnership for Learning",
    "total_amount": "1493522",
    "group": "high",
    "Grant start date": "11/1/2009",
    "start_month": "11",
    "start_day": "1",
    "start_year": "2009"
  }, {
    "grant_title": "Accelerated Partnership to Empower Effective Teachers",
    "id": "178",
    "organization": "Tulsa Public Schools",
    "total_amount": "1500000",
    "group": "high",
    "Grant start date": "2/4/2010",
    "start_month": "2",
    "start_day": "4",
    "start_year": "2010"
  }, {
    "grant_title": "LEV Statewide Advocacy Expansion",
    "id": "179",
    "organization": "League of Education Voters Foundation",
    "total_amount": "1500000",
    "group": "high",
    "Grant start date": "10/29/2009",
    "start_month": "10",
    "start_day": "29",
    "start_year": "2009"
  }, {
    "grant_title": "NCEE state partnerships",
    "id": "180",
    "organization": "National Center on Education & the Economy",
    "total_amount": "1500000",
    "group": "high",
    "Grant start date": "10/19/2009",
    "start_month": "10",
    "start_day": "19",
    "start_year": "2009"
  }, {
    "grant_title": "Development of frameworks for the assessment of teacher knowledge",
    "id": "181",
    "organization": "Educational Testing Service",
    "total_amount": "1521971",
    "group": "high",
    "Grant start date": "11/14/2009",
    "start_month": "11",
    "start_day": "14",
    "start_year": "2009"
  }, {
    "grant_title": "Organizing for High School Reform",
    "id": "182",
    "organization": "Pacific Institute For Community Organizations",
    "total_amount": "1600000",
    "group": "high",
    "Grant start date": "9/1/2008",
    "start_month": "9",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Expansion of Urban Teacher Residency (UTRU)",
    "id": "183",
    "organization": "The Urban Teacher Residency Institute",
    "total_amount": "1635665",
    "group": "high",
    "Grant start date": "9/1/2009",
    "start_month": "9",
    "start_day": "1",
    "start_year": "2009"
  }, {
    "grant_title": "Advance Illinois organization build",
    "id": "184",
    "organization": "Advance Illinois",
    "total_amount": "1800000",
    "group": "high",
    "Grant start date": "5/15/2008",
    "start_month": "5",
    "start_day": "15",
    "start_year": "2008"
  }, {
    "grant_title": "Validation of the Teaching as Leadership Rubric",
    "id": "185",
    "organization": "Teach for America, Inc.",
    "total_amount": "1840548",
    "group": "high",
    "Grant start date": "10/5/2009",
    "start_month": "10",
    "start_day": "5",
    "start_year": "2009"
  }, {
    "grant_title": "CMO Research Study Project Management",
    "id": "186",
    "organization": "New Schools Fund dba NewSchools Venture Fund",
    "total_amount": "1891265",
    "group": "high",
    "Grant start date": "5/1/2008",
    "start_month": "5",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "6to16",
    "id": "187",
    "organization": "University of Chicago - Urban Education Institute",
    "total_amount": "1894228",
    "group": "high",
    "Grant start date": "3/1/2008",
    "start_month": "3",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Education Equity Agenda: Support for Campaign for High School Equity coordination of national civil rights organization national policy advocacy of College Ready and Postsecondary Strategies",
    "id": "188",
    "organization": "Rockefeller Philanthropy Advisors, Inc.",
    "total_amount": "1915298",
    "group": "high",
    "Grant start date": "10/19/2009",
    "start_month": "10",
    "start_day": "19",
    "start_year": "2009"
  }, {
    "grant_title": "Strengthening State College Readiness Initiatives",
    "id": "189",
    "organization": "Board Of Control For Southern Regional Education",
    "total_amount": "1987015",
    "group": "high",
    "Grant start date": "3/1/2008",
    "start_month": "3",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Intensive Partnership Site - Participation in MET Research Study",
    "id": "190",
    "organization": "Memphis City Schools",
    "total_amount": "1988654",
    "group": "high",
    "Grant start date": "11/3/2009",
    "start_month": "11",
    "start_day": "3",
    "start_year": "2009"
  }, {
    "grant_title": "New-Media Capacity Building at EPE",
    "id": "191",
    "organization": "Editorial Projects in Education",
    "total_amount": "1997280",
    "group": "high",
    "Grant start date": "5/1/2009",
    "start_month": "5",
    "start_day": "1",
    "start_year": "2009"
  }, {
    "grant_title": "Implementation: National PTA support for college-readiness",
    "id": "192",
    "organization": "National Congress of Parents and Teachers",
    "total_amount": "2000000",
    "group": "high",
    "Grant start date": "11/3/2009",
    "start_month": "11",
    "start_day": "3",
    "start_year": "2009"
  }, {
    "grant_title": "The Public Education Reform and Community Development Link: A Sustainable Solution",
    "id": "193",
    "organization": "Deutsche Bank Americas Foundation",
    "total_amount": "2000000",
    "group": "high",
    "Grant start date": "11/1/2008",
    "start_month": "11",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Project GRAD USA's National College Readiness Initiative",
    "id": "194",
    "organization": "Project GRAD",
    "total_amount": "2025892",
    "group": "high",
    "Grant start date": "9/1/2008",
    "start_month": "9",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Literacy by Design",
    "id": "195",
    "organization": "The Trust For Early Education Inc",
    "total_amount": "2039526",
    "group": "high",
    "Grant start date": "9/17/2009",
    "start_month": "9",
    "start_day": "17",
    "start_year": "2009"
  }, {
    "grant_title": "THSP Alliance Business Planning",
    "id": "196",
    "organization": "Communities Foundation of Texas",
    "total_amount": "2046674",
    "group": "high",
    "Grant start date": "9/1/2008",
    "start_month": "9",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Teacher-Student Data Link Project",
    "id": "197",
    "organization": "CELT Corporation",
    "total_amount": "2200000",
    "group": "high",
    "Grant start date": "11/19/2009",
    "start_month": "11",
    "start_day": "19",
    "start_year": "2009"
  }, {
    "grant_title": "Dropout Prevention",
    "id": "198",
    "organization": "Americas Promise-The Alliance For Youth",
    "total_amount": "2211517",
    "group": "high",
    "Grant start date": "3/19/2008",
    "start_month": "3",
    "start_day": "19",
    "start_year": "2008"
  }, {
    "grant_title": "Hunt Institute Common State Education Standards Project",
    "id": "199",
    "organization": "The James B. Hunt, Jr. Institute for Educational Leadership and Policy",
    "total_amount": "2213470",
    "group": "high",
    "Grant start date": "5/1/2008",
    "start_month": "5",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Business Planning for Education grantees",
    "id": "200",
    "organization": "The Bridgespan Group",
    "total_amount": "2237530",
    "group": "high",
    "Grant start date": "4/20/2009",
    "start_month": "4",
    "start_day": "20",
    "start_year": "2009"
  }, {
    "grant_title": "Develop Tools for Teachers/Districts to Monitor Student Progress",
    "id": "201",
    "organization": "Math Solutions",
    "total_amount": "2274957",
    "group": "high",
    "Grant start date": "11/20/2009",
    "start_month": "11",
    "start_day": "20",
    "start_year": "2009"
  }, {
    "grant_title": "IB Middle Years Summative Assessment",
    "id": "202",
    "organization": "IB Fund US Inc.",
    "total_amount": "2423679",
    "group": "high",
    "Grant start date": "8/22/2009",
    "start_month": "8",
    "start_day": "22",
    "start_year": "2009"
  }, {
    "grant_title": "To Help Governors Improve College and Career Ready Rates",
    "id": "203",
    "organization": "National Governors Association Center For Best Practices",
    "total_amount": "2496814",
    "group": "high",
    "Grant start date": "5/1/2008",
    "start_month": "5",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Next Generation PD System",
    "id": "204",
    "organization": "DC Public Education Fund",
    "total_amount": "2500000",
    "group": "high",
    "Grant start date": "11/12/2009",
    "start_month": "11",
    "start_day": "12",
    "start_year": "2009"
  }, {
    "grant_title": "Accelerated Partnership to Empower Effective Teachers",
    "id": "205",
    "organization": "Prince George's County Public Schools",
    "total_amount": "2500169",
    "group": "high",
    "Grant start date": "1/4/2010",
    "start_month": "1",
    "start_day": "4",
    "start_year": "2010"
  }, {
    "grant_title": "Intensive Partnership Site - Participation in MET Research Study",
    "id": "206",
    "organization": "Hillsborough County Public Schools",
    "total_amount": "2502146",
    "group": "high",
    "Grant start date": "10/20/2009",
    "start_month": "10",
    "start_day": "20",
    "start_year": "2009"
  }, {
    "grant_title": "Scaling NCTQ state and district work",
    "id": "207",
    "organization": "National Council on Teacher Quality",
    "total_amount": "2565641",
    "group": "high",
    "Grant start date": "10/21/2009",
    "start_month": "10",
    "start_day": "21",
    "start_year": "2009"
  }, {
    "grant_title": "NAPCS Industry Development",
    "id": "208",
    "organization": "National Alliance For Public Charter Schools",
    "total_amount": "2605527",
    "group": "high",
    "Grant start date": "9/1/2008",
    "start_month": "9",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Increasing Business Engagement",
    "id": "209",
    "organization": "Institute for a Competitive Workforce",
    "total_amount": "2625837",
    "group": "high",
    "Grant start date": "10/8/2008",
    "start_month": "10",
    "start_day": "8",
    "start_year": "2008"
  }, {
    "grant_title": "Building Support for Federal High School Policy Reform",
    "id": "210",
    "organization": "Alliance for Excellent Education, Inc.",
    "total_amount": "2644892",
    "group": "high",
    "Grant start date": "9/1/2008",
    "start_month": "9",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "NYC DOE Measures of Teacher Effectiveness Research",
    "id": "211",
    "organization": "Fund for Public Schools Inc.",
    "total_amount": "2646876",
    "group": "high",
    "Grant start date": "8/28/2009",
    "start_month": "8",
    "start_day": "28",
    "start_year": "2009"
  }, {
    "grant_title": "Aspire Public Schools' Early College High School Capacity Project",
    "id": "212",
    "organization": "Aspire Public Schools",
    "total_amount": "2899727",
    "group": "high",
    "Grant start date": "9/1/2008",
    "start_month": "9",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Big 8 Superintendents Data Assessment",
    "id": "213",
    "organization": "Communities Foundation of Texas",
    "total_amount": "2901632",
    "group": "high",
    "Grant start date": "11/1/2008",
    "start_month": "11",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "National Impact Initiative",
    "id": "214",
    "organization": "National Association Of Charter School Authorizers",
    "total_amount": "2979186",
    "group": "high",
    "Grant start date": "10/1/2008",
    "start_month": "10",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Development and Adaptation of Science and Literacy Formative Assessment Tasks",
    "id": "215",
    "organization": "Regents Of The University Of California At Berkeley",
    "total_amount": "2999730",
    "group": "high",
    "Grant start date": "11/20/2009",
    "start_month": "11",
    "start_day": "20",
    "start_year": "2009"
  }, {
    "grant_title": "Research Alliance for New York City Schools",
    "id": "216",
    "organization": "New York University",
    "total_amount": "2999960",
    "group": "high",
    "Grant start date": "10/1/2008",
    "start_month": "10",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "CCSR General Operating Support",
    "id": "217",
    "organization": "University of Chicago (Parent Org)",
    "total_amount": "3000000",
    "group": "high",
    "Grant start date": "5/1/2008",
    "start_month": "5",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Deepening and Expanding the Impact of Diploma Plus",
    "id": "218",
    "organization": "Third Sector New England, Inc.",
    "total_amount": "3179363",
    "group": "high",
    "Grant start date": "9/1/2008",
    "start_month": "9",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "To provide support to states on RTTT applications",
    "id": "219",
    "organization": "New Venture Fund",
    "total_amount": "3240000",
    "group": "high",
    "Grant start date": "11/4/2009",
    "start_month": "11",
    "start_day": "4",
    "start_year": "2009"
  }, {
    "grant_title": "Alternative High School Initiative",
    "id": "220",
    "organization": "The Big Picture Company",
    "total_amount": "3315216",
    "group": "high",
    "Grant start date": "7/15/2009",
    "start_month": "7",
    "start_day": "15",
    "start_year": "2009"
  }, {
    "grant_title": "Support for Teaching First to ensure that there is public support for district efforts to improve teacher effectiveness",
    "id": "221",
    "organization": "Rockefeller Philanthropy Advisors, Inc.",
    "total_amount": "3487270",
    "group": "high",
    "Grant start date": "9/25/2009",
    "start_month": "9",
    "start_day": "25",
    "start_year": "2009"
  }, {
    "grant_title": "IDEA Public Schools Expansion",
    "id": "222",
    "organization": "Idea Academy Inc",
    "total_amount": "3498875",
    "group": "high",
    "Grant start date": "11/1/2008",
    "start_month": "11",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Title",
    "id": "223",
    "organization": "College Summit Inc",
    "total_amount": "3500000",
    "group": "high",
    "Grant start date": "5/1/2008",
    "start_month": "5",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "College Ready Mathematics Formative Assessments",
    "id": "224",
    "organization": "Regents Of The University Of California At Berkeley",
    "total_amount": "3661294",
    "group": "high",
    "Grant start date": "9/25/2009",
    "start_month": "9",
    "start_day": "25",
    "start_year": "2009"
  }, {
    "grant_title": "Using Standards and Data to Improve Urban School Systems",
    "id": "225",
    "organization": "Council Of The Great City Schools",
    "total_amount": "3735866",
    "group": "high",
    "Grant start date": "10/1/2008",
    "start_month": "10",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "College Readiness Data Initiative",
    "id": "226",
    "organization": "Dallas Independent School District",
    "total_amount": "3774912",
    "group": "high",
    "Grant start date": "12/1/2008",
    "start_month": "12",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Project support for expanding Aspen network",
    "id": "227",
    "organization": "The Aspen Institute",
    "total_amount": "3878680",
    "group": "high",
    "Grant start date": "11/18/2009",
    "start_month": "11",
    "start_day": "18",
    "start_year": "2009"
  }, {
    "grant_title": "Aligned Instructional Systems",
    "id": "228",
    "organization": "New Schools Fund dba NewSchools Venture Fund",
    "total_amount": "3999127",
    "group": "high",
    "Grant start date": "5/1/2008",
    "start_month": "5",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "DC Schools Fund",
    "id": "229",
    "organization": "New Schools Fund dba NewSchools Venture Fund",
    "total_amount": "4000000",
    "group": "high",
    "Grant start date": "7/1/2008",
    "start_month": "7",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Newark School Fund",
    "id": "230",
    "organization": "Newark Charter School Fund, Inc.",
    "total_amount": "4000000",
    "group": "high",
    "Grant start date": "2/15/2008",
    "start_month": "2",
    "start_day": "15",
    "start_year": "2008"
  }, {
    "grant_title": "SeaChange Capacity and Catalyst Funding",
    "id": "231",
    "organization": "SeaChange Capital Partners, Inc.",
    "total_amount": "4000000",
    "group": "high",
    "Grant start date": "12/1/2008",
    "start_month": "12",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "College and Career Ready Graduation Initiative",
    "id": "232",
    "organization": "United Way of America",
    "total_amount": "4001263",
    "group": "high",
    "Grant start date": "1/1/2009",
    "start_month": "1",
    "start_day": "1",
    "start_year": "2009"
  }, {
    "grant_title": "Elevating An Alternative Teacher Voice",
    "id": "233",
    "organization": "Teach Plus, Incorporated",
    "total_amount": "4010611",
    "group": "high",
    "Grant start date": "9/30/2009",
    "start_month": "9",
    "start_day": "30",
    "start_year": "2009"
  }, {
    "grant_title": "Big Picture School Initiative",
    "id": "234",
    "organization": "The Big Picture Company",
    "total_amount": "4079157",
    "group": "high",
    "Grant start date": "7/1/2008",
    "start_month": "7",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Matching Grant for Classroom Projects in Public High Schools",
    "id": "235",
    "organization": "DonorsChoose.org",
    "total_amount": "4114700",
    "group": "high",
    "Grant start date": "11/1/2008",
    "start_month": "11",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Formative Assessment Data Collection, Task Analysis and Implementation (UCLA/CRESST)",
    "id": "236",
    "organization": "Regents University Of California Los Angeles",
    "total_amount": "4342988",
    "group": "high",
    "Grant start date": "11/12/2009",
    "start_month": "11",
    "start_day": "12",
    "start_year": "2009"
  }, {
    "grant_title": "State and National Common Core Standards Adoption/Implementation Advocacy Support",
    "id": "237",
    "organization": "James B. Hunt, Jr. Institute for Educational Leadership and Policy Foundation, Inc.",
    "total_amount": "4368176",
    "group": "high",
    "Grant start date": "11/5/2009",
    "start_month": "11",
    "start_day": "5",
    "start_year": "2009"
  }, {
    "grant_title": "Ohio High School Value-Added Project",
    "id": "238",
    "organization": "Battelle For Kids",
    "total_amount": "4989262",
    "group": "high",
    "Grant start date": "10/1/2008",
    "start_month": "10",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Creating a National Movement for Improved K-12 Education",
    "id": "239",
    "organization": "GreatSchools, Inc.",
    "total_amount": "6000000",
    "group": "high",
    "Grant start date": "7/1/2008",
    "start_month": "7",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Smart Scholars: Early College High Schools in New York State",
    "id": "240",
    "organization": "The University of the State of New York",
    "total_amount": "6000000",
    "group": "high",
    "Grant start date": "7/29/2009",
    "start_month": "7",
    "start_day": "29",
    "start_year": "2009"
  }, {
    "grant_title": "Phase II - to support the expansion of second generation student tracker for high schools",
    "id": "241",
    "organization": "National Student Clearinghouse Research Center",
    "total_amount": "6094497",
    "group": "high",
    "Grant start date": "11/20/2009",
    "start_month": "11",
    "start_day": "20",
    "start_year": "2009"
  }, {
    "grant_title": "Support for Seattle Public Schools' Strategic Plan",
    "id": "242",
    "organization": "Alliance for Education",
    "total_amount": "6929430",
    "group": "high",
    "Grant start date": "11/10/2008",
    "start_month": "11",
    "start_day": "10",
    "start_year": "2008"
  }, {
    "grant_title": "Reforming the Widget Effect: Increasing teacher effectiveness in America's schools",
    "id": "243",
    "organization": "The New Teacher Project, Inc.",
    "total_amount": "7000000",
    "group": "high",
    "Grant start date": "7/10/2009",
    "start_month": "7",
    "start_day": "10",
    "start_year": "2009"
  }, {
    "grant_title": "Understanding Teacher Quality",
    "id": "244",
    "organization": "Educational Testing Service",
    "total_amount": "7348925",
    "group": "high",
    "Grant start date": "11/1/2008",
    "start_month": "11",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Equity and Excellence in a Global Era: Expanding the International Studies Schools Network",
    "id": "245",
    "organization": "Asia Society",
    "total_amount": "7750417",
    "group": "high",
    "Grant start date": "11/1/2008",
    "start_month": "11",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Increase the leadership capacity of chiefs",
    "id": "246",
    "organization": "Council of Chief State School Officers",
    "total_amount": "7770104",
    "group": "high",
    "Grant start date": "7/1/2009",
    "start_month": "7",
    "start_day": "1",
    "start_year": "2009"
  }, {
    "grant_title": "Strong American Schools",
    "id": "247",
    "organization": "Rockefeller Philanthropy Advisors, Inc.",
    "total_amount": "9958245",
    "group": "high",
    "Grant start date": "3/1/2008",
    "start_month": "3",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Accelerated Partnership to Empower Effective Teachers",
    "id": "248",
    "organization": "Denver Public Schools",
    "total_amount": "10000000",
    "group": "high",
    "Grant start date": "1/4/2010",
    "start_month": "1",
    "start_day": "4",
    "start_year": "2010"
  }, {
    "grant_title": "Accelerated Partnership to Empower Effective Teachers",
    "id": "249",
    "organization": "Atlanta Public Schools",
    "total_amount": "10000000",
    "group": "high",
    "Grant start date": "1/13/2010",
    "start_month": "1",
    "start_day": "13",
    "start_year": "2010"
  }, {
    "grant_title": "American Diploma Project Network",
    "id": "250",
    "organization": "Achieve Inc.",
    "total_amount": "12614352",
    "group": "high",
    "Grant start date": "2/1/2008",
    "start_month": "2",
    "start_day": "1",
    "start_year": "2008"
  }, {
    "grant_title": "Strategic Data Project",
    "id": "251",
    "organization": "President and Fellows of Harvard College",
    "total_amount": "14994686",
    "group": "high",
    "Grant start date": "6/17/2009",
    "start_month": "6",
    "start_day": "17",
    "start_year": "2009"
  }, {
    "grant_title": "Intensive Partnerships to Empower Effective Teachers",
    "id": "252",
    "organization": "Pittsburgh Public Schools",
    "total_amount": "40000000",
    "group": "high",
    "Grant start date": "11/18/2009",
    "start_month": "11",
    "start_day": "18",
    "start_year": "2009"
  }, {
    "grant_title": "Intensive Partnerships to Empower Effective Teachers (LA-CMO's)",
    "id": "253",
    "organization": "The College-Ready Promise",
    "total_amount": "60000000",
    "group": "high",
    "Grant start date": "11/19/2009",
    "start_month": "11",
    "start_day": "19",
    "start_year": "2009"
  }, {
    "grant_title": "Intensive Partnerships to Empower Effective Teachers",
    "id": "254",
    "organization": "Memphis City Schools",
    "total_amount": "90000000",
    "group": "high",
    "Grant start date": "11/19/2009",
    "start_month": "11",
    "start_day": "19",
    "start_year": "2009"
  }, {
    "grant_title": "Intensive Partnerships to Empower Effective Teachers",
    "id": "255",
    "organization": "Hillsborough County Public Schools",
    "total_amount": "100000000",
    "group": "high",
    "Grant start date": "11/19/2009",
    "start_month": "11",
    "start_day": "19",
    "start_year": "2009"
  }
];


})();

(function() {


App.SlideController = Ember.Controller.extend({
  prettyPrintedData: Ember.computed(function() {
    return JSON.stringify(this.get('data'), null, '\t');
  }).property('data'),
  seedColors: {
    purple: 'rgb(100,60,120)',
    yellow: 'rgb(250,165,30)',
    maroon: 'rgb(150,0,35)',
    red: 'rgb(235,35,35)',
    blue: 'rgb(30,120,190)',
    navy: 'rgb(25,75,120)',
    green: 'rgb(60,110,80)',
    gray: 'rgb(65,65,65)',
    black: 'rgb(00,00,00)'
  },
  seedColorNames: Ember.computed(function() {
    return _.keys(this.get('seedColors'));
  }).property('seedColors'),
  selectedSeedColorName: 'black',
  selectedSeedColor: Ember.computed(function() {
    return this.get('seedColors')[this.get('selectedSeedColorName')];
  }).property('selectedSeedColorName', 'seedColors.@each')
});

App.ScrubberComponent = Ember.Component.extend({
  tagName: 'input',
  attributeBindings: ['min', 'max', 'step', 'type'],
  type: 'range',
  min: 0,
  max: 10,
  step: 1,
  change: function() {
    var value;
    value = this.$()[0].value;
    return this.set('value', +value);
  }
});


})();

(function() {


App.EmberChartsTimeSeriesController = App.SlideController.extend({
  barPadding: 0,
  barGroupPadding: 0.25,
  barLeftOffset: 0.0,
  yAxisFromZero: false,
  availableLineDataSets: Ember.computed(function() {
    return _.keys(this.get('lineDataHash'));
  }).property('lineDataHash'),
  availableBarDataSets: Ember.computed(function() {
    return _.keys(this.get('barDataHash'));
  }).property('barDataHash'),
  data: Ember.computed.alias('lineData'),
  lineData: Ember.computed(function() {
    return this.get('lineDataHash')[this.get('selectedLineData')];
  }).property('selectedLineData', 'lineDataHash'),
  barData: Ember.computed(function() {
    return this.get('barDataHash')[this.get('selectedBarData')];
  }).property('selectedBarData', 'barDataHash'),
  lineDataHash: Ember.computed(function() {
    return {
      monthly_return_single_series: App.data.monthly_return_single_series,
      monthly_return_double_series: App.data.monthly_return_double_series,
      monthly_return_triple_series: App.data.monthly_return_triple_series,
      monthly_return_single_period: App.data.monthly_return_single_period,
      monthly_return_double_period: App.data.monthly_return_double_period,
      monthly_return_negative_period: App.data.monthly_return_negative_period,
      daily_curr_value: App.data.daily_curr_value,
      daily_diff_value: App.data.daily_diff_value,
      daily_two_series: App.data.daily_two_series,
      daily_three_series: App.data.daily_three_series,
      daily_four_series: App.data.daily_four_series,
      daily_five_series: App.data.daily_five_series,
      daily_six_series: App.data.daily_six_series,
      '----': App.data["null"],
      value_p1d_p1y: App.data.value_p1d_p1y,
      value_p1w_p1y: App.data.value_p1w_p1y,
      value_p1m_p1y: App.data.value_p1m_p1y,
      value_p1m_p2y: App.data.value_p1m_p2y,
      value_p1m_p5y: App.data.value_p1m_p5y,
      zeroes_grouped: App.data.zeroes_grouped,
      zeroes_ungrouped: App.data.zeroes_ungrouped,
      same_value_grouped: App.data.same_value_grouped,
      same_value_ungrouped: App.data.same_value_ungrouped,
      empty: App.data.empty
    };
  }),
  barDataHash: Ember.computed.alias('lineDataHash'),
  selectedLineData: 'daily_two_series',
  selectedBarData: 'monthly_return_triple_series',
  dataIntervals: ['day', 'week', 'month', 'year'],
  tickIntervals: ['weeks', 'months', 'quarters', 'years'],
  selectedInterval: 'months'
});


})();

(function() {


App.EmberChartsHorizontalBarController = App.SlideController.extend({
  maxBarThickness: 60,
  minBarThickness: 20,
  availableDataSets: Ember.computed(function() {
    return _.keys(this.get('rawDataHash'));
  }).property('rawDataHash'),
  data: Ember.computed(function() {
    return this.get('rawDataHash')[this.get('selectedData')];
  }).property('selectedData', 'rawDataHash'),
  rawDataHash: Ember.computed(function() {
    return {
      asset_values: App.data.asset_values,
      many_values: App.data.many_values,
      monthly_return_single_period: App.data.monthly_return_single_period,
      high_net_worth_duration: App.data.high_net_worth_duration,
      '----': App.data["null"],
      empty: App.data.empty,
      one_value: App.data.one_value,
      two_values: App.data.two_values,
      zero: App.data.zero,
      zeroes: App.data.zeroes,
      sum_to_zero: App.data.sum_to_zero,
      bad_range: App.data.bad_range
    };
  }),
  selectedData: 'asset_values',
  sortTypes: ['label', 'value'],
  selectedSortType: 'value'
});


})();

(function() {


App.EmberChartsVerticalBarController = App.SlideController.extend({
  betweenGroupPadding: 0,
  withinGroupPadding: 0,
  maxLabelHeight: 40,
  stackBars: false,
  availableDataSets: Ember.computed(function() {
    return _.keys(this.get('rawDataHash'));
  }).property('rawDataHash'),
  data: Ember.computed(function() {
    return this.get('rawDataHash')[this.get('selectedData')];
  }).property('selectedData', 'rawDataHash'),
  rawDataHash: Ember.computed(function() {
    return {
      two_ranges: App.data.two_ranges,
      three_ranges: App.data.three_ranges,
      five_ranges: App.data.five_ranges,
      sector_compare_return: App.data.sector_compare_return,
      '----': App.data["null"],
      asset_values: App.data.asset_values,
      many_values: App.data.many_values,
      monthly_return_single_period: App.data.monthly_return_single_period,
      high_net_worth_duration: App.data.high_net_worth_duration,
      '----': App.data["null"],
      empty: App.data.empty,
      one_value: App.data.one_value,
      two_values: App.data.two_values,
      zero: App.data.zero,
      zeroes: App.data.zeroes,
      sum_to_zero: App.data.sum_to_zero,
      bad_range: App.data.bad_range
    };
  }),
  selectedData: 'three_ranges'
});


})();

(function() {


App.EmberChartsPieController = App.SlideController.extend({
  maxNumberOfSlices: 8,
  minSlicePercent: 2,
  maxRadius: 100,
  availableDataSets: Ember.computed(function() {
    return _.keys(this.get('rawDataHash'));
  }).property('rawDataHash'),
  data: Ember.computed(function() {
    return this.get('rawDataHash')[this.get('selectedData')];
  }).property('selectedData', 'rawDataHash'),
  rawDataHash: Ember.computed(function() {
    return {
      asset_values: App.data.asset_values,
      many_values: App.data.many_values,
      monthly_return_single_period: App.data.monthly_return_single_period,
      high_net_worth_duration: App.data.high_net_worth_duration,
      '----': App.data["null"],
      empty: App.data.empty,
      one_value: App.data.one_value,
      two_values: App.data.two_values,
      zero: App.data.zero,
      zeroes: App.data.zeroes,
      sum_to_zero: App.data.sum_to_zero,
      bad_range: App.data.bad_range
    };
  }),
  selectedData: 'asset_values',
  sortTypes: ['label', 'value'],
  selectedSortType: 'value'
});


})();

(function() {


App.EmberChartsScatterController = App.SlideController.extend({
  availableDataSets: Ember.computed(function() {
    return _.keys(this.get('rawDataHash'));
  }).property('rawDataHash'),
  data: Ember.computed(function() {
    return this.get('rawDataHash')[this.get('selectedData')];
  }).property('selectedData', 'rawDataHash'),
  isShowingTotal: false,
  xValueDisplayName: 'Risk',
  yValueDisplayName: 'Return',
  totalPointData: Ember.computed(function() {
    var data;
    data = this.get('data');
    return {
      group: 'Portfolio Total',
      xValue: data.reduce((function(prev, d) {
        return prev + d.xValue;
      }), 0),
      yValue: data.reduce((function(prev, d) {
        return prev + d.yValue;
      }), 0)
    };
  }).property('data'),
  selectedData: 'groupedPercent',
  rawDataHash: Ember.computed(function() {
    return {
      groupedPercent: App.data.groupedPercent,
      groupedMoney: App.data.groupedMoney,
      ungroupedPercent: App.data.ungroupedPercent,
      ungroupedMoney: App.data.ungroupedMoney,
      '----': App.data["null"],
      empty: App.data.empty,
      groupedZero: App.data.groupedZero,
      groupedZeroes: App.data.groupedZeroes,
      ungroupedZero: App.data.ungroupedZero,
      ungroupedZeroes: App.data.ungroupedZeroes
    };
  }),
  dotRadius: 7
});


})();

(function() {


App.EmberChartsBubbleController = App.SlideController.extend({
  availableDataSets: Ember.computed(function() {
    return _.keys(this.get('rawDataHash'));
  }).property('rawDataHash'),
  data: Ember.computed(function() {
    return this.get('rawDataHash')[this.get('selectedData')];
  }).property('selectedData', 'rawDataHash'),
  rawDataHash: Ember.computed(function() {
    return {
      many_values: App.data.many_values,
      monthly_return_single_period: App.data.monthly_return_single_period,
      high_net_worth_duration: App.data.high_net_worth_duration,
      asset_values: App.data.asset_values
    };
  }),
  selectedData: 'many_values'
});


})();

(function() {


App.Router.map(function() {
  this.route('license');
  return this.resource('emberCharts', {
    path: '/ember-charts'
  }, function() {
    this.route('overview');
    this.route('documentation');
    this.route('pie');
    this.route('horizontal_bar');
    this.route('vertical_bar');
    this.route('time_series');
    return this.route('scatter');
  });
});

App.IndexRoute = Ember.Route.extend({
  redirect: function() {
    return this.transitionTo('emberCharts.overview');
  }
});

App.EmberChartsIndexRoute = Ember.Route.extend({
  redirect: function() {
    return this.transitionTo('emberCharts.overview');
  }
});

App.EmberChartsOverviewRoute = Ember.Route.extend({
  activate: function() {
    var controller;
    controller = this.controllerFor('emberCharts');
    return controller.set('showLargeHero', true);
  },
  deactivate: function() {
    var controller;
    controller = this.controllerFor('emberCharts');
    return controller.set('showLargeHero', false);
  }
});


})();

(function() {





})();

(function() {

Ember.TEMPLATES["_footer"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("Overview &amp; Getting Started");
  }

function program3(depth0,data) {
  
  
  data.buffer.push("API &amp; Documentation");
  }

function program5(depth0,data) {
  
  
  data.buffer.push("Horizontal Bar Chart");
  }

function program7(depth0,data) {
  
  
  data.buffer.push("Vertical Bar Chart");
  }

function program9(depth0,data) {
  
  
  data.buffer.push("Pie Chart");
  }

function program11(depth0,data) {
  
  
  data.buffer.push("Scatter Plot");
  }

function program13(depth0,data) {
  
  
  data.buffer.push("Time Series");
  }

function program15(depth0,data) {
  
  
  data.buffer.push("License");
  }

  data.buffer.push("\n<div class=\"footer\">\n  <div class=\"container\">\n    <div class=\"row\">\n      <div class=\"col-md-3\">\n        <ul class=\"list-unstyled\">\n          <li><h6>Ember Charts</h6></li>\n          <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "emberCharts.overview", options) : helperMissing.call(depth0, "link-to", "emberCharts.overview", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n          <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "emberCharts.documentation", options) : helperMissing.call(depth0, "link-to", "emberCharts.documentation", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n      </div>\n      <div class=\"col-md-3\">\n        <ul class=\"list-unstyled\">\n          <li><h6>Chart Types</h6></li>\n          <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "emberCharts.horizontal_bar", options) : helperMissing.call(depth0, "link-to", "emberCharts.horizontal_bar", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n          <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "emberCharts.vertical_bar", options) : helperMissing.call(depth0, "link-to", "emberCharts.vertical_bar", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n          <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "emberCharts.pie", options) : helperMissing.call(depth0, "link-to", "emberCharts.pie", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n          <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "emberCharts.scatter", options) : helperMissing.call(depth0, "link-to", "emberCharts.scatter", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n          <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(13, program13, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "emberCharts.time_series", options) : helperMissing.call(depth0, "link-to", "emberCharts.time_series", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n        </ul>\n      </div>\n      <div class=\"col-md-3\">\n        <ul class=\"list-unstyled\">\n          <li><h6>Addepar Open Source</h6></li>\n          <li><a target=\"_BLANK\" href=\"http://addepar.github.io/\">Home</a></li>\n          <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(15, program15, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "license", options) : helperMissing.call(depth0, "link-to", "license", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n        </ul>\n      </div>\n      <div class=\"col-md-3\">\n        <ul class=\"list-unstyled\">\n          <li><h6>About Addepar</h6></li>\n          <li><a target=\"_BLANK\" href=\"http://www.addepar.com\">www.addepar.com</a></li>\n          <li>\n            <address>\n              <br>\n              <a target=\"_BLANK\" href=\"http://goo.gl/maps/446ui\"><strong>Addepar HQ</strong><br>\n              1215 Terra Bella Ave<br>\n              Mountain View, CA 94043</a><br><br>\n\n              <a target=\"_BLANK\" href=\"http://goo.gl/maps/xEiCM\"><strong>Addepar NY</strong><br>\n              335 Madison Ave Suite 880<br>\n              New York, NY 10017</a><br>\n            </address>\n          </li>\n        </ul>\n      </div>\n    </div>\n    <div class=\"row\">\n      <div class=\"col-md-12 center-align\">\n        <p>&copy; 2013 Addepar, Inc.</p>\n      </div>\n    </div>\n  </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["_navigation"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '';


  data.buffer.push("\n<nav class=\"navbar navbar-transparent addepar-navbar\" role=\"navigation\">\n  <div class=\"navbar-header\">\n    <button type=\"button\" class=\"navbar-toggle\" data-toggle=\"collapse\" data-target=\".navbar-ex1-collapse\">\n      <span class=\"sr-only\">Toggle navigation</span>\n      <span class=\"icon-bar\"></span>\n      <span class=\"icon-bar\"></span>\n      <span class=\"icon-bar\"></span>\n    </button>\n    <a class=\"navbar-brand\" href=\"#\">\n      <img id=\"logo_dark\" class=\"logo\" src=\"img/addepar_logo_light.png\" /><span class=\"navbar-title\">Open Source</span>\n    </a>\n  </div>\n\n  <div class=\"collapse navbar-collapse navbar-ex1-collapse\">\n    <ul class=\"nav navbar-nav navbar-right\">\n      <li><a href=\"http://addepar.github.io/ember-table\">Ember Table</a></li>\n      <li><a href=\"#\">Ember Charts</a></li>\n      <li><a href=\"http://addepar.github.io/ember-widgets\">Ember Widgets</a></li>\n    </ul>\n  </div><!-- /.navbar-collapse -->\n</nav>\n");
  return buffer;
  
});

Ember.TEMPLATES["application"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("\n");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "navigation", options) : helperMissing.call(depth0, "partial", "navigation", options))));
  data.buffer.push("\n\n");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n\n");
  data.buffer.push("\n");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "footer", options) : helperMissing.call(depth0, "partial", "footer", options))));
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["ember_charts"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n  ");
  data.buffer.push("\n  <div class=\"hero-container\">\n    <div class=\"hero charts-hero\">\n      <div class=\"hero-overlay\"></div>\n    </div>\n    <div class=\"container hero-content-container\">\n      <div class=\"row\">\n        <div class=\"span12 hero-tagline center-align hidden-tablet\">\n          <h1 class=\"elevated\">Ember Charts</h1>\n          <p class=\"elevated\">\n            A powerful and easy to use charting library for Ember.js.\n            <br><br>\n            <a target=\"_BLANK\"\n                href=\"https://github.com/Addepar/ember-charts/releases\"\n                class=\"addepar-btn addepar-btn-large addepar-btn-outline addepar-btn-white\">\n              Download Ember-Charts\n            </a>\n          </p>\n        </div>\n      </div>\n    </div>\n  </div>\n");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n  ");
  data.buffer.push("\n  <div class=\"hero-container small-hero-container\">\n    <div class=\"hero charts-hero\">\n      <div class=\"hero-overlay\"></div>\n    </div>\n  </div>\n");
  return buffer;
  }

  hashTypes = {};
  hashContexts = {};
  stack1 = helpers['if'].call(depth0, "showLargeHero", {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n");
  data.buffer.push("\n<div class=\"container\">\n  <div class=\"row\">\n    ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "ember_charts/sub_navigation", options) : helperMissing.call(depth0, "partial", "ember_charts/sub_navigation", options))));
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["ember_charts/_sub_navigation"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("Overview &amp; Getting Started");
  }

function program3(depth0,data) {
  
  
  data.buffer.push("API &amp; Documentation");
  }

function program5(depth0,data) {
  
  
  data.buffer.push("Horizontal Bar Chart");
  }

function program7(depth0,data) {
  
  
  data.buffer.push("Vertical Bar Chart");
  }

function program9(depth0,data) {
  
  
  data.buffer.push("Pie Chart");
  }

function program11(depth0,data) {
  
  
  data.buffer.push("Scatter Plot");
  }

function program13(depth0,data) {
  
  
  data.buffer.push("Time Series Chart");
  }

  data.buffer.push("\n<div class=\"col-md-2 sub-navigation-sidebar\">\n  <ul class=\"list-unstyled github-navigation\">\n    <li>\n      <a class=\"btn btn-default\" target=\"_BLANK\" href=\"https://github.com/addepar/ember-charts\">\n        <i class=\"icon-github\"></i> View on GitHub\n      </a>\n    </li>\n    <li>\n      <iframe src=\"http://ghbtns.com/github-btn.html?user=addepar&amp;repo=ember-charts&amp;type=watch&amp;count=true\" allowtransparency=\"true\" frameborder=\"0\" scrolling=\"0\" width=\"130\" height=\"30\"></iframe>\n    </li>\n  </ul>\n  <hr>\n  <ul class=\"list-unstyled project-navigation\">\n    <li class=\"sub-title\">Ember charts</li>\n    <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "emberCharts.overview", options) : helperMissing.call(depth0, "link-to", "emberCharts.overview", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n    <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "emberCharts.documentation", options) : helperMissing.call(depth0, "link-to", "emberCharts.documentation", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n  </ul>\n  <hr>\n  <ul class=\"list-unstyled project-navigation\">\n    <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "emberCharts.horizontal_bar", options) : helperMissing.call(depth0, "link-to", "emberCharts.horizontal_bar", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n    <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "emberCharts.vertical_bar", options) : helperMissing.call(depth0, "link-to", "emberCharts.vertical_bar", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n    <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "emberCharts.pie", options) : helperMissing.call(depth0, "link-to", "emberCharts.pie", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n    <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "emberCharts.scatter", options) : helperMissing.call(depth0, "link-to", "emberCharts.scatter", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n    <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(13, program13, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "emberCharts.time_series", options) : helperMissing.call(depth0, "link-to", "emberCharts.time_series", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n  </ul>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["ember_charts/bubble"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<div class=\"col-md-10 col-md-offset-2 left-border main-content-container\">\n  <div class=\"chart-header\">\n    <h2>Bubble Chart</h2>\n  </div>\n\n  <div class=\"example-container\">\n    <div class=\"chart-container\">\n      ");
  hashContexts = {'data': depth0,'selectedSeedColor': depth0};
  hashTypes = {'data': "ID",'selectedSeedColor': "ID"};
  options = {hash:{
    'data': ("data"),
    'selectedSeedColor': ("selectedSeedColor")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['bubble-chart'] || depth0['bubble-chart']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "bubble-chart", options))));
  data.buffer.push("\n    </div>\n  </div>\n\n  <div class=\"chart-controls bumper-30\">\n    <div class=\"chart-controls-panel\">\n      <ol>\n        <li>\n          <label>Data</label>\n          ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0,'class': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("availableDataSets"),
    'valueBinding': ("selectedData"),
    'class': ("form-control")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        </li>\n        <li>\n          <label>Color</label>\n          ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0,'class': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("seedColorNames"),
    'valueBinding': ("selectedSeedColorName"),
    'class': ("form-control")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        </li>\n      </ol>\n    </div>\n  </div>\n\n  <div class=\"chart-json\">\n    <pre>\n      ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "prettyPrintedData", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n    </pre>\n  </div>\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["ember_charts/documentation"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '';


  data.buffer.push("\n<div class=\"col-md-10 col-md-offset-2 left-border main-content-container\">\n  <h1>Ember Charts API</h1>\n  <h2>Time-series-chart Options</h2>\n  <table class=\"table ember-charts-options\">\n    <tr>\n      <th style=\"width: 200px;\">Option</th>\n      <th style=\"width: 150px;\">Default</th>\n      <th>Description</th>\n    </tr>\n    <tr>\n      <td>barData</td>\n      <td>undefined</td>\n      <td>\n        <p>Time series data to be represented by bars.  This is an array of\n        data points.  Each data point is an object with at least three fields:\n        <em>time</em>, <em>value</em>, and <em>label</em>.  The time field\n        contains a JavaScript Date.  The value field is a Number.  The label\n        field indicates which group (series) a data point belongs to.  Example:</p>\n        <div class=\"highlight\">\n<pre class=\"prettyprint lang-js\">// average high temperature (degrees F) by city\n[\n  {\n    date: new Date(2013, 05, 01),\n    value: 64,\n    label: 'San Francisco'\n  },\n  {\n    date: new Date(2013, 05, 01),\n    value: 93,\n    label: 'Phoenix'\n  },\n  {\n    date: new Date(2013, 06, 01),\n    value: 66,\n    label: 'San Francisco'\n  },\n  {\n    date: new Date(2013, 06, 01),\n    value: 103,\n    label: 'Phoenix'\n  },\n  ...\n]</pre>\n        </div>\n      </td>\n    </tr>\n    <tr>\n      <td>lineData</td>\n      <td>undefined</td>\n      <td>\n        <p>Time series data to be represented by bars.  Format is the same as for\n        the <em>barData</em> time series above.</p>\n      </td>\n    </tr>\n    <tr>\n      <td>selectedInterval</td>\n      <td>M</td>\n      <td>\n        <p>Interval between ticks on the time axis.  Can be 'D' (days), 'W'\n        (weeks), 'M' (months), 'Q' (quarters), or 'Y' (years).</p>\n      </td>\n    </tr>\n    <tr>\n      <td>selectedSeedColor</td>\n      <td>rgb(65, 65, 65)</td>\n      <td>\n        <p>Base color that the color palette will be generated from.</p>\n      </td>\n    </tr>\n    <tr>\n      <td>timeDelta</td>\n      <td>month</td>\n      <td>\n        <p>The time interval used represented by each group when using grouped\n        bars.  Can be 'day', 'week', 'month', 'quarter', 'year'</p>\n      </td>\n    </tr>\n    <tr>\n      <td>barPadding</td>\n      <td>0</td>\n      <td>\n        <p>Space between bars, as fraction of total bar + padding space.</p>\n      </td>\n    </tr>\n    <tr>\n      <td>barGroupPadding</td>\n      <td>0.25</td>\n      <td>\n        <p>Space between bar groups, as fraction of total bar + padding space.</p>\n      </td>\n    </tr>\n    <tr>\n      <td>yAxisFromZero</td>\n      <td>false</td>\n      <td>\n        <p>Force the Y axis to start at zero, instead of the smallest Y value\n        provided.</p>\n      </td>\n    </tr>\n  </table>\n\n  <hr>\n  <h2>Horizontal-Bar Options</h2>\n  <table class=\"table ember-charts-options\">\n    <tr>\n      <th style=\"width: 200px;\">Option</th>\n      <th style=\"width: 150px;\">Default</th>\n      <th>Description</th>\n    </tr>\n    <tr>\n      <td>minBarThickness</td>\n      <td>20</td>\n      <td>\n        <p>Miminum bar width in pixels.</p>\n      </td>\n    </tr>\n    <tr>\n      <td>maxBarThickness</td>\n      <td>60</td>\n      <td>\n        <p>Maximum bar width in pixels.</p>\n      </td>\n    </tr>\n    <tr>\n      <td>selectedSeedColor</td>\n      <td>rgb(65, 65, 65)</td>\n      <td><p>Base color that the color palette will be generated from.</p>\n    </td>\n    </tr>\n    <tr>\n      <td>data</td>\n      <td>undefined</td>\n      <td>\n        <p>Data to be represented by bars.  This is an array of data points.  Each\n        data point is an object with at least two fields: <em>value</em>\n        (Number), and <em>label</em> (String).</p>\n        <div class=\"highlight\">\n<pre class=\"prettyprint lang-js\">// Population\n[\n  {\n    value: 825111,\n    label: 'San Francisco'\n  },\n  {\n    value: 984299,\n    label: 'San Jose'\n  },\n  {\n    value: 400740,\n    label: 'Oakland'\n  },\n  ...\n]</pre>\n        </div>\n      </td>\n    </tr>\n    <tr>\n      <td>selectedSortType</td>\n      <td>value</td>\n      <td>\n        <p>Field from each data point by which the bars will be sorted.</p>\n      </td>\n    </tr>\n  </table>\n\n  <hr>\n  <h2>Vertical-Bar Options</h2>\n  <table class=\"table ember-charts-options\">\n    <tr>\n      <th style=\"width: 200px;\">Option</th>\n      <th style=\"width: 150px;\">Default</th>\n      <th>Description</th>\n    </tr>\n    <tr>\n      <td>maxBarThickness</td>\n      <td>60</td>\n      <td>\n        <p>Maximum bar width in pixels.</p>\n      </td>\n    </tr>\n    <tr>\n      <td>selectedSeedColor</td>\n      <td>rgb(65, 65, 65)</td>\n      <td>\n        <p>Base color that the color palette will be generated from.</p>\n      </td>\n   </tr>\n    <tr>\n      <td>data</td>\n      <td>undefined</td>\n      <td>\n        <p>Data to be represented by bars.  This is an array of data points.  Each\n        data point is an object with at least two fields: <em>value</em>\n        (Number), and <em>label</em> (String).  A third field <em>group</em>\n        (String) is optional for each data point.  The prescence of the group\n        field will group the bars based on the value of this field.</p>\n        <div class=\"highlight\">\n<pre class=\"prettyprint lang-js\">// percentage absolute return\n[\n  {\n    value: 21.51,\n    label: 'Google',\n    group: 'Tech'\n  },\n  {\n    value: 10.10,\n    label: 'Microsoft',\n    group: 'Tech'\n  },\n  {\n    value: 15.32,\n    label: 'ExxonMobil',\n    group: 'Energy'\n  },\n  {\n    value: -7.11,\n    label: 'Schlumberger',\n    group: 'Energy'\n  },\n  ...\n]</pre>\n        </div>\n      </td>\n    </tr>\n    <tr>\n      <td>maxLabelHeight</td>\n      <td>50</td>\n      <td>\n        <p>Space allocated for rotated labels on the bottom of the chart. If labels\n        are rotated, they will be extended beyond labelHeight up to\n        maxLabelHeight.</p>\n      </td>\n    </tr>\n    <tr>\n      <td>withinGroupPadding</td>\n      <td>0</td>\n      <td>\n        <p>Space between bars, as fraction of bar size.</p>\n      </td>\n    </tr>\n    <tr>\n      <td>stackBars</td>\n      <td>false</td>\n      <td>\n        <p>Stacks bars, otherwise it groups them  horizontally.</p>\n      </td>\n    </tr>\n  </table>\n\n  <hr>\n  <h2>Pie Options</h2>\n  <table class=\"table ember-charts-options\">\n    <tr>\n      <th style=\"width: 200px;\">Option</th>\n      <th style=\"width: 150px;\">Default</th>\n      <th>Description</th>\n    </tr>\n    <tr>\n      <td>maxRadius</td>\n      <td>2000</td>\n      <td>\n        <p>The maximum size in pixels of the radius of the pie.</p>\n      </td>\n    </tr>\n    <tr>\n      <td>minSlicePercent</td>\n      <td>5</td>\n      <td>\n        The smallest slices will be combined into an \"Other\" slice until no\n        slice is smaller than minSlicePercent. \"Other\" is also guaranteed to be\n        larger than minSlicePercent.\n      </td>\n    </tr>\n    <tr>\n      <td>maxNumberOfSlices</td>\n      <td>8</td>\n      <td>\n        <p>The maximum number of slices. If the number of slices is greater\n        than this then the smallest slices will be combined into an \"other\"\n        slice until there are at most maxNumberOfSlices.</p>\n      </td>\n    </tr>\n    <tr>\n      <td>selectedSeedColor</td>\n      <td>rgb(65, 65, 65)</td>\n      <td>\n        <p>Base color that the color palette will be generated from.</p>\n      </td>\n    </tr>\n    <tr>\n      <td>selectedSortType</td>\n      <td>value</td>\n      <td>\n        <p>Field from each data point by which the pie-slices will be sorted.</p>\n      </td>\n    </tr>\n    <tr>\n      <td>data</td>\n      <td>undefined</td>\n      <td>\n        <p>Data to be represented by pie-slices.  This is an array of data points.\n        Each data point is an object with at least two fields: <em>value</em>\n        (Number), and <em>label</em> (String).</p>\n        <div class=\"highlight\">\n<pre class=\"prettyprint lang-js\">// Population\n[\n  {\n  value: 825111,\n  label: 'San Francisco'\n  },\n  {\n  value: 984299,\n  label: 'San Jose'\n  },\n  {\n  value: 400740,\n  label: 'Oakland'\n  },\n  ...\n]</pre>\n        </div>\n      </td>\n    </tr>\n  </table>\n\n  <hr>\n  <h2>Scatter Options</h2>\n  <table class=\"table ember-charts-options\">\n    <tr>\n      <th style=\"width: 200px;\">Option</th>\n      <th style=\"width: 150px;\">Default</th>\n      <th>Description</th>\n    </tr>\n    <tr>\n      <td>dotRadius</td>\n      <td>7</td>\n      <td>\n        <p>Size of each icon on the scatter plot.</p>\n      </td>\n    </tr>\n    <tr>\n      <td>data</td>\n      <td>undefined</td>\n      <td>\n        <p>Data to be represented by points on a scatter plot.  This is an array of\n        data points.  Each data point is an object with at least two fields:\n        <em>xValue</em> (Number), and <em>yValue</em> (Number).  XValue and\n        yValue correspond to an individual measurement.</p>\n\n        <p>A third field <em>group</em>, indicating the group to which the\n        measurement belongs,  is optional.  We display a different icon for each\n        group if the number of groups is less than or equal to the maximum\n        number of icons.  Otherwise, a standard icon is used for all groups.</p>\n        <div class=\"highlight\">\n<pre class=\"prettyprint lang-js\">// January minimum temperature in degrees F (yValue)\n// by latitude (xValue) and region\n[\n  {\n  \"group\": \"West Coast\",\n  \"xValue\": 38.4,\n  \"yValue\": 42\n  },\n  {\n  \"group\": \"Midwest\",\n  \"xValue\": 42.3,\n  \"yValue\": 21\n  },\n  {\n  \"group\": \"West Coast\",\n  \"xValue\": 34.2,\n  \"yValue\": 47\n  },\n  {\n  \"group\": \"South\",\n  \"xValue\": 33.9,\n  \"yValue\": 37\n  },\n  ...\n]</pre>\n        </div>\n        </code>\n      </td>\n    </tr>\n    <tr>\n      <td>selectedSeedColor</td>\n      <td>rgb(65, 65, 65)</td>\n      <td>\n        <p>Base color that the color palette will be generated from.</p>\n      </td>\n    </tr>\n  </table>\n\n  <hr>\n  <h2>Bubble Options</h2>\n  <table class=\"table ember-charts-options\">\n    <tr>\n      <th style=\"width: 200px;\">Option</th>\n      <th style=\"width: 150px;\">Default</th>\n      <th>Description</th>\n    </tr>\n    <tr>\n      <td>data</td>\n      <td>undefined</td>\n      <td>\n        <p>Data to be represented by bubbles in a bubble chart.  This is an array\n        of data points.  Each data point is an object with at least two fields:\n        <em>value</em> (Number), and <em>label</em> (String).</p>\n        <div class=\"highlight\">\n<pre class=\"prettyprint lang-js\">// Population\n[\n  {\n    value: 825111,\n    label: 'San Francisco'\n  },\n  {\n    value: 984299,\n    label: 'San Jose'\n  },\n  {\n    value: 400740,\n    label: 'Oakland'\n  },\n  ...\n]</pre>\n        </div>\n      </td>\n    </tr>\n    <tr>\n      <td>selectedSeedColor</td>\n      <td>rgb(65, 65, 65)</td>\n      <td>\n        <p>Base color that the color palette will be generated from.</p>\n      </td>\n    </tr>\n  </table>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["ember_charts/horizontal_bar"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<div class=\"col-md-10 col-md-offset-2 left-border main-content-container\">\n  <div class=\"chart-header\">\n    <h2>Horizontal Bar Chart</h2>\n  </div>\n\n  <div class=\"example-container\">\n    <div class=\"chart-container\">\n      ");
  hashContexts = {'minBarThickness': depth0,'maxBarThickness': depth0,'selectedSeedColor': depth0,'data': depth0,'selectedSortType': depth0};
  hashTypes = {'minBarThickness': "ID",'maxBarThickness': "ID",'selectedSeedColor': "ID",'data': "ID",'selectedSortType': "ID"};
  options = {hash:{
    'minBarThickness': ("minBarThickness"),
    'maxBarThickness': ("maxBarThickness"),
    'selectedSeedColor': ("selectedSeedColor"),
    'data': ("data"),
    'selectedSortType': ("selectedSortType")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['horizontal-bar-chart'] || depth0['horizontal-bar-chart']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "horizontal-bar-chart", options))));
  data.buffer.push("\n    </div>\n  </div>\n\n  <div class=\"row bumper-30\">\n    <div class=\"col-md-6\">\n      <h4>Ember Bindings</h4>\n\n      <div class=\"form-horizontal\">\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Data</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0,'class': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("availableDataSets"),
    'valueBinding': ("selectedData"),
    'class': ("form-control")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Sorting</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0,'class': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("sortTypes"),
    'valueBinding': ("selectedSortType"),
    'class': ("form-control")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Color</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0,'class': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("seedColorNames"),
    'valueBinding': ("selectedSeedColorName"),
    'class': ("form-control")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Min Bar Thickness</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "INTEGER",'max': "INTEGER",'step': "INTEGER",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberComponent", {hash:{
    'min': (20),
    'max': (200),
    'step': (10),
    'valueBinding': ("minBarThickness")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            <span class=\"help-block\">Min Thickness: ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "minBarThickness", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Max Bar Thickness</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "INTEGER",'max': "INTEGER",'step': "INTEGER",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberComponent", {hash:{
    'min': (20),
    'max': (200),
    'step': (10),
    'valueBinding': ("maxBarThickness")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            <span class=\"help-block\">Max Thickness: ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "maxBarThickness", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"col-md-6\">\n      <h4>JSON Data</h4>\n      <div class=\"chart-json\">\n<pre>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "prettyPrintedData", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</pre>\n      </div>\n    </div>\n  </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["ember_charts/overview"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("\n      <div class=\"col-md-4\">\n        <h4>Time Series</h4>\n        <img class=\"preview-box\" src=\"img/preview_chart_time_series.png\" />\n      </div>\n    ");
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n      <div class=\"col-md-4\">\n        <h4>Horizontal Bar</h4>\n        <img class=\"preview-box\" src=\"img/preview_chart_horizontal_bar.png\" />\n      </div>\n    ");
  }

function program5(depth0,data) {
  
  
  data.buffer.push("\n      <div class=\"col-md-4\">\n        <h4>Vertical Bar</h4>\n        <img class=\"preview-box\" src=\"img/preview_chart_vertical_bar.png\" />\n      </div>\n    ");
  }

function program7(depth0,data) {
  
  
  data.buffer.push("\n      <div class=\"col-md-4\">\n        <h4>Pie</h4>\n        <img class=\"preview-box\" src=\"img/preview_chart_pie.png\" />\n      </div>\n    ");
  }

function program9(depth0,data) {
  
  
  data.buffer.push("\n      <div class=\"col-md-4\">\n        <h4>Scatter</h4>\n        <img class=\"preview-box\" src=\"img/preview_chart_scatter.png\" />\n      </div>\n    ");
  }

  data.buffer.push("<div class=\"col-md-10 col-md-offset-2 left-border main-content-container\">\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <h1>Ember Charts</h1>\n      <p class=\"elevated\">A charting library built with the\n      Ember.js and d3.js frameworks. It includes time series, bar, pie, and\n      scatter charts which are easy to extend and modify. The out-of-the-box\n      behavior these chart components represents our thoughts on best\n      practices in chart interactivity and presentation.</p>\n    </div>\n  </div>\n\n  <div class=\"row ember-charts-examples\">\n    ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "emberCharts.time_series", options) : helperMissing.call(depth0, "link-to", "emberCharts.time_series", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "emberCharts.horizontal_bar", options) : helperMissing.call(depth0, "link-to", "emberCharts.horizontal_bar", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "emberCharts.vertical_bar", options) : helperMissing.call(depth0, "link-to", "emberCharts.vertical_bar", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "emberCharts.pie", options) : helperMissing.call(depth0, "link-to", "emberCharts.pie", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n    ");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers['link-to'] || depth0['link-to']),stack1 ? stack1.call(depth0, "emberCharts.scatter", options) : helperMissing.call(depth0, "link-to", "emberCharts.scatter", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("\n  </div>\n\n  <hr>\n  <div class=\"row\">\n    <div class=\"col-md-6\">\n      <h3>Features</h3>\n      <ul class=\"styled\">\n        <li>Highly customizable and extensible.</li>\n        <li>Rich with features - add legends, labels, tooltips, and\n        mouseover effects.</li>\n        <li>Robust & polished - weird data will not cause your charts to\n        break.</li>\n        <li>Roll your own charts by extending our ChartComponent class -\n        get labels, automatic resizing, and reasonable defaults for\n        margins, padding, etc.</li>\n      </ul>\n    </div>\n    <div class=\"col-md-6\">\n      <h3>Dependencies</h3>\n      <ul class=\"styled\">\n        <li><a target=\"_BLANK\" href=\"http://d3js.org/\">D3.js</a></li>\n        <li><a target=\"_BLANK\" href=\"http://emberjs.com/\">Ember.js</a></li>\n        <li><a target=\"_BLANK\" href=\"http://lodash.com/\">Lo-Dash.js</a></li>\n        <li><a target=\"_BLANK\" href=\"http://jquery.com/\">jQuery</a></li>\n        <li><a target=\"_BLANK\" href=\"http://jqueryui.com/\">jQuery UI</a></li>\n      </ul>\n    </div>\n  </div>\n\n  <div class=\"row\">\n    <div class=\"col-md-6\">\n      <hr>\n      <h1>Getting Started</h1>\n      <p>You will need <a target=\"_BLANK\" href=\"http://nodejs.org/\">node</a> installed as a development dependency.</p>\n      <p><a target=\"_BLANK\"\n      href=\"https://github.com/Addepar/ember-charts/\">Clone it from Github</a>\n      or <a target=\"_BLANK\" href=\"https://github.com/Addepar/ember-charts/releases\">download the ZIP repo</a></p>\n      <div class=\"highlight\">\n<pre><code>$ npm install -g grunt-cli\n$ npm install\n$ grunt\n$ node examples.js</code></pre>\n      <p>Go to your browser and navigate to localhost:8000/gh_pages</p>\n      </div>\n    </div>\n    <div class=\"col-md-6\">\n      <hr>\n      <h1>Contributing</h1>\n      <p>You can contribute to this project in one of two ways:\n      <ul class=\"styled\">\n        <li>Browse the ember-charts <a target=\"_BLANK\" href=\"https://github.com/Addepar/ember-charts/issues?state=open\">issues</a> and report bugs</li>\n        <li>Clone the ember-charts repo, make some changes according to our development guidelines and issue a pull-request with your changes.</li>\n      </ul>\n      <p>We keep the ember-charts.js code to the minimum necessary, giving users as much control as possible.</p>\n    </div>\n  </div>\n\n  <div class=\"row\">\n    <div class=\"col-md-6\">\n      <hr>\n      <h1>Changelog</h1>\n      <p>The current version is 0.3.0.\n      <p>For the full list of changes, please see <a target=\"_BLANK\"\n      href=\"https://github.com/Addepar/ember-charts/blob/master/CHANGELOG.md\">CHANGELOG.md</a>.</p>\n      </ul>\n    </div>\n    <div class=\"col-md-6\">\n      <hr>\n      <h1>Acknowledgements</h1>\n      <p>Core contributors</p>\n      <ul class=\"styled\">\n        <li><a target=\"_BLANK\" href=\"https://github.com/sherb\">Tony Sherbondy</a></li>\n        <li><a target=\"_BLANK\" href=\"https://github.com/raykyri\">Raymond Zhong</a></li>\n      </ul>\n      <p><a target=\"_BLANK\" href=\"https://github.com/Addepar/ember-charts/graphs/contributors\">List of Contributors on Github</a></p>\n      <p>With lots of help from the Ember.js team</p>\n    </div>\n  </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["ember_charts/pie"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<div class=\"col-md-10 col-md-offset-2 left-border main-content-container\">\n  <div class=\"chart-header\">\n    <h2>Pie Chart</h2>\n  </div>\n\n  <div class=\"example-container\">\n    <div class=\"chart-container\">\n      ");
  hashContexts = {'maxRadius': depth0,'maxSlicePercent': depth0,'minSlicePercent': depth0,'maxNumberOfSlices': depth0,'selectedSeedColor': depth0,'selectedSortType': depth0,'data': depth0};
  hashTypes = {'maxRadius': "ID",'maxSlicePercent': "ID",'minSlicePercent': "ID",'maxNumberOfSlices': "ID",'selectedSeedColor': "ID",'selectedSortType': "ID",'data': "ID"};
  options = {hash:{
    'maxRadius': ("maxRadius"),
    'maxSlicePercent': ("maxSlicePercent"),
    'minSlicePercent': ("minSlicePercent"),
    'maxNumberOfSlices': ("maxNumberOfSlices"),
    'selectedSeedColor': ("selectedSeedColor"),
    'selectedSortType': ("selectedSortType"),
    'data': ("data")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['pie-chart'] || depth0['pie-chart']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "pie-chart", options))));
  data.buffer.push("\n    </div>\n  </div>\n\n  <div class=\"row bumper-30\">\n    <div class=\"col-md-6\">\n      <h4>Ember Bindings</h4>\n\n      <div class=\"form-horizontal\">\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Data</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'class': depth0,'contentBinding': depth0,'valueBinding': depth0,'class': depth0};
  hashTypes = {'class': "STRING",'contentBinding': "STRING",'valueBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'class': ("chart-data"),
    'contentBinding': ("availableDataSets"),
    'valueBinding': ("selectedData"),
    'class': ("form-control")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Color</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0,'class': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("seedColorNames"),
    'valueBinding': ("selectedSeedColorName"),
    'class': ("form-control")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Max Radius</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberComponent", {hash:{
    'min': ("40"),
    'max': ("300"),
    'step': ("10"),
    'valueBinding': ("maxRadius")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            <span class=\"help-block\">Max Radius: ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "maxRadius", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Max Number of Slices</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberComponent", {hash:{
    'min': ("1"),
    'max': ("30"),
    'step': ("1"),
    'valueBinding': ("maxNumberOfSlices")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            <span class=\"help-block\">Max Number of Slices: ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "maxNumberOfSlices", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Min Slice Percent</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberComponent", {hash:{
    'min': ("0"),
    'max': ("20"),
    'step': ("1"),
    'valueBinding': ("minSlicePercent")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            <span class=\"help-block\">Min Slice Percent: ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "minSlicePercent", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"col-md-6\">\n      <h4>JSON Data</h4>\n      <div class=\"chart-json\">\n<pre>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "prettyPrintedData", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</pre>\n      </div>\n    </div>\n  </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["ember_charts/scatter"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<div class=\"col-md-10 col-md-offset-2 left-border main-content-container\">\n  <div class=\"chart-header\">\n    <h2>Scatter Plot</h2>\n  </div>\n\n  <div class=\"example-container\">\n    <div class=\"chart-container\">\n      ");
  hashContexts = {'dotRadius': depth0,'data': depth0,'isShowingTotal': depth0,'totalPointData': depth0,'selectedSeedColor': depth0,'xValueDisplayName': depth0,'yValueDisplayName': depth0};
  hashTypes = {'dotRadius': "ID",'data': "ID",'isShowingTotal': "ID",'totalPointData': "ID",'selectedSeedColor': "ID",'xValueDisplayName': "ID",'yValueDisplayName': "ID"};
  options = {hash:{
    'dotRadius': ("dotRadius"),
    'data': ("data"),
    'isShowingTotal': ("isShowingTotal"),
    'totalPointData': ("totalPointData"),
    'selectedSeedColor': ("selectedSeedColor"),
    'xValueDisplayName': ("xValueDisplayName"),
    'yValueDisplayName': ("yValueDisplayName")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['scatter-chart'] || depth0['scatter-chart']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "scatter-chart", options))));
  data.buffer.push("\n    </div>\n  </div>\n\n  <div class=\"row bumper-30\">\n    <div class=\"col-md-6\">\n      <h4>Ember Bindings</h4>\n\n      <div class=\"form-horizontal\">\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Data</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0,'class': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("availableDataSets"),
    'valueBinding': ("selectedData"),
    'class': ("form-control")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Color</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0,'class': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("seedColorNames"),
    'valueBinding': ("selectedSeedColorName"),
    'class': ("form-control")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Dot Radius</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberComponent", {hash:{
    'min': ("2"),
    'max': ("20"),
    'step': ("1"),
    'valueBinding': ("dotRadius")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            <span class=\"help-block\">Dot Radius: ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "dotRadius", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">X Display Name</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'value': depth0};
  hashTypes = {'value': "ID"};
  options = {hash:{
    'value': ("xValueDisplayName")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || depth0.input),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Y Display Name</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'value': depth0};
  hashTypes = {'value': "ID"};
  options = {hash:{
    'value': ("yValueDisplayName")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.input || depth0.input),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <div class=\"col-lg-offset-4 col-lg-8\">\n            <div class=\"checkbox\">\n              <label>\n                ");
  hashContexts = {'checkedBinding': depth0};
  hashTypes = {'checkedBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Checkbox", {hash:{
    'checkedBinding': ("isShowingTotal")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" Show Portfolio Total\n              </label>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"col-md-6\">\n      <h4>JSON Data</h4>\n      <div class=\"chart-json\">\n<pre>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "prettyPrintedData", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</pre>\n      </div>\n    </div>\n  </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["ember_charts/time_series"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<div class=\"col-md-10 col-md-offset-2 left-border main-content-container\">\n  <div class=\"chart-header\">\n    <h2>Time Series Chart</h2>\n  </div>\n\n  <div class=\"example-container\">\n    <div class=\"chart-container\">\n      ");
  hashContexts = {'barData': depth0,'lineData': depth0,'selectedInterval': depth0,'selectedSeedColor': depth0,'barPadding': depth0,'barGroupPadding': depth0,'barLeftOffset': depth0,'yAxisFromZero': depth0};
  hashTypes = {'barData': "ID",'lineData': "ID",'selectedInterval': "ID",'selectedSeedColor': "ID",'barPadding': "ID",'barGroupPadding': "ID",'barLeftOffset': "ID",'yAxisFromZero': "ID"};
  options = {hash:{
    'barData': ("barData"),
    'lineData': ("lineData"),
    'selectedInterval': ("selectedInterval"),
    'selectedSeedColor': ("selectedSeedColor"),
    'barPadding': ("barPadding"),
    'barGroupPadding': ("barGroupPadding"),
    'barLeftOffset': ("barLeftOffset"),
    'yAxisFromZero': ("yAxisFromZero")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['time-series-chart'] || depth0['time-series-chart']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "time-series-chart", options))));
  data.buffer.push("\n    </div>\n  </div>\n\n  <div class=\"row bumper-30\">\n    <div class=\"col-md-6\">\n      <h4>Ember Bindings</h4>\n\n      <div class=\"form-horizontal\">\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Line Data</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0,'class': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("availableLineDataSets"),
    'valueBinding': ("selectedLineData"),
    'class': ("form-control")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Bar Data</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0,'class': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("availableBarDataSets"),
    'valueBinding': ("selectedBarData"),
    'class': ("form-control")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Color</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0,'class': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("seedColorNames"),
    'valueBinding': ("selectedSeedColorName"),
    'class': ("form-control")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Tick Interval</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0,'class': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("tickIntervals"),
    'valueBinding': ("selectedInterval"),
    'class': ("form-control")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Bar Padding</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberComponent", {hash:{
    'min': ("0"),
    'max': ("1"),
    'step': ("0.05"),
    'valueBinding': ("barPadding")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            <span class=\"help-block\">Bar Padding: ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "barPadding", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Bar Group Padding</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberComponent", {hash:{
    'min': ("0"),
    'max': ("1"),
    'step': ("0.05"),
    'valueBinding': ("barGroupPadding")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            <span class=\"help-block\">Bar Group Padding: ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "barGroupPadding", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Bar Left Offset</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberComponent", {hash:{
    'min': ("-1"),
    'max': ("1"),
    'step': ("0.05"),
    'valueBinding': ("barLeftOffset")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            <span class=\"help-block\">Bar Left Offset: ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "barLeftOffset", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <div class=\"col-lg-offset-4 col-lg-8\">\n            <div class=\"checkbox\">\n              <label>");
  hashContexts = {'checkedBinding': depth0};
  hashTypes = {'checkedBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Checkbox", {hash:{
    'checkedBinding': ("yAxisFromZero")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" Force Y-Axis From Zero</label>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"col-md-6\">\n      <h4>JSON Data</h4>\n      <div class=\"chart-json\">\n<pre>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "prettyPrintedData", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</pre>\n      </div>\n    </div>\n  </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["ember_charts/vertical_bar"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<div class=\"col-md-10 col-md-offset-2 left-border main-content-container\">\n  <div class=\"chart-header\">\n    <h2>Vertical Bar Chart</h2>\n  </div>\n\n  <div class=\"example-container\">\n    <div class=\"chart-container\">\n      ");
  hashContexts = {'maxBarThickness': depth0,'selectedSeedColor': depth0,'data': depth0,'maxLabelHeight': depth0,'withinGroupPadding': depth0,'betweenGroupPadding': depth0,'stackBars': depth0};
  hashTypes = {'maxBarThickness': "ID",'selectedSeedColor': "ID",'data': "ID",'maxLabelHeight': "ID",'withinGroupPadding': "ID",'betweenGroupPadding': "ID",'stackBars': "ID"};
  options = {hash:{
    'maxBarThickness': ("maxBarThickness"),
    'selectedSeedColor': ("selectedSeedColor"),
    'data': ("data"),
    'maxLabelHeight': ("maxLabelHeight"),
    'withinGroupPadding': ("withinGroupPadding"),
    'betweenGroupPadding': ("betweenGroupPadding"),
    'stackBars': ("stackBars")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers['vertical-bar-chart'] || depth0['vertical-bar-chart']),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "vertical-bar-chart", options))));
  data.buffer.push("\n    </div>\n  </div>\n\n  <div class=\"row bumper-30\">\n    <div class=\"col-md-6\">\n      <h4>Ember Bindings</h4>\n\n      <div class=\"form-horizontal\">\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Data</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0,'class': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("availableDataSets"),
    'valueBinding': ("selectedData"),
    'class': ("form-control")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Color</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0,'class': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING",'class': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("seedColorNames"),
    'valueBinding': ("selectedSeedColorName"),
    'class': ("form-control")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Rotated Label Height</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'min': depth0,'max': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberComponent", {hash:{
    'min': ("20"),
    'max': ("100"),
    'valueBinding': ("maxLabelHeight")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            <span class=\"help-block\">Max Label Height: ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "maxLabelHeight", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Between Group Padding</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberComponent", {hash:{
    'min': ("0"),
    'max': ("2"),
    'step': ("0.05"),
    'valueBinding': ("betweenGroupPadding")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            <span class=\"help-block\">Between Group Padding: ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "betweenGroupPadding", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <label class=\"col-lg-4 control-label\">Within Group Padding</label>\n          <div class=\"col-lg-8\">\n            ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberComponent", {hash:{
    'min': ("0"),
    'max': ("2"),
    'step': ("0.05"),
    'valueBinding': ("withinGroupPadding")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n            <span class=\"help-block\">Within Group Padding: ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "withinGroupPadding", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</span>\n          </div>\n        </div>\n        <div class=\"form-group\">\n          <div class=\"col-lg-offset-4 col-lg-8\">\n            <div class=\"checkbox\">\n              <label>\n                ");
  hashContexts = {'checkedBinding': depth0};
  hashTypes = {'checkedBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Checkbox", {hash:{
    'checkedBinding': ("stackBars")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(" Stacked Bars\n              </label>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"col-md-6\">\n      <h4>JSON Data</h4>\n      <div class=\"chart-json\">\n<pre>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "prettyPrintedData", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</pre>\n      </div>\n    </div>\n  </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["license"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("\n");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "navigation", options) : helperMissing.call(depth0, "partial", "navigation", options))));
  data.buffer.push("\n\n");
  data.buffer.push("\n<div class=\"hero-container small-hero-container\">\n  <div class=\"hero charts-hero\">\n    <div class=\"hero-overlay\"></div>\n  </div>\n</div>\n\n");
  data.buffer.push("\n<div class=\"section\">\n  <div class=\"container main-content-container\">\n    <div class=\"row\">\n      <div class=\"col-md-6 col-md-offset-3 section-title\">\n        <h1>Code &amp; Documentation Licensing</h1>\n      </div>\n      <div class=\"col-md-6 col-md-offset-3\">\n        <p>The majority of open source software exclusively developed by Addepar is licensed under the liberal terms of the Apache License, Version 2.0. The documentation is generally available under the Creative Commons Attribution 3.0 Unported License. In the end, you are free to use, modify and distribute any documentation, source code or examples within our open source projects as long as you adhere to the licensing conditions present within the projects.</p>\n        <p>Also note that our engineers like to hack on their own open source projects in their free time. For code provided by our engineers outside of our official repositories on GitHub, Addepar does not grant any type of license, whether express or implied, to such code.</p>\n     </div>\n    </div>\n  </div>\n</div>\n\n");
  data.buffer.push("\n");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  data.buffer.push(escapeExpression(((stack1 = helpers.partial || depth0.partial),stack1 ? stack1.call(depth0, "footer", options) : helperMissing.call(depth0, "partial", "footer", options))));
  return buffer;
  
});

})();