var util = require('util');
var EventManager = require('EventManager');
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
		this.rotateFlag = false;
		this.touchFloorMusic = false;
		//杯子翻转标志
		this.cupScoreDic = {};
		this.cupScoreNumDic = {};
		this.setColor(this.level);
		this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static;
		this.anim = this.getComponent(cc.Animation);
	},
	setColor(level){
		this.level = level;
		this.color = GlobalData.CupConfig.CupColor[this.level];
		var colorMat = GlobalData.CupConfig.CupColorDic[this.color];
		this.innerNode.color = new cc.Color(colorMat[0],colorMat[1],colorMat[2]);
	},
	closeCollider(){
		var pChains = this.node.getComponents(cc.PhysicsChainCollider);
		for(var i = 0;i < pChains.length;i++){
			pChains[i].enabled = false;
		}
		var pPolygons = this.node.getComponents(cc.PhysicsPolygonCollider);
		for(var i = 0;i < pPolygons.length;i++){
			pPolygons[i].enabled = false;
		}
	},
	openCollider(){
		var pChains = this.node.getComponents(cc.PhysicsChainCollider);
		for(var i = 0;i < pChains.length;i++){
			pChains[i].enabled = true;
		}
		var pPolygons = this.node.getComponents(cc.PhysicsPolygonCollider);
		for(var i = 0;i < pPolygons.length;i++){
			pPolygons[i].enabled = true;
		}
	},
	//杯子停止运动
	stopMove(speed){
		if(this.animState != null){
			this.animState.pause();
		}
		this.node.pauseAllActions();
		for(var key in this.balls){
			var ball = this.balls[key];
			ball.getComponent('RigidBall').setLinerDamp(50);
		}
	},
	syncSpeed(speed){
		this.addSpeed = speed;
		if(this.animState != null){
			this.animState.speed = this.addSpeed;
		}
	},
	resumeMove(){
		if(this.animState != null){
			this.animState.resume();
		}
		for(var key in this.balls){
			var ball = this.balls[key];
			ball.getComponent('RigidBall').setLinerDamp(0);
		}
		this.node.resumeAllActions();
	},
	startMove(idxArray){
		this.moveDir = 1;
		this.circleNum = 0;
		this.idxArray = idxArray;
		GlobalData.GameInfoConfig.addCupNum += 1;
		this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Animated;
		if(GlobalData.CupConfig.CupMoveDir == 'right'){
			this.animState = this.anim.play('cupRightAnimation');
			this.animState.wrapMode = cc.WrapMode.Loop;
			this.animState.speed = this.addSpeed;
			//this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(this.addSpeed,0);
		}else{
			this.animState= this.anim.play('cupLeftAnimation');
			this.animState.wrapMode = cc.WrapMode.Loop;
			this.animState.speed = this.addSpeed;
			//this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(-this.addSpeed,0);
		}
		this.schedule(this.checkAddCup,0.02);
	},
	checkAddCup(dt){
		//是否加杯子
		if(GlobalData.GameInfoConfig.addCupNum < GlobalData.CupConfig.CupCreatNum
			&& (this.myId + 1) == GlobalData.GameInfoConfig.addCupNum){
			var pos = this.idxArray[this.myId];
			if(this.node.x == pos.x && this.node.y <= pos.y){	
				console.log(pos,this.myId,GlobalData.GameInfoConfig.addCupNum);
				this.addSpeed = this.speed;
				this.animState.speed = this.addSpeed;
				this.unschedule(this.checkAddCup);
				EventManager.emitCup({type:'AddCup'});
			}
		}
	},
	
	resetStatus(flag){
		this.ballNum = 0;
		this.rotateFlag = false;
		this.isAbled = true;
		this.touchFloorMusic = false;
		if(flag == true){
			this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static;
			this.node.getComponent(cc.RigidBody).gravityScale = 0;
			this.setColor(0);
			this.node.rotation = 0;
		}
	},
	initData(width,height,deep,speed,addSpeed,audioManager){
		console.log('cup initData',width,height,deep,speed,addSpeed,audioManager);
		this.myId = deep;
		this.width = width;
		this.speed = speed;
		this.height = height;
		this.addSpeed = addSpeed;
		this.audioManager = audioManager;
	},
	UpLevelIsValid(){
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
			ball.getComponent('RigidBall').fallReset(false);
			ball.getComponent('RigidBall').initLinerDamp(1);
			GlobalData.GameRunTime.ContentBallsDic[ball.uuid] = ball;
		}
		this.ballNum = 0;
		this.cupScoreDic = {};
		this.cupScoreNumDic = {};
		this.balls = {};
		this.resetStatus(false);
	},
	rotateCup(){
		console.log("rotateCup start");
		var self = this;
		var size = this.node.getContentSize();
		var tt = (size.width * 1.5) / ((this.addSpeed/this.speed) * 100);
		/*
		for(var key in this.balls){
			var ball = this.balls[key];
			ball.getComponent('RigidBall').setLinerDamp(0);
		}
		*/
		var activeEnd = cc.callFunc(function(){
			self.rotateFlag = false;
			self.clearBalls();
			self.updateCircleNum();
		},this);
		if(GlobalData.CupConfig.CupMoveDir == 'right'){
			this.node.runAction(cc.sequence(cc.rotateBy(tt * 2, 360),activeEnd));
		}else{
			this.node.runAction(cc.sequence(cc.rotateBy(tt * 2, -360),activeEnd));
		}
	},
	fallCup(){
		this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Dynamic;
		this.node.getComponent(cc.RigidBody).gravityScale = 10;
	},
	// 只在两个碰撞体开始接触时被调用一次
    onBeginContact: function (contact, selfCollider, otherCollider) {
		//如果杯子碰到地板则销毁
		if(otherCollider.tag == GlobalData.RigidBodyTag.floor && this.touchFloorMusic == false){
			contact.disabled = true;
			this.touchFloorMusic = true;
			this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.CupTouchFloor);
			//this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static;
			this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0,0);
			this.cupRemove();
			return;
		}
		if(this.isAbled == false){
			contact.disabled = true;
			return;
		}
		var self = this;
		//如果碰撞瓶盖则代表球进入
		if(otherCollider.tag == GlobalData.RigidBodyTag.ball && selfCollider.tag == GlobalData.RigidBodyTag.cupLine){
			contact.disabled = true;
			if(this.balls[otherCollider.node.uuid] == null){
				var ball = otherCollider.node;
				var ballCom = ball.getComponent('RigidBall');
				ballCom.isInCup = true;
				ballCom.unMoveStop();
				//console.log('ball in cup:',ball.getComponent(cc.RigidBody));
				//ballCom.initLinerDamp(1);
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
		//碰撞了检测掉落挡板
		if(otherCollider.tag == GlobalData.RigidBodyTag.cupFallRight){
			contact.disabled = true;
			if(GlobalData.CupConfig.CupMoveDir == 'right' && this.ballNum <= 0){
				this.isAbled = false;
				this.animState.stop();
				this.scheduleOnce(this.fallCup,0);
			}
		}else if(otherCollider.tag == GlobalData.RigidBodyTag.cupFallLeft){
			contact.disabled = true;
			if(GlobalData.CupConfig.CupMoveDir == 'left' && this.ballNum <= 0){
				this.isAbled = false;
				this.animState.stop();
				this.scheduleOnce(this.fallCup,0);
			}
		}
		//碰撞了检测反转挡板
		if(otherCollider.tag == GlobalData.RigidBodyTag.cupRightRotate){
			contact.disabled = true;
			if(GlobalData.CupConfig.CupMoveDir == 'right' && this.rotateFlag == false){
				this.rotateFlag = true;
				this.scheduleOnce(this.rotateCup,0);
			}
		}else if(otherCollider.tag == GlobalData.RigidBodyTag.cupLeftRotate){
			contact.disabled = true;
			if(GlobalData.CupConfig.CupMoveDir == 'left' && this.rotateFlag == false){
				this.rotateFlag = true;
				this.scheduleOnce(this.rotateCup,0);
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
		/*
		this.EventCustom.setUserData({
			type:'UpdateScore',
			score:score
		});
		this.node.dispatchEvent(this.EventCustom);
		*/
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
			/*
			this.EventCustom.setUserData({
				type:'UpdateCircle',
				uuid:this.node.uuid
			});
			this.node.dispatchEvent(this.EventCustom);
			*/
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
