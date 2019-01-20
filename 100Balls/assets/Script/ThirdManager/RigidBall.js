cc.Class({
    extends: cc.Component,

    properties: {
		level:0,
		color:null,
		isInCup:false,
		isAbled:true,
		isStatic:false,
		fallLine:false,
		touchCupMusic:false,
		touchFloorMusic:false,
    },
    onLoad () {
		this.setColor(this.level);
	},
	initAudio(audioManager){
		console.log(this.node.group);
		this.audioManager = audioManager;
		this.initLinerDamp(1);
	},
	initLinerDamp(time){
		this.unMoveStop();
		this.scheduleOnce(this.moveStop,time);
	},
	fallReset(flag){
		console.log('fallReset');
		this.touchCupMusic = false;
		this.touchFloorMusic = false;
		this.isAbled = true;
		this.isStatic = false;
		this.isInCup = false;
		this.fallLine = false;
		if(flag == true){
			this.setColor(0);
			this.setLinerDamp(0);
		}
	},
	setColor(level){
		this.level = level;
		this.color = GlobalData.BallConfig.BallColor[level];
		var colorMat = GlobalData.BallConfig.BallColorDic[this.color];
		this.node.color = new cc.Color(colorMat[0],colorMat[1],colorMat[2]);
	},
	setLinerDamp(num){
		if(num == 0){
			this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Dynamic;
			this.isStatic = false;
		}else{
			this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Kinematic;
			this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0,0);
			this.node.getComponent(cc.RigidBody).angularVelocity = 0;
			this.isStatic = true;
		}
	},
	unMoveStop(){
		this.unschedule(this.moveStop);
	},
	moveStop(){
		this.setLinerDamp(50);
	},
	fallRemove(){
		var self = this;
		var callFunc = cc.callFunc(
			function(){
				self.fallReset(true);
				GlobalData.GameRunTime.BallNodesPool.put(self.node);
			}
		);
		this.node.runAction(cc.sequence(cc.delayTime(0.5),callFunc));
	},
});
