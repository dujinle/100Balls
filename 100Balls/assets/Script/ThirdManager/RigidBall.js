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
	delayToStatic(time,flag){
		this.unMoveStop();
		/*
		var name = 'delayToStatic' + this.node.uuid;
		ScheduleManager.MyScheduleOnce(name,function(){
			if(flag == true){
				this.setRigidyType(50);
			}else{
				this.setRigidyType(0);
			}
		},time,this);
		*/
		if(flag == true){
			this.scheduleOnce(this.setRigidyType.bind(this,20),time);
		}else{
			this.scheduleOnce(this.setRigidyType.bind(this,0),time);
		}
	},
	setGravityScale(gravityRate){
		this.rigidBody.gravityScale *= gravityRate;
		//this.rigidBody.applyForceToCenter(force,flag);
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
			this.rigidBody.type = cc.RigidBodyType.Static;
			//this.unMoveStop();
		}
	},
	setColor(level){
		this.level = level;
		this.color = GlobalData.BallConfig.BallColor[level];
		var colorMat = GlobalData.BallConfig.BallColorDic[this.color];
		this.node.color = new cc.Color(colorMat[0],colorMat[1],colorMat[2]);
	},
	setRigidyType(num){
		console.log(this.node.uuid,'setRigidyType',num);
		if(num == 0){
			this.rigidBody.type = cc.RigidBodyType.Dynamic;
			this.isStatic = false;
		}else{
			this.rigidBody.type = cc.RigidBodyType.Static;
			this.rigidBody.linearVelocity = cc.v2(0,0);
			this.rigidBody.angularVelocity = 0;
			this.isStatic = true;
		}
	},
	unMoveStop(){
		//var name = 'delayToStatic' + this.node.uuid;
		//ScheduleManager.UnMySchedule(name,this);
		this.unschedule(this.setRigidyType);
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
