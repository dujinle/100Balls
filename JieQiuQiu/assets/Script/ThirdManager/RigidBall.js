cc.Class({
    extends: cc.Component,

    properties: {
		level:0,
		color:null,
		isInCup:false,
		isAbled:true,
		fallLine:false,
		touchCupMusic:false,
		touchFloorMusic:false,
    },
    onLoad () {
		console.log('rigidBall onLoad');
		this.setColor(this.level);
		if(this.rigidBody == null){
			this.rigidBody = this.node.getComponent(cc.RigidBody);
		}
		//this.rigidBody.gravityScale = GlobalData.BallConfig.BallGravityScale;
		//this.rigidBody.type = cc.RigidBodyType.Static;
		//this.rigidBody.fixedRotation = false;
	},
	setRigidBodyType(type){
		if(this.rigidBody != null){
			this.rigidBody.type = type;
		}
	},
	swapParent(pnode,time){
		this.node.removeFromParent();
		this.scheduleOnce(function(){
			var pPos = pnode.getPosition();
			var pos = this.node.getPosition();
			this.rigidBody.enabled = false;
			pnode.addChild(this.node);
			this.node.setPosition(cc.v2(pos.x - pPos.x,pos.y - pPos.y));
			
		}.bind(this),time);
	},
	delayToStatic(flag,time){
		this.unschedule(this.setRigidBodyType);
		if(flag == true){
			this.scheduleOnce(this.setRigidBodyType.bind(this,cc.RigidBodyType.Static),time);
		}else{
			this.scheduleOnce(this.setRigidBodyType.bind(this,cc.RigidBodyType.Dynamic),time);
		}
	},
	delayLinerDamp(time,value){
		this.scheduleOnce(this.setRigidDamp.bind(this,value),time);
	},
	setGravityScale(gravityRate){
		this.rigidBody.gravityScale *= gravityRate;
	},
	fallReset(){
		console.log(this.node.uuid,'fallReset');
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
	},
	setRigidDamp(num){
		console.log(this.node.uuid,'setRigidDamp',num);
		this.rigidBody.linearDamping = num;
		this.rigidBody.angularDamping = num;
	},
	unMoveStop(){
		this.unschedule(this.setRigidDamp);
	},
	fallRemove(){
		var self = this;
		console.log('node fallRemove:',this.node.uuid);
		var callFunc = cc.callFunc(
			function(){
				self.fallReset();
				if(GlobalData.GameRunTime.ContentBallsDic[self.node.uuid] != null){
					GlobalData.GameRunTime.ContentBallsDic[self.node.uuid]  = null;
				}
				GlobalData.GameRunTime.BallNodesPool.put(self.node);
			}
		);
		this.node.runAction(cc.sequence(cc.delayTime(0.5),callFunc));
	}
});
