cc.Class({
    extends: cc.Component,

    properties: {
        physisContentClose:null,
		physisContentOpen:null,
		audioManager:cc.Node,
		openNode:cc.Node,
		closeNode:cc.Node,
    },
    onLoad () {
		this.openNode.active = false;
		this.closeNode.active = true;
		this.EventCustom = new cc.Event.EventCustom("BallFallEvent", true);

		var physicsChainColliders = this.node.getComponents(cc.PhysicsChainCollider);
		for(var i = 0;i < physicsChainColliders.length;i++){
			if(physicsChainColliders[i].tag == GlobalData.RigidBodyTag.contentClose){
				this.physisContentClose = physicsChainColliders[i];
			}
			if(physicsChainColliders[i].tag == GlobalData.RigidBodyTag.contentOpen){
				this.physisContentOpen = physicsChainColliders[i];
			}
		}

	},
	openContent(){
		this.openNode.active = true;
		this.closeNode.active = false;
		if(this.physisContentClose != null){
			this.physisContentClose.enabled = false;
		}
	},
	closeContent(){
		this.openNode.active = false;
		this.closeNode.active = true;
		if(this.physisContentClose != null){
			this.physisContentClose.enabled = true;
		}
	},
    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact: function (contact, selfCollider, otherCollider) {
		//碰到contentLine则说明小球下落了		
		if(otherCollider.tag == GlobalData.RigidBodyTag.ball && selfCollider.tag == GlobalData.RigidBodyTag.contentLine){
			console.log('fall ball start');
			contact.disabled = true;
			var ball = otherCollider.node;
			if(GlobalData.GameRunTime.ContentBallsDic[ball.uuid] != null){
				delete GlobalData.GameRunTime.ContentBallsDic[ball.uuid];
			}
			return;
		}
		//再开始的时候处理音效
		if(otherCollider.tag == GlobalData.RigidBodyTag.ball && selfCollider.tag == GlobalData.RigidBodyTag.floor){
			var ballCom = otherCollider.node.getComponent('ball');
			if(ballCom.touchFloorMusic == false){
				this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.BallTouchFloor);
				ballCom.touchFloorMusic = true;
			}
			return;
		}
    },
    // 只在两个碰撞体结束接触时被调用一次
    onEndContact: function (contact, selfCollider, otherCollider) {
    },

    // 每次将要处理碰撞体接触逻辑时被调用
    onPreSolve: function (contact, selfCollider, otherCollider) {
    },

    // 每次处理完碰撞体接触逻辑时被调用
    onPostSolve: function (contact, selfCollider, otherCollider) {
		var self = this;
		//球调入地板
		if(selfCollider.tag == GlobalData.RigidBodyTag.floor && otherCollider.tag == GlobalData.RigidBodyTag.ball){
			this.fallRemove(otherCollider.node);
		}
    },
    fallRemove (node) {
		var self = this;
		var ballCom = node.getComponent('ball');
		if(ballCom.isAbled){
			ballCom.isAbled = false;
			this.EventCustom.setUserData({
				type:'FallLine'
			});
			this.node.dispatchEvent(this.EventCustom);
			var destroyFunc = cc.callFunc(function(){
				self.EventCustom.setUserData({
					type:'FallRemove',
					node:node
				});
				self.node.dispatchEvent(self.EventCustom);
			},this);
			this.node.runAction(cc.sequence(cc.delayTime(0.5),destroyFunc));
		}
	},
    update (dt) {
	},
});
