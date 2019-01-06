var util = require('util');
var ThirdAPI = require('ThirdAPI');
cc.Class({
    extends: cc.Component,

    properties: {
		trickNode:cc.Node,
		cupContent:cc.Node,
		balls:cc.Node,
		openNode:cc.Node,
		closeNode:cc.Node,
		startButton:cc.Node,
		scoreLabel:cc.Node,
		levelLabel:cc.Node,
		startGameBoard:cc.Node,
		mainGameBoard:cc.Node,
		audioManager:cc.Node,
		cupSpeed:0,
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
		ThirdAPI.loadLocalData();
		this.loadDataSync();
		//打开物理属性
		cc.director.getPhysicsManager().enabled = true;
		//打开碰撞检测
		cc.director.getCollisionManager().enabled = true;
		cc.director.getCollisionManager().enabledDebugDraw = true;
		this.node.on("BallFallEvent",this.BallFallEvent,this);
		this.mainGameBoard.active = true;
		this.startGameBoard.getComponent('StartGame').audioManager = this.audioManager;
		this.startButton.getComponent(cc.Button).interactable = false;
		this.cupSpeed = GlobalData.CupConfig.CupMoveSpeed;
	},
	loadDataSync(){
		var self = this;
		//异步加载动态数据
		this.rate = 0;
		this.resLength = 5;
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
			//self.rate = self.rate + 1;
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
		this.initBalls();
		this.initCups(0);
		this.initFallBalls();
	},
	initBalls(){
		for(var i = 0;i < 10;i++){
			for(var j = 0;j < GlobalData.BallConfig.BallRowArray[i];j++){
				var ball = cc.instantiate(GlobalData.assets['BaseBall']);
				this.balls.addChild(ball);
				let ylevel = 5 - i;
				var size = ball.getContentSize();
				var yy = (size.height + 3) * ylevel - size.height/2;
				let xlevel = GlobalData.BallConfig.BallRowArray[i]/2 - j;
				var xx = (size.width + 3) * xlevel - size.width/2;
				ball.setPosition(cc.p(xx,yy));
				GlobalData.GameRunTime.BallNodesDic[ball.uuid] = ball;
			}
		}
	},
	initCups(deep){
		if(deep >= GlobalData.CupConfig.CupCreatNum){
			return;
		}
		var self = this;
		var trickSize = this.trickNode.getContentSize();
		var tt = trickSize.height/2 / this.cupSpeed;
		var callBack = cc.callFunc(function(){
			var cupNode = cc.instantiate(GlobalData.assets['ChainCup']);
			self.trickNode.addChild(cupNode);
			GlobalData.GameRunTime.CupNodesDic[cupNode.uuid] = cupNode;
			if(GlobalData.CupConfig.CupMoveDir == 'right'){
				var pos = cupNode.getComponent('cup').getXY(trickSize.width,trickSize.height,30);
				cupNode.setPosition(pos);
			}else{
				var pos = cupNode.getComponent('cup').getXY(trickSize.width,trickSize.height,330);
				cupNode.setPosition(pos);
			}
			
			cupNode.getComponent('cup').myId = deep;
				
			if(deep == 0){
				cupNode.getComponent('cup').startMove(trickSize.width,trickSize.height,self.cupSpeed,GlobalData.CupConfig.CupMoveASpeed);
			}else if(deep == 1){
				cupNode.getComponent('cup').startMove(trickSize.width,trickSize.height,self.cupSpeed,GlobalData.CupConfig.CupMoveASpeed/4);
			}else{
				cupNode.getComponent('cup').startMove(trickSize.width,trickSize.height,self.cupSpeed,self.cupSpeed);
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
			GlobalData.GameRunTime.BallAbledNum -= 1;
			if(GlobalData.GameRunTime.ContentBallsDic[data.uuid] != null){
				delete GlobalData.GameRunTime.ContentBallsDic[data.uuid];
			}
			if(GlobalData.GameRunTime.BallUnFallNum > 0){
				this.fallOneBall();
			}
			this.finishGame();
		}else if(data.type == 'CupRemove'){
			GlobalData.GameRunTime.CupAbledNum -= 1;
			this.finishGame();
		}else if(data.type == 'StartGame'){
			this.startGameBoard.active = false;
			this.mainGameBoard.active = true;
			this.clearGame();
			this.enterGame();
		}else if(data.type == 'ReStartGame'){
			this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.ButtonClick);
			this.finishGameScene.removeFromParent();
			this.finishGameScene.destroy();
			this.enterGame();
		}
		else if(data.type == 'UpdateScore'){
			GlobalData.GameRunTime.TotalScore += data.score;
			this.scoreLabel.getComponent(cc.Label).string = GlobalData.GameRunTime.TotalScore;
			if(GlobalData.GameRunTime.TotalScore > GlobalData.GameInfoConfig.maxScore){
				GlobalData.GameInfoConfig.maxScore = GlobalData.GameRunTime.TotalScore;
				GlobalData.GameInfoConfig.maxLevel = GlobalData.GameRunTime.CircleLevel;
				ThirdAPI.updataGameInfo();
			}
		}
		else if(data.type == 'UpdateCircle'){
			this.levelLabel.getComponent(cc.Label).string = GlobalData.GameRunTime.CircleLevel;
			//如果球体升级则进行颜色变化
			var self = this;
			var trickNodeSize = this.trickNode.getContentSize();
			var time = (trickNodeSize.width/2 + 100)/this.cupSpeed * 1000;
			if(GlobalData.GameRunTime.CircleLevel % GlobalData.BallConfig.BallUpLevel == 0){
				setTimeout(function(){
					let UpLevelIsValid = new Array();
					for(let key in GlobalData.GameRunTime.ContentBallsDic){
						let ball = GlobalData.GameRunTime.ContentBallsDic[key];
						if(ball != null && ball.isValid){
							UpLevelIsValid.push(ball);
						}
					}
					let BallNode = util.getRandomObjForArray(UpLevelIsValid);
					var ballCom = BallNode.getComponent('ball');
					if(ballCom.level < (GlobalData.BallConfig.BallColor.length - 1)){
						ballCom.setColor(ballCom.level + 1);
					}
				},time);
			}
			if(GlobalData.GameRunTime.CircleLevel % GlobalData.CupConfig.CupUpLevel == 0){
				setTimeout(function(){
					let UpLevelIsValid = new Array();
					for(let key in GlobalData.GameRunTime.CupNodesDic){
						let cup = GlobalData.GameRunTime.CupNodesDic[key];
						if(cup != null && cup.isValid){
							let cupCom = cup.getComponent('cup');
							if(cupCom.UpLevelIsValid()){
								UpLevelIsValid.push(cup);
							}
						}
					}
					let CupNode = util.getRandomObjForArray(UpLevelIsValid);
					if(CupNode != -1){
						let cupCom = CupNode.getComponent('cup');
						if(cupCom.level < (GlobalData.CupConfig.CupColor.length - 1)){
							cupCom.setColor(cupCom.level + 1);
						}
					}
				},time);
			}
		}
		else if(data.type == 'RankView'){
			//WxBannerAd.hideBannerAd();
			if(this.finishGameScene != null){
				this.finishGameScene.getComponent("FinishGame").isDraw = false;
			}
			this.showPBGameScene({
				scene:'RankGameScene',
				type:'rankUIFriendRank'
			});
		}
		else if(data.type == 'RankGroupView'){
			if(this.finishGameScene != null){
				this.finishGameScene.getComponent("FinishGame").isDraw = false;
			}
			this.showPBGameScene({
				scene:'RankGameScene',
				type:'rankUIGroupRank'
			});
		}
	},
	initFallBalls(){
		var length = this.balls.children.length;
		for(var i = 0;i < GlobalData.BallConfig.BallPreFall;i++){
			var ball = this.balls.children[--length];
			ball.getComponent('ball').setRigidBodyType(cc.RigidBodyType.Dynamic);
			GlobalData.GameRunTime.FallBallNum += 1;
			GlobalData.GameRunTime.BallUnFallNum -= 1;
			GlobalData.GameRunTime.ContentBallsDic[ball.uuid] = ball;
		}
	},
	fallOneBall(){
		let ball = this.balls.children[--GlobalData.GameRunTime.BallUnFallNum];
		ball.getComponent('ball').setRigidBodyType(cc.RigidBodyType.Dynamic);
		GlobalData.GameRunTime.FallBallNum += 1;
		GlobalData.GameRunTime.ContentBallsDic[ball.uuid] = ball;
	},
	clearGame(){
		//清除球体
		console.log(GlobalData.GameRunTime);
		if(GlobalData.GameRunTime.BallAbledNum > 0){
			for(var key in GlobalData.GameRunTime.BallNodesDic){
				var ball = GlobalData.GameRunTime.BallNodesDic[key];
				if(ball.isValid){
					ball.removeFromParent();
					ball.destroy();
				}
			}
		}
		//清除杯子
		if(GlobalData.GameRunTime.CupAbledNum > 0){
			for(var key in GlobalData.GameRunTime.CupNodesDic){
				var cup = GlobalData.GameRunTime.CupNodesDic[key];
				if(cup.isValid){
					cup.removeFromParent();
					cup.destroy();
				}
			}
		}
		//准备球儿数量
		GlobalData.GameRunTime.BallUnFallNum = GlobalData.BallConfig.BallTotalNum;
		GlobalData.GameRunTime.BallAbledNum = GlobalData.GameRunTime.BallUnFallNum;
		//清除数据
		GlobalData.GameRunTime.ContentBallsDic = {};
		GlobalData.GameRunTime.BallNodesDic = {};
		GlobalData.GameRunTime.CupNodesDic = {};
		GlobalData.GameRunTime.FallBallNum = 0;
		GlobalData.GameRunTime.CircleLevel = 0;
		GlobalData.GameRunTime.FallBallNum = 0;
		GlobalData.GameRunTime.TotalScore = 0;
		GlobalData.GameRunTime.CupAbledNum = GlobalData.CupConfig.CupCreatNum;
		this.scoreLabel.getComponent(cc.Label).string = 0;
		this.levelLabel.getComponent(cc.Label).string = 0;
	},
	finishGame(){
		if(GlobalData.GameRunTime.CupAbledNum <= 0 || GlobalData.GameRunTime.BallAbledNum <= 0){
			this.clearGame();
			this.showPBGameScene({
				scene:'FinishGameScene',
				type:null
			});
		}
	},
	showPBGameScene(data){
		if(data.scene == 'FinishGameScene'){
			this.finishGameScene = cc.instantiate(GlobalData.assets[data.scene]);
			this.node.addChild(this.finishGameScene);
			this.finishGameScene.setPosition(cc.p(0,0));
			this.finishGameScene.getComponent("FinishGame").show();
		}else if(data.scene == 'RankGameScene'){
			this.rankGameScene = cc.instantiate(GlobalData.assets[data.scene]);
			this.node.addChild(this.rankGameScene);
			this.rankGameScene.setPosition(cc.p(0,0));
			this.rankGameScene.getComponent("RankGame").show(data.type);
		}
	},
	destroyGameBoard(board){
		if(board != null){
			board.removeFromParent();
			board.destroy();
		}
		return null;
	},
    // update (dt) {},
});
