var ThirdAPI = require('ThirdAPI');
var BoxFactory = require('BoxFactory');
var CupFactory = require('CupFactory');
var PropManager = require('PropManager');
var util = require('util');
cc.Class({
    extends: cc.Component,

    properties: {
		state:0,
		balls:null,
		checkFlag:0,
		circleNum:0,
		level:0,
		size:null,
		ballNum:0,
		color:null,
		hasSBA:0,
    },
    onLoad () {
		if(this.rigidBody == null){
			this.userData = {
				name:this.node.uuid,
				type:GlobalData.RigidBodyTag.cup,node:this.node,
				id:GlobalData.GameInfoConfig.addCupNum
			};
			this.rigidBody = BoxFactory.CreatCup(this.userData,this.node.getPosition());
			let fdata = {
				name:this.node.uuid,
				type:GlobalData.RigidBodyTag.cupFallLine,node:this.node
			};
			this.topBody = BoxFactory.CreatCupFallLine(fdata,this.node.getPosition());
		}
		this.size = this.node.getContentSize();
		this.onReset();
	},
	onReset(){
		this.level = 0;
		this.ballNum = 0;
		this.hasSBA = 0;
		this.circleNum = 0;
		this.cupScoreDic = {};
		this.cupScoreNumDic = {};
		this.setColor(this.level);
		this.node.angle = 0;
		var sbaNode = this.node.getChildByName('PropSBA');
		if(sbaNode != null){
			sbaNode.removeFromParent();
			sbaNode.destroy();
		}
		for(var key in this.balls){
			let ball = this.balls[key][0];
			GlobalData.GameRunTime.BaseBallPool.put(ball);
		}
		this.balls = {};
	},
	onStart: function(road_set) {
		this.cur_road = road_set;
		if (this.cur_road < 2) {
			return;
		}
		var pos = this.cur_road[0];
		this.node.setPosition(pos);
		this.walk_to_next = 1;
		this.state = 0;//开始移动
		this.start_walk();
	},
	start_walk: function() {
		if (this.walk_to_next >= this.cur_road.length) {
			//运行了一圈了 继续之前的操作
			this.walk_to_next = 1;
			this.updateCircleNum();
		}
        var src = this.node.getPosition();
        var dst = this.cur_road[this.walk_to_next];
        var dir = dst.sub(src);
        var len = dir.mag();
        this.vx = GlobalData.GameRunTime.CurrentSpeed * dir.x / len;
        this.vy = GlobalData.GameRunTime.CurrentSpeed * dir.y / len;
        this.walk_total_time = len / GlobalData.GameRunTime.CurrentSpeed;
        this.walked_time = 0;
	},
	walk_update: function(dt) {
        this.walked_time += dt;
        if (this.walked_time > this.walk_total_time) {
            dt -= (this.walked_time - this.walk_total_time);
        }
        var sx = this.vx * dt;
        var sy = this.vy * dt;
        this.node.x += sx;
        this.node.y += sy;
        if (this.walked_time >= this.walk_total_time) {
            this.walk_to_next++;
            this.start_walk();
        }
    },
	update: function(dt) {
		if(this.state == 0){
			this.walk_update(dt);
			if(this.rigidBody != null){
				this.rigidBody.SetTransformXY(
					(this.node.x + cc.winSize.width/2) / BoxFactory._ptmRadio,
					(this.node.y + cc.winSize.height/2 + CupFactory._offset) / BoxFactory._ptmRadio,
					this.node.angle/180 * Math.PI
				);
				this.topBody.SetTransformXY(
					(this.node.x + cc.winSize.width/2) / BoxFactory._ptmRadio,
					(this.node.y + cc.winSize.height/2 + CupFactory._offset) / BoxFactory._ptmRadio,
					this.node.angle/180 * Math.PI
				);
			}
			if(this.walk_to_next == 25 && this.checkFlag == 0){
				if(this.userData.id == GlobalData.GameInfoConfig.addCupNum 
					&& GlobalData.GameInfoConfig.addCupNum < GlobalData.CupConfig.CupCreatNum){	
						var cup = CupFactory.creatCup(this.cur_road[0]);
						cup.getComponent('RigidCup').onStart(this.cur_road);
				}
				this.checkFlag = 1;
				return;
			}
			//console.log(this.node.uuid,this.checkFlag);
			if(this.walk_to_next == 83 && this.checkFlag == 1){
				this.checkFlag = 2;
				if(this.ballNum <= 0){
					this.state = 1;//不在进行移动操作
					BoxFactory.RemoveBody(this.rigidBody);
					BoxFactory.RemoveBody(this.topBody);
					this.rigidBody = null;
					cc.tween(this.node)
						.to(0.5, { position: cc.v2(-269, -440)})
						.to(0.2, { angle: 30 })
						.call(()=>{
							GlobalData.game.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.CupTouchFloor);
							GlobalData.GameRunTime.CupAbledNum -= 1;
							GlobalData.GameRunTime.CupNodesDic[this.node.uuid] = null;
							GlobalData.game.mainGame.getComponent('MainGame').finishGame();
							this.node.removeFromParent();
							this.node.destroy();
						}).start()
				}
				return;
			}
			if(this.walk_to_next == 117 && this.checkFlag == 2){
				this.checkFlag = 3;
				let tt = CupFactory._tsize.width / GlobalData.GameRunTime.CurrentSpeed;
				this.topBody.SetActive(false);
				cc.tween(this.node)
					.to(tt/2, { angle: -180 })
					.call(()=>{
						//把假的球球换成真的
						this.splitOutBall();
					})
					.to(tt/2, { angle: -360 })
					.call(()=>{
						this.checkFlag = 1;
						this.node.angle = 0;
						this.topBody.SetActive(true);
					}).start()
			}
		}
	},
	setColor(level){
		this.level = level;
		this.color = GlobalData.CupConfig.CupColor[this.level];
		var colorMat = GlobalData.CupConfig.CupColorDic[this.color];
		this.node.color = new cc.Color(colorMat[0],colorMat[1],colorMat[2]);
	},
	//把杯子中的小球吐出
	splitOutBall(){
		for(var key in this.balls){
			let ball = this.balls[key][0];
			let level = this.balls[key][1];
			this.scheduleOnce(()=>{
				let rigidBall = GlobalData.GameRunTime.BallNodesPool.get();
				if(rigidBall == null){
					rigidBall = cc.instantiate(GlobalData.assets['RigidBaseBall']);
				}
				let rigidBallCom = rigidBall.getComponent('RigidBall');
				rigidBallCom.setColor(level);
				let pos = util.getPosFromNode(this.node,GlobalData.game.mainGame);
				rigidBall.setPosition(cc.v2(pos.x,pos.y - this.size.height/2));
				GlobalData.game.mainGame.addChild(rigidBall);
				GlobalData.GameRunTime.BaseBallPool.put(ball);
				GlobalData.GameRunTime.ContentBallsDic[rigidBall.uuid] = rigidBall;
			},this.ballNum * 0.01);
			this.ballNum -= 1;
		}
		this.ballNum = 0;
		this.balls = {};
		this.cupScoreDic = {};
		this.cupScoreNumDic = {};
	},
	eatBall(ball){
		//杯子容量超过值 直接退出
		var ballCom = ball.node.getComponent('RigidBall');
		this.openSba();
		if(this.ballNum < GlobalData.CupConfig.BallInCupPos.length){
			let pos = GlobalData.CupConfig.BallInCupPos[this.ballNum];
			var jball = GlobalData.GameRunTime.BaseBallPool.get();
			if(jball == null){
				jball = cc.instantiate(GlobalData.assets['BaseBall']);
			}
			if(this.level > ballCom.level){
				ballCom.setColor(this.level);
			}
			jball.color = ball.node.color.clone();
			jball.setPosition(cc.v2(pos[0],pos[1]));
			this.node.addChild(jball);
			//保存数据
			this.ballNum += 1;
			this.balls[jball.uuid] = [jball,ballCom.level];
			this.setCupScoreLabel(ballCom.level);
		}else{
			GlobalData.game.mainGame.getComponent('MainGame').fallOneBall();
		}
		GlobalData.GameRunTime.ContentBallsDic[ball.name] = null;
		ballCom.removeTrue(false);
	},
	//杯子停止运动
	stopMove(){
		//停止移动
		this.state = 1;
		this.node.pauseAllActions();
	},
	resumeMove(){
		this.state = 0;
		this.node.resumeAllActions();
	},
	removeMySelf(){
		if(this.rigidBody != null){
			BoxFactory.RemoveBody(this.rigidBody);
		}
		if(this.topBody != null){
			BoxFactory.RemoveBody(this.topBody);
		}
		this.node.removeFromParent();
		this.node.destroy();
	},
	UpLevelIsValid(){
		if(this.ballNum > 0){
			return false;
		}
		if(this.walk_to_next >= 5 && this.walk_to_next <= 50){
			return true;
		}
		return false;
	},
	openSba(){
		//杯子中有宝箱 打开它把有惊喜也许
		if(this.hasSBA == 1){
			var propSba = PropManager.getSBA();
			if(propSba != null){
				var split = propSba.split('_');
				if(split.length == 2){
					CupFactory.stopTrack();
					GlobalData.game.propGame.getComponent('PropGame').initLoad(split[0],split[1]);
				}
			}
			var sbaNode = this.node.getChildByName('PropSBA');
			sbaNode.removeFromParent();
			sbaNode.destroy();
			this.hasSBA = 0;
		}
	},
	setCupScoreLabel(level){
		let runFlag = false;
		if(this.cupScoreDic[level] == null){
			var scoreLabel = GlobalData.GameRunTime.UpScorePool.get();
			if(scoreLabel == null){
				scoreLabel = cc.instantiate(GlobalData.assets['CupScore']);
			}
			let color = GlobalData.BallConfig.BallColor[level];
			var colorMat = GlobalData.BallConfig.BallColorDic[color];
			scoreLabel.color = new cc.Color(colorMat[0],colorMat[1],colorMat[2]);
			var scoreSize = scoreLabel.getContentSize();
			this.cupScoreDic[level] = scoreLabel;
			this.node.addChild(scoreLabel);
			scoreLabel.setPosition(cc.v2(0,this.size.height/2 + scoreSize.height/2 + 10));
			this.cupScoreNumDic[level] = 0;
		
			//对label 进行定位 level小的 在下面
			var idx = 0;
			for(var i = 0;i < GlobalData.BallConfig.BallColor.length;i++){
				var scoreLabel = this.cupScoreDic[i];
				if(scoreLabel != null){
					var scoreSize = scoreLabel.getContentSize();
					scoreLabel.setPosition(cc.v2(0,this.size.height/2 + (scoreSize.height/2 + 10) * (idx + 1)));
					idx = idx + 1;
				}
			}
			runFlag = true;
		}
		var score = GlobalData.ScoreLevel[level] > GlobalData.ScoreLevel[this.level] ? GlobalData.ScoreLevel[level]:GlobalData.ScoreLevel[this.level];
		this.cupScoreNumDic[level] += score;
		this.cupScoreDic[level].getComponent(cc.Label).string = '+' + this.cupScoreNumDic[level];
		GlobalData.GameRunTime.TotalScore += score;
		if(GlobalData.GameRunTime.TotalScore > GlobalData.GameInfoConfig.maxScore){
			GlobalData.GameInfoConfig.maxScore = GlobalData.GameRunTime.TotalScore;
			GlobalData.GameInfoConfig.maxLevel = GlobalData.GameRunTime.CircleLevel;
			ThirdAPI.updataGameInfo();
		}
		if(runFlag == true){
			this.cupScoreDic[level].runAction(cc.sequence(cc.fadeIn(0.1),cc.fadeOut(1.5),cc.callFunc(()=>{
				if(this.cupScoreDic[level] != null){
					GlobalData.GameRunTime.UpScorePool.put(this.cupScoreDic[level]);
					this.cupScoreDic[level] = null;
				}
			},this)));
		}
	},
	updateCircleNum(){
		this.circleNum += 1;
		//如果当前杯子的圈数大于游戏的圈数则进行判断是否更新圈数
		if(this.circleNum > GlobalData.GameRunTime.CircleLevel){
			//递进的方式处理圈数，避免总是一个杯子控制圈数，每个杯子都有一次机会
			let uid = GlobalData.GameRunTime.CircleLevel % GlobalData.GameRunTime.CupAbledNum;
			for(let key in GlobalData.GameRunTime.CupNodesDic){
				let cup = GlobalData.GameRunTime.CupNodesDic[key];
				if(cup == null){
					continue;
				}
				if(uid == 0){
					if(cup.uuid == this.node.uuid){
						GlobalData.GameRunTime.CircleLevel += 1;
						GlobalData.game.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.LevelBell);
						CupFactory.updateCircle();
					}
					break;
				}
				uid = uid - 1;
			}
		}
	}
});