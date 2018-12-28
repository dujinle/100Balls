cc.Class({
    extends: cc.Component,

    properties: {
        openNode:cc.Node,
		closeNode:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
		this.openNode.active = false;
		this.closeNode.active = true;
		this.EventCustom = new cc.Event.EventCustom("BallFallEvent", true);
	},
	openCup(){
		this.openNode.active = true;
		this.closeNode.active = false;
	},
	closeCup(){
		this.openNode.active = false;
		this.closeNode.active = true;
	}
    // update (dt) {},
});
