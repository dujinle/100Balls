var util = require('util');
cc.Class({
    extends: cc.Component,

    properties: {
		speed:10,
		addSpeed:0,
		width:20,
		height:20,
		balls:null,
		myId:0,
		circleNum:0,
		level:0,
		ballNum:0,
		color:null,
		innerNode:cc.Node,
		isAbled:true,
		hasSBA:0,
    },
    onLoad () {
		console.log("creat cup start");
		this.balls = {};
		this.level = 0;
		this.ballNum = 0;
		//杯子翻转标志
		this.rotateFlag = false;
		this.touchFloorMusic = false;
		this.repairSpeedFlag = false;
		this.cupScoreDic = {};
		this.cupScoreNumDic = {};
		this.hasSBA = 0;
		this.setColor(this.level);
	},
	setColor(level){
		this.level = level;
		this.color = GlobalData.CupConfig.CupColor[this.level];
		var colorMat = GlobalData.CupConfig.CupColorDic[this.color];
		this.innerNode.color = new cc.Color(colorMat[0],colorMat[1],colorMat[2]);
	},
	//杯子停止运动
	stopMove(speed){
		if(this.animState != null){
			this.animState.pause();
		}
		this.node.pauseAllActions();
		for(var key in this.balls){
			var ball = this.balls[key];
			ball.getComponent('RigidBall').delayToStatic(0,true);
		}
	},
	syncSpeed(speed){
		if(this.animState != null && this.isAbled == true){
			if(this.rotateFlag != true){
				console.log(this.node.uuid,'syncSpeed',speed);
				this.animState.speed = speed;
			}else{
				var self = this;
				this.scheduleOnce(function(){
					console.log(this.node.uuid,'syncSpeed',speed);
					self.animState.speed = speed;
				}.bind(this),this.rotateTime);
			}
		}
	},
	resumeMove(){
		if(this.animState != null){
			this.animState.resume();
		}
		for(var key in this.balls){
			var ball = this.balls[key];
			ball.getComponent('RigidBall').delayToStatic(0,false);
		}
		this.node.resumeAllActions();
	},
	startMove(idxArray){
		this.circleNum = 0;
		this.idxArray = idxArray;
		GlobalData.GameInfoConfig.addCupNum += 1;
		if(GlobalData.CupConfig.CupMoveDir == 'right'){
			this.animState = this.anim.play('cupRightAnimationV',0);
			this.animState.wrapMode = cc.WrapMode.Loop;
			this.animState.speed = this.addSpeed;
		}else{
			this.animState= this.anim.play('cupLeftAnimation',0);
			this.animState.wrapMode = cc.WrapMode.Loop;
			this.animState.speed = this.addSpeed;
		}
		this.schedule(this.checkAddCup,0);
	},
	checkAddCup(dt){
		//是否加杯子
		if(GlobalData.GameInfoConfig.addCupNum < GlobalData.CupConfig.CupCreatNum
			&& (this.myId + 1) == GlobalData.GameInfoConfig.addCupNum){
			var pos = this.idxArray[this.myId];
			if(this.node.x >= pos.x && this.node.y <= pos.y){
				//console.log(pos,this.myId,GlobalData.GameInfoConfig.addCupNum);
				this.animState.speed = this.speed;
				this.unschedule(this.checkAddCup);
				GlobalData.game.mainGame.getComponent('MainGame').trickNode.getComponent('TrackManager').addStartCup();
			}
		}
	},
	resetStatus(flag){
		this.ballNum = 0;
		this.hasSBA = 0;
		this.isAbled = true;
		this.rotateFlag = false;
		this.touchFloorMusic = false;
		if(flag == true){
			this.unschedule(this.checkAddCup);
			this.setColor(0);
			this.node.rotation = 0;
		}
		var sbaNode = this.node.getChildByName('PropSBA');
		if(sbaNode != null){
			sbaNode.removeFromParent();
			sbaNode.destroy();
		}
	},
	initData(width,height,deep,speed,addSpeed){
		//console.log('cup initData',width,height,deep,speed,addSpeed,audioManager);
		this.myId = deep;
		this.width = width;
		this.speed = speed;
		this.height = height;
		this.node.rotation = 0;
		this.addSpeed = addSpeed;
		if(this.rigidBody == null){
			this.rigidBody = this.node.getComponent(cc.RigidBody);
		}
		if(this.anim == null){
			this.anim = this.getComponent(cc.Animation);
		}
		this.anim.stop(null);
		if(this.animState != null){
			this.animState.stop();
			this.anim.setCurrentTime(0);
		}
	},
	UpLevelIsValid(){
		if(this.ballNum > 0){
			return false;
		}
		if(GlobalData.CupConfig.CupMoveDir == 'right' && this.node.x >= this.width/2){
			return true;
		}else if(GlobalData.CupConfig.CupMoveDir == 'left' && this.node.x <= -this.width/2){
			return true;
		}
		return false;
	},
	clearBalls(){
		for(var key in this.balls){
			var ball = this.balls[key];
			GlobalData.GameRunTime.ContentBallsDic[ball.uuid] = ball;
			ball.getComponent('RigidBall').fallReset(false);
		}
		this.ballNum = 0;
		this.cupScoreDic = {};
		this.cupScoreNumDic = {};
		this.balls = {};
		this.resetStatus(false);
	},
	removeBalls(){
		this.cupScoreDic = {};
		this.cupScoreNumDic = {};
		for(var key in this.balls){
			var ball = this.balls[key];
			ball.getComponent('RigidBall').fallReset(true);
			GlobalData.GameRunTime.BallNodesPool.put(ball);
		}
		this.balls = {};
	},
	setCupLineClose(flag){
		var physicsChainColliders = this.node.getComponents(cc.PhysicsChainCollider);
		for(var i = 0;i < physicsChainColliders.length;i++){
			if(physicsChainColliders[i].tag == GlobalData.RigidBodyTag.cupLine){
				physicsChainColliders[i].enabled = flag;
			}
		}
	},
	checkRotate(){
		console.log("rotateCup start");
		var self = this;
		var size = this.node.getContentSize();
		var rotateW = (120 + size.width/2) * (this.animState.speed/this.speed);
		var leftW = this.width/2 - rotateW;
		if(leftW < 0){
			leftW = 0;
			rotateW = this.width/2;
		}
		//1/1000m *this.speed
		var delayTime = leftW/100 /(this.animState.speed/this.speed);
		//var tt = (size.width * 1.5) / ((this.animState.speed/this.speed) * 100);
		var tt = rotateW * 2/100 /(this.animState.speed/this.speed);
		console.log(rotateW,leftW,delayTime,tt);
		var activeEnd = cc.callFunc(function(){
			self.rotateFlag = false;
			self.updateCircleNum();
			self.setCupLineClose(true);
		},this);
		
		var fallMiddle = cc.callFunc(function(){
			self.clearBalls();
		},this);
		this.setCupLineClose(false);
		for(var key in this.balls){
			var ball = this.balls[key];
			ball.getComponent('RigidBall').delayLinerDamp(0,0);
		}
		this.rotateFlag = true;
		this.rotateTime = tt;
		if(GlobalData.CupConfig.CupMoveDir == 'right'){
			this.node.runAction(cc.sequence(cc.delayTime(delayTime),cc.rotateBy(tt/3, 180),cc.delayTime(tt/6),cc.rotateBy(tt/3, -180),activeEnd));
		}else{
			this.node.runAction(cc.sequence(cc.delayTime(delayTime),cc.rotateBy(tt/3, -180),cc.delayTime(tt/6),cc.rotateBy(tt/3, 180),activeEnd));
		}
		this.node.runAction(cc.sequence(cc.delayTime(delayTime + tt/3),fallMiddle));
	},
	checkFall(){
		if(this.ballNum <= 0){
			this.isAbled = false;
			this.animState.stop();
			console.log('checkFall',this.node.rotation);
			this.animState = this.anim.play('cupRightFallAnimation');
		}
	},
	//杯子下落动画关键帧函数
	cupToFloor(){
		GlobalData.game.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.CupTouchFloor);
	},
	//杯子下落动画关键帧结束函数
	cupBreakFinish(){
		console.log('remove cup',this.node.uuid);
		GlobalData.GameRunTime.CupAbledNum -= 1;
		delete GlobalData.GameRunTime.CupNodesDic[data.uuid];
		GlobalData.GameRunTime.CupNodesPool.put(this.node);
		this.resetStatus(true);
		GlobalData.game.mainGame.getComponent('MainGame').finishGame();
	},
	// 只在两个碰撞体开始接触时被调用一次
    onBeginContact: function (contact, selfCollider, otherCollider) {
		if(this.isAbled == false){
			contact.disabled = true;
			return;
		}
		var self = this;
		//如果碰撞瓶盖则代表球进入
		if(otherCollider.tag == GlobalData.RigidBodyTag.ball && selfCollider.tag == GlobalData.RigidBodyTag.cupLine){
			if(this.balls[otherCollider.node.uuid] == null){
				contact.disabled = true;
				var ballCom = otherCollider.node.getComponent('RigidBall');
				ballCom.isInCup = true;
				this.ballNum += 1;
				this.balls[otherCollider.node.uuid] = otherCollider.node;
				this.setCupScoreLabel(otherCollider.node);
			}
			return;
		}
		if(otherCollider.tag == GlobalData.RigidBodyTag.ball && selfCollider.tag == GlobalData.RigidBodyTag.cupInner){
			var ball = otherCollider.node;
			var ballCom = ball.getComponent('RigidBall');
			if(ballCom.touchCupMusic == false){
				ballCom.touchCupMusic = true;
				GlobalData.game.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.BallTouchCup);
			}
		}
    },
	setCupScoreLabel(ballNode){
		var self = this;
		var ballCom = ballNode.getComponent('RigidBall');
		if(this.level > ballCom.level){
			ballCom.setColor(this.level);
		}
		if(this.hasSBA == 1){
			EventManager.emit({
				type:'OpenSBA',
				uuid:this.node.uuid
			});
			this.hasSBA = 0;
		}
		ballCom.isInCup = true;
		var size = this.node.getContentSize();
		if(this.cupScoreDic[ballCom.color] == null){
			var scoreLabel = cc.instantiate(GlobalData.assets['CupScore']);
			var colorMat = GlobalData.BallConfig.BallColorDic[ballCom.color];
			scoreLabel.color = new cc.Color(colorMat[0],colorMat[1],colorMat[2]);
			var scoreSize = scoreLabel.getContentSize();
			this.cupScoreDic[ballCom.color] = scoreLabel;
			this.node.addChild(scoreLabel);
			scoreLabel.setPosition(cc.v2(0,size.height/2 + scoreSize.height/2 + 10));
			this.cupScoreNumDic[ballCom.color] = 0;
		}
		//对label 进行定位 level小的 在下面
		var idx = 0;
		for(var i = 0;i < GlobalData.BallConfig.BallColor.length;i++){
			var scoreLabel = this.cupScoreDic[GlobalData.BallConfig.BallColor[i]];
			if(scoreLabel != null){
				var scoreSize = scoreLabel.getContentSize();
				scoreLabel.setPosition(cc.v2(0,size.height/2 + (scoreSize.height/2 + 10) * (idx + 1)));
				idx = idx + 1;
			}
		}
		var score = GlobalData.ScoreLevel[ballCom.level] > GlobalData.ScoreLevel[this.level] ? GlobalData.ScoreLevel[ballCom.level]:GlobalData.ScoreLevel[this.level];
		this.cupScoreNumDic[ballCom.color] += score;
		this.cupScoreDic[ballCom.color].getComponent(cc.Label).string = '+' + this.cupScoreNumDic[ballCom.color];
		GlobalData.GameRunTime.TotalScore += score;
		if(GlobalData.GameRunTime.TotalScore > GlobalData.GameInfoConfig.maxScore){
			GlobalData.GameInfoConfig.maxScore = GlobalData.GameRunTime.TotalScore;
			GlobalData.GameInfoConfig.maxLevel = GlobalData.GameRunTime.CircleLevel;
			ThirdAPI.updataGameInfo();
		}
		this.cupScoreDic[ballCom.color].runAction(cc.sequence(cc.fadeOut(1.5),cc.callFunc(function(){
			if(self.cupScoreDic[ballCom.color] != null){
				self.cupScoreDic[ballCom.color].removeFromParent();
				self.cupScoreDic[ballCom.color].destroy();
				self.cupScoreDic[ballCom.color] = null;
			}
		},this)));
	},
	updateCircleNum(){
		this.circleNum += 1;
		if(this.circleNum > GlobalData.GameRunTime.CircleLevel){
			var Uid = GlobalData.GameRunTime.CircleLevel % GlobalData.GameRunTime.CupAbledNum;
			for(var key in GlobalData.GameRunTime.CupNodesDic){
				var node = GlobalData.GameRunTime.CupNodesDic[key];
				if(Uid == 0){
					if(this.node.uuid == node.uuid){
						GlobalData.GameRunTime.CircleLevel += 1;
						EventManager.emit({
							type:'UpdateCircle',
							uuid:this.node.uuid
						});
					}
					break;
				}
				Uid = Uid - 1;
			}
		}
	}
});
