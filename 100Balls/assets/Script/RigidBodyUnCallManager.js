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
	openContent(){
		this.openNode.active = true;
		this.closeNode.active = false;
		for(var key in GlobalData.GameRunTime.ContentBallsDic){
			var rigidBall = GlobalData.GameRunTime.ContentBallsDic[key];
			rigidBall.getComponent('ball').unMoveStop();
			rigidBall.getComponent('ball').setLinerDamp(0);
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
			rigidBall.getComponent('ball').initLinerDamp(1);
		}
		if(this.physisContentClose != null){
			this.physisContentClose.enabled = true;
		}
	}
});
