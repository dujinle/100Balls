cc.Class({
    extends: cc.Component,

    properties: {
		bgSprite:cc.Node,
		numLabel:cc.Node,
    },
	onLoad(){
		this.node.scale = 0;
	},
	startFly(delayTime,name,numNum,endPos,cb){
		this.bgSprite.getComponent(cc.Sprite).spriteFrame = GlobalData.assets[name];
		this.numLabel.getComponent(cc.Label).string = "x " + numNum;

		var scaleTo = cc.scaleTo(GlobalData.TimeActionParam.EatFlyTimeCell,1);
		var moveEnd = cc.moveTo(GlobalData.TimeActionParam.EatFlyTimeCell,endPos);
		var scaleToS = cc.scaleTo(GlobalData.TimeActionParam.EatFlyTimeCell,0);
		var scaleToEnd = cc.spawn(scaleToS,moveEnd);
		var self = this;
		var destroyAction = cc.callFunc(function(){
			self.node.removeFromParent();
			self.node.destroy();
			if(cb != null){
				cb();
			}
		},this);
		this.node.runAction(cc.sequence(cc.delayTime(delayTime),scaleTo,cc.delayTime(GlobalData.TimeActionParam.EatFlyTimeCell/2),scaleToEnd,destroyAction));
	},
});
