var util = require('util');
var ThirdAPI = require('ThirdAPI');
var PropManager = require('PropManager');
var EventManager = require('EventManager');
var WxVideoAd = require('WxVideoAd');
var WxBannerAd = require('WxBannerAd');
cc.Class({
    extends: cc.Component,

    properties: {
		trickNode:cc.Node,
		cupContent:cc.Node,
		ballsNum:cc.Node,
		rigidBalls:cc.Node,
		contentCL:cc.Node,
		floorNode:cc.Node,
		startButton:cc.Node,
		scoreLabel:cc.Node,
		levelLabel:cc.Node,
		startGameBoard:cc.Node,
		mainGameBoard:cc.Node,
		buttonNodes:cc.Node,
		audioManager:null,
    },

    onLoad () {
		GlobalData.GameInfoConfig.juNum = 1;
		ThirdAPI.loadLocalData();
		this.loadDataSync();
		EventManager.on(this.BallFallEvent,this);
		this.startButton.getComponent(cc.Button).interactable = false;
		
		//打开物理属性 碰撞检测
		//如果用了物理引擎，可以通过修改游戏帧率和检测的步长降低检测频率，提高性能。
		this.pymanager = cc.director.getPhysicsManager();
		this.pymanager.enabled = true;
		// 开启物理步长的设置
		//this.pymanager.enabledAccumulator = true;
		// 物理步长，默认 FIXED_TIME_STEP 是 1/60
		//this.pymanager.FIXED_TIME_STEP = 1/50;
		// 每次更新物理系统处理速度的迭代次数，默认为 10
		//this.pymanager.VELOCITY_ITERATIONS = 8;
		// 每次更新物理系统处理位置的迭代次数，默认为 10
		//this.pymanager.POSITION_ITERATIONS = 8;
		/*
		cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
		cc.PhysicsManager.DrawBits.e_pairBit |
		cc.PhysicsManager.DrawBits.e_centerOfMassBit |
		cc.PhysicsManager.DrawBits.e_jointBit |
		cc.PhysicsManager.DrawBits.e_shapeBit;
		*/
	},
	loadDataSync(){
		var self = this;
		//异步加载动态数据
		this.rate = 0;
		this.resLength = 14;
		GlobalData.assets = {};
		this.loadUpdate = function(){
			console.log("this.rate:" + self.rate);
			if(self.rate >= self.resLength){
				self.startButton.getComponent(cc.Button).interactable = true;
				self.startGameBoard.getComponent('StartGame').audioManager = self.audioManager;
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
		cc.loader.loadResDir("dynImages", cc.SpriteFrame, function (err, assets) {
			for(var i = 0;i < assets.length;i++){
				console.log("load res :" + assets[i].name);
				GlobalData.assets[assets[i].name] = assets[i];
				self.rate = self.rate + 1;
			}
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
		ThirdAPI.loadCDNData(null);
		//this.buttonNodes.active = false;
		this.mainGameBoard.active = false;
		this.startGameBoard.active = true;
		GlobalData.GameRunTime.BallNodesPool = new cc.NodePool();
	},
	//第一次进入游戏初始化数据
	initGame(){
		this.ballsNum.getComponent(cc.Label).string = GlobalData.GameRunTime.BallUnFallNum;
		this.freshPropStatus();
		this.initFallBalls();
		//this.buttonNodes.active = true;
		GlobalData.GameRunTime.CurrentSpeed = GlobalData.CupConfig.CupMoveSpeed;
		this.trickNode.getComponent('TrackManager').initTrack(this.audioManager);
		this.floorNode.getComponent('FloorManager').initAudio(this.audioManager);
		this.trickNode.getComponent('TrackManager').startTrack();
		this.audioManager.getComponent('AudioManager').playGameBg();
		GlobalData.GameInfoConfig.gameStatus = 0;
		this.setBannerAD();
		this.node.on(cc.Node.EventType.TOUCH_START,this.openContent,this);
		this.node.on(cc.Node.EventType.TOUCH_END,this.closeContent,this);
		this.node.on(cc.Node.EventType.TOUCH_CANCEL,this.closeContent,this);
		console.log(GlobalData.GameRunTime.CupAbledNum,GlobalData.GameRunTime.BallAbledNum,this.floorNode.active);
	},
	//所有面板的button按钮 返回函数
	panelButtonCb(event,customEventData){
		var self = this;
		//继续游戏
		console.log('panelButtonCb',customEventData);
		this.audioManager.getComponent("AudioManager").play(GlobalData.AudioManager.ButtonClick);
		if(customEventData == "P_show"){
			this.audioManager.getComponent("AudioManager").pauseGameBg();
			this.trickNode.getComponent('TrackManager').stopTrack();
			this.showPBGameScene({
				scene:'PauseGameScene',
				type:null
			});
		}else if(customEventData == "C_Big"){
			var propType = PropManager.getProp('PropBig');
			if(propType != null){
				if(GlobalData.GameInfoConfig.gameStatus == 1){
					this.closeContent();
				}
				this.trickNode.getComponent('TrackManager').stopTrack();
				this.shareOrAV('PropBig',propType);
			}
		}else if(customEventData == "C_UpLevel"){
			var propType = PropManager.getProp('PropUpLevel');
			if(propType != null){
				if(GlobalData.GameInfoConfig.gameStatus == 1){
					this.closeContent();
				}
				this.trickNode.getComponent('TrackManager').stopTrack();
				this.shareOrAV('PropUpLevel',propType);
			}
		}
	},
	shareOrAV(prop,openType){
		this.iscallBack = false;
		if(openType == "PropShare"){
			this.shareSuccessCb = function(type, shareTicket, arg){
				if(this.iscallBack == false){
					this.trickNode.getComponent('TrackManager').continueTrack();
					EventManager.emit({
						type:'GetPropSuccess',
						prop:prop
					});
				}
				this.iscallBack = true;
			};
			this.shareFailedCb = function(type,arg){
				if(this.iscallBack == false){
					this.showFailInfo(openType,prop);
				}
				this.iscallBack = true;
			};
			var param = {
				type:null,
				arg:null,
				successCallback:this.shareSuccessCb.bind(this),
				failCallback:this.shareFailedCb.bind(this),
				shareName:prop,
				isWait:true
			};
			if(GlobalData.cdnGameConfig.shareCustomSet == 0){
				param.isWait = false;
			}
			ThirdAPI.shareGame(param);
		}
		else if(openType == "PropAV"){
			this.AVSuccessCb = function(arg){
				this.trickNode.getComponent('TrackManager').continueTrack();
				EventManager.emit({
					type:'GetPropSuccess',
					prop:prop
				});
			}.bind(this);
			this.AVFailedCb = function(arg){
				this.showFailInfo(openType,prop);
			}.bind(this);
			WxVideoAd.initCreateReward(this.AVSuccessCb,this.AVFailedCb,null);
		}
	},
	showFailInfo(openType,prop){
		try{
			var self = this;
			var content = '请分享到不同的群获得更多的好友帮助!';
			if(openType == 'PropAV'){
				content = '看完视频才能获得奖励，请再看一次!';
			}
			wx.showModal({
				title:'提示',
				content:content,
				cancelText:'取消',
				confirmText:'确定',
				confirmColor:'#53679c',
				success(res){
					if (res.confirm) {
						self.shareOrAV(prop,openType);
					}else if(res.cancel){
						self.trickNode.getComponent('TrackManager').continueTrack();
					}
				}
			});
		}catch(err){}
	},
	//再次进入游戏 数据重置
	enterGame(){
		GlobalData.GameInfoConfig.juNum += 1;
		this.ballsNum.getComponent(cc.Label).string = GlobalData.GameRunTime.BallUnFallNum;
		this.freshPropStatus();
		this.initFallBalls();
		this.trickNode.getComponent('TrackManager').startTrack();
		this.audioManager.getComponent('AudioManager').playGameBg();
		GlobalData.GameRunTime.CurrentSpeed = GlobalData.CupConfig.CupMoveSpeed;
		ThirdAPI.updataGameInfo();
		WxBannerAd.showBannerAd();
		this.node.on(cc.Node.EventType.TOUCH_START,this.openContent,this);
		this.node.on(cc.Node.EventType.TOUCH_END,this.closeContent,this);
		this.node.on(cc.Node.EventType.TOUCH_CANCEL,this.closeContent,this);
	},
	openContent(){
		this.contentCL.getComponent('ContentCL').openContent();
		GlobalData.GameInfoConfig.gameStatus = 1;
	},
	closeContent(){
		GlobalData.GameInfoConfig.gameStatus = 0;
		this.contentCL.getComponent('ContentCL').closeContent();
	},
	BallFallEvent(data){
		var self = this;
		console.log(data);
		if(data.type == 'FallLine'){
			GlobalData.GameRunTime.BallAbledNum -= 1;
			GlobalData.GameRunTime.BallAppearNum -= 1;
			if(GlobalData.GameRunTime.BallAbledNum == GlobalData.cdnGameConfig.PropRelive){
				var openType = PropManager.getPropRelive();
				if(openType != null){
					this.trickNode.getComponent('TrackManager').stopTrack();
					this.propGameScene = cc.instantiate(GlobalData.assets['PropGameScene']);
					this.mainGameBoard.addChild(this.propGameScene);
					this.propGameScene.setPosition(cc.v2(0,0));
					this.propGameScene.getComponent('PropGame').initLoad(openType,'PropRelive');
				}
			}else{
				if(GlobalData.GameRunTime.BallUnFallNum > 0){
					this.fallOneBall();
				}
				this.finishGame();
			}
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
		else if(data.type == 'OpenSBA'){
			if(GlobalData.GameInfoConfig.gameStatus == 1){
				this.closeContent();
			}
			var propSba = PropManager.getSBA();
			if(propSba != null){
				var split = propSba.split('_');
				if(split.length == 2){
					this.trickNode.getComponent('TrackManager').stopTrack();
					this.propGameScene = cc.instantiate(GlobalData.assets['PropGameScene']);
					this.mainGameBoard.addChild(this.propGameScene);
					this.propGameScene.setPosition(cc.v2(0,0));
					this.propGameScene.getComponent('PropGame').initLoad(split[0],split[1]);
				}
			}
			var cupNode = GlobalData.GameRunTime.CupNodesDic[data.uuid];
			var sbaNode = cupNode.getChildByName('PropSBA');
			sbaNode.removeFromParent();
			sbaNode.destroy();
		}
		else if(data.type == 'UpdateCircle'){
			this.levelLabel.getComponent(cc.Label).string = GlobalData.GameRunTime.CircleLevel;
			this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.LevelBell);
			//如果球体升级则进行颜色变化
			var self = this;
			var trickNodeSize = this.trickNode.getContentSize();
			//动画速度 0.1s/100m
			var time = (trickNodeSize.width/2 + 100)/GlobalData.GameRunTime.CurrentSpeed;
			
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
						var ballCom = BallNode.getComponent('RigidBall');
						if(ballCom.level < (GlobalData.BallConfig.BallColor.length - 1)){
							ballCom.setColor(ballCom.level + 1);
						}
					}
				},time);
			}
			var upFlag = GlobalData.GameRunTime.CircleLevel % GlobalData.CupConfig.CupUpLevel;
			if(upFlag == 0 || GlobalData.GameRunTime.CircleLevel == 1){
				//设置速度升级
				GlobalData.GameRunTime.CurrentSpeed *= (1 + GlobalData.CupConfig.CupSpeedArate);
				if(GlobalData.GameRunTime.CurrentSpeed >= GlobalData.CupConfig.CupMoveMSpeed){
					GlobalData.GameRunTime.CurrentSpeed = GlobalData.CupConfig.CupMoveMSpeed
				}
				setTimeout(function(){
					self.trickNode.getComponent('TrackManager').upLevelCup(true);
				},time);
			}
			var sbaFlag = GlobalData.GameRunTime.CircleLevel % GlobalData.cdnGameConfig.PropSBAFlag;
			if(sbaFlag == 0){
				setTimeout(function(){
					self.trickNode.getComponent('TrackManager').addSBACup();
				},time);
			}
		}
		else if(data.type == 'RankView'){
			WxBannerAd.hideBannerAd();
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
					self.mainGameBoard.active = false;
					self.startGameBoard.active = true;
				});
			}
		}
		else if(data.type == 'GetPropSuccess'){
			if(data.prop == 'PropBig'){
				this.trickNode.getComponent('TrackManager').bigOneCup();
				this.freshPropStatus();
			}else if(data.prop == 'PropUpLevel'){
				this.trickNode.getComponent('TrackManager').upLevelCup(false);
				this.freshPropStatus();
			}
		}
		else if(data.type == 'PropSuccess'){
			this.propGameScene.removeFromParent();
			this.propGameScene.destroy();
			
			if(data.prop == 'PropRelive'){
				GlobalData.GameInfoConfig.PropRelive += 1;
				var sbaNode = cc.instantiate(GlobalData.assets['PropSBA']);
				this.mainGameBoard.addChild(sbaNode);
				sbaNode.setPosition(cc.v2(0,0));
				var finishFunc = cc.callFunc(function(){
					sbaNode.removeFromParent();
					sbaNode.destroy();
				},this);
				let pos = this.cupContent.getPosition();
				sbaNode.runAction(cc.sequence(cc.moveTo(1,pos),finishFunc));
				setTimeout(function(){
					GlobalData.GameRunTime.BallUnFallNum += GlobalData.cdnGameConfig.PropAddNum;
					GlobalData.GameRunTime.BallAbledNum += GlobalData.cdnGameConfig.PropAddNum;
					self.ballsNum.getComponent(cc.Label).string = GlobalData.GameRunTime.BallUnFallNum;
					if(GlobalData.GameRunTime.BallUnFallNum > 0){
						self.fallOneBall();
					}
					for(var i = GlobalData.GameRunTime.BallAppearNum;i < GlobalData.BallConfig.BallPreFall;i++){
						self.fallOneBall();
					}
					self.finishGame();
					self.trickNode.getComponent('TrackManager').continueTrack();
				},1200);
			}else if(data.prop == 'PropBig'){
				this.trickNode.getComponent('TrackManager').continueTrack();
				this.trickNode.getComponent('TrackManager').bigOneCup(true);
			}else if(data.prop == 'PropUpLevel'){
				this.trickNode.getComponent('TrackManager').continueTrack();
				this.trickNode.getComponent('TrackManager').upLevelCup(true);
			}else if(data.prop == 'PropAddBall'){
				var sbaNode = cc.instantiate(GlobalData.assets['PropSBA']);
				this.mainGameBoard.addChild(sbaNode);
				sbaNode.setPosition(cc.v2(0,0));
				var finishFunc = cc.callFunc(function(){
					sbaNode.removeFromParent();
					sbaNode.destroy();
				},this);
				let pos = this.cupContent.getPosition();
				sbaNode.runAction(cc.sequence(cc.moveTo(1,pos),cc.fadeOut(),finishFunc));
				setTimeout(function(){
					GlobalData.GameRunTime.BallUnFallNum += GlobalData.cdnGameConfig.PropAddNum;
					GlobalData.GameRunTime.BallAbledNum += GlobalData.cdnGameConfig.PropAddNum;
					self.ballsNum.getComponent(cc.Label).string = GlobalData.GameRunTime.BallUnFallNum;
					if(GlobalData.GameRunTime.BallUnFallNum > 0){
						self.fallOneBall();
					}
					for(var i = GlobalData.GameRunTime.BallAppearNum;i < GlobalData.BallConfig.BallPreFall;i++){
						self.fallOneBall();
					}
					self.trickNode.getComponent('TrackManager').continueTrack();
				},1200);
			}
		}
		else if(data.type == 'PropCancle'){
			this.trickNode.getComponent('TrackManager').continueTrack();
			if(GlobalData.GameRunTime.BallUnFallNum > 0){
				this.fallOneBall();
			}
			this.finishGame();
		}
	},
	initFallBalls(){
		var size = this.rigidBalls.getContentSize();
		for(var i = 0;i < GlobalData.BallConfig.BallPreFall;i++){
			let rigidBall = null;
			if (GlobalData.GameRunTime.BallNodesPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
				rigidBall = GlobalData.GameRunTime.BallNodesPool.get();
			} else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
				rigidBall = cc.instantiate(GlobalData.assets['RigidBaseBall']);
			}
			this.rigidBalls.addChild(rigidBall);
			let random = Math.random();
			rigidBall.setPosition(cc.v2(size.width/2 *random,0));
			rigidBall.getComponent('RigidBall').initAudio(this.audioManager);
			GlobalData.GameRunTime.ContentBallsDic[rigidBall.uuid] = rigidBall;
			GlobalData.GameRunTime.BallUnFallNum -= 1;
			GlobalData.GameRunTime.BallAppearNum += 1;
			this.ballsNum.getComponent(cc.Label).string = GlobalData.GameRunTime.BallUnFallNum;
			//console.log('add rigidBall',rigidBall.getPosition());
		}
	},
	fallOneBall(){
		if(GlobalData.GameRunTime.BallUnFallNum > 0){
			let rigidBall = null;
			if (GlobalData.GameRunTime.BallNodesPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
				rigidBall = GlobalData.GameRunTime.BallNodesPool.get();
			} else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
				rigidBall = cc.instantiate(GlobalData.assets['RigidBaseBall']);
			}
			this.rigidBalls.addChild(rigidBall);
			rigidBall.setPosition(cc.v2(0,0));
			rigidBall.getComponent('RigidBall').initAudio(this.audioManager);
			GlobalData.GameRunTime.ContentBallsDic[rigidBall.uuid] = rigidBall;
			GlobalData.GameRunTime.BallUnFallNum -= 1;
			GlobalData.GameRunTime.BallAppearNum += 1;
			this.ballsNum.getComponent(cc.Label).string = GlobalData.GameRunTime.BallUnFallNum;
			console.log('fallOneBall:',GlobalData.GameRunTime.BallNodesPool.size());
		}
	},
	//清除游戏中的数据
	destroyGame(){
		this.clearGame();
		GlobalData.GameRunTime.BallNodesPool.clear();
		this.trickNode.getComponent('TrackManager').rigidCupPool.clear();
		WxBannerAd.hideBannerAd();
	},
	clearGame(){
		//清除球体
		//console.log(GlobalData.GameRunTime);
		for(var key in GlobalData.GameRunTime.ContentBallsDic){
			var rigidBall = GlobalData.GameRunTime.ContentBallsDic[key];
			rigidBall.getComponent('RigidBall').fallReset(true);
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
		GlobalData.GameInfoConfig.addCupNum = 0;
		GlobalData.GameRunTime.BallAppearNum = 0;
		GlobalData.GameInfoConfig.PropRelive = 0;
		this.scoreLabel.getComponent(cc.Label).string = 0;
		this.levelLabel.getComponent(cc.Label).string = 0;
		this.node.off(cc.Node.EventType.TOUCH_START,this.openContent,this);
		this.node.off(cc.Node.EventType.TOUCH_END,this.closeContent,this);
		this.node.off(cc.Node.EventType.TOUCH_CANCEL,this.closeContent,this);
	},
	finishGame(){
		console.log(GlobalData.GameRunTime.CupAbledNum,GlobalData.GameRunTime.BallAbledNum);
		if(GlobalData.GameRunTime.CupAbledNum <= 1 || GlobalData.GameRunTime.BallAbledNum <= 0){
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
			this.finishGameScene.setPosition(cc.v2(0,0));
			this.finishGameScene.getComponent("FinishGame").show();
		}else if(data.scene == 'RankGameScene'){
			this.rankGameScene = cc.instantiate(GlobalData.assets[data.scene]);
			this.node.addChild(this.rankGameScene);
			this.rankGameScene.setPosition(cc.v2(0,0));
			this.rankGameScene.getComponent("RankGame").show(data.type);
		}else if(data.scene == 'PauseGameScene'){
			this.pauseGameScene = cc.instantiate(GlobalData.assets['PauseGameScene']);
			this.node.addChild(this.pauseGameScene);
			this.pauseGameScene.setPosition(cc.v2(0,0));
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
	freshPropStatus(){
		var buttonBig = this.buttonNodes.getChildByName('buttonBig');
		if(GlobalData.cdnPropParam.PropUnLock['PropBig'] <= GlobalData.GameInfoConfig.juNum){
			var propBig = PropManager.getProp('PropBig');
			if(propBig == null){
				var numLabel = buttonBig.getChildByName("numLabel");
				numLabel.active = true;
				numLabel.getComponent(cc.Label).string = 'x0';
				var openSprite = buttonBig.getChildByName("openSprite");
				openSprite.active = false;
			}else{
				var numLabel = buttonBig.getChildByName("numLabel");
				numLabel.active = false;
				var openSprite = buttonBig.getChildByName("openSprite");
				if(propBig == 'PropShare'){
					openSprite.getComponent(cc.Sprite).spriteFrame = GlobalData.assets['shareProp'];
				}else if(propBig == 'PropAV'){
					openSprite.getComponent(cc.Sprite).spriteFrame = GlobalData.assets['videoProp'];
				}
				openSprite.active = true;
			}
			buttonBig.active = true;
		}else{
			buttonBig.active = false;
		}
		
		var buttonUpLevel = this.buttonNodes.getChildByName('buttonUpLevel');
		if(GlobalData.cdnPropParam.PropUnLock['PropUpLevel'] <= GlobalData.GameInfoConfig.juNum){
			var propUpLevel = PropManager.getProp('PropUpLevel');
			if(propUpLevel == null){
				var numLabel = buttonUpLevel.getChildByName("numLabel");
				numLabel.active = true;
				numLabel.getComponent(cc.Label).string = 'x0';
				var openSprite = buttonUpLevel.getChildByName("openSprite");
				openSprite.active = false;
			}else{
				var numLabel = buttonUpLevel.getChildByName("numLabel");
				numLabel.active = false;
				var openSprite = buttonUpLevel.getChildByName("openSprite");
				if(propUpLevel == 'PropShare'){
					openSprite.getComponent(cc.Sprite).spriteFrame = GlobalData.assets['shareProp'];
				}else if(propUpLevel == 'PropAV'){
					openSprite.getComponent(cc.Sprite).spriteFrame = GlobalData.assets['videoProp'];
				}
				openSprite.active = true;
			}
			buttonUpLevel.active = true;
		}else{
			buttonUpLevel.active = false;
		}
	},
    setBannerAD(){
	//添加广告计算 最下面的节点位置所占的全屏比例 广告位置 不得超过这个节点
		if(GlobalData.cdnPropParam.PropUnLock['PropAD'] <= GlobalData.GameInfoConfig.juNum){
			var sizeHeight = cc.winSize.height;
			var floorPos = this.floorNode.getPosition();
			var floorSize = this.floorNode.getContentSize();
			//向下移 10个像素 不要挨得最下面的节点太近
			var yy = Math.abs(floorPos.y) +  floorSize.height/2 + sizeHeight/2;
			var yRate = 1 - yy/sizeHeight;
			WxBannerAd.createBannerAd(yRate);
		}
	}
});
