// Generated by CoffeeScript 1.10.0

/*
DOCUMENT READY
 */

(function() {
  $(document).ready(function() {
    var callback;
    callback = function() {
      $("#searchbox").autocomplete("enable");
      $("#loading-container").hide();
      return $("#searchbox").autocomplete("search");
    };
    $('#searchbox').live('paste', function(e) {
      return setTimeout(function() {
        $('#loading-container').show();
        return init_search_box('', callback, $(this).val(), true);
      }, 10);
    });
    return $("#searchbox").keypress(function() {
      return setTimeout(function() {
        if ($("#searchbox").val().length === 2) {
          $("#loading-container").show();
          return init_search_box("", callback, $("#searchbox").val(), true);
        } else if ($("#searchbox").val().length < 2) {
          return $("#searchbox").autocomplete("disable");
        }
      }, 10);
    });
  });

}).call(this);
