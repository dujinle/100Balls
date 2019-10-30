var BoxFactory = require('BoxFactory');
cc.Class({
    extends: cc.Component,

    properties: {
		level:0,
		isInCup:false,
		touchCupMusic:false,
		touchFloorMusic:false,
		userData:null,
    },
    onLoad () {
		console.log('rigidBall onLoad');
		if(this.rigidBody == null){
			this.userData = {name:this.node.uuid,type:GlobalData.RigidBodyTag.ball,node:this.node};
			this.rigidBody = BoxFactory.CreatBall(this.userData,this.node.getPosition());
		}
		this.onReset();
	},
	onReset(){
		this.touchCupMusic = false;
		this.touchFloorMusic = false;
		this.isInCup = false;
		this.setColor(this.level);
		if(this.rigidBody != null){
			this.rigidBody.SetActive(true);
		}
	},
	setColor(level){
		this.level = level;
		let color = GlobalData.BallConfig.BallColor[level];
		var colorMat = GlobalData.BallConfig.BallColorDic[color];
		this.node.color = new cc.Color(colorMat[0],colorMat[1],colorMat[2]);
	},
	//销毁节点及数据
	removeTrue(){
		if(GlobalData.GameRunTime.ContentBallsDic[this.node.uuid] != null){
			GlobalData.GameRunTime.ContentBallsDic[this.node.uuid]  = null;
		}
		if(this.rigidBody != null){
			BoxFactory.RemoveBody(this.rigidBody);
		}
		this.node.removeFromParent();
		this.node.destroy();
	},
	fallRemove(){
		var self = this;
		console.log('node fallRemove:',this.node.uuid);
		GlobalData.GameRunTime.BallNodesPool.put(this.node);
		if(GlobalData.GameRunTime.ContentBallsDic[this.node.uuid] != null){
			GlobalData.GameRunTime.ContentBallsDic[this.node.uuid]  = null;
		}
		if(this.rigidBody != null){
			//BoxFactory.RemoveBody(this.rigidBody);
			this.rigidBody.SetActive(false);
		}
		this.onReset();
	},
	update(dt){
		if(this.rigidBody != null){
			let xy = this.rigidBody.GetPosition();
			this.node.x = xy.x * BoxFactory._ptmRadio - cc.winSize.width/2;
			this.node.y = xy.y * BoxFactory._ptmRadio - cc.winSize.height/2;
		}
	}
});
