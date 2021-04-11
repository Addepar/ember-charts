// TODO(azirbel): This needs to be an external dependency.
import $ from 'jquery';

import { debounce } from '@ember/runloop';
import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import { isFunction } from 'lodash-es';

export default Mixin.create({
  resizeEndDelay: 200,
  resizing: false,
  onResizeStart() {},
  onResizeEnd() {},
  onResize() {},

  endResize: computed(function() {
    return function(event) {
      if (this.isDestroyed) {
        return;
      }
      this.set('resizing', false);
      if (isFunction(this.onResizeEnd)) {
        this.onResizeEnd(event);
      }
    };
  }),

  handleWindowResize: function(event) {
    if ((typeof event.target.id !== "undefined" && event.target.id !== null) &&
        (event.target.id !== this.elementId)) {
      return;
    }
    if (!this.get('resizing')) {
      this.set('resizing', true);
      if (isFunction(this.onResizeStart)) {
        this.onResizeStart(event);
      }
    }
    if (isFunction(this.onResize)) {
      this.onResize(event);
    }
    return debounce(this, this.get('endResize'), event, this.get('resizeEndDelay'));
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
    this._resizeHandler = $.proxy(this.get('handleWindowResize'), this);
    return $(window).on("resize." + this.elementId, this._resizeHandler);
  },

  _removeDocumentHandlers: function() {
    $(window).off("resize." + this.elementId, this._resizeHandler);
    return this._resizeHandler = null;
  }
});
