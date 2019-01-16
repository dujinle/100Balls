cc.Class({
    extends: cc.Component,

    properties: {
		level:0,
		color:null,
		isInCup:false,
		isAbled:true,
		isStatic:false,
		touchCupMusic:false,
		touchFloorMusic:false,
    },
    onLoad () {
		console.log("creat ball start");
		this.setColor(this.level);
		this.EventCustom = new cc.Event.EventCustom("BallFallEvent", true);
	},
	initAudio(audioManager){
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
		if(flag == true){
			this.setColor(0);
		}
		this.setLinerDamp(0);
	},
	setColor(level){
		this.level = level;
		this.color = GlobalData.BallConfig.BallColor[level];
		var colorMat = GlobalData.BallConfig.BallColorDic[this.color];
		this.node.color = new cc.Color(colorMat[0],colorMat[1],colorMat[2]);
	},
	setMyPosition(myDir,speed){
		if(GlobalData.CupConfig.CupMoveDir == 'right'){
			if(myDir == 1){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(speed,0);
			}else if(myDir == 2){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-speed);
			}else if(myDir == 3){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(-speed,0);
			}else if(myDir == 4){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,speed);
			}
		}else{
			if(myDir == 1){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(-speed,0);
			}else if(myDir == 2){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-speed);
			}else if(myDir == 3){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(speed,0);
			}else if(myDir == 4){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,speed);
			}
		}
	},
	setLinerDamp(num){
		if(num == 0){
			this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Dynamic;
			this.isStatic = false;
		}else{
			this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static;
			this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,0);
			this.node.getComponent(cc.RigidBody).angularVelocity = 0;
			this.isStatic = true;
		}
		//this.node.getComponent(cc.RigidBody).linearDamping = num;
		//this.node.getComponent(cc.RigidBody).angularDamping = num;
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
				GlobalData.GameRunTime.BallNodesPool.put(self.node);
				self.fallReset(true);
			}
		);
		this.node.runAction(cc.sequence(cc.delayTime(0.5),callFunc));
	},
	fallLine(){
		var self = this;
		this.EventCustom.setUserData({
			type:'FallLine'
		});
		this.node.dispatchEvent(this.EventCustom);
		var callFunc = cc.callFunc(
			function(){
				GlobalData.GameRunTime.BallNodesPool.put(self.node);
				self.fallReset(false);
			}
		);
		this.node.runAction(cc.sequence(cc.delayTime(0.5),callFunc));
	},
});
