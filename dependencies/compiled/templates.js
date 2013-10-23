Ember.TEMPLATES["application"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, stack2, hashTypes, hashContexts, options, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  data.buffer.push("Time Series Chart");
  }

function program3(depth0,data) {
  
  
  data.buffer.push("Horizontal Bar Chart");
  }

function program5(depth0,data) {
  
  
  data.buffer.push("Vertical Bar Chart");
  }

function program7(depth0,data) {
  
  
  data.buffer.push("Pie Chart");
  }

function program9(depth0,data) {
  
  
  data.buffer.push("Scatter Plot");
  }

  data.buffer.push("<div class=\"navbar\">\n  <div class=\"navbar-inner\">\n    <ul class=\"nav\">\n      <li>\n        <a class=\"brand\" href=\"#\">\n          <img src=\"img/addepar-icon-small.png\"/>\n        </a>\n      </li>\n      <li>\n      </li>\n      <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers.linkTo || depth0.linkTo),stack1 ? stack1.call(depth0, "time_series_slide", options) : helperMissing.call(depth0, "linkTo", "time_series_slide", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n      <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers.linkTo || depth0.linkTo),stack1 ? stack1.call(depth0, "horizontal_bar_slide", options) : helperMissing.call(depth0, "linkTo", "horizontal_bar_slide", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n      <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers.linkTo || depth0.linkTo),stack1 ? stack1.call(depth0, "vertical_bar_slide", options) : helperMissing.call(depth0, "linkTo", "vertical_bar_slide", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n      <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers.linkTo || depth0.linkTo),stack1 ? stack1.call(depth0, "pie_slide", options) : helperMissing.call(depth0, "linkTo", "pie_slide", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n      <li>");
  hashTypes = {};
  hashContexts = {};
  options = {hash:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
  stack2 = ((stack1 = helpers.linkTo || depth0.linkTo),stack1 ? stack1.call(depth0, "scatter_slide", options) : helperMissing.call(depth0, "linkTo", "scatter_slide", options));
  if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
  data.buffer.push("</li>\n    </ul>\n  </div>\n</div>\n\n<div class=\"container\">\n  ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["chart"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', hashContexts, hashTypes, escapeExpression=this.escapeExpression;


  data.buffer.push("<svg ");
  hashContexts = {'width': depth0,'height': depth0};
  hashTypes = {'width': "STRING",'height': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'width': ("view.outerWidth"),
    'height': ("view.outerHeight")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push(">\n  <filter id=\"dropShadow\">\n    <feOffset dx=\"1\" dy=\"1\" result=\"offsetblur\"/>\n    <feFlood flood-color=\"white\"/>\n    <feComposite in2=\"offsetblur\" operator=\"in\"/>\n    <feMerge>\n      <feMergeNode/>\n      <feMergeNode in=\"SourceGraphic\"/>\n    </feMerge>\n  </filter>\n  <g\n    class=\"chart-viewport\"\n    ");
  hashContexts = {'transform': depth0};
  hashTypes = {'transform': "STRING"};
  data.buffer.push(escapeExpression(helpers.bindAttr.call(depth0, {hash:{
    'transform': ("view.transformViewport")
  },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  ></g>\n</svg>\n");
  return buffer;
  
});

Ember.TEMPLATES["horizontal_bar_slide"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n    ");
  hashContexts = {'minBarThicknessBinding': depth0,'maxBarThicknessBinding': depth0,'selectedSeedColorBinding': depth0,'dataBinding': depth0,'selectedSortTypeBinding': depth0};
  hashTypes = {'minBarThicknessBinding': "STRING",'maxBarThicknessBinding': "STRING",'selectedSeedColorBinding': "STRING",'dataBinding': "STRING",'selectedSortTypeBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Chart.HorizontalBarView", {hash:{
    'minBarThicknessBinding': ("minBarThickness"),
    'maxBarThicknessBinding': ("maxBarThickness"),
    'selectedSeedColorBinding': ("selectedSeedColor"),
    'dataBinding': ("data"),
    'selectedSortTypeBinding': ("selectedSortType")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  ");
  return buffer;
  }

  data.buffer.push("<div class=\"chart-header\">\n  <h3>Horizontal Bar Chart</h3>\n</div>\n\n<div class=\"chart-container\">\n  ");
  hashContexts = {'maxWidth': depth0,'maxHeight': depth0};
  hashTypes = {'maxWidth': "STRING",'maxHeight': "STRING"};
  stack1 = helpers.view.call(depth0, "Addepar.Components.Resizable", {hash:{
    'maxWidth': ("700"),
    'maxHeight': ("500")
  },inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n\n<div class=\"chart-controls\">\n  <div class=\"chart-controls-panel\">\n    <ol>\n      <li>\n        <label>Data</label>\n        ");
  hashContexts = {'class': depth0,'contentBinding': depth0,'valueBinding': depth0};
  hashTypes = {'class': "STRING",'contentBinding': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'class': ("chart-data"),
    'contentBinding': ("availableDataSets"),
    'valueBinding': ("selectedData")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n      <li>\n        <label>Sorting</label>\n        ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("sortTypes"),
    'valueBinding': ("selectedSortType")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n      <li>\n        <label>Color</label>\n        ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("seedColorNames"),
    'valueBinding': ("selectedSeedColorName")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n      <li>\n        <label>Min Bar Thickness</label>\n        ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberView", {hash:{
    'min': ("20"),
    'max': ("200"),
    'step': ("10"),
    'valueBinding': ("minBarThickness")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        <p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "minBarThickness", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n        <br>\n\n        <label>Max Bar Thickness</label>\n        ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberView", {hash:{
    'min': ("20"),
    'max': ("200"),
    'step': ("10"),
    'valueBinding': ("maxBarThickness")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        <p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "maxBarThickness", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n      </li>\n    </ol>\n  </div>\n</div>\n\n<div class=\"chart-json\">\n  <pre>\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "prettyPrintedData", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  </pre>\n</div>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["pie_slide"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n    ");
  hashContexts = {'maxRadiusBinding': depth0,'labelWidthBinding': depth0,'maxSlicePercentBinding': depth0,'minSlicePercentBinding': depth0,'maxNumberOfSlicesBinding': depth0,'selectedSeedColorBinding': depth0,'selectedSortTypeBinding': depth0,'dataBinding': depth0};
  hashTypes = {'maxRadiusBinding': "STRING",'labelWidthBinding': "STRING",'maxSlicePercentBinding': "STRING",'minSlicePercentBinding': "STRING",'maxNumberOfSlicesBinding': "STRING",'selectedSeedColorBinding': "STRING",'selectedSortTypeBinding': "STRING",'dataBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Chart.PieView", {hash:{
    'maxRadiusBinding': ("maxRadius"),
    'labelWidthBinding': ("labelWidth"),
    'maxSlicePercentBinding': ("maxSlicePercent"),
    'minSlicePercentBinding': ("minSlicePercent"),
    'maxNumberOfSlicesBinding': ("maxNumberOfSlices"),
    'selectedSeedColorBinding': ("selectedSeedColor"),
    'selectedSortTypeBinding': ("selectedSortType"),
    'dataBinding': ("data")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  ");
  return buffer;
  }

  data.buffer.push("<div class=\"chart-header\">\n  <h3>Pie Chart</h3>\n</div>\n\n<div class=\"chart-container\">\n  ");
  hashContexts = {'maxWidth': depth0,'maxHeight': depth0};
  hashTypes = {'maxWidth': "STRING",'maxHeight': "STRING"};
  stack1 = helpers.view.call(depth0, "Addepar.Components.Resizable", {hash:{
    'maxWidth': ("700"),
    'maxHeight': ("500")
  },inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n\n<div class=\"chart-controls\">\n  <div class=\"chart-controls-panel\">\n    <ol>\n      <li>\n        <label>Data</label>\n        ");
  hashContexts = {'class': depth0,'contentBinding': depth0,'valueBinding': depth0};
  hashTypes = {'class': "STRING",'contentBinding': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'class': ("chart-data"),
    'contentBinding': ("availableDataSets"),
    'valueBinding': ("selectedData")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n      <li>\n        <label>Color</label>\n        ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("seedColorNames"),
    'valueBinding': ("selectedSeedColorName")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n      <li>\n        <label>Max Radius</label>\n        ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberView", {hash:{
    'min': ("40"),
    'max': ("200"),
    'step': ("10"),
    'valueBinding': ("maxRadius")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        <p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "maxRadius", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n        <br>\n\n        <label>Label Width</label>\n        ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberView", {hash:{
    'min': ("10"),
    'max': ("250"),
    'step': ("5"),
    'valueBinding': ("labelWidth")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        <p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "labelWidth", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n        <br>\n\n        <label>Max Number of Slices</label>\n        ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberView", {hash:{
    'min': ("1"),
    'max': ("30"),
    'step': ("1"),
    'valueBinding': ("maxNumberOfSlices")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        <p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "maxNumberOfSlices", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n        <br>\n\n        <label>Min Slice Percent</label>\n        ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberView", {hash:{
    'min': ("0"),
    'max': ("20"),
    'step': ("1"),
    'valueBinding': ("minSlicePercent")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        <p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "minSlicePercent", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n      </li>\n    </ol>\n  </div>\n</div>\n\n<div class=\"chart-json\">\n  <pre>\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "prettyPrintedData", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  </pre>\n</div>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["scatter_slide"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n    ");
  hashContexts = {'dotRadiusBinding': depth0,'dataBinding': depth0,'selectedSeedColorBinding': depth0};
  hashTypes = {'dotRadiusBinding': "STRING",'dataBinding': "STRING",'selectedSeedColorBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Chart.ScatterView", {hash:{
    'dotRadiusBinding': ("dotRadius"),
    'dataBinding': ("data"),
    'selectedSeedColorBinding': ("selectedSeedColor")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  ");
  return buffer;
  }

  data.buffer.push("<div class=\"chart-header\">\n  <h3>Scatter Plot</h3>\n</div>\n\n<div class=\"chart-container\">\n  ");
  hashContexts = {'maxWidth': depth0,'maxHeight': depth0};
  hashTypes = {'maxWidth': "STRING",'maxHeight': "STRING"};
  stack1 = helpers.view.call(depth0, "Addepar.Components.Resizable", {hash:{
    'maxWidth': ("700"),
    'maxHeight': ("500")
  },inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n\n<div class=\"chart-controls\">\n  <div class=\"chart-controls-panel\">\n    <ol>\n      <li>\n        <label>Data</label>\n        ");
  hashContexts = {'class': depth0,'contentBinding': depth0,'valueBinding': depth0};
  hashTypes = {'class': "STRING",'contentBinding': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'class': ("chart-data"),
    'contentBinding': ("availableDataSets"),
    'valueBinding': ("selectedData")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n      <li>\n        <label>Color</label>\n        ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("seedColorNames"),
    'valueBinding': ("selectedSeedColorName")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n      <li>\n        <label>Dot Radius</label>\n        ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberView", {hash:{
    'min': ("4"),
    'max': ("10"),
    'step': ("1"),
    'valueBinding': ("dotRadius")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        <p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "dotRadius", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n      </li>\n    </ol>\n  </div>\n</div>\n\n<div class=\"chart-json\">\n  <pre>\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "prettyPrintedData", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  </pre>\n</div>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["time_series_slide"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n    ");
  hashContexts = {'barDataBinding': depth0,'lineDataBinding': depth0,'selectedIntervalBinding': depth0,'selectedSeedColorBinding': depth0,'timeDeltaBinding': depth0,'barPaddingBinding': depth0,'barGroupPaddingBinding': depth0,'stackBarsBinding': depth0,'yAxisFromZeroBinding': depth0};
  hashTypes = {'barDataBinding': "STRING",'lineDataBinding': "STRING",'selectedIntervalBinding': "STRING",'selectedSeedColorBinding': "STRING",'timeDeltaBinding': "STRING",'barPaddingBinding': "STRING",'barGroupPaddingBinding': "STRING",'stackBarsBinding': "STRING",'yAxisFromZeroBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Chart.TimeSeriesView", {hash:{
    'barDataBinding': ("barData"),
    'lineDataBinding': ("lineData"),
    'selectedIntervalBinding': ("selectedInterval"),
    'selectedSeedColorBinding': ("selectedSeedColor"),
    'timeDeltaBinding': ("timeDelta"),
    'barPaddingBinding': ("barPadding"),
    'barGroupPaddingBinding': ("barGroupPadding"),
    'stackBarsBinding': ("stackBars"),
    'yAxisFromZeroBinding': ("yAxisFromZero")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  ");
  return buffer;
  }

  data.buffer.push("<div class=\"chart-header\">\n  <h3>Time Series Chart</h3>\n</div>\n\n<div class=\"chart-container\">\n  ");
  hashContexts = {'maxWidth': depth0,'maxHeight': depth0};
  hashTypes = {'maxWidth': "STRING",'maxHeight': "STRING"};
  stack1 = helpers.view.call(depth0, "Addepar.Components.Resizable", {hash:{
    'maxWidth': ("700"),
    'maxHeight': ("500")
  },inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n\n<div class=\"chart-controls\">\n  <div class=\"chart-controls-panel\">\n    <ol>\n      <li>\n        <label>Line Data</label>\n        ");
  hashContexts = {'class': depth0,'contentBinding': depth0,'valueBinding': depth0};
  hashTypes = {'class': "STRING",'contentBinding': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'class': ("chart-data"),
    'contentBinding': ("availableLineDataSets"),
    'valueBinding': ("selectedLineData")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n      <li>\n        <label>Bar Data</label>\n        ");
  hashContexts = {'class': depth0,'contentBinding': depth0,'valueBinding': depth0};
  hashTypes = {'class': "STRING",'contentBinding': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'class': ("chart-data"),
    'contentBinding': ("availableBarDataSets"),
    'valueBinding': ("selectedBarData")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n      <li>\n        <label>Color</label>\n        ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("seedColorNames"),
    'valueBinding': ("selectedSeedColorName")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n      <li>\n        <label>Tick Interval</label>\n        ");
  hashContexts = {'class': depth0,'contentBinding': depth0,'valueBinding': depth0};
  hashTypes = {'class': "STRING",'contentBinding': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'class': ("chart-data"),
    'contentBinding': ("tickIntervals"),
    'valueBinding': ("selectedInterval")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n      <li>\n        <label>Bar Interval</label>\n        ");
  hashContexts = {'class': depth0,'contentBinding': depth0,'valueBinding': depth0};
  hashTypes = {'class': "STRING",'contentBinding': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'class': ("chart-data"),
    'contentBinding': ("dataIntervals"),
    'valueBinding': ("timeDelta")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n      <li>\n        <label>Bar Padding</label>\n        ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberView", {hash:{
    'min': ("0"),
    'max': ("1"),
    'step': ("0.05"),
    'valueBinding': ("barPadding")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "barPadding", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n      <li>\n        <label>Bar Group Padding</label>\n        ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberView", {hash:{
    'min': ("0"),
    'max': ("1"),
    'step': ("0.05"),
    'valueBinding': ("barGroupPadding")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "barGroupPadding", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n      <li>\n        <label>Stacked Bars</label>\n        ");
  hashContexts = {'checkedBinding': depth0};
  hashTypes = {'checkedBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Checkbox", {hash:{
    'checkedBinding': ("stackBars")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n      <li>\n        <label>Force Y-Axis From Zero</label>\n        ");
  hashContexts = {'checkedBinding': depth0};
  hashTypes = {'checkedBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Checkbox", {hash:{
    'checkedBinding': ("yAxisFromZero")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n    </ol>\n  </div>\n</div>\n\n<div class=\"chart-json\">\n  <pre>\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "prettyPrintedData", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  </pre>\n</div>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["vertical_bar_slide"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, hashContexts, hashTypes, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', hashContexts, hashTypes;
  data.buffer.push("\n    ");
  hashContexts = {'maxBarThicknessBinding': depth0,'selectedSeedColorBinding': depth0,'dataBinding': depth0,'maxLabelHeightBinding': depth0,'withinGroupPaddingBinding': depth0,'stackBarsBinding': depth0};
  hashTypes = {'maxBarThicknessBinding': "STRING",'selectedSeedColorBinding': "STRING",'dataBinding': "STRING",'maxLabelHeightBinding': "STRING",'withinGroupPaddingBinding': "STRING",'stackBarsBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Chart.VerticalBarView", {hash:{
    'maxBarThicknessBinding': ("maxBarThickness"),
    'selectedSeedColorBinding': ("selectedSeedColor"),
    'dataBinding': ("data"),
    'maxLabelHeightBinding': ("maxLabelHeight"),
    'withinGroupPaddingBinding': ("withinGroupPadding"),
    'stackBarsBinding': ("stackBars")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  ");
  return buffer;
  }

  data.buffer.push("<div class=\"chart-header\">\n  <h3>Vertical Bar Chart</h3>\n</div>\n\n<div class=\"chart-container\">\n  ");
  hashContexts = {'maxWidth': depth0,'maxHeight': depth0};
  hashTypes = {'maxWidth': "STRING",'maxHeight': "STRING"};
  stack1 = helpers.view.call(depth0, "Addepar.Components.Resizable", {hash:{
    'maxWidth': ("700"),
    'maxHeight': ("500")
  },inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n\n<div class=\"chart-controls\">\n  <div class=\"chart-controls-panel\">\n    <ol>\n      <li>\n        <label>Data</label>\n        ");
  hashContexts = {'class': depth0,'contentBinding': depth0,'valueBinding': depth0};
  hashTypes = {'class': "STRING",'contentBinding': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'class': ("chart-data"),
    'contentBinding': ("availableDataSets"),
    'valueBinding': ("selectedData")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n      <li>\n        <label>Color</label>\n        ");
  hashContexts = {'contentBinding': depth0,'valueBinding': depth0};
  hashTypes = {'contentBinding': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'contentBinding': ("seedColorNames"),
    'valueBinding': ("selectedSeedColorName")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n      <li>\n        <label>Rotated Label Height</label>\n        ");
  hashContexts = {'min': depth0,'max': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberView", {hash:{
    'min': ("20"),
    'max': ("100"),
    'valueBinding': ("maxLabelHeight")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        <p>");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "maxLabelHeight", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("</p>\n      </li>\n      <li>\n        <label>Between Group Padding</label>\n        ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberView", {hash:{
    'min': ("0"),
    'max': ("2"),
    'step': ("0.05"),
    'valueBinding': ("betweenGroupPadding")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "betweenGroupPadding", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n      <li>\n        <label>Within Group Padding</label>\n        ");
  hashContexts = {'min': depth0,'max': depth0,'step': depth0,'valueBinding': depth0};
  hashTypes = {'min': "STRING",'max': "STRING",'step': "STRING",'valueBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ScrubberView", {hash:{
    'min': ("0"),
    'max': ("2"),
    'step': ("0.05"),
    'valueBinding': ("withinGroupPadding")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n        ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "withinGroupPadding", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n      <li>\n        <label>Stacked Bars</label>\n        ");
  hashContexts = {'checkedBinding': depth0};
  hashTypes = {'checkedBinding': "STRING"};
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Checkbox", {hash:{
    'checkedBinding': ("stackBars")
  },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n      </li>\n    </ol>\n  </div>\n</div>\n\n<div class=\"chart-json\">\n  <pre>\n    ");
  hashTypes = {};
  hashContexts = {};
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "prettyPrintedData", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
  data.buffer.push("\n  </pre>\n</div>\n\n");
  return buffer;
  
});