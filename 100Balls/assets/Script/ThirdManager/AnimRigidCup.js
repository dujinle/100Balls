var util = require('util');
var EventManager = require('EventManager');
var CupUtil = require('CupUtil');
cc.Class({
    extends: cc.Component,

    properties: {
		speed:10,
		addSpeed:0,
		width:20,
		height:20,
		balls:null,
		myId:0,
		moveDir:0,
		circleNum:0,
		level:0,
		ballNum:0,
		color:null,
		innerNode:cc.Node,
		isAbled:true,
		audioManager:null,
    },
    onLoad () {
		console.log("creat cup start");
		this.balls = {};
		this.level = 0;
		this.ballNum = 0;
		this.totalScore = 0;
		//杯子翻转标志
		this.rotateFlag = false;
		this.touchFloorMusic = false;
		this.repairSpeedFlag = false;
		this.cupScoreDic = {};
		this.cupScoreNumDic = {};
		this.setColor(this.level);
		this.rigidBody = this.node.getComponent(cc.RigidBody);
		this.rigidBody.type = cc.RigidBodyType.Static;
		this.anim = this.getComponent(cc.Animation);
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
		this.moveDir = 1;
		this.circleNum = 0;
		this.idxArray = idxArray;
		GlobalData.GameInfoConfig.addCupNum += 1;
		this.rigidBody.type = cc.RigidBodyType.Animated;
		if(GlobalData.CupConfig.CupMoveDir == 'right'){
			this.animState = this.anim.play('cupRightAnimationV');
			this.animState.wrapMode = cc.WrapMode.Loop;
			this.animState.speed = this.addSpeed;
		}else{
			this.animState= this.anim.play('cupLeftAnimation');
			this.animState.wrapMode = cc.WrapMode.Loop;
			this.animState.speed = this.addSpeed;
		}
		this.schedule(this.checkAddCup,0.02);
	},
	checkAddCup(dt){
		//是否加杯子
		if(GlobalData.GameInfoConfig.addCupNum < GlobalData.CupConfig.CupCreatNum
			&& (this.myId + 1) == GlobalData.GameInfoConfig.addCupNum){
			var pos = this.idxArray[this.myId];
			if(this.node.x == pos.x && this.node.y <= pos.y){	
				//console.log(pos,this.myId,GlobalData.GameInfoConfig.addCupNum);
				this.animState.speed = this.speed;
				this.unschedule(this.checkAddCup);
				EventManager.emitCup({type:'AddCup'});
			}
		}
	},
	resetStatus(flag){
		this.ballNum = 0;
		this.isAbled = true;
		this.rotateFlag = false;
		this.repairSpeedFlag = false;
		this.touchFloorMusic = false;
		if(flag == true){
			this.unschedule(this.checkAddCup);
			this.rigidBody.type = cc.RigidBodyType.Static;
			this.rigidBody.gravityScale = 0;
			this.setColor(0);
			this.node.rotation = 0;
		}
	},
	initData(width,height,deep,speed,addSpeed,audioManager){
		//console.log('cup initData',width,height,deep,speed,addSpeed,audioManager);
		this.myId = deep;
		this.width = width;
		this.speed = speed;
		this.height = height;
		this.addSpeed = addSpeed;
		this.audioManager = audioManager;
		if(this.rigidBody == null){
			this.rigidBody = this.node.getComponent(cc.RigidBody);
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
		else{
			for(var key in this.balls){
				var ball = this.balls[key];
				ball.getComponent('RigidBall').delayLinerDamp(0,50);
			}
		}
	},
	cupToFloor(){
		this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.CupTouchFloor);
	},
	cupBreakFinish(){
		EventManager.emit({
			type:'CupRemove',
			uuid:this.node.uuid
		})
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
				var ball = otherCollider.node;
				var ballCom = ball.getComponent('RigidBall');
				ballCom.isInCup = true;
				//ballCom.unMoveStop();
				//console.log('ball in cup:',ball.getComponent(cc.RigidBody));
				//var tt = 0.5 / (this.animState.speed/this.speed);
				//ballCom.delayLinerDamp(tt,50);
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
				this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.BallTouchCup);
			}
		}
    },
	setCupScoreLabel(ballNode){
		var self = this;
		var ballCom = ballNode.getComponent('RigidBall');
		if(this.level > ballCom.level){
			ballCom.setColor(this.level);
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
		this.totalScore += score;
		this.cupScoreDic[ballCom.color].getComponent(cc.Label).string = '+' + this.cupScoreNumDic[ballCom.color];
		EventManager.emit({
			type:'UpdateScore',
			score:score
		});
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
			GlobalData.GameRunTime.CircleLevel += 1;
			EventManager.emit({
				type:'UpdateCircle',
				uuid:this.node.uuid
			});
		}
	},
	cupRemove(){
		var destroyFunc = cc.callFunc(function(){
			EventManager.emit({
				type:'CupRemove',
				uuid:this.node.uuid
			})
		},this);
		if(GlobalData.CupConfig.CupMoveDir == 'left'){
			this.node.runAction(cc.sequence(cc.rotateBy(0.2,30),destroyFunc));
		}else{
			this.node.runAction(cc.sequence(cc.rotateBy(0.2,-30),destroyFunc));
		}
	},
});
