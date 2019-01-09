cc.Class({
    extends: cc.Component,

    properties: {
		node1:cc.Node,
		node2:cc.Node
    },
    onLoad () {
		cc.director.getPhysicsManager().enabled = true;
		//cc.director.getPhysicsManager().gravity = cc.v2(0,-500);
		//打开碰撞检测
		cc.director.getCollisionManager().enabled = true;
		cc.director.getCollisionManager().enabledDebugDraw = true;
		
	},
	buttonCb(){
		var size = this.node2.getContentSize();
		var physicsCircleCollider = this.node2.addComponent(cc.PhysicsCircleCollider);
		physicsCircleCollider.radius = size.width/2;
		physicsCircleCollider.offset = cc.p(0,0);
		physicsCircleCollider.friction = 0.2;
		physicsCircleCollider.restitution = 0.2;
		physicsCircleCollider.tag = GlobalData.RigidBodyTag.ball;
		var rigidBody = this.node2.addComponent(cc.RigidBody);
		rigidBody.type = cc.RigidBodyType.Dynamic;
		rigidBody.gravityScale = GlobalData.BallConfig.BallGravityScale;
		rigidBody.enabledContactListener = true;
	},
    start () {
		console.log('start');
		
		//rigidBody.onBeginContact = this.onBeginContact;
		//rigidBody.onEndContact = this.onEndContact;
		//rigidBody.onPreSolve = this.onPreSolve;
		//rigidBody.onPostSolve = this.onPostSolve;
    },

    // update (dt) {},
});
