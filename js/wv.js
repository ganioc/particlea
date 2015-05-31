
console.log("run wv.js");

(function(){
    function _initLoad(){
        console.log("wv init()");
        window.addEventListener(
            "load",
            function()
            {
                Cocoon.App.forward("console.log('hello from the other side:webview+');");
                // Disable the input in CocoonJS (we do not want to have both input in CocoonJS and the WebView)
                Cocoon.Touch.disable();
                Cocoon.App.forward("w.stopGameLoop();");
            });
    }

    function _onCube(){
        Cocoon.WebView.hide();
        Cocoon.Touch.enable();
        console.log('back to canvas');
    }

    function _on2d(){
        Cocoon.WebView.hide();
        Cocoon.Touch.enable();
        Cocoon.App.forward("run2D();");
        console.log('back to canvas');

    }

    var wv = {
        init_load: _initLoad,
        onCube: _onCube,
        on2D: _on2d
        
    };
    window.wv = wv;

})();
$(document).ready(function(){
    console.log("wv ready");
    wv.init_load();

});
//wv.init_load();


