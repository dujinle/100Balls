var ScheduleManager = require('ScheduleManager');
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
		this.audioManager = audioManager;
		if(this.rigidBody == null){
			this.rigidBody = this.node.getComponent(cc.RigidBody);
		}
		this.rigidBody.gravityScale = GlobalData.BallConfig.BallGravityScale;
		this.rigidBody.type = cc.RigidBodyType.Dynamic;
		/*
		if(GlobalData.GameInfoConfig.gameStatus == 0){
			this.delayToStatic(1,true);
		}
		*/
	},
	delayLinerDamp(time,value){
		this.scheduleOnce(this.setRigidDamp.bind(this,value),time);
	},
	setGravityScale(gravityRate){
		this.rigidBody.gravityScale *= gravityRate;
	},
	fallReset(flag){
		console.log(this.node.uuid,'fallReset');
		this.touchCupMusic = false;
		this.touchFloorMusic = false;
		this.isAbled = true;
		this.isStatic = false;
		this.isInCup = false;
		this.fallLine = false;
		if(flag == true){
			this.setColor(0);
			this.setRigidDamp(0);
			this.rigidBody.type = cc.RigidBodyType.Static;
		}
	},
	setColor(level){
		this.level = level;
		this.color = GlobalData.BallConfig.BallColor[level];
		var colorMat = GlobalData.BallConfig.BallColorDic[this.color];
		this.node.color = new cc.Color(colorMat[0],colorMat[1],colorMat[2]);
	},
	setRigidDamp(num){
		console.log(this.node.uuid,'setRigidDamp',num);
		this.rigidBody.linearDamping = num;
		this.rigidBody.angularDamping = num;
	},
	unMoveStop(){
		//var name = 'delayToStatic' + this.node.uuid;
		//ScheduleManager.UnMySchedule(name,this);
		this.unschedule(this.setRigidDamp);
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
