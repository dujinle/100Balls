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
	setRigidBodyType(type){
		if(this.rigidBody != null){
			this.rigidBody.type = type;
		}
	},
	swapParent(pnode,time){
		this.scheduleOnce(function(){
			this.rigidBody.type = cc.RigidBodyType.Static;
			this.node.parent = pnode;
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
		var colorMat = GlobalData.BallConfig.BallColorDic[this.color];
		this.innerNode.color = new cc.Color(colorMat[0],colorMat[1],colorMat[2]);
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
