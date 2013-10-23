Ember.Charts.Helpers = Ember.Namespace.create
  # Helper groupBy function, similar to Underscore groupBy but only accepting
  # a getter as the second argument
  groupBy: (obj, getter) ->
    result = {}
    for index in [0...obj.length]
      value = obj[index]
      key = getter(value, index)
      group = result[key] || (result[key] = [])
      group.push(value)
    result

  # LabelTrimmer provides a trim() method to be invoked on a D3 selection, which
  # will truncate the labels to a length defined by getLabelSize(), filling them
  # with text provided by getLabelText()
  LabelTrimmer: Ember.Object.extend
    getLabelSize: (d, selection) -> 100
    getLabelText: (d, selection) -> d.label

    # Goes back over a d3 selection of text labels, truncating any that are too
    # long. This uses the SVG API for text labels, and assumes each character is
    # the same width, removing a proportional number of characters to the length
    # of the label
    trim: Ember.computed ->
      getLabelSize = @get 'getLabelSize'
      getLabelText = @get 'getLabelText'
      (selection) ->
        selection.text (d) ->
          bbW = @getBBox().width
          label = getLabelText(d, selection)
          return '' unless label
          charWidth = bbW / label.length
          textLabelWidth = getLabelSize(d, selection) - 4 * charWidth
          numChars = Math.floor textLabelWidth / charWidth
          if numChars - 3 <= 0
              '...'
            else if bbW > textLabelWidth
              label[0...(numChars - 3)] + '...'
            else
              label
    .property 'getLabelSize', 'getLabelText'
