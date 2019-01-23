var EventManager = require('EventManager');
cc.Class({
    extends: cc.Component,

    properties: {
		audioManager:null,
    },
    onLoad () {
	},
	initAudio(audioManager){
		this.audioManager = audioManager;
	},
    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact: function (contact, selfCollider, otherCollider) {
		//再开始的时候处理音效
		if(otherCollider.tag == GlobalData.RigidBodyTag.ball && selfCollider.tag == GlobalData.RigidBodyTag.floor){
			var ballCom = otherCollider.node.getComponent('RigidBall');
			if(ballCom.touchFloorMusic == false){
				this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.BallTouchFloor);
				ballCom.touchFloorMusic = true;
			}
			return;
		}
    },

    // 每次处理完碰撞体接触逻辑时被调用
    onPostSolve: function (contact, selfCollider, otherCollider) {
		var self = this;
		//球调入地板
		if(selfCollider.tag == GlobalData.RigidBodyTag.floor && otherCollider.tag == GlobalData.RigidBodyTag.ball){
			this.fallLine(otherCollider.node);
		}
    },
	fallLine(node){
		var ballCom = node.getComponent('RigidBall');
		if(ballCom.isAbled){
			ballCom.isAbled = false;
			EventManager.emit({
				type:'FallLine'
			});
			ballCom.fallRemove();
		}
	},
});
