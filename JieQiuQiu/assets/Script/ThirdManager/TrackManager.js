var util = require('util');
cc.Class({
    extends: cc.Component,

    properties: {
		idxArray:null,
		speedArray:null,
    },
	initTrack(){
		this.idxArray = new Array();
		this.speedArray = new Array();
		var trickSize = this.node.getContentSize();
		var AnimRigidCup = GlobalData.GameRunTime.CupNodesPool.get();
		if(AnimRigidCup == null){
			AnimRigidCup = cc.instantiate(GlobalData.assets['AnimChainCup']);
		}
		var cupSize = AnimRigidCup.getContentSize();
		GlobalData.GameRunTime.CupNodesPool.put(AnimRigidCup);
		GlobalData.GameInfoConfig.addCupNum = 0;
		//计算杯子出现的位置
		for(var i = 0;i < GlobalData.CupConfig.CupCreatNum;i++){
			if(GlobalData.CupConfig.CupMoveDir == 'right'){
				if(i == 0){
					var yy = (trickSize.height/2 - cupSize.height) * -1;
					var xx = trickSize.width/2;
					this.idxArray.push(cc.v2(xx,yy));
				}else{
					var yy = cupSize.height;
					var xx = trickSize.width/2;
					this.idxArray.push(cc.v2(xx,yy));
				}
			}else{
				if(i == 0){
					var yy = (trickSize.height/2 - cupSize.height) * -1;
					var xx = -trickSize.width/2;
					this.idxArray.push(cc.v2(xx,yy));
				}else{
					var yy = cupSize.height;
					var xx = -trickSize.width/2;
					this.idxArray.push(cc.v2(xx,yy));
				}
			}
			//this.speedArray.push(GlobalData.CupConfig.CupMoveSpeed);
			if(i == 0){
				this.speedArray.push(GlobalData.CupConfig.CupMoveASpeed/2);
			}else if(i == 1){
				this.speedArray.push(GlobalData.CupConfig.CupMoveASpeed/4);
			}else{
				this.speedArray.push(GlobalData.CupConfig.CupMoveSpeed);
			}
		}
		console.log('initTrack',GlobalData.GameRunTime.CupNodesPool.size(),this.idxArray);
	},
	startTrack(){
		this.initTrack();
		var trickSize = this.node.getContentSize();
		if(GlobalData.GameRunTime.CupNodesPool.size() > 0){
			console.log('startTrack',GlobalData.CupConfig.CupMoveDir);
			var cupNode = GlobalData.GameRunTime.CupNodesPool.get();
			if(GlobalData.CupConfig.CupMoveDir == 'right'){
				cupNode.setPosition(cc.v2(169,331));
			}else{
				cupNode.setPosition(cc.v2(-169,331));
			}
			this.node.addChild(cupNode);
			
			var cupCom = cupNode.getComponent('AnimRigidCup');
			cupCom.initData(
				trickSize.width,
				trickSize.height,
				GlobalData.GameInfoConfig.addCupNum,
				GlobalData.CupConfig.CupMoveSpeed,
				this.speedArray[GlobalData.GameInfoConfig.addCupNum]);
			
			GlobalData.GameRunTime.CupNodesDic[cupNode.uuid] = cupNode;
			GlobalData.GameRunTime.CupAbledNum += 1;
			cupCom.startMove(this.idxArray);
		}
	},
	stopTrack(){
		for(var key in GlobalData.GameRunTime.CupNodesDic){
			var cupNode = GlobalData.GameRunTime.CupNodesDic[key];
			if(cupNode != null){
				var cupCom = cupNode.getComponent('AnimRigidCup');
				cupCom.stopMove();
			}
		}
	},
	continueTrack(){
		//this.schedule(this.updateMove,0.01);
		for(var key in GlobalData.GameRunTime.CupNodesDic){
			var cupNode = GlobalData.GameRunTime.CupNodesDic[key];
			if(cupNode != null){
				var cupCom = cupNode.getComponent('AnimRigidCup');
				cupCom.resumeMove();
			}
		}
	},
	removeAllCups(){
		for(var key in GlobalData.GameRunTime.CupNodesDic){
			var cupNode = GlobalData.GameRunTime.CupNodesDic[key];
			if(cupNode != null){
				var cupCom = cupNode.getComponent('AnimRigidCup');
				cupCom.resetStatus(true);
				GlobalData.GameRunTime.CupNodesPool.put(cupNode);
			}
		}
		GlobalData.GameRunTime.CupNodesDic = {};
	},
	//开始阶段 一个杯子一个杯子添加
	addStartCup(){
		var trickSize = this.node.getContentSize();
		var cupNode = null;
		if(GlobalData.GameRunTime.CupNodesPool.size() > 0){
			cupNode = GlobalData.GameRunTime.CupNodesPool.get();
		}else{
			cupNode = cc.instantiate(GlobalData.assets['AnimChainCup']);
		}
		var cupCom = cupNode.getComponent('AnimRigidCup');
		this.node.addChild(cupNode);
		if(GlobalData.CupConfig.CupMoveDir == 'right'){
			cupNode.setPosition(cc.v2(169,331));
		}else{
			cupNode.setPosition(cc.v2(-169,331));
		}
		cupCom.initData(
			trickSize.width,
			trickSize.height,
			GlobalData.GameInfoConfig.addCupNum,
			GlobalData.CupConfig.CupMoveSpeed,
			this.speedArray[GlobalData.GameInfoConfig.addCupNum]);
		GlobalData.GameRunTime.CupNodesDic[cupNode.uuid] = cupNode;
		GlobalData.GameRunTime.CupAbledNum += 1;
		cupCom.startMove(this.idxArray);
	},
	updateCircle(){
		var self = this;
		var trickNodeSize = this.node.getContentSize();
		//动画速度 0.1s/100m
		var time = (trickNodeSize.width/2 + 100)/GlobalData.GameRunTime.CurrentSpeed;
		
		if(GlobalData.GameRunTime.CircleLevel % GlobalData.BallConfig.BallUpLevel == 0){
			setTimeout(function(){
				let UpLevelIsValid = new Array();
				for(let key in GlobalData.GameRunTime.ContentBallsDic){
					let ball = GlobalData.GameRunTime.ContentBallsDic[key];
					if(ball != null && ball.isValid){
						let ballCom = ball.getComponent('RigidBall');
						if(ballCom.isInCup == false){
							UpLevelIsValid.push(ball);
						}
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
				self.upLevelCup(true);
			},time);
		}
		var sbaFlag = GlobalData.GameRunTime.CircleLevel % GlobalData.cdnGameConfig.PropSBAFlag;
		if(sbaFlag == 0){
			setTimeout(function(){
				self.addSBACup();
			},time);
		}
	},
	upLevelCup(flag){
		let UpLevelIsValid = new Array();
		for(let key in GlobalData.GameRunTime.CupNodesDic){
			let cup = GlobalData.GameRunTime.CupNodesDic[key];
			if(cup != null && cup.isValid){
				var cupCom = cup.getComponent('AnimRigidCup');
				if(flag == true){
					//设置速度升级
					cupCom.syncSpeed(GlobalData.GameRunTime.CurrentSpeed);
				}
				if(cupCom.UpLevelIsValid()){
					UpLevelIsValid.push(cup);
				}
			}
		}
		let CupNode = util.getRandomObjForArray(UpLevelIsValid);
		if(CupNode != -1){
			let cupCom = CupNode.getComponent('AnimRigidCup');
			if(cupCom.level < (GlobalData.CupConfig.CupColor.length - 1)){
				GlobalData.game.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.CupLevelBell);
				this.swapAction('PropUpLevel',CupNode);
				//cupCom.setColor(cupCom.level + 1);
				if(flag == false){
					GlobalData.GamePropParam.useNum['PropUpLevel'] += 1;
				}
			}
		}
	},
	addSBACup(){
		let UpLevelIsValid = new Array();
		for(let key in GlobalData.GameRunTime.CupNodesDic){
			let cup = GlobalData.GameRunTime.CupNodesDic[key];
			if(cup != null && cup.isValid){
				let cupCom = cup.getComponent('AnimRigidCup');
				if(cupCom.UpLevelIsValid()){
					UpLevelIsValid.push(cup);
				}
			}
		}
		let CupNode = util.getRandomObjForArray(UpLevelIsValid);
		if(CupNode != -1){
			var sbaNode = cc.instantiate(GlobalData.assets['PropSBA']);
			CupNode.addChild(sbaNode);
			sbaNode.setPosition(cc.v2(0,0));
			CupNode.getComponent('AnimRigidCup').hasSBA = 1;
			//this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.CupLevelBell);
			//GlobalData.GamePropParam.useNum['PropBig'] += 1;
		}
	},
	bigOneCup(flag = false){
		let UpLevelIsValid = new Array();
		for(let key in GlobalData.GameRunTime.CupNodesDic){
			let cup = GlobalData.GameRunTime.CupNodesDic[key];
			if(cup != null && cup.isValid){
				let cupCom = cup.getComponent('AnimRigidCup');
				if(cupCom.UpLevelIsValid()){
					UpLevelIsValid.push(cup);
				}
			}
		}
		let CupNode = util.getRandomObjForArray(UpLevelIsValid);
		if(CupNode != -1){
			this.swapAction('PropBig',CupNode);
			//CupNode.scaleX *= (1 + GlobalData.CupConfig.CupBigRate);
			//CupNode.scaleY *= (1 + GlobalData.CupConfig.CupBigRate);
			this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.CupLevelBell);
			if(flag == false){
				GlobalData.GamePropParam.useNum['PropBig'] += 1;
			}
		}
	},
	swapAction(type,node){
		if(type == 'PropBig'){
			var scale = node.scale;
			var bigScale = scale * (1 + GlobalData.CupConfig.CupBigRate);
			node.runAction(cc.sequence(
				cc.scaleTo(0.1,bigScale),
				cc.scaleTo(0.1,scale),
				cc.scaleTo(0.1,bigScale)
			));
		}else if(type == 'PropUpLevel'){
			let cupCom = node.getComponent('AnimRigidCup');
			var cupLevel = cupCom.level;
			var setColorFunc = cc.callFunc(function(){
				cupCom.setColor(cupLevel);
			},this);
			var setColorNextFunc = cc.callFunc(function(){
				cupCom.setColor(cupLevel + 1);
			},this);
			node.runAction(cc.sequence(
				cc.delayTime(0.1),
				setColorNextFunc,
				cc.delayTime(0.1),
				setColorFunc,
				cc.delayTime(0.1),
				setColorNextFunc
			));
		}
	}
});
