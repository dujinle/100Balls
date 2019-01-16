var util = require('util');
var ThirdAPI = require('ThirdAPI');
cc.Class({
    extends: cc.Component,

    properties: {
		trickNode:cc.Node,
		cupContent:cc.Node,
		balls:cc.Node,
		rigidBalls:cc.Node,
		rigidBody:cc.Node,
		rigidBodyCall:cc.Node,
		startButton:cc.Node,
		scoreLabel:cc.Node,
		levelLabel:cc.Node,
		startGameBoard:cc.Node,
		mainGameBoard:cc.Node,
		pauseButton:cc.Node,
		audioManager:null,
		cupSpeed:0,
    },

    onLoad () {
		var self = this;
		cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            // 设置是否吞没事件，在 onTouchBegan 方法返回 true 时吞没
            onTouchBegan: function (touch, event) {	
				self.rigidBody.getComponent('RigidBodyUnCallManager').openContent();
				GlobalData.GameInfoConfig.gameStatus = 1;
                return true;
            },
            onTouchMoved: function (touch, event) {            // 触摸移动时触发
            },
            onTouchEnded: function (touch, event) {            // 点击事件结束处理
				GlobalData.GameInfoConfig.gameStatus = 0;
				self.rigidBody.getComponent('RigidBodyUnCallManager').closeContent();
			}
        }, this.node);
		ThirdAPI.loadLocalData();
		this.loadDataSync();
		this.node.on("BallFallEvent",this.BallFallEvent,this);
		this.startButton.getComponent(cc.Button).interactable = false;
		//打开物理属性 碰撞检测
		let physicsManager = cc.director.getPhysicsManager();
		physicsManager.enabled = true;
		//physicsManager.enabledAccumulator = true;
		//physicsManager.FIXED_TIME_STEP = 0.5;
		//physicsManager.enabledAccumulator = true;//
		//physicsManager.update(0.5);//自己控制速度
		//cc.director.getCollisionManager().enabled = true;
		/*
		cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
			cc.PhysicsManager.DrawBits.e_pairBit |
			cc.PhysicsManager.DrawBits.e_centerOfMassBit |
			cc.PhysicsManager.DrawBits.e_jointBit |
			cc.PhysicsManager.DrawBits.e_shapeBit
			;
		*/
		//cc.director.getCollisionManager().enabledDebugDraw = true;
		//cc.director.getCollisionManager().enabledDrawBoundingBox = true;
	},
	loadDataSync(){
		var self = this;
		//异步加载动态数据
		this.rate = 0;
		this.resLength = 8;
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
				if(assets[i].name == 'AudioManager'){
					self.audioManager = cc.instantiate(assets[i]);
				}
				console.log("load res prefab:" + assets[i].name);
			}
		});
		this.schedule(this.loadUpdate,0.5);
	},
	start(){
		this.pauseButton.active = false;
		this.mainGameBoard.active = true;
		this.startGameBoard.active = true;
		this.cupSpeed = GlobalData.CupConfig.CupMoveSpeed;
		this.startGameBoard.getComponent('StartGame').audioManager = this.audioManager;
		GlobalData.GameRunTime.BallNodesPool = new cc.NodePool();
	},
	//第一次进入游戏初始化数据
	initGame(){
		this.initBalls();
		this.initFallBalls();
		this.pauseButton.active = true;
		this.rigidBodyCall.getComponent('RigidBodyManager').initAudio(this.audioManager);
		this.trickNode.getComponent('TrackManager').initTrack(this.audioManager);
		this.trickNode.getComponent('TrackManager').startTrack();
		this.audioManager.getComponent('AudioManager').playGameBg();
		GlobalData.GameInfoConfig.gameStatus = 0;
		console.log(GlobalData.GameRunTime.CupAbledNum,GlobalData.GameRunTime.BallAbledNum);
	},
	//所有面板的button按钮 返回函数
	panelButtonCb(event,customEventData){
		var self = this;
		//继续游戏
		this.audioManager.getComponent("AudioManager").play(GlobalData.AudioManager.ButtonClick);
		if(customEventData == "P_show"){
			this.audioManager.getComponent("AudioManager").pauseGameBg();
			this.trickNode.getComponent('TrackManager').stopTrack();
			this.showPBGameScene({
				scene:'PauseGameScene',
				type:null
			});
		}
	},
	//再次进入游戏 数据重置
	enterGame(){
		for(var i = 0;i < this.balls.children.length;i++){
			let ball = this.balls.children[i];
			ball.active = true;
		}
		this.initFallBalls();
		this.trickNode.getComponent('TrackManager').startTrack();
		this.audioManager.getComponent('AudioManager').playGameBg();
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
		console.log(trickSize,tt,this.cupSpeed);
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
		var self = this;
		var data = event.getUserData();
		console.log(data);
		if(data.type == 'FallLine'){
			GlobalData.GameRunTime.BallAbledNum -= 1;
			if(GlobalData.GameRunTime.BallUnFallNum > 0){
				this.fallOneBall();
			}
			this.finishGame();
		}else if(data.type == 'CupRemove'){
			this.trickNode.getComponent('TrackManager').removeCup(data.uuid);
			GlobalData.GameRunTime.CupAbledNum -= 1;
			delete GlobalData.GameRunTime.CupNodesDic[data.uuid];
			this.finishGame();
		}else if(data.type == 'StartGame'){
			this.startGameBoard.active = false;
			this.mainGameBoard.active = true;
			this.clearGame();
			this.initGame();
		}else if(data.type == 'ReStartGame'){
			this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.ButtonClick);
			this.finishGameScene.removeFromParent();
			this.finishGameScene.destroy();
			this.clearGame();
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
			this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.LevelBell);
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
					if(BallNode != -1){
						var ballCom = BallNode.getComponent('ball');
						if(ballCom.level < (GlobalData.BallConfig.BallColor.length - 1)){
							ballCom.setColor(ballCom.level + 1);
						}
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
							self.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.CupLevelBell);
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
		else if(data.type == 'PauseContinue'){
			this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.ButtonClick);
			if(this.pauseGameScene != null){
				this.pauseGameScene.getComponent("PauseGame").hidePause(function(){
					self.audioManager.getComponent('AudioManager').resumeGameBg();
					self.destroyGameBoard(self.pauseGameScene);
					self.trickNode.getComponent('TrackManager').continueTrack();
				});
			}
		}
		else if(data.type == 'PauseReset'){
			this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.ButtonClick);
			if(this.pauseGameScene != null){
				this.pauseGameScene.getComponent("PauseGame").hidePause(function(){
					self.destroyGameBoard(self.pauseGameScene);
					self.destroyGame();
					self.audioManager.getComponent('AudioManager').stopGameBg();
					self.startGameBoard.active = true;
				});
			}
		}
	},
	initFallBalls(){
		var length = this.balls.children.length;
		for(var i = 0;i < GlobalData.BallConfig.BallPreFall;i++){
			var ball = this.balls.children[--length];
			ball.active = false;
			let rigidBall = null;
			if (GlobalData.GameRunTime.BallNodesPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
				rigidBall = GlobalData.GameRunTime.BallNodesPool.get();
			} else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
				rigidBall = cc.instantiate(GlobalData.assets['RigidBaseBall']);
			}
			this.rigidBalls.addChild(rigidBall);
			rigidBall.setPosition(ball.getPosition());
			rigidBall.getComponent('ball').initAudio(this.audioManager);
			GlobalData.GameRunTime.ContentBallsDic[rigidBall.uuid] = rigidBall;
			GlobalData.GameRunTime.BallUnFallNum -= 1;
		}
	},
	fallOneBall(){
		if(GlobalData.GameRunTime.BallUnFallNum > 0){
			let ball = this.balls.children[--GlobalData.GameRunTime.BallUnFallNum];
			ball.active = false;
			let rigidBall = null;
			if (GlobalData.GameRunTime.BallNodesPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
				rigidBall = GlobalData.GameRunTime.BallNodesPool.get();
			} else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
				rigidBall = cc.instantiate(GlobalData.assets['RigidBaseBall']);
			}
			this.rigidBalls.addChild(rigidBall);
			rigidBall.setPosition(ball.getPosition());
			rigidBall.getComponent('ball').initAudio(this.audioManager);
			GlobalData.GameRunTime.ContentBallsDic[rigidBall.uuid] = rigidBall;
			console.log('fallOneBall:',GlobalData.GameRunTime.BallNodesPool.size());
		}
	},
	//清除游戏中的数据
	destroyGame(){
		this.clearGame();
		GlobalData.GameRunTime.BallNodesPool.clear();
		this.trickNode.getComponent('TrackManager').rigidCupPool.clear();
	},
	clearGame(){
		//清除球体
		console.log(GlobalData.GameRunTime);
		if(GlobalData.GameRunTime.BallAbledNum > 0){
			for(var key in GlobalData.GameRunTime.BallNodesDic){
				var ball = GlobalData.GameRunTime.BallNodesDic[key];
				if(ball.isValid){
					ball.active = false;
				}
			}
		}
		for(var key in GlobalData.GameRunTime.ContentBallsDic){
			var rigidBall = GlobalData.GameRunTime.ContentBallsDic[key];
			GlobalData.GameRunTime.BallNodesPool.put(rigidBall);
		}
		this.trickNode.getComponent('TrackManager').removeAllCups();
		//this.rigidBallPool.clear();
	
		//准备球儿数量
		GlobalData.GameRunTime.BallUnFallNum = GlobalData.BallConfig.BallTotalNum;
		GlobalData.GameRunTime.BallAbledNum = GlobalData.GameRunTime.BallUnFallNum;
		//清除数据
		GlobalData.GameRunTime.ContentBallsDic = {};
		GlobalData.GameRunTime.CupNodesDic = {};
		GlobalData.GameRunTime.CircleLevel = 0;
		GlobalData.GameRunTime.TotalScore = 0;
		GlobalData.GameRunTime.AudioPlayNum = 0;
		GlobalData.GameRunTime.CupAbledNum = 0;
		this.scoreLabel.getComponent(cc.Label).string = 0;
		this.levelLabel.getComponent(cc.Label).string = 0;
	},
	finishGame(){
		console.log(GlobalData.GameRunTime.CupAbledNum,GlobalData.GameRunTime.BallAbledNum);
		if(GlobalData.GameRunTime.CupAbledNum <= 0 || GlobalData.GameRunTime.BallAbledNum <= 0){
			this.trickNode.getComponent('TrackManager').stopTrack();
			this.audioManager.getComponent('AudioManager').stopGameBg();
			this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.GameFinish);
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
		}else if(data.scene == 'PauseGameScene'){
			this.pauseGameScene = cc.instantiate(GlobalData.assets['PauseGameScene']);
			this.node.addChild(this.pauseGameScene);
			this.pauseGameScene.setPosition(cc.p(0,0));
			this.pauseGameScene.getComponent("PauseGame").showPause();
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
