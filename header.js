
var Loader = {
  load : function(file){
    var client = new XMLHttpRequest();
    client.open("GET", file, false);
    client.send(null);
    return client.responseText;
  },

  include : function(file){
    Loader.include_browser(file);
    //Loader.include_cl(file);
  },

  include_cl : function(file){
    window.eval(Loader.load(file));
  },

  include_browser : function(filename) {
    var head = document.getElementsByTagName('head')[0];

    var script = document.createElement('script');
    script.src = filename;
    script.type = 'text/javascript';

    head.appendChild(script);
  }
};

var Log = {
  log : function(s){
    console.log(s);
  }
};

Log.log("logging on");
Loader.include("util.js");
Loader.include("types.js")
Loader.include("parser.js");
Loader.include("compiler.js");
Loader.include("vm.js");
Loader.include("init.js");
