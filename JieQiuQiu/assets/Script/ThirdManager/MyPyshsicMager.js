cc.PhysicsManager.prototype.start = function(){
	if (CC_EDITOR) return;
	if (!this._world) {
		var world = new b2.World( new b2.Vec2(0, -9.5) );
		world.SetAllowSleeping(true);
		this._world = world;
		//liquid 粒子
		var psd = new b2.ParticleSystemDef();
		psd.radius = GlobalData.BallConfig.Radius;
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
		this._initCallback();
	}
	this._enabled = true;
};