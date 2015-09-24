// usage: emberSelectFor('bar-data') 
// => ember-select  inside <div data-test="bar-data"> ... </div>
export function emberSelectFor(name) {
  return '[data-test="' + name + '"] .ember-select';
}