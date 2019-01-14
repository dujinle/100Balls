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
		moveDir:0,
		circleNum:0,
		level:0,
		color:null,
		innerNode:cc.Node,
		isAbled:true,
		audioManager:null,
    },
    onLoad () {
		console.log("creat cup start");
		this.balls = {};
		this.level = 0;
		this.totalScore = 0;
		this.rotateFlag = null;
		this.touchFloorMusic = false;
		//杯子翻转标志
		this.cupScoreDic = {};
		this.cupScoreNumDic = {};
		this.setColor(this.level);
		this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Kinematic;
		//this.node.getComponent(cc.RigidBody).fixedRotation = false;
		this.EventCustom = new cc.Event.EventCustom("BallFallEvent", true);
	},
	setColor(level){
		this.level = level;
		this.color = GlobalData.CupConfig.CupColor[this.level];
		var colorMat = GlobalData.CupConfig.CupColorDic[this.color];
		this.innerNode.color = new cc.Color(colorMat[0],colorMat[1],colorMat[2]);
	},
	stopMove(speed){
		this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,0);
	},
	resumeMove(){
		if(GlobalData.CupConfig.CupMoveDir == 'right'){
			if(this.moveDir == 1){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(this.addSpeed,0);
			}else if(this.moveDir == 2){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-this.addSpeed);
			}else if(this.moveDir == 3){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(-this.addSpeed,0);
			}else if(this.moveDir == 4){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,this.addSpeed);
			}
		}else{
			if(this.moveDir == 1){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(-this.addSpeed,0);
			}else if(this.moveDir == 2){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-this.addSpeed);
			}else if(this.moveDir == 3){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(this.addSpeed,0);
			}else if(this.moveDir == 4){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,this.addSpeed);
			}
		}
	},
	startMove(){
		this.moveDir = 1;
		this.circleNum = 0;
		if(GlobalData.CupConfig.CupMoveDir == 'right'){
			this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(this.addSpeed,0);
		}else{
			this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(-this.addSpeed,0);
		}
	},
	resetStatus(){
		this.rotateFlag = null;
		this.isAbled = true;
		this.touchFloorMusic = false;
		//this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static;
		this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Kinematic;
		this.node.getComponent(cc.RigidBody).gravityScale = 0;
		if(this.node.rotation % 360 != 0){
			this.node.rotation = 0;
		}
		this.setColor(0);
	},
	setPos(width,height,deep,audioManager){
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
			ball.getComponent('ball').fallReset(false);
			ball.getComponent('ball').initLinerDamp(1);
			GlobalData.GameRunTime.ContentBallsDic[ball.uuid] = ball;
		}
		this.cupScoreDic = {};
		this.cupScoreNumDic = {};
		this.balls = {};
		this.resetStatus();
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
		return cc.p(x,y);
	},
	//检查是否反转杯子倒出小球
	checkRotate(){
		var self = this;
		if(util.getDicLength(this.balls) > 0){
			var size = this.node.getContentSize();
			if(GlobalData.CupConfig.CupMoveDir == 'right'){
				if(this.node.x >= -(size.width * 2) && this.node.y >= this.height/2 && this.node.x < 0 && this.rotateFlag == null){
					var tt = (size.width * 2) / this.speed;
					for(var key in this.balls){
						var ball = this.balls[key];
						ball.getComponent('ball').setLinerDamp(0);
					}
					
					var activeEnd = cc.callFunc(function(){
						self.rotateFlag = null;
						self.clearBalls();
						self.updateCircleNum();
					},this);
					this.rotateFlag = this.node.runAction(cc.sequence(cc.rotateBy(tt * 2, 360),activeEnd));
				}
			}else{
				if(this.node.x <= (size.width * 2) && this.node.y >= this.height/2 && this.node.x > 0 && this.rotateFlag == null){
					var tt = (size.width * 2) / this.speed;
					for(var key in this.balls){
						var ball = this.balls[key];
						ball.getComponent('ball').setLinerDamp(0);
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
		if(util.getDicLength(this.balls) <= 0 && this.isAbled == true){
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
	// 只在两个碰撞体开始接触时被调用一次
    onBeginContact: function (contact, selfCollider, otherCollider) {
		//如果 碰撞的 杯口的挡板则球体进入杯子 并取消碰撞效果
		var self = this;
		//如果碰撞瓶盖则代表球进入
		if(otherCollider.tag == GlobalData.RigidBodyTag.ball && selfCollider.tag == GlobalData.RigidBodyTag.cupLine){
			contact.disabled = true;
			if(this.balls[otherCollider.node.uuid] == null){
				var ball = otherCollider.node;
				var ballCom = ball.getComponent('ball');
				ballCom.initLinerDamp(0.5);
				this.balls[otherCollider.node.uuid] = otherCollider.node;
				this.setCupScoreLabel(otherCollider.node);
			}
			return;
		}
		if(otherCollider.tag == GlobalData.RigidBodyTag.ball && selfCollider.tag == GlobalData.RigidBodyTag.cupInner){
			var ball = otherCollider.node;
			var ballCom = ball.getComponent('ball');
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
			this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,0);
			this.scheduleOnce(this.cupRemove,0);
			return;
		}
    },
	setCupScoreLabel(ballNode){
		var self = this;
		var ballCom = ballNode.getComponent('ball');
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
			scoreLabel.setPosition(cc.p(0,size.height/2 + scoreSize.height/2 + 10));
			this.cupScoreNumDic[ballCom.color] = 0;
		}
		//对label 进行定位 level小的 在下面
		var idx = 0;
		for(var i = 0;i < GlobalData.BallConfig.BallColor.length;i++){
			var scoreLabel = this.cupScoreDic[GlobalData.BallConfig.BallColor[i]];
			if(scoreLabel != null){
				var scoreSize = scoreLabel.getContentSize();
				scoreLabel.setPosition(cc.p(0,size.height/2 + (scoreSize.height/2 + 10) * (idx + 1)));
				idx = idx + 1;
			}
		}
		var score = GlobalData.ScoreLevel[ballCom.level] > GlobalData.ScoreLevel[this.level] ? GlobalData.ScoreLevel[ballCom.level]:GlobalData.ScoreLevel[this.level];
		this.cupScoreNumDic[ballCom.color] += score;
		this.totalScore += score;
		this.cupScoreDic[ballCom.color].getComponent(cc.Label).string = '+' + this.cupScoreNumDic[ballCom.color];
		this.EventCustom.setUserData({
			type:'UpdateScore',
			score:score
		});
		this.node.dispatchEvent(this.EventCustom);
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
			this.EventCustom.setUserData({
				type:'UpdateCircle',
				uuid:this.node.uuid
			});
			this.node.dispatchEvent(this.EventCustom);
		}
	},
	cupRemove(){
		var destroyFunc = cc.callFunc(function(){
			this.EventCustom.setUserData({
				type:'CupRemove',
				uuid:this.node.uuid
			});
			this.node.dispatchEvent(this.EventCustom);
		},this);
		if(GlobalData.CupConfig.CupMoveDir == 'left'){
			this.node.runAction(cc.sequence(cc.rotateBy(0.2,30),destroyFunc));
		}else{
			this.node.runAction(cc.sequence(cc.rotateBy(0.2,-30),destroyFunc));
		}
	}
});
