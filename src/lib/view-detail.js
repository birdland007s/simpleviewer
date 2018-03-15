
import React, { PropTypes } from 'react';
import Script from 'react-load-script'

function loadScript(url, callback){

    var script = document.createElement("script")
    script.type = "text/javascript";
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);

    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            console.log('IE before callback');
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            console.log('Others before callback');
            callback();
        };
    }

}


class ViewDetail extends React.Component{
 
    componentWillMount () {
    }

    componentDidMount(){
        let script = document.createElement("link");
        script.src = "https://developer.api.autodesk.com/modelderivative/v2/viewers/style.min.css?v=v3.3";
        script.async = true;
        document.body.appendChild(script);


        loadScript( "https://developer.api.autodesk.com/modelderivative/v2/viewers/three.min.js", function(){
            console.log('callback empty');

        });

        // loadScript("https://developer.api.autodesk.com/modelderivative/v2/viewers/viewer3D.min.js?v=v3.3", function(){

        //     console.log('before addEventListener');

        //     document.addEventListener('DOMContentLoaded', function(event) {
        //         console.log('DOMContentLoaded in componentDidMount');
        //         import('./forge/viewer3D')
        //         .then(module => {
        //             console.log('before initialize');
        //             // 動的に読み込まれたSubクラス
        //             const sub = new module.Sub();
        //             sub.initialize();  
        //         });
        //         console.log('exit from import');
        //     });
        //     console.log('componentDidMount');
        // });
        // console.log('exit from loadScrip');

    }

    render(){
        console.log('start render method');
        return(
            <div className='view-detail'>
                <h1>detail</h1>
                <div id="viewer3D" class="viewer-box">
                    <Script 
                        url='https://developer.api.autodesk.com/modelderivative/v2/viewers/viewer3D.min.js?v=v3.3'
                        onLoad={this.handleScriptLoad.bind(this)} />
                </div>
                {/* <div class="draggable">
                    <div class="draggable-nav"></div>
                    <div class="draggable-body">
                        <div id="viewer2D"></div>
                    </div>
                </div> */}
            </div>
        );
    }

    handleScriptLoad() {
        // console.log('start handleScriptLoad');
        // import('./forge/viewer3D')
        //         .then(module => {
        //             console.log('before initialize');
        //             // 動的に読み込まれたSubクラス
        //             const sub = new module.Sub();
        //             sub.initialize();  
        //         }); 
    }

}

export default ViewDetail;