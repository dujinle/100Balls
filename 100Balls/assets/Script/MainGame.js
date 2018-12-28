cc.Class({
    extends: cc.Component,

    properties: {
		trickNode:cc.Node,
		cupContent:cc.Node,
		pbBall:cc.Prefab,
		pbCup:cc.Prefab,
		balls:cc.Node,
		openNode:cc.Node,
		closeNode:cc.Node,
		fallLevel:0,
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
		//打开物理属性
		cc.director.getPhysicsManager().enabled = true;
		//打开碰撞检测
		cc.director.getCollisionManager().enabled = true;
		cc.director.getCollisionManager().enabledDebugDraw = true;
		this.node.on("BallFallEvent",this.BallFallEvent,this);
		//this.fallLevel = 0;
		this.enterGame();
	},
	enterGame(){
		//准备球儿数量
		GlobalData.GameRunTime.BallUnFallNum = GlobalData.BallTotalNum;
		//清除数据
		GlobalData.GameRunTime.FallBallNum = 0;
		this.initBalls();
		this.initCups();
		this.initFallBalls();
	},
	initBalls(){
		for(var i = 0;i < 10;i++){
			for(var j = 0;j < GlobalData.BallRowArray[i];j++){
				var ball = cc.instantiate(this.pbBall);
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
	initCups(){
		var self = this;
		var cupNum = 8;
		var callFunc = cc.callFunc(function(){
			var cupNode = cc.instantiate(self.pbCup);
			var trickSize = self.trickNode.getContentSize();
			var pos = cupNode.getComponent('cup').getXY(trickSize.width,trickSize.height,30);
			self.trickNode.addChild(cupNode);
			cupNode.setPosition(pos)
			cupNode.getComponent('cup').startMove(trickSize.width,trickSize.height,100,30);
			cupNum -= 1;
			if(cupNum <= 0){
				self.node.stopAction(runAction);
			}
		},this);
		var runAction = cc.repeatForever(cc.sequence(cc.delayTime(3),callFunc));
		this.node.runAction(runAction);
	},
	BallFallEvent(event){
		var data = event.getUserData();
		console.log(data);
		if(data.type == 'FallLine'){
			if(GlobalData.GameRunTime.BallUnFallNum > 0){
				this.fallOneBall();
			}
		}
	},
	initFallBalls(){
		var length = this.balls.children.length;
		for(var i = 0;i < GlobalData.BallPreFall;i++){
			var ball = this.balls.children[--length];
			ball.getComponent('ball').setRigidBodyType(cc.RigidBodyType.Dynamic);
			GlobalData.GameRunTime.FallBallNum += 1;
			GlobalData.GameRunTime.BallUnFallNum -= 1;
		}
	},
	fallOneBall(){
		let ball = this.balls.children[--GlobalData.GameRunTime.BallUnFallNum];
		ball.getComponent('ball').setRigidBodyType(cc.RigidBodyType.Dynamic);
		GlobalData.GameRunTime.FallBallNum += 1;
	}

    // update (dt) {},
});
