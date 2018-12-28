cc.Class({
    extends: cc.Component,

    properties: {
		level:0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
		console.log("creat ball start");
		this.fallFlag = false;
		this.updateFlag = false;
		this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static;
		this.node.getComponent(cc.RigidBody).gravityScale = GlobalData.BallGravityScale;
		this.EventCustom = new cc.Event.EventCustom("BallFallEvent", true);
		this.node.getComponent(cc.PhysicsCircleCollider).enabled = false;
	},
	setRigidBodyType(type){
		this.node.getComponent(cc.RigidBody).type = type;
		this.node.getComponent(cc.PhysicsCircleCollider).enabled = true;
		//this.node.getComponent(cc.RigidBody).type = type;
	},
	// 只在两个碰撞体开始接触时被调用一次
    onBeginContact: function (contact, selfCollider, otherCollider) {
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
			if(otherCollider.tag == GlobalData.RigidBodyTag.cup){
				this.fallFlag = true;
			}
			else if(otherCollider.tag == GlobalData.RigidBodyTag.floor){
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
			GlobalData.GameRunTime.FallBallNum -= 1;
			this.EventCustom.setUserData({
				type:'FallLine'
			});
			this.node.dispatchEvent(this.EventCustom);
		}
	},
});
