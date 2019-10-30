var CupFactory = require('CupFactory');
cc.Class({
    extends: cc.Component,
    properties: {
        is_debug: false,
    },
    // use this for initialization
    onLoad: function() {
        this.anim_com = this.node.getComponent(cc.Animation);
        var clips = this.anim_com.getClips();
        for(var i = 0;i < clips.length;i++){
            var clip = clips[i];
            if (this.is_debug) {
                var newNode = new cc.Node();
                this.new_draw_node = this.node.getComponent(cc.Graphics);
                if (!this.new_draw_node) {
                    this.new_draw_node = this.node.addComponent(cc.Graphics);
                }
                this.node.addChild(newNode);
            }
            var paths = clip.curveData.paths;
            this.road_data_set = [];
            for (var k in paths) {
                var road_data = paths[k].props.position;
                this.gen_path_data(road_data);
            }
            break;
        }
        CupFactory._roadSet = this.road_data_set;
        console.log(this.road_data_set);
    },

    start: function() {
    },

    get_road_set: function() {
        return this.road_data_set;
    },

    gen_path_data: function(road_data) {
        var ctrl1 = null;
        var start_point = null;
        var end_point = null;
        var ctrl2 = null;
        var road_curve_path = []; // [start_point, ctrl1, ctrl2, end_point],
        for (var i = 0; i < road_data.length; i++) {
            var key_frame = road_data[i];
            if (ctrl1 !== null) {
                road_curve_path.push([start_point, ctrl1, ctrl1, cc.v2(key_frame.value[0], key_frame.value[1])]);
            }
            if(key_frame.motionPath == null){
                continue;
            }
            start_point = cc.v2(key_frame.value[0], key_frame.value[1]);
            for (var j = 0; j < key_frame.motionPath.length; j++) {
                var end_point = cc.v2(key_frame.motionPath[j][0], key_frame.motionPath[j][1]);
                ctrl2 = cc.v2(key_frame.motionPath[j][2], key_frame.motionPath[j][3]);
                if (ctrl1 === null) {
                    ctrl1 = ctrl2;
                }
                // 贝塞尔曲线 start_point, ctrl1, ctrl2, end_point,
                road_curve_path.push([start_point, ctrl1, ctrl2, end_point]);
                ctrl1 = cc.v2(key_frame.motionPath[j][4], key_frame.motionPath[j][5]);
                start_point = end_point;
            }
        }
        //console.log(road_curve_path);
        var one_road = [road_curve_path[0][0]];
        for (var index = 0; index < road_curve_path.length; index++) {
            start_point = road_curve_path[index][0];
            ctrl1 = road_curve_path[index][1];
            ctrl2 = road_curve_path[index][2];
            end_point = road_curve_path[index][3];
            var len = this.bezier_length(start_point, ctrl1, ctrl2, end_point);
            var OFFSET = 16;
            var count = len / OFFSET;
            count = Math.floor(count);
            var t_delta = 1 / count;
            var t = t_delta;
            for (var i = 0; i < count; i++) {
                var x = start_point.x * (1 - t) * (1 - t) * (1 - t) + 3 * ctrl1.x * t * (1 - t) * (1 - t) + 3 * ctrl2.x * t * t * (1 - t) + end_point.x * t * t * t;
                var y = start_point.y * (1 - t) * (1 - t) * (1 - t) + 3 * ctrl1.y * t * (1 - t) * (1 - t) + 3 * ctrl2.y * t * t * (1 - t) + end_point.y * t * t * t;
                one_road.push(cc.v2(x, y));
                t += t_delta;
            }
        }
        //console.log(one_road);
        if (this.is_debug) {
            this.new_draw_node.clear(); // 清除以前的
            for (var i = 0; i < one_road.length; i++) {
                this.new_draw_node.moveTo(one_road[i].x + 320, one_road[i].y + 568);
                this.new_draw_node.lineTo(one_road[i].x + 321, one_road[i].y + 569);
                this.new_draw_node.stroke();
            }
        }
        this.road_data_set.push(one_road);
    },
    bezier_length: function(start_point, ctrl1, ctrl2, end_point) {
        // t [0, 1] t 分成20等分 1 / 20 = 0.05
        var prev_point = start_point;
        var length = 0;
        var t = 0.05;
        for (var i = 0; i < 20; i++) {
            var x = start_point.x * (1 - t) * (1 - t) * (1 - t) + 3 * ctrl1.x * t * (1 - t) * (1 - t) + 3 * ctrl2.x * t * t * (1 - t) + end_point.x * t * t * t;
            var y = start_point.y * (1 - t) * (1 - t) * (1 - t) + 3 * ctrl1.y * t * (1 - t) * (1 - t) + 3 * ctrl2.y * t * t * (1 - t) + end_point.y * t * t * t;
            var now_point = cc.v2(x, y);
            var dir = now_point.sub(prev_point);
            prev_point = now_point;
            length += dir.mag();
            t += 0.05;
        }
         return length;
    }
});