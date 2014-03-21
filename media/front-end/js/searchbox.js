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
        if (endsWith(search_term, " ")) {
          return false;
        } else {
          return RegExp("\\s" + search_term + "[a-z]*$", 'i').test(instructor.keywords);
        }
      }), (function(search_term, instructor) {
        return RegExp("^" + search_term, 'i').test(instructor.keywords);
      }), (function(search_term, instructor) {
        return RegExp("\\s" + search_term, 'i').test(instructor.keywords);
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

  find_autocomplete_matches = function(search_str, category, cb) {
    return $.ajax('chrome/api/search/', {
      data: {
        result_type: category,
        count: 5,
        q: search_str
      },
      success: function(data) {
        var course, dept, instructor, results, rv, uniqueCourses, val, _, _i, _j, _k, _len, _len1, _len2, _name, _ref, _ref1, _ref2;
        results = JSON.parse(data).result;
        rv = [];
        if (results.courses) {
          uniqueCourses = {};
          _ref = results.courses;
          for (_ = _i = 0, _len = _ref.length; _i < _len; _ = ++_i) {
            course = _ref[_];
            course.category = "course";
            if (uniqueCourses[_name = course.value] == null) {
              uniqueCourses[_name] = course;
            }
          }
          for (_ in uniqueCourses) {
            val = uniqueCourses[_];
            rv.push(val);
          }
        }
        if (results.instructors) {
          _ref1 = results.instructors;
          for (_ = _j = 0, _len1 = _ref1.length; _j < _len1; _ = ++_j) {
            instructor = _ref1[_];
            instructor.category = "instructor";
            if (instructor.name == null) {
              instructor.name = "";
            }
          }
          rv = rv.concat(results.instructors);
        }
        if (results.departments) {
          _ref2 = results.departments;
          for (_ = _k = 0, _len2 = _ref2.length; _k < _len2; _ = ++_k) {
            dept = _ref2[_];
            dept.title = dept.value;
            dept.category = "department";
            if (dept.name == null) {
              dept.name = "";
            }
          }
          rv = rv.concat(results.departments);
        }
        return cb(rv);
      },
      error: function(error) {
        return cb([]);
      }
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
    return $("#searchbox").autocomplete({
      delay: 0,
      minLength: 2,
      autoFocus: true,
      source: function(request, response) {
        return find_autocomplete_matches(request.term, 'mixed', function(matches) {
          return response(matches);
        });
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
        window.location = dir + '/' + ui.item.category + '/' + (ui.item.category !== 'instructor' ? ui.item.value : parseInt(ui.item.path.split('/')[2]));
        return false;
      },
      open: function(event, ui) {
        return $(".ui-autocomplete.ui-menu.ui-widget").width($("#searchbar").width());
      }
    }).data("autocomplete")._renderItem = function(ul, item) {
      return $("<li></li>").data("item.autocomplete", item).append("<a>\n  <span class='ui-menu-item-title'>" + item.value + "</span><br />\n  <span class='ui-menu-item-desc'>" + item.name + "</span>\n</a>").appendTo(ul);
    };
  };

}).call(this);
