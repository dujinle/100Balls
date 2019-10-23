cc.Class({
    extends: cc.Component,

    properties: {
		level:0,
		color:null,
		isInCup:false,
		isAbled:true,
		fallLine:false,
		innerNode:cc.Node,
		touchCupMusic:false,
		touchFloorMusic:false,
    },
    onLoad () {
		console.log('rigidBall onLoad');
		this.setColor(this.level);
		if(this.rigidBody == null){
			this.rigidBody = this.node.getComponent(cc.RigidBody);
		}
	},
	fallReset(){
		//console.log(this.node.uuid,'fallReset');
		this.touchCupMusic = false;
		this.touchFloorMusic = false;
		this.isAbled = true;
		this.isInCup = false;
		this.fallLine = false;
		this.level = 0;
		this.setColor(this.level);
	},
	setColor(level){
		this.level = level;
		this.color = GlobalData.BallConfig.BallColor[level];
		var colorMat = GlobalData.BallConfig.BallColorDic[this.color];
		this.innerNode.color = new cc.Color(colorMat[0],colorMat[1],colorMat[2]);
	},
	fallRemove(){
		var self = this;
		console.log('node fallRemove:',this.node.uuid);
		var callFunc = cc.callFunc(
			function(){
				GlobalData.GameRunTime.BallNodesPool.put(self.node);
				self.fallReset();
				if(GlobalData.GameRunTime.ContentBallsDic[self.node.uuid] != null){
					GlobalData.GameRunTime.ContentBallsDic[self.node.uuid]  = null;
				}
			}
		);
		this.node.runAction(cc.sequence(cc.delayTime(0.5),callFunc));
	}
});
