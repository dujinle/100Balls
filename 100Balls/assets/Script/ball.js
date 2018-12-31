cc.Class({
    extends: cc.Component,

    properties: {
		level:0,
		color:null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
		console.log("creat ball start");
		this.fallFlag = false;
		this.updateFlag = false;
		this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static;
		this.node.getComponent(cc.RigidBody).gravityScale = GlobalData.BallConfig.BallGravityScale;
		this.EventCustom = new cc.Event.EventCustom("BallFallEvent", true);
		this.node.getComponent(cc.PhysicsCircleCollider).enabled = false;
		this.setColor(this.level);
	},
	setRigidBodyType(type){
		this.node.getComponent(cc.RigidBody).type = type;
		this.node.getComponent(cc.PhysicsCircleCollider).enabled = true;
		//this.node.getComponent(cc.RigidBody).type = type;
	},
	setColor(level){
		this.level = level;
		this.color = GlobalData.BallConfig.BallColor[level];
		var colorMat = GlobalData.BallConfig.BallColorDic[this.color];
		this.node.color = new cc.Color(colorMat[0],colorMat[1],colorMat[2]);
	},
	// 只在两个碰撞体开始接触时被调用一次
    onBeginContact: function (contact, selfCollider, otherCollider) {
		//理论上不会产生 以防万一
		if(otherCollider.tag == GlobalData.RigidBodyTag.startLeft || otherCollider.tag == GlobalData.RigidBodyTag.startRight){
			contact.disabled = true;
		}
		//console.log(otherCollider.tag);
		//console.log('onBeginContact',otherCollider.node.getPosition(),selfCollider.node.getPosition());
    },

    // 只在两个碰撞体结束接触时被调用一次
    onEndContact: function (contact, selfCollider, otherCollider) {
    },

    // 每次将要处理碰撞体接触逻辑时被调用
    onPreSolve: function (contact, selfCollider, otherCollider) {
    },

    // 每次处理完碰撞体接触逻辑时被调用
    onPostSolve: function (contact, selfCollider, otherCollider) {
		if(this.fallFlag == false){
			/*
			if(otherCollider.tag == GlobalData.RigidBodyTag.cup){
				this.fallFlag = true;
			}
			*/
			if(otherCollider.tag == GlobalData.RigidBodyTag.floor){
				this.fallFlag = true;
				var destroyFunc = cc.callFunc(function(){
					this.node.removeFromParent();
					this.node.destroy();
				},this);
				this.node.runAction(cc.sequence(cc.delayTime(2),destroyFunc));
			}
		}
    },
    update (dt) {
		if(this.fallFlag == true && this.updateFlag == false){
			this.updateFlag = true;
			
			this.EventCustom.setUserData({
				type:'FallLine',
				uuid:this.node.uuid
			});
			this.node.dispatchEvent(this.EventCustom);
		}
	},
});
