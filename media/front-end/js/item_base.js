// Generated by CoffeeScript 1.10.0
(function() {
  window.course_rows;

  window.toggled_rows;

  window.toggle_course_row_all = function() {
    if ($("th div.fold-icon").hasClass("open")) {
      $("th div.fold-icon").removeClass("open");
      $("td div.fold-icon").removeClass("open");
      $(".row_hidden").hide();
      return window.toggled_rows = 0;
    } else {
      $("th div.fold-icon").addClass("open");
      $("td div.fold-icon").addClass("open");
      $(".row_hidden").show();
      return window.toggled_rows = window.course_rows;
    }
  };

  window.toggle_course_row = function(index) {
    $("#row_hidden_" + index).toggle();
    if ($("#row_display_" + index + " td div.fold-icon").hasClass("open")) {
      $("#row_display_" + index + " td div.fold-icon").removeClass("open");
      window.toggled_rows--;
    } else {
      $("#row_display_" + index + " td div.fold-icon").addClass("open");
      window.toggled_rows++;
    }
    if (window.toggled_rows === window.course_rows) {
      return $("th div.fold-icon").addClass("open");
    } else {
      return $("th div.fold-icon").removeClass("open");
    }
  };

  window.toggle_choose_cols = function() {
    return $("#choose-cols").toggle();
  };

  window.toggle_choose_cols_all = function() {
    if ($("#choose-cols input[type='checkbox'][name='all']").attr("checked")) {
      return $("#choose-cols input[type='checkbox']").attr("checked", true);
    } else {
      return $("#choose-cols input[type='checkbox']").attr("checked", false);
    }
  };

  window.submit_choose_cols = function() {
    var boxes, i, j, ref, result;
    boxes = $("#choose-cols input[type='checkbox']");
    result = [];
    for (i = j = 0, ref = boxes.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      if ($(boxes[i]).attr("checked") != null) {
        result.push($(boxes[i]).attr("value"));
      }
    }
    $.cookie("pcr_choosecols", result.join(), {
      path: '/'
    });
    toggle_choose_cols();
    return set_cols(result);
  };

  window.cancel_choose_cols = function() {
    var cols, i, j, ref;
    $("#choose-cols input[type=checkbox]").attr("checked", false);
    cols = $.cookie("pcr_choosecols").split(",");
    for (i = j = 0, ref = cols.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      $("#choose-cols input[name='" + cols[i] + "']").attr("checked", true);
    }
    return toggle_choose_cols();
  };

  window.set_viewmode = function(view_id) {
    if (("" + view_id) === "0") {
      $("#view_average").addClass("selected");
      $("#view_recent").removeClass("selected");
      $(".cell_average").show();
      $(".cell_recent").hide();
      $(".section-table tbody").find("tr:not(:first)").show();
    } else {
      $("#view_average").removeClass("selected");
      $("#view_recent").addClass("selected");
      $(".cell_average").hide();
      $(".cell_recent").show();
      $(".section-table tbody").find("tr:not(:first)").hide();
    }
    $.cookie("pcr_viewmode", view_id, {
      path: '/'
    });
    return $('#course-table').trigger('update');
  };

  window.viewmode = function() {
    return $.cookie('pcr_viewmode');
  };

  window.set_cols = function(cols) {
    var i, j, ref, results;
    $("#course-table th").hide();
    $("#course-table td").hide();
    $("#course-table .col_icon").show();
    $("#course-table .col_code").show();
    $("#course-table .col_name").show();
    $("#course-table .col_instructor").show();
    $("#course-table .col_semester").show();
    $("#course-table .col_section").show();
    $("#course-table .col_responses").show();
    $("#course-table .td_hidden").show();
    $("#course-table .sec_td_hidden").show();
    results = [];
    for (i = j = 0, ref = cols.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      results.push($("#course-table .col_" + cols[i]).show());
    }
    return results;
  };

  window.start_sort_rows = function() {
    return $("#course-table .row_hidden").appendTo($("div#hidden"));
  };

  window.end_sort_rows = function() {
    return $("#course-table .row_display").each(function() {
      var index;
      index = $(this).attr("id").substr(12);
      return $(this).after($("#row_hidden_" + index));
    });
  };

  window.setup_tutorial_overlay = function() {
    $("#tut-viewmode").css("top", $("#settings-viewmode").offset().top - 230);
    $("#tut-choosecols").css("top", $("#settings-other").offset().top + 5);
    $("#tut-ratings").css("top", $("#banner-bg").offset().top + 15);
    $("#tut-sort").css("top", $("#course-table").offset().top - 30);
    return $("#tut-row").css("top", $("#course-table").offset().top + 50);
  };


  /*
  DOCUMENT READY
   */

  $(document).ready(function() {
    var callback, cols, i, j, ref;
    $('.sec_row_hidden').hide();
    window.toggle_course_row_all();
    window.toggle_course_row_all();
    window.toggled_rows = 0;
    window.course_rows = $("#course-table .row_display").size();
    callback = function() {
      $("#searchbox").autocomplete("enable");
      $("#loading-container").hide();
      return $("#searchbox").autocomplete("search");
    };
    $("#searchbox").keypress(function() {
      return setTimeout(function() {
        if ($("#searchbox").val().length === 2) {
          $("#loading-container").show();
          return init_search_box("../", callback, $("#searchbox").val(), false);
        } else if ($("#searchbox").val().length < 2) {
          return $("#searchbox").autocomplete("disable");
        }
      }, 0);
    });
    $('#searchbox').on('paste', function(e) {
      return setTimeout(function() {
        $('#loading-container').show();
        return init_search_box('../', callback, $('#searchbox').val(), false);
      }, 0);
    });
    if ($.cookie("pcr_viewmode") == null) {
      $.cookie("pcr_viewmode", "0", {
        path: '/'
      });
    }
    set_viewmode($.cookie("pcr_viewmode"));
    $("#course-table").tablesorter({
      sortList: [[1, 0]],
      headers: {
        0: {
          sorter: false
        }
      },
      textExtraction: function(node) {
        var element;
        element = (function() {
          switch (node.children.length) {
            case 0:
              return node;
            case 1:
              return node.children[0];
            default:
              return node.children[viewmode()];
          }
        })();
        return element.innerHTML;
      }
    }).bind("sortStart", function() {
      return start_sort_rows();
    }).bind("sortEnd", function() {
      return end_sort_rows();
    });
    if ($.cookie("pcr_choosecols") == null) {
      $.cookie("pcr_choosecols", "name,rCourseQuality,rInstructorQuality,rDifficulty", {
        path: '/'
      });
    }
    cols = $.cookie("pcr_choosecols").split(",");
    set_cols(cols);
    for (i = j = 0, ref = cols.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      $("#choose-cols input[name='" + cols[i] + "']").attr("checked", true);
    }
    if ($("#course-table").attr("count") === "1") {
      toggle_course_row_all();
    }
    return window.setup_tutorial_overlay();
  });

}).call(this);
