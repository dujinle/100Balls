var EventManager = require('EventManager');
var util = require('util');
cc.Class({
    extends: cc.Component,

    properties: {
		idxArray:null,
		speedArray:null,
		rigidCupPool:null,
		audioManager:null,
    },
	onLoad(){
		this.idxArray = new Array();
		this.speedArray = new Array();
		this.rigidCupPool = new cc.NodePool();
		EventManager.onCup(this.eventFunc,this);
	},
	initTrack(audioManager){
		var cupSize = null;
		this.audioManager = audioManager;
		GlobalData.GameInfoConfig.addCupNum = 0;
		var trickSize = this.node.getContentSize();
		for(var i = 0;i < 1;i++){
			var AnimRigidCup = cc.instantiate(GlobalData.assets['AnimChainCup']);
			//var AnimRigidCup = cc.instantiate(GlobalData.assets['ChainCup']);
			cupSize = AnimRigidCup.getContentSize();
			this.rigidCupPool.put(AnimRigidCup);
		}
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
			if(i == 0){
				this.speedArray.push(GlobalData.CupConfig.CupMoveASpeed);
			}else if(i == 1){
				this.speedArray.push(GlobalData.CupConfig.CupMoveASpeed/4);
			}else{
				this.speedArray.push(GlobalData.CupConfig.CupMoveSpeed);
			}
		}
		console.log('initTrack',this.rigidCupPool,this.idxArray);
	},
	startTrack(){
		var trickSize = this.node.getContentSize();
		if(this.rigidCupPool.size() > 0){
			var cupNode = null;
			if(this.rigidCupPool.size() > 0){
				cupNode = this.rigidCupPool.get();
			}else{
				cupNode = cc.instantiate(GlobalData.assets['AnimChainCup']);
				//cupNode = cc.instantiate(GlobalData.assets['ChainCup']);
			}
			this.node.addChild(cupNode);
			if(GlobalData.CupConfig.CupMoveDir == 'right'){
				cupNode.setPosition(cc.v2(169,362));
			}else{
				cupNode.setPosition(cc.v2(-169,362));
			}
			//console.log(cupNode.getPosition());
			//var cupCom = cupNode.getComponent('AnimRigidCup');
			var cupCom = cupNode.getComponent('AnimRigidCup');
			cupCom.initData(
				trickSize.width,
				trickSize.height,
				GlobalData.GameInfoConfig.addCupNum,
				GlobalData.CupConfig.CupMoveSpeed,
				this.speedArray[GlobalData.GameInfoConfig.addCupNum],
				this.audioManager);
			
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
				this.rigidCupPool.put(cupNode);
				var cupCom = cupNode.getComponent('AnimRigidCup');
				cupCom.resetStatus(true);
			}
		}
		console.log('stopTrack :',this.rigidCupPool.size());
	},
	removeCup(uuid){
		var cupNode = GlobalData.GameRunTime.CupNodesDic[uuid];
		console.log('remove cup',cupNode.uuid,this.rigidCupPool.size());
		if(cupNode != null){
			var cupCom = cupNode.getComponent('AnimRigidCup');
			cupCom.resetStatus(true);
			this.rigidCupPool.put(cupNode);
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
				this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.CupLevelBell);
				cupCom.setColor(cupCom.level + 1);
				if(flag == false){
					GlobalData.GamePropParam.useNum['PropUpLevel'] -= 1;
				}
			}
		}
	},
	bigOneCup(){
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
			CupNode.scaleX *= (1 + GlobalData.CupConfig.CupSpeedArate);
			this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.CupLevelBell);
			GlobalData.GamePropParam.useNum['PropBig'] -= 1;
		}
	},
	eventFunc(data){
		console.log(data);
		if(data.type == 'AddCup'){
			var trickSize = this.node.getContentSize();
			var cupNode = null;
			if(this.rigidCupPool.size() > 0){
				cupNode = this.rigidCupPool.get();
			}else{
				//cupNode = cc.instantiate(GlobalData.assets['ChainCup']);
				cupNode = cc.instantiate(GlobalData.assets['AnimChainCup']);
			}
			var cupCom = cupNode.getComponent('AnimRigidCup');
			this.node.addChild(cupNode);
			if(GlobalData.CupConfig.CupMoveDir == 'right'){
				cupNode.setPosition(cc.v2(169,362));
			}else{
				cupNode.setPosition(cc.v2(-169,362));
			}
			cupCom.initData(
				trickSize.width,
				trickSize.height,
				GlobalData.GameInfoConfig.addCupNum,
				GlobalData.CupConfig.CupMoveSpeed,
				this.speedArray[GlobalData.GameInfoConfig.addCupNum],
				this.audioManager);
			GlobalData.GameRunTime.CupNodesDic[cupNode.uuid] = cupNode;
			GlobalData.GameRunTime.CupAbledNum += 1;
			cupCom.startMove(this.idxArray);
		}
	},
});
