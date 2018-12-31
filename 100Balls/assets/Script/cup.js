cc.Class({
    extends: cc.Component,

    properties: {
		speed:10,
		width:20,
		height:20,
		balls:null,
		myId:0,
		moveDir:0,
		circleNum:0,
		level:0,
		color:null,
		innerNode:cc.Node,
    },
    onLoad () {
		console.log("creat cup start");
		this.balls = {};
		this.level = 0;
		this.totalScore = 0;
		this.initPos = this.node.getPosition();
		this.setColor(this.level);
		this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Kinematic;
		this.EventCustom = new cc.Event.EventCustom("BallFallEvent", true);
		//this.node.getComponent(cc.RigidBody).gravityScale = 10;
		//杯子翻转标志
		this.cupScoreDic = {};
		this.cupScoreNumDic = {};
		this.rotateFlag = null;
	},
	setColor(level){
		this.level = level;
		this.color = GlobalData.CupConfig.CupColor[this.level];
		var colorMat = GlobalData.CupConfig.CupColorDic[this.color];
		this.innerNode.color = new cc.Color(colorMat[0],colorMat[1],colorMat[2]);
	},
	startMove(width,height,speed,addSpeed){
		this.width = width;
		this.height = height;
		this.speed = speed;
		this.addSpeed = addSpeed;
		if(this.myId == 0){
			this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Dynamic;
			this.node.getComponent(cc.RigidBody).gravityScale = 10;	
		}else if(this.myId == 1){
			this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Dynamic;
			this.node.getComponent(cc.RigidBody).gravityScale = 10;
		}
		if(GlobalData.CupConfig.CupMoveDir == 'right'){
			this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(this.addSpeed,0);
		}else{
			this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(-this.addSpeed,0);
		}
		this.moveDir = 1;
		this.circleNum = 0;
	},
	getBallsLength(){
		var length = 0;
		for(let key in this.balls){
			length += 1;
		}
		return length;
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
			GlobalData.GameRunTime.FallBallNum += 1;
			GlobalData.GameRunTime.CupBallsNum[ball.uuid] = ball;
		}
		this.cupScoreDic = {};
		this.cupScoreNumDic = {};
		this.balls = {};
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
	// 只在两个碰撞体开始接触时被调用一次
    onBeginContact: function (contact, selfCollider, otherCollider) {

		//如果 碰撞的 杯口的挡板则球体进入杯子 并取消碰撞效果
		var self = this;
		if(otherCollider.tag == GlobalData.RigidBodyTag.ball && selfCollider.tag == GlobalData.RigidBodyTag.cupLine){
			this.balls[otherCollider.node.uuid] = otherCollider.node;
			this.setCupScoreLabel(otherCollider.node);
			contact.disabled = true;
			return;
		}
		if(otherCollider.tag == GlobalData.RigidBodyTag.ball && selfCollider.tag == GlobalData.RigidBodyTag.cup){
			return;
		}
		if(otherCollider.tag == GlobalData.RigidBodyTag.floor){
			//contact.disabled = true;
			var destroyFunc = cc.callFunc(function(){
				self.EventCustom.setUserData({
					type:'CupRemove'
				});
				self.node.dispatchEvent(self.EventCustom);
				self.node.removeFromParent();
				self.node.destroy();
			},this);
			if(GlobalData.CupConfig.CupMoveDir == 'left'){
				this.node.runAction(cc.sequence(cc.rotateBy(0.2,30),destroyFunc));
			}else{
				this.node.runAction(cc.sequence(cc.rotateBy(0.2,-30),destroyFunc));
			}
			return;
		}
		if(otherCollider.tag == GlobalData.RigidBodyTag.startLeft || otherCollider.tag == GlobalData.RigidBodyTag.startRight){
			contact.disabled = true;
			if(GlobalData.CupConfig.CupMoveDir == 'right' && otherCollider.tag == GlobalData.RigidBodyTag.startLeft){
				if(this.rotateFlag != null && this.rotateFlag.isDone() == false){
					return;
				}
				console.log('onBeginContact touch rotate right');
				//打开瓶盖
				var physicsChainColliders = this.node.getComponents(cc.PhysicsChainCollider);
				for(var i = 0;i < physicsChainColliders.length;i++){
					if(physicsChainColliders[i].tag == GlobalData.RigidBodyTag.cupLine){
						physicsChainColliders[i].enabled = false;
						break;
					}
				}
				var activeEnd = cc.callFunc(function(){
					for(var i = 0;i < physicsChainColliders.length;i++){
						if(physicsChainColliders[i].tag == GlobalData.RigidBodyTag.cupLine){
							physicsChainColliders[i].enabled = true;
							break;
						}
					}
				},this);
				this.rotateFlag = this.node.runAction(cc.sequence(cc.rotateBy(2, 360),activeEnd));
				this.clearBalls();
				this.updateCircleNum();
			}
			if(GlobalData.CupConfig.CupMoveDir == 'left' && otherCollider.tag == GlobalData.RigidBodyTag.startRight){
				if(this.rotateFlag != null && this.rotateFlag.isDone() == false){
					return;
				}
				console.log('onBeginContact touch rotate left');
				//打开瓶盖
				var physicsChainColliders = this.node.getComponents(cc.PhysicsChainCollider);
				for(var i = 0;i < physicsChainColliders.length;i++){
					if(physicsChainColliders[i].tag == GlobalData.RigidBodyTag.cupLine){
						physicsChainColliders[i].enabled = false;
						break;
					}
				}
				var activeEnd = cc.callFunc(function(){
					for(var i = 0;i < physicsChainColliders.length;i++){
						if(physicsChainColliders[i].tag == GlobalData.RigidBodyTag.cupLine){
							physicsChainColliders[i].enabled = true;
							break;
						}
					}
				},this);
				this.rotateFlag = this.node.runAction(cc.sequence(cc.rotateBy(2, -360),activeEnd));
				this.clearBalls();
				this.updateCircleNum();
			}
			return;
		}
		//console.log('onBeginContact');
    },

    // 只在两个碰撞体结束接触时被调用一次
    onEndContact: function (contact, selfCollider, otherCollider) {
    },

    // 每次将要处理碰撞体接触逻辑时被调用
    onPreSolve: function (contact, selfCollider, otherCollider) {
		
    },

    // 每次处理完碰撞体接触逻辑时被调用
    onPostSolve: function (contact, selfCollider, otherCollider) {
    },
	setCupScoreLabel(ballNode){
		var self = this;
		var ballCom = ballNode.getComponent('ball');
		if(this.level > ballCom.level){
			ballCom.setColor(this.level);
		}
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
	update(dt){
		//杯子运动轨迹控制		
		this.node.getComponent(cc.RigidBody).syncPosition();
		if(GlobalData.CupConfig.CupMoveDir == 'right'){
			if(this.node.x >= this.width/2 && this.moveDir == 1){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-this.addSpeed);
				this.moveDir = 2;
			}
			//如果是第二个杯子则提前控制减速
			if(this.moveDir == 2 && this.node.y <= 0 && this.myId == 1){
				this.addSpeed = this.speed;
				this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Kinematic;
				this.node.getComponent(cc.RigidBody).linearDamping = 0;
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-this.addSpeed);
			}
			var size = this.node.getContentSize();
			if(this.moveDir == 2 && this.node.y <= (size.height - this.height/2) && this.myId == 0){
				this.addSpeed = this.speed;
				this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Kinematic;
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-this.addSpeed);
			}
			
			if(this.moveDir == 2 && this.node.y <= -this.height/2){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(-this.addSpeed,0);
				this.moveDir = 3;
			}
			if(this.moveDir == 3 && this.node.x <= -this.width/2){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,this.addSpeed);
				this.moveDir = 4;
			}
			if(this.moveDir == 4 && this.node.y >= this.height/2){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(this.addSpeed,0);
				this.moveDir = 1;
			}
		}
		else{
			if(this.node.x <= -this.width/2 && this.moveDir == 1){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-this.addSpeed);
				this.moveDir = 2;
			}
			//如果是第二个杯子则提前控制减速
			if(this.moveDir == 2 && this.node.y <= 0 && this.myId == 1){
				this.addSpeed = this.speed;
				this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Kinematic;
				this.node.getComponent(cc.RigidBody).linearDamping = 0;
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-this.addSpeed);
			}
			var size = this.node.getContentSize();
			if(this.moveDir == 2 && this.node.y <= (size.height - this.height/2) && this.myId == 0){
				this.addSpeed = this.speed;
				this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Kinematic;
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-this.addSpeed);
			}
			
			if(this.moveDir == 2 && this.node.y <= -this.height/2){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(this.addSpeed,0);
				this.moveDir = 3;
			}
			if(this.moveDir == 3 && this.node.x >= this.width/2){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,this.addSpeed);
				this.moveDir = 4;
			}
			if(this.moveDir == 4 && this.node.y >= this.height/2){
				this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(-this.addSpeed,0);
				this.moveDir = 1;
			}
		}
		
		if(this.getBallsLength() <= 0){
			//如果没有接住球体则需要销毁
			var size = this.node.getContentSize();
			if(GlobalData.CupConfig.CupMoveDir == 'right'){
				if(this.node.y >= (size.height - this.height/2) && (this.node.x + this.width/2 <= 0) && this.moveDir == 4){
					this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Dynamic;
					this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-this.addSpeed);
					this.node.getComponent(cc.RigidBody).gravityScale = 10;
				}
			}else{
				if(this.node.y >= (size.height - this.height/2) && (this.node.x - this.width/2 >= 0) && this.moveDir == 4){
					this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Dynamic;
					this.node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-this.addSpeed);
					this.node.getComponent(cc.RigidBody).gravityScale = 10;
				}
			}
		}
	}
});
