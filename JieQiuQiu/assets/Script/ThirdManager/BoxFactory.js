/**
 * 生产box2d对象工具
 * 圆形，矩形等
 */
let BoxFactory = {
    _ballIdx:0,
    _cupIdx:0,
    _world:null,
    _ptmRadio:32,
    _winSize:null,
    onInit(world,ptmRadio,winSize){
        this._world = world;
        this._ptmRadio = ptmRadio;
        this._winSize = winSize;
    },
    //添加圆形皮肤材质
    AddFixtureCircle(body,radius,friction,restitution,density,userData,filterArr){
        var shape = new b2.CircleShape(radius);
        var fixtureDef = new b2.FixtureDef();
        fixtureDef.friction = friction;
        /// The restitution (elasticity) usually in the range [0,1].
        fixtureDef.restitution = restitution;
        /// The density, usually in kg/m^2.
        fixtureDef.density = density;
        fixtureDef.userData = userData;
        fixtureDef.shape = shape;
        fixtureDef.filter.categoryBits = filterArr[0];
        fixtureDef.filter.maskBits = filterArr[1];
        return body.CreateFixture(fixtureDef);
    },
    //添加圆形不带皮肤的材质
    AddNoFixtureCircle(body,radius){
        var shape = new b2.CircleShape(radius);
        body.CreateFixture(shape);
    },
    //添加链条皮肤
    AddFixtureChain(body,vectors,friction,restitution,density,userData,filterArr){
        let cShape = new b2.ChainShape();
        cShape.CreateChain(vectors,vectors.length,0);
        var fixtureDef = new b2.FixtureDef();
        fixtureDef.friction = friction;
        /// The restitution (elasticity) usually in the range [0,1].
        fixtureDef.restitution = restitution;
        /// The density, usually in kg/m^2.
        fixtureDef.density = density;
        fixtureDef.shape = cShape;
        fixtureDef.userData = userData;
        fixtureDef.filter.categoryBits = filterArr[0];
        fixtureDef.filter.maskBits = filterArr[1];
        return body.CreateFixture(fixtureDef);
    },
    //添加链条不带皮肤
    AddNoFixtureChain(body,vectors){
        let cShape = new b2.ChainShape();
        body.CreateFixture(cShape.CreateChain(vectors,vectors.length,0), 0.0);
    },
    //添加链条不带皮肤
    AddNoFixtureChainLoop(body,vectors){
        let shape = new b2.ChainShape();
        body.CreateFixture(shape.CreateLoop(vectors,vectors.length,0));
    },
    //添加链条皮肤
    AddFixtureChainLoop(body,vectors,friction,restitution,density,userData,filterArr){
        let cShape = new b2.ChainShape();
        cShape.CreateLoop(vectors,vectors.length,0);
        var fixtureDef = new b2.FixtureDef();
        fixtureDef.friction = friction;
        /// The restitution (elasticity) usually in the range [0,1].
        fixtureDef.restitution = restitution;
        /// The density, usually in kg/m^2.
        fixtureDef.density = density;
        fixtureDef.shape = cShape;
        fixtureDef.userData = userData;
        fixtureDef.filter.categoryBits = filterArr[0];
        fixtureDef.filter.maskBits = filterArr[1];
        return body.CreateFixture(fixtureDef);
    },
   
    CreatBall(userData,pos){
        let rigidBall = new b2.BodyDef();
		rigidBall.linearDamping = GlobalData.BallConfig.BallLinearDamping;
		rigidBall.angularDamping = GlobalData.BallConfig.BallAngularDamping;
		rigidBall.gravityScale = GlobalData.BallConfig.BallGravityScale;
        rigidBall.position.Set((pos.x + this._winSize.width/2) / this._ptmRadio,(pos.y + this._winSize.height/2)/this._ptmRadio);
        let ballBody = this._world.CreateBody(rigidBall);
        this.AddFixtureCircle(ballBody,GlobalData.BallConfig.Radius,0,0,1,userData,[GlobalData.RigidBodyTag.ball,494]);
		ballBody.SetType(b2.BodyType.b2_dynamicBody);
       // ballBody.SetBullet(true);
        ballBody.SetUserData(userData);
        this._ballIdx += 1;
        return ballBody;
    },
    CreatContentBody(pos){
        let bd_content = new b2.BodyDef();
		bd_content.position.Set((pos.x + this._winSize.width/2)/this._ptmRadio,(this._winSize.height/2)/this._ptmRadio);
		let contentBody = this._world.CreateBody(bd_content);
		//创建边缘形状
		//左部分
		this.AddFixtureChain(contentBody,GlobalData.ContentConfig.right,0,0,1,null,[GlobalData.RigidBodyTag.content,2]);
		//右部分
		this.AddFixtureChain(contentBody,GlobalData.ContentConfig.left,0,0,1,null,[GlobalData.RigidBodyTag.content,2]);
		//是否下落的监听夹具
		//let fixture = this.AddFixtureChain(contentBody,GlobalData.ContentConfig.fallLine,0,0,1,{type:GlobalData.RigidBodyTag.fallLine},[GlobalData.RigidBodyTag.fallLine,2]);
        //fixture.SetSensor(true);
        return contentBody;
    },
    CreatBottomBody(pos){
        let bd_content = new b2.BodyDef();
		bd_content.position.Set((pos.x + this._winSize.width/2)/this._ptmRadio,(pos.y + this._winSize.height/2)/this._ptmRadio);
		let contentBody = this._world.CreateBody(bd_content);
		this.AddFixtureChain(contentBody,GlobalData.ContentConfig.bottom,0,0,1,null,[GlobalData.RigidBodyTag.open,2]);
        return contentBody;
    },
    CreatFloorBody(pos){
        let floord = new b2.BodyDef();
        floord.position.Set((pos.x + this._winSize.width/2)/this._ptmRadio,(this._winSize.height/2 + pos.y)/this._ptmRadio);
        let floorBody = this._world.CreateBody(floord);
        this.AddFixtureChain(floorBody,GlobalData.ContentConfig.floor,0,0,1,{type:GlobalData.RigidBodyTag.floor},[GlobalData.RigidBodyTag.floor,130]);
        return floorBody;
    },
    RemoveBody(body){
        this._world.DestroyBody(body);
    },
    CreatCup(userData,pos){
        let rigidCup = new b2.BodyDef();
        rigidCup.position.Set((this._winSize.width/2 + pos.x) / this._ptmRadio,(this._winSize.height/2 + pos.y) / this._ptmRadio);
		let cupBody = this._world.CreateBody(rigidCup);
        this.AddFixtureChain(cupBody,GlobalData.ContentConfig.cup,0,0,1,userData,[GlobalData.RigidBodyTag.cup,2]);
		cupBody.SetType(b2.BodyType.b2_kinematicBody);
        cupBody.SetUserData(userData);
        this._cupIdx += 1;
        return cupBody;
    },
    CreatCupFallLine(userData,pos){
        let rigidCup = new b2.BodyDef();
        rigidCup.position.Set((this._winSize.width/2 + pos.x) / this._ptmRadio,(this._winSize.height/2 + pos.y) / this._ptmRadio);
		let cupBody = this._world.CreateBody(rigidCup);
        let fixture = this.AddFixtureChain(cupBody,GlobalData.ContentConfig.cupFallLine,0,0,1,userData,[GlobalData.RigidBodyTag.cupFallLine,2]);
        fixture.SetSensor(true);
		cupBody.SetType(b2.BodyType.b2_kinematicBody);
        cupBody.SetUserData(userData);
        return cupBody;
    }
};
module.exports = BoxFactory;