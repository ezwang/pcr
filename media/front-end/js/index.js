// Generated by CoffeeScript 1.6.3
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
    return $("#searchbox").keypress(function() {
      return setTimeout(function() {
        return init_search_box("", callback, $("#searchbox").val());
      }, 0);
    });
  });

}).call(this);
