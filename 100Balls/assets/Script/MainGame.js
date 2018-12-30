cc.Class({
    extends: cc.Component,

    properties: {
		trickNode:cc.Node,
		cupContent:cc.Node,
		balls:cc.Node,
		openNode:cc.Node,
		closeNode:cc.Node,
		fallLevel:0,
		startButton:cc.Node,
		scoreLabel:cc.Node,
		levelLabel:cc.Node,
		startGameBoard:cc.Node,
		mainGameBoard:cc.Node,
    },

    onLoad () {
		var self = this;
		cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            // 设置是否吞没事件，在 onTouchBegan 方法返回 true 时吞没
            onTouchBegan: function (touch, event) {
				self.cupContent.getComponent('CupContent').openCup();
                return true;
            },
            onTouchMoved: function (touch, event) {            // 触摸移动时触发
            },
            onTouchEnded: function (touch, event) {            // 点击事件结束处理
				self.cupContent.getComponent('CupContent').closeCup();
			}
        }, this.node);
		this.loadDataSync();
		//打开物理属性
		cc.director.getPhysicsManager().enabled = true;
		//打开碰撞检测
		cc.director.getCollisionManager().enabled = true;
		cc.director.getCollisionManager().enabledDebugDraw = true;
		this.node.on("BallFallEvent",this.BallFallEvent,this);
		this.mainGameBoard.active = false;
		this.startButton.getComponent(cc.Button).interactable = false;
		
	},
	loadDataSync(){
		var self = this;
		//异步加载动态数据
		this.rate = 0;
		this.resLength = 3;
		GlobalData.assets = {};
		this.loadUpdate = function(){
			console.log("this.rate:" + self.rate);
			var scale = Math.floor((self.rate/self.resLength ) * 100);
			if(self.rate >= self.resLength){
				self.startButton.getComponent(cc.Button).interactable = true;
				self.unschedule(self.loadUpdate);
			}
		};
		cc.loader.loadRes("dynamicPlist", cc.SpriteAtlas, function (err, atlas) {
			for(var key in atlas._spriteFrames){
				console.log("load res :" + key);
				GlobalData.assets[key] = atlas._spriteFrames[key];
			}
			self.rate = self.rate + 1;
		});
		cc.loader.loadResDir("prefabs",function (err, assets) {
			for(var i = 0;i < assets.length;i++){
				GlobalData.assets[assets[i].name] = assets[i];
				self.rate = self.rate + 1;
				console.log("load res prefab:" + assets[i].name);
			}
		});
		this.schedule(this.loadUpdate,0.5);
	},
	enterGame(){
		//准备球儿数量
		GlobalData.GameRunTime.BallUnFallNum = GlobalData.BallTotalNum;
		//清除数据
		GlobalData.GameRunTime.FallBallNum = 0;
		GlobalData.GameRunTime.TotalScore = 0;
		GlobalData.GameRunTime.CupAbledNum = GlobalData.CupCreatNum;
		this.scoreLabel.getComponent(cc.Label).string = 0;
		this.levelLabel.getComponent(cc.Label).string = 0;
		this.initBalls();
		this.initCups(0);
		this.initFallBalls();
	},
	initBalls(){
		for(var i = 0;i < 10;i++){
			for(var j = 0;j < GlobalData.BallRowArray[i];j++){
				var ball = cc.instantiate(GlobalData.assets['ball']);
				this.balls.addChild(ball);
				let ylevel = 5 - i;
				var size = ball.getContentSize();
				var yy = (size.height + 3) * ylevel - size.height/2;
				let xlevel = GlobalData.BallRowArray[i]/2 - j;
				var xx = (size.width + 3) * xlevel - size.width/2;
				ball.setPosition(cc.p(xx,yy));
			}
		}
	},
	initCups(deep){
		if(deep >= GlobalData.CupCreatNum){
			return;
		}
		var self = this;
		var trickSize = this.trickNode.getContentSize();
		var tt = trickSize.height/2 / GlobalData.CupMoveSpeed;
		var callBack = cc.callFunc(function(){
			var cupNode = cc.instantiate(GlobalData.assets['ChainCup']);
			self.trickNode.addChild(cupNode);
			if(GlobalData.CupMoveDir == 'right'){
				var pos = cupNode.getComponent('cup').getXY(trickSize.width,trickSize.height,30);
				cupNode.setPosition(pos);
			}else{
				var pos = cupNode.getComponent('cup').getXY(trickSize.width,trickSize.height,330);
				cupNode.setPosition(pos);
			}
			
			cupNode.getComponent('cup').myId = deep;
				
			if(deep == 0){
				cupNode.getComponent('cup').startMove(trickSize.width,trickSize.height,GlobalData.CupMoveSpeed,GlobalData.CupMoveASpeed);
			}else if(deep == 1){
				cupNode.getComponent('cup').startMove(trickSize.width,trickSize.height,GlobalData.CupMoveSpeed,GlobalData.CupMoveASpeed/4);
			}else{
				cupNode.getComponent('cup').startMove(trickSize.width,trickSize.height,GlobalData.CupMoveSpeed,GlobalData.CupMoveSpeed);
			}
			self.initCups(deep + 1);
		},this);
		if(deep == 0){
			this.node.runAction(cc.sequence(cc.delayTime(0),callBack));
		}else if(deep == 1){
			this.node.runAction(cc.sequence(cc.delayTime(1),callBack));
		}else if(deep == 2){
			this.node.runAction(cc.sequence(cc.delayTime(0.2),callBack));
		}else{
			this.node.runAction(cc.sequence(cc.delayTime(tt),callBack));
		}
		
	},
	BallFallEvent(event){
		var data = event.getUserData();
		console.log(data);
		if(data.type == 'FallLine'){
			GlobalData.GameRunTime.FallBallNum -= 1;
			if(GlobalData.GameRunTime.CupBallsNum[data.uuid] != null){
				delete GlobalData.GameRunTime.CupBallsNum[data.uuid];
			}
			if(GlobalData.GameRunTime.BallUnFallNum > 0){
				this.fallOneBall();
			}
		}else if(data.type == 'CupRemove'){
			GlobalData.GameRunTime.CupAbledNum -= 1;
		}else if(data.type == 'StartGame'){
			this.startGameBoard.active = false;
			this.mainGameBoard.active = true;
			this.enterGame();
		}else if(data.type == 'UpdateScore'){
			GlobalData.GameRunTime.TotalScore += data.score;
			this.scoreLabel.getComponent(cc.Label).string = GlobalData.GameRunTime.TotalScore;
		}else if(data.type == 'UpdateCircle'){
			this.levelLabel.getComponent(cc.Label).string = GlobalData.GameRunTime.CircleLevel;
		}
	},
	initFallBalls(){
		var length = this.balls.children.length;
		for(var i = 0;i < GlobalData.BallPreFall;i++){
			var ball = this.balls.children[--length];
			ball.getComponent('ball').setRigidBodyType(cc.RigidBodyType.Dynamic);
			GlobalData.GameRunTime.FallBallNum += 1;
			GlobalData.GameRunTime.BallUnFallNum -= 1;
			GlobalData.GameRunTime.CupBallsNum[ball.uuid] = ball;
		}
	},
	fallOneBall(){
		let ball = this.balls.children[--GlobalData.GameRunTime.BallUnFallNum];
		ball.getComponent('ball').setRigidBodyType(cc.RigidBodyType.Dynamic);
		GlobalData.GameRunTime.FallBallNum += 1;
		GlobalData.GameRunTime.CupBallsNum[ball.uuid] = ball;
	}

    // update (dt) {},
});
