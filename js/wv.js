

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
        //console.log('back to canvas');
    }

    function _on2d(){
        console.log('back to canvas');
        Cocoon.App.forward("run2D();");
        Cocoon.WebView.hide();
        Cocoon.Touch.enable();
        //Cocoon.App.forward("run2D();");

    }
    function _onTexture(){
        console.log('back to canvas');
        Cocoon.App.forward("runCubeTexture();");
        Cocoon.WebView.hide();
        Cocoon.Touch.enable();

    }
    var wv = {
        init_load: _initLoad,
        onCube: _onCube,
        on2D: _on2d,
        onTexture: _onTexture,
        onWorks:function(){
            console.log('back to canvas');
            Cocoon.App.forward("runWebGLWorks();");
            Cocoon.WebView.hide();
            Cocoon.Touch.enable();
        },
        onWorkF:function(){
            console.log('back to canvas');
            Cocoon.App.forward("runWebGLWorkF();");
            Cocoon.WebView.hide();
            Cocoon.Touch.enable();
        },
        onPointWebGL:function(){
            console.log('back to canvas');
            Cocoon.App.forward("runPointWebGL();");
            Cocoon.WebView.hide();
            Cocoon.Touch.enable();
        }
        
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
        2500);
});
//wv.init_load();


