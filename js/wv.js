

function strPrintTime(){
    var d= new Date();
    return d.getMinutes()+ ':' + d.getSeconds() + ':' + d.getMilliseconds();
}

Cocoon.App.forward('console.log("run wv.js" + strPrintTime());');

(function(){
    function _initLoad(){
        Cocoon.App.forward('console.log("wv init()");');
        window.addEventListener(
            "load",
            function()
            {
                Cocoon.App.forward("console.log('hello from the other side:webview+');");
                // Disable the input in CocoonJS (we do not want to have both input in CocoonJS and the WebView)
                Cocoon.Touch.disable();
                
            });
    }

    //_initLoad();

    function _onCube(){
        Cocoon.App.forward('run3DCube();');
        Cocoon.WebView.hide();
        Cocoon.Touch.enable();
        console.log('back to canvas');
    }

    function _on2d(){
        Cocoon.App.forward("run2D();");
        Cocoon.WebView.hide();
        Cocoon.Touch.enable();
        //Cocoon.App.forward("run2D();");
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
    Cocoon.App.forward('console.log("wv ready" + strPrintTime());');
    wv.init_load();
    window.setTimeout(
        function(){
            Cocoon.App.forward("console.log('stop game loop()' + strPrintTime());");
            Cocoon.App.forward("w.stopGameLoop();");
        },
        4000);
    
    //window.setTimeout(Cocoon.App.forward("w.stopGameLoop();",);

    
    // window.setTimeout(function(){
    //     $('#page1_caption').slideUp();

    // }, 4000);

});
//wv.init_load();


