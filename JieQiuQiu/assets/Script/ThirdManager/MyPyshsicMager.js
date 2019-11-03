cc.PhysicsManager.prototype.start = function(){
	if (CC_EDITOR) return;
	if (!this._world) {
		var world = new b2.World( new b2.Vec2(0, -9.5) );
		world.SetAllowSleeping(true);
		this._world = world;
		//liquid 粒子
		//var psd = new b2.ParticleSystemDef();
		//psd.radius = GlobalData.BallConfig.Radius;
		/*
		if(GlobalData.GameInfoConfig.gameType == 1){
			psd.dampingStrength = 1.5;
			psd.viscousStrength = 0;
		}else{
			psd.dampingStrength = 2;
			psd.viscousStrength = 0;
			//psd.elasticStrength = 2;
			//psd.powderStrength = 1;
			//psd.gravityScale = 1.5;
		}
		this._particles = this._world.CreateParticleSystem(psd);
		*/
		this._initCallback();
	}
	this._enabled = true;
};
cc.PhysicsContactListener.prototype.BeginContact = function (contact) {
    var fixtureA = contact.GetFixtureA();
	var fixtureB = contact.GetFixtureB();
	var dataA = fixtureA.GetUserData();
	var dataB = fixtureB.GetUserData();
	if(dataA == null || dataB == null){
		return;
	}
	//小球和地面碰撞了
	if(dataA.type + dataB.type == (GlobalData.RigidBodyTag.ball + GlobalData.RigidBodyTag.floor)){
		var body = dataA.type == GlobalData.RigidBodyTag.ball ? fixtureA : fixtureB;
		GlobalData.game.mainGame.getComponent('MainGame').removeBall(body);
		return;
	}
	//小球和fallLine碰撞了
	if(dataA.type + dataB.type == (GlobalData.RigidBodyTag.ball + GlobalData.RigidBodyTag.fallLine)){
		GlobalData.game.mainGame.getComponent('MainGame').fallOneBall();
		return;
	}
	//小球碰到了 杯子口 进入杯子了
	if(dataA.type + dataB.type == (GlobalData.RigidBodyTag.ball + GlobalData.RigidBodyTag.cupFallLine)){
		//console.log('node:',dataA.name,dataB.name,'进入杯子了');
		contact.SetEnabled(false);
		if(dataA.type == GlobalData.RigidBodyTag.cupFallLine){
			dataA.node.getComponent('RigidCup').eatBall(dataB);
		}else{
			dataB.node.getComponent('RigidCup').eatBall(dataA);
		}
	}
   // console.log(fixtureA,fixtureB);
};
cc.PhysicsContactListener.prototype.EndContact = function (contact) {
	return;
	console.log('EndContact',contact);
	return;
    if (this._EndContact && contact._shouldReport) {
        contact._shouldReport = false;
        this._EndContact(contact);
    }
};
/*
cc.PhysicsContactListener.prototype.PreSolve = function (contact, oldManifold) {
    if (this._PreSolve && contact._shouldReport) {
        this._PreSolve(contact, oldManifold);
    }
};

cc.PhysicsContactListener.prototype.PostSolve = function (contact, impulse) {
    if (this._PostSolve && contact._shouldReport) {
        this._PostSolve(contact, impulse);
    }
};
*/
/*
cc.PhysicsManager.prototype._onBeginContact = function (b2contact) {
	console.log('_onBeginContact',b2contact);
};

cc.PhysicsManager.prototype._onEndContact = function (b2contact) {
	console.log('_onEndContact',b2contact);
};

cc.PhysicsManager.prototype._onPreSolve = function (b2contact) {
};

cc.PhysicsManager.prototype._onPostSolve = function (b2contact, impulse) {
};
*/