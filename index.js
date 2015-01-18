(function(){

  'use strict';

  function ConditionViewModel() {
    this.notItems = ko.observableArray([
        { label: 'となるとき', value: false },
        { label: 'とならないとき', value: true }
    ]);
    this.not = ko.observable(false);

    this.argument1Items = ko.observableArray([
        { label: 'IE', value: 'IE' },
        { label: 'WindowsEdition', value: 'WindowsEdition' },
        { label: 'true', value: true },
        { label: 'false', value: false }
    ]);
    this.argument1 = ko.observable('IE');

    this.argument2 = ko.observable('9.0');

    this.logicalItems = ko.observableArray([
        { label: 'かつ', value: '&' },
        { label: 'もしくは', value: '|' }
    ]);
    this.logicalOperator = ko.observable('');

    this.comparisonItems = ko.observableArray([
        { label: 'と同じ', value: '' },
        { label: 'より大きい', value: 'gt' },
        { label: 'より小さい', value: 'lt' },
        { label: '以上', value: 'gte' },
        { label: '以下', value: 'lte' }
    ]);
    this.comparisonOperator = ko.observable('lt');
  }

  function ConditionalCommentViewModel() {
    this.DOWNLEVEL_HIDDEN = 1;
    this.DOWNLEVEL_REVEAL = 2;

    this.conditions = ko.observableArray([
      new ConditionViewModel
    ]);

    this.addCondition = (function(target, event) {
      var index = ko.utils.arrayIndexOf(this.conditions(), target);

      this.conditions.splice(index + 1, 0, new ConditionViewModel);
    }).bind(this);
    this.removeCondition = (function(target, event) {
      this.conditions.remove(target);
    }).bind(this);

    this.downlevelItems = ko.observableArray([
        { label: '表示する', value: this.DOWNLEVEL_HIDDEN },
        { label: '表示しない', value: this.DOWNLEVEL_REVEAL }
    ]);
    this.downlevel = ko.observable(this.DOWNLEVEL_HIDDEN);

    this.result = ko.pureComputed(function() {
      var html, conditions;

      switch (this.downlevel()) {
        case this.DOWNLEVEL_HIDDEN:
          html = '<!--[if %s]>\n\n<![endif]-->';
          break;
        case this.DOWNLEVEL_REVEAL:
          html = '<!--[if %s]><!-->\n\n<!--<![endif]-->';
          break;
      }

      conditions = ko.utils.arrayMap(this.conditions(), function(condition, index) {
        return generateCondition(condition);
      });

      return html.replace('%s', concatConditions(conditions));
    }, this);

    /**
     * convert condition
     *
     * @param {Object[]} condition condition
     * @return {Object} converted condition
     */
    function generateCondition(condition) {
      var not = ko.unwrap(condition.not),
          comp = ko.unwrap(condition.comparisonOperator),
          arg1 = ko.unwrap(condition.argument1),
          arg2 = ko.unwrap(condition.argument2),
          logical = ko.unwrap(condition.logicalOperator),
          data, result;

      if (typeof arg1 === 'string') {
        // string value
        data = [];
        (comp !== '') && data.push(comp);
        (arg1 !== '') && data.push(arg1);
        (arg2 !== '') && data.push(arg2);
        result = data.join(' ');
      } else {
        // true or false
        result = arg1;
      }

      return {
        not: not,
        logical: logical,
        result: result
      };
    }

    /**
     * return concatenated conditions
     *
     * @param {Object[]} conditions converted conditions
     * @return {String} condition string
     */
    function concatConditions(conditions) {
      var result = '',
          multiple = (conditions.length > 1),
      lastIndex = conditions.length - 1;

      ko.utils.arrayForEach(conditions, function(condition, index) {
        var cond = condition.result;

        if (multiple) {
          cond = '(' + cond + ')';
        }

        if (condition.not) {
          cond = (multiple) ? '!' + cond : '!(' + cond + ')';
        }

        result += cond + (
          (multiple && index !== lastIndex) ? condition.logical : ''
        );
      });

      return result;
    }
  }

  ko.applyBindings(new ConditionalCommentViewModel);

}());
