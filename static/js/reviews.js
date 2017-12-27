// Generated by CoffeeScript 1.10.0
(function() {
  window.toggle_choose_cols = function() {
    return $("#choose-cols").toggle();
  };

  window.toggle_choose_cols_all = function() {
    if ($("#choose-cols input[type='checkbox'][name='all']").prop("checked")) {
      return $("#choose-cols input[type='checkbox']").prop("checked", true);
    } else {
      return $("#choose-cols input[type='checkbox']").prop("checked", false);
    }
  };

  window.submit_choose_cols = function() {
    var boxes, i, j, ref, result;
    boxes = $("#choose-cols input[type='checkbox']");
    result = [];
    for (i = j = 0, ref = boxes.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      if ($(boxes[i]).prop("checked")) {
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
    $("#choose-cols input[type=checkbox]").prop("checked", false);
    cols = $.cookie("pcr_choosecols").split(",");
    for (i = j = 0, ref = cols.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      $("#choose-cols input[name='" + cols[i] + "']").prop("checked", true);
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

  $(document).ready(function() {
    $('.sec_row_hidden').hide();
    if ($.cookie("pcr_viewmode") == null) {
      $.cookie("pcr_viewmode", "0", {
        path: '/'
      });
    }
    set_viewmode($.cookie("pcr_viewmode"));

    const table = $("#course-table").DataTable({
        columnDefs: [
            {
                targets: [-1],
                visible: false
            }
        ],
        autoWidth: false,
        language: {
            searchPlaceholder: "Search Table",
            search: ""
        }
    });
    table.columns().visible(false);
    table.columns([0, 1, 2, 3, 4]).visible(true);
  });

}).call(this);
