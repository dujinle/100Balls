var EventManager = require('EventManager');
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
				cupNode = cc.instantiate(GlobalData.assets['ChainCup']);
			}
			this.node.addChild(cupNode);
			if(GlobalData.CupConfig.CupMoveDir == 'right'){
				cupNode.setPosition(cc.v2(169,362));
			}else{
				cupNode.setPosition(cc.v2(-169,362));
			}
			console.log(cupNode.getPosition());
			var cupCom = cupNode.getComponent('RigidCup');
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
	},
	removeAllCups(){
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
			var cupCom = cupNode.getComponent('RigidCup');
			cupCom.resetStatus(true);
			this.rigidCupPool.put(cupNode);
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
