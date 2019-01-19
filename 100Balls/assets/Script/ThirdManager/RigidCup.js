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
		lastPosition:null,
		audioManager:null,
    },
    onLoad () {
		console.log("creat cup start");
		this.balls = {};
		this.level = 0;
		this.ballNum = 0;
		this.totalScore = 0;
		this.rotateFlag = null;
		this.touchFloorMusic = false;
		this.toNomal = false;
		//杯子翻转标志
		this.cupScoreDic = {};
		this.cupScoreNumDic = {};
		this.setColor(this.level);
		this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Kinematic;
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
		this.unschedule(this.updateMoveV2);
		this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0,0);
		this.node.pauseAllActions();
		for(var key in this.balls){
			var ball = this.balls[key];
			ball.getComponent('RigidBall').setLinerDamp(50);
		}
	},
	syncSpeed(speed){
		this.addSpeed = speed;
		console.log('syncSpeed:',this.addSpeed);
		if(GlobalData.CupConfig.CupMoveDir == 'right'){
			if(this.moveDir == 1){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(this.addSpeed,0);
			}else if(this.moveDir == 2){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0,-this.addSpeed);
			}else if(this.moveDir == 3){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(-this.addSpeed,0);
			}else if(this.moveDir == 4){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0,this.addSpeed);
			}
		}
		else{
			if(this.moveDir == 1){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(-this.addSpeed,0);
			}else if(this.moveDir == 2){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0,-this.addSpeed);
			}else if(this.moveDir == 3){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(this.addSpeed,0);
			}else if(this.moveDir == 4){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0,this.addSpeed);
			}
		}
	},
	resumeMove(){
		this.syncSpeed(this.addSpeed);
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
		if(GlobalData.CupConfig.CupMoveDir == 'right'){
			this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(this.addSpeed,0);
		}else{
			this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(-this.addSpeed,0);
		}
		this.schedule(this.updateMoveV2,0.02);
	},
	updateMoveV2(dt){
		if(this.isAbled == true){
			this.node.getComponent(cc.RigidBody).syncPosition();
			if(GlobalData.CupConfig.CupMoveDir == 'right'){
				CupUtil.moveRightV2(this.node,dt);
			}else{
				CupUtil.moveLeftV2(this.node,dt);
			}
			if(this.toNomal == false){
				//第一个杯子特效
				var size = this.node.getContentSize();
				if(this.moveDir == 2 && this.node.y <= (size.height - this.height/2) && this.myId == 0){
					this.addSpeed = this.speed;
					this.toNomal = true;
				}
				//如果是第二个杯子则提前控制减速
				if(this.moveDir == 2 && this.node.y <= 0 && this.myId == 1){
					this.addSpeed = this.speed;
					this.toNomal = true;
				}
			}
			//是否加杯子
			if(GlobalData.GameInfoConfig.addCupNum < GlobalData.CupConfig.CupCreatNum
				&& (this.myId + 1) == GlobalData.GameInfoConfig.addCupNum){
				var pos = this.idxArray[this.myId];
				if(this.node.x == pos.x && this.node.y <= pos.y){	
					console.log(pos,this.myId,GlobalData.GameInfoConfig.addCupNum);
					EventManager.emitCup({type:'AddCup'});
				}
			}
			if(this.ballNum > 0){
				this.syncBallPosition();
			}
			this.checkRotate();
			this.checkFall();
		}
	},
	resetStatus(flag){
		this.ballNum = 0;
		this.rotateFlag = null;
		this.lastPosition = null;
		this.toNomal = false;
		this.isAbled = true;
		this.touchFloorMusic = false;
		//this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static;
		this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Kinematic;
		this.node.getComponent(cc.RigidBody).gravityScale = 0;
		if(this.node.rotation % 360 != 0){
			this.node.rotation = 0;
		}
		if(flag == true){
			this.unschedule(this.updateMoveV2);
			this.setColor(0);
		}
	},
	initData(width,height,deep,audioManager){
		this.myId = deep;
		this.width = width;
		this.height = height;
		this.audioManager = audioManager;
		if(GlobalData.CupConfig.CupMoveDir == 'right'){
			var pos = this.getXY(width,height,30);
			this.node.setPosition(pos);
		}else{
			var pos = this.getXY(width,height,330);
			this.node.setPosition(pos);
		}
		this.lastPosition = this.node.getPosition();
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
	getXY(width,height,radian){
		let angle = radian %360 / 180 * Math.PI;
		let x = height / 2 * Math.tan(angle);
		let y = height / 2 / Math.tan(angle);
		//console.log(width,height,x,y);
		if(Math.abs(x) > width/2){
			x = width/2;
		}
		if(Math.abs(y) > height/2){
			y = height/2
		}
		if(angle <= Math.PI){
			x = Math.abs(x);
		}else{
			x = Math.abs(x) * -1;
		}
		if(angle <= Math.PI/2 || angle >= Math.PI * 3/2){
			y = Math.abs(y);
		}else{
			y = Math.abs(y) * -1;
		}
		//console.log(width,height,x,y);
		return cc.v2(x,y);
	},
	//检查是否反转杯子倒出小球
	checkRotate(){
		var self = this;
		if(this.ballNum > 0){
			var size = this.node.getContentSize();
			if(GlobalData.CupConfig.CupMoveDir == 'right'){
				if(this.node.x >= -(size.width * 2) && this.node.y >= this.height/2 && this.node.x < 0 && this.rotateFlag == null){
					var tt = (size.width * 2) / this.addSpeed;
					
					for(var key in this.balls){
						var ball = this.balls[key];
						ball.getComponent('RigidBall').setLinerDamp(0);
					}
					
					var activeEnd = cc.callFunc(function(){
						self.rotateFlag = null;
						self.clearBalls();
						self.updateCircleNum();
					},this);
					this.rotateFlag = this.node.runAction(cc.sequence(cc.rotateBy(tt * 2, 360),activeEnd));
				}
			}
			else{
				if(this.node.x <= (size.width * 2) && this.node.y >= this.height/2 && this.node.x > 0 && this.rotateFlag == null){
					var tt = (size.width * 2) / this.addSpeed;
					
					for(var key in this.balls){
						var ball = this.balls[key];
						ball.getComponent('RigidBall').setLinerDamp(0);
					}
					
					var activeEnd = cc.callFunc(function(){
						self.rotateFlag = null;
						self.clearBalls();
						self.updateCircleNum();
					},this);
					this.rotateFlag = this.node.runAction(cc.sequence(cc.rotateBy(tt * 2, -360),activeEnd));
					
				}
			}
		}
	},
	checkFall(){
		if(this.ballNum <= 0 && this.isAbled == true){
			var size = this.node.getContentSize();
			if(GlobalData.CupConfig.CupMoveDir == 'right'){
				if(this.node.x <= -this.width/2 && this.node.y >= (size.height - this.height/2)){
					this.isAbled = false;
					this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Dynamic;
					this.node.getComponent(cc.RigidBody).gravityScale = 10;
				}
			}else{
				if(this.node.x >= this.width/2 && this.node.y >= (size.height - this.height/2)){
					this.isAbled = false;
					this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Dynamic;
					this.node.getComponent(cc.RigidBody).gravityScale = 10;
				}
			}
		}
	},
	syncBallPosition(){
		for(var key in this.balls){
			var ball = this.balls[key];
			var ballCom = ball.getComponent('RigidBall');
			if(ballCom.isStatic == true){
				ballCom.setMyPosition(this.moveDir,this.addSpeed);
			}
		}
	},
	// 只在两个碰撞体开始接触时被调用一次
    onBeginContact: function (contact, selfCollider, otherCollider) {
		//如果 碰撞的 杯口的挡板则球体进入杯子 并取消碰撞效果
		var self = this;
		//如果碰撞瓶盖则代表球进入
		if(otherCollider.tag == GlobalData.RigidBodyTag.ball && selfCollider.tag == GlobalData.RigidBodyTag.cupLine){
			contact.disabled = true;
			if(this.balls[otherCollider.node.uuid] == null){
				var ball = otherCollider.node;
				var ballCom = ball.getComponent('RigidBall');
				ballCom.isInCup = true;
				//ballCom.unMoveStop();
				//console.log('ball in cup:',ball.getComponent(cc.RigidBody));
				ballCom.initLinerDamp(1);
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
