var EventManager = require('EventManager');
cc.Class({
    extends: cc.Component,

    properties: {
		curCupIdx:0,
		idxArray:null,
		rigidCupPool:null,
		audioManager:null,
    },
	onLoad(){
		this.idxArray = new Array();
		this.rigidCupPool = new cc.NodePool();
		EventManager.onCup(this.eventFunc,this);
	},
	initTrack(audioManager){
		var cupSize = null;
		this.audioManager = audioManager;
		GlobalData.GameInfoConfig.addCupNum = 0;
		var trickSize = this.node.getContentSize();
		for(var i = 0;i < 1;i++){
			var rigidCup = cc.instantiate(GlobalData.assets['ChainCup']);
			cupSize = rigidCup.getContentSize();
			this.rigidCupPool.put(rigidCup);
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
				cupNode = cc.instantiate(GlobalData.assets['ChainCup']);
			}
			var cupCom = cupNode.getComponent('RigidCup');
			this.node.addChild(cupNode);
			cupCom.initData(
				trickSize.width,
				trickSize.height,
				GlobalData.GameInfoConfig.addCupNum,
				this.audioManager);
			GlobalData.GameRunTime.CupNodesDic[cupNode.uuid] = cupNode;
			GlobalData.GameRunTime.CupAbledNum += 1;
			cupCom.speed = GlobalData.CupConfig.CupMoveSpeed;
			cupCom.addSpeed = GlobalData.CupConfig.CupMoveASpeed;
			cupCom.startMove(this.idxArray);
			//this.schedule(this.updateMove,0.01);
			//this.schedule(this.updateMoveV2,0.02);
		}
	},
	stopTrack(){
		for(var key in GlobalData.GameRunTime.CupNodesDic){
			var cupNode = GlobalData.GameRunTime.CupNodesDic[key];
			if(cupNode != null){
				var cupCom = cupNode.getComponent('RigidCup');
				cupCom.stopMove();
			}
		}
	},
	continueTrack(){
		//this.schedule(this.updateMove,0.01);
		for(var key in GlobalData.GameRunTime.CupNodesDic){
			var cupNode = GlobalData.GameRunTime.CupNodesDic[key];
			if(cupNode != null){
				var cupCom = cupNode.getComponent('RigidCup');
				cupCom.resumeMove();
			}
		}
		this.schedule(this.updateMoveV2,0.02);
	},
	removeAllCups(){
		this.curCupIdx = 0;
		for(var key in GlobalData.GameRunTime.CupNodesDic){
			var cupNode = GlobalData.GameRunTime.CupNodesDic[key];
			if(cupNode != null){
				this.rigidCupPool.put(cupNode);
				var cupCom = cupNode.getComponent('RigidCup');
				cupCom.resetStatus(true);
			}
		}
		console.log('stopTrack :',this.rigidCupPool.size());
	},
	removeCup(uuid){
		var cupNode = GlobalData.GameRunTime.CupNodesDic[uuid];
		console.log('remove cup',cupNode.uuid,this.rigidCupPool.size());
		if(cupNode != null){
			this.rigidCupPool.put(cupNode);
			var cupCom = cupNode.getComponent('RigidCup');
			cupCom.resetStatus(true);
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
				cupNode = cc.instantiate(GlobalData.assets['ChainCup']);
			}
			var cupCom = cupNode.getComponent('RigidCup');
			this.node.addChild(cupNode);
			cupCom.initData(
				trickSize.width,
				trickSize.height,
				GlobalData.GameInfoConfig.addCupNum,
				this.audioManager);
			GlobalData.GameRunTime.CupNodesDic[cupNode.uuid] = cupNode;
			if(GlobalData.GameInfoConfig.addCupNum == 1){
				cupCom.speed = GlobalData.CupConfig.CupMoveSpeed;
				cupCom.addSpeed = GlobalData.CupConfig.CupMoveASpeed/4;
			}else{
				cupCom.speed = GlobalData.CupConfig.CupMoveSpeed;
				cupCom.addSpeed = GlobalData.CupConfig.CupMoveSpeed;
			}
			GlobalData.GameRunTime.CupAbledNum += 1;
			cupCom.startMove(this.idxArray);
		}
		else if(data.type == 'CupRemove'){
			
		}
	},

});
