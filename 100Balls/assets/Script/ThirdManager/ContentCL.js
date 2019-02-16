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
			if(GlobalData.GameRunTime.ContentBallsDic[ball.uuid] != null){
				delete GlobalData.GameRunTime.ContentBallsDic[ball.uuid];
				//var ballCom = ball.getComponent('RigidBall');
				//ballCom.delayToStatic(0,false);
				console.log('fall ball start',ball.uuid,GlobalData.GameRunTime.ContentBallsDic[ball.uuid]);
			}
			return;
		}
    },
	openContent(){
		this.openNode.active = true;
		this.closeNode.active = false;
		/*
		for(var key in GlobalData.GameRunTime.ContentBallsDic){
			var rigidBall = GlobalData.GameRunTime.ContentBallsDic[key];
			rigidBall.getComponent('RigidBall').delayToStatic(0,false);
		}
		*/
		if(this.physisContentClose != null){
			this.physisContentClose.enabled = false;
		}
	},
	closeAllBall(){
		for(var key in GlobalData.GameRunTime.ContentBallsDic){
			var rigidBall = GlobalData.GameRunTime.ContentBallsDic[key];
			rigidBall.getComponent('RigidBall').delayToStatic(0.5,true);
		}
	},
	closeContent(){
		//this.unschedule(this.closeAllBall);
		if(this.physisContentClose != null){
			this.physisContentClose.enabled = true;
		}
		this.openNode.active = false;
		this.closeNode.active = true;
		//this.scheduleOnce(this.closeAllBall,0.5);
	}
});
