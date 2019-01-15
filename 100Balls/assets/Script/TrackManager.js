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
		this.speedArray = {};
		this.rigidCupPool = new cc.NodePool();
	},
	initTrack(audioManager){
		var cupSize = null;
		this.audioManager = audioManager;
		var trickSize = this.node.getContentSize();
		for(var i = 0;i < GlobalData.CupConfig.CupCreatNum;i++){
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
					this.idxArray.push(cc.p(xx,yy));
				}else{
					var yy = cupSize.height;
					var xx = trickSize.width/2;
					this.idxArray.push(cc.p(xx,yy));
				}
			}else{
				if(i == 0){
					var yy = (trickSize.height/2 - cupSize.height) * -1;
					var xx = -trickSize.width/2;
					this.idxArray.push(cc.p(xx,yy));
				}else{
					var yy = cupSize.height;
					var xx = -trickSize.width/2;
					this.idxArray.push(cc.p(xx,yy));
				}
			}
		}
		console.log('initTrack',this.rigidCupPool,this.idxArray);
	},
	startTrack(){
		this.curCupIdx = 0;
		var trickSize = this.node.getContentSize();
		if(this.rigidCupPool.size() > 0){
			var cupNode = this.rigidCupPool.get();
			var cupCom = cupNode.getComponent('cup');
			this.node.addChild(cupNode);
			cupCom.setPos(trickSize.width,trickSize.height,this.curCupIdx,this.audioManager);
			GlobalData.GameRunTime.CupNodesDic[cupNode.uuid] = cupNode;
			GlobalData.GameRunTime.CupAbledNum += 1;
			cupCom.speed = GlobalData.CupConfig.CupMoveSpeed;
			cupCom.addSpeed = GlobalData.CupConfig.CupMoveASpeed;
			cupCom.startMove();
			this.curCupIdx += 1;
			//this.schedule(this.updateMove,0.01);
			this.schedule(this.updateMoveV2,0.01);
			this.speedArray[cupNode.uuid] = cupCom.addSpeed;
		}
	},
	stopTrack(){
		for(var key in GlobalData.GameRunTime.CupNodesDic){
			var cupNode = GlobalData.GameRunTime.CupNodesDic[key];
			if(cupNode != null){
				var cupCom = cupNode.getComponent('cup');
				cupCom.stopMove();
			}
		}
		this.unschedule(this.updateMoveV2);
	},
	continueTrack(){
		//this.schedule(this.updateMove,0.01);
		for(var key in GlobalData.GameRunTime.CupNodesDic){
			var cupNode = GlobalData.GameRunTime.CupNodesDic[key];
			if(cupNode != null){
				var cupCom = cupNode.getComponent('cup');
				cupCom.resumeMove();
			}
		}
		this.schedule(this.updateMoveV2,0.01);
	},
	removeAllCups(){
		this.curCupIdx = 0;
		for(var key in GlobalData.GameRunTime.CupNodesDic){
			var cupNode = GlobalData.GameRunTime.CupNodesDic[key];
			if(cupNode != null){
				this.rigidCupPool.put(cupNode);
				var cupCom = cupNode.getComponent('cup');
				cupCom.resetStatus(true);
				delete this.speedArray[cupNode.uuid];
			}
		}
		console.log('stopTrack :',this.rigidCupPool.size());
	},
	addCup(node){
		var trickSize = this.node.getContentSize();
		var nodeCom = node.getComponent('cup');
		if(this.curCupIdx >= GlobalData.CupConfig.CupCreatNum){
			return;
		}
		if(nodeCom.myId == (this.curCupIdx - 1)){
			var pos = this.idxArray[nodeCom.myId];
			if(node.x == pos.x && node.y <= pos.y){
				var cupNode = this.rigidCupPool.get();
				var cupCom = cupNode.getComponent('cup');
				this.node.addChild(cupNode);
				cupCom.setPos(trickSize.width,trickSize.height,this.curCupIdx,this.audioManager);
				GlobalData.GameRunTime.CupNodesDic[cupNode.uuid] = cupNode;
				if(this.curCupIdx == 1){
					cupCom.speed = GlobalData.CupConfig.CupMoveSpeed;
					cupCom.addSpeed = GlobalData.CupConfig.CupMoveASpeed/4;
				}else{
					cupCom.speed = GlobalData.CupConfig.CupMoveSpeed;
					cupCom.addSpeed = GlobalData.CupConfig.CupMoveSpeed;
				}
				this.speedArray[cupNode.uuid] = cupCom.addSpeed;
				GlobalData.GameRunTime.CupAbledNum += 1;
				cupCom.startMove();
				this.curCupIdx += 1;
			}
		}
	},
	removeCup(uuid){
		var cupNode = GlobalData.GameRunTime.CupNodesDic[uuid];
		console.log('remove cup',cupNode.uuid,this.rigidCupPool.size());
		if(cupNode != null){
			this.rigidCupPool.put(cupNode);
			var cupCom = cupNode.getComponent('cup');
			cupCom.resetStatus(true);
			delete this.speedArray[cupNode.uuid];
		}
	},
	updateMoveV2(dt){
		for(var i = 0;i < this.node.children.length;i++){
			var cupNode = this.node.children[i];
			var cupCom = cupNode.getComponent('cup');
			//console.log('cupNode:',dt,cupNode.uuid,cupNode.getPosition());
			if(cupCom.isAbled == true){
				this.cupLinerVelUpdate(cupNode,dt);
				this.addCup(cupNode);
				cupCom.checkRotate();
				cupCom.checkFall();
			}
		}
	},
	updateMove (dt) {
		for(var i = 0;i < this.node.children.length;i++){
			var cupNode = this.node.children[i];
			var cupCom = cupNode.getComponent('cup');
			//console.log('cupNode:',dt,cupNode.uuid,cupNode.getPosition());
			if(cupCom.isAbled == true){
				this.cupMoveUpdate(cupNode,dt);
				this.addCup(cupNode);
				cupCom.checkRotate();
				cupCom.checkFall();
			}
		}
	},
	moveRightV2(node,dt){
		var nodeCom = node.getComponent('cup');
		if(node.x >= nodeCom.width/2 && nodeCom.moveDir == 1){
			node.setPosition(cc.p(nodeCom.width/2,nodeCom.height/2));
			node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-nodeCom.addSpeed);
			nodeCom.moveDir = 2;
		}
		if(nodeCom.moveDir == 2 && node.y <= -nodeCom.height/2){
			node.setPosition(cc.p(nodeCom.width/2,-nodeCom.height/2));
			node.getComponent(cc.RigidBody).linearVelocity = cc.p(-nodeCom.addSpeed,0);
			nodeCom.moveDir = 3;
		}
		if(nodeCom.moveDir == 3 && node.x <= -nodeCom.width/2){
			node.setPosition(cc.p(-nodeCom.width/2,-nodeCom.height/2));
			node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,nodeCom.addSpeed);
			nodeCom.moveDir = 4;
		}
		if(nodeCom.moveDir == 4 && node.y >= nodeCom.height/2){
			node.setPosition(cc.p(-nodeCom.width/2,nodeCom.height/2));
			node.getComponent(cc.RigidBody).linearVelocity = cc.p(nodeCom.addSpeed,0);
			nodeCom.moveDir = 1;
		}
	},
	moveLeftV2(node,dt){
		var nodeCom = node.getComponent('cup');
		if(node.x <= -nodeCom.width/2 && nodeCom.moveDir == 1){
			node.setPosition(cc.p(-nodeCom.width/2,nodeCom.height/2));
			node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-nodeCom.addSpeed);
			nodeCom.moveDir = 2;
		}
		if(nodeCom.moveDir == 2 && node.y <= -nodeCom.height/2){
			node.setPosition(cc.p(-nodeCom.width/2,-nodeCom.height/2));
			node.getComponent(cc.RigidBody).linearVelocity = cc.p(nodeCom.addSpeed,0);
			nodeCom.moveDir = 3;
		}
		if(nodeCom.moveDir == 3 && node.x >= nodeCom.width/2){
			node.setPosition(cc.p(nodeCom.width/2,-nodeCom.height/2));
			node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,nodeCom.addSpeed);
			nodeCom.moveDir = 4;
		}
		if(nodeCom.moveDir == 4 && node.y >= nodeCom.height/2){
			node.setPosition(cc.p(nodeCom.width/2,nodeCom.height/2));
			node.getComponent(cc.RigidBody).linearVelocity = cc.p(-nodeCom.addSpeed,0);
			nodeCom.moveDir = 1;
		}
	},
	moveRight(node,dt){
		node.getComponent(cc.RigidBody).syncPosition();
		var nodeCom = node.getComponent('cup');
		var moveDist = nodeCom.addSpeed * dt;
		if(nodeCom.moveDir == 1){
			var left = node.x + moveDist - nodeCom.width/2;
			if(left > 0){
				node.x = nodeCom.width/2;
				node.y -= left;
				nodeCom.moveDir = 2;
			}else{
				node.x += moveDist;
			}
		}
		if(nodeCom.moveDir == 2){
			var left = Math.abs(node.y - moveDist) - nodeCom.height/2;
			if(left > 0){
				node.y = -nodeCom.height/2;
				node.x -= left;
				nodeCom.moveDir = 3;
			}else{
				node.y -= moveDist;
			}
		}
		if(nodeCom.moveDir == 3){
			var left = Math.abs(node.x - moveDist) - nodeCom.width/2;
			if(left > 0){
				node.x = -nodeCom.width/2;
				node.y += left;
				nodeCom.moveDir = 4;
			}else{
				node.x -= moveDist;
			}
		}
		if(nodeCom.moveDir == 4){
			var left = Math.abs(node.y + moveDist) - nodeCom.height/2;
			if(left > 0){
				node.y = nodeCom.height/2;
				node.x += left;
				nodeCom.moveDir = 1;
			}else{
				node.y += moveDist;
			}
		}
		
	},
	moveLeft(node,dt){
		node.getComponent(cc.RigidBody).syncPosition();
		var nodeCom = node.getComponent('cup');
		var moveDist = nodeCom.addSpeed * dt;
		if(nodeCom.moveDir == 1){
			var left = Math.abs(node.x - moveDist) - nodeCom.width/2;
			if(left > 0){
				node.x = -nodeCom.width/2;
				node.y -= left;
				nodeCom.moveDir = 2;
			}else{
				node.x -= moveDist;
			}
		}
		if(nodeCom.moveDir == 2){
			var left = Math.abs(node.y - moveDist) - nodeCom.height/2;
			if(left > 0){
				node.y = -nodeCom.height/2;
				node.x += left;
				nodeCom.moveDir = 3;
			}else{
				node.y -= moveDist;
			}
		}
		if(nodeCom.moveDir == 3){
			var left = Math.abs(node.x + moveDist) - nodeCom.width/2;
			if(left > 0){
				node.x = nodeCom.width/2;
				node.y += left;
				nodeCom.moveDir = 4;
			}else{
				node.x += moveDist;
			}
		}
		if(nodeCom.moveDir == 4){
			var left = Math.abs(node.y + moveDist) - nodeCom.height/2;
			if(left > 0){
				node.y = nodeCom.height/2;
				node.x -= left;
				nodeCom.moveDir = 1;
			}else{
				node.y += moveDist;
			}
		}
		
	},
	cupLinerVelUpdate(node,dt){
		node.getComponent(cc.RigidBody).syncPosition();
		var nodeCom = node.getComponent('cup');
		if(GlobalData.CupConfig.CupMoveDir == 'right'){
			this.moveRightV2(node,dt);
			//第一个杯子特效
			var size = node.getContentSize();
			if(nodeCom.moveDir == 2 && node.y <= (size.height - nodeCom.height/2) && nodeCom.myId == 0){
				nodeCom.addSpeed = nodeCom.speed;
				this.speedArray[node.uuid] = nodeCom.addSpeed;
				//node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-nodeCom.addSpeed);
			}
			//如果是第二个杯子则提前控制减速
			if(nodeCom.moveDir == 2 && node.y <= 0 && nodeCom.myId == 1){
				nodeCom.addSpeed = nodeCom.speed;
				this.speedArray[node.uuid] = nodeCom.addSpeed;
				//node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-nodeCom.addSpeed);
			}
		}else{
			this.moveLeftV2(node,dt);
			//第一个杯子特效
			var size = node.getContentSize();
			if(this.moveDir == 2 && node.y <= (size.height - this.height/2) && this.myId == 0){
				this.addSpeed = this.speed;
				this.speedArray[node.uuid] = nodeCom.addSpeed;
				//node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-this.addSpeed);
			}
			//如果是第二个杯子则提前控制减速
			if(this.moveDir == 2 && node.y <= 0 && this.myId == 1){
				this.addSpeed = this.speed;
				this.speedArray[node.uuid] = nodeCom.addSpeed;
				//node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-this.addSpeed);
			}
			
		}
	},
	cupMoveUpdate(node,dt){
		node.getComponent(cc.RigidBody).syncPosition();
		var nodeCom = node.getComponent('cup');
		if(GlobalData.CupConfig.CupMoveDir == 'right'){
			this.moveRight(node,dt);
			//第一个杯子特效
			var size = node.getContentSize();
			if(nodeCom.moveDir == 2 && node.y <= (size.height - nodeCom.height/2) && nodeCom.myId == 0){
				nodeCom.addSpeed = nodeCom.speed;
				//node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-nodeCom.addSpeed);
			}
			//如果是第二个杯子则提前控制减速
			if(nodeCom.moveDir == 2 && node.y <= 0 && nodeCom.myId == 1){
				nodeCom.addSpeed = nodeCom.speed;
				//node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-nodeCom.addSpeed);
			}
		}else{
			this.moveLeft(node,dt);
			//第一个杯子特效
			var size = node.getContentSize();
			if(this.moveDir == 2 && node.y <= (size.height - this.height/2) && this.myId == 0){
				this.addSpeed = this.speed;
				//node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-this.addSpeed);
			}
			//如果是第二个杯子则提前控制减速
			if(this.moveDir == 2 && node.y <= 0 && this.myId == 1){
				this.addSpeed = this.speed;
				//node.getComponent(cc.RigidBody).linearVelocity = cc.p(0,-this.addSpeed);
			}
			
		}
	},
});
