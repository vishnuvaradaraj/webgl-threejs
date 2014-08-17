var PARABAY = PARABAY || {};

PARABAY.StoryModel = function() {

    this.storyList = {};
    this.init();
    
};

PARABAY.StoryModel.prototype.init = function() {
    
    this.storyList['sample'] = 
    {
       "story":{
          "name":"sample",
          "objects":[
             {
                "name":"bg",
                "type":"image",
                "url":"test.jpg",
                "height":10,
                "width":20,
                "physics":true,
                "xgrid":3,
                "ygrid":1,
                "handler":"plane"
             },
             {
                "name":"song",
                "type":"music",
                "url":"http://test.mp3"
             }
          ],
          "animations":[
             {
                "name":"first",
                "handler":"tween",
                "frames":[
                   {
                      "at":0,
                      "translate":[
                         1,
                         2,
                         3
                      ],
                      "rotate":[
                         1,
                         2,
                         3
                      ],
                      "scale":[
                         1,
                         2,
                         3
                      ],
                      "tween":"ease-in-out",
                      "opacity":0
                   },
                   {
                      "at":100,
                      "translate":[
                         1,
                         2,
                         3
                      ],
                      "rotate":[
                         1,
                         2,
                         3
                      ],
                      "scale":[
                         1,
                         2,
                         3
                      ],
                      "tween":"ease-out",
                      "opacity":1
                   }
                ]
             },
             {
                "name":"physics",
                "handler":"physics"
             }
          ],
          "frames":[
             {
                "id":0,
                "delay":10,
                "animation":"play",
                "objref":"song",
                "xgridref":2,
                "ygridref":2,
                "loop":-1
             },
             {
                "id":1,
                "start":0,
                "duration":5,
                "loop":3,
                "animation":"first",
                "objref":"bg"
             },
             {
                "id":2,
                "start":0,
                "animation":"physics",
                "objref":"bg"
             }
          ],
          "sequences":[
             {
                "id":0,
                "target":"image",
                "frames":[
                   0,
                   [
                      [
                         1,
                         2
                      ],
                      3
                   ]
                ],
                "handler":"sequencer"
             }
          ],
          "play":{
             "sequence":"random",
             "loop":"infinite",
             "musicref":"random"
          }
       }
    };
    
        
};

PARABAY.StoryModel.prototype.getItem = function(name) {
    return this.storyList[name];
};
