// Generated by CoffeeScript 1.6.3
/*
  Logic for the auto-complete search-box, on the home-page and top-right of
  every page.  Uses the jQuery UI autocomplete plugin.
*/


(function() {
  var MAX_ITEMS, REGEXES_BY_PRIORITY, endsWith, find_autocomplete_matches, get_entries;

  MAX_ITEMS = {
    Courses: 6,
    Instructors: 3,
    Departments: 3
  };

  endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length !== -1);
  };

  REGEXES_BY_PRIORITY = {
    Courses: [
      (function(search_term, course) {
        return RegExp("^" + search_term, 'i').test(course.title);
      }), (function(search_term, course) {
        return RegExp("\\s" + search_term, 'i').test(course.keywords);
      }), (function(search_term, course) {
        return RegExp(search_term, 'i').test(course.keywords);
      })
    ],
    Instructors: [
      (function(search_term, instructor) {
        var found, term, terms, _i, _len;
        if (endsWith(search_term, " ")) {
          return false;
        } else {
          terms = search_term.split(' ');
          found = false;
          for (_i = 0, _len = terms.length; _i < _len; _i++) {
            term = terms[_i];
            found = found || RegExp("\\s" + term + "[a-z]*$", 'i').test(instructor.keywords);
          }
          return found;
        }
      }), (function(search_term, instructor) {
        var found, term, terms, _i, _len;
        terms = search_term.split(' ');
        found = false;
        for (_i = 0, _len = terms.length; _i < _len; _i++) {
          term = terms[_i];
          found = found || RegExp("^" + term, 'i').test(instructor.keywords);
        }
        return found;
      }), (function(search_term, instructor) {
        var found, term, terms, _i, _len;
        terms = search_term.split(' ');
        found = false;
        for (_i = 0, _len = terms.length; _i < _len; _i++) {
          term = terms[_i];
          found = found || RegExp("\\s" + term, 'i').test(instructor.keywords);
        }
        return found;
      })
    ],
    Departments: [
      (function(search_term, department) {
        return RegExp("^" + search_term, 'i').test(department.title);
      }), (function(search_term, department) {
        return RegExp("^" + search_term, 'i').test(department.keywords);
      })
    ]
  };

  find_autocomplete_matches = function(search_str, category, sorted_entries) {
    var entry, match_test, results, tests_passed, _i, _j, _len, _len1, _ref;
    results = [];
    for (_i = 0, _len = sorted_entries.length; _i < _len; _i++) {
      entry = sorted_entries[_i];
      tests_passed = 0;
      _ref = REGEXES_BY_PRIORITY[category];
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        match_test = _ref[_j];
        if (match_test(search_str, entry)) {
          tests_passed += 1;
        }
      }
      if (tests_passed > 1 || (tests_passed === 1 && results.length < MAX_ITEMS[category])) {
        results.push({
          passed: tests_passed,
          entry: entry
        });
      }
    }
    results = results.sort(function(a, b) {
      return b.passed - a.passed;
    });
    return $.map(results.slice(0, MAX_ITEMS[category]), function(result) {
      return result.entry;
    });
  };

  get_entries = function(term, courses, instructors, departments) {
    return find_autocomplete_matches(term, 'Courses', courses).concat(find_autocomplete_matches(term, 'Instructors', instructors)).concat(find_autocomplete_matches(term, 'Departments', departments));
  };

  $.widget("custom.autocomplete", $.ui.autocomplete, {
    _renderMenu: function(ul, items) {
      var current_category,
        _this = this;
      current_category = "";
      return $.each(items, function(index, item) {
        var li;
        if (item.category !== current_category) {
          li = "<li class='ui-autocomplete-category'><p>" + item.category + "</p></li>";
          ul.append(li);
          current_category = item.category;
        }
        return _this._renderItem(ul, item);
      });
    }
  });

  window.init_search_box = function(dir, callback, start) {
    var sort_by_title;
    if (dir == null) {
      dir = "";
    }
    if (callback == null) {
      callback = null;
    }
    sort_by_title = function(first, second) {
      if (first.title > second.title) {
        return 1;
      } else {
        return -1;
      }
    };
    return $.getJSON(dir + dir + "autocomplete_data.json/" + start.toLowerCase(), function(data) {
      var courses, departments, instructors;
      instructors = data.instructors.sort(sort_by_title);
      courses = data.courses.sort(sort_by_title);
      departments = data.departments.sort(sort_by_title);
      console.log("have data");
      $("#searchbox").autocomplete({
        appendTo: ".results",
        delay: 0,
        minLength: 2,
        autoFocus: true,
        source: function(request, response) {
          return response(get_entries(request.term, courses, instructors, departments));
        },
        position: {
          my: "left top",
          at: "left bottom",
          collision: "none",
          of: "#searchbar",
          offset: "0 -1"
        },
        focus: function(event, ui) {
          return false;
        },
        select: function(event, ui) {
          window.location = dir + ui.item.url;
          return false;
        },
        open: function(event, ui) {
          return $(".ui-autocomplete.ui-menu.ui-widget").width($("#searchbar").width());
        }
      }).data("autocomplete")._renderItem = function(ul, item) {
        return $("<li></li>").data("item.autocomplete", item).append("<a>\n  <div class='ui-menu-item-category'>" + item.category + "</div>\n  <div class='ui-menu-item-title'>" + item.title + "</div>\n  <div class='ui-menu-item-desc'>" + item.desc + "</div>\n</a>").appendTo(ul).fadeIn(500);
      };
      if (callback != null) {
        return callback();
      }
    });
  };

}).call(this);
