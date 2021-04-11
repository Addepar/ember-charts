import { computed, get, set } from '@ember/object';

// Workaround bug in Ember 1.7+ with `Ember.computed.alias`
// See: https://github.com/emberjs/ember.js/issues/9265
// and: https://github.com/emberjs/ember.js/issues/5623
// This just reverts us to the prior implementation in 1.6
let legacyAlias = function(dependentKey) {
  return computed(dependentKey, {
    get() {
      return get(this, dependentKey);
    },

    set(key, value) {
      set(this, dependentKey, value);

      return get(this, dependentKey);
    },
  });
};

export { legacyAlias };
