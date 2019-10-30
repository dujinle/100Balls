var PropManager = require('PropManager');
cc.Class({
    extends: cc.Component,

    properties: {
		openNode:cc.Node,
		closeNode:cc.Node,
    },
    onLoad () {
		this.openNode.active = false;
		this.closeNode.active = true;
	},
	// 只在两个碰撞体开始接触时被调用一次
    onBeginContact: function (contact, selfCollider, otherCollider) {
		//碰到contentLine则说明小球下落了
		//console.log(selfCollider, otherCollider);
		//再开始的时候处理音效
		if(otherCollider.tag == GlobalData.RigidBodyTag.ball && selfCollider.tag == GlobalData.RigidBodyTag.floor){
			var ballCom = otherCollider.node.getComponent('RigidBall');
			if(ballCom.touchFloorMusic == false){
				GlobalData.game.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.BallTouchFloor);
				ballCom.touchFloorMusic = true;
				GlobalData.GameRunTime.BallAbledNum -= 1;
				GlobalData.GameRunTime.BallAppearNum -= 1;
				if(GlobalData.GameRunTime.BallAbledNum == GlobalData.cdnGameConfig.PropRelive){
					var openType = PropManager.getPropRelive();
					if(openType != null){
						GlobalData.game.mainGame.getComponent('MainGame').trickNode.getComponent('TrackManager').stopTrack();
						GlobalData.game.propGame.getComponent('PropGame').initLoad(openType,'PropRelive');
					}
				}else{
					GlobalData.game.mainGame.getComponent('MainGame').fallOneBall();
					GlobalData.game.mainGame.getComponent('MainGame').finishGame();
				}
				if(ballCom.fallLine == true){
					ballCom.fallRemove();
				}
			}
			return;
		}
		if(otherCollider.tag == GlobalData.RigidBodyTag.ball && selfCollider.tag == GlobalData.RigidBodyTag.contentLine){
			contact.disabled = true;
			var ballCom = otherCollider.node.getComponent('RigidBall');
			ballCom.fallLine = true;
			return;
		}
    },
	 // 每次处理完碰撞体接触逻辑时被调用
    onPostSolve: function (contact, selfCollider, otherCollider) {},
	openContent(){
		this.openNode.active = true;
		this.closeNode.active = false;
	},
	closeContent(){
		this.openNode.active = false;
		this.closeNode.active = true;
	}
});