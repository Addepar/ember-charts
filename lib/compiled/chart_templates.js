Ember.TEMPLATES["chart"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', hashContexts, hashTypes, escapeExpression=this.escapeExpression;


  data.buffer.push("<svg ");
  hashContexts = {'width': depth0,'height': depth0};
  hashTypes = {'width': "STRING",'height': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'width': ("outerWidth"),
    'height': ("outerHeight")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n  <g class=\"chart-viewport\"\n    ");
  hashContexts = {'transform': depth0};
  hashTypes = {'transform': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'transform': ("transformViewport")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n  </g>\n</svg>\n");
  return buffer;
  
});