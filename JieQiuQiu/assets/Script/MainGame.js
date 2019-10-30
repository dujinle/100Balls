var ThirdAPI = require('ThirdAPI');
var PropManager = require('PropManager');
var WxVideoAd = require('WxVideoAd');
var WxBannerAd = require('WxBannerAd');
var BoxFactory = require('BoxFactory');
var CupFactory = require('CupFactory');
cc.Class({
    extends: cc.Component,

    properties: {
		trickNode:cc.Node,
		ballsNum:cc.Node,
		floorNode:cc.Node,
		scoreLabel:cc.Node,
		levelLabel:cc.Node,
		buttonBig:cc.Node,
		ballContent:cc.Node,
		contentOpen:cc.Node,
		contentClose:cc.Node,
		buttonUpLevel:cc.Node,
    },
	onLoad(){
		this.ballGraphics = this.node.getComponent(cc.Graphics);
	},
	//第一次进入游戏初始化数据
	initGame(){
		console.log('MainGame initGame');
		this.node.active = true;
		CupFactory.onInit(this,BoxFactory._world,BoxFactory._ptmRadio,this.trickNode.y);
		//创建杯子容器
		{
			BoxFactory.CreatContentBody(this.ballContent.getPosition());
			//底部分开来 制作，因为可以打开的
			let closeSize = this.contentClose.getContentSize();
			let bottomPos = cc.v2(this.contentClose.x,this.contentClose.y + closeSize.height/2);
			this.bottomBody = BoxFactory.CreatBottomBody(bottomPos);
			
			//地板分开来 制作，因为可以打开的
			let floorSize = this.floorNode.getContentSize();
			let floorPos = cc.v2(this.floorNode.x,this.floorNode.y + floorSize.height/2);
			BoxFactory.CreatFloorBody(floorPos);
		}
		//创建对象池用于对象的回收利用
		if(GlobalData.GameRunTime.BallNodesPool == null){
			GlobalData.GameRunTime.BallNodesPool = new cc.NodePool();
		}
		if(GlobalData.GameRunTime.CupNodesPool == null){
			GlobalData.GameRunTime.CupNodesPool = new cc.NodePool();
		}
		if(GlobalData.GameRunTime.UpScorePool == null){
			GlobalData.GameRunTime.UpScorePool = new cc.NodePool();
		}
		if(GlobalData.GameRunTime.BaseBallPool == null){
			GlobalData.GameRunTime.BaseBallPool = new cc.NodePool();
		}
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
		
		this.freshPropStatus();
		this.initFallBalls();
		GlobalData.GameRunTime.CurrentSpeed = GlobalData.CupConfig.CupMoveSpeed;
		CupFactory.onStart();
		this.closeContent();
		GlobalData.game.audioManager.getComponent('AudioManager').playGameBg();
		GlobalData.GameInfoConfig.gameStatus = 0;
		//this.setBannerAD();
		//this.initParticle();
		this.node.on(cc.Node.EventType.TOUCH_START,this.openContent,this);
		this.node.on(cc.Node.EventType.TOUCH_END,this.closeContent,this);
		this.node.on(cc.Node.EventType.TOUCH_CANCEL,this.closeContent,this);
		console.log(GlobalData.GameRunTime.CupAbledNum,GlobalData.GameRunTime.BallAbledNum,this.floorNode.active);
	},
	initParticle(){
		let PTM_RATIO = cc.PhysicsManager.PTM_RATIO;
		var shuiLongTouSize = this.ballContent.getContentSize();
		var shuiLongTouPos = this.ballContent.getPosition();
		var size = cc.winSize;
		this.particleSystem = this.pymanager._particles;
		var box = new b2.PolygonShape();
		box.SetAsBox(shuiLongTouSize.width/4/PTM_RATIO, (shuiLongTouSize.height/4)/PTM_RATIO, new b2.Vec2(0, 0), 0);

		var particleGroupDef = new b2.ParticleGroupDef();
		particleGroupDef.shape = box;
		particleGroupDef.flags = b2.fixtureContactListenerParticle;
		particleGroupDef.position.Set((shuiLongTouPos.x + size.width/2)/PTM_RATIO,(shuiLongTouPos.y + size.height/2)/PTM_RATIO);
		this.particleGroup = this.particleSystem.CreateParticleGroup(particleGroupDef);
	},
	//所有面板的button按钮 返回函数
	panelButtonCb(event,customEventData){
		var self = this;
		//继续游戏
		console.log('panelButtonCb',customEventData);
		GlobalData.game.audioManager.getComponent("AudioManager").play(GlobalData.AudioManager.ButtonClick);
		if(customEventData == "P_show"){
			GlobalData.game.audioManager.getComponent("AudioManager").pauseGameBg();
			this.trickNode.getComponent('TrackManager').stopTrack();
			GlobalData.game.pauseGame.getComponent('PauseGame').showPause();
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
					CupFactory.continueTrack();
					if(prop == 'PropBig'){
						this.trickNode.getComponent('TrackManager').bigOneCup();
						this.freshPropStatus();
					}else if(prop == 'PropUpLevel'){
						this.trickNode.getComponent('TrackManager').upLevelCup(false);
						this.freshPropStatus();
					}
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
				CupFactory.continueTrack();
				if(prop == 'PropBig'){
					this.trickNode.getComponent('TrackManager').bigOneCup();
					this.freshPropStatus();
				}else if(prop == 'PropUpLevel'){
					this.trickNode.getComponent('TrackManager').upLevelCup(false);
					this.freshPropStatus();
				}
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
						CupFactory.continueTrack();
					}
				}
			});
		}catch(err){}
	},
	openContent(){
		this.bottomBody.SetActive(false);
		this.contentOpen.active = true;
		this.contentClose.active = false;
		GlobalData.GameInfoConfig.gameStatus = 1;
	},
	closeContent(){
		this.bottomBody.SetActive(true);
		this.contentOpen.active = false;
		this.contentClose.active = true;
		GlobalData.GameInfoConfig.gameStatus = 0;
	},
	openSBA(prop){
		var self = this;
		if(prop == 'PropBig'){
			CupFactory.continueTrack();
			this.trickNode.getComponent('TrackManager').bigOneCup(true);
		}else if(prop == 'PropUpLevel'){
			CupFactory.continueTrack();
			this.trickNode.getComponent('TrackManager').upLevelCup(true);
		}else if(prop == 'PropAddBall'){
			var sbaNode = cc.instantiate(GlobalData.assets['PropSBA']);
			this.node.addChild(sbaNode);
			sbaNode.setPosition(cc.v2(0,0));
			var finishFunc = cc.callFunc(function(){
				sbaNode.removeFromParent();
				sbaNode.destroy();
			},this);
			let pos = this.ballsNum.getPosition();
			sbaNode.runAction(cc.sequence(cc.moveTo(1,pos),cc.fadeOut(),finishFunc));
			setTimeout(function(){
				GlobalData.GameRunTime.BallUnFallNum += GlobalData.cdnGameConfig.PropAddNum;
				GlobalData.GameRunTime.BallAbledNum += GlobalData.cdnGameConfig.PropAddNum;
				if(GlobalData.GameRunTime.BallUnFallNum > 0){
					self.fallOneBall();
				}
				for(var i = GlobalData.GameRunTime.BallAppearNum;i < GlobalData.BallConfig.BallPreFall;i++){
					self.fallOneBall();
				}
				CupFactory.continueTrack();
			},1200);
		}else if(prop == 'PropRelive'){
			GlobalData.GameInfoConfig.PropRelive += 1;
			var sbaNode = cc.instantiate(GlobalData.assets['PropSBA']);
			this.node.addChild(sbaNode);
			sbaNode.setPosition(cc.v2(0,0));
			var finishFunc = cc.callFunc(function(){
				sbaNode.removeFromParent();
				sbaNode.destroy();
			},this);
			let pos = this.ballsNum.getPosition();
			sbaNode.runAction(cc.sequence(cc.moveTo(1,pos),finishFunc));
			setTimeout(function(){
				GlobalData.GameRunTime.BallUnFallNum += GlobalData.cdnGameConfig.PropAddNum;
				GlobalData.GameRunTime.BallAbledNum += GlobalData.cdnGameConfig.PropAddNum;
				if(GlobalData.GameRunTime.BallUnFallNum > 0){
					self.fallOneBall();
				}
				for(var i = GlobalData.GameRunTime.BallAppearNum;i < GlobalData.BallConfig.BallPreFall;i++){
					self.fallOneBall();
				}
				self.finishGame();
				CupFactory.continueTrack();
			},1200);
		}
	},
	initFallBalls(){
		let PTM_RATIO = cc.PhysicsManager.PTM_RATIO;
		var size = cc.winSize;
		for(let i = 0;i < GlobalData.BallConfig.BallRow.length;i++){
			let rowNum = GlobalData.BallConfig.BallRow[i];
			for(var j = 0;j < rowNum;j++){
				let offset = j % 2 == 0 ? 1:-1;
				let pos = cc.v2(
					this.ballsNum.x + (GlobalData.BallConfig.Radius * PTM_RATIO * (j + 1) * 1.2) * offset,
					this.ballsNum.y - (i * GlobalData.BallConfig.Radius * PTM_RATIO * 2.2)
				);
				let ballBody = cc.instantiate(GlobalData.assets['RigidBaseBall']);
				ballBody.setPosition(pos);
				this.node.addChild(ballBody);
				GlobalData.GameRunTime.ContentBallsDic[ballBody.uuid] = ballBody;
				GlobalData.GameRunTime.BallUnFallNum -= 1;
				GlobalData.GameRunTime.BallAppearNum += 1;
			}
		}
	},
	fallOneBall(){
		let PTM_RATIO = cc.PhysicsManager.PTM_RATIO;
		var size = cc.winSize;
		if(GlobalData.GameRunTime.BallUnFallNum > 0){
			this.scheduleOnce(()=>{
				let ballBody = cc.instantiate(GlobalData.assets['RigidBaseBall']);
				ballBody.setPosition(this.ballsNum.getPosition());
				this.node.addChild(ballBody);
				GlobalData.GameRunTime.ContentBallsDic[ballBody.uuid] = ballBody;
				GlobalData.GameRunTime.BallUnFallNum -= 1;
				GlobalData.GameRunTime.BallAppearNum += 1;
			},0.01);
		}
	},
	removeBall(fixture){
		var data = fixture.GetUserData();
		var ball = data.node;
		if(GlobalData.GameRunTime.ContentBallsDic[ball.uuid] != null){
			GlobalData.GameRunTime.BallAbledNum -= 1;
			GlobalData.GameRunTime.BallAppearNum -= 1;
			this.scheduleOnce(()=>{
				if(GlobalData.GameRunTime.ContentBallsDic[ball.uuid] != null){
					ball.getComponent('RigidBall').removeTrue();
				}
			},0.5);
		}
		if(GlobalData.GameRunTime.BallAbledNum == GlobalData.cdnGameConfig.PropRelive){
			var openType = PropManager.getPropRelive();
			if(openType != null){
				CupFactory.stopTrack();
				GlobalData.game.propGame.getComponent('PropGame').initLoad(openType,'PropRelive');
			}
		}else{
			this.fallOneBall();
			this.finishGame();
		}
	},
	//清除游戏中的数据
	destroyGame(){
		this.clearGame();
		WxBannerAd.hideBannerAd();
		this.node.active = false;
	},
	clearGame(){
		//清除球体
		//console.log(GlobalData.GameRunTime);
		for(var key in GlobalData.GameRunTime.ContentBallsDic){
			var rigidBall = GlobalData.GameRunTime.ContentBallsDic[key];
			if(rigidBall != null){
				rigidBall.getComponent('RigidBall').removeTrue();
			}
		}
		CupFactory.removeAllCups();
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
		this.node.off(cc.Node.EventType.TOUCH_START,this.openContent,this);
		this.node.off(cc.Node.EventType.TOUCH_END,this.closeContent,this);
		this.node.off(cc.Node.EventType.TOUCH_CANCEL,this.closeContent,this);
	},
	finishGame(){
		//console.log(GlobalData.GameRunTime.CupAbledNum,GlobalData.GameRunTime.BallAbledNum);
		if(GlobalData.GameRunTime.CupAbledNum <= 1 || GlobalData.GameRunTime.BallAbledNum <= 0){
			if(GlobalData.GameInfoConfig.gameStatus != 2){
				GlobalData.GameInfoConfig.gameStatus = 2;
				CupFactory.stopTrack();
				GlobalData.game.audioManager.getComponent('AudioManager').stopGameBg();
				GlobalData.game.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.GameFinish);
				GlobalData.game.finishGame.getComponent("FinishGame").show();
			}
		}
	},
	freshPropStatus(){
		if(GlobalData.cdnPropParam.PropUnLock['PropBig'] <= GlobalData.GameInfoConfig.juNum){
			var propBig = PropManager.getProp('PropBig');
			if(propBig == null){
				var numLabel = this.buttonBig.getChildByName("numLabel");
				numLabel.active = true;
				numLabel.getComponent(cc.Label).string = 'x0';
				var openSprite = this.buttonBig.getChildByName("openSprite");
				openSprite.active = false;
			}else{
				var numLabel = this.buttonBig.getChildByName("numLabel");
				numLabel.active = false;
				var openSprite = this.buttonBig.getChildByName("openSprite");
				if(propBig == 'PropShare'){
					openSprite.getComponent(cc.Sprite).spriteFrame = GlobalData.assets['shareProp'];
				}else if(propBig == 'PropAV'){
					openSprite.getComponent(cc.Sprite).spriteFrame = GlobalData.assets['videoProp'];
				}
				openSprite.active = true;
			}
			this.buttonBig.active = true;
		}else{
			this.buttonBig.active = false;
		}
		
		if(GlobalData.cdnPropParam.PropUnLock['PropUpLevel'] <= GlobalData.GameInfoConfig.juNum){
			var propUpLevel = PropManager.getProp('PropUpLevel');
			if(propUpLevel == null){
				var numLabel = this.buttonUpLevel.getChildByName("numLabel");
				numLabel.active = true;
				numLabel.getComponent(cc.Label).string = 'x0';
				var openSprite = this.buttonUpLevel.getChildByName("openSprite");
				openSprite.active = false;
			}else{
				var numLabel = this.buttonUpLevel.getChildByName("numLabel");
				numLabel.active = false;
				var openSprite = this.buttonUpLevel.getChildByName("openSprite");
				if(propUpLevel == 'PropShare'){
					openSprite.getComponent(cc.Sprite).spriteFrame = GlobalData.assets['shareProp'];
				}else if(propUpLevel == 'PropAV'){
					openSprite.getComponent(cc.Sprite).spriteFrame = GlobalData.assets['videoProp'];
				}
				openSprite.active = true;
			}
			this.buttonUpLevel.active = true;
		}else{
			this.buttonUpLevel.active = false;
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
	},
	update(){
		if(GlobalData.GameRunTime.BallUnFallNum < 0){
			GlobalData.GameRunTime.BallUnFallNum = 0;
		}
		this.scoreLabel.getComponent(cc.Label).string = GlobalData.GameRunTime.TotalScore;
		this.levelLabel.getComponent(cc.Label).string = GlobalData.GameRunTime.CircleLevel;
		this.ballsNum.getComponent(cc.Label).string = GlobalData.GameRunTime.BallUnFallNum;
		return;
		//绘制圆形
		let winsize = cc.winSize;
		this.ballGraphics.clear();
		let PTM_RATIO = cc.PhysicsManager.PTM_RATIO;
		for(var key in GlobalData.GameRunTime.ContentBallsDic){
			let ball = GlobalData.GameRunTime.ContentBallsDic[key];
			if(ball == null){
				continue;
			}
			let data = ball.GetUserData();
			if(data.type == GlobalData.RigidBodyTag.remove){
				BoxFactory._world.DestroyBody(ball);
				GlobalData.GameRunTime.ContentBallsDic[key] = null;
				continue;
			}
			let level = data.level;
			let color = GlobalData.BallConfig.BallColor[level];
			let colorMat = GlobalData.BallConfig.BallColorDic[color];
			this.ballGraphics.strokeColor = new cc.Color(colorMat[0],colorMat[1],colorMat[2]);
			this.ballGraphics.fillColor = new cc.Color(colorMat[0],colorMat[1],colorMat[2]);
			let pos = ball.GetPosition();
			let bassPos1 = cc.v2(pos.x * PTM_RATIO,pos.y * PTM_RATIO);
			this.ballGraphics.circle(bassPos1.x, bassPos1.y, GlobalData.BallConfig.Radius * PTM_RATIO);
			this.ballGraphics.fill();
			this.ballGraphics.stroke();
		}
	}
});
