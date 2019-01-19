cc.Class({
    extends: cc.Component,

    properties: {
        physisContentClose:null,
		physisContentOpen:null,
		openNode:cc.Node,
		closeNode:cc.Node,
    },
    onLoad () {
		this.openNode.active = false;
		this.closeNode.active = true;
		
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
	// 只在两个碰撞体开始接触时被调用一次
    onBeginContact: function (contact, selfCollider, otherCollider) {
		//碰到contentLine则说明小球下落了
		if(otherCollider.tag == GlobalData.RigidBodyTag.ball && selfCollider.tag == GlobalData.RigidBodyTag.contentLine){
			contact.disabled = true;
			var ball = otherCollider.node;
			var ballCom = ball.getComponent('RigidBall');
			if(GlobalData.GameRunTime.ContentBallsDic[ball.uuid] != null){
				delete GlobalData.GameRunTime.ContentBallsDic[ball.uuid];
			}
			console.log('fall ball start',ball.group);
			return;
		}
    },
	openContent(){
		this.openNode.active = true;
		this.closeNode.active = false;
		for(var key in GlobalData.GameRunTime.ContentBallsDic){
			var rigidBall = GlobalData.GameRunTime.ContentBallsDic[key];
			rigidBall.getComponent('RigidBall').unMoveStop();
			rigidBall.getComponent('RigidBall').setLinerDamp(0);
		}

		if(this.physisContentClose != null){
			this.physisContentClose.enabled = false;
		}
	},
	closeContent(){
		this.openNode.active = false;
		this.closeNode.active = true;
		for(var key in GlobalData.GameRunTime.ContentBallsDic){
			var rigidBall = GlobalData.GameRunTime.ContentBallsDic[key];
			rigidBall.getComponent('RigidBall').initLinerDamp(1);
		}
		if(this.physisContentClose != null){
			this.physisContentClose.enabled = true;
		}
	}
});
