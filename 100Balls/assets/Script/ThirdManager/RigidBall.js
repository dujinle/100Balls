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
		//console.log("creat ball start");
		this.setColor(this.level);
		//this.EventCustom = new cc.Event.EventCustom("BallFallEvent", true);
		//console.log(this.node.group);
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
	swapParent(pNode){
		this.node.removeFromParent();
		var pSize = pNode.getContentSize();
		pNode.addChild(this.node);
		this.node.setPosition(cc.v2(pSize.width/2,pSize.height));
		this.initLinerDamp(0.5);
	},
	setMyPosition(myDir,speed){
		if(GlobalData.CupConfig.CupMoveDir == 'right'){
			if(myDir == 1){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(speed,0);
			}else if(myDir == 2){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0,-speed);
			}else if(myDir == 3){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(-speed,0);
			}else if(myDir == 4){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0,speed);
			}
		}else{
			if(myDir == 1){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(-speed,0);
			}else if(myDir == 2){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0,-speed);
			}else if(myDir == 3){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(speed,0);
			}else if(myDir == 4){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0,speed);
			}
		}
	},
	setLinerDamp(num){
		if(num == 0){
			this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Dynamic;
			this.isStatic = false;
		}else{
			//this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static;
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
	setGroup(group){
		this.node.group = group;
		this.node.active = false;
		this.node.active = true;
	},
});
